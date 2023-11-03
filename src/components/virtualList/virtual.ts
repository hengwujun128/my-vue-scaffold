/**
 * virtual list core calculating center
 * 中心思想: virtual list 是根据 索引去找数据, 根据 scrollbar 滚动的距离, 计算出来对应的数据源的索引, 开始索引, 结束索引
 *
 * 如何根据索引获取索引对应的offset? 即每条item 数据, 都有自己的索引, 也都有自己的在offset
 * 如果 item 高度固定, 就直接简单得获取 对应的 offset : itemSize * index
 * 如果 item 高度不固定, 就需要在 item mounted 钩子中,获取这个 item 的物理高度,然后保存到 map 中, 在通过累加的方式获取到 当前 item 的索引
 *
 * range 和 buffer 关系? 因为滚动是在一个 range 中滚动,即使加载了数据,也会在一个 range 中滚动,如
 * 初始化,range.start=0, buffer=10, 向下滚动,滚动条滚动的距离 对应的索引为 overs= this.getScrollOvers()
 * 滚动到容器的三分之一, 什么都不做: if (overs < this.range.start + this.param.buffer)
 * 滚动到超过三分之一,则 this.checkRange(overs, this.getEndByStart(overs)); 把overs 作为range 的 start索引,
 * 根据 keeps的长度 计算出 theoryEnd 索引  theoryEnd = start+ keeps -1 (因为长度是 30, 所以,索引要-1)
 * realEnd  = Math.min(theoryEnd, this.getLastIndex()) 29
 * checkRange(): 触发三个时机: 初始化, 向前滚动,向后滚动,且滚动位置超过range 的三分之一处开始
 *
 *
 *
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
    this.sizes = new Map() // store items' size
    this.firstRangeTotalSize = 0
    this.firstRangeAverageSize = 0
    this.lastCalcIndex = 0 // NOTE:
    this.fixedSizeValue = 0
    this.calcType = CALC_TYPE.INIT

    // scroll data
    this.offset = 0 // NOTE:保存每次 container 滚动的值,在下次滚动的时候进行比较
    this.direction = '' // 依赖 this.offset

    // range data
    this.range = Object.create(null)
    if (param) {
      // 初始化时候,也要进行 checkRange
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

  // 数据源发生变化后会调用
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
    // console.log('saving size', { id, size })
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
    console.log('this.isFront()', this.isFront())
    if (this.isFront()) {
      start = start - LEADING_BUFFER
    } else if (this.isBehind()) {
      start = start + LEADING_BUFFER
    }

    start = Math.max(start, 0)
    // 基于 start 更新this.range.start
    this.updateRange(this.range.start, this.getEndByStart(start))
  }

  // when slot size change, we also need force update
  handleSlotSizeChange() {
    this.handleDataSourcesChange()
  }

  // calculating range on scroll
  // 滚动逻辑处理:offset 是 scrollTop, checkRange, updateRange 的过程
  handleScroll(offset) {
    // TIPS: 如何判断滚动的方向? 保存滚动的 offset 值,并每次比较
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

  // 向前滚动的逻辑: 查找滚动条位置对应的 items 索引值
  handleFront() {
    const overs = this.getScrollOvers() // overs 的索引值
    // should not change range if start doesn't exceed overs
    // NOTE:如果 overs 存在 这个 range 中,还没有超过 range.start 范围,如[5,55],什么都不做
    console.log('向上滚动', { overs, range: this.range, buffer: this.param.buffer })

    if (overs > this.range.start) {
      return
    }
    //NOTE: 如果向前滚动时候,滚动条超过了 range.start,exceeds [5,55], 要重新设置 range.start
    // move up start by a buffer length, and make sure its safety
    const start = Math.max(overs - this.param.buffer, 0) // start = overs - buffer
    this.checkRange(start, this.getEndByStart(start))
  }

  // NOTE: 向下滚动逻辑: 加入缓冲区逻辑,缓冲区初始化为10个 dom 节点数; Math.round(props.keeps / 3),
  // 只有滚动过的索引 超过缓冲区,才进行 checkRange,否则就不处理
  handleBehind() {
    const overs = this.getScrollOvers()
    console.log('向下滚动', { overs, range: this.range, buffer: this.param.buffer })
    // range should not change if scroll overs within buffer
    // 滚动条的位置索引, 在缓冲区中,不处理
    if (overs < this.range.start + this.param.buffer) {
      return
    }
    this.checkRange(overs, this.getEndByStart(overs))
  }

  // return the pass overs according to current scroll offset
  // 二分查找算法,根据 scrollOffset去查找, 时间复杂度为 对数阶(log2N)
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
    // 遍历每一条 item 数据,
    while (low <= high) {
      // this.__bsearchCalls++
      middle = low + Math.floor((high - low) / 2) // 中间元素索引
      middleOffset = this.getIndexOffset(middle) // 中间元素索引对应的offset
      // 拿 中间元素的索引 offset 和 offset(container 的 scrollTop 的值) 比较,
      if (middleOffset === offset) {
        return middle
      } else if (middleOffset < offset) {
        low = middle + 1
      } else if (middleOffset > offset) {
        high = middle - 1
      }
    }

    return low > 0 ? --low : 0 // WHY?
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
    // 初始化时this.lastCalcIndex=0,
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

  // in some conditions range is broke, we need correct it and then decide whether need to update to next range
  //TIPS: checkRange(start,end)算法,依赖,start,end,keeps, total
  // 准则: 围绕渲染固定(keeps) doms 这个基本原则,去更新 start 和 end
  checkRange(start, end) {
    const keeps = this.param.keeps // 视口默认展示 30 条数据,就是 默认渲染 30 条 dom 节点
    const total = this.param.uniqueIds.length // 总数据条数
    console.log('---checkRange---', { start, end, keeps, total, range: this.range })

    // data less than keeps, render all
    if (total <= keeps) {
      console.log('----total <= keeps重置start=0----')
      start = 0
      end = this.getLastIndex()
    } else if (end - start < keeps - 1) {
      console.log('----重置start = end - keeps + 1----')
      // 如果计算出要渲染的数据范围 小于 30 条, 理论上: 29-0 = 30-1 ,即 end - start = keeps-1
      // if range length is less than keeps, correct it base on end
      start = end - keeps + 1
    }
    // 如果旧的索引 和 新的索引不同, 就去更新updateRange
    // TIPS: this.range.start 一般是固定的, start 会发生变化,向下滚动的时候, 滚动条位置索引overs超过 this.range.start+ buffer 时候会触发
    if (this.range.start !== start) {
      console.log('----------this.range.start !== start----------')
      this.updateRange(start, end)
    }
  }

  // setting to a new range and rerender
  // range 主要计算 content size: range + padding
  updateRange(start, end) {
    this.range.start = start
    this.range.end = end
    // paddingTop of container based on start
    this.range.padFront = this.getPadFront()
    // paddingBottom of container based on end
    this.range.padBehind = this.getPadBehind()
    // 获取新的 range,包括两个缓冲区
    this.callUpdate(this.getRange())
  }

  // return end base on start ,keeps
  getEndByStart(start) {
    const theoryEnd = start + this.param.keeps - 1 // 理论上 end 的索引
    const truelyEnd = Math.min(theoryEnd, this.getLastIndex()) // 真正的 end 索引,还要考虑 最后一条数据的索引
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
