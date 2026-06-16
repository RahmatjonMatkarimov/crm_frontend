import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    async register(username, password, name, role) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, name, role }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi')
        }

        this.token = data.access_token
        this.user = data.user
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      } catch (err) {
        this.error = err.message
        return false
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Tizimga kirishda xatolik yuz berdi')
        }

        this.token = data.access_token
        this.user = data.user
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    },

    async createUser(username, password, name, role) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify({ username, password, name, role }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Foydalanuvchi yaratishda xatolik yuz berdi')
        }
        return { success: true, user: data.user }
      } catch (err) {
        this.error = err.message
        return { success: false }
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
