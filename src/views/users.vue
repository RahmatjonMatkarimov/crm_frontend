<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserModalStore } from '@/stores/users.modal'
import UsersModal from '@/components/users/users.modal.vue'
import UsersModalUpdate from '@/components/users/usersUpdateModal.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'

const authStore = useAuthStore()
const userModalStore = useUserModalStore()

const users = ref([])
const searchQuery = ref('')
const selectedRole = ref('all')
const loading = ref(false)
const selected = ref([])

const fetchUsers = async () => {
    loading.value = true
    selected.value = []
    try {
        const res = await fetch('http://localhost:4000/api/auth/all-users', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        })
        users.value = await res.json()
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

onMounted(() => fetchUsers())

const filteredUsers = computed(() => {
    return users.value.filter(user => {
        const q = searchQuery.value.toLowerCase()
        const matchSearch =
            (user.name?.toLowerCase() || '').includes(q) ||
            (user.surname?.toLowerCase() || '').includes(q) ||
            (user.username?.toLowerCase() || '').includes(q)
        const matchRole = selectedRole.value === 'all' || user.role === selectedRole.value
        return matchSearch && matchRole
    })
})

const roles = [
    { value: 'all', label: 'Barchasi' },
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'RAHBAR', label: 'Rahbar' },
    { value: 'YURIST', label: 'Yurist' },
    { value: 'KASSIR', label: 'Kassir' },
]

const allChecked = computed(() =>
    filteredUsers.value.length > 0 && filteredUsers.value.every(u => selected.value.includes(u.id))
)
const indeterminate = computed(() =>
    selected.value.length > 0 && !allChecked.value
)

const toggleAll = () => {
    if (allChecked.value) {
        selected.value = selected.value.filter(id => !filteredUsers.value.find(u => u.id === id))
    } else {
        const ids = filteredUsers.value.map(u => u.id)
        selected.value = [...new Set([...selected.value, ...ids])]
    }
}
const toggleOne = (id) => {
    if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
    else selected.value.push(id)
}

const archiveUser = async (user) => {
    if (!confirm(`"${user.surname} ${user.name}" ni o'chirasizmi?`)) return
    const result = await authStore.archiveUser(user.id)
    if (result?.success) await fetchUsers()
    else alert(result?.error || 'Xatolik')
}

const archiveSelected = async () => {
    if (!selected.value.length) return
    if (!confirm(`${selected.value.length} ta ishchini o'chirasizmi?`)) return
    for (const id of selected.value) await authStore.archiveUser(id)
    await fetchUsers()
}
</script>

<template>
    <div class="space-y-5">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-[#0a1850] dark:text-white">Ishchilar</h1>
                <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Barcha xodimlar ro'yxati</p>
            </div>
            <button @click="userModalStore.openUserModal()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium btn-primary transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Yangi xodim
            </button>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700/60 p-4 flex flex-col md:flex-row gap-3">
            <div class="flex-1 relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input v-model="searchQuery" type="text" placeholder="Ism, familiya yoki login..."
                    class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-600/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all" />
            </div>
            <select v-model="selectedRole"
                class="md:w-44 px-4 py-2.5 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 dark:border-slate-600/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer">
                <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
        </div>

        <!-- Bulk action bar -->
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="selected.length > 0"
                class="flex items-center justify-between px-5 py-3 bg-blue-950 dark:bg-blue-900/40 border border-blue-800/40 dark:border-blue-700/40 rounded-2xl shadow-lg">
                <span class="text-blue-200 text-sm font-medium">{{ selected.length }} ta tanlandi</span>
                <div class="flex gap-2">
                    <button @click="selected = []" class="px-4 py-1.5 rounded-lg text-sm text-blue-300 hover:text-white hover:bg-white/10 transition-colors">
                        Bekor qilish
                    </button>
                    <button @click="archiveSelected"
                        class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors">
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
            <div v-if="loading" class="p-12 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                <div class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                Yuklanmoqda...
            </div>
            <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[820px]">
                    <thead>
                        <tr class="border-b border-indigo-100 dark:border-slate-700/60 bg-indigo-50/60 dark:bg-slate-700/30">
                            <th class="px-4 py-3.5 w-10">
                                <AppCheckbox :checked="allChecked" :indeterminate="indeterminate" @change="toggleAll" />
                            </th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Xodim</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Lavozim</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Telefon</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Login</th>
                            <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">JShSHIR</th>
                            <th class="px-4 py-3.5 text-center text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">Amallar</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-indigo-100/70 dark:divide-slate-700/50">
                        <tr v-for="user in filteredUsers" :key="user.id"
                            :class="selected.includes(user.id) ? 'bg-indigo-50 dark:bg-blue-900/10' : 'hover:bg-indigo-50/60 dark:hover:bg-slate-700/20'"
                            class="transition-colors group">
                            <td class="px-4 py-3.5">
                                <AppCheckbox :checked="selected.includes(user.id)" @change="toggleOne(user.id)" />
                            </td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600/50 shrink-0 bg-slate-100 dark:bg-slate-700">
                                        <img v-if="user.img" :src="`http://localhost:4000${user.img}`" class="w-full h-full object-cover" />
                                        <img v-else src="../../public/User-avatar.svg.png" class="w-full h-full object-cover opacity-60" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-800 dark:text-slate-100 text-sm">{{ user.surname }} {{ user.name }} {{ user.father_name }}</p>
                                        <p class="text-xs text-slate-400 dark:text-slate-500">{{ user.userCode }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3.5">
                                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" :class="{
                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300': user.role === 'ADMIN',
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': user.role === 'RAHBAR',
                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300': user.role === 'YURIST',
                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300': user.role === 'KASSIR',
                                }">
                                    {{ user.role === 'ADMIN' ? 'Administrator' : user.role === 'RAHBAR' ? 'Rahbar' : user.role === 'YURIST' ? 'Yurist' : 'Kassir' }}
                                </span>
                            </td>
                            <td class="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{{ user.phone || '—' }}</td>
                            <td class="px-4 py-3.5 text-sm font-mono text-slate-700 dark:text-slate-300">{{ user.username }}</td>
                            <td class="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ user.uniqueCode || '—' }}</td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="userModalStore.openEditModal(user)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                        title="Tahrirlash">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" />
                                        </svg>
                                    </button>
                                    <button @click="archiveUser(user)"
                                        class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                                        title="Arxivlash">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredUsers.length === 0">
                            <td colspan="7" class="px-6 py-14 text-center">
                                <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p class="text-sm">Xodim topilmadi</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <UsersModalUpdate @user-created="fetchUsers" />
    <UsersModal @user-created="fetchUsers" />
</template>

<style scoped>
.btn-primary { background: linear-gradient(135deg, #0a1850, #1a2e7a); }
.btn-primary:hover { background: linear-gradient(135deg, #1a2e7a, #2a3e9a); }
</style>
