import { defineStore } from 'pinia'
import api, { ENDPOINTS, BASE_URL } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    permission: JSON.parse(localStorage.getItem('permission')) || null,
    error: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    async fetchPermission() {
      try {
        this.loading = true
        const { data } = await api.get(ENDPOINTS.PERMISSION(this.user.id))
        this.permission = { ...data }
        localStorage.setItem('permission', JSON.stringify(this.permission))
      } catch (err) {
        this.error = 'Maʼlumotni yuklashda xatolik'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createUser(userData) {
      this.loading = true
      this.error = null
      try {
        const formData = new FormData()
        const fields = ['username', 'password', 'name', 'surname', 'father_name', 'role', 'phone', 'phone2', 'telegram', 'birthDate', 'userCode', 'uniqueCode']
        fields.forEach(f => { if (userData[f]) formData.append(f, userData[f]) })
        if (userData.img instanceof File) formData.append('img', userData.img)

        const { data } = await api.post(ENDPOINTS.REGISTER, formData)
        return { success: true, user: data.user }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post(ENDPOINTS.LOGIN, { username, password })
        this.token = data.access_token
        this.user = data.user
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        await this.fetchPermission()
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Kirishda xatolik'
        return { success: false }
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId, formData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.put(ENDPOINTS.USER(userId), formData)
        return { success: true, user: data.user }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async archiveUser(userId) {
      try {
        await api.put(ENDPOINTS.USER_ARCHIVE(userId))
        return { success: true }
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.message }
      }
    },

    async restoreUser(userId) {
      try {
        await api.put(ENDPOINTS.USER_RESTORE(userId))
        return { success: true }
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.message }
      }
    },

    async deleteUser(userId) {
      this.loading = true
      this.error = null
      try {
        await api.delete(ENDPOINTS.USER(userId))
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.permission = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permission')
    },
  },
})
