import { defineStore } from 'pinia';
import { FacilityRepository } from '@/api/index.js';

export const useFacilitiesStore = defineStore('facilities', {
  // State
  state: () => ({
    facility: null,
  }),

  // Getters
  getters: {
    getId: state => state.facility.id,
  },

  // Actions
  actions: {
    async loadFacility (id) {
      try {
        const FACILITY = new FacilityRepository()
        const response = await FACILITY.get(id)
        this.facility = response.data
        // FACILITY.client.setBaseURL('dab'); // Set the baseURL for the app now that we know a facility
      } catch (error) {
        console.error('Failed to load facility:', error)
        throw error
      }
    },
    setId (newId) {
      this.id = newId;
    },
    clearId () {
      this.id = null;
    },
  },
});
