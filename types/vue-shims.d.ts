/**
 * 在使用 vue3 的 tsx 语法后，使用 typescript 编译 .d.ts 文件，出现 TS2604 JSX element type Comp does not have any construct or call signatures 错误
 * https://carljin.com/posts/vue-build-type-error/
 */
declare module '*.vue' {
  import { defineComponent } from 'vue'
  const component: ReturnType<typeof defineComponent>
  export default component
}
