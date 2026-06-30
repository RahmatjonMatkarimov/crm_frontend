<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">

      <!-- Header Card -->
      <div class="mb-5 overflow-hidden" style="background:#1A3A6B; border-radius:4px; border-bottom:3px solid #2E8B57;">
        <div class="px-6 py-5 flex items-center gap-4">
          <div class="w-10 h-10 flex items-center justify-center shrink-0" style="background:rgba(255,255,255,0.12); border-radius:4px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
              stroke="currentColor" class="w-5 h-5 text-white">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h1 class="text-white text-base font-bold tracking-wide">{{ $t('Ruxsatlar') }}</h1>
            <p class="text-sm mt-0.5" style="color:rgba(255,255,255,0.6);">{{ $t('Foydalanuvchi uchun ruxsatlarni sozlash') }}</p>
          </div>
          <div v-if="saving" class="ml-auto flex items-center gap-2 text-sm" style="color:rgba(255,255,255,0.6);">
            <div class="w-4 h-4 border-2 rounded-full animate-spin" style="border-color:rgba(255,255,255,0.3); border-top-color:white;"></div>
            {{ $t('Saqlanmoqda...') }}
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-2 rounded-full animate-spin" style="border-color:#d8dde6; border-top-color:#1A3A6B;"></div>
        <p class="text-slate-400 text-sm">{{ $t('Yuklanmoqda...') }}</p>
      </div>

      <!-- Error -->
      <div v-else-if="error"
        class="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 shrink-0">
          <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd" />
        </svg>
        {{ error }}
      </div>

      <!-- Permissions List -->
      <div v-else class="space-y-2.5">
        <!-- Group: Foydalanuvchilar -->
        <div class="rounded overflow-hidden shadow-sm"
          :style="themeStore.isDark ? 'background:#264a75; border:1px solid #3a6090;' : 'background:#ffffff; border:1px solid #d8dde6;'">
          <div class="px-5 py-3 border-b"
            :style="themeStore.isDark ? 'border-color:#3a6090; background:#1e3a5f;' : 'border-color:#eaecf0; background:#f7f8fa;'">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {{ $t('Ruxsatlar') }}
            </p>
          </div>
          <div class="divide-y" :style="themeStore.isDark ? 'border-color:#3a6090' : 'border-color:#eaecf0'">
            <div
              v-for="(value, key) in filteredPermissions"
              :key="key"
              class="px-5 py-3.5 flex items-center justify-between group transition-colors"
              :style="themeStore.isDark ? '' : ''"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                  :class="value
                    ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600'">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path v-if="value" fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clip-rule="evenodd" />
                    <path v-else fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-sm font-medium" :style="themeStore.isDark ? 'color:#e8f0ff' : 'color:#1a1f36'">
                  {{ formatLabel(key) }}
                </span>
              </div>

              <!-- Toggle -->
              <label class="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" :checked="value" @change="toggleAndSave(key)" class="sr-only peer" />
                <div
                  class="w-11 h-6 transition-colors peer bg-slate-200 dark:bg-slate-700"
                  :style="value ? 'background:#2E8B57; border-radius:3px;' : 'border-radius:3px;'">
                </div>
                <div
                  class="absolute left-0.5 top-0.5 w-5 h-5 bg-white shadow-sm transition-all peer-checked:translate-x-5"
                  style="border-radius:2px;">
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="px-5 py-4 rounded flex items-center justify-between"
          :style="themeStore.isDark ? 'background:#264a75; border:1px solid #3a6090;' : 'background:#ffffff; border:1px solid #d8dde6;'">
          <div class="flex items-center gap-2 text-sm" :style="themeStore.isDark ? 'color:#7aaad4' : 'color:#4a5568'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
              stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            {{ $t('Jami') }}: <span class="font-semibold" :style="themeStore.isDark ? 'color:#ddeaff' : 'color:#1a1f36'">{{ totalCount }}</span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              {{ $t('Faol') }}: <b>{{ activeCount }}</b>
            </span>
            <span class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <span class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              {{ $t('Nofaol') }}: <b>{{ totalCount - activeCount }}</b>
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import api, { ENDPOINTS } from '@/api'

const route = useRoute()
const themeStore = useThemeStore()
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

const totalCount = computed(() => Object.keys(filteredPermissions.value).length)
const activeCount = computed(() => Object.values(filteredPermissions.value).filter(Boolean).length)

const fetchPermission = async () => {
  try {
    loading.value = true
    const { data } = await api.get(ENDPOINTS.PERMISSION(route.params.id))
    permission.value = { ...data }
  } catch (err) {
    error.value = t("Ma'lumotni yuklashda xatolik")
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
      error.value = t('Saqlashda xatolik yuz berdi')
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
    edit_prices: "Narxlarni o'zgartirish uchun ruxsat",
  }
  const label = labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return t(label)
}

onMounted(fetchPermission)
</script>
