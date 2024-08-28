/**
 * Web Workers 运行于浏览器的一个隔离线程之中。因此，他们所执行的代码必须被包含在一个单独的文件之中。请谨记这一特性
 * const worker = new Worker("<worker_file>.js");
 * const worker = new SharedWorker("<worker_file>.js");
 * const worker = new Worker(new URL(url,import.meta.url))
 */

import { ref, onUnmounted } from 'vue'

/**
 * Create a Web Worker instance
 *
 * @param {Function} workerScript - The worker script to be executed
 * @returns {Worker} The created Web Worker instance
 */
const createWorker = (workerScript: () => any): Worker => {
  const blob = new Blob([`(${workerScript.toString()})()`], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)

  return new Worker(url)
}

/**
 * @param {Function} workerScript - description
 *
 */
const useWebWorker = (workerScript: string) => {
  // const worker = ref(createWorker(workerScript))
  const worker = ref(new Worker(new URL(workerScript, import.meta.url)))
  const message = ref<null | string>(null)
  const error = ref<null | ErrorEvent>(null)

  worker.value.onmessage = (e) => {
    message.value = e.data
    error.value = null
  }

  worker.value.onerror = (e) => {
    message.value = null
    error.value = e
  }

  const postMessage = (msg: string) => worker.value.postMessage(msg)

  onUnmounted(() => worker.value.terminate())

  return { worker, postMessage, message, error }
}

export default useWebWorker
