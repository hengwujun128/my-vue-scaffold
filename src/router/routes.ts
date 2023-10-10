// 定义路由
const routes = [
  {
    path: '/login',
    component: () => import('@/pages/greeLogin.vue'), //路由懒加载
  },
  {
    path: '/home',
    component: () => import('@/pages/home/greeHome.vue'),
    redirect: '/home/user', // 重定向
    children: [
      {
        path: '/home/user',
        component: () => import('@/pages/home/g-user.vue'),
      },
      {
        path: '/home/manage',
        component: () => import('@/pages/home/g-manage.vue'),
      },
    ],
  },

  // 404 //添加（放在最后）
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/notFound.vue'),
  },
]

export default routes
