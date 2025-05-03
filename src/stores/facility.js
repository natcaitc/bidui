import { defineStore } from 'pinia';
import { FacilityRepository } from '@/api/index.js';

const FACILITY = new FacilityRepository()

export const useFacilityStore = defineStore('facility', {
  // State
  state: () => ({
    facilities: null,
    facility: null,
  }),

  // Getters
  getters: {
    getId: state => state.facility.id,
  },

  // Actions
  actions: {
    async fetchFacility (id) {
      try {
        const response = await FACILITY.get(id)
        this.facility = response.data
        // FACILITY.client.setBaseURL('dab'); // Set the baseURL for the app now that we know a facility
      } catch (error) {
        console.error('Failed to load facility:', error)
        throw error
      }
    },
    async updateFacility (facilityId, data) {
      try {
        console.log('Facility store: updating facility', facilityId, data);

        const r = await FACILITY.update(facilityId, data);

        // Update the facility in the local state
        if (this.facility && this.facility.id === facilityId) {
          this.facility = { ...this.facility, ...data };
          console.log('Facility store: facility updated in local state');
        } else {
          console.warn('Facility store: Could not update local state - facility not found or ID mismatch');
        }

        return r.data;
      } catch (e) {
        console.error('Failed to update facility:', e);
        throw e;
      }
    },
    async fetchFacilities () {
      try {
        const FACILITY = new FacilityRepository()
        const response = await FACILITY.get()
        this.facilities = response.data
      } catch (error) {
        console.error('Failed to fetch all facilities:', error)
        throw error
      }
    },
    setId (newId) {
      this.id = newId;
    },
    clearId () {
      this.id = null;
    },
    validateFacilityId (id) {
      if (!this.facilities || !Array.isArray(this.facilities)) return false;
      return this.facilities.some(f => f.id === id);
    },
  },
});
