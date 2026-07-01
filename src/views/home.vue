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

const sidebarCollapsed = ref(false)

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

const handleLogout = () => { authStore.logout(); router.push('/login') }

const langDropdownOpen = ref(false)
const langOptions = [
    { value: 'lotin', label: "O'ZB", sub: 'Lotin' },
    { value: 'kiril', label: 'ЎЗБ', sub: 'Кирил' },
]
const currentLang = computed(() => langOptions.find(o => o.value === (langStore.isKiril ? 'kiril' : 'lotin')))
function selectLang(val) {
    langStore.setLang(val)
    langDropdownOpen.value = false
}
</script>

<template>
    <div class="flex h-screen overflow-hidden"
        :style="themeStore.isDark ? 'background:#0d1117;' : 'background:#f0f2f7;'">

        <!-- ═══ SIDEBAR ═══ -->
        <aside :style="[
            themeStore.isDark ? 'background:#0f1521; border-right:1px solid #1e2d42;' : 'background:#1A3A6B;',
            sidebarCollapsed ? 'width:64px;' : 'width:240px;',
            'flex-shrink:0; display:flex; flex-direction:column; transition:width 220ms cubic-bezier(0.4,0,0.2,1); overflow:hidden;'
        ].join('')">

            <!-- Logo -->
            <div class="flex items-center justify-between px-4 flex-shrink-0"
                style="height:60px; border-bottom:1px solid rgba(255,255,255,0.08);">
                <div class="flex items-center gap-3 overflow-hidden">
                    <img v-if="!sidebarCollapsed" src="../../public/logo-white.png" alt="Logo"
                        class="w-30 object-contain" />
                </div>

                <button @click="sidebarCollapsed = !sidebarCollapsed" class="w-8 h-8 flex items-center justify-center rounded transition-all 
           bg-[#1A3A6B] dark:bg-[#161c2d] 
           border-2 border-[rgba(255,255,255,0.1)] dark:border-gray-700 
           text-gray-300 dark:text-gray-300 
           hover:cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>

            <!-- Nav -->
            <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">


                <router-link v-for="r in routerList" :key="r.path" :to="r.path"
                    :class="[r.permission ? '' : 'hidden', 'aside-link']" :title="sidebarCollapsed ? r.name : ''"
                    exact-active-class="aside-link-active">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                        stroke="currentColor" class="flex-shrink-0" style="width:18px; height:18px;">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="r.icon" />
                    </svg>
                    <Transition name="fade-slide">
                        <span v-if="!sidebarCollapsed" class="truncate">{{ r.name }}</span>
                    </Transition>
                    <span v-if="!sidebarCollapsed" class="nav-dot"></span>
                </router-link>
            </nav>

            <!-- Bottom: user + logout -->
            <div class="flex items-center justify-center gap-2 border-t border-white/10 px-3 py-3 pb-4 shrink-0">

                <!-- Logout -->
                <button @click="handleLogout" :title="sidebarCollapsed ? langStore.t('Chiqish') : ''"
                    class="w-full flex items-center gap-2.5 px-2 py-2 mt-1 rounded transition-all"
                    style="color:rgba(248,113,113,0.8); border-radius:6px;"
                    @mouseover="e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'"
                    @mouseleave="e => e.currentTarget.style.background = ''">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                        stroke="currentColor" style="width:18px;height:18px;flex-shrink:0;">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <Transition name="fade-slide">
                        <span v-if="!sidebarCollapsed" class="text-xs font-semibold truncate">
                            {{ langStore.t('Chiqish') }}
                        </span>
                    </Transition>
                </button>
            </div>
        </aside>

        <!-- ═══ MAIN ═══ -->
        <div class="flex flex-col flex-1 overflow-hidden">

            <!-- HEADER -->
            <header class="flex items-center justify-between flex-shrink-0 px-5" :style="[
                themeStore.isDark ? 'background:#0f1521; border-right:1px solid #1e2d42;' : 'background:#1A3A6B;',
                'height:60px; z-index:20;',
                'box-shadow: 0 1px 3px rgba(0,0,0,0.06);'
            ].join('')">

                <!-- Left: collapse btn + breadcrumb -->
                <div class="flex items-center gap-3">
                    <img v-if="sidebarCollapsed" src="../../public/logo-white.png" alt="Logo"
                        class="w-30 mr-2 object-contain" />

                    <!-- Breadcrumb -->
                    <nav class="flex items-center gap-1.5 text-xs"
                        :style="themeStore.isDark ? 'color:#4a5878' : 'color:#9ca3af'">
                        <span class="cursor-pointer transition-colors hover:text-blue-600"
                            :style="themeStore.isDark ? '' : ''" @click="$router.push('/')">
                            {{ langStore.t('Bosh sahifa') }}
                        </span>
                        <template v-if="currentPageTitle !== langStore.t('Bosh sahifa')">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-3 h-3 flex-shrink-0">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                            <span class="font-semibold">
                                {{ currentPageTitle }}
                            </span>
                        </template>
                    </nav>
                </div>

                <!-- Right: lang + theme + user -->
                <div class="flex items-center gap-2">

                    <!-- Lang dropdown -->
                    <div class="relative" v-click-outside="() => langDropdownOpen = false">
                        <button @click="langDropdownOpen = !langDropdownOpen" class="flex items-center gap-1.5 h-8 px-3 text-xs font-bold rounded transition-all bg-[#1A3A6B] dark:bg-[#161c2d] 
           border-2 border-[rgba(255,255,255,0.1)] dark:border-gray-700 
           text-gray-300 dark:text-gray-300 
           hover:cursor-pointer">
                            {{ currentLang.label }}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-3 h-3"
                                :style="langDropdownOpen ? 'transform:rotate(180deg)' : ''">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        <Transition enter-active-class="transition-all duration-150 ease-out"
                            enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition-all duration-100" leave-from-class="opacity-100"
                            leave-to-class="opacity-0">
                            <div v-if="langDropdownOpen" class="absolute right-0 mt-1 w-32 overflow-hidden z-50"
                                style="background:#fff; border:1px solid #dce1ea; border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,0.12);">
                                <button v-for="opt in langOptions" :key="opt.value" @click="selectLang(opt.value)"
                                    class="w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-all"
                                    :style="currentLang.value === opt.value
                                        ? 'background:#eff4fc; color:#1A3A6B; font-weight:700;'
                                        : 'color:#4b5563;'"
                                    @mouseover="e => { if (currentLang.value !== opt.value) e.currentTarget.style.background = '#f9fafb' }"
                                    @mouseleave="e => { if (currentLang.value !== opt.value) e.currentTarget.style.background = '' }">
                                    <span class="font-bold w-8">{{ opt.label }}</span>
                                    <span style="opacity:0.55">{{ opt.sub }}</span>
                                </button>
                            </div>
                        </Transition>
                    </div>

                    <!-- Theme toggle -->
                    <button @click="themeStore.toggleTheme()" class="w-8 h-8 flex items-center justify-center rounded transition-all bg-[#1A3A6B] dark:bg-[#161c2d] 
           border-2 border-[rgba(255,255,255,0.1)] dark:border-gray-700 
           text-gray-300 dark:text-gray-300 
           hover:cursor-pointer"
                        :title="themeStore.isDark ? langStore.t('Yorug\' rejim') : langStore.t('Qorong\'u rejim')">
                        <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                        </svg>
                    </button>

                    <!-- User avatar link -->
                    <router-link to="/profile" class="flex items-center gap-2 h-8 px-2.5 rounded transition-all bg-[#1A3A6B] dark:bg-[#161c2d] 
           border-2 border-[rgba(255,255,255,0.1)] dark:border-gray-700 
           text-gray-300 dark:text-gray-300 
           hover:cursor-pointer" style="text-decoration:none;">
                        <div class="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"
                            style="border:1.5px solid rgba(26,58,107,0.2);">
                            <img v-if="authStore.user?.img" :src="`${BASE_URL}${authStore.user.img}`"
                                class="w-full h-full object-cover" />
                            <img v-else src="/User-avatar.svg.png" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-xs font-semibold">
                            {{ authStore.user?.name || authStore.user?.username }}
                        </span>
                    </router-link>
                </div>
            </header>

            <!-- PAGE CONTENT -->
            <main class="flex-1 overflow-auto">
                <div class="p-6">
                    <router-view />
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.fade-slide-enter-active {
    transition: opacity 180ms ease, transform 180ms ease;
}

.fade-slide-leave-active {
    transition: opacity 120ms ease, transform 120ms ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateX(-6px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-6px);
}
</style>
