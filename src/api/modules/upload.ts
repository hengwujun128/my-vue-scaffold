// @ts-ignore
import request from '@/api/request'

/**
 * @description: upload file chunks
 */
export const uploadFileChunks = (params, onUploadProgressHandler) => {
  return request.post('/uploadChunk', params, {
    headers: {
      'content-type': 'multipart/form-data',
    },
    onUploadProgress: onUploadProgressHandler,
  })
}

/**
 * @description: merge chunks
 */
export const mergeChunks = (params) => {
  return request.post('/mergeChunks', params)
}
