<template>
  <div class="file">
    <a-upload
      v-model:file-list="fileList"
      name="file"
      :show-upload-list="false"
      :custom-request="customUploadHandler"
      @change="handleChange"
    >
      <a-button>
        <upload-outlined></upload-outlined>
        Click to Upload
      </a-button>
    </a-upload>

    <!-- downloads -->
    <a-button type="dashed" class="download" @click="downloadHandler">Downloads</a-button>
    <uploadProgress
      v-model:progress="uploadedPercentage"
      v-model:visible="visible"
      :title="uploadedStatusMap.get(uploadedStatus)"
    ></uploadProgress>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref } from 'vue'

  import { UploadOutlined } from '@ant-design/icons-vue'

  import { useUploadProcessor } from './useUpload.js'
  import useDownloadService from './useDownload'

  import uploadProgress from './uploadProgress.vue'

  import Icon from '@/assets/vue.svg?raw'
  console.log('----', Icon)

  const handleChange = () => {}
  const visible: Ref<boolean> = ref(false)

  const fileList = ref([])

  const { uploadHandler, uploadedPercentage, uploadedStatus, uploadedStatusMap } = useUploadProcessor()
  const { downloadByStream } = useDownloadService()

  const customUploadHandler = (e: any) => {
    console.log('-------customUploadHandler-------', e)
    visible.value = true
    uploadHandler(e)
  }

  const downloadHandler = (e: Event) => {
    console.log('-------downloadHandler-------', e)
    // window.open('http://localhost:3000/downloads/sampleDownload')
    downloadByStream().then((res) => {
      console.log('-------downloadHandler-------', res)
    })
  }
</script>

<style scoped lang="scss">
  .file {
    margin: 10px;

    ._message_ {
      left: 0;
    }

    .download {
      margin-left: 10px;
    }
  }
</style>
