<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLangStore } from '@/stores/lang'
import { BASE_URL } from '@/api'
import { computed, ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const langStore = useLangStore()

const isSidebarOpen = ref(false)

const routerList = computed(() => [
    {
        path: '/',
        name: langStore.t('Bosh sahifa'),
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        permission: true
    },
    {
        path: '/customers',
        name: langStore.t('Mijozlar'),
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        permission: authStore.permission?.view_customers || false
    },
    {
        path: '/archive',
        name: langStore.t('Arxiv'),
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        permission: authStore.permission?.archive || false
    },
    {
        path: '/users',
        name: langStore.t('Ishchilar'),
        icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        permission: authStore.permission?.view_users || false
    },
])

const currentPageTitle = computed(() => {
    const routeName = {
        Dashboard: langStore.t('Bosh sahifa'),
        customers: langStore.t('Mijozlar'),
        archive: langStore.t('Arxiv'),
        users: langStore.t('Ishchilar'),
        profile: langStore.t('Profil'),
        'customer': langStore.t('Mijoz'),
    }
    return routeName[route.name] || route.meta.title || langStore.t('Sahifa')
})

// Router o'zgarganda sidebar avtomatik yopiladi
watch(route, () => {
    isSidebarOpen.value = false
})

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="min-h-screen w-full font-sans overflow-hidden"
        :style="themeStore.isDark ? { backgroundColor: '#0f172a' } : { backgroundColor: '#eef1fb' }">

        <div class="flex h-screen">
            <!-- Sidebar -->
            <aside :class="[
                'fixed lg:relative h-full z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out',
                isSidebarOpen ? 'w-60 translate-x-0' : 'hidden'
            ]"
                :style="{ background: themeStore.isDark ? 'linear-gradient(180deg, #0d1b3e 0%, #162766 100%)' : 'linear-gradient(180deg, #122b91 0%, #1a44f0 100%)' }">

                <!-- Sidebar Header -->
                <div v-if="isSidebarOpen" class="h-16 px-5 flex items-center justify-between border-b border-white/10">
                    <div class="flex items-center gap-3">
                        <!-- <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-4 h-4 text-white">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 3v1m0 16v1m8-9h1M3 12H2m15.364-6.364l.707.707M5.636 18.364l-.707.707M18.364 18.364l.707-.707M5.636 5.636l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        -->
                        <img src="../../public/logo.png" alt="" width="50">
                        <span class="border-r-2 border-white -mx-1 h-10 w-0"></span>
                        <span class="text-white font-semibold text-sm tracking-wide "><span
                                class="text-white text-xl">Yuridik </span>maslahat <span
                                class="text-red-500">24</span></span>
                    </div>

                    <button @click="toggleSidebar"
                        class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"
                            stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6h12v12" />
                        </svg>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
                    <router-link v-for="route in routerList" :key="route.path" :to="route.path"
                        :class="route.permission ? '' : 'hidden'"
                        class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        active-class="nav-link-active">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                            stroke="currentColor" class="w-4 h-4 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="route.icon" />
                        </svg>
                        <span>{{ route.name }}</span>
                    </router-link>
                </nav>

                <!-- Profile & Logout -->
                <div v-if="isSidebarOpen" class="p-3 border-t border-white/10 space-y-1">
                    <router-link to="/profile"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all group">
                        <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                            <img v-if="authStore.user?.img" :src="`${BASE_URL}${authStore.user.img}`"
                                class="w-full h-full object-cover" />
                            <img v-else src="../../public/User-avatar.svg.png" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white text-xs font-medium truncate">{{ authStore.user?.name ||
                                authStore.user?.username }}</p>
                            <p class="text-white/50 text-[10px] truncate">{{ authStore.userRole }}</p>
                        </div>
                    </router-link>

                    <button @click="handleLogout"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                            stroke="currentColor" class="w-4 h-4 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        {{ langStore.t('Chiqish') }}
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <div class="flex-1 flex flex-col min-w-0">
                <!-- Top Header -->
                <header
                    class="h-16 bg-white/80 backdrop-blur dark:bg-slate-800 border-b border-indigo-100 dark:border-slate-700 px-6 flex items-center justify-between sticky top-0 z-40">

                    <!-- Hamburger + Logo (faqat sidebar yopiq bo'lganda ko'rinadi) -->
                    <div class="flex items-center" :class="{ 'hidden': isSidebarOpen }">
                        <button @click="toggleSidebar"
                            class="w-9 h-9  dark:bg-slate-700 -ml-3 flex items-center justify-center rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-6 h-6 text-[#1a2e7a] dark:text-slate-400">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>

                        <h1 class="text-black dark:text-white ml-4 text-lg font-semibold">
                            {{ currentPageTitle }}
                        </h1>
                    </div>

                    <!-- Right side -->
                    <div class="flex items-center gap-4 ml-auto">
                        <div class="flex w-50 -mr-[50px] items-center ml-3 gap-3">
                            <img src="../../public/logo.png" alt="" width="50">
                            <span class="border-r-2 border-black dark:border-white font-bold -mx-1 h-10 w-0"></span>
                            <span class="text-black dark:text-white font-semibold text-sm tracking-wide ">
                                <span class="text-black dark:text-white font-bold text-xl">Yuridik </span>
                                maslahat <span class="text-red-500 font-bold">24</span></span>
                        </div>

                        <!-- Lang toggle (Lotin / Kiril) -->
                        <button @click="langStore.toggleLang()"
                            :title="langStore.isKiril ? 'Lotinga o\'tish' : 'Kirilga o\'tish'"
                            class="relative flex items-center gap-1.5 px-3 h-9 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm group">
                            <!-- Globe icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.8" stroke="currentColor"
                                class="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-200">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            <span class="text-xs font-semibold text-[#1a2e7a] dark:text-slate-300 uppercase tracking-wider leading-none">
                                {{ langStore.isKiril ? 'UZ' : 'КР' }}
                            </span>
                        </button>

                        <!-- Dark mode toggle -->
                        <button @click="themeStore.toggleTheme()"
                            class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors text-[#1a2e7a] dark:text-slate-400">
                            <!-- Sun icon -->
                            <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                            </svg>
                            <!-- Moon icon -->
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                            </svg>
                        </button>
                    </div>
                </header>

                <!-- Page Content -->
                <div class="flex-1 overflow-auto p-6">
                    <router-view />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.nav-link-active {
    background: rgba(255, 255, 255, 0.15) !important;
    color: white !important;
}
</style>