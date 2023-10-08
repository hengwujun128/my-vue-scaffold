import { createRouter, createWebHistory } from 'vue-router'

import type { App } from 'vue'

import routes from './routes.ts'

// router 实例
export const router = createRouter({
  history: createWebHistory(), //可传参数，配置base路径，例如'/app'
  routes,
})

// 通过函数配置路由器
export function setupRouter(app: App<Element>) {
  app.use(router)
}
