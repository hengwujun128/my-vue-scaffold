// 参考文档地址: https://juejin.cn/post/7252956733546315837?searchId=202311241502493336E1745611A406789B
// import axiosInstance from "./requset";
import { jsonp } from 'vue-jsonp'
const baseUrl = 'https://apis.map.qq.com/ws'
export interface MapData {
  // 定义腾讯地图接口返回的数据结构
  // 根据实际情况进行定义
  result: any
  data: any
  status: number
}

export interface MapParams {
  key: string
  address?: string
  poi_options?: any
  location?: string
  keyword?: string
  mode?: string
  from?: string
  to?: string
  get_poi?: number
  region?: string
  policy?: number
}

export async function fetchMapData(params: MapParams): Promise<MapData> {
  try {
    const response = await jsonp(baseUrl + '/location/v1/ip', {
      key: params.key,
      address: params.address,
      output: 'jsonp',
    })
    return response
  } catch (error) {
    return Promise.reject(false)
  }
}

//  获取建议的的地址(注意:并不是当前位置的周围地址)
export async function getSuggestion(params: MapParams): Promise<MapData> {
  try {
    const response = await jsonp(baseUrl + '/place/v1/suggestion', {
      ...params,
      output: 'jsonp',
    })
    return response
  } catch (error) {
    return Promise.reject(false)
  }
}

// 逆地址解析
export async function getAddress(params: MapParams): Promise<MapData> {
  try {
    const response = await jsonp(baseUrl + '/geocoder/v1', {
      key: params.key,
      location: params.location,
      get_poi: params.get_poi, //是否返回周边地点（POI）列表，可选值：
      output: 'jsonp',
    })
    return response
  } catch (error) {
    return Promise.reject(false)
  }
}

export async function getGencoder(params: MapParams): Promise<MapData> {
  try {
    const response = await jsonp(baseUrl + '/geocoder/v1', {
      key: params.key,
      address: params.address,
      output: 'jsonp',
    })
    return response
  } catch (error) {
    return Promise.reject(false)
  }
}

export async function getDriving(params: MapParams) {
  try {
    const response = await jsonp(baseUrl + '/direction/v1/driving', {
      key: params.key,
      from: params.from,
      to: params.to,
      output: 'jsonp',
    })
    return response
  } catch (error) {
    return Promise.reject(false)
  }
}

// 搜素
export async function search(params: MapParams) {
  try {
    const response = await jsonp(baseUrl + '/place/v1/search', {
      ...params,
      orderby: '_distance',
      output: 'jsonp',
    })
    return response
  } catch (error) {
    return Promise.reject(false)
  }
}

// 计算两点之间距离
export async function calculateDistance(params: MapParams) {
  try {
    // https://apis.map.qq.com/ws/distance/v1/matrix
    const response = await jsonp(baseUrl + '/distance/v1/matrix', {
      key: params.key,
      mode: params.mode || 'walking',
      from: params.from,
      to: params.to,
      output: 'jsonp',
    })
    return response
  } catch (error) {
    return Promise.reject(false)
  }
}
