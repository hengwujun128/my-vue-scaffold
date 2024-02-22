import { AxiosInstance } from 'axios'
// import { Store } from 'pinia'

const setIndicator = (requestInstance: AxiosInstance, useAppStore: any) => {
  const store = useAppStore()
  let pendingCounter = 0

  const pending = () => {
    pendingCounter++
    store.show()
  }

  const done = () => {
    pendingCounter--
    if (pendingCounter <= 0) {
      store.hide()
    }
  }
  // remove it lately

  const subtract = () => {
    pendingCounter--
  }

  return {
    subtract,
    pending,
    done,
  }
}

export default setIndicator
