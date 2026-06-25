<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-black dark:text-white">{{ $t('Ruxsatlar') }}</h1>
          <p class="text-black dark:text-white text-sm mt-1">{{ $t("Foydalanuvchi uchun ruxsatlarni sozlash") }}</p>
        </div>
      </div>

      <!-- Permissions List -->
      <div v-if="loading" class="text-center py-20 text-slate-400">
        <div class="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
        {{ $t('Yuklanmoqda...') }}
      </div>

      <div v-else-if="error" class="bg-red-900/30 border border-red-700 text-red-400 p-6 rounded-2xl text-center">
        {{ error }}
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(value, key) in filteredPermissions"
          :key="key"
          class="bg-white/95 dark:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between hover:bg-white/100 dark:hover:bg-white/15 transition-all group"
        >
          <span class="text-slate-700 dark:text-slate-200 font-medium text-[15px]">
            {{ formatLabel(key) }}
          </span>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="value"
              @change="toggleAndSave(key)"
              class="sr-only peer"
            />
            <!-- Toggle Switch -->
            <div class="w-12 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
            <div class="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      <!-- Auto saving -->
      <div v-if="saving" class="mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
        <div class="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        {{ $t('Saqlanmoqda...') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import api, { ENDPOINTS } from '@/api'

const route = useRoute()
const permission = ref(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)

const { proxy } = getCurrentInstance()
const t = (text) => proxy.$t(text)

const filteredPermissions = computed(() => {
  if (!permission.value) return {}
  return Object.fromEntries(
    Object.entries(permission.value).filter(([_, v]) => typeof v === 'boolean')
  )
})

const fetchPermission = async () => {
  try {
    loading.value = true
    const { data } = await api.get(ENDPOINTS.PERMISSION(route.params.id))
    permission.value = { ...data }
  } catch (err) {
    error.value = 'Maʼlumotni yuklashda xatolik'
    console.error(err)
  } finally {
    loading.value = false
  }
}

let saveTimeout = null
const autoSave = async () => {
  if (!permission.value || saveTimeout) return

  saveTimeout = setTimeout(async () => {
    try {
      saving.value = true
      await api.put(ENDPOINTS.PERMISSION(route.params.id), permission.value)
    } catch (err) {
      console.error(err)
      error.value = 'Saqlashda xatolik yuz berdi'
    } finally {
      saving.value = false
      saveTimeout = null
    }
  }, 700)
}

const toggleAndSave = (key) => {
  if (permission.value) {
    permission.value[key] = !permission.value[key]
    autoSave()
  }
}

const formatLabel = (key) => {
  const labels = {
    permisisons: "Ruxsatlarni boshqarish",
    view_users: "Foydalanuvchilarni ko'rish uchun ruxsat",
    edit_users: "Foydalanuvchilarni tahrirlash uchun ruxsat",
    delete_users: "Foydalanuvchilarni o'chirish uchun ruxsat",
    add_users: "Foydalanuvchi qo'shish uchun ruxsat",
    view_customers: "Mijozlarni ko'rish uchun ruxsat",
    edit_customers: "Mijozlarni tahrirlash uchun ruxsat",
    delete_customers: "Mijozlarni o'chirish uchun ruxsat",
    add_customers: "Mijoz qo'shish uchun ruxsat",
    archive: "Arxiv uchun ruxsat",
  }
  const label = labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return t(label)
}

onMounted(fetchPermission)
</script>