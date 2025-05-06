import { FacilityRepository } from '@/api/index.js';
import { useFacilityStore } from '@/stores/facility'
import { useAreaStore } from '@/stores/area'
import { useAuthStore } from '@/stores/auth.js';

const FACILITY = new FacilityRepository();

export async function loadFacilityContext (facilityId) {
  const facilityStore = useFacilityStore()

  // Only reload if it's a new facility
  if (!facilityStore.facility || facilityStore.facility.id !== facilityId) {
    await facilityStore.fetchFacility(facilityId)

    // Set the API base-url now that the facility is confirmed
    FACILITY.client.setBaseURL(facilityId);

    // Only load dependencies once facility is confirmed
    await Promise.all([
      useAreaStore().fetchAreas(),
      useAuthStore().getScope(facilityId),
    ])
  }
}
