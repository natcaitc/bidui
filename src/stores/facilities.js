import { defineStore } from 'pinia';

export const facilities = defineStore('facilities', {
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
