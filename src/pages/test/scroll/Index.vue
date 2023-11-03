<template>
  <div>
    <div class="header">
      <p>回调数据: {{ scrollText }}</p>
    </div>
    <div class="content">
      <!--  -->
      <VirtualScroll ref="vScroll" v-bind="config" :list="list" :on-touch-end="onTouchEnd" @scroll="handleScroll">
        <template #default="{ item }">
          <div class="product-item">
            <ProductCard :details="item" />
          </div>
        </template>
      </VirtualScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref, reactive, onMounted } from 'vue'
  import { createApi } from 'unsplash-js'

  import { VirtualScroll } from '@/components/virtualScroll/index.ts'
  import ProductCard from './ProductCard.vue'

  // in the browser
  const Api = createApi({
    accessKey: 'R8u67PrD85zedWNl3SK82Na8FXoaMOqHHNnYT36sWnw',
    headers: { 'X-Custom-Header': 'foo' },
    // fetch: window.fetch,
    //...other fetch options
  })

  const loading: Ref = ref(false)
  const pageNumber: Ref = ref(0)
  const pageSize: Ref = ref(30)
  const list: Ref<any[]> = ref([])

  const vScroll: Ref = ref(null)
  const posy = ref(0)

  const config = reactive({
    grid: 2,
    height: 120,
    rowKey: 'id',
    // onTouchEnd,
    loadingText: '加载中，请稍等',
    bufferCount: 4,
    wrapperStyle: {},
    colSpace: 10,
    rowSpace: 10,
  })

  const scrollText = ref('')
  const handleScroll = (a: number, b: number) => {
    scrollText.value = `startIndex:, ${a}, posy:, ${b}`
    console.log(scrollText.value)
  }

  const onTouchEnd = () => {
    getList()
  }

  /**
   * @desc
   * {@link https://unsplash.com/}
   * {@link https://unsplash.com/documentation}
   */
  const getList = async () => {
    if (loading.value) {
      return
    }
    loading.value = true

    pageNumber.value++
    const res = await Api.search.getPhotos({
      query: 'USA',
      page: pageNumber.value,
      perPage: pageSize.value,
      orderBy: 'latest',
    })
    if (res.status == 200 && res.response) {
      list.value = [...list.value, ...res.response.results]
      loading.value = false

      // if (list.value.length > res.response.total) {
      //   console.log('---')
      // }
    }
  }
  onMounted(() => {
    getList()
  })
</script>

<style scoped>
  * {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .content {
    height: 80vh;
    width: 80vh;
    margin: 0 auto;
    border: 2px solid #cccccc;
  }
  .product-list {
    display: flex;
    flex-wrap: wrap;
  }
</style>
