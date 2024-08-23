<template>
  <a-modal v-model:open="open" title="this is My Modal" @ok="handleOk" @cancel="handleOk">
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  export interface Props {
    modelValue: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
  })

  const emits = defineEmits(['update:modelValue'])

  const open = computed(() => props.modelValue)

  const handleOk = () => {
    emits('update:modelValue', false)
  }
</script>

<style scoped></style>
