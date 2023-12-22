<template>
  <div class="myPosition">
    <div ref="mapRef" class="map">
      <p v-if="mapInstance && visibleLocationIcon" class="map-footer" @touchstart="setPos">
        <span class="go-back-pos"><i></i></span>
      </p>
    </div>
    <p class="footer">
      <slot name="footer"></slot>
    </p>
  </div>
</template>

<script setup lang="ts">
  export interface Props {
    context: string
    visibleLocationIcon?: boolean
  }
  const TMap = window.TMap
  const wx = window.wx
  const qq = window.qq

  import { ref, shallowRef, reactive, onMounted } from 'vue'
  import { useMap } from '@/hooks'

  import { getAddress } from '@/api/modules/mapService'
  // import { useSDKConfig } from '@/hooks/useSdk'

  const { loadGeolocation } = useMap()

  const key = import.meta.env.VITE_APP_MAP_KEY
  const appName = import.meta.env.VITE_APP_MAP_APP

  const props = withDefaults(defineProps<Props>(), {
    context: 'browser', // 'wechat' | 'browser
    visibleLocationIcon: false,
  })
  const emits = defineEmits<{
    onLocation: [value: Position]
    onSetLocation: [value: Position]
  }>()

  let geoLocationInstance: any

  const mapRef = ref(null)
  const mapInstance: any = shallowRef(null)
  const markerLayer = shallowRef()
  const circleLayer = shallowRef()

  const currentPosition = reactive({
    address: '',
    detail: '',
    latitude: '',
    longitude: '',
  })

  const initGeolocation = () => {
    geoLocationInstance = new window.qq.maps.Geolocation(key, appName)
    // geoLocationInstance.watchPosition(watchPositionHandler)
  }
  //
  const getAddressByGeolocation = (): Promise<Position | boolean> => {
    return new Promise((resolve, reject) => {
      geoLocationInstance.getLocation(
        (position: Position) => {
          console.log('当前的位置信息', position)
          emits('onLocation', position)
          resolve(position)
        },
        (error: any) => {
          console.log('无法获取当前位置信息', error)
          reject(false)
        },
      )
    })
  }

  const setPos = () => {
    return getAddressByGeolocation().then((res) => {
      emits('onSetLocation', res as Position)
    })
  }

  const watchPositionHandler = (position: Position) => {
    console.log('监听位置信息', position)
    //  mapInstance.value
  }

  // 初始化 location by wechat
  const initLocationByWechat: () => Promise<any> = async () => {
    await useSDKConfig(['getLocation'])
    return new Promise((resolve, reject) => {
      wx.ready(function () {
        wx.getLocation({
          type: 'gcj02', // 默认为 wgs84 的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res: any) {
            const { latitude, longitude, speed, accuracy } = res
            console.log({
              latitude,
              longitude,
              speed,
              accuracy,
            })

            if (latitude && longitude) {
              resolve({
                lat: latitude,
                lng: longitude,
                speed,
                accuracy,
              })
            } else {
              reject(false)
            }
          },
        })
      })
    })
  }
  // 根据经纬度获地址和周围地址(地址逆解析)
  const getAddressByLocation = (params: { lat: string; lng: string } = { lat: '', lng: '' }): Promise<any> => {
    const requestParam = {
      key: key,
      location: `${params.lat},${params.lng}`,
      get_poi: 1, //是否返回周边地点（POI）列表，可选值：1|0
      poi_options: {},
    }
    return getAddress(requestParam).then((res) => {
      if (res.status === 0 && res.result) {
        return res.result
      } else {
        return false
      }
    })
  }

  const showPosition = (position: Position) => {
    const { province, city, district, addr: address, lat: latitude, lng: longitude } = position
    const detail = `${province}${city}${district || ''}`
    Object.assign(currentPosition, { address, detail, latitude, longitude })
  }

  const setMap = (position: Position) => {
    const center = new TMap.LatLng(position.lat, position.lng)
    mapInstance.value = new TMap.Map(mapRef.value, {
      center: center, //设置地图中心点坐标
      zoom: 17.2, //设置地图缩放级别
      minZoom: 15.2,
      maxZoom: 17.2,
      pitch: 0, //设置俯仰角
      rotation: 20, //设置地图旋转角度
      draggable: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      showControl: false,
    })

    // layer
    const markerGeo = {
      id: 'marker',
      position: center, //mapInstance.value.getCenter()
    }
    markerLayer.value = new TMap.MultiMarker({
      map: mapInstance.value,
      styles: {
        marker: new TMap.MarkerStyle({
          width: 20, // 样式宽
          height: 30, // 样式高
          anchor: { x: 10, y: 30 }, // 描点位置
          // src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/markerDefault.png' // 标记路径
        }),
      },
      geometries: [
        // 点标记数据数组
        markerGeo,
      ],
    })

    //circle
    const circleGeo = {
      styleId: 'circle',
      center: center,
      radius: 50,
    }
    circleLayer.value = new TMap.MultiCircle({
      id: 'circle',
      map: mapInstance.value,
      styles: {
        circle: new TMap.CircleStyle({
          color: 'rgba(41,91,255,0.16)',
          showBorder: true,
          borderColor: 'rgba(41,91,255,1)',
          borderWidth: 2,
        }),
      },
      geometries: [circleGeo],
    })

    // 监听中心点变化事件(包括拖动在内)，更新marker的位置
    mapInstance.value.on('center_changed', () => {
      const centerPos = mapInstance.value.getCenter()
      markerGeo.position = centerPos
      circleGeo.center = centerPos
      markerLayer.value.updateGeometries([markerGeo])
      circleLayer.value.updateGeometries([circleGeo])
    })
  }

  const setCenterPosition = (value: { lat: string; lng: string }) => {
    // mapInstance.value.setCenter(new TMap.LatLng(value.lat, value.lng))
    mapInstance.value.panTo(new TMap.LatLng(value.lat, value.lng), { duration: 500 })
  }

  onMounted(async () => {
    try {
      let position, addressInfo
      if (props.context === 'wechat') {
        const location = await initLocationByWechat()
        addressInfo = await getAddressByLocation({ lat: location.lat, lng: location.lng })
        position = {
          lat: location.lat,
          lng: location.lng,
          addr: addressInfo.address,
          ...addressInfo.address_component,
        }
      } else {
        const loadStatus = await loadGeolocation(key, appName)
        if (loadStatus) {
          initGeolocation()
          addressInfo = await getAddressByGeolocation()
          position = {
            ...(addressInfo as Position),
          }
        }
      }
      if (position) {
        showPosition(position)
        setMap(position)
      }
    } catch (e) {
      console.log(e)
    }
  })

  const handleStartVisiting = () => {
    // toReportForm(1, {})
  }

  defineExpose({ setCenterPosition })
