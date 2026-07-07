<script setup>
import { useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import CustomerModal from '@/components/customers/CustomerModal.vue'

const router = useRouter()
const store = useCustomersStore()

const goBack = () => router.push('/customers')
</script>

<template>
  <div class="space-y-5">
    <CustomerModal :editing="null" :pageMode="true" @close="goBack" @saved="() => { store.fetchCustomers(); goBack() }" />
  </div>
</template>
