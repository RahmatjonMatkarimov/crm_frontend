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

watch(route, () => { isSidebarOpen.value = false })
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const handleLogout = () => { authStore.logout(); router.push('/login') }
</script>

<template>
    <div class="min-h-screen w-full font-sans overflow-hidden" :style="themeStore.isDark ? 'background:#111827' : 'background:#f0f2f5'">

        <div class="flex h-screen">
            <!-- Overlay (mobile) -->
            <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
                leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
                <div v-if="isSidebarOpen"
                    class="fixed inset-0 z-40 lg:hidden"
                    style="background:rgba(0,0,0,0.5);"
                    @click="isSidebarOpen = false">
                </div>
            </Transition>

            <!-- Sidebar -->
            <aside :class="[
                'fixed lg:relative h-full z-50 flex flex-col transition-all duration-300 ease-in-out w-60',
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            ]" style="background:#1e3a5f; border-right:1px solid #162d4a;">

                <!-- Sidebar Header -->
                <div class="h-14 px-4 flex items-center justify-between" style="border-bottom:1px solid rgba(255,255,255,0.1);">
                    <div class="flex items-center gap-2.5">
                        <img src="/logo.png" alt="Logo" width="34" />
                        <div class="h-7 w-px" style="background:rgba(255,255,255,0.2);"></div>
                        <div>
                            <p class="font-bold text-sm leading-tight text-white">Yuridik</p>
                            <p class="text-xs leading-tight" style="color:rgba(255,255,255,0.6);">
                                Maslahat <span style="color:#fc8181; font-weight:700;">24</span>
                            </p>
                        </div>
                    </div>
                    <button @click="toggleSidebar"
                        class="lg:hidden w-7 h-7 flex items-center justify-center rounded transition-all text-white"
                        style="background:rgba(255,255,255,0.1);">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto pt-4">
                    <router-link v-for="r in routerList" :key="r.path" :to="r.path"
                        :class="[r.permission ? '' : 'hidden']"
                        class="nav-link flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all"
                        style="color:rgba(255,255,255,0.7);"
                        exact-active-class="nav-link-active">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                            stroke="currentColor" class="w-4 h-4 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="r.icon" />
                        </svg>
                        <span>{{ r.name }}</span>
                    </router-link>
                </nav>

                <!-- Profile & Logout -->
                <div class="p-3 space-y-0.5" style="border-top:1px solid rgba(255,255,255,0.1);">
                    <router-link to="/profile"
                        class="flex items-center gap-2.5 px-3 py-2.5 rounded transition-all"
                        style="color:rgba(255,255,255,0.7);"
                        @mouseover="$event.currentTarget.style.background='rgba(255,255,255,0.1)'"
                        @mouseleave="$event.currentTarget.style.background=''">
                        <div class="w-7 h-7 rounded overflow-hidden shrink-0" style="border:1px solid rgba(255,255,255,0.2);">
                            <img v-if="authStore.user?.img" :src="`${BASE_URL}${authStore.user.img}`" class="w-full h-full object-cover" />
                            <img v-else src="/User-avatar.svg.png" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-semibold truncate text-white">{{ authStore.user?.name || authStore.user?.username }}</p>
                            <p class="text-[10px] truncate" style="color:rgba(255,255,255,0.45);">{{ authStore.userRole }}</p>
                        </div>
                    </router-link>

                    <button @click="handleLogout"
                        class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded transition-all text-sm font-medium"
                        style="color:rgba(252,129,129,0.85);"
                        @mouseover="$event.currentTarget.style.background='rgba(252,129,129,0.1)'"
                        @mouseleave="$event.currentTarget.style.background=''">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        {{ langStore.t('Chiqish') }}
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
                <!-- Top Header -->
                <header class="h-14 px-5 flex items-center justify-between sticky top-0 z-40 shrink-0"
                    :style="themeStore.isDark
                        ? 'background:#1f2937; border-bottom:1px solid #374151;'
                        : 'background:#ffffff; border-bottom:1px solid #d8dde6;'">

                    <div class="flex items-center gap-3">
                        <!-- Mobile hamburger -->
                        <button @click="toggleSidebar" class="lg:hidden w-8 h-8 flex items-center justify-center rounded transition-all"
                            :style="themeStore.isDark ? 'color:#9ca3af;' : 'color:#4a5568;'">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <h1 class="font-semibold text-base" :style="themeStore.isDark ? 'color:#f3f4f6' : 'color:#1a1f36'">
                            {{ currentPageTitle }}
                        </h1>
                    </div>

                    <!-- Right actions -->
                    <div class="flex items-center gap-2">
                        <!-- Lang toggle -->
                        <button @click="langStore.toggleLang()"
                            class="flex items-center gap-1.5 px-3 h-8 rounded text-xs font-bold transition-all"
                            :style="themeStore.isDark
                                ? 'color:#9ca3af; background:#374151; border:1px solid #4b5563;'
                                : 'color:#4a5568; background:#f0f2f5; border:1px solid #d8dde6;'">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            <span class="uppercase tracking-wider">{{ langStore.isKiril ? 'UZ' : 'КР' }}</span>
                        </button>

                        <!-- Dark mode toggle -->
                        <button @click="themeStore.toggleTheme()"
                            class="w-8 h-8 flex items-center justify-center rounded transition-all"
                            :style="themeStore.isDark
                                ? 'color:#9ca3af; background:#374151; border:1px solid #4b5563;'
                                : 'color:#4a5568; background:#f0f2f5; border:1px solid #d8dde6;'">
                            <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                            </svg>
                        </button>

                        <!-- User avatar -->
                        <router-link to="/profile"
                            class="flex items-center gap-2 px-2 h-8 rounded transition-all"
                            :style="themeStore.isDark ? 'color:#9ca3af;' : 'color:#4a5568;'">
                            <div class="w-6 h-6 rounded overflow-hidden" style="border:1px solid #d8dde6;">
                                <img v-if="authStore.user?.img" :src="`${BASE_URL}${authStore.user.img}`" class="w-full h-full object-cover" />
                                <img v-else src="/User-avatar.svg.png" class="w-full h-full object-cover" />
                            </div>
                            <span class="text-xs font-medium hidden sm:block">
                                {{ authStore.user?.name || authStore.user?.username }}
                            </span>
                        </router-link>
                    </div>
                </header>

                <!-- Page Content -->
                <div class="flex-1 overflow-auto p-5 lg:p-6">
                    <router-view />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.nav-link:hover {
    background: rgba(255,255,255,0.1);
    color: #ffffff;
}
.nav-link-active {
    background: rgba(255,255,255,0.15) !important;
    color: #ffffff !important;
    border-left: 3px solid #ffffff;
    padding-left: calc(0.75rem - 3px);
}
</style>
