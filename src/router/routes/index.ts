// import type { AppRouteModule } from '@/router/types.ts'

// import.meta.glob() 直接引入所有的模块 Vite 独有的功能
// import.meta.glob 使用别名
import BasicRoutes from './basic.ts'

const modules: any = import.meta.glob('./modules/**/*.ts', { eager: true })
console.log('------modules------', modules)

// 加入到路由集合中
// Object.keys(modules).forEach((key) => {
//   const mod = modules[key].default || {}
//   const modList = Array.isArray(mod) ? [...mod] : [mod]
//   routeModuleList.push(...modList)
// })

//
const routesProcessor = () => {
  const routeModuleList: any[] = [
    {
      path: '/',
      redirect: '/home',
    },
  ]

  for (const path in modules) {
    // console.log('----', modules[path])
    const mod = modules[path].default || {}
    const modList = Array.isArray(mod) ? [...mod] : [mod]
    routeModuleList.push(...modList)
  }
  return routeModuleList
}

const asyncRoutes = routesProcessor()

export { asyncRoutes, BasicRoutes }
