/**
 * props declaration for default, item and slot component
 */

import { PropType } from 'vue'

export const VirtualProps = {
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
    required: true,
  },

  // TIPS: 视口展示 30 条
  keeps: {
    type: Number,
    default: 30,
  },
  extraProps: {
    type: Object,
  },
  // TIPS: 预估高度
  estimateSize: {
    type: Number,
    default: 50,
  },

  direction: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'vertical', // the other value is horizontal
  },
  start: {
    type: Number,
    default: 0,
  },
  offset: {
    type: Number,
    default: 0,
  },
  topThreshold: {
    type: Number,
    default: 0,
  },
  bottomThreshold: {
    type: Number,
    default: 0,
  },
  pageMode: {
    type: Boolean,
    default: false,
  },
  rootTag: {
    type: String,
    default: 'div',
  },
  wrapTag: {
    type: String,
    default: 'div',
  },
  // TIPS: wrapper class
  wrapClass: {
    type: String,
    default: 'wrap',
  },
  // TIPS: wrapper style
  wrapStyle: {
    type: Object,
  },
  //
  itemTag: {
    type: String,
    default: 'div',
  },
  itemClass: {
    type: String,
    default: '',
  },
  itemClassAdd: {
    type: Function,
  },
  itemStyle: {
    type: Object,
  },
  headerTag: {
    type: String,
    default: 'div',
  },
  headerClass: {
    type: String,
    default: '',
  },
  headerStyle: {
    type: Object,
  },
  footerTag: {
    type: String,
    default: 'div',
  },
  footerClass: {
    type: String,
    default: '',
  },
  footerStyle: {
    type: Object,
  },
  itemScopedSlots: {
    type: Object,
  },
}
// class and styles should be achieved by slots

export const ItemProps = {
  index: {
    type: Number,
  },
  event: {
    type: String,
  },
  tag: {
    type: String,
  },
  horizontal: {
    type: Boolean,
  },
  source: {
    type: Object,
  },
  component: {
    type: [Object, Function],
  },
  uniqueKey: {
    type: [String, Number],
  },
  extraProps: {
    type: Object,
  },
  scopedSlots: {
    type: Object,
  },
}

export const SlotProps = {
  event: {
    type: String,
  },
  uniqueKey: {
    type: String,
  },
  tag: {
    type: String,
  },
  horizontal: {
    type: Boolean,
  },
}
