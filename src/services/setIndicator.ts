import { AxiosInstance } from 'axios'
import { useAppStore } from '@/store/app.ts'

const setIndicator = (requestInstance: AxiosInstance) => {
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
