// router/index.js


// Composables
import { createRouter, createWebHistory } from 'vue-router'
import HomeLayout from '@/layouts/HomeLayout.vue';
import Home from '@/views/Home.vue';
import { loadFacilities } from '@/router/loadFacilities.js';
import { setupAuthGuard } from '@/router/authGuard.js';
import { loadFacilityContext } from '@/router/loadFacilityContext.js';
import { loadAreaContext } from '@/router/loadAreaContext.js';

// Import routes
import authRoutes from '@/router/auth.routes.js';
import facilityRoutes from '@/router/facility.routes.js';
import roundRoutes from '@/router/round.routes.js';

// Create routes
const routes = [
  ...authRoutes,
  ...facilityRoutes,
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

  {
    path: '/:facility/:area',
    component: () => import('@/layouts/AdminLayout.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        await loadAreaContext(to.params.area)
        next();
      } catch (e) {
        next({ name: 'home' });
        console.log(e)
      }
    },
    children: [
      {
        path: '',
        name: 'area.home',
        component: () => import('@/views/AreaHome.vue'),
      },
      {
        path: 'rosters',
        name: 'rosters.home',
        component: () => import('@/views/roster/RosterView.vue'),
      },
      {
        path: 'lines',
        name: 'lines.home',
        component: () => import('@/views/line/LineView.vue'),
      },
      ...roundRoutes,
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

loadFacilityContext(router);
setupAuthGuard(router)

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
