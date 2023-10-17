<template>
  <div>
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
    <!-- <a-progress type="dashboard" :percent="uploadedPercentage" :size="80" /> -->
    <uploadProgress v-model:progress="uploadedPercentage" v-model:visible="visible"></uploadProgress>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref } from 'vue'
  import { message } from 'ant-design-vue'

  import type { UploadChangeParam, UploadProps } from 'ant-design-vue'

  import { UploadOutlined } from '@ant-design/icons-vue'
  // import type { UploadChangeParam } from 'ant-design-vue'
  import SparkMD5 from 'spark-md5'

  import { mergeChunks } from '@/api/modules/upload'

  import { uploadChunksRecursively } from './useUpload.js'

  import uploadProgress from './uploadProgress.vue'

  const handleChange = () => {}
  const visible: Ref<boolean> = ref(false)

  const fileList = ref([])

  const chunkSize = 2 * 1024 * 1024
  const chunks: Ref<any[]> = ref([])
  const chunksFormData: Ref<any[]> = ref([])

  const fileHash: Ref | null = ref(null)
  const uploadedFile: Ref<any> = ref(null)

  // progress data
  let uploadedSize = 0
  let uploadedChunksSize = 0
  const uploadedPercentage = ref(0)

  // file validator
  const fileValidator = (file: File) => {
    if (!file.name.match(/\.(mp4|mov)$/gi)) {
      message.error('you can only upload  mp4 or mov files')
      return false
    }

    const threshold = Number(file.size / 1024 / 1024 / 1024) <= 10
    if (!threshold) {
      message.error('file size can not exceed 10G')
      return false
    }
    return true
  }

  // create chunks
  const createChunks = (file: File, chunkSize: number) => {
    const chunks = []
    let cur = 0
    while (cur < file.size) {
      chunks.push(file.slice(cur, cur + chunkSize))
      cur += chunkSize
    }
    return chunks
  }

  // createMD5ByFileReader
  const createMD5ByFileReader = (file: File) => {
    //
    return new Promise((resolve, reject) => {
      const blobSlice = File.prototype.slice
      let chunkNumber = 0
      const chunks = Math.ceil(file.size / chunkSize)
      //
      const sparkBuffer = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()

      fileReader.onload = (e) => {
        sparkBuffer.append(e.target.result)
        chunkNumber++
        if (chunkNumber < chunks) {
          loadNextChunk()
        } else {
          const md5 = sparkBuffer.end()
          resolve(md5)
        }
      }

      fileReader.onerror = (err) => {
        console.error('opps, something went wrong', err)
        reject(err)
      }

      // fileReader.readAsArrayBuffer()
      function loadNextChunk() {
        const start = chunkNumber * chunkSize
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }
      loadNextChunk()
    })
  }

  /**
   * @description add progress handler
   * @ {Object} item - current chunk item
   */
  const uploadProgressHandler = (chunk, index) => {
    return (e) => {
      // uploadedSize += e.loaded // 这里不能是累加
      // chunk.percentage = parseInt((e.loaded / e.total) * 100)
      console.log({
        e,
        已经上传的chunksSize: uploadedChunksSize,
        file文件size: uploadedFile.value.size,
      })
      const uploadedRatio = parseInt((e.loaded / e.total) * 100)
      // 计算当前的上传的 chunksSize
      uploadedSize = uploadedChunksSize + e.loaded
      // 计算当前上传百分比:
      uploadedPercentage.value = Number(((uploadedSize / uploadedFile.value.size) * 100).toFixed(2))
      if (uploadedPercentage.value > 100) {
        uploadedPercentage.value = 100
      }
      // 如果当前的chunk 加载完毕
      if (uploadedRatio === 100) {
        uploadedChunksSize += e.loaded
      }
    }
  }
  // 上传分片
  const uploadChunks = (md5: string | any) => {
    // create hashChunks
    const chunkHashList = chunks.value.map((chunk, index) => {
      return {
        chunk: chunk,
        chunkHash: `${md5}-${index}`,
        fileHash: md5,
      }
    })
    // create formData
    chunksFormData.value = chunkHashList.map((chunk) => {
      const formData = new FormData()
      // formData.append('chunk', new Blob([chunk.chunk]))
      formData.append('chunk', chunk.chunk)
      formData.append('chunkHash', chunk.chunkHash)
      formData.append('fileHash', chunk.fileHash)
      return {
        formData: formData,
        percentage: 0, // initialize to 0
      }
    })
    // merge chunks
    const mergeChunksHandler = () => {
      mergeChunks({
        fileName: uploadedFile.value.name,
        fileHash: fileHash.value, //
        chunkSize: chunkSize,
      })
      chunks.value = []
    }

    uploadChunksRecursively(chunksFormData.value, uploadProgressHandler, mergeChunksHandler)
  }

  //
  const uploadHandler = async (fileInfo: any) => {
    const isValid = fileValidator(fileInfo.file)
    if (isValid) {
      const md5 = await createMD5ByFileReader(fileInfo.file)
      fileHash.value = md5
      chunks.value = createChunks(fileInfo.file, chunkSize)
      uploadedFile.value = fileInfo.file

      //  reset progress data
      uploadedSize = 0
      uploadedChunksSize = 0
      uploadedPercentage.value = 0

      uploadChunks(md5)
    }
  }

  const customUploadHandler = (e: any) => {
    console.log('-------customUploadHandler-------', e)
    visible.value = true
    uploadHandler(e)
  }

  const showMessage = () => {
    message.success('Hello, Ant Design Vue!')
  }
</script>

<style scoped>
  ._message_ {
    left: 0;
  }
</style>
