// import type { AppRouteModule } from '@/router/types'
import GreeHome from '@/pages/home/greeHome.vue'

const directives = {
  path: '/directives',
  name: 'Directives',
  // component: GreeHome,
  component: GreeHome,
  redirect: '/directives/lazy',
  meta: {},
  children: [
    {
      path: 'lazy',
      name: 'Lazy',
      // tsx component will have problem
      component: () => import('@/pages/directives/MyLazy'),

      meta: {
        title: 'my lazy',
        icon: '',
        hideMenu: true,
      },
    },
    {
      path: 'auth',
      name: 'Auth',
      // tsx component will have problem
      component: () => import('@/pages/directives/MyAuth.vue'),

      meta: {
        title: 'my Auth',
        icon: '',
        hideMenu: true,
      },
    },
  ],
}

export default directives
