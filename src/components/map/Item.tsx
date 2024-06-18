import { defineComponent, ref, defineProps } from 'vue'
import { ItemProps } from './props'

export const Item = defineComponent({
  name: 'ListItem',
  props: ItemProps,
  setup: (props, { emit }) => {
    const rootRef = ref<HTMLElement | null>(null)

    return () => {
      const { index, uniqueKey, source, scopedSlots = {} } = props
      const mergedProps = {
        source,
        index,
      }

      // 强制类型转换
      const Tag = props.tag as any
      const Comp = props.component as any

      return (
        <Tag key={uniqueKey} ref={rootRef} data-index={index}>
          <Comp {...mergedProps} scopedSlots={scopedSlots}></Comp>
        </Tag>
      )
    }
  },
})
