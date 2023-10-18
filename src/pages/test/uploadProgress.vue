<template>
  <!-- :open="props.visible" @update:open="@emit('update:visible', $event.target.value)" -->
  <a-modal
    v-model:open="modalVisible"
    title="上传文件"
    :footer="null"
    :centered="true"
    :body-style="{ 'text-align': 'center' }"
  >
    <a-progress
      type="circle"
      :stroke-color="{
        '0%': '#108ee9',
        '100%': '#87d068',
      }"
      :percent="props.progress"
    />
    <p class="desc">{{ props.title }}</p>
  </a-modal>
</template>

<script setup lang="ts">
  import { defineProps, defineEmits, computed } from 'vue'

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: '',
    },
  })
  const emits = defineEmits(['update:visible', 'update:progress'])

  // use third party variable and computed property to achieve v-model
  const modalVisible = computed({
    get() {
      return props.visible
    },
    set(value) {
      emits('update:visible', value)
    },
  })
</script>

<style scoped>
  .desc {
    margin-top: 16px;
  }
</style>
