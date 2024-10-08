import { createApp } from 'vue'

import 'reset-css'
// main.ts
import 'virtual:uno.css'

import Antd from 'ant-design-vue'
// why?
import 'ant-design-vue/dist/reset.css'

// have effect to ant-design-vue
import './style.css'

import 'virtual:svg-icons-register'

import App from './App.vue'
//
import { setupRouter } from '@/router/index.ts'

import { setupGlobDirectives } from '@/directives/index'

async function bootstrap() {
  const app = createApp(App)

  app.use(Antd)
  // 配置路由
  setupRouter(app)

  // 路由守卫
  // setupRouterGuard(router)

  setupGlobDirectives(app)

  app.mount('#app')
}
bootstrap()
// createApp(App).mount('#app')
