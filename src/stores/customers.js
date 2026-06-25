import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [],
    archived: [],
    loading: false,
  }),

  actions: {
    headers() {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useAuthStore().token}`,
      }
    },

    async fetchCustomers() {
      this.loading = true
      try {
        const res = await fetch('http://localhost:4000/api/customers', {
          headers: this.headers()
        })
        this.customers = await res.json()
      } finally {
        this.loading = false
      }
    },

    async fetchArchived() {
      this.loading = true
      try {
        const res = await fetch('http://localhost:4000/api/customers?archived=true', {
          headers: this.headers()
        })
        this.archived = await res.json()
      } finally {
        this.loading = false
      }
    },

    async createCustomer(data) {
      const res = await fetch('http://localhost:4000/api/customers', {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) return { success: false, error: result.message || result.error }

      await this.fetchCustomers()
      return { success: true, customer: result } // yangi yaratilgan mijozni qaytarish
    },

    // ==================== YANGILANGAN updateCustomer ====================
    async updateCustomer(id, data) {
      const res = await fetch(`http://localhost:4000/api/customers/${id}`, {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        return { success: false, error: result.message || result.error }
      }

      // Yangilangan mijoz ma'lumotlarini qaytaramiz (payments ichida yangi to'lov bor)
      await this.fetchCustomers()

      return { 
        success: true, 
        customer: result   // <-- Muhim: endi to'liq yangilangan customer qaytadi
      }
    },

    async archiveCustomer(id) {
      await fetch(`http://localhost:4000/api/customers/${id}/archive`, {
        method: 'PUT',
        headers: this.headers()
      })
      await this.fetchCustomers()
    },

    async restoreCustomer(id) {
      await fetch(`http://localhost:4000/api/customers/${id}/restore`, {
        method: 'PUT',
        headers: this.headers()
      })
      await this.fetchArchived()
    },

    async deleteCustomer(id) {
      await fetch(`http://localhost:4000/api/customers/${id}`, {
        method: 'DELETE',
        headers: this.headers()
      })
      await this.fetchArchived()
    },
  },
})