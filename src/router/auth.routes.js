import HomeLayout from '@/layouts/HomeLayout.vue';
import { useToastStore } from '@/stores/toasts';

export default [{
  path: '/denied',
  component: HomeLayout,
  children: [
    {
      path: '',
      name: 'auth.denied',
      component: () => import('@/views/PermissionDenied.vue'),
    },
  ],
},
{
  path: '/logout',
  name: 'auth.logout',
  beforeEnter: (to, from, next) => {
    const toastStore = useToastStore()
    toastStore.showMessage({
      title: 'Logged Out',
      message: 'You have been logged out successfully.',
      color: 'success',
    })

    next({ name: 'home' })
  },
},
{
  path: '/login',
  name: 'auth.login',
  beforeEnter: (to, from, next) => {
    const facilityId = to.query.facility || null
    if (facilityId)
      next({ name: 'facility.home', params: { facility: facilityId } })
    else
      next({ name: 'home' })
  },
}]
