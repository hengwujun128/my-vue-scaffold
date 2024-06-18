import type { AxiosError, AxiosRequestConfig, AxiosInstance, AxiosStatic } from 'axios'
import isRetryAllowed from 'is-retry-allowed'

export interface IAxiosRetryConfig {
  /**
   * The number of times to retry before failing
   * default: 3
   */
  retries?: number
  /**
   * Defines if the timeout should be reset between retries
   * default: false
   */
  shouldResetTimeout?: boolean
  /**
   * A callback to further control if a request should be retried.
   * default: it retries if it is a network error or a 5xx error on an idempotent request (GET, HEAD, OPTIONS, PUT or DELETE).
   */
  retryCondition?: (error: AxiosError) => boolean | Promise<boolean>
  /**
   * A callback to further control the delay between retry requests. By default there is no delay.
   */
  retryDelay?: (retryCount: number, error: AxiosError) => number
  /**
   * A callback to get notified when a retry occurs, the number of times it has occurred, and the error
   */
  onRetry?: (retryCount: number, error: AxiosError, requestConfig: AxiosRequestConfig) => Promise<void> | void
}

export interface IAxiosRetryConfigExtended extends IAxiosRetryConfig {
  /**
   * The number of times the request was retried
   */
  retryCount?: number
  /**
   * The last time the request was retried (timestamp in milliseconds)
   */
  lastRequestTime?: number
}

export interface IAxiosRetryReturn {
  /**
   * The interceptorId for the request interceptor
   */
  requestInterceptorId: number
  /**
   * The interceptorId for the response interceptor
   */
  responseInterceptorId: number
}

export interface AxiosRetry {
  (axiosInstance: AxiosStatic | AxiosInstance, axiosRetryConfig?: IAxiosRetryConfig): IAxiosRetryReturn

  isNetworkError(error: AxiosError): boolean
  isRetryableError(error: AxiosError): boolean
  isSafeRequestError(error: AxiosError): boolean
  isIdempotentRequestError(error: AxiosError): boolean
  isNetworkOrIdempotentRequestError(error: AxiosError): boolean
  exponentialDelay(retryNumber?: number, error?: AxiosError, delayFactor?: number): number
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    'axios-retry'?: IAxiosRetryConfigExtended
  }
}

export const namespace = 'axios-retry'

export function isNetworkError(error: any) {
  const CODE_EXCLUDE_LIST = ['ERR_CANCELED', 'ECONNABORTED']
  if (error.response) {
    return false
  }
  if (!error.code) {
    return false
  }
  // Prevents retrying timed out & cancelled requests
  if (CODE_EXCLUDE_LIST.includes(error.code)) {
    return false
  }
  // Prevents retrying unsafe errors
  return isRetryAllowed(error)
}

const SAFE_HTTP_METHODS = ['get', 'head', 'options']
const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(['put', 'delete'])

export function isRetryableError(error: AxiosError): boolean {
  return (
    error.code !== 'ECONNABORTED' && (!error.response || (error.response.status >= 500 && error.response.status <= 599))
  )
}

export function isSafeRequestError(error: AxiosError): boolean {
  if (!error.config?.method) {
    // Cannot determine if the request can be retried
    return false
  }

  return isRetryableError(error) && SAFE_HTTP_METHODS.indexOf(error.config.method) !== -1
}

export function isIdempotentRequestError(error: AxiosError): boolean {
  if (!error.config?.method) {
    // Cannot determine if the request can be retried
    return false
  }
  return isRetryableError(error) && IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1
}

export function isNetworkOrIdempotentRequestError(error: AxiosError): boolean {
  return isNetworkError(error) || isIdempotentRequestError(error)
}

function noDelay() {
  return 0
}

export function exponentialDelay(
  retryNumber = 0,
  _error: AxiosError | undefined = undefined,
  delayFactor = 100,
): number {
  const delay = 2 ** retryNumber * delayFactor
  const randomSum = delay * 0.2 * Math.random() // 0-20% of the delay
  return delay + randomSum
}

export const DEFAULT_OPTIONS: Required<IAxiosRetryConfig> = {
  retries: 3,
  retryCondition: isNetworkOrIdempotentRequestError,
  retryDelay: noDelay,
  shouldResetTimeout: false,
  onRetry: () => {},
}

