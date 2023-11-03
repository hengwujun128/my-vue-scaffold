<template>
  <div class="item-inner">
    <div class="head">
      <span class="index"># {{ props.index }}- {{ source.id }}</span>
      <span class="name">{{ source.user.name }}</span>
    </div>
    <div class="desc">{{ source.alt_description }}</div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    index: {
      type: Number,
      default: 0,
    },
    source: {
      // here is: {uid: 'unique_1', text: 'abc'}
      type: Object,
      default() {
        return {}
      },
    },
  })
</script>

<style lang="scss" scoped>
  .item-inner {
    height: 100px;
    padding: 10px;
    border-bottom: 1px solid #ddd;
    .head {
      font-weight: 500;
      text-align: left;
    }
    .index {
      margin-right: 1em;
    }
    .name {
      margin-left: 1em;
    }
    .desc {
      padding-top: 0.5em;
      text-align: justify;
    }
  }
</style>
