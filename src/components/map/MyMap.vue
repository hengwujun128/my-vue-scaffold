<template>
  <!-- fit Emmet issues -->
  <div class="map">
    <van-search
      v-model="keyword"
      class="map-search"
      placeholder="检索地点"
      left-icon="ico_search"
      shape="round"
      :show-action="suggestionVisible === true"
      @update:model-value="onSearch"
      @click-input="onFocus"
      @cancel="onCancel"
    />
    <div class="suggestion-wrapper" :style="{ display: suggestionVisible ? 'block' : 'none' }">
      <MySuggestion :list="suggestionList" @check="suggestionHandler"></MySuggestion>
    </div>
    <div class="map-wrapper">
      <MapComp
        ref="mapRef"
        context="browser"
        :visible-location-icon="true"
        @on-location="locationHandler"
        @on-set-location="onSetLocationHandler"
      >
        <template #footer>
          <span style="color: #b6b0b0">打卡范围:</span>
          &nbsp;
          <span>目的坐标范围100米有效</span>
        </template>
      </MapComp>
    </div>
    <div ref="addressListRef" class="map-list">
      <van-radio-group v-model="checked">
        <van-radio v-for="address in mapList" :key="address.id" :name="address.id" @click="setAddress(address)">
          <div class="map-item">
            <p class="title">
              <span :style="{ color: checked === address.id ? '#0a65ef' : '' }">
                {{ address.title }}
              </span>
              <span>{{ address._distance }}m</span>
            </p>
            <p class="address">
              <span>定位 &nbsp;&nbsp;</span>
              <span>{{ address.address }}</span>
            </p>
          </div>
          <template #icon="prop">
            <van-icon
              size="22"
              :color="prop.checked ? '#0a65ef' : '#8e8e8e'"
              :name="prop.checked ? activeIcon : inactiveIcon"
            />
          </template>
        </van-radio>
      </van-radio-group>
      <LoadMore
        v-if="myPos.lat && myPos.lng"
        :loader-method="getAddress"
        loader-color="#0a65ef"
        :loader-disable="disabledLoadMore"
        :loader-size="30"
        :loader-viewport="addressListRef"
      >
      </LoadMore>
    </div>
    <!-- TODO: refactor lately -->
    <!-- <MapList :dataSources="mapList" dataKey="id" :dataComponent="MyItem" wrapClass="map-list">
    </MapList> -->
    <div class="footer">
      <van-button type="primary" block round @click="visitHandler">开始拜访</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref, reactive } from 'vue'
  import { message } from 'ant-design-vue'
  const [messageApi] = message.useMessage()

  // import MapList from './List'
  // import MyItem from './MyItem.vue'
  import LoadMore from './LoadMore.vue'
  import MySuggestion from './MySuggestion.vue'
  import type { Address } from './MySuggestion.vue'
  import MapComp from './MapComp.vue'

  import { search, getSuggestion, calculateDistance } from '@/api/modules/mapService'

  // const { toReportForm } = useLink()

  export interface Props {
    context: string
  }
  const props = withDefaults(defineProps<Props>(), {
    context: 'browser', // 'wechat' | 'browser
  })

  const activeIcon = ref('checkbox_selected')
  const inactiveIcon = ref('checkbox_default')

  const key = import.meta.env.VITE_APP_MAP_KEY
  // const appName = import.meta.env.VITE_APP_MAP_APP

  // suggestion
  const keyword = ref('')
  const addressListRef = ref<HTMLElement>()
  const mapRef = ref<InstanceType<typeof MapComp> | null>(null)

  const pageNumber: Ref = ref(0)
  const pageSize: Ref = ref(10)
  const total = 100 // 只显示周围 100 条数据
  const disabledLoadMore: Ref = ref(false)
  const checked = ref('')
  const mapList: Ref<any[]> = ref([])

  // 选择的位置
  const initSelectedPos = {
    id: '',
    lat: '',
    lng: '',
    _distance: 0,
    addr: '',
    address: '',
    title: '',
  }
  const selectedPos = reactive({ ...initSelectedPos })
  // 我的位置
  const myPos = reactive({
    lat: '',
    lng: '',
    city: '珠海',
  })

  const maxDistance = 100 // 间距最大为 100m

  const suggestionVisible = ref(false)
  const suggestionList: Ref<any[]> = ref([])

  // search
  const onSearch = (v: string) => {
    suggestionVisible.value = true
    if (!v) {
      return
    }
    console.log(v)
    const params = {
      key: key,
      policy: 1,
      region: myPos.city,
      keyword: v,
    }
    getSuggestion(params).then((res) => {
      if (res.status === 0 && res.data) {
        suggestionList.value = res.data
      }
    })
  }

  const getAddress = (param: { lat: string; lng: string } = { lat: '', lng: selectedPos.lng }) => {
    pageNumber.value++
    // 优先根据选择的位置进行搜索
    if (selectedPos.lat && selectedPos.lng) {
      param.lat = selectedPos.lat
      param.lng = selectedPos.lng
    } else {
      param.lat = myPos.lat
      param.lng = myPos.lng
    }

    const params = {
      key: key,
      boundary: `nearby(${param.lat},${param.lng},1000)`,
      page_size: pageSize.value,
      page_index: pageNumber.value,
    }
    search(params).then((res) => {
      if (res.status === 0 && res.data) {
        // 第一页做做排序,后面默认排序
        if (pageNumber.value === 1 && selectedPos.title) {
          const targetIndex = res.data.findIndex((item: any) => item.title === selectedPos.title)
          targetIndex >= 0 && ([res.data[0], res.data[targetIndex]] = [res.data[targetIndex], res.data[0]])
        }
        mapList.value = [...mapList.value, ...res.data]
        if (mapList.value.length >= total) disabledLoadMore.value = true
      }
    })
  }

  // 建议地点
  const suggestionHandler = (v: Address) => {
    console.log('suggestionHandler', v)
    Object.assign(selectedPos, v.location, v)
    checked.value = selectedPos.id
    resetAddress()
    // getAddress(v.location)// 会自动调用
    setAddress(v)
  }

  const onCancel = () => {
    suggestionVisible.value = false
  }
  const onFocus = () => {
    console.log('onFocus---')
    suggestionVisible.value = true
    suggestionList.value = []
  }

  const resetAddress = () => {
    suggestionVisible.value = false
    keyword.value = ''
    mapList.value = []
    pageNumber.value = 0
  }

  const setAddress = (v: Address) => {
    Object.assign(selectedPos, v.location, v)
    mapRef.value?.setCenterPosition(v.location)
    console.log('选择的位置', selectedPos)
  }

  const validateDistanceHandler = () => {
    const params = {
      key: key,
      mode: 'walking',
      from: `${myPos.lat},${myPos.lng}`,
      to: `${selectedPos.lat},${selectedPos.lng}`,
    }

    return calculateDistance(params).then((res) => {
      if (res.status === 0 && res.result) {
        const rows = res.result.rows
        const { elements } = rows[0]
        if (elements[0].distance <= maxDistance) {
          messageApi.info(`距离范围:${elements[0].distance}米,符合打卡要求`)
          return { status: true, distance: elements[0].distance }
        }
        messageApi.info(`距离范围:${elements[0].distance}米,不符合打卡要求`)
        return { status: false, distance: elements[0].distance }
      } else {
        messageApi.info(res.message)
        return { status: false, distance: null }
      }
    })
  }

  const visitHandler = async () => {
    console.log({
      selectedPos,
      myPos,
    })
    if (!myPos.lat || !myPos.lng) {
      messageApi.info(`没有获取到当前位置信息`)
      return
    }
    if (!selectedPos.lat || !selectedPos.lng) {
      messageApi.info(`请在地址列表中选择一个目标地点进行打卡`)
      return
    }

    const isValid = await validateDistanceHandler()
    if (isValid.status) {
      // toReportForm(1, {
      //   visitStartDistance: String(isValid.distance),
      //   visitTarget: selectedPos.title,
      //   address: selectedPos.address,
      //   latitude: selectedPos.lat,
      //   longitude: selectedPos.lng,
      //   visitStartLatitude: myPos.lat,
      //   visitStartLongitude: myPos.lng,
      // })
    }
  }

  const locationHandler = (position: Position) => {
    console.log('myPos---', position)
    // Object.assign(selectedPos, position) // 默认选择的位置就是当前的位置
    Object.assign(myPos, position)
  }

  // 重新获取当前定位📌
  const onSetLocationHandler = (location: Position) => {
    resetAddress()
    checked.value = ''
    Object.assign(myPos, location)
    Object.assign(selectedPos, initSelectedPos) // 选择的位置重置
    console.log('重新定位--- myPos', { myPos, selectedPos })
    mapRef.value?.setCenterPosition({ lat: location.lat, lng: location.lng })
  }
</script>

<style lang="less" scoped>
  * {
    padding: 0;
    margin: 0;
  }
  .map {
    position: relative;
    height: 100vh;
    width: 100vw;
    &-wrapper {
      position: relative;
      height: 40vh;
      background-color: #fff;
    }
    &-search {
      padding: 12px;
    }
    &-list {
      margin-top: 10px;
      background-color: #fff;
      height: 40vh;
      overflow: auto;
      padding: 0px 16px;
    }
    .map-item {
      border-bottom: 1px solid #eee;
      .title {
        color: #2c2c2c;
        margin-bottom: 10px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        span:nth-child(2) {
          color: #b6b0b0;
        }
      }
      .address {
        color: #666;
        margin-bottom: 10px;
        font-size: 12px;
      }
    }
    .footer {
      width: 100%;
      padding: 0px 10px;
      position: fixed;
      bottom: 20px;
    }
    .suggestion-wrapper {
      position: absolute;
      top: 46px;
      bottom: 0;
      z-index: 7;
      width: 100%;
      // background: #f6f6f6;
      background: #fff;
      overflow: auto;
      display: none;
    }
    :deep(.van-radio) {
      margin: 12px 0px;
    }
    :deep(.van-radio__label) {
      flex: 1;
    }
  }
</style>
