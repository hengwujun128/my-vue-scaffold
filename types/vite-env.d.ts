/// <reference types="vite/client" />

//全局类型定义文件
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  env: ImportMetaEnv
  // readonly env: ImportMetaEnv
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
