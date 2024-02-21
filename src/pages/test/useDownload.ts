import { downloadSample, downloadByStream } from '@/api/modules/upload'

const useDownloadService = () => {
  const downloadByStreams = () => {
    return downloadByStream()
  }

  const sampleDownload = () => {
    return downloadSample()
  }

  // 处理下载的文件
  return {
    downloadByStream,
    sampleDownload,
  }
}

export default useDownloadService
