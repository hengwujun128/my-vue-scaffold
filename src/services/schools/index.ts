import http from '../api.ts'

import { APIResponse } from '../types'

import { School, InputCreateSchool, InputUpdateSchool } from './types'

export const getSchools = () => {
  return http.get<APIResponse<School[]>>('/xxx/school')
}

export const deleteSchool = (id: number) => {
  return http.delete<APIResponse<boolean>>(`/xxx/${id}`)
}

export const createSchool = (input: InputCreateSchool) => {
  return http.post<APIResponse<School>>(`/xxx/school`, input)
}

export const updateSchool = (input: InputUpdateSchool) => {
  return http.post<APIResponse<boolean>>(`/xxx/school`, input)
}

// 统一出口
export default {
  getSchools,
  deleteSchool,
  createSchool,
  updateSchool,
}
