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


import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HelloWorld from '@/components/HelloWorld.vue'

import LogoCRUD from '@/components/LogoCRUD.vue'
import UploadLogo from '@/components/UploadLogo.vue'

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
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Facility Home',
        components: { default: HelloWorld },
      },
    ],
  },
  { path: '/logos',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'logos',
        component: LogoCRUD,
      },
      {
        path: 'upload',
        children: [
          {
            path: '',
            name: 'upload',
            component: UploadLogo,
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
