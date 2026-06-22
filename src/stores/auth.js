import axios from 'axios'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    permission: null,
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
        const id = this.user.id
        const { data } = await axios.get(`http://localhost:4000/permissions/${id}`)
        this.permission = { ...data }
      } catch (err) {
        this.error = 'Maʼlumotni yuklashda xatolik'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // Yangi foydalanuvchi yaratish (rasm bilan)
    async createUser(userData) {
      this.loading = true
      this.error = null

      try {
        const formData = new FormData()

        if (userData.username) formData.append('username', userData.username)
        if (userData.password) formData.append('password', userData.password)
        if (userData.name) formData.append('name', userData.name)
        if (userData.surname) formData.append('surname', userData.surname)
        if (userData.father_name) formData.append('father_name', userData.father_name)
        if (userData.role) formData.append('role', userData.role)
        if (userData.phone) formData.append('phone', userData.phone)
        if (userData.phone2) formData.append('phone2', userData.phone2)
        if (userData.birthDate) formData.append('birthDate', userData.birthDate)
        if (userData.userCode) formData.append('userCode', userData.userCode)
        if (userData.uniqueCode) formData.append('uniqueCode', userData.uniqueCode)

        // Rasm yuklash
        if (userData.img && userData.img instanceof File) {
          formData.append('img', userData.img)
        }

        const response = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Foydalanuvchi yaratishda xatolik yuz berdi')
        }

        return { success: true, user: data.user }
      } catch (err) {
        this.error = err.message
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Kirishda xatolik')
          
          this.token = data.access_token
          this.user = data.user
          localStorage.setItem('token', data.access_token)
          localStorage.setItem('user', JSON.stringify(data.user))
          await this.fetchPermission()
        return { success: true }
      } catch (err) {
        this.error = err.message
        return { success: false }
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId, formData) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          body: formData,
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Foydalanuvchini yangilashda xatolik')
        }
        return { success: true, user: data.user }
      } catch (err) {
        this.error = err.message
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    async archiveUser(userId) {
      const response = await fetch(`http://localhost:4000/api/users/${userId}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${this.token}` },
      })
      const data = await response.json()
      if (!response.ok) return { success: false, error: data.message }
      return { success: true }
    },

    async restoreUser(userId) {
      const response = await fetch(`http://localhost:4000/api/users/${userId}/restore`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${this.token}` },
      })
      const data = await response.json()
      if (!response.ok) return { success: false, error: data.message }
      return { success: true }
    },

    async deleteUser(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Foydalanuvchini o\'chirishda xatolik')
        }
        return { success: true }
      } catch (err) {
        this.error = err.message
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})