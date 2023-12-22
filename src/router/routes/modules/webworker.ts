import GreeHome from '@/pages/home/greeHome.vue'

const workers = [
  {
    path: '/workers',
    name: 'Workers',
    component: GreeHome,
    redirect: '/workers/webworker',
    meta: {},
    children: [
      {
        path: 'webworker',
        name: 'WebWorker',
        // tsx component will have problem
        component: () => import('@/pages/workers/webworker/Index.vue'),

        meta: {
          title: 'webworker',
          icon: '',
          hideMenu: true,
        },
      },
    ],
  },
]

export default workers
