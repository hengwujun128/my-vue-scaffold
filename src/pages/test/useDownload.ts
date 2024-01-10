import { downloadSample } from '@/api/modules/upload'

const useDownloadService = () => {
  const downloadByStream = () => {
    return downloadSample()
  }
  return {
    downloadByStream,
  }
}

export default useDownloadService
