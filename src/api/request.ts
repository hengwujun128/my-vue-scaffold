import axios from 'axios'

// AxiosRequestConfig,
// import { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/*
 * 创建实例
 * 与后端服务通信
 */
const HttpClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
})

/**
 * 请求拦截器
 * 功能：配置请求头
 */
HttpClient.interceptors.request.use(
  (config) => {
    // const token = '222'
    // config.headers.authorization = 'Bearer ' + token
    return config
  },
  (error) => {
    console.error('网络错误，请稍后重试')
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 * 功能：处理异常
 */
HttpClient.interceptors.response.use(
  (res) => {
    if (res.status === 200) {
      return res.data
    } else {
      return Promise.reject(res)
      // return false
    }
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default HttpClient
