import request from '@/api/request'

/**
 * {@link <https://dog.ceo/dog-api/documentation/random>}
 * {@link <https://docs.waifu.im/reference/api-reference/search>}
 */
export const getImages = (): Promise<any> => {
  const apiUrl = '/search'
  const params = {
    included_tags: 'maid', //maid
    // height: '<=1000',
    // height: '<=1000',
    // byte_size: '<=2000',
    many: true,
  }

  const queryParams = new URLSearchParams(params)
  const requestUrl = `${apiUrl}?${queryParams}`

  return request.get(requestUrl)
}

export const searchCats = (): Promise<any> => {}
