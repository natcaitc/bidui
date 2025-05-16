import { FacilityRepository } from '@/api/index.js';
import { useFacilityStore } from '@/stores/facility'
import { useAreaStore } from '@/stores/area'
import { useAuthStore } from '@/stores/auth.js';

const FACILITY = new FacilityRepository();

/**
 * @param {{ beforeEach: (arg0: (to: any, from: any, next: any) => Promise<void>) => void; }} router
 */
export function loadFacilityContext (router) {
  router.beforeEach(async (to, from, next) => {
    if (!to.params.facility)
      return next()

    console.log('[loadFacilityContext] Loading facility context for:', to.params.facility)

    const facilityStore = useFacilityStore()

    // Only reload if it's a new facility
    if (!facilityStore.facility || facilityStore.facility.id !== to.params.facility) {
      await facilityStore.fetchFacility(to.params.facility)

      // Set the API base-url now that the facility is confirmed
      FACILITY.client.setBaseURL(to.params.facility);

      // Only load dependencies once facility is confirmed
      await Promise.all([
        useAreaStore().fetchAreas(),
        useFacilityStore().fetchEmployeeTypes(),
        useAuthStore().getScope(to.params.facility),
      ])
    }
    next()
  })
}
