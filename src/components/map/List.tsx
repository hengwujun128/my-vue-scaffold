import { defineComponent, onActivated, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'

import { Item } from './Item'
import { MapListProps } from './props'
export default defineComponent({
  name: 'MapList',
  props: MapListProps,
  setup(props, { emit, slots, expose }) {
    // 封装子组件|子元素
    const getRenderSlots = () => {
      // const slots = []
      const { dataSources, dataKey, dataComponent: itemComponent, itemTag } = props
      return dataSources.map((item: any, index) => {
        const uniqueKey = typeof dataKey === 'function' ? dataKey(item) : item[dataKey]

        return <Item index={index} tag={itemTag} uniqueKey={uniqueKey} source={item} component={itemComponent}></Item>
      })
    }
    watch(
      () => props.dataSources.length,
      () => {
        console.log('数据源改变')
      },
    )
    return () => {
      // @ts-ignore
      const { wrapClass, wrapStyle, wrapTag } = props
      //
      const { header, body, footer } = slots
      console.log('slots----', slots)
      return (
        <wrapTag class={wrapClass} style={wrapStyle}>
          {/* it's better to use slots here */}
          {getRenderSlots()}
        </wrapTag>
      )
    }
  },
})
