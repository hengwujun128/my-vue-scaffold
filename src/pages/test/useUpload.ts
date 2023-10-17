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
    .then((res) => {
      if (res.status === 200) {
        console.log(res.message)
        uploadRecursively(data, callback)
      }
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {})
}

// export const mergeChunksHandler = () => {
//   mergeChunks({
//     fileName: currentFile.value.name, //
//     fileHash: fileHash.value, //
//     chunkSize: chunkSize //
//   })
//   chunkList.value = []
// }
export const uploadChunksRecursively = (chunkListFormData, uploadProgressHandler, mergeChunksHandler) => {
  if (chunkListFormData.length < 1) {
    console.log('可以合并请求了---')
    mergeChunksHandler()
    return false
  }
  //
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
