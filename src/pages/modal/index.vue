<template>
  <div>
    <a-button type="primary" @click="showModal">Open Modal</a-button>
    <div> testTreeShaking: {{ deepClone(['clone']) }} </div>
    <myModal v-if="visibleModal" v-model="visibleModal"></myModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineAsyncComponent } from 'vue'

  import { getCurrentTime, deepClone } from '../../utils/testTreeShaking'
  // import utils from '../../utils/testTreeShaking'

  // import myModal from './myModal.vue'
  const myModal = defineAsyncComponent(() => import('./myModal.vue'))
  console.log(myModal)
  const visibleModal = ref<boolean>(false)

  const showModal = () => {
    visibleModal.value = true
  }
</script>

<style scoped></style>
