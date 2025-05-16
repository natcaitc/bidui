// src/stores/leave.js
import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { LeaveRepository, LeaveTypeRepository } from '@/api/index.js'
import { useFacilityStore } from '@/stores/facility'
import { logError } from '@/utils/logError.js'

export const useLeaveStore = defineStore('leave', () => {
  // Repositories
  const leaveRepository = new LeaveRepository()
  const leaveTypeRepository = new LeaveTypeRepository()

  // Other stores
  const facilityStore = useFacilityStore()

  // State
  const loading = ref(false)
  const error = ref(null)
  const leaveTypes = ref([])
  const memberLeave = ref([])
  const selectedLeave = ref([])
  const pendingLeave = ref([])
  const bidder = ref(null)
  const roundId = ref(null)

  // Computed
  const hasLeave = computed(() =>
    memberLeave.value && memberLeave.value.length > 0
  )

  const hasPendingLeave = computed(() =>
    pendingLeave.value && pendingLeave.value.length > 0
  )

  const getLeaveTypeById = computed(() => id =>
    leaveTypes.value.find(type => type.id === id)
  )

  const groupedLeaveTypes = computed(() => {
    const grouped = {}

    leaveTypes.value.forEach(type => {
      const category = type.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(type)
    })

    return grouped
  })

  const isLeaveSelected = computed(() => leaveId =>
    selectedLeave.value.some(leave => leave.id === leaveId)
  )

  // Actions
  async function init (bidderData, currentRoundId = null) {
    try {
      // Store current bidder and round
      bidder.value = bidderData
      if (currentRoundId) {
        roundId.value = currentRoundId
      }

      // Clear existing data
      reset()

      // Load leave types if needed
      if (leaveTypes.value.length === 0) {
        await fetchLeaveTypes()
      }

      return true
    } catch (err) {
      await logError(err, { tag: 'leave.init' })
      error.value = err.message || 'Failed to initialize leave store'
      throw err
    }
  }

  async function fetchLeaveTypes () {
    try {
      loading.value = true
      error.value = null

      const response = await leaveTypeRepository.getList()
      leaveTypes.value = response.data

      return leaveTypes.value
    } catch (err) {
      await logError(err, { tag: 'leave.fetchLeaveTypes' })
      error.value = err.message || 'Failed to fetch leave types'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMemberLeave (memberId, year = null) {
    if (!memberId) {
      error.value = 'No member ID provided'
      return null
    }

    try {
      loading.value = true
      error.value = null

      // Use provided year or get from facility store
      const bidYear = year || facilityStore.bidYear

      const response = await leaveRepository.getMemberLeave(memberId, bidYear)
      memberLeave.value = response.data || []

      return memberLeave.value
    } catch (err) {
      await logError(err, { tag: 'leave.fetchMemberLeave' })
      error.value = err.message || 'Failed to fetch member leave'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingLeave (memberId, year = null) {
    if (!memberId) {
      error.value = 'No member ID provided'
      return null
    }

    try {
      loading.value = true
      error.value = null

      // Use provided year or get from facility store
      const bidYear = year || facilityStore.bidYear

      const response = await leaveRepository.getPendingLeave(memberId, bidYear)
      pendingLeave.value = response.data || []

      return pendingLeave.value
    } catch (err) {
      await logError(err, { tag: 'leave.fetchPendingLeave' })
      error.value = err.message || 'Failed to fetch pending leave'
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectLeave (leave) {
    // Toggle selection if already selected
    const index = selectedLeave.value.findIndex(l => l.id === leave.id)

    if (index === -1) {
      // Add to selection
      selectedLeave.value.push(leave)
    } else {
      // Remove from selection
      selectedLeave.value.splice(index, 1)
    }
  }

  async function submitLeave () {
    if (!bidder.value || !bidder.value.id) {
      error.value = 'No active bidder'
      return null
    }

    if (selectedLeave.value.length === 0) {
      error.value = 'No leave selected'
      return null
    }

    try {
      loading.value = true
      error.value = null

      const leaveIds = selectedLeave.value.map(leave => leave.id)

      const payload = {
        bidder_id: bidder.value.id,
        round_id: roundId.value,
        leave_ids: leaveIds,
      }

      const response = await leaveRepository.submitBidderLeave(payload)

      // Refresh data after submission
      if (bidder.value.member_id) {
        await fetchMemberLeave(bidder.value.member_id)
      }


      return response.data
    } catch (err) {
      await logError(err, { tag: 'leave.submitLeave' })
      error.value = err.message || 'Failed to submit leave selections'
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset () {
    selectedLeave.value = []
    memberLeave.value = []
    pendingLeave.value = []
    error.value = null
  }

  // Add watcher to automatically load leave when bidder changes
  watch(bidder, async newBidder => {
    if (newBidder && newBidder.member_id) {
      try {
        await fetchMemberLeave(newBidder.member_id)
      } catch (err) {
        // Error already logged in fetchMemberLeave
      }
    }
  })

  return {
    // State
    loading,
    error,
    leaveTypes,
    memberLeave,
    pendingLeave,
    selectedLeave,
    bidder,
    roundId,

    // Computed
    hasLeave,
    hasPendingLeave,
    getLeaveTypeById,
    groupedLeaveTypes,
    isLeaveSelected,

    // Actions
    init,
    fetchLeaveTypes,
    fetchMemberLeave,
    fetchPendingLeave,
    selectLeave,
    submitLeave,
    reset,
  }
})
