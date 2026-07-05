import { defineStore } from 'pinia'
import api, { ENDPOINTS } from '@/api'

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [],
    archived: [],
    loading: false,
  }),

  actions: {
    async fetchCustomers() {
      this.loading = true
      try {
        const { data } = await api.get(ENDPOINTS.CUSTOMERS)
        this.customers = data
      } finally {
        this.loading = false
      }
    },

    async fetchArchived() {
      this.loading = true
      try {
        const { data } = await api.get(ENDPOINTS.CUSTOMERS, { params: { archived: true } })
        this.archived = data
      } finally {
        this.loading = false
      }
    },

    async createCustomer(payload) {
      try {
        const { data } = await api.post(ENDPOINTS.CUSTOMERS, payload)
        await this.fetchCustomers()
        return { success: true, customer: data }
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.response?.data?.error || err.message }
      }
    },

    async updateCustomer(id, payload) {
      try {
        const { data } = await api.put(ENDPOINTS.CUSTOMER(id), payload)
        await this.fetchCustomers()
        return { success: true, customer: data }
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.response?.data?.error || err.message }
      }
    },

    async callCustomer(id) {
      try {
        const { data } = await api.put(ENDPOINTS.CUSTOMER_CALL(id))
        await this.fetchCustomers()
        return { success: true, customer: data }
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.response?.data?.error || err.message }
      }
    },

    async archiveCustomer(id) {
      await api.put(ENDPOINTS.CUSTOMER_ARCHIVE(id))
      await this.fetchCustomers()
    },

    async restoreCustomer(id) {
      await api.put(ENDPOINTS.CUSTOMER_RESTORE(id))
      await Promise.all([this.fetchArchived(), this.fetchCustomers()])
    },

    async deleteCustomer(id) {
      await api.delete(ENDPOINTS.CUSTOMER(id))
      await this.fetchArchived()
    },
  },
})
