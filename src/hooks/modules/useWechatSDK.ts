import useSDKConfig from './useSDKConfig.ts'
const wx = window.wx

type SDKRes = {
  err_msg?: string
}

type Location = {
  lat: string
  lng: string
  address?: string
  name?: string
  speed?: number
  accuracy?: number
}

const useWechatSDK = () => {
  // sdk: getLocation
  const getLocation: () => Promise<Location> = async () => {
    try {
      await useSDKConfig(['getLocation'])
      return new Promise((resolve, reject) => {
        wx.ready(function () {
          wx.getLocation({
            type: 'gcj02',
            success: function (res: any) {
              const { latitude, longitude, speed, accuracy } = res
              console.log({ res })
              resolve({
                lat: latitude,
                lng: longitude,
                speed,
                accuracy,
              })
            },
            fail: function (res: any) {
              console.log(res)
              reject(false)
            },
          })
        })
      })
    } catch (error) {
      return Promise.reject(false)
    }
  }

  // sdk: openLocation - 没有实际用处,可作为企微打开微信地图的入口
  const openLocation = async (location: Location): Promise<void> => {
    await useSDKConfig(['openLocation'])
    wx.openLocation({
      latitude: location.lat, // 纬度，浮点数，范围为90 ~ -90
      longitude: location.lng, // 经度，浮点数，范围为180 ~ -180。
      name: location.name, // 位置名
      address: location.address, // 地址详情说明
      scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为16
    })
  }

  // sdk: onLocationChange
  const onLocationChange = async (callback: (data: Location) => void) => {
    await useSDKConfig(['startAutoLBS'])
    return new Promise((resolve, reject) => {
      wx.invoke(
        'startAutoLBS',
        {
          type: 'gcj02', // wgs84是gps坐标，gcj02是火星坐标
        },
        function (res: SDKRes) {
          if (res.err_msg == 'startAutoLBS:ok') {
            wx.onLocationChange(function (res: any) {
              if (res.errMsg == 'auto:location:report:location:report:ok') {
                const { latitude, longitude, speed, accuracy } = res
                const data = { lat: latitude, lng: longitude, speed, accuracy }
                callback && callback(data)
                resolve(data)
              } else {
                console.log('---startAutoLBS---err', res)
                reject(false)
              }
            })
          } else {
            reject(false)
          }
        },
      )
    })
  }

  // stopAutoLBS
  const stopAutoLBS = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      wx.invoke('stopAutoLBS', {}, function (res: SDKRes) {
        if (res.err_msg == 'stopAutoLBS:ok') {
          resolve(true)
        } else {
          reject(false)
        }
      })
    })
  }
  return {
    getLocation,
    openLocation,
    onLocationChange,
    stopAutoLBS,
  }
}

export default useWechatSDK
