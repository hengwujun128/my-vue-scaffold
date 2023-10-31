/**
 * 如何定义函数式组件?defineComponent? setup  返回一个函数, 函数在返回
 * 如何对函数式组件的 props 进行分离?
 * 组合式 API:setup():执行 setup 时，组件实例尚未被创建,你将无法访问以下组件选项：data,computed,methods
 * setup()返回值: 返回一个对象 ,给模版使用; 返回渲染函数
 * h: 渲染函数 API,创建虚拟 DOM 节点 (vnode)
 */

// @ts-nocheck
import { defineComponent, onActivated, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import Virtual from './virtual'
import { Item, Slot } from './item'
import { VirtualProps } from './props'

enum EVENT_TYPE {
  ITEM = 'itemResize',
  SLOT = 'slotResize',
}

enum SLOT_TYPE {
  HEADER = 'thead', // string value also use for aria role attribute
  FOOTER = 'tfoot',
}

interface Range {
  start: number
  end: number
  padFront: number
  padBehind: number
}

// const emits = defineEmits(['scroll', 'totop', 'tobottom', 'resized'])

export default defineComponent({
  name: 'VirtualList',
  props: VirtualProps, // 响应式的
  emits: ['scroll', 'totop', 'tobottom', 'resized'],
  // data(){return{}}
  // methods:{}

  setup(props, { emit, slots, expose }) {
    const isHorizontal = props.direction === 'horizontal'
    const directionKey = isHorizontal ? 'scrollLeft' : 'scrollTop'

    const range = ref<Range | null>(null)
    const root = ref<HTMLElement | null>()
    const shepherd = ref<HTMLDivElement | null>(null)
    let virtual: Virtual

    /**
     * watch
     */
    watch(
      () => props.dataSources.length,
      () => {
        virtual.updateParam('uniqueIds', getUniqueIdFromDataSources())
        virtual.handleDataSourcesChange()
      },
    )
    watch(
      () => props.keeps,
      (newValue) => {
        virtual.updateParam('keeps', newValue)
        virtual.handleSlotSizeChange()
      },
    )
    watch(
      () => props.start,
      (newValue) => {
        console.log('props.start 发生改变')
        scrollToIndex(newValue)
      },
    )
    watch(
      () => props.offset,
      (newValue) => {
        console.log('props.offset 发生改变')
        return scrollToOffset(newValue)
      },
    )

    /**
     * methods
     */
    // get item size by id
    const getSize = (id) => {
      return virtual.sizes.get(id)
    }

    // 获取container滚动条的位置
    const getOffset = () => {
      if (props.pageMode) {
        return document.documentElement[directionKey] || document.body[directionKey]
      } else {
        return root.value ? Math.ceil(root.value[directionKey]) : 0
      }
    }

    // 获取container容器大小; return client viewport size
    const getClientSize = () => {
      const key = isHorizontal ? 'clientWidth' : 'clientHeight'
      if (props.pageMode) {
        return document.documentElement[key] || document.body[key]
      } else {
        return root.value ? Math.ceil(root.value[key]) : 0
      }
    }

    // 获取实际content大小(content 的高度和宽度);  return all scroll size
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled}
     */
    const getScrollSize = () => {
      const key = isHorizontal ? 'scrollWidth' : 'scrollHeight'
      if (props.pageMode) {
        return document.documentElement[key] || document.body[key]
      } else {
        return root.value ? Math.ceil(root.value[key]) : 0
      }
    }

    // 向外发射事件: 在 scroll  event 时候向外发射
    const emitEvent = (offset, clientSize, scrollSize, evt) => {
      emit('scroll', evt, virtual.getRange())

      if (virtual.isFront() && !!props.dataSources.length && offset - props.topThreshold <= 0) {
        emit('totop')
      } else if (virtual.isBehind() && offset + clientSize + props.bottomThreshold >= scrollSize) {
        emit('tobottom')
      }
    }

    // 滚动事件处理程序; container 上添加
    const onScroll = (evt) => {
      const offset = getOffset() // 获取容器滚动条位置
      const clientSize = getClientSize() // 获取容器自身大小
      const scrollSize = getScrollSize() // 获取容器内容的大小

      // iOS scroll-spring-back behavior will make direction mistake
      // 是否 完全滚动 (Determine if an element has been totally scrolled)
      if (offset < 0 || offset + clientSize > scrollSize + 1 || !scrollSize) {
        return
      }
      // 处理滚动逻辑
      virtual.handleScroll(offset)
      // 向外发射滚动事件
      emitEvent(offset, clientSize, scrollSize, evt)
    }

    // 获取所有的 id, 返回 一个包括 id 的数组[12,13,14,...]
    const getUniqueIdFromDataSources = () => {
      const { dataKey, dataSources = [] } = props
      return dataSources.map((dataSource: any) =>
        typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey],
      )
    }

    // TODO:
    const onRangeChanged = (newRange: any) => {
      range.value = newRange
    }

    // TIPS:实例化 Virtual, 并获取 初始化的range
    const installVirtual = () => {
      virtual = new Virtual(
        {
          slotHeaderSize: 0,
          slotFooterSize: 0,
          keeps: props.keeps,
          estimateSize: props.estimateSize,
          buffer: Math.round(props.keeps / 3), // recommend for a third of keeps
          uniqueIds: getUniqueIdFromDataSources(),
        },
        onRangeChanged,
      )

      // sync initial range
      range.value = virtual.getRange()
    }

    // set current scroll position to a expectant index
    // 根据数据索引进行滚动; 根据数据索引获取 数据offset,然后在滚动到 offset
    const scrollToIndex = (index: number) => {
      // scroll to bottom
      if (index >= props.dataSources.length - 1) {
        scrollToBottom()
      } else {
        // NOTE: 根据数据的索引,能够获取数据的 offset 位置
        const offset = virtual.getOffset(index)
        scrollToOffset(offset)
      }
    }

    // set current scroll position to a expectant offset
    const scrollToOffset = (offset: number) => {
      if (props.pageMode) {
        document.body[directionKey] = offset
        document.documentElement[directionKey] = offset
      } else {
        if (root.value) {
          root.value[directionKey] = offset
        }
      }
    }
    // get the real render slots based on range data
    // in-place patch strategy will try to reuse components as possible
    // so those components that are reused will not trigger lifecycle mounted
    const getRenderSlots = () => {
      // TIPS: 如何把组件放到数组上
      const slots = []
      const { start, end } = range.value
      const { dataSources, dataKey, itemClass, itemTag, itemStyle, extraProps, dataComponent, itemScopedSlots } = props
      // 从 range 中取出 索引 和 索引对应的数据, 然后生成索引对应的 item 组件
      for (let index = start; index <= end; index++) {
        const dataSource = dataSources[index]
        if (dataSource) {
          const uniqueKey = typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey]
          if (typeof uniqueKey === 'string' || typeof uniqueKey === 'number') {
            // NOTE: 把组件放到数组中
            // TIPS: 如何 父组件的setup 的渲染函数中 监听子组件 onItemResize 事件
            slots.push(
              <Item
                index={index}
                tag={itemTag}
                // event: EVENT_TYPE.ITEM = itemResize,传递给子组件Item,子组件在 Mounted,updated 中进行触发
                event={EVENT_TYPE.ITEM}
                horizontal={isHorizontal}
                uniqueKey={uniqueKey}
                source={dataSource}
                extraProps={extraProps}
                component={dataComponent}
                scopedSlots={itemScopedSlots}
                style={itemStyle}
                class={`${itemClass}${props.itemClassAdd ? ' ' + props.itemClassAdd(index) : ''}`}
                // TIPS: 子组件emit 的是 itemResize event, 在 tsx父组件 中监听事件 :on+小驼峰写法
                onItemResize={onItemResized}
              />,
            )
          } else {
            console.warn(`Cannot get the data-key '${dataKey}' from data-sources.`)
          }
        } else {
          console.warn(`Cannot get the index '${index}' from data-sources.`)
        }
      }
      return slots
    }

    // event called when each item mounted or size changed
    const onItemResized = (id: string, size: number) => {
      virtual.saveSize(id, size)
      emit('resized', id, size)
    }

    // event called when slot mounted or size changed
    // NOTE:
    const onSlotResized = (type: SLOT_TYPE, size: number, hasInit: boolean) => {
      if (type === SLOT_TYPE.HEADER) {
        virtual.updateParam('slotHeaderSize', size)
      } else if (type === SLOT_TYPE.FOOTER) {
        virtual.updateParam('slotFooterSize', size)
      }

      if (hasInit) {
        virtual.handleSlotSizeChange()
      }
    }

    // set current scroll position to bottom
    const scrollToBottom = () => {
      if (shepherd.value) {
        const offset = shepherd.value[isHorizontal ? 'offsetLeft' : 'offsetTop']
        scrollToOffset(offset)

        // check if it's really scrolled to the bottom
        // maybe list doesn't render and calculate to last range
        // so we need retry in next event loop until it really at bottom
        setTimeout(() => {
          if (getOffset() + getClientSize() < getScrollSize()) {
            scrollToBottom()
          }
        }, 3)
      }
    }

    // when using page mode we need update slot header size manually
    // taking root offset relative to the browser as slot header size
    // TIPS: 获取 container 相对于视口的坐标:getBoundingClientRect()
    const updatePageModeFront = () => {
      if (root.value) {
        const rect = root.value.getBoundingClientRect()
        const { defaultView } = root.value.ownerDocument // 获取最外层 document 对象的 defaultView
        //The defaultView property returns the document's window object.
        const offsetFront = isHorizontal ? rect.left + defaultView!.pageXOffset : rect.top + defaultView!.pageYOffset
        // 容器的视口坐标位置 + window.pageYOffset =  容器的文档坐标
        virtual.updateParam('slotHeaderSize', offsetFront)
      }
    }

    // get the total number of stored (rendered) items
    const getSizes = () => {
      return virtual.sizes.size
    }

    /**
     * life cycles
     * @desc : 在组件 mounted 之前, 实例化 Virtual, 并设置 current render range
     */
    onBeforeMount(() => {
      installVirtual()
    })

    // set back offset when awake from keep-alive
    onActivated(() => {
      // Virtual 实例的 offset 始终保存在当前运行时
      scrollToOffset(virtual.offset)
    })

    // NOTE: mounted 挂载时候,就要进行滚动一次
    onMounted(() => {
      // set position:
      if (props.start) {
        scrollToIndex(props.start)
      } else if (props.offset) {
        scrollToOffset(props.offset)
      }

      // in page mode we bind scroll event to document
      if (props.pageMode) {
        updatePageModeFront()
        document.addEventListener('scroll', onScroll, {
          passive: false,
        })
      }
    })

    onUnmounted(() => {
      virtual.destroy()
      if (props.pageMode) {
        document.removeEventListener('scroll', onScroll)
      }
    })

    /**
     * public methods
     */
    expose({
      scrollToBottom,
      getSizes,
      getSize,
      getOffset,
      getScrollSize,
      getClientSize,
      scrollToOffset,
      scrollToIndex,
    })

    //
    return () => {
      const {
        pageMode,
        rootTag: RootTag,
        wrapTag: WrapTag,
        wrapClass,
        wrapStyle,
        headerTag,
        headerClass,
        headerStyle,
        footerTag,
        footerClass,
        footerStyle,
      } = props
      //TIPS: TS中的感叹号和问号的用法;1. 用在变量前取反,2.用在赋值的内容后,是 null,undefined 类型可以赋值给其他类型并通过编译

      const { padFront, padBehind } = range.value!
      const paddingStyle = {
        padding: isHorizontal ? `0px ${padBehind}px 0px ${padFront}px` : `${padFront}px 0px ${padBehind}px`,
      }
      // 设置 wrapperStyle
      const wrapperStyle = wrapStyle ? Object.assign({}, wrapStyle, paddingStyle) : paddingStyle
      //  获取 slots,从 setup 中获取
      const { header, footer } = slots
      // 返回 tsx
      return (
        // tsx 根节点,并添加onScroll 事件
        <RootTag ref={root} onScroll={!pageMode && onScroll}>
          {/* header slot: 先判断是否有设置 header ,如果有 */}
          {/*  TIPS: Slot 组件中 添加默认插槽 ,vue3 中tsx 插槽是个函数 */}
          {header && (
            <Slot
              class={headerClass}
              style={headerStyle}
              tag={headerTag}
              event={EVENT_TYPE.SLOT}
              uniqueKey={SLOT_TYPE.HEADER}
              onSlotResize={onSlotResized}
            >
              {/* vue3 中 具名slot 是个函数 */}
              {header()}
            </Slot>
          )}

          {/* main list */}
          <WrapTag class={wrapClass} style={wrapperStyle}>
            {getRenderSlots()}
          </WrapTag>
          {/* footer slot */}
          {footer && (
            <Slot
              class={footerClass}
              style={footerStyle}
              tag={footerTag}
              event={EVENT_TYPE.SLOT}
              uniqueKey={SLOT_TYPE.FOOTER}
              onSlotResize={onSlotResized}
            >
              {footer()}
            </Slot>
          )}
          {/* an empty element use to scroll to bottom */}
          <div
            ref={shepherd}
            style={{
              width: isHorizontal ? '0px' : '100%',
              height: isHorizontal ? '100%' : '0px',
            }}
          />
        </RootTag>
      )
    }
  },
})
