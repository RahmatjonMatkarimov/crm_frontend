<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserModalStore } from '@/stores/users.modal'
import { useThemeStore } from '@/stores/theme'
import UsersModal from '@/components/users/users.modal.vue'
import UsersModalUpdate from '@/components/users/usersUpdateModal.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import api, { ENDPOINTS, BASE_URL } from '@/api'
import translateText from '@/utils/translete.js'
import { useHistoryBack } from '@/composables/useHistoryBack'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const authStore = useAuthStore()
const userModalStore = useUserModalStore()
const themeStore = useThemeStore()

const users = ref([])
const searchQuery = ref('')
const selectedRole = ref('all')
const loading = ref(false)
const selected = ref([])

const fetchUsers = async () => {
    loading.value = true
    selected.value = []
    try {
        const { data } = await api.get(ENDPOINTS.ALL_USERS)
        users.value = data
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
        const m = (val) => { const v = val?.toLowerCase() || ''; return v.includes(q) || translateText(v).toLowerCase().includes(q) }
        const matchSearch = m(user.name) || m(user.surname) || m(user.username)
        const matchRole = selectedRole.value === 'all' || user.role === selectedRole.value
        return matchSearch && matchRole
    })
})

const roles = computed(() => [
    { value: 'all', label: proxy.$t('Barchasi') },
    { value: 'ADMIN', label: proxy.$t('Administrator') },
    { value: 'RAHBAR', label: proxy.$t('Rahbar') },
    { value: 'YURIST', label: proxy.$t('Yurist') },
    { value: 'KASSIR', label: proxy.$t('Kassir') },
    { value: 'IJROCHI', label: proxy.$t('Ijrochi') },
    { value: 'XUJJAT_TAYYORLOVCHI', label: proxy.$t('Xujjat tayyorlovchi') },
])

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

const detailUser = ref(null)
const openDetail = (user) => { detailUser.value = user }
const closeDetail = () => { detailUser.value = null }

const { suppressNextClose } = useHistoryBack(() => !!detailUser.value, () => closeDetail())

// Drawer yopilishi browser history'da orqaga o'tish orqali amalga oshadi (useHistoryBack),
// bu asinxron. Shu tufayli yangi modal/sahifa ochishni bir tick keyinga qoldiramiz,
// aks holda kutilmagan "orqaga" o'tishi endigina ochilgan narsani darhol yopib qo'yadi.
const editFromDetail = (user) => {
    suppressNextClose()
    closeDetail()
    setTimeout(() => userModalStore.openEditModal(user), 0)
}
const openPermissionsFromDetail = (user) => {
    suppressNextClose()
    closeDetail()
    setTimeout(() => router.push(`/permissions/${user.id}`), 0)
}

const roleLabel = (role) => ({
    ADMIN: proxy.$t('Administrator'),
    RAHBAR: proxy.$t('Rahbar'),
    YURIST: proxy.$t('Yurist'),
    KASSIR: proxy.$t('Kassir'),
    IJROCHI: proxy.$t('Ijrochi'),
    XUJJAT_TAYYORLOVCHI: proxy.$t('Xujjat tayyorlovchi'),
}[role] || role)

const fields = computed(() => {
    return [
                { label: 'Login', value: detailUser.value.username },
                { label: 'Telefon', value: detailUser.value.phone },
                { label: proxy.$t("Qo'shimcha tel."), value: detailUser.value.phone2 },
                { label: 'Telegram', value: detailUser.value.telegram },
                { label: "Tug'ilgan sana", value: detailUser.value.birthDate ? detailUser.value.birthDate.split('T')[0] : null },
                { label: 'Passport', value: detailUser.value.userCode },
                { label: 'JSHSHIR', value: detailUser.value.uniqueCode },
                { label: proxy.$t("Qo'shilgan"), value: detailUser.value.createdAt ? new Date(detailUser.value.createdAt).toLocaleDateString('uz-UZ') : null },
            ]
})
</script>

