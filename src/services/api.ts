// api.ts file
import axios from 'axios'
import { useAppStore } from '@/store/app.ts'

import setIndicator from './setIndicator.ts'

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

const indicator = setIndicator(API, useAppStore)

// interceptors
API.interceptors.request.use(
  (config) => {
    console.log(config)
    indicator.pending()
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    indicator.done()
    return Promise.reject(error)
  },
)

API.interceptors.response.use(
  (response) => {
    indicator.done()
    return response
  },
  (error) => {
    indicator.done()
    if (error.response) {
      if (error.response.status === 401) {
        // Redirect to login page
        // router.push('/login')
      } else {
        // Show a generic error message
        alert('An error occurred. Please try again later.')
      }
    }
    return Promise.reject(error)
  },
)

export default API
