<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'

const customersStore = useCustomersStore()
const authStore = useAuthStore()

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
    const res = await fetch('http://localhost:4000/api/auth/all-users', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const archived = await fetch('http://localhost:4000/api/auth/all-users?archived=true', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const a = await res.json()
    const b = await archived.json()
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
        const res = await fetch('http://localhost:4000/api/auth/all-users?archived=true', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        })
        archivedUsers.value = await res.json()
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
    return customersStore.archived.filter(c =>
        (!q || c.name?.toLowerCase().includes(q) || c.surname?.toLowerCase().includes(q) || c.phone?.includes(q)) &&
        filterByDate(c)
    )
})

const filteredUsers = computed(() => {
    const q = search.value.toLowerCase()
    return archivedUsers.value.filter(u =>
        (!q || u.name?.toLowerCase().includes(q) || u.surname?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q)) &&
        filterByDate(u)
    )
})

// Customers bulk
const allCChecked = computed(() => filteredCustomers.value.length > 0 && filteredCustomers.value.every(c => selectedC.value.includes(c.id)))
const indC = computed(() => selectedC.value.length > 0 && !allCChecked.value)
const toggleAllC = () => {
    if (allCChecked.value) selectedC.value = selectedC.value.filter(id => !filteredCustomers.value.find(c => c.id === id))
    else selectedC.value = [...new Set([...selectedC.value, ...filteredCustomers.value.map(c => c.id)])]
}
const toggleC = (id) => selectedC.value.includes(id) ? selectedC.value = selectedC.value.filter(x => x !== id) : selectedC.value.push(id)

// Users bulk
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

const apiHeaders = () => ({ 'Authorization': `Bearer ${authStore.token}` })

const restoreUser = async (u) => {
    if (!confirm(`"${u.surname} ${u.name}" ni qaytarasizmi?`)) return
    const res = await fetch(`http://localhost:4000/api/users/${u.id}/restore`, { method: 'PUT', headers: apiHeaders() })
    if (res.ok) { await fetchArchivedUsers(); selectedU.value = selectedU.value.filter(x => x !== u.id) }
}
const deleteUser = async (u) => {
    if (!confirm(`"${u.surname} ${u.name}" ni butunlay o'chirasizmi?`)) return
    const res = await fetch(`http://localhost:4000/api/users/${u.id}`, { method: 'DELETE', headers: apiHeaders() })
    if (res.ok) { await fetchArchivedUsers(); selectedU.value = selectedU.value.filter(x => x !== u.id) }
}
const restoreSelectedU = async () => {
    if (!confirm(`${selectedU.value.length} ta ishchini qaytarasizmi?`)) return
    for (const id of selectedU.value) await fetch(`http://localhost:4000/api/users/${id}/restore`, { method: 'PUT', headers: apiHeaders() })
    await fetchArchivedUsers(); selectedU.value = []
}
const deleteSelectedU = async () => {
    if (!confirm(`${selectedU.value.length} ta ishchini butunlay o'chirasizmi?`)) return
    for (const id of selectedU.value) await fetch(`http://localhost:4000/api/users/${id}`, { method: 'DELETE', headers: apiHeaders() })
    await fetchArchivedUsers(); selectedU.value = []
}

const switchTab = (tab) => { activeTab.value = tab; search.value = ''; dateFrom.value = ''; dateTo.value = ''; selectedC.value = []; selectedU.value = [] }
const clearFilters = () => { search.value = ''; dateFrom.value = ''; dateTo.value = '' }
const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ') : '—'
const roleLabel = (r) => ({ ADMIN: 'Administrator', RAHBAR: 'Rahbar', YURIST: 'Yurist', KASSIR: 'Kassir' }[r] || r)

const paymentTypeLabels = {
  NAQD: 'Naqd pul',
  KARTA: 'Plastik karta',
  PUL_OTKAZISH: 'Pul o\'tkazish'
}

const formatMoney = (amount) => {
  if (!amount) return '—'
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount) + ' so\'m'
}
</script>

