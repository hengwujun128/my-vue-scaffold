import { defineComponent, ref } from 'vue'
import { ItemProps } from './props'

export const Item = defineComponent({
  name: 'ListItem',
  props: ItemProps,
  setup: (props, { emit }) => {
    const rootRef = ref<HTMLElement | null>(null)

    return () => {
      const { component: Comp, index, uniqueKey, source, scopedSlots = {}, tag: Tag } = props
      const mergedProps = {
        source,
        index,
      }

      return (
        <Tag key={uniqueKey} ref={rootRef} data-index={index}>
          <Comp {...mergedProps} scopedSlots={scopedSlots}></Comp>
        </Tag>
      )
    }
  },
})
