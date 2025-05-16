// src/stores/bidder.js
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { BidderRepository, BidRepository, MemberRepository } from '@/api/index.js'
import { useAuthStore } from '@/stores/auth'
import { useFacilityStore } from '@/stores/facility'
import { useCountdownStore } from '@/stores/countdown'
import { useLeaveStore } from '@/stores/leave'
import { useRoundStore } from '@/stores/round'
import { format, parseISO } from 'date-fns'

// Initialize the bid object
const initBid = () => {
  return {
    bidder_id: null,
    user_id: null,
    lines: [],
    line_complete: false,
    leave: [],
    leave_complete: false,
    skip: false,
    skip_type: null,
  }
}

export const useBidderStore = defineStore('bidder', () => {
  // Repositories
  const bidderRepository = new BidderRepository()
  const bidRepository = new BidRepository()
  const memberRepository = new MemberRepository()

  // Related stores
  const authStore = useAuthStore()
  const facilityStore = useFacilityStore()
  const countdownStore = useCountdownStore()
  const leaveStore = useLeaveStore()
  const roundStore = useRoundStore()

  // State
  const bidders = ref([])
  const memberBidders = ref([])
  const bid = ref(initBid())
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const activeBidder = computed(() =>
    bidders.value.find(bidder => bidder.active === 1)
  )

  const bidMode = computed(() =>
    activeBidder.value &&
    authStore.user &&
    activeBidder.value.active_by === authStore.user.member_id
  )

  const bidReady = computed(() =>
    bid.value.line_complete || bid.value.leave_complete
  )

  const getRoundBidders = computed(() => roundId => {
    const roundBidders = bidders.value.filter(b => b.round_id === roundId)
    return groupByRosterTeam(roundBidders)
  })

  const getMemberBidders = computed(() => memberId =>
    bidders.value.filter(b => b.member_id === memberId)
  )

  const getLinesBid = computed(() =>
    Object.fromEntries(bid.value.lines.map(line => [line.line_group_id, line]))
  )

  const getLeaveBid = computed(() => bid.value.leave)

  // Helper functions
  function groupByRosterTeam (bidderList) {
    const result = {}
    bidderList.forEach(bidder => {
      if (!result[bidder.roster_team_id]) {
        result[bidder.roster_team_id] = []
      }
      result[bidder.roster_team_id].push(bidder)
    })
    return result
  }

  // Actions
  async function submitBid (useBidder = null) {
    const bidder = useBidder || activeBidder.value
    if (!bidder) {
      error.value = 'No active bidder'
      return null
    }

    try {
      loading.value = true

      // Prepare the bid payload
      const payload = { ...bid.value }
      payload.bidder_id = bidder.id

      const response = await bidRepository.create(payload)

      // Reset the bid
      resetBid()

      // Update the rounds
      await roundStore.fetchRounds()

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to submit bid'
      throw err
    } finally {
      loading.value = false

      // End the active bidder status
      await endActiveBidder(bidder)
    }
  }

  async function fetchBidders () {
    try {
      loading.value = true
      error.value = null

      const bidYear = facilityStore.bidYear
      const response = await bidderRepository.get(bidYear)

      // Add schedule property to each bidder
      response.data.forEach(bidder => {
        bidder.schedule = {}
      })

      bidders.value = response.data

      // Handle active bidder if exists
      if (activeBidder.value) {
        // Check if the user is the bidder or bidding on behalf
        if (authStore.user && activeBidder.value.active_by === authStore.user.member_id) {
          // Set up for bidding
          await startActiveBidder(activeBidder.value)
        } else {
          // Just start the timer for display
          await startBidderTimer(activeBidder.value)
        }
      }

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch bidders'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveBidderSchedule () {
    try {
      if (!activeBidder.value) {
        error.value = 'No active bidder'
        return null
      }

      loading.value = true
      error.value = null

      const response = await memberRepository.getMemberSchedule(activeBidder.value.member_id)

      // Update the schedule for the active bidder
      const index = bidders.value.findIndex(b => b.id === activeBidder.value.id)
      if (index !== -1) {
        bidders.value[index].schedule = response.data
      }

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch bidder schedule'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setActiveBidder (bidder) {
    // Check if the bidder is already active
    if (!bidder.active) {
      try {
        loading.value = true

        const payload = {
          bidder_id: bidder.id,
          changes: {
            active: 1,
            active_by: authStore.user.member_id,
            active_at: new Date().toISOString(),
          },
        }

        const response = await updateBidder(payload)
        return response
      } catch (err) {
        error.value = 'Unable to lock the area, already locked.'
        throw new Error('Unable to lock the area, already locked.')
      } finally {
        loading.value = false
      }
    }

    return bidder
  }

  async function startActiveBidder (bidder) {
    // See if there is already an active bidder
    if (activeBidder.value && activeBidder.value.id !== bidder.id) {
      throw new Error('Unable to lock the area, already locked by ' + activeBidder.value.full_name)
    }

    try {
      // Set the active bidder
      const updatedBidder = await setActiveBidder(bidder)

      // Set up dependencies
      await Promise.all([
        leaveStore.init(bidder),
        leaveStore.fetchMemberLeave(bidder.member_id),
        fetchActiveBidderSchedule(),
      ])

      return updatedBidder
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function startBidderTimer (bidder) {
    try {
      // Start the timer
      const payload = {
        start: parseISO(bidder.active_at),
        duration: facilityStore.facility.bid_lock_time,
      }

      await countdownStore.start(payload)
    } catch (message) {
      // Unable to start timer
    } finally {
      // Reset leave bidding
      leaveStore.reset()

      // Disable active status for the bidder
      await endActiveBidder(bidder)
    }
  }

  async function endActiveBidder (bidder) {
    try {
      const payload = {
        bidder_id: bidder.id,
        changes: {
          active: 0,
          active_by: null,
          active_at: null,
        },
      }

      // Stop the countdown and update the bidder
      await Promise.all([
        countdownStore.stop(),
        updateBidder(payload),
      ])

      return true
    } catch (err) {
      error.value = err.message || 'Failed to end active bidder'
      throw err
    }
  }

  async function updateBidder (payload) {
    try {
      loading.value = true
      error.value = null

      const response = await bidderRepository.update(payload.bidder_id, payload.changes)

      // Update the bidder in the local state
      const index = bidders.value.findIndex(b => b.id === payload.bidder_id)
      if (index !== -1) {
        bidders.value[index] = { ...bidders.value[index], ...payload.changes }
      }

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to update bidder'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshMemberBidders (memberId) {
    try {
      loading.value = true
      error.value = null

      const bidYear = facilityStore.bidYear
      const response = await bidderRepository.getMemberBidders(bidYear, memberId)

      // Update each bidder in the state
      response.data.forEach(updatedBidder => {
        const index = bidders.value.findIndex(b => b.id === updatedBidder.id)
        if (index !== -1) {
          bidders.value[index] = { ...bidders.value[index], ...updatedBidder }
        }
      })

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to refresh member bidders'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Mutations (now functions)
  function resetBid () {
    bid.value = initBid()
  }

  function toggleLine (line) {
    const index = bid.value.lines.findIndex(l => l.id === line.id)
    if (index === -1) {
      bid.value.lines.push(line)
    } else {
      bid.value.lines.splice(index, 1)
    }
  }

  function setLeave (leave) {
    bid.value.leave = leave
    bid.value.leave_complete = true
  }

  function skipBid (type) {
    bid.value.skip = true
    bid.value.skip_type = type
  }

  function setBidModuleComplete (payload) {
    bid.value[payload.module + '_complete'] = payload.status
  }

  function reset () {
    bidders.value = []
    memberBidders.value = []
    bid.value = initBid()
    loading.value = false
    error.value = null
  }

  return {
    // State
    bidders,
    memberBidders,
    bid,
    loading,
    error,

    // Getters
    activeBidder,
    bidMode,
    bidReady,
    getRoundBidders,
    getMemberBidders,
    getLinesBid,
    getLeaveBid,

    // Actions
    submitBid,
    fetchBidders,
    fetchActiveBidderSchedule,
    setActiveBidder,
    startActiveBidder,
    startBidderTimer,
    endActiveBidder,
    updateBidder,
    refreshMemberBidders,

    // Mutations
    resetBid,
    toggleLine,
    setLeave,
    skipBid,
    setBidModuleComplete,
    reset,
  }
})