<template>
    <div class="space-y-5">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-[#0a1850] dark:text-white">Arxiv</h1>
                <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Arxivlangan mijozlar va ishchilar</p>
            </div>
            <button v-if="search || dateFrom || dateTo" @click="clearFilters"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Filtrni tozalash
            </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
            <button @click="switchTab('customers')"
                class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
                :class="activeTab === 'customers' ? 'bg-white dark:bg-slate-700 text-[#0a1850] dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mijozlar
                <span class="px-1.5 py-0.5 rounded-full text-xs font-semibold"
                    :class="activeTab === 'customers' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'">
                    {{ customersStore.archived.length }}
                </span>
            </button>
            <button @click="switchTab('users')"
                class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
                :class="activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-[#0a1850] dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ishchilar
                <span class="px-1.5 py-0.5 rounded-full text-xs font-semibold"
                    :class="activeTab === 'users' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'">
                    {{ archivedUsers.length }}
                </span>
            </button>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 flex flex-col md:flex-row gap-3 flex-wrap">
            <div class="flex-1 min-w-[200px] relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input v-model="search" type="text"
                    :placeholder="activeTab === 'customers' ? 'Ism, familiya yoki telefon...' : 'Ism, familiya yoki login...'"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-600/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all" />
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">Arxiv sanasi:</span>
                <input v-model="dateFrom" type="date"
                    class="px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
                <span class="text-slate-300 dark:text-slate-600">—</span>
                <input v-model="dateTo" type="date"
                    class="px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
        </div>

        <!-- Bulk bar customers -->
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="activeTab === 'customers' && selectedC.length > 0"
                class="flex items-center justify-between px-5 py-3 bg-blue-800/90 dark:bg-blue-900/40 border border-blue-800/40 dark:border-blue-700/40 rounded-2xl shadow-lg">
                <span class="text-blue-200 text-sm font-medium">{{ selectedC.length }} ta tanlandi</span>
                <div class="flex gap-2">
                    <button @click="selectedC = []" class="px-4 py-1.5 rounded-lg text-sm text-blue-300 hover:text-white hover:bg-white/10 transition-colors">Bekor qilish</button>
                    <button @click="restoreSelectedC"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Qaytarish
                    </button>
                    <button @click="deleteSelectedC"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        O'chirish
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Bulk bar users -->
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="activeTab === 'users' && selectedU.length > 0"
                class="flex items-center justify-between px-5 py-3 bg-blue-800/90 dark:bg-blue-900/40 border border-blue-800/40 dark:border-blue-700/40 rounded-2xl shadow-lg">
                <span class="text-blue-200 text-sm font-medium">{{ selectedU.length }} ta tanlandi</span>
                <div class="flex gap-2">
                    <button @click="selectedU = []" class="px-4 py-1.5 rounded-lg text-sm text-blue-300 hover:text-white hover:bg-white/10 transition-colors">Bekor qilish</button>
                    <button @click="restoreSelectedU"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Qaytarish
                    </button>
                    <button @click="deleteSelectedU"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        O'chirish
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Customers table -->
        <div v-if="activeTab === 'customers'" class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
            <div v-if="customersStore.loading" class="p-12 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                <div class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                Yuklanmoqda...
            </div>
            <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[620px]">
                    <thead>
                        <tr class="border-b border-slate-100 dark:border-slate-700/60 bg-amber-50/30 dark:bg-amber-900/5">
                            <th class="px-4 py-3.5 w-10">
                                <AppCheckbox :checked="allCChecked" :indeterminate="indC" @change="toggleAllC" />
                            </th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mijoz</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Telefon</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mas'ul yurist</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To'lov</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wider">Arxiv sanasi</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kim arxivlagan</th>
                            <th class="px-4 py-3.5 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amallar</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                        <tr v-for="c in filteredCustomers" :key="c.id"
                            :class="selectedC.includes(c.id) ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/20'"
                            class="transition-colors group">
                            <td class="px-4 py-3.5">
                                <AppCheckbox :checked="selectedC.includes(c.id)" @change="toggleC(c.id)" />
                            </td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-slate-200 text-sm">{{ c.surname }} {{ c.name }} {{ c.father_name }}</p>
                                        <p v-if="c.description" class="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">{{ c.description }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                                <p>{{ c.phone }}</p>
                                <p v-if="c.phone2" class="text-xs text-slate-400 dark:text-slate-500">{{ c.phone2 }}</p>
                            </td>
                            <td class="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                {{ c.assignedTo ? `${c.assignedTo.surname} ${c.assignedTo.name}` : '—' }}
                            </td>
                            <td class="px-4 py-3.5 text-sm">
                                <div>
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">Shartnoma:</span>
                                        <span class="font-semibold text-slate-800 dark:text-slate-200">{{ formatMoney(c.price) }}</span>
                                    </div>
                                    
                                    <div class="flex items-center gap-1.5 mt-1">
                                        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">To'landi:</span>
                                        <span class="font-medium text-emerald-600 dark:text-emerald-400">
                                            {{ formatMoney(c.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0) }}
                                        </span>
                                        <span v-if="c.payments && c.payments.length > 0" class="text-[10px] text-slate-400 dark:text-slate-500">
                                            ({{ paymentTypeLabels[c.payments[0].type] || c.payments[0].type }})
                                        </span>
                                    </div>
                                    
                                    <div v-if="(c.price || 0) - (c.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0) > 0" class="flex items-center gap-1.5 mt-1">
                                        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">Qarz:</span>
                                        <span class="font-bold text-red-600 dark:text-red-400">
                                            {{ formatMoney((c.price || 0) - (c.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0)) }}
                                        </span>
                                    </div>
                                    <div v-else-if="c.price > 0" class="flex items-center gap-1.5 mt-1">
                                        <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-semibold">To'liq to'langan</span>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3.5 text-sm font-medium text-amber-600 dark:text-amber-400">{{ formatDate(c.archivedAt) }}</td>
                            <td class="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ userName(c.archivedBy) }}</td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="restoreCustomer(c)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all" title="Qaytarish">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                    </button>
                                    <button @click="deleteCustomer(c)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="O'chirish">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredCustomers.length === 0">
                            <td colspan="8" class="px-6 py-16 text-center">
                                <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    <p class="text-sm">Arxivda mijoz topilmadi</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Users table -->
        <div v-if="activeTab === 'users'" class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
            <div v-if="loadingUsers" class="p-12 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                <div class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                Yuklanmoqda...
            </div>
            <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[620px]">
                    <thead>
                        <tr class="border-b border-slate-100 dark:border-slate-700/60 bg-amber-50/30 dark:bg-amber-900/5">
                            <th class="px-4 py-3.5 w-10">
                                <AppCheckbox :checked="allUChecked" :indeterminate="indU" @change="toggleAllU" />
                            </th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ishchi</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lavozim</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Login</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wider">Arxiv sanasi</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kim arxivlagan</th>
                            <th class="px-4 py-3.5 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amallar</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                        <tr v-for="u in filteredUsers" :key="u.id"
                            :class="selectedU.includes(u.id) ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/20'"
                            class="transition-colors group">
                            <td class="px-4 py-3.5">
                                <AppCheckbox :checked="selectedU.includes(u.id)" @change="toggleU(u.id)" />
                            </td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600/50 shrink-0 bg-slate-100 dark:bg-slate-700">
                                        <img v-if="u.img" :src="`http://localhost:4000${u.img}`" class="w-full h-full object-cover" />
                                        <img v-else src="../../public/User-avatar.svg.png" class="w-full h-full object-cover opacity-60" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-slate-200 text-sm">{{ u.surname }} {{ u.name }}</p>
                                        <p class="text-xs text-slate-400 dark:text-slate-500">{{ u.phone }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3.5">
                                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" :class="{
                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300': u.role === 'ADMIN',
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': u.role === 'RAHBAR',
                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300': u.role === 'YURIST',
                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300': u.role === 'KASSIR',
                                }">{{ roleLabel(u.role) }}</span>
                            </td>
                            <td class="px-4 py-3.5 text-sm font-mono text-slate-600 dark:text-slate-400">{{ u.username }}</td>
                            <td class="px-4 py-3.5 text-sm font-medium text-amber-600 dark:text-amber-400">{{ formatDate(u.archivedAt) }}</td>
                            <td class="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ userName(u.archivedBy) }}</td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="restoreUser(u)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all" title="Qaytarish">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                    </button>
                                    <button @click="deleteUser(u)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="O'chirish">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredUsers.length === 0">
                            <td colspan="7" class="px-6 py-16 text-center">
                                <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    <p class="text-sm">Arxivda ishchi topilmadi</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
