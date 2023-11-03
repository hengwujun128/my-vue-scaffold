<template>
  <section class="memo-list__content-item">
    <!-- 概要 -->
    <section class="item-title">
      <SearchContent :search-value="searchValue" :content="item.title" />
    </section>
    <!-- 内容 -->
    <section class="item-content">
      <SearchContent :search-value="searchValue" :content="item.content" />
    </section>
  </section>
</template>
<script setup lang="tsx">
  import { defineComponent, ref } from 'vue'
  const CONTENT_CUT_LENGTH = 2
  // 使用JSX创建组件
  const SearchContent = defineComponent({
    name: 'SearchContent',
    props: {
      searchValue: {
        type: String,
        default: '',
      },
      content: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const searchValue = props.searchValue
      const content = props.content
      const index = content.indexOf(searchValue)

      if (index === -1) return content

      const searchIndex = searchValue.length + index

      // 搜索结果
      const extraContent = (startIndex: number) => (
        <>
          {startIndex ? <span>...</span> : ''}
          <span>{content.slice(startIndex, index)}</span>
          <span style="background: #fae086">{content.slice(index, searchIndex)}</span>
          <span>{content.slice(searchIndex)}</span>
        </>
      )

      return () => {
        if (searchIndex > CONTENT_CUT_LENGTH) return extraContent(index - 4)
        return extraContent(0)
      }
    },
  })

  /* -------------------------------- use case -------------------------------- */
  const searchValue = ref('hello')
  const item = ref({
    title: 'hello world ',
    content: 'hello china',
  })
</script>
