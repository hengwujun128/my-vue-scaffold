<template>
  <div class="item">
    <div class="item-left"></div>
    <div class="item-right">
      <span class="title">{{ source.title }}</span>
      <p>{{ source.address }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const activeIcon = ref('checkbox_selected')
  const inactiveIcon = ref('checkbox_default')
  const props = defineProps({
    index: {
      type: Number,
      default: 0,
    },
    source: {
      type: Object,
      default() {
        return {}
      },
    },
  })
</script>

<style lang="less" scoped>
  .item {
    &-left {
    }
    &-right {
    }
  }
</style>
