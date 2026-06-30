<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import api, { ENDPOINTS, BASE_URL } from '@/api'
import translateText from '@/utils/translete.js'

const { proxy } = getCurrentInstance()
const customersStore = useCustomersStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const activeTab = ref('customers')
const search = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const archivedUsers = ref([])
const loadingUsers = ref(false)
const selectedC = ref([])
const selectedU = ref([])
const allUsers = ref([])

onMounted(async () => {
    customersStore.fetchArchived()
    await fetchArchivedUsers()
    const [{ data: a }, { data: b }] = await Promise.all([
        api.get(ENDPOINTS.ALL_USERS),
        api.get(ENDPOINTS.ALL_USERS, { params: { archived: true } }),
    ])
    allUsers.value = [...a, ...b]
})

const userName = (id) => {
    if (!id) return '—'
    const u = allUsers.value.find(u => u.id === id)
    return u ? `${u.surname} ${u.name}` : '—'
}

const fetchArchivedUsers = async () => {
    loadingUsers.value = true
    try {
        const { data } = await api.get(ENDPOINTS.ALL_USERS, { params: { archived: true } })
        archivedUsers.value = data
    } finally { loadingUsers.value = false }
}

const filterByDate = (item) => {
    const d = item.archivedAt ? new Date(item.archivedAt) : null
    const from = dateFrom.value ? new Date(dateFrom.value) : null
    const to = dateTo.value ? new Date(dateTo.value + 'T23:59:59') : null
    return (!from || (d && d >= from)) && (!to || (d && d <= to))
}

const filteredCustomers = computed(() => {
    const q = search.value.toLowerCase()
    const m = (val) => { const v = val?.toLowerCase() || ''; return v.includes(q) || translateText(v).toLowerCase().includes(q) }
    return customersStore.archived.filter(c =>
        (!q || m(c.name) || m(c.surname) || c.phone?.includes(q)) &&
        filterByDate(c)
    )
})

const filteredUsers = computed(() => {
    const q = search.value.toLowerCase()
    const m = (val) => { const v = val?.toLowerCase() || ''; return v.includes(q) || translateText(v).toLowerCase().includes(q) }
    return archivedUsers.value.filter(u =>
        (!q || m(u.name) || m(u.surname) || m(u.username)) &&
        filterByDate(u)
    )
})

const allCChecked = computed(() => filteredCustomers.value.length > 0 && filteredCustomers.value.every(c => selectedC.value.includes(c.id)))
const indC = computed(() => selectedC.value.length > 0 && !allCChecked.value)
const toggleAllC = () => {
    if (allCChecked.value) selectedC.value = selectedC.value.filter(id => !filteredCustomers.value.find(c => c.id === id))
    else selectedC.value = [...new Set([...selectedC.value, ...filteredCustomers.value.map(c => c.id)])]
}
const toggleC = (id) => selectedC.value.includes(id) ? selectedC.value = selectedC.value.filter(x => x !== id) : selectedC.value.push(id)

const allUChecked = computed(() => filteredUsers.value.length > 0 && filteredUsers.value.every(u => selectedU.value.includes(u.id)))
const indU = computed(() => selectedU.value.length > 0 && !allUChecked.value)
const toggleAllU = () => {
    if (allUChecked.value) selectedU.value = selectedU.value.filter(id => !filteredUsers.value.find(u => u.id === id))
    else selectedU.value = [...new Set([...selectedU.value, ...filteredUsers.value.map(u => u.id)])]
}
const toggleU = (id) => selectedU.value.includes(id) ? selectedU.value = selectedU.value.filter(x => x !== id) : selectedU.value.push(id)

const restoreCustomer = async (c) => {
    if (!confirm(`"${c.surname} ${c.name}" ni qaytarasizmi?`)) return
    await customersStore.restoreCustomer(c.id)
    selectedC.value = selectedC.value.filter(x => x !== c.id)
}
const deleteCustomer = async (c) => {
    if (!confirm(`"${c.surname} ${c.name}" ni butunlay o'chirasizmi?`)) return
    await customersStore.deleteCustomer(c.id)
    selectedC.value = selectedC.value.filter(x => x !== c.id)
}
const restoreSelectedC = async () => {
    if (!confirm(`${selectedC.value.length} ta mijozni qaytarasizmi?`)) return
    for (const id of selectedC.value) await customersStore.restoreCustomer(id)
    selectedC.value = []
}
const deleteSelectedC = async () => {
    if (!confirm(`${selectedC.value.length} ta mijozni butunlay o'chirasizmi?`)) return
    for (const id of selectedC.value) await customersStore.deleteCustomer(id)
    selectedC.value = []
}

