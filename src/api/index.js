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
  CUSTOMER_DOCUMENTS: (id) => `/api/customers/${id}/documents`,
  CUSTOMER_CALL:      (id) => `/api/customers/${id}/call`,
  CUSTOMER_CHECK_DUPLICATE: '/api/customers/check-duplicate',
  CUSTOMER_BLACKLIST:       (id) => `/api/customers/${id}/blacklist`,
  CUSTOMER_UNBLACKLIST:     (id) => `/api/customers/${id}/unblacklist`,
  CUSTOMER_REJECT:          (id) => `/api/customers/${id}/reject`,
  PRICES:             '/api/customers/settings/prices',

  // Queue / Waiting room
  WAITING_ROOM_QUEUE: '/api/queue/waiting-room',

  // Permissions
  PERMISSION:  (id) => `/permissions/${id}`,

  // Settings
  SETTINGS_WAITING_ROOM_VIDEO: '/api/settings/waiting-room-video',

  // Auto messages (mijoz yaratilganda avtomatik yuboriladigan xabarlar)
  AUTO_MESSAGES:      '/api/auto-messages',
  AUTO_MESSAGE:       (id) => `/api/auto-messages/${id}`,

  // Scheduled messages (mijoz qo'shilganidan N kun o'tgach, yillik takrorlanadigan xabarlar)
  SCHEDULED_MESSAGES: '/api/scheduled-messages',
  SCHEDULED_MESSAGE:  (id) => `/api/scheduled-messages/${id}`,

  // Telegram
  TELEGRAM_STATUS:    '/api/telegram/status',
  TELEGRAM_SEND_CODE: '/api/telegram/send-code',
  TELEGRAM_SIGN_IN:   '/api/telegram/sign-in',
  TELEGRAM_LOGOUT:    '/api/telegram/logout',
  TELEGRAM_SEND:      '/api/telegram/send',
  TELEGRAM_SEND_FILE: '/api/telegram/send-file',
}

export default api
