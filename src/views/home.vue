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
    <div class="min-h-screen w-full font-sans flex flex-col"
        :style="themeStore.isDark ? 'background:#1e3a5f' : 'background:#eef1f6'">

        <!-- HEADER -->
        <header
            style="background:#1A3A6B; height:64px; padding:0 20px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; position:relative; z-index:30;">
            <div class="flex items-center gap-3">
                <!-- Sidebar toggle button -->
                <button @click="toggleSidebar" class="w-9 h-9 flex items-center justify-center transition-all mr-1"
                    style="color:white; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <img src="../../public/logo-white.png" alt="Logo" width="150" />

            </div>

            <div class="flex items-center gap-2">
                <!-- Lang -->
                <div class="relative" v-click-outside="() => langDropdownOpen = false">
                    <button @click="langDropdownOpen = !langDropdownOpen"
                        class="flex items-center gap-1.5 px-3 h-8 text-xs font-bold transition-all select-none"
                        style="color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:3px;">
                        {{ currentLang.label }}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                            stroke="currentColor" class="w-3 h-3" :class="langDropdownOpen ? 'rotate-180' : ''">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    <Transition enter-active-class="transition-all duration-150 ease-out"
                        enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
                        leave-active-class="transition-all duration-100" leave-from-class="opacity-100"
                        leave-to-class="opacity-0">
                        <div v-if="langDropdownOpen" class="absolute right-0 mt-1 w-32 overflow-hidden z-50"
                            style="background:#fff; border:1px solid #d0d7e3; border-radius:3px; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                            <button v-for="opt in langOptions" :key="opt.value" @click="selectLang(opt.value)"
                                class="w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-all"
                                :style="currentLang.value === opt.value ? 'background:#eff6ff; color:#1A3A6B; font-weight:700;' : 'color:#4a5568;'"
                                @mouseover="e => { if (currentLang.value !== opt.value) e.currentTarget.style.background = '#f5f7fb' }"
                                @mouseleave="e => { if (currentLang.value !== opt.value) e.currentTarget.style.background = '' }">
                                <span class="font-bold w-8">{{ opt.label }}</span>
                                <span style="opacity:0.6">{{ opt.sub }}</span>
                            </button>
                        </div>
                    </Transition>
                </div>

                <!-- Theme toggle -->
                <button @click="themeStore.toggleTheme()"
                    class="w-8 h-8 flex items-center justify-center transition-all"
                    style="color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:3px;">
                    <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                </button>

                <!-- User -->
                <router-link to="/profile" class="flex items-center gap-2 px-3 h-8 transition-all"
                    style="color:white; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:3px;">
                    <div class="w-6 h-6 rounded-full overflow-hidden" style="border:1px solid rgba(255,255,255,0.3);">
                        <img v-if="authStore.user?.img" :src="`${BASE_URL}${authStore.user.img}`"
                            class="w-full h-full object-cover" />
                        <img v-else src="/User-avatar.svg.png" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-xs font-semibold hidden sm:block" style="color:rgba(255,255,255,0.9);">
                        {{ authStore.user?.name || authStore.user?.username }}
                    </span>
                </router-link>
            </div>

        </header>
        <div class="flex items-center gap-2 text-xs bg-[#1a3a6bd2] py-2 px-4"
            :style="'color:rgba(255,255,255,0.55);'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span style="cursor:pointer; color:rgba(255,255,255,0.75);" @click="$router.push('/')">Bosh
                sahifa</span>
            <span>›</span>
            <span style="font-weight:700; color:#ffffff;">{{ currentPageTitle }}</span>
        </div>

        <!-- BODY: sidebar + content -->
        <div class="flex flex-1 overflow-hidden">

            <!-- SIDEBAR OVERLAY -->
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
                leave-active-class="transition-opacity duration-200" leave-to-class="opacity-0">
                <div v-if="isSidebarOpen" class="fixed inset-0 z-40" style="background:rgba(0,0,0,0.45);"
                    @click="isSidebarOpen = false"></div>
            </Transition>

            <!-- ASIDE -->
            <Transition enter-active-class="transition-transform duration-250 ease-out"
                enter-from-class="-translate-x-full" enter-to-class="translate-x-0"
                leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0"
                leave-to-class="-translate-x-full">
                <aside v-if="isSidebarOpen" class="fixed top-0 left-0 h-full w-64 z-50 flex flex-col"
                    style="background:#1A3A6B; border-right:3px solid #2E8B57;">

                    <!-- Aside header -->
                    <div class="px-4 py-4 flex items-center justify-between flex-shrink-0"
                        style="background:#163266; border-bottom:1px solid rgba(255,255,255,0.1); height:64px;">
                        <div class="flex items-center gap-2">
                            <img src="../../public/logo-white.png" alt="Logo" width="70%" />
                        </div>
                        <button @click="isSidebarOpen = false"
                            class="max-w-8 max-h-8 min-w-8 min-h-8 flex items-center justify-center transition-all"
                            style="color:rgba(255,255,255,0.7); background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:4px;">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>


                    <!-- Nav links -->
                    <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
                        <router-link v-for="r in routerList" :key="r.path" :to="r.path"
                            :class="[r.permission ? '' : 'hidden']"
                            class="aside-link flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
                            style="border-radius:4px;" exact-active-class="aside-link-active">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                                stroke="currentColor" class="w-5 h-5 shrink-0">
                                <path stroke-linecap="round" stroke-linejoin="round" :d="r.icon" />
                            </svg>
                            <span>{{ r.name }}</span>
                        </router-link>
                    </nav>

                    <!-- Logout -->
                    <div class="p-3 flex-shrink-0" style="border-top:1px solid rgba(255,255,255,0.1);">
                        <button @click="handleLogout"
                            class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
                            style="color:rgba(252,129,129,0.85); border-radius:4px;"
                            @mouseover="e => e.currentTarget.style.background = 'rgba(252,129,129,0.1)'"
                            @mouseleave="e => e.currentTarget.style.background = ''">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                                stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                            {{ langStore.t('Chiqish') }}
                        </button>
                    </div>
                </aside>
            </Transition>

            <!-- MAIN CONTENT -->
            <main class="flex-1 overflow-auto flex flex-col">
                <div class="flex-1 p-5">
                    <router-view />
                </div>

                <!-- FOOTER -->
                <footer class="flex-shrink-0 text-center text-xs py-3 px-4" :style="themeStore.isDark
                    ? 'background:#182e4a; border-top:3px solid #2E8B57; color:#6090b8;'
                    : 'background:#1A3A6B; color:rgba(255,255,255,0.6); border-top:3px solid #2E8B57;'">
                    © {{ new Date().getFullYear() }} Yuridik Maslahat 24 · Barcha huquqlar himoyalangan
                </footer>
            </main>
        </div>

    </div>
</template>

<style scoped>
.aside-link {
    color: rgba(255, 255, 255, 0.7);
}

.aside-link:hover {
    background: rgba(255, 255, 255, 0.09);
    color: #ffffff;
}

.aside-link-active {
    background: rgba(46, 139, 87, 0.22) !important;
    color: #ffffff !important;
    font-weight: 700;
    border-left: 3px solid #2E8B57;
    padding-left: calc(0.75rem - 3px) !important;
}
</style>