<template>
    <div class="space-y-5">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="gov-page-title">{{ $t('Ishchilar') }}</h1>
                <p class="text-sm mt-1" style="color:var(--text-2);">{{ $t("Barcha xodimlar ro'yxati") }}</p>
            </div>
            <button @click="userModalStore.openUserModal()" v-if="authStore.permission.add_users" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {{ $t('Yangi xodim') }}
            </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-1 relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:var(--text-2);">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input v-model="searchQuery" type="text" :placeholder="$t('Ism, familiya yoki login...')"
                    class="form-input pl-10" />
            </div>
            <select v-model="selectedRole" class="form-input md:w-44 cursor-pointer">
                <option v-for="role in roles" :key="role.value" :value="role.value">{{ $t(role.label) }}</option>
            </select>
        </div>

        <!-- Bulk action bar -->
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2"
            leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="selected.length > 0"
                class="flex items-center justify-between px-5 py-3 rounded-lg"
                style="background:var(--primary-light); border:1px solid var(--border);">
                <span class="text-sm font-semibold" style="color:var(--text-1);">{{ selected.length }} {{ $t('ta tanlandi') }}</span>
                <div class="flex gap-2">
                    <button @click="selected = []" class="px-4 py-1.5 rounded-lg text-sm transition-colors" style="color:var(--text-2);">{{ $t('Bekor qilish') }}</button>
                    <button @click="archiveSelected" class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm transition-colors" style="background:var(--danger-bg); color:var(--danger); border:1px solid var(--danger-border);">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        {{ $t("O'chirish") }}
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-16 gap-3" :style="'color:var(--text-2)'">
            <div class="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
            <span class="text-sm">{{ $t('Yuklanmoqda...') }}</span>
        </div>

        <!-- Cards grid -->
        <div v-else-if="filteredUsers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="user in filteredUsers" :key="user.id"
                class="relative rounded-lg p-5 cursor-pointer group transition-all card"
                :style="{ borderColor: selected.includes(user.id) ? 'var(--primary)' : 'var(--border)' }"
                @click="openDetail(user)">

                <!-- Checkbox -->
                <div v-if="authStore.permission.delete_users" class="absolute top-3 right-3 z-10" @click.stop>
                    <AppCheckbox :checked="selected.includes(user.id)" @change="toggleOne(user.id)" />
                </div>

                <!-- Avatar + Name -->
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-11 h-11 rounded-lg overflow-hidden shrink-0" style="border:1px solid var(--border);">
                        <img v-if="user.img" :src="`${BASE_URL}${user.img}`" class="w-full h-full object-cover" />
                        <img v-else src="/User-avatar.svg.png" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex-1 min-w-0 pr-6">
                        <p class="font-bold text-sm truncate" :style="'color:var(--text-1)'">{{ $t(user.surname) }} {{ $t(user.name) }}</p>
                        <p class="text-xs truncate" :style="'color:var(--text-2)'">{{ $t(user.father_name) || '' }}</p>
                    </div>
                </div>

                <!-- Role badge -->
                <div class="mb-3">
                    <span class="gov-badge" :class="{
                        'gov-badge-blue': user.role === 'ADMIN' || user.role === 'RAHBAR',
                        'gov-badge-green': user.role === 'YURIST',
                        'gov-badge-yellow': user.role === 'KASSIR',
                        'gov-badge-red': user.role === 'IJROCHI',
                        'gov-badge-purple': user.role === 'XUJJAT_TAYYORLOVCHI',
                    }">{{ roleLabel(user.role) }}</span>
                </div>

                <!-- Contact info -->
                <div class="space-y-1.5 mb-4">
                    <div v-if="user.phone" class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 shrink-0" style="color:var(--text-2);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span class="text-xs" :style="'color:var(--text-2)'">{{ user.phone }}</span>
                    </div>
                    <div v-if="user.username" class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 shrink-0" style="color:var(--text-2);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span class="text-xs font-mono" :style="'color:var(--text-2)'">{{ user.username }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                    <button @click="userModalStore.openEditModal(user)" v-if="authStore.permission.edit_users"
                        class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style="background:var(--primary-light); color:var(--primary);">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" /></svg>
                        {{ $t('Tahrirlash') }}
                    </button>
                    <button @click="archiveUser(user)" v-if="authStore.permission.delete_users"
                        class="p-1.5 rounded-lg transition-all" style="color:var(--danger);">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-20 h-20 rounded-lg flex items-center justify-center" style="background:var(--border-light);">
                <svg class="w-10 h-10" style="color:var(--text-3);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <p class="text-sm" :style="'color:var(--text-2)'">{{ $t('Xodim topilmadi') }}</p>
        </div>
    </div>

    <UsersModalUpdate @user-created="fetchUsers" />
    <UsersModal @user-created="fetchUsers" />

    <!-- User Detail Drawer -->
    <Teleport to="body">
        <Transition name="drawer-backdrop">
            <div v-if="detailUser" class="fixed inset-0 z-50" style="background:var(--overlay);" @click="closeDetail"></div>
        </Transition>
        <Transition name="drawer">
            <div v-if="detailUser"
                class="fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col overflow-hidden shadow-2xl"
                style="background:var(--bg-card);">

                <!-- Header -->
                <div class="shrink-0" style="border-bottom:1px solid var(--border); background:var(--border-light);">
                    <div class="px-5 pt-5 pb-5">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h2 class="text-base font-bold tracking-wide" style="color:var(--text-1);">{{ $t("Xodim ma'lumotlari") }}</h2>
                                <p class="text-xs mt-0.5" style="color:var(--text-2);">{{ $t("To'liq profil") }}</p>
                            </div>
                            <button @click="closeDetail"
                                class="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
                                style="background:var(--bg-card); border:1px solid var(--border); color:var(--text-2);">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0" style="border:1px solid var(--border);">
                                <img v-if="detailUser.img" :src="`${BASE_URL}${detailUser.img}`" class="w-full h-full object-cover" />
                                <img v-else src="../../public/User-avatar.svg.png" class="w-full h-full object-cover opacity-70" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-bold text-sm leading-tight truncate" style="color:var(--text-1);">
                                    {{ detailUser.surname }} {{ detailUser.name }} {{ detailUser.father_name }}
                                </p>
                                <span class="gov-badge gov-badge-blue mt-1.5">
                                    {{ $t(roleLabel(detailUser.role)) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Body -->
                <div class="flex-1 overflow-y-auto p-4 space-y-3">
                    <div class="card overflow-hidden">
                        <div class="px-4 py-2.5 border-b" style="border-color:var(--border-light); background:var(--border-light);">
                            <p class="text-[10px] font-bold uppercase tracking-widest" style="color:var(--text-2);">{{ $t("Shaxsiy ma'lumotlar") }}</p>
                        </div>
                        <div class="divide-y" style="border-color:var(--border-light);">
                            <div v-for="item in fields" :key="item.label" class="flex items-center justify-between px-4 py-3">
                                <span class="text-xs" style="color:var(--text-2);">{{ $t(item.label) }}</span>
                                <span class="text-xs font-semibold font-mono" style="color:var(--text-1);">{{ item.value || '—' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer actions -->
                <div class="px-4 py-4 flex gap-2.5 shrink-0"
                    style="border-top:1px solid var(--border); background:var(--border-light);">
                    <button @click="editFromDetail(detailUser)"
                        v-if="authStore.permission.edit_users"
                        class="btn btn-primary flex-1 justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" />
                        </svg>
                        {{ $t('Tahrirlash') }}
                    </button>
                    <button @click="archiveUser(detailUser); closeDetail()" v-if="authStore.permission.delete_users"
                        class="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                        style="background:var(--danger-bg); color:var(--danger); border:1px solid var(--danger-border);">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        {{ $t("O'chirish") }}
                    </button>
                    <button @click="openPermissionsFromDetail(detailUser)"
                        v-if="authStore.permission.permisisons"
                        class="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                        style="background:var(--warning-bg); color:var(--warning); border:1px solid var(--warning-border);">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {{ $t('Ruxsatlar') }}
                    </button>
                </div>

            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* no overrides needed */


.drawer-enter-active,
.drawer-leave-active {
    transition: transform 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
    transform: translateX(100%);
}

.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
    transition: opacity 0.25s ease;
}

.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
    opacity: 0;
}
</style>