</script>

<style lang="less" scoped>
  .myPosition {
    * {
      padding: 0;
      margin: 0;
    }
    width: 100%;
    height: 100%;
    background: #fff;
    padding: 0px 0px;
    position: relative;
    z-index: 0;

    .footer {
      height: 20px;
      font-size: 14px;
      margin-top: 10px;
      padding: 0px 10px;
    }
    .map {
      width: 100vw;
      height: calc(100% - 40px);
      &-footer {
        inset: auto auto 0px 0px;
        position: absolute;
        transform: translate(0px, 0px);
        z-index: 1111;
      }
      .go-back-pos {
        display: inline-block;
        width: 44px;
        height: 44px;
        background: url('@/assets/image/navbg.png') no-repeat top left;
        background-size: 44px 44px;
        i {
          background: url('@/assets/image/nav.png') no-repeat center center;
          background-size: 24px 24px;
          display: block;
          width: 44px;
          height: 44px;
        }
      }
    }
    :deep(canvas ~ div) {
      display: none;
    }
  }
  /* marker飞入的动画 */
  .markerFlash {
    animation: flash 0.5s ease-in 1 normal forwards;
  }
  /* 飞入的动画 */
  @keyframes flash {
    0% {
      transform: translate(0, -200px);
    }

    100% {
      transform: translate(0, 0);
    }
  }
</style>
