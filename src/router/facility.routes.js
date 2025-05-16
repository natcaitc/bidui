import FacilityHome from '@/views/FacilityHome.vue';

export default [
  {
    path: '/:facility',
    component: () => import('@/layouts/AdminLayout.vue'),
    // beforeEnter: async (to, from, next) => {
    //   try {
    //     await loadFacilityContext(to.params.facility);
    //     next();
    //   } catch (e) {
    //     next({ name: 'home' });
    //     console.log(e)
    //   }
    // try {
    //   // Get the facility ID from the route parameter
    //   const facilityId = to.params.facility;
    //   const facilityStore = useFacilityStore();
    //
    //   // Check if we already have this facility loaded
    //   if (!facilityStore.facility || facilityStore.facility.id !== facilityId) {
    //     // Load the facility data
    //     await facilityStore.loadFacility(facilityId);
    //   }
    //
    //   // Continue to the route
    //   next();
    // } catch (error) {
    //   console.error('Failed to load facility data:', error);
    //
    //   // Redirect to home page or error page if loading fails
    //   next({ name: 'home' });
    // }
    // },
    children: [
      {
        path: '',
        name: 'facility.home',
        components: { default: FacilityHome },
      },
      {
        path: 'config',
        name: 'facility.config',
        components: { default: () => import('@/views/FacilityConfigure.vue') },
        meta: { permission: 'facility:configure:view' },
      },
    ],
  },
]
