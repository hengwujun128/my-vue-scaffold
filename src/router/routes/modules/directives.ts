// import type { AppRouteModule } from '@/router/types'

const test = {
  path: '/directives',
  name: 'Directives',
  component: '',
  redirect: '/directives/lazy',
  meta: {},
  children: [
    {
      path: 'lazy',
      name: 'Lazy',
      component: () => import('@/pages/directives/MyLazy.tsx'),
      meta: {
        title: 'my lazy',
        icon: '',
        hideMenu: true,
      },
    },
  ],
}

export default test
