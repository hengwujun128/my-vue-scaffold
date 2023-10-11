// import type { AppRouteModule } from '@/router/types'

const test = {
  path: '/test',
  name: 'Test',
  component: '',
  redirect: '/test/index',
  meta: {},
  children: [
    {
      path: 'index',
      name: 'UploadFile',
      component: () => import('@/pages/test/UploadFile.vue'),
      meta: {
        title: '上传文件',
        icon: '',
        hideMenu: true, // 当前路由不再菜单显示
      },
    },
  ],
}

export default test
