import type { AppRouteModule } from '@/router/types'

import GreeHome from '@/pages/home/greeHome.vue'

const directives: AppRouteModule = {
  path: '/directives',
  name: 'Directives',
  // component: GreeHome,
  component: GreeHome,
  redirect: '/directives/lazy',
  meta: {
    title: 'my directives',
  },

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

    {
      path: 'myTest',
      name: 'MyTest',
      // tsx component will have problem
      component: () => import('@/pages/directives/MyTest.vue'),

      meta: {
        title: 'my Test',
        icon: '',
        hideMenu: true,
      },
    },
  ],
}

export default directives
