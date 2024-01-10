// @ts-ignore
import request from '@/api/uploadRequest.ts'

/**
 * @description: upload file chunks
 */

export const uploadFileChunks = (params: any, onUploadProgressHandler: any): Promise<any> => {
  return request.post('/home/uploadChunk', params, {
    headers: {
      'content-type': 'multipart/form-data',
    },
    onUploadProgress: onUploadProgressHandler,
  })
}

/**
 * @description: merge chunks
 */
export const mergeChunks = (params: { fileName: any; fileHash: any; chunkSize: number }): Promise<any> => {
  return request.post('/home/mergeChunks', params)
}

/**
 * @description: download file
 */

export const downloadSample = () => {
  return request.get('/downloads/sampleDownload')
}
