import request from '@/api/request'

/**
 * Get random images from dog.ceo API.
 *
 * @param {Object} params - The parameters for the API request.
 * @param {string} params.included_tags - The tags to include in the search. Defaults to "maid".
 * @param {boolean} params.many - Whether to fetch multiple images. Defaults to true.
 * @returns {Promise<{data: {message: string, status: string, images: Array<{url: string}>}}>} - The response from the API.
 */
export const getImages = (
  params: {
    included_tags?: string
    many?: boolean
  } = {
    included_tags: 'maid',
    many: true,
  },
): Promise<{
  data: {
    message: string
    status: string
    images: Array<{ url: string }>
  }
}> => {
  const apiUrl = '/search'
  const queryParams = new URLSearchParams(params as URLSearchParams)
  const requestUrl = `${apiUrl}?${queryParams}`

  return request.get(requestUrl)
}
