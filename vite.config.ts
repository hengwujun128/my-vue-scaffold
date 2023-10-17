/**
 * 1. 如何在vite.config.ts 中使用环境变量,defineConfig() 参数配置成一个函数
 * 2.
 *
 */

import { defineConfig, loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'

import pkg from './package.json'

import vue from '@vitejs/plugin-vue'

import UnoCSS from 'unocss/vite'

import dayjs from 'dayjs'

import path from 'path' //这个path用到了上面安装的@types/node
// https://vitejs.dev/config/

const { name, version } = pkg
const __APP_INFO__ = {
  pkg: { name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
}

export default defineConfig(({ command, mode, ssrBuild }: ConfigEnv): UserConfig => {
  console.log({ command, mode, ssrBuild })

  const root = process.cwd()
  const env = loadEnv(mode, root) // root 和 envDir 选项会影响加载行为
  console.log({ root, env })
  return {
    root,
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    plugins: [vue(), UnoCSS()],

    //这里进行配置别名
    resolve: {
      alias: {
        '@': path.resolve('./src'), // @代替src
        '#': path.resolve('./types'), // #代替types
      },
    },
  }
})
