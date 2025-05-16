import { useRoundStore } from '@/stores/round.js';

export default [
  {
    path: 'rounds',
    name: 'rounds.home',
    component: () => import('@/views/round/RoundListView.vue'),
  },
  {
    path: 'rounds/:roundId',
    name: 'rounds.view',
    components: { default: () => import('@/views/round/RoundView.vue') },
    meta: { permission: 'round:admin' },
    beforeEnter: async (to, from, next) => {
      const roundStore = useRoundStore();
      console.log(to.params)
      try {
        console.log('load')
        await roundStore.fetchRound(to.params.roundId);
        console.log('loaded')
        next();
      } catch (e) {
        next({ name: 'facility.home', params: { facility: to.params.facility } });
        console.log(e)
      }
    },
  },
  // {
  //   path: 'rounds/:roundId/edit',
  //   name: 'round_AI.edit',
  //   component: () => import('@/views/round_AI/RoundEdit.vue'),
  //   meta: {permission: 'round:view'},
  // },
  // {
  //   path: 'rounds/:roundId/roster',
  //   name: 'round_AI.roster',
  //   component: () => import('@/views/round_AI/BidRoster.vue'),
  //   meta: {permission: 'round:view'},
  // },
  // {
  //   path: 'rounds/:roundId/config',
  //   name: 'facility.round_AI.config',
  //   component: () => import('@/views/round_AI/BidWindowConfig.vue'),
  //   meta: {permission: 'round:view'},
  // },
]
