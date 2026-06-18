<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserModalStore } from '@/stores/users.modal'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const userModalStore = useUserModalStore()
const themeStore = useThemeStore()

const routerList = [
    { path: '/dashboard', name: 'Bosh sahifa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/customers', name: 'Mijozlar', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { path: '/archive', name: 'Arxiv', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { path: '/users', name: 'Ishchilar', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
]

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="min-h-screen w-full text-[#0a1850] dark:text-slate-100 font-sans" style="background-color: #eef1fb;" :style="themeStore.isDark ? { backgroundColor: '#0f172a' } : { backgroundColor: '#eef1fb' }">
        <div class="flex min-h-screen w-full">

            <!-- Sidebar -->
            <aside class="w-60 fixed min-h-full flex flex-col z-20"
                :style="{ background: themeStore.isDark ? 'linear-gradient(180deg, #0d1b3e 0%, #162766 100%)' : 'linear-gradient(180deg, #122b91 0%, #1a44f0 100%)' }">

                <!-- Logo -->
                <div class="h-16 px-5 flex items-center gap-3 border-b border-white/10">
                    <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-4 h-4 text-white">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 3v1m0 16v1m8-9h1M3 12H2m15.364-6.364l.707.707M5.636 18.364l-.707.707M18.364 18.364l.707-.707M5.636 5.636l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <span class="text-white font-semibold text-sm tracking-wide uppercase">Yurist CRM</span>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 p-3 space-y-1">
                    <router-link v-for="route in routerList" :key="route.path" :to="route.path"
                        class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        active-class="nav-link-active">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                            stroke="currentColor" class="w-4 h-4 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="route.icon" />
                        </svg>
                        {{ route.name }}
                    </router-link>
                </nav>

                <!-- User section -->
                <div class="p-3 border-t border-white/10 space-y-1">
                    <router-link to="/profile"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all group">
                        <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                            <img v-if="authStore.user?.img" :src="`http://localhost:4000${authStore.user.img}`"
                                class="w-full h-full object-cover" />
                            <img v-else src="../../public/User-avatar.svg.png" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white text-xs font-medium truncate">{{ authStore.user?.name ||
                                authStore.user?.username }}</p>
                            <p class="text-white/50 text-[10px] truncate">{{ authStore.userRole }}</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                            stroke="currentColor"
                            class="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </router-link>

                    <button @click="handleLogout"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                            stroke="currentColor" class="w-4 h-4 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Chiqish
                    </button>
                </div>
            </aside>

            <!-- Main content -->
            <main class="flex-1 ml-60 min-h-screen flex flex-col" :style="themeStore.isDark ? { backgroundColor: '#0f172a' } : { backgroundColor: '#eef1fb' }">

                <!-- Top bar -->
                <header
                    class="h-16 bg-white/80 backdrop-blur dark:bg-slate-800 border-b border-indigo-100 dark:border-slate-700 px-6 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 class="text-sm font-semibold text-[#0a1850] dark:text-slate-100">Boshqaruv paneli</h2>
                        <p class="text-[11px] text-slate-400 dark:text-slate-500">Yurist CRM tizimi</p>
                    </div>
                    <!-- Dark mode toggle -->
                    <button @click="themeStore.toggleTheme()"
                        class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors text-[#1a2e7a] dark:text-slate-400">
                        <!-- Sun icon (light mode) -->
                        <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                        </svg>
                        <!-- Moon icon (dark mode) -->
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                        </svg>
                    </button>
                </header>

                <div class="flex-1 p-6">
                    <router-view />
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.sidebar-bg {
    background: linear-gradient(180deg, #122b91 0%, #1a44f0 100%);
}

:global(.dark) .sidebar-bg {
    background: linear-gradient(180deg, #0a1a5c 0%, #0f2a9e 100%);
}

.nav-link-active {
    background: rgba(255, 255, 255, 0.15) !important;
    color: white !important;
}

.btn-primary {
    background: linear-gradient(135deg, #0a1850, #1a2e7a);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #1a2e7a, #2a3e9a);
}
</style>