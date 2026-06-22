import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const usePricesStore = defineStore('prices', {
  state: () => ({
    prices: {
      price_one: 1000000,
      price_two: 2000000,
      price_three: 3000000,
    },
    loading: false,
  }),

  actions: {
    headers() {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useAuthStore().token}`,
      }
    },

    async fetchPrices() {
      this.loading = true
      try {
        const res = await fetch('http://localhost:4000/api/customers/settings/prices', {
          headers: this.headers()
        })
        if (res.ok) {
          this.prices = await res.json()
        }
      } catch (err) {
        console.error('Narxlarni yuklashda xatolik:', err)
      } finally {
        this.loading = false
      }
    },

    async updatePrices(data) {
      this.loading = true
      try {
        const res = await fetch('http://localhost:4000/api/customers/settings/prices', {
          method: 'PUT',
          headers: this.headers(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          this.prices = await res.json()
          return { success: true }
        }
        const result = await res.json()
        return { success: false, error: result.message || result.error }
      } catch (err) {
        console.error('Narxlarni yangilashda xatolik:', err)
        return { success: false, error: 'Xatolik yuz berdi' }
      } finally {
        this.loading = false
      }
    }
  }
})
