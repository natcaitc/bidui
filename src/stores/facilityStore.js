import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFacilityStore = defineStore('facility', () => {
  // State
  const facilities = ref([])
  const currentFacility = ref(null)
  const isLoading = ref(false)
  
  // Actions
  function setFacilities(facilityList) {
    facilities.value = facilityList
  }
  
  function setCurrentFacility(facility) {
    currentFacility.value = facility
  }
  
  function updateFacility(updatedFacility) {
    // Update in the facilities list
    const index = facilities.value.findIndex(f => f.id === updatedFacility.id)
    if (index !== -1) {
      facilities.value[index] = updatedFacility
    }
    
    // Update current facility if it's the one being edited
    if (currentFacility.value?.id === updatedFacility.id) {
      currentFacility.value = updatedFacility
    }
  }
  
  return { 
    facilities,
    currentFacility,
    isLoading,
    setFacilities,
    setCurrentFacility,
    updateFacility
  }
})
