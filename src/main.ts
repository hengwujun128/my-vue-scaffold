import { createApp } from 'vue'

// main.ts
import 'virtual:uno.css'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// have effect to ant-design-vue
import './style.css'

import App from './App.vue'
//
import { setupRouter } from '@/router/index.ts'

async function bootstrap() {
  const app = createApp(App)
  app.use(Antd)
  // 配置路由
  setupRouter(app)

  // 路由守卫
  // setupRouterGuard(router)

  app.mount('#app')
}
bootstrap()
// createApp(App).mount('#app')
