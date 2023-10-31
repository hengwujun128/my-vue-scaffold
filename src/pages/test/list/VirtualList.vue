<template>
  <div class="scrollLoader">
    <VirtualList
      style="height: 600px; overflow-y: auto"
      class="list-infinite scroll-touch"
      :data-key="'id'"
      :data-sources="images"
      :data-component="Item"
      @totop="onScrollToTop"
      @tobottom="getCats"
    >
      <template #footer>
        <div class="loader"></div>
      </template>
    </VirtualList>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref, onMounted } from 'vue'
  import 'whatwg-fetch'

  import { createApi } from 'unsplash-js'
  // @ts-ignore
  // import VirtualList from 'vue3-virtual-scroll-list'
  import VirtualList from '@/components/virtualList/index.ts'

  import Item from './Item.vue'

  import { getImages } from '@/api/modules/test.ts'

  const images: Ref = ref([])
  const disabledLoadMore: Ref = ref(false)

  const pageNumber: Ref = ref(0)
  const pageSize: Ref = ref(30)

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
  const onScrollToTop = () => {
    console.log('at top')
  }
  onMounted(() => {
    getCats()
  })
</script>

<style scoped lang="scss">
  .list-infinite {
    width: 100%;
    height: 500px;
    border: 2px solid;
    border-radius: 3px;
    overflow-y: auto;
    border-color: dimgray;
    position: relative;
    :deep(.wrap) {
      max-width: 1280px; // can removed here
      padding-bottom: 30px;
      margin: 0 auto;
      display: grid;

      grid-template-columns: repeat(3, minmax(min(200px, 100%), 1fr));
      gap: 20px;
    }
    .list-item-infinite {
      display: flex;
      align-items: center;
      padding: 1em;
      border-bottom: 1px solid;
      border-color: lightgray;
    }

    .loader-wrapper {
      padding: 1em;
    }
    .loader {
      font-size: 10px;
      margin: 0px auto;
      text-indent: -9999em;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #ffffff;
      background: linear-gradient(to right, #9b4dca 10%, rgba(255, 255, 255, 0) 42%);
      position: relative;
      animation: load3 1.4s infinite linear;
      transform: translateZ(0);
    }
    .loader:before {
      width: 50%;
      height: 50%;
      background: #9b4dca;
      border-radius: 100% 0 0 0;
      position: absolute;
      top: 0;
      left: 0;
      content: '';
    }
    .loader:after {
      background: #ffffff;
      width: 75%;
      height: 75%;
      border-radius: 50%;
      content: '';
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
    @-webkit-keyframes load3 {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    @keyframes load3 {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
</style>
