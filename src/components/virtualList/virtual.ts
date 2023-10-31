/**
 * virtual list core calculating center
 */
// @ts-nocheck

const DIRECTION_TYPE = {
  FRONT: 'FRONT', // scroll up or left
  BEHIND: 'BEHIND', // scroll down or right
}
const CALC_TYPE = {
  INIT: 'INIT',
  FIXED: 'FIXED',
  DYNAMIC: 'DYNAMIC',
}
const LEADING_BUFFER = 2

export default class Virtual {
  constructor(param, callUpdate) {
    this.init(param, callUpdate)
  }

  init(param, callUpdate) {
    // param data
    this.param = param
    this.callUpdate = callUpdate

    // size data
    this.sizes = new Map()
    this.firstRangeTotalSize = 0
    this.firstRangeAverageSize = 0
    this.lastCalcIndex = 0
    this.fixedSizeValue = 0
    this.calcType = CALC_TYPE.INIT

    // scroll data
    this.offset = 0
    this.direction = ''

    // range data
    this.range = Object.create(null)
    if (param) {
      this.checkRange(0, param.keeps - 1)
    }

    // benchmark test data
    // this.__bsearchCalls = 0
    // this.__getIndexOffsetCalls = 0
  }

  destroy() {
    this.init(null, null)
  }

  // return current render range
  getRange() {
    const range = Object.create(null)
    range.start = this.range.start
    range.end = this.range.end
    range.padFront = this.range.padFront
    range.padBehind = this.range.padBehind
    return range
  }

  isBehind() {
    return this.direction === DIRECTION_TYPE.BEHIND
  }

  isFront() {
    return this.direction === DIRECTION_TYPE.FRONT
  }

  // return start index offset
  getOffset(start) {
    return (start < 1 ? 0 : this.getIndexOffset(start)) + this.param.slotHeaderSize
  }

  updateParam(key, value) {
    if (this.param && key in this.param) {
      // if uniqueIds change, find out deleted id and remove from size map
      if (key === 'uniqueIds') {
        this.sizes.forEach((v, key) => {
          if (!value.includes(key)) {
            this.sizes.delete(key)
          }
        })
      }
      this.param[key] = value
    }
  }

