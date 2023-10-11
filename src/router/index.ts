// 创建路由实例

import { createRouter, createWebHistory } from 'vue-router'

import type { App } from 'vue'

// import routes from './routes/index.ts'
import { asyncRoutes } from './routes/index.ts'

export const router = createRouter({
  history: createWebHistory(), //可传参数，配置base路径，例如'/app'
  routes: asyncRoutes,
})

/* ------------------------------ // 通过函数配置路由器 ------------------------------ */
export function setupRouter(app: App<Element>) {
  app.use(router)
}

export default router
