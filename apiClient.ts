import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Base API configuration
const API_BASE_URL = 'http://api.icastar.com/api'
// const API_BASE_URL = 'http://api.icastar.com/api'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  error => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data but don't redirect here
      // Let the AuthContext handle the redirect to avoid conflicts
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      console.error('Authentication failed - token cleared')
    }

    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden')
    }

    if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.data)
    }

    return Promise.reject(error)
  },
)

// Generic API methods
export const api = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config)
  },

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config)
  },

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config)
  },

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config)
  },

  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config)
  },
}

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
) => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post(url, formData, {
    timeout: 300000, // 5 minutes for file uploads
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progressEvent => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        )
        onProgress(progress)
      }
    },
  })
}

export default apiClient
