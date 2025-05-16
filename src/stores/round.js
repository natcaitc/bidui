// src/stores/round } from 'vue'
import { defineStore } from 'pinia'
import { RoundRepository } from '@/api/index.js'
import { useAreaStore } from '@/stores/area'
import { logError } from '@/utils/logError.js'

export const useRoundStore = defineStore('round', () => {
  // Repositories
  const ROUND = new RoundRepository()
  const areaStore = useAreaStore();

  // State
  const rounds = ref([])
  const round = ref(null)
  const loading = ref(false)
  const bidders = ref([])
  const biddingWindows = ref([])

  /** Methods */
  function insertRound (round) {
    rounds.value.push(round)
  }
  function updateRound (round) {
    if (!round || !round.id) return

    const index = rounds.value.findIndex(r => r.id === round.id)
    console.log('[roundStore] - find update round index', index)
    if (index !== -1) {
      console.log('[roundStore] - update round index', round)
      rounds.value[index] = { ...rounds.value[index], ...round }
    }
    console.log('[roundStore] - done', round)
  }

  // Actions
  /**
   * Fetches a list of rounds for the given bid year and current area.
   *
   * @param {number|null} bidYear - The bid year for which the rounds are to be fetched.
   * @return {Promise<Array>} A promise that resolves to an array of rounds. Returns an empty array if an error occurs.
   */
  async function fetchRounds (bidYear= null) {
    // Try to fetch the rounds for the current areadw
    console.log('fetchRounds', areaStore.area?.slug, bidYear)
    try {
      loading.value = true
      /** @type {import('@/api').RoundContextData} RoundContextData */
      const contextData = {
        areaSlug: areaStore.area?.slug,
        roundId: null,
        bidYear,
      }
      const r = await ROUND.get(contextData)
      rounds.value = r.data || []

      return rounds.value
    } catch (e) {
      await logError(e, { tag: 'round.fetchRounds' })
      return []
    } finally {
      loading.value = false
    }
  }


  /**
   * Fetches and sets the current round based on the provided round ID.
   *
   * @param {string} roundId - The unique identifier for the round to fetch.
   * @return {Promise<Object|null>} The fetched round data or null if an error occurs or no round_AI ID is provided.
   */
  async function fetchRound (roundId) {
    if (!roundId) {
      return null
    }

    try {
      loading.value = true
      /** @type {import('@/types').Area} area */
      const area = areaStore.area

      const contextData = {
        areaSlug: area?.slug,
        id: roundId,
      }
      console.log('[roundStore] - find round id', contextData)
      const r = await ROUND.get(contextData)
      round.value = r.data

      return round.value
    } catch (e) {
      await logError(e, { tag: 'round.fetchRound' })
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateRoundField (id, field, value) {
    // try {
    //   console.log('Facility store: updating facility', facilityId, data);
    //
    //   const r = await ROUND.update(facilityId, data);
    //
    //   // Update the facility in the local state
    //   if (this.facility && this.facility.id === facilityId) {
    //     this.facility = {...this.facility, ...data};
    //     console.log('Facility store: facility updated in local state');
    //   } else {
    //     console.warn('Facility store: Could not update local state - facility not found or ID mismatch');
    //   }
    //
    //   return r.data;
    // } catch (e) {
    //   console.error('Failed to update facility:', e);
    //   throw e;
    // }

    const round = rounds.value.find(r => r.id === id)
    if (!round) {
      await logError('Round update attempted but round not found.', { tag: 'round_AI.updateRound' })
      return
    }

    // Store previous for rollback and update the store state
    const previous = round[field]
    round[field] = value // Update local state

    try {
      loading.value = true
      console.log('[RoundStore:updateRound] data', id, field, value)
      /** @type {import('@/api').RoundContextData} RoundContextData */
      const contextData = {
        roundId: id,
        data: { [field]:  value },
        areaSlug: areaStore.area?.slug,
      }
      const r = await ROUND.update(contextData)

      return r.data
    } catch (e) {
      round[field] = previous
      await logError(e, { tag: 'round.updateRound' })
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   */


  // async function fetchBidders (roundId) {
  //   if (!roundId) {
  //     return []
  //   }
  //
  //   try {
  //     loading.value = true
  //
  //     const response = await roundRepository.getBidders(roundId)
  //     bidders.value = response.data || []
  //
  //     return bidders.value
  //   } catch (err) {
  //     await logError(err, { tag: 'round.fetchBidders' })
  //     return []
  //   } finally {
  //     loading.value = false
  //   }
  // }


  // Getters
  const getRoundById = computed(() => id => {
    return rounds.value.find(round => round.id === id) || null
  })

  const getSortedBidders = computed(() => {
    return [...bidders.value].sort((a, b) => a.bid_order - b.bid_order)
  })

  const getBidderById = computed(() => id => {
    return bidders.value.find(bidder => bidder.id === id) || null
  })

  // Actions
  function reset () {
    rounds.value = []
    round.value = null
    loading.value = false
    bidders.value = []
    biddingWindows.value = []
  }

  return {
    // State
    rounds,
    round,
    loading,
    bidders,
    biddingWindows,

    // Getters
    getRoundById,
    getSortedBidders,
    getBidderById,

    // Methods
    insertRound,
    updateRound,

    // Actions
    fetchRounds,
    fetchRound,
    updateRoundField ,
    // saveRound,
    // deleteRound,
    // fetchBidders,
    // fetchBiddingWindows,
    reset,
  }

  // async function saveRound (roundData) {
  //   try {
  //     loading.value = true
  //
  //     let response
  //     if (roundData.id) {
  //       response = await roundRepository.updateRound(roundData.id, roundData)
  //     } else {
  //       response = await roundRepository.createRound(roundData)
  //     }
  //
  //     // Update local data
  //     if (response.data) {
  //       if (roundData.id) {
  //         // Update in rounds array
  //         const index = rounds.value.findIndex(r => r.id === roundData.id)
  //         if (index !== -1) {
  //           rounds.value[index] = response.data
  //         }
  //       } else {
  //         // Add to rounds array
  //         rounds.value.push(response.data)
  //       }
  //
  //       // Update current round if needed
  //       if (round.value && round.value.id === response.data.id) {
  //         round.value = response.data
  //       }
  //     }
  //
  //     return response.data
  //   } catch (err) {
  //     await logError(err, { tag: 'round.saveRound' })
  //     throw err
  //   } finally {
  //     loading.value = false
  //   }
  // }
  //
  // async function deleteRound (roundId) {
  //   if (!roundId) {
  //     return false
  //   }
  //
  //   try {
  //     loading.value = true
  //
  //     await roundRepository.deleteRound(roundId)
  //
  //     // Remove from local data
  //     rounds.value = rounds.value.filter(r => r.id !== roundId)
  //     if (round.value && round.value.id === roundId) {
  //       round.value = null
  //     }
  //
  //     return true
  //   } catch (err) {
  //     await logError(err, { tag: 'round.deleteRound' })
  //     return false
  //   } finally {
  //     loading.value = false
  //   }
  // }
  //
  //
  // async function updateRoundStatus (roundId, status) {
  //   if (!roundId) {
  //     return null
  //   }
  //
  //   try {
  //     loading.value = true
  //
  //     const response = await roundRepository.updateRoundStatus(roundId, status)
  //
  //     // Update local data
  //     if (response.data) {
  //       // Update in rounds array
  //       const index = rounds.value.findIndex(r => r.id === roundId)
  //       if (index !== -1) {
  //         rounds.value[index] = response.data
  //       }
  //
  //       // Update current round if needed
  //       if (round.value && round.value.id === roundId) {
  //         round.value = response.data
  //       }
  //     }
  //
  //     return response.data
  //   } catch (err) {
  //     await logError(err, { tag: 'round.updateRoundStatus' })
  //     throw err
  //   } finally {
  //     loading.value = false
  //   }
  // }
  //
  // async function fetchBiddingWindows (roundId) {
  //   if (!roundId) {
  //     return []
  //   }
  //
  //   try {
  //     loading.value = true
  //
  //     const response = await roundRepository.getBiddingWindows(roundId)
  //     biddingWindows.value = response.data || []
  //
  //     return biddingWindows.value
  //   } catch (err) {
  //     await logError(err, { tag: 'round.fetchBiddingWindows' })
  //     return []
  //   } finally {
  //     loading.value = false
  //   }
  // }


})
