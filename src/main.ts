import { createApp } from 'vue'
import './style.css'

import App from './App.vue'
//
import { setupRouter } from '@/router/index.ts'

async function bootstrap() {
  const app = createApp(App)
  // 配置路由
  setupRouter(app)

  // 路由守卫
  // setupRouterGuard(router)

  app.mount('#app')
}
bootstrap()
// createApp(App).mount('#app')
