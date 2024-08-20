const useMap = () => {
  const initMapGL = () => {
    const TMap = window.TMap
    const KEY = import.meta.env.VITE_APP_MAP_KEY

    const TMap_URL =
      'https://map.qq.com/api/gljs?v=1.exp&libraries=visualization,drawing,geometry,autocomplete,convertor&key=' +
      KEY +
      '&callback=onMapCallback'
    return new Promise((resolve, reject) => {
      // 如果已加载直接返回
      if (typeof TMap !== 'undefined') {
        resolve(TMap)
        return true
      }
      // 地图异步加载回调处理
      window.onMapCallback = function () {
        resolve(TMap)
      }

      const scriptNode = document.createElement('script')
      scriptNode.setAttribute('type', 'text/javascript')
      scriptNode.setAttribute('src', TMap_URL)
      document.body.appendChild(scriptNode)
    })
  }

  const loadGeolocation = (key: string, appName: string) => {
    const qq = window.qq
    // Note: 注意根据引入方式的不同, url 地址是不一样的
    // const url = 'https://mapapi.qq.com/web/mapComponents/geoLocation/v/geolocation.min.js'
    const url = `https://apis.map.qq.com/tools/geolocation/min?key=${key}&referer=${appName}`
    return new Promise((resolve, reject) => {
      if (typeof qq !== 'undefined') {
        console.log('-------存在 qq 实例----')
        resolve(qq)

        return true
      }
      console.log('不存在----')
      const mapScript = document.createElement('script')
      mapScript.type = 'text/javascript'
      mapScript.src = url
      document.body.appendChild(mapScript)
      mapScript.onload = () => {
        console.log('mapScript 加载完毕')
        //加载完成后初始化地图
        // callback && callback()
        resolve(true)
      }
    })
  }

  return { initMapGL, loadGeolocation }
}

export default useMap
