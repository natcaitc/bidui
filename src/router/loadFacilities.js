import { useFacilityStore } from '@/stores/facility'

export async function loadFacilities () {
  const facilityStore = useFacilityStore()

  // Only reload if it's a new facility
  if (!facilityStore.facilities.length) {
    await facilityStore.fetchFacilities()
  }
}
