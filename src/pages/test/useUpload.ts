import { ref, Ref } from 'vue'
import { message } from 'ant-design-vue'
import SparkMD5 from 'spark-md5'

import { mergeChunks, uploadFileChunks } from '@/api/modules/upload'

/**
 *
 * @description upload recursively
 * @param {[<@return {Promise<TYPE>} description]} data
 *  注意：这样做，所有请求也是并发的，都处于pending 状态， 响应的结果是一个个处理的
 */

export const uploadRecursively = (data, callback) => {
  if (data.length < 1) {
    console.log('可以合并请求了---')
    callback()
    return
  }
  const currentRequest = data.shift()
  currentRequest
    .then((res: any) => {
      if (res.status === 200) {
        console.log(res.message)
        uploadRecursively(data, callback)
      }
    })
    .catch((err: any) => {
      console.log(err)
    })
    .finally(() => {})
}

export const useUploadProcessor = () => {
  const chunkSize = 2 * 1024 * 1024
  const chunks: Ref<any[]> = ref([])
  const chunksFormData: Ref<any[]> = ref([])

  const fileHash: Ref | null = ref(null)
  const uploadedFile: Ref<any> = ref(null)

  let uploadedChunksSize = 0 // 已经上传完成的chunks 大小
  let uploadedSize = 0 // 当前的上传的数据大小,依赖 uploadedChunksSize
  const uploadedPercentage = ref(0)

  const uploadedStatus = ref(0)
  const uploadedStatusMap = new Map([
    [0, '正在处理数据...'],
    [1, '正在上传数据...'],
    [2, '正在合并数据...'],
    [3, '上传完成'],
  ])

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

  const resetUploadedProgressData = () => {
    //  reset progress data
    uploadedSize = 0
    uploadedChunksSize = 0
    uploadedPercentage.value = 0
    uploadedStatus.value = 0
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

  //
  const createChunksFormData = (md5: string | any) => {
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
  }

  // @ts-ignore
  const uploadProgressHandler = (chunk) => {
    return (e: ProgressEvent) => {
      // uploadedSize += e.loaded // 这里不能是累加
      // chunk.percentage = parseInt((e.loaded / e.total) * 100)

      // 当前模块上传占比
      const uploadedRatio = (e.loaded / e.total) * 100
      // 计算当前的总上传的 chunksSize
      uploadedSize = uploadedChunksSize + e.loaded

      console.log({
        uploadedRatio,
      })
      // 计算当前上传百分比:
      uploadedPercentage.value = Number(((uploadedSize / uploadedFile.value.size) * 100).toFixed(2))
      if (uploadedPercentage.value > 100) {
        uploadedPercentage.value = 100
      }

      // 收集 uploadedChunksSize, 当每个 chunk 处理完毕后,更新
      if (uploadedRatio === 100) {
        uploadedChunksSize += e.loaded
      }
    }
  }

  // merge chunks
  const mergeChunksHandler = () => {
    mergeChunks({
      fileName: uploadedFile.value.name,
      fileHash: fileHash.value, //
      chunkSize: chunkSize,
    }).then((res) => {
      if (res.status === 200) {
        uploadedStatus.value = 3
      }
    })
    chunks.value = []
  }

  // @ts-ignore
  const uploadChunksRecursively = (chunkListFormData, uploadProgressHandler, mergeChunksHandler) => {
    if (chunkListFormData.length < 1) {
      uploadedStatus.value = 2
      mergeChunksHandler()
      return false
    }

    const currentChunk = chunkListFormData.shift()

    return uploadFileChunks(currentChunk.formData, uploadProgressHandler(currentChunk, 0))
      .then((res) => {
        if (res.status === 200) {
          console.log(res.message)
          setTimeout(() => {
            uploadChunksRecursively(chunkListFormData, uploadProgressHandler, mergeChunksHandler)
          }, 1000)
        } else {
          console.log('uplaod chunks error', currentChunk)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const uploadChunksFormData = () => {
    uploadedStatus.value = 1
    uploadChunksRecursively(chunksFormData.value, uploadProgressHandler, mergeChunksHandler)
  }

  const uploadHandler = async (fileInfo: any) => {
    uploadedStatus.value = 0

    const isValid = fileValidator(fileInfo.file)
    if (isValid) {
      const md5 = await createMD5ByFileReader(fileInfo.file)
      fileHash.value = md5
      chunks.value = createChunks(fileInfo.file, chunkSize)
      uploadedFile.value = fileInfo.file

      //  reset progress data
      resetUploadedProgressData()

      createChunksFormData(md5)

      uploadChunksFormData()
    }
  }

  return {
    chunkSize,
    chunks,
    chunksFormData,
    fileHash,
    uploadedFile,

    uploadedChunksSize,
    uploadedSize,
    uploadedPercentage,
    uploadedStatusMap,
    uploadedStatus,

    uploadHandler,
  }
}
