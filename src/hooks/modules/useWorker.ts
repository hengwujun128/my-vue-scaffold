/**
 * const worker = new Worker("<worker_file>.js");
 * const worker = new SharedWorker("<worker_file>.js");
 * const worker = new Worker(new URL(url,import.meta.url))
 */

import { ref, onUnmounted } from 'vue'

// 创建一个Web Worker实例
const createWorker = (workerScript) => {
  const blob = new Blob(['(' + workerScript.toString() + ')()'], { type: 'text/javascript' })
  const url = window.URL.createObjectURL(blob)

  return new Worker(url)
}

/**
 * @param {Function} workerScript - description
 *
 */
const useWebWorker = (workerScript) => {
  // const worker = ref(createWorker(workerScript))
  const worker = ref(new Worker(new URL(workerScript, import.meta.url)))
  const message = ref(null)
  const error = ref(null)

  worker.value.onmessage = (e) => {
    message.value = e.data
    error.value = null
  }

  worker.value.onerror = (e) => {
    message.value = null
    error.value = e
  }

  const postMessage = (msg) => worker.value.postMessage(msg)

  onUnmounted(() => worker.value.terminate())

  return { worker, postMessage, message, error }
}

export default useWebWorker
