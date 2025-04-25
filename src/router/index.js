/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
// import { setupLayouts } from 'virtual:generated-layouts'
// import { routes } from 'vue-router/auto-routes'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import TEST from '@/components/TEST.vue'
import UploadLogo from '@/components/UploadLogo.vue'

// Create routes
const routes = [
  { path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HelloWorld,
      },
    ],
  },
  { path: '/test',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'test',
        component: TEST,
      },
    ],
  },
  {
    path: '/upload',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'upload',
        component: UploadLogo,
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
