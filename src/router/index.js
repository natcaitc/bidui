/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import HomeLayout from '@/layouts/HomeLayout.vue';
import Home from '@/views/Home.vue';
import FacilityHome from '@/views/FacilityHome.vue';
import { loadFacilityContext } from '@/router/loadFacilityContext.js';
import { loadFacilities } from '@/router/loadFacilities.js';

// import { setupLayouts } from 'virtual:generated-layouts'
// import { routes } from 'vue-router/auto-routes'


// Create routes
const routes = [
  {
    path: '/',
    component: HomeLayout,
    beforeEnter: async (to, from, next) => {
      try {
        await loadFacilities();
        next();
      } catch (e) {
        next({ name: 'home' });
        console.log(e)
      }
    },
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
      },
    ],
  },
  {
    path: '/:facility',
    component: () => import('@/layouts/AdminLayout.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        await loadFacilityContext(to.params.facility);
        next();
      } catch (e) {
        next({ name: 'home' });
        console.log(e)
      }
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
    },
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
      },
    ],
  },
  { path: '/logos',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'logos',
        component: () => import('@/components/LogoCRUD.vue'),
      },
      {
        path: 'upload',
        children: [
          {
            path: '',
            name: 'upload',
            component: () => import('@/components/UploadLogo.vue'),
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
