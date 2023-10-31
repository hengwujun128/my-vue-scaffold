<template>
  <div class="images-item">
    <div class="images-card">
      <img v-lazy="{ src: props.source.urls.small_s3, id: props.index }" class="images-card__image" />
    </div>
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
  .images-item {
    animation-duration: 1s;
    animation-fill-mode: both;
    animation-name: fadeInUp;
    margin-bottom: 10px;
  }
  .images-card {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .images-card__image {
    width: 100%;
    height: 100%;
    object-fit: contain; // contain | cover
  }

  // 对每个 item 运用 animation

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10%) scale(0.6);
    }

    to {
      opacity: 1;
      transform: translateY(0%) scale(1);
    }
  }
</style>
