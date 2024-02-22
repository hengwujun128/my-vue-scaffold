import type { DirectiveBinding, ObjectDirective, App } from 'vue'
import defaultLogo from '../assets/vue.svg'

let callNumber = 0

const getObserver = (el: any, id: number) => {
  const options = {
    root: null,
    threshold: 0,
  }
  const IOInstance = new IntersectionObserver((entries) => {
    const realSrc = el.dataset.src

    // console.log({ isIntersecting: entries[0].isIntersecting, intersectionRatio: entries[0].intersectionRatio, id: id })
    //NOTE: unobserve method must be followed the expression el.src=realSrc
    if (entries[0].isIntersecting && realSrc) {
      el.src = realSrc
      IOInstance.unobserve(entries[0].target)
    }
  }, options)
  el.$io = IOInstance
  return IOInstance
}

// custom directive
const vLazy: ObjectDirective<HTMLElement, number> = {
  //Directive Hooks

  // called right before the element is inserted into the DOM.
  beforeMount(el, binding: DirectiveBinding) {
    callNumber++
    // 先把realSrc 赋值给data-src; 把 src 设置默认图片
    el.setAttribute('data-src', binding.value.src)
    el.setAttribute('src', defaultLogo)
  },
  // called when the bound element's parent component
  // and all its children are mounted.
  mounted(el, binding: DirectiveBinding) {
    console.log('directive called number:', callNumber)
    if (IntersectionObserver) {
      const IOInstance = getObserver(el, binding.value.id)
      IOInstance.observe(el)
    }
  },

  // called when the parent component is unmounted
  unmounted(el) {
    IntersectionObserver && el.$io.disconnect()
  },
}

export const setLazyDirective = (app: App) => {
  app.directive('lazy', vLazy)
}

export default vLazy
