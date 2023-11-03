/* eslint-disable vue/one-component-per-file */
import { computed, defineComponent, onMounted, onUnmounted, onUpdated, ref, Ref } from 'vue'
import { ItemProps, SlotProps } from './props'

const useResizeChange = (props: any, rootRef: Ref<HTMLElement | null>, emit: any) => {
  let resizeObserver: ResizeObserver | null = null
  const shapeKey = computed(() => (props.horizontal ? 'offsetWidth' : 'offsetHeight'))

  // TIPS: vue3中如何获取一个元素的内容高度(contentHeihgt),不同于元素的高度: This property will round the value to an intege
  const getCurrentSize = () => {
    return rootRef.value ? rootRef.value[shapeKey.value] : 0
  }

  // tell parent current size identify by unqiue key
  const dispatchSizeChange = () => {
    const { event, uniqueKey, hasInitial } = props
    // NOTE: 一个组件要定义的事件名称也是由父组件来决定, 世界名称通过 props 传递过来
    emit(event, uniqueKey, getCurrentSize(), hasInitial)
  }

  // NOTE: 在 vue3 中 如何使用 ResizeObserver()? 主要是对容器元素(container)进行observe
  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        dispatchSizeChange()
      })
      rootRef.value && resizeObserver.observe(rootRef.value)
    }
  })

  // TIPS: how to use ResizeObserver to  observe an container hight ?on onUpdated hooks to retieve  container height a
  onUpdated(() => {
    dispatchSizeChange()
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  })
}

export const Item = defineComponent({
  name: 'VirtualListItem',
  props: ItemProps,
  emits: ['itemResize'], //  外部监听是itemResize
  setup(props, { emit }) {
    // TIPS: 如何在setup 的 渲染函数中 获取 ref?
    const rootRef = ref<HTMLElement | null>(null)
    // TIPS: 在 defineComponent() 中把生命周期和事件处理程序抽留出去?
    useResizeChange(props, rootRef, emit)

    return () => {
      // 在 setup 的渲染函数中 解构 props, 不是 setup 中进行解构
      const { tag: Tag, component: Comp, extraProps = {}, index, source, scopedSlots = {}, uniqueKey } = props
      const mergedProps = {
        ...extraProps,
        source,
        index,
      }
      // 在 render 函数中返回 tsx
      // 如何在 render函数中 tsx 中使用作用越插槽: scopedSlots
      return (
        <Tag key={uniqueKey} ref={rootRef} data-index={index}>
          <Comp {...mergedProps} scopedSlots={scopedSlots} />
        </Tag>
      )
    }
  },
})

// TIPS: 如何使用defineComponent 定义一个 Slot 组件?
export const Slot = defineComponent({
  name: 'VirtualListSlot',
  props: SlotProps,
  emits: ['slotResize'],
  setup(props, { slots, emit }) {
    const rootRef = ref<HTMLElement | null>(null)
    // TIPS: 在 defineComponent() 中把生命周期和事件处理程序抽留出去?
    useResizeChange(props, rootRef, emit)

    return () => {
      const { tag: Tag, uniqueKey } = props

      return (
        <Tag ref={rootRef} key={uniqueKey}>
          {slots.default?.()}
        </Tag>
      )
    }
  },
})
