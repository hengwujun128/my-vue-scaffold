import { defineComponent, ref, Ref } from 'vue'
import 'whatwg-fetch'
import { createApi } from 'unsplash-js'

import LoadMore from '@/components/LoadMore.vue'

// in the browser
const Api = createApi({
  accessKey: 'R8u67PrD85zedWNl3SK82Na8FXoaMOqHHNnYT36sWnw',
  headers: { 'X-Custom-Header': 'foo' },
  // fetch: window.fetch,
  //...other fetch options
})

export default defineComponent({
  name: 'MyLazy',
  props: {},
  emits: {},
  setup(props, { emit, slots, expose }) {
    // getData

    const images: Ref = ref([])
    const disabledLoadMore: Ref = ref(false)

    const pageNumber: Ref = ref(0)
    const pageSize: Ref = ref(30)

    /* --------------------------------- methods -------------------------------- */
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
    const lifeCycle = async () => {
      // onBeforeMount(async () => {
      //   await getCats()
      // })
    }

    /* ---------------------------------- hooks --------------------------------- */

    /* -------------------------- export public methods ------------------------- */
    expose({ getCats })
    /* ----------------------------- render function ---------------------------- */
    return () => {
      lifeCycle()

      return (
        <>
          <div class="wrapper">
            {images.value.map((item: { id: number; urls: { small_s3: any } }, index: number) => {
              return (
                <div class={'images-item'} key={item.id}>
                  <div class={'images-card'}>
                    {/* how to use directive in tsx */}
                    <img v-lazy={{ src: item.urls.small_s3, id: index }} class={'images-card__image'} />
                  </div>
                </div>
              )
            })}
            {/*  how to write class achievements in tsx? */}
            <LoadMore loaderMethod={getCats} loaderDisable={disabledLoadMore.value}></LoadMore>
          </div>
        </>
      )
    }
  },
})