  // save each size map by id
  saveSize(id, size) {
    this.sizes.set(id, size)

    // we assume size type is fixed at the beginning and remember first size value
    // if there is no size value different from this at next comming saving
    // we think it's a fixed size list, otherwise is dynamic size list
    if (this.calcType === CALC_TYPE.INIT) {
      this.fixedSizeValue = size
      this.calcType = CALC_TYPE.FIXED
    } else if (this.calcType === CALC_TYPE.FIXED && this.fixedSizeValue !== size) {
      this.calcType = CALC_TYPE.DYNAMIC
      // it's no use at all
      delete this.fixedSizeValue
    }

    // calculate the average size only in the first range
    if (this.calcType !== CALC_TYPE.FIXED && typeof this.firstRangeTotalSize !== 'undefined') {
      if (this.sizes.size < Math.min(this.param.keeps, this.param.uniqueIds.length)) {
        this.firstRangeTotalSize = [...this.sizes.values()].reduce((acc, val) => acc + val, 0)
        this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size)
      } else {
        // it's done using
        delete this.firstRangeTotalSize
      }
    }
  }

  // in some special situation (e.g. length change) we need to update in a row
  // try goiong to render next range by a leading buffer according to current direction
  handleDataSourcesChange() {
    let start = this.range.start

    if (this.isFront()) {
      start = start - LEADING_BUFFER
    } else if (this.isBehind()) {
      start = start + LEADING_BUFFER
    }

    start = Math.max(start, 0)

    this.updateRange(this.range.start, this.getEndByStart(start))
  }

  // when slot size change, we also need force update
  handleSlotSizeChange() {
    this.handleDataSourcesChange()
  }

  // calculating range on scroll
  handleScroll(offset) {
    this.direction = offset < this.offset ? DIRECTION_TYPE.FRONT : DIRECTION_TYPE.BEHIND
    this.offset = offset

    if (!this.param) {
      return
    }

    if (this.direction === DIRECTION_TYPE.FRONT) {
      this.handleFront()
    } else if (this.direction === DIRECTION_TYPE.BEHIND) {
      this.handleBehind()
    }
  }

  // ----------- public method end -----------

  handleFront() {
    const overs = this.getScrollOvers()
    // should not change range if start doesn't exceed overs
    if (overs > this.range.start) {
      return
    }

    // move up start by a buffer length, and make sure its safety
    const start = Math.max(overs - this.param.buffer, 0)
    this.checkRange(start, this.getEndByStart(start))
  }

  handleBehind() {
    const overs = this.getScrollOvers()
    // range should not change if scroll overs within buffer
    if (overs < this.range.start + this.param.buffer) {
      return
    }

    this.checkRange(overs, this.getEndByStart(overs))
  }

  // return the pass overs according to current scroll offset
  getScrollOvers() {
    // if slot header exist, we need subtract its size
    const offset = this.offset - this.param.slotHeaderSize
    if (offset <= 0) {
      return 0
    }

    // if is fixed type, that can be easily
    if (this.isFixedType()) {
      return Math.floor(offset / this.fixedSizeValue)
    }

    let low = 0
    let middle = 0
    let middleOffset = 0
    let high = this.param.uniqueIds.length

    while (low <= high) {
      // this.__bsearchCalls++
      middle = low + Math.floor((high - low) / 2)
      middleOffset = this.getIndexOffset(middle)

      if (middleOffset === offset) {
        return middle
      } else if (middleOffset < offset) {
        low = middle + 1
      } else if (middleOffset > offset) {
        high = middle - 1
      }
    }

    return low > 0 ? --low : 0
  }

  // return a scroll offset from given index, can efficiency be improved more here?
  // although the call frequency is very high, its only a superposition of numbers
  getIndexOffset(givenIndex) {
    if (!givenIndex) {
      return 0
    }

    let offset = 0
    let indexSize = 0
    // 因为是根据索引去获取 offset, 所以就是从开始遍历到当前的索引值, 比如当前视口第一个元素的索引值为 30, 则要计算出 30 对应的偏移量
    for (let index = 0; index < givenIndex; index++) {
      // this.__getIndexOffsetCalls++
      // 根据当前item数据索引,获取当前item 数据的 id; 根据当前数据 item 的 id, 获取当前数据 item 对应的高度indexSize
      indexSize = this.sizes.get(this.param.uniqueIds[index])
      // 通过累加方式获取
      offset = offset + (typeof indexSize === 'number' ? indexSize : this.getEstimateSize())
    }

    // remember last calculate index
    this.lastCalcIndex = Math.max(this.lastCalcIndex, givenIndex - 1)
    this.lastCalcIndex = Math.min(this.lastCalcIndex, this.getLastIndex())

    return offset
  }

  // is fixed size type
  isFixedType() {
    return this.calcType === CALC_TYPE.FIXED
  }

  // return the real last index
  getLastIndex() {
    return this.param.uniqueIds.length - 1
  }

  // in some conditions range is broke, we need correct it
  // and then decide whether need update to next range
  checkRange(start, end) {
    const keeps = this.param.keeps // 视口默认展示 30 条数据,就是 默认渲染 30 条 dom 节点
    const total = this.param.uniqueIds.length // 总数据条数

    // datas less than keeps, render all
    if (total <= keeps) {
      start = 0
      end = this.getLastIndex()
    } else if (end - start < keeps - 1) {
      // 如果计算出要渲染的数据范围 小于 30 条, 理论上: 29-0 = 30-1 ,即 end - start = keeps-1
      // if range length is less than keeps, correct it base on end
      start = end - keeps + 1
    }
    // 理论索引start: this.range.start 和 实际索引不同
    if (this.range.start !== start) {
      this.updateRange(start, end)
    }
  }

  // setting to a new range and rerender
  updateRange(start, end) {
    this.range.start = start
    this.range.end = end
    // 前置缓冲区
    this.range.padFront = this.getPadFront()
    // 后置缓冲区
    this.range.padBehind = this.getPadBehind()
    // 获取新的 range,包括两个缓冲区
    this.callUpdate(this.getRange())
  }

  // return end base on start
  getEndByStart(start) {
    const theoryEnd = start + this.param.keeps - 1
    const truelyEnd = Math.min(theoryEnd, this.getLastIndex())
    return truelyEnd
  }

  // return total front offset
  getPadFront() {
    // 如果是item 是固定高度
    if (this.isFixedType()) {
      return this.fixedSizeValue * this.range.start
    } else {
      // 如果item 不是固定高度
      return this.getIndexOffset(this.range.start)
    }
  }

  // return total behind offset
  getPadBehind() {
    const end = this.range.end
    const lastIndex = this.getLastIndex()

    if (this.isFixedType()) {
      return (lastIndex - end) * this.fixedSizeValue
    }

    // if it's all calculated, return the exactly offset
    if (this.lastCalcIndex === lastIndex) {
      return this.getIndexOffset(lastIndex) - this.getIndexOffset(end)
    } else {
      // if not, use a estimated value
      return (lastIndex - end) * this.getEstimateSize()
    }
  }

  // get the item estimate size
  getEstimateSize() {
    return this.isFixedType() ? this.fixedSizeValue : this.firstRangeAverageSize || this.param.estimateSize
  }
}