const restoreUser = async (u) => {
    if (!confirm(`"${u.surname} ${u.name}" ni qaytarasizmi?`)) return
    try {
        await api.put(ENDPOINTS.USER_RESTORE(u.id))
        await fetchArchivedUsers()
        selectedU.value = selectedU.value.filter(x => x !== u.id)
    } catch (err) { console.error(err) }
}
const deleteUser = async (u) => {
    if (!confirm(`"${u.surname} ${u.name}" ni butunlay o'chirasizmi?`)) return
    try {
        await api.delete(ENDPOINTS.USER(u.id))
        await fetchArchivedUsers()
        selectedU.value = selectedU.value.filter(x => x !== u.id)
    } catch (err) { console.error(err) }
}
const restoreSelectedU = async () => {
    if (!confirm(`${selectedU.value.length} ta ishchini qaytarasizmi?`)) return
    for (const id of selectedU.value) await api.put(ENDPOINTS.USER_RESTORE(id))
    await fetchArchivedUsers()
    selectedU.value = []
}
const deleteSelectedU = async () => {
    if (!confirm(`${selectedU.value.length} ta ishchini butunlay o'chirasizmi?`)) return
    for (const id of selectedU.value) await api.delete(ENDPOINTS.USER(id))
    await fetchArchivedUsers()
    selectedU.value = []
}

const switchTab = (tab) => { activeTab.value = tab; search.value = ''; dateFrom.value = ''; dateTo.value = ''; selectedC.value = []; selectedU.value = [] }
const clearFilters = () => { search.value = ''; dateFrom.value = ''; dateTo.value = '' }
const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ') : '—'
const roleLabel = (r) => ({
  ADMIN: proxy.$t('Administrator'),
  RAHBAR: proxy.$t('Rahbar'),
  YURIST: proxy.$t('Yurist'),
  KASSIR: proxy.$t('Kassir'),
}[r] || r)

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  RAHBAR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  YURIST: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  KASSIR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

const paymentTypeLabels = computed(() => ({
  NAQD: proxy.$t('Naqd pul'),
  KARTA: proxy.$t('Plastik karta'),
  PUL_OTKAZISH: proxy.$t("Pul o'tkazish"),
}))

const formatMoney = (amount) => {
  if (!amount) return '—'
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount)
}
</script>

