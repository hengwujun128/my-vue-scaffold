import { PropType, VueElement } from 'vue'

export const MapListProps = {
  dataKey: {
    type: [String, Function],
    required: true,
  },
  dataSources: {
    type: Array,
    required: true,
    default: () => [],
  },
  // NOTE: use props property to pass child component
  dataComponent: {
    type: [Object, Function],
    // type: VueElement,
    required: true,
  },

  wrapTag: {
    type: String,
    default: 'div',
  },
  // TIPS: wrapper class
  wrapClass: {
    type: String,
    default: 'list-wrap',
  },
  // TIPS: wrapper style
  wrapStyle: {
    type: Object,
  },
  itemTag: {
    type: String,
    default: 'div',
  },
}

export const ItemProps = {
  index: {
    type: Number,
  },
  source: {
    type: Object,
  },
  tag: {
    type: String,
  },
  component: {
    type: [Object, Function],
    // type: VueElement
  },
  uniqueKey: {
    type: [String, Number],
  },
  scopedSlots: {
    type: Object,
  },
}
