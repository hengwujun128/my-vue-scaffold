<template>
  <div class="scrollLoader">
    <div class="images-wrapper">
      <div v-for="(image, index) of images" :key="image.id" class="images-item">
        <div class="images-card">
          <img v-lazy="{ src: image.urls.small_s3, id: index }" class="images-card__image" />
          <!-- <img v-lazy="{ src: image.urls.small, id: index }" class="images-card__image" /> -->
        </div>
      </div>
    </div>
    <LoadMore :loader-method="getCats" :loader-disable="disabledLoadMore"></LoadMore>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref } from 'vue'
  import 'whatwg-fetch'
  import { createApi } from 'unsplash-js'

  import LoadMore from '@/components/LoadMore.vue'
  import { getImages } from '@/api/modules/test.ts'

  const images: Ref = ref([])
  const disabledLoadMore: Ref = ref(false)

  const pageNumber: Ref = ref(0)
  const pageSize: Ref = ref(10)

  // in the browser
  const Api = createApi({
    accessKey: 'R8u67PrD85zedWNl3SK82Na8FXoaMOqHHNnYT36sWnw',
    headers: { 'X-Custom-Header': 'foo' },
    // fetch: window.fetch,
    //...other fetch options
  })

  /**
   * @desc
   * {@link https://unsplash.com/}
   * {@link https://unsplash.com/documentation}
   */
  const getCats = async () => {
    pageNumber.value++
    const res = await Api.search.getPhotos({
      query: 'cat',
      page: pageNumber.value,
      perPage: pageSize.value,
      orderBy: 'latest',
    })
    if (res.status == 200 && res.response) {
      images.value = [...images.value, ...res.response.results]
      if (images.value.length > res.response.total) disabledLoadMore.value = true
    }
  }

  // FIXME: Property 'images' does not exist on type 'AxiosResponse<any, any>'.ts(2339)
  const getImageList = async () => {
    const res = await getImages()
    if (res.images) {
      images.value = [...images.value, ...res.images]
    }
    console.log({
      images: images.value,
    })
  }
</script>

<style scoped lang="scss">
  .scrollLoader {
    .images-wrapper {
      max-width: 1280px; // can removed here
      padding-bottom: 30px;
      margin: 0 auto;
      display: grid;

      grid-template-columns: repeat(3, minmax(min(200px, 100%), 1fr));
      gap: 20px;
    }

    .images-item {
      animation-duration: 1s;
      animation-fill-mode: both;
      animation-name: fadeInUp;
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
      object-fit: cover; // contain
    }
    .images-card__mask {
      position: absolute;
      z-index: 9;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.8;
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
  }
</style>