// 获取 axios 实例配置
function getRequestOptions(
  config: AxiosRequestConfig,
  defaultOptions: IAxiosRetryConfig,
): Required<IAxiosRetryConfig> & IAxiosRetryConfigExtended {
  return { ...DEFAULT_OPTIONS, ...defaultOptions, ...config[namespace] }
}

// axios 实例当前状态设置
function setCurrentState(config: AxiosRequestConfig, defaultOptions: IAxiosRetryConfig | undefined) {
  const currentState = getRequestOptions(config, defaultOptions || {})

  // 设置 retryCount
  currentState.retryCount = currentState.retryCount || 0
  // 接口请求时间计时
  currentState.lastRequestTime = currentState.lastRequestTime || Date.now()
  // 为每个 axiosInstance 定义命名空间
  config[namespace] = currentState
  return currentState as Required<IAxiosRetryConfigExtended>
}

function fixConfig(axiosInstance: AxiosInstance | AxiosStatic, config: AxiosRequestConfig) {
  // @ts-ignore
  if (axiosInstance.defaults.agent === config.agent) {
    // @ts-ignore
    delete config.agent
  }
  if (axiosInstance.defaults.httpAgent === config.httpAgent) {
    delete config.httpAgent
  }
  if (axiosInstance.defaults.httpsAgent === config.httpsAgent) {
    delete config.httpsAgent
  }
}

//TIPS: 判断是否需要重试
async function shouldRetry(currentState: Required<IAxiosRetryConfig> & IAxiosRetryConfigExtended, error: AxiosError) {
  const { retries, retryCondition } = currentState
  const shouldRetryOrPromise = (currentState.retryCount || 0) < retries && retryCondition(error)

  // This could be a promise
  if (typeof shouldRetryOrPromise === 'object') {
    try {
      const shouldRetryPromiseResult = await shouldRetryOrPromise
      // keep return true unless shouldRetryPromiseResult return false for compatibility
      return shouldRetryPromiseResult !== false
    } catch (_err) {
      return false
    }
  }
  return shouldRetryOrPromise
}

const axiosRetry: AxiosRetry = (axiosInstance, defaultOptions) => {
  // 从新设置请求拦截器-并返回请求拦截器Id
  const requestInterceptorId = axiosInstance.interceptors.request.use((config) => {
    setCurrentState(config, defaultOptions)
    return config
  })

  // 重新设置响应拦截器-返回响应拦截器的Id
  const responseInterceptorId = axiosInstance.interceptors.response.use(null, async (error) => {
    const { config } = error
    // If we have no information to retry the request
    if (!config) {
      return Promise.reject(error)
    }
    //
    const currentState = setCurrentState(config, defaultOptions)

    // 是否进行Retry- 谓词函数
    if (await shouldRetry(currentState, error)) {
      currentState.retryCount += 1 //

      const { retryDelay, shouldResetTimeout, onRetry } = currentState
      // 延迟时间- 依赖 retryCount
      const delay = retryDelay(currentState.retryCount, error)
      // Axios fails merging this configuration to the default configuration because it has an issue
      // with circular structures: https://github.com/mzabriskie/axios/issues/370
      fixConfig(axiosInstance, config)

      // 考虑超时时间配置
      if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
        //  TIPS: 当前时间和最后一次请求时间间隔
        const lastRequestDuration = Date.now() - currentState.lastRequestTime
        // 配置的超时时间 - 接口发出请求到到现在的持续时间 - 延迟时间
        const timeout = config.timeout - lastRequestDuration - delay
        // 没有超时
        if (timeout <= 0) {
          return Promise.reject(error)
        }
        config.timeout = timeout
      }
      //
      config.transformRequest = [(data: any) => data]
      // NOTE: retry 重试

      await onRetry(currentState.retryCount, error, config)

      return new Promise((resolve) => {
        setTimeout(() => resolve(axiosInstance(config)), delay)
      })
    }
    return Promise.reject(error)
  })

  return { requestInterceptorId, responseInterceptorId }
}

// Compatibility with CommonJS
axiosRetry.isNetworkError = isNetworkError
axiosRetry.isSafeRequestError = isSafeRequestError
axiosRetry.isIdempotentRequestError = isIdempotentRequestError
axiosRetry.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError
axiosRetry.exponentialDelay = exponentialDelay
axiosRetry.isRetryableError = isRetryableError
export default axiosRetry
