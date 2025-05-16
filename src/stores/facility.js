/** @typedef {import('@/types').Facility} Facility */
import { defineStore } from 'pinia';
import { FacilityRepository } from '@/api/index.js';
import { ref } from 'vue';
import { logError } from '@/utils/logError.js';

export const useFacilityStore = defineStore('facility', () => {
  // State
  const FACILITY = new FacilityRepository()
  /** @type {import('vue').Ref<import('@/types').Facility[]|[]>} */
  const facilities = ref([])
  /** @type {import('vue').Ref<import('@/types').Facility|null>} */
  const facility = ref(null)
  const employeeTypes = ref([])

  // Actions
  const fetchFacilities = async () => {
    FACILITY.client.setBaseURL(null);
    try {
      const r = await FACILITY.get()
      facilities.value = r.data
    } catch (e) {
      console.error('Failed to fetch all facilities:', e)
      throw e
    }
  }

  const fetchFacility = async id => {
    try {
      const r = await FACILITY.get(id)
      facility.value = r.data
    } catch (e) {
      console.error('Failed to load facility:', e)
      throw e
    }
  }

  const updateFacility = async (id, data) => {
    try {
      console.log('Facility store: updating facility', id, data);

      const r = await FACILITY.update(id, data);

      // Update the facility in the local state
      if (facility.value && facility.value.id === id) {
        facility.value = { ...facility.value, ...data };
        console.log('Facility store: facility updated in local state');
      } else {
        console.warn('Facility store: Could not update local state - facility not found or ID mismatch');
      }

      return r.data;
    } catch (e) {
      console.error('Failed to update facility:', e);
      throw e;
    }
  }

  const fetchEmployeeTypes = async () => {
    try {
      const r = await FACILITY.getEmployeeTypes()
      employeeTypes.value = r.data
    } catch (e) {
      await logError(e, { tag: 'facility.fetchEmployeeTypes' })
      throw e
    }
  }

  // Methods
  function validateFacilityId (id) {
    if (!facilities.value.length || !Array.isArray(facilities.value)) return false;
    return facilities.value.some(f => f.id === id);
  }

  return {
    // State
    facilities,
    facility,
    employeeTypes,

    // Actions
    fetchFacilities,
    fetchFacility,
    updateFacility,
    fetchEmployeeTypes,

    // Methods
    validateFacilityId,
  }
});
/** OLD FILE */
// State
// state: () => ({
//   facilities: null,
//   facility: null,
// }),
//
// // Getters
// getters: {
//   getId: state => state.facility.id,
// },
//
// // Actions
// actions: {
//   async fetchFacility (id) {
//     try {
//       const response = await FACILITY.get(id)
//       this.facility = response.data
//       // FACILITY.client.setBaseURL('dab'); // Set the baseURL for the app now that we know a facility
//     } catch (error) {
//       console.error('Failed to load facility:', error)
//       throw error
//     }
//   },
//   async updateFacility (facilityId, data) {
//     try {
//       console.log('Facility store: updating facility', facilityId, data);
//
//       const r = await FACILITY.update(facilityId, data);
//
//       // Update the facility in the local state
//       if (this.facility && this.facility.id === facilityId) {
//         this.facility = { ...this.facility, ...data };
//         console.log('Facility store: facility updated in local state');
//       } else {
//         console.warn('Facility store: Could not update local state - facility not found or ID mismatch');
//       }
//
//       return r.data;
//     } catch (e) {
//       console.error('Failed to update facility:', e);
//       throw e;
//     }
//   },
//   async fetchFacilities () {
//     try {
//       const FACILITY = new FacilityRepository()
//       const response = await FACILITY.get()
//       this.facilities = response.data
//     } catch (error) {
//       console.error('Failed to fetch all facilities:', error)
//       throw error
//     }
//   },
//   setId (newId) {
//     this.id = newId;
//   },
//   clearId () {
//     this.id = null;
//   },
//   validateFacilityId (id) {
//     if (!this.facilities || !Array.isArray(this.facilities)) return false;
//     return this.facilities.some(f => f.id === id);
//   },
// },
