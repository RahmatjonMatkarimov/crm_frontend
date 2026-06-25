import { defineStore } from 'pinia'
import api, { ENDPOINTS } from '@/api'

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
    async fetchPrices() {
      this.loading = true
      try {
        const { data } = await api.get(ENDPOINTS.PRICES)
        this.prices = data
      } catch (err) {
        console.error('Narxlarni yuklashda xatolik:', err)
      } finally {
        this.loading = false
      }
    },

    async updatePrices(payload) {
      this.loading = true
      try {
        const { data } = await api.put(ENDPOINTS.PRICES, payload)
        this.prices = data
        return { success: true }
      } catch (err) {
        console.error('Narxlarni yangilashda xatolik:', err)
        return { success: false, error: err.response?.data?.message || 'Xatolik yuz berdi' }
      } finally {
        this.loading = false
      }
    },
  },
})
