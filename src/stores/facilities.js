import { defineStore } from 'pinia';

export const useFacilitiesStore = defineStore('facilities', {
  // State
  state: () => ({
    facilityId: 'dab',
  }),

  // Getters
  getters: {
    getFacilityId: state => state.facilityId,
  },

  // Actions
  actions: {
    setFacilityId (newId) {
      this.facilityId = newId;
    },
    clearFacilityId () {
      this.facilityId = null;
    },
  },
});
