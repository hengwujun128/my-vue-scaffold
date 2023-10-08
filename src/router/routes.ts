const routes = [
  {
    path: '/login',
    component: () => import('@/pages/greeLogin.vue'), //路由懒加载
  },
  {
    path: '/home',
    component: () => import('@/pages/greeHome.vue'),
  },
]

export default routes
