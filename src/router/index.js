/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'

import HomeLayout from '@/layouts/HomeLayout.vue';
import Home from '@/views/Home.vue';

// import { setupLayouts } from 'virtual:generated-layouts'
// import { routes } from 'vue-router/auto-routes'


import FacilityHome from '@/views/FacilityHome.vue';

// Create routes
const routes = [
  { path: '/',
    component: HomeLayout,
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
    children: [
      {
        path: '',
        name: 'facility.home',
        components: { default: FacilityHome },
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
