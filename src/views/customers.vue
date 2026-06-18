<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import CustomerModal from '@/components/customers/CustomerModal.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'

const store = useCustomersStore()
const search = ref('')
const showModal = ref(false)
const editing = ref(null)
const selected = ref([])

onMounted(() => store.fetchCustomers())

const filtered = computed(() => {
    const q = search.value.toLowerCase()
    return store.customers.filter(c =>
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.surname?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.address?.toLowerCase().includes(q)
    )
})

const allChecked = computed(() =>
    filtered.value.length > 0 && filtered.value.every(c => selected.value.includes(c.id))
)
const indeterminate = computed(() => selected.value.length > 0 && !allChecked.value)

const toggleAll = () => {
    if (allChecked.value) selected.value = selected.value.filter(id => !filtered.value.find(c => c.id === id))
    else selected.value = [...new Set([...selected.value, ...filtered.value.map(c => c.id)])]
}
const toggleOne = (id) => {
    if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
    else selected.value.push(id)
}

const openCreate = () => { editing.value = null; showModal.value = true }
const openEdit = (c) => { editing.value = { ...c }; showModal.value = true }

const archive = async (c) => {
    if (!confirm(`"${c.surname} ${c.name}" ni o'chirasizmi?`)) return
    await store.archiveCustomer(c.id)
    selected.value = selected.value.filter(x => x !== c.id)
}

const archiveSelected = async () => {
    if (!selected.value.length) return
    if (!confirm(`${selected.value.length} ta mijozni o'chirasizmi?`)) return
    for (const id of selected.value) await store.archiveCustomer(id)
    selected.value = []
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ') : '—'
</script>

<template>
    <div class="space-y-5">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-[#0a1850] dark:text-white">Mijozlar</h1>
                <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Faol mijozlar — jami {{ store.customers.length }} ta</p>
            </div>
            <button @click="openCreate"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium btn-primary shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Yangi mijoz
            </button>
        </div>

        <!-- Search -->
        <div class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl border border-indigo-100 dark:border-slate-700/60 p-4">
            <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input v-model="search" type="text" placeholder="Ism, familiya, telefon yoki manzil..."
                    class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-600/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all" />
            </div>
        </div>

        <!-- Bulk bar -->
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="selected.length > 0"
                class="flex items-center justify-between px-5 py-3 bg-indigo-100 dark:bg-blue-900/40 border border-indigo-200 dark:border-blue-700/40 rounded-2xl shadow-lg">
                <span class="text-indigo-700 dark:text-blue-200 text-sm font-medium">{{ selected.length }} ta tanlandi</span>
                <div class="flex gap-2">
                    <button @click="selected = []" class="px-4 py-1.5 rounded-lg text-sm text-indigo-600 dark:text-blue-300 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-200/60 dark:hover:bg-white/10 transition-colors">Bekor qilish</button>
                    <button @click="archiveSelected"
                        class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                         O'chirish
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Table -->
        <div class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700/60 overflow-hidden">
            <div v-if="store.loading" class="p-12 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                <div class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                Yuklanmoqda...
            </div>
            <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[680px]">
                    <thead>
                        <tr class="border-b border-indigo-100 dark:border-slate-700/60 bg-indigo-50/60 dark:bg-slate-700/30">
                            <th class="px-4 py-3.5 w-10">
                                <AppCheckbox :checked="allChecked" :indeterminate="indeterminate" @change="toggleAll" />
                            </th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Mijoz</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Telefon</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Manzil</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Mas'ul yurist</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Sana</th>
                            <th class="px-4 py-3.5 text-center text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Amallar</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-indigo-100/70 dark:divide-slate-700/50">
                        <tr v-for="c in filtered" :key="c.id"
                            :class="selected.includes(c.id) ? 'bg-indigo-50 dark:bg-blue-900/10' : 'hover:bg-indigo-50/60 dark:hover:bg-slate-700/20'"
                            class="transition-colors group">
                            <td class="px-4 py-3.5">
                                <AppCheckbox :checked="selected.includes(c.id)" @change="toggleOne(c.id)" />
                            </td>
                            <td class="px-4 py-3.5">
                                <p class="font-medium text-slate-800 dark:text-slate-100 text-sm">{{ c.surname }} {{ c.name }} {{ c.father_name }}</p>
                                <p v-if="c.description" class="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{{ c.description }}</p>
                            </td>
                            <td class="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                                <p>{{ c.phone }}</p>
                                <p v-if="c.phone2" class="text-xs text-slate-400 dark:text-slate-500">{{ c.phone2 }}</p>
                            </td>
                            <td class="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ c.address || '—' }}</td>
                            <td class="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                {{ c.assignedTo ? `${c.assignedTo.surname} ${c.assignedTo.name}` : '—' }}
                            </td>
                            <td class="px-4 py-3.5 text-sm text-slate-400 dark:text-slate-500">{{ formatDate(c.createdAt) }}</td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="openEdit(c)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all" title="Tahrirlash">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" />
                                        </svg>
                                    </button>
                                    <button @click="archive(c)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all" title="Arxivlash">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filtered.length === 0">
                            <td colspan="7" class="px-6 py-14 text-center">
                                <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p class="text-sm">Mijoz topilmadi</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <CustomerModal v-if="showModal" :editing="editing" @close="showModal = false" @saved="store.fetchCustomers()" />
</template>

<style scoped>
.btn-primary { background: linear-gradient(135deg, #2142c8, #2f49d0); 
    cursor: pointer;
}
.btn-primary:hover { background: linear-gradient(135deg, #1a2e7a, #2a3e9a); }
</style>
