// import type { AppRouteModule } from '@/router/types'

const test = {
  path: '/test',
  name: 'Test',
  component: '', // 需要一个布局组件
  redirect: '/test/upload',
  meta: {},
  children: [
    {
      path: 'index',
      name: 'map',
      component: () => import('@/pages/test/map/Tecent.vue'),
      meta: {
        title: 'TecentMap',
        icon: '',
        hideMenu: true, // 当前路由不再菜单显示
      },
    },
    {
      path: 'upload',
      name: 'UploadFile',
      component: () => import('@/pages/test/UploadFile.vue'),
      meta: {
        title: '上传文件',
        icon: '',
        hideMenu: true, // 当前路由不再菜单显示
      },
    },
    {
      path: 'loadMore',
      name: 'LoadMore',
      component: () => import('@/pages/test/loadMore/loadMore.vue'),
      meta: {
        title: 'loadMore',
        icon: '',
        hideMenu: true,
      },
    },
    {
      path: 'virtualList',
      name: 'VirtualList',
      component: () => import('@/pages/test/list/VirtualList.vue'),
      // component: () => import('@/pages/test/list/test.vue'),
      meta: {
        title: 'virtualList',
        icon: '',
        hideMenu: true,
      },
    },
    {
      path: 'scrollList',
      name: 'ScrollList',
      component: () => import('@/pages/test/scroll/Index.vue'),
      // component: () => import('@/pages/test/list/test.vue'),
      meta: {
        title: 'scrollList',
        icon: '',
        hideMenu: true,
      },
    },
    {
      path: 'modal',
      component: () => import('@/pages/modal/index.vue'),
    },
  ],
}

export default test
