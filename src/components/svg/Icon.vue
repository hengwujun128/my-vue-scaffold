<template>
  <i class="icon" :style="{ color: color, fontSize: size + 'px' }">
    <svg aria-hidden="true">
      <use :xlink:href="symbolId"></use>
    </svg>
  </i>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps({
    prefix: {
      type: String,
      default: 'icon',
    }, // icon name
    iconName: {
      type: String,
      required: true,
    }, // icon color
    color: {
      type: String,
      default: '#000',
    }, // icon size
    size: {
      type: Number,
      default: 16,
    },
  })

  const symbolId = computed(() => `#${props.prefix}-${props.iconName}`)
</script>

<style lang="scss" scoped>
  .icon {
    height: 1em;
    width: 1em;
    line-height: 1em;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    fill: currentColor;
    font-size: inherit;

    //
    overflow: hidden;
  }
</style>
