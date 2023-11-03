<script lang="ts" setup>
  import { computed } from 'vue'

  const props = defineProps({
    details: {
      type: Object,
      default: () => {},
    },
  })

  const source = computed(() => {
    return props.details.urls.small_s3
  })

  function handleClick(details: any) {
    window.open(details.urls.regular)
  }
</script>

<template>
  <div class="product-card" @click="handleClick(details)">
    <div class="cover">
      <img :src="source" alt="" srcset="" />
    </div>
    <div class="info">
      <h2>{{ details.user.username }}</h2>
      <div class="bottom">
        <h3>$ {{ details.user.first_name }}</h3>
        <h4>{{ details.user.last_name }}</h4>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .product-card {
    height: 120px;
    display: flex;
    padding: 10px;
    background-color: #ffffff;
    cursor: pointer;
  }

  .cover {
    flex: none;
    width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #f2f2f2;
  }

  .cover img {
    display: block;
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  .info {
    height: 100px;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    /* justify-content: space-between; */
  }

  .info h2 {
    font-size: 16px;
    color: #333333;
    line-height: 1.4;

    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .info h3 {
    color: red;
  }

  .info h4 {
    font-size: 14px;
    color: #666666;
  }

  .info .bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
</style>
