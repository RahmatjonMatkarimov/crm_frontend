import axios from 'axios'
import { getActivePinia } from 'pinia'

// Backend URL — faqat shu yerda o'zgartiring
export const BASE_URL = 'http://localhost:4000'

const api = axios.create({
  baseURL: BASE_URL,
})

// Har bir so'rovga avtomatik token qo'shadi
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token')

  try {
    const pinia = getActivePinia()
    if (pinia?.state.value?.auth?.token) {
      token = pinia.state.value.auth.token
    }
  } catch {}

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permission')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const ENDPOINTS = {
  // Auth
  LOGIN:        '/api/auth/login',
  REGISTER:     '/api/auth/register',
  ALL_USERS:    '/api/auth/all-users',
  ME:           '/api/users/me',
  USER:         (id) => `/api/users/${id}`,
  USER_ARCHIVE: (id) => `/api/users/${id}/archive`,
  USER_RESTORE: (id) => `/api/users/${id}/restore`,

  // Customers
  CUSTOMERS:          '/api/customers',
  CUSTOMER:           (id) => `/api/customers/${id}`,
  CUSTOMER_ARCHIVE:   (id) => `/api/customers/${id}/archive`,
  CUSTOMER_RESTORE:   (id) => `/api/customers/${id}/restore`,
  CUSTOMER_CHECK:     (id) => `/api/customers/${id}/check`,
  PRICES:             '/api/customers/settings/prices',

  // Permissions
  PERMISSION:  (id) => `/permissions/${id}`,
}

export default api