<template>
    <div class="space-y-5">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold" :style="themeStore.isDark ? 'color:#ddeaff' : 'color:#1a1f36'">{{ $t('Arxiv') }}</h1>
                <p class="text-sm mt-0.5" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">{{ $t('Arxivlangan mijozlar va ishchilar') }}</p>
            </div>
            <button v-if="search || dateFrom || dateTo" @click="clearFilters"
                class="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
                :style="themeStore.isDark
                    ? 'color:#7aaad4; background:#3a6090; border:1px solid #3a6090;'
                    : 'color:#4a5568; background:#ffffff; border:1px solid #d8dde6;'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {{ $t('Filtrni tozalash') }}
            </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 p-1 rounded w-fit" :style="themeStore.isDark ? 'background:#3a6090; border:1px solid #3a6090;' : 'background:#eaecf0; border:1px solid #d8dde6;'">
            <button @click="switchTab('customers')"
                class="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all"
                :style="activeTab === 'customers'
                    ? 'background:#1A3A6B; color:#ffffff;'
                    : themeStore.isDark ? 'color:#7aaad4;' : 'color:#4a5568;'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ $t('Mijozlar') }}
                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :style="activeTab === 'customers' ? 'background:rgba(255,255,255,0.2); color:#fff;' : themeStore.isDark ? 'background:#3a6090; color:#7aaad4;' : 'background:#d8dde6; color:#4a5568;'">
                    {{ customersStore.archived.length }}
                </span>
            </button>
            <button @click="switchTab('users')"
                class="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all"
                :style="activeTab === 'users'
                    ? 'background:#1A3A6B; color:#ffffff;'
                    : themeStore.isDark ? 'color:#7aaad4;' : 'color:#4a5568;'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ $t('Ishchilar') }}
                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :style="activeTab === 'users' ? 'background:rgba(255,255,255,0.2); color:#fff;' : themeStore.isDark ? 'background:#3a6090; color:#7aaad4;' : 'background:#d8dde6; color:#4a5568;'">
                    {{ archivedUsers.length }}
                </span>
            </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row gap-3 flex-wrap">
            <div class="flex-1 min-w-[200px] relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#8892a4;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input v-model="search" type="text"
                    :placeholder="activeTab === 'customers' ? $t('Ism, familiya yoki telefon...') : $t('Ism, familiya yoki login...')"
                    class="w-full pl-10 pr-4 py-2.5 rounded text-sm transition-all focus:outline-none"
                    :style="themeStore.isDark
                        ? 'background:#264a75; border:1px solid #3a6090; color:#ddeaff;'
                        : 'background:#ffffff; border:1px solid #d8dde6; color:#1a1f36;'" />
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-medium shrink-0" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">{{ $t('Arxiv sanasi:') }}</span>
                <input v-model="dateFrom" type="date"
                    class="px-3 py-2 rounded text-sm focus:outline-none transition-all"
                    :style="themeStore.isDark
                        ? 'background:#264a75; border:1px solid #3a6090; color:#ddeaff;'
                        : 'background:#ffffff; border:1px solid #d8dde6; color:#1a1f36;'" />
                <span style="color:#8892a4;">—</span>
                <input v-model="dateTo" type="date"
                    class="px-3 py-2 rounded text-sm focus:outline-none transition-all"
                    :style="themeStore.isDark
                        ? 'background:#264a75; border:1px solid #3a6090; color:#ddeaff;'
                        : 'background:#ffffff; border:1px solid #d8dde6; color:#1a1f36;'" />
            </div>
        </div>

        <!-- Bulk bar customers -->
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="activeTab === 'customers' && selectedC.length > 0"
                class="flex items-center justify-between px-5 py-3 rounded"
                :style="themeStore.isDark ? 'background:#264a75; border:1px solid #3a6090;' : 'background:#eef2f7; border:1px solid #d8dde6;'">
                <span class="text-sm font-medium" :style="themeStore.isDark ? 'color:#7aaad4' : 'color:#1a1f36'">{{ selectedC.length }} {{ $t('ta tanlandi') }}</span>
                <div class="flex gap-2">
                    <button @click="selectedC = []" class="px-4 py-1.5 rounded text-sm transition-colors" :style="themeStore.isDark ? 'color:#7aaad4;' : 'color:#4a5568;'">{{ $t('Bekor qilish') }}</button>
                    <button @click="restoreSelectedC"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        {{ $t('Qaytarish') }}
                    </button>
                    <button @click="deleteSelectedC"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {{ $t('O\'chirish') }}
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Bulk bar users -->
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="activeTab === 'users' && selectedU.length > 0"
                class="flex items-center justify-between px-5 py-3 rounded"
                :style="themeStore.isDark ? 'background:#264a75; border:1px solid #3a6090;' : 'background:#eef2f7; border:1px solid #d8dde6;'">
                <span class="text-sm font-medium" :style="themeStore.isDark ? 'color:#7aaad4' : 'color:#1a1f36'">{{ selectedU.length }} {{ $t('ta tanlandi') }}</span>
                <div class="flex gap-2">
                    <button @click="selectedU = []" class="px-4 py-1.5 rounded text-sm transition-colors" :style="themeStore.isDark ? 'color:#7aaad4;' : 'color:#4a5568;'">{{ $t('Bekor qilish') }}</button>
                    <button @click="restoreSelectedU"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        {{ $t('Qaytarish') }}
                    </button>
                    <button @click="deleteSelectedU"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {{ $t('O\'chirish') }}
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Select all customers bar -->
        <div v-if="activeTab === 'customers' && filteredCustomers.length > 0"
            class="flex items-center gap-3 px-1">
            <AppCheckbox :checked="allCChecked" :indeterminate="indC" @change="toggleAllC" />
            <span class="text-xs font-medium" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                {{ $t('Barchasini tanlash') }} ({{ filteredCustomers.length }})
            </span>
        </div>

        <!-- Customers Cards Grid -->
        <div v-if="activeTab === 'customers'">
            <div v-if="customersStore.loading" class="flex items-center justify-center py-16 gap-3"
                :class="themeStore.isDark ? 'text-blue-400/50' : 'text-blue-400'">
                <div class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
                {{ $t('Yuklanmoqda...') }}
            </div>
            <div v-else-if="filteredCustomers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div v-for="c in filteredCustomers" :key="c.id"
                    class="relative rounded p-5 transition-all duration-200 group"
                    :style="[
                        themeStore.isDark
                            ? 'background:#264a75; border:1px solid ' + (selectedC.includes(c.id) ? '#b45309' : '#3a6090') + ';'
                            : 'background:#ffffff; border:1px solid ' + (selectedC.includes(c.id) ? '#b45309' : '#d8dde6') + ';'
                    ]">

                    <!-- Archive badge -->
                    <div class="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        :class="themeStore.isDark ? 'bg-amber-900/30 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'">
                        <svg class="w-3 h-3" :class="themeStore.isDark ? 'text-amber-400' : 'text-amber-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span class="text-[10px] font-bold" :class="themeStore.isDark ? 'text-amber-400' : 'text-amber-600'">{{ formatDate(c.archivedAt) }}</span>
                    </div>

                    <!-- Checkbox -->
                    <div class="absolute top-3 right-3 z-10">
                        <AppCheckbox :checked="selectedC.includes(c.id)" @change="toggleC(c.id)" />
                    </div>

                    <!-- Avatar + Name -->
                    <div class="flex items-start gap-3 mt-7 mb-4">
                        <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0"
                            style="background:#1A3A6B;">
                            {{ ($t(c.surname) || $t(c.name) || '?')[0].toUpperCase() }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm truncate"
                                :style="themeStore.isDark ? 'color:#ddeaff' : 'color:#1a1f36'">
                                {{ $t(c.surname) }} {{ $t(c.name) }}
                            </p>
                            <p class="text-xs mt-0.5 truncate"
                                :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'">
                                {{ $t(c.father_name) || '' }}
                            </p>
                        </div>
                    </div>

                    <!-- Info rows -->
                    <div class="space-y-2 mb-4">
                        <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 shrink-0" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            <span class="text-xs" :style="themeStore.isDark ? 'color:#7aaad4' : 'color:#4a5568'">{{ c.phone }}</span>
                        </div>
                        <div v-if="c.assignedTo" class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 shrink-0" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                            </svg>
                            <span class="text-xs truncate" :style="themeStore.isDark ? 'color:#7aaad4' : 'color:#4a5568'">
                                {{ $t(c.assignedTo?.surname) }} {{ $t(c.assignedTo?.name) }}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 shrink-0" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                            </svg>
                            <span class="text-xs" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'">
                                {{ $t('Kim arxivlagan:') }} {{ $t(userName(c.archivedBy)) }}
                            </span>
                        </div>
                    </div>



                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button @click="restoreCustomer(c)"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            :class="themeStore.isDark
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/50'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            {{ $t('Qaytarish') }}
                        </button>
                        <button @click="deleteCustomer(c)"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            :class="themeStore.isDark
                                ? 'bg-red-900/30 text-red-400 border border-red-500/20 hover:bg-red-900/50'
                                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {{ $t('O\'chirish') }}
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-20 h-20 rounded flex items-center justify-center" :style="themeStore.isDark ? 'background:#3a6090' : 'background:#eaecf0'">
                    <svg class="w-10 h-10" :style="themeStore.isDark ? 'color:#3a6090' : 'color:#c1c9d6'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                </div>
                <p class="text-sm" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'">{{ $t('Arxivda mijoz topilmadi') }}</p>
            </div>
        </div>

        <!-- Select all users bar -->
        <div v-if="activeTab === 'users' && filteredUsers.length > 0"
            class="flex items-center gap-3 px-1">
            <AppCheckbox :checked="allUChecked" :indeterminate="indU" @change="toggleAllU" />
            <span class="text-xs font-medium" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                {{ $t('Barchasini tanlash') }} ({{ filteredUsers.length }})
            </span>
        </div>

        <!-- Users Cards Grid -->
        <div v-if="activeTab === 'users'">
            <div v-if="loadingUsers" class="flex items-center justify-center py-16 gap-3"
                :class="themeStore.isDark ? 'text-blue-400/50' : 'text-blue-400'">
                <div class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
                {{ $t('Yuklanmoqda...') }}
            </div>
            <div v-else-if="filteredUsers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div v-for="u in filteredUsers" :key="u.id"
                    class="relative rounded p-5 transition-all duration-200"
                    :style="[
                        themeStore.isDark
                            ? 'background:#264a75; border:1px solid ' + (selectedU.includes(u.id) ? '#b45309' : '#3a6090') + ';'
                            : 'background:#ffffff; border:1px solid ' + (selectedU.includes(u.id) ? '#b45309' : '#d8dde6') + ';'
                    ]">

                    <!-- Archive badge -->
                    <div class="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        :class="themeStore.isDark ? 'bg-amber-900/30 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'">
                        <svg class="w-3 h-3" :class="themeStore.isDark ? 'text-amber-400' : 'text-amber-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span class="text-[10px] font-bold" :class="themeStore.isDark ? 'text-amber-400' : 'text-amber-600'">{{ formatDate(u.archivedAt) }}</span>
                    </div>

                    <!-- Checkbox -->
                    <div class="absolute top-3 right-3 z-10">
                        <AppCheckbox :checked="selectedU.includes(u.id)" @change="toggleU(u.id)" />
                    </div>

                    <!-- Avatar + Name -->
                    <div class="flex items-center gap-3 mt-7 mb-4">
                        <div class="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border"
                            :class="themeStore.isDark ? 'border-slate-600/50 bg-slate-700' : 'border-slate-200 bg-slate-100'">
                            <img v-if="u.img" :src="`${BASE_URL}${u.img}`" class="w-full h-full object-cover" />
                            <img v-else src="../../public/User-avatar.svg.png" class="w-full h-full object-cover opacity-60" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm truncate"
                                :class="themeStore.isDark ? 'text-white' : 'text-blue-900'">
                                {{ $t(u.surname) }} {{ $t(u.name) }}
                            </p>
                            <p class="text-xs mt-0.5 truncate font-mono"
                                :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'">
                                @{{ u.username }}
                            </p>
                        </div>
                    </div>

                    <!-- Role badge -->
                    <div class="flex items-center gap-2 mb-4">
                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold" :class="roleColors[u.role] || 'bg-slate-100 text-slate-600'">
                            {{ roleLabel(u.role) }}
                        </span>
                    </div>

                    <!-- Info -->
                    <div class="space-y-2 mb-4">
                        <div v-if="u.phone" class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 shrink-0" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            <span class="text-xs" :style="themeStore.isDark ? 'color:#7aaad4' : 'color:#4a5568'">{{ u.phone }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 shrink-0" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                            </svg>
                            <span class="text-xs" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'">
                                {{ $t('Kim arxivlagan:') }} {{ $t(userName(u.archivedBy)) }}
                            </span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button @click="restoreUser(u)"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            :class="themeStore.isDark
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/50'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            {{ $t('Qaytarish') }}
                        </button>
                        <button @click="deleteUser(u)"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            :class="themeStore.isDark
                                ? 'bg-red-900/30 text-red-400 border border-red-500/20 hover:bg-red-900/50'
                                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {{ $t('O\'chirish') }}
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-20 h-20 rounded flex items-center justify-center" :style="themeStore.isDark ? 'background:#3a6090' : 'background:#eaecf0'">
                    <svg class="w-10 h-10" :style="themeStore.isDark ? 'color:#3a6090' : 'color:#c1c9d6'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <p class="text-sm" :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#8892a4'">{{ $t('Arxivda ishchi topilmadi') }}</p>
            </div>
        </div>
    </div>
</template>
