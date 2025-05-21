/** @typedef {import('@/types/area').Area} Area */
import { defineStore } from 'pinia';
import { ref } from 'vue'
import { AreaRepository, CrewRepository } from '@/api/index.js';

export const useAreaStore = defineStore('area', () => {
  /** Setup */
  const AREA = new AreaRepository()
  const CREW = new CrewRepository()

  /** State */
  /** @type {import('vue').Ref<import('@/types').Area[]|[]>} */
  const areas = ref([])
  /** @type {import('vue').Ref<import('@/types').Area|null>} */
  const area = ref(null)
  /** @type {import('vue').Ref<import('@/types').Crew[]|[]>} */
  const _crews = ref([])

  /** Getters */
  const crews = computed(() => {
    return _crews.value;
  })

  /** Actions */
  const fetchAreas = async () => {
    try {
      const r = await AREA.get()
      areas.value = r.data
      return areas.value
    } catch (e) {
      console.error('Failed to retrieve areas:', e)
      throw e
    }
  }
  const fetchCrews = async () => {
    try {
      console.log('fetchCrews', area.value)
      const r = await CREW.get({ areaSlug: area.value.slug })
      _crews.value = r.data
      return _crews.value
    } catch (e) {
      console.error('Failed to retrieve areas:', e)
      throw e
    }
  }

  /** Methods */
  function updateArea (area) {
    // Find and update the area in the store
    const index = areas.value.findIndex(a => a.id === area.id)
    if (index !== -1) {
      areas.value[index] = area
    }
  }
  function insertArea (area) {
    areas.value.push(area)
  }
  // const createArea = async areaData => {
  //   try {
  //     // Create slug if not provided
  //     if (!areaData.slug) {
  //       areaData.slug = areaData.name.toLowerCase().replace(/\s+/g, '-')
  //     }
  //
  //     // Ensure numeric values are sent as integers
  //     areaData.use_bid_aid = parseInt(areaData.use_bid_aid || 0)
  //     areaData.subtract_holiday_leave = parseInt(areaData.subtract_holiday_leave || 0)
  //
  //     // Create area via API
  //     const r = await AREA.create({ data: areaData })
  //
  //     // Add the new area to the local state without triggering a refetch
  //     if (areas.value) {
  //       areas.value = [...areas.value, r.data]
  //     } else {
  //       areas.value = [r.data]
  //     }
  //
  //     return r.data
  //   } catch (e) {
  //     console.error('Failed to create area:', e)
  //     throw e
  //   }
  // }
  // const updateArea = async (areaId, data) => {
  //   try {
  //     const r = await AREA.update({ id: areaId, data })
  //
  //     // Update the area in the local state
  //     if (areas.value) {
  //       const index = areas.value.findIndex(a => a.id === areaId)
  //       if (index !== -1) {
  //         areas.value[index] = { ...areas.value[index], ...data }
  //       }
  //     }
  //
  //     // If this is the currently selected area, update it too
  //     if (area.value && area.value.id === areaId) {
  //       area.value = { ...area.value, ...data }
  //     }
  //
  //     return r.data
  //   } catch (e) {
  //     console.error('Failed to update area:', e)
  //     throw e
  //   }
  // }

  /** Methods */
  function setArea (slug) {
    const _area = areas.value.find(a => a.slug === slug)
    area.value = _area || null
  }

  return {
    // State
    areas,
    area,

    // Getters
    crews,

    // Actions
    fetchAreas,
    fetchCrews,

    // Methods
    setArea,
    insertArea,
    updateArea,
    // createArea,
    // updateArea,
  }
});

/** OLD FILE */
// getters: {
//   getArea: state => state.area,
//   getAreas: state => state.areas,
// },
//
// // Actions
// actions: {
//
//
//   async updateArea (areaId, data) {
//     try {
//       const AREA = new AreaRepository()
//       const response = await AREA.updateArea(areaId, data)
//
//       // Update the area in the local state
//       if (this.areas) {
//         const index = this.areas.findIndex(a => a.id === areaId)
//         if (index !== -1) {
//           this.areas[index] = { ...this.areas[index], ...data }
//         }
//       }
//
//       // If this is the currently selected area, update it too
//       if (this.area && this.area.id === areaId) {
//         this.area = { ...this.area, ...data }
//       }
//
//       return response.data
//     } catch (e) {
//       console.error('Failed to update area:', e)
//       throw e
//     }
//   },
//
//   async deleteArea (areaId) {
//     try {
//       const AREA = new AreaRepository()
//       const response = await AREA.deleteArea(areaId)
//
//       // Remove the area from local state without triggering a refetch
//       if (this.areas) {
//         this.areas = this.areas.filter(area => area.id !== areaId)
//       }
//
//       // If this is the currently selected area, clear it
//       if (this.area && this.area.id === areaId) {
//         this.area = null
//       }
//
//       return response.data
//     } catch (e) {
//       console.error('Failed to delete area:', e)
//       throw e
//     }
//   },
//
//   async createArea (areaData) {
//     try {
//       const AREA = new AreaRepository()
//
//       // Create slug if not provided
//       if (!areaData.slug) {
//         areaData.slug = areaData.name.toLowerCase().replace(/\s+/g, '-')
//       }
//
//       // Ensure numeric values are sent as integers
//       areaData.use_bid_aid = parseInt(areaData.use_bid_aid || 0)
//       areaData.subtract_holiday_leave = parseInt(areaData.subtract_holiday_leave || 0)
//
//       // Create area via API
//       const response = await AREA.createArea(areaData)
//
//       // Add the new area to the local state without triggering a refetch
//       if (this.areas) {
//         this.areas = [...this.areas, response.data]
//       } else {
//         this.areas = [response.data]
//       }
//
//       return response.data
//     } catch (e) {
//       console.error('Failed to create area:', e)
//       throw e
//     }
//   },
//
//   setAreas (areas) {
//     this.areas = areas
//   },
// },
