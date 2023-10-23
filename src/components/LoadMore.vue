<template>
  <div v-show="!props.loaderDisable" ref="loadMoreRef" class="loader">
    <slot>
      <svg viewBox="25 25 50 50" class="loader__svg" :style="size">
        <circle cx="50" cy="50" r="20" class="loader__circle" :style="color"></circle>
      </svg>
    </slot>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref, computed, onMounted, onActivated, onDeactivated, onBeforeUnmount } from 'vue'

  const loadMoreRef: Ref = ref(null)

  const props = defineProps({
    loaderMethod: {
      type: Function,
      required: true,
    },
    /* scroll-loader will be disabled if the value of this props is true. */
    loaderDisable: {
      type: Boolean,
      required: false,
    },
    /* The minimum distance between the scroll-loader(scrollbar) and the bottom of the viewport before the loader-method method is executed. */
    loaderDistance: {
      type: Number,
      default: 0,
    },
    /* scroll-loader the color of the animation. */
    loaderColor: {
      type: String,
      default: '#cccccc',
    },
    /* scroll-loader the size of the animation. */
    loaderSize: {
      type: Number,
      default: 50,
    },
    /* relative viewport element,default top-level document viewport. */
    loaderViewport: {
      type: Element,
      default: null,
    },
  })

  const size = computed(() => {
    return {
      width: `${props.loaderSize}px`,
    }
  })

  const color = computed(() => {
    return {
      stroke: props.loaderColor,
    }
  })

  //
  const options = computed(() => {
    return {
      root: props.loaderViewport,
      rootMargin: `0px 0px ${props.loaderDistance}px 0px`,
    }
  })

  /* observer instance */
  const observer = computed(() => {
    return new IntersectionObserver(([{ isIntersecting }]) => {
      isIntersecting && !props.loaderDisable && props.loaderMethod()
    }, options.value)
  })

  onMounted(() => {
    console.log('loadMoreRef.value', loadMoreRef.value)
    observer.value.observe(loadMoreRef.value)
  })

  onActivated(() => {
    observer.value.observe(loadMoreRef.value)
  })
  onDeactivated(() => {
    observer.value.unobserve(loadMoreRef.value)
  })

  onBeforeUnmount(() => {
    observer.value.unobserve(loadMoreRef.value)
  })

  //
</script>

<style lang="scss" scoped>
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    &__svg {
      transform-origin: center;
      animation: rotate 2s linear infinite;
    }
    &__circle {
      fill: none;
      stroke-width: 3;
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
  }
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 200;
      stroke-dashoffset: -35px;
    }
    100% {
      stroke-dashoffset: -125px;
    }
  }
</style>
