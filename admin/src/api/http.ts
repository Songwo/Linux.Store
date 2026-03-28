import axios from 'axios'
import { ElMessage } from 'element-plus'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  request_id?: string
}

const http = axios.create({ baseURL: '/api/v1', timeout: 10000 })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('devstore_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse
    if (payload.code !== 0) {
      ElMessage.error(payload.message || '请求失败')
      return Promise.reject(payload)
    }
    return payload as any
  },
  (error) => {
    ElMessage.error(error?.response?.data?.message || error.message || '网络异常')
    return Promise.reject(error)
  },
)

export default http
