<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLangStore } from '@/stores/lang'
import { BASE_URL } from '@/api'
import { computed, ref } from 'vue'
import BackButton from '@/components/ui/BackButton.vue'

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
    {
        path: '/admin-settings',
        name: langStore.t('Sozlamalar'),
        icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        permission: authStore.userRole === 'RAHBAR'
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
        AdminSettings: langStore.t('Sozlamalar'),
    }
    return routeName[route.name] || route.meta.title || langStore.t('Sahifa')
})

const handleLogout = () => { authStore.logout(); router.push('/login') }

const langDropdownOpen = ref(false)
const langOptions = [
    { value: 'lotin', label: "O'zb", sub: 'Lotin' },
    { value: 'kiril', label: 'Ўзб', sub: 'Кирил' },
]
const currentLang = computed(() => langOptions.find(o => o.value === (langStore.isKiril ? 'kiril' : 'lotin')))
function selectLang(val) {
    langStore.setLang(val)
    langDropdownOpen.value = false
}
</script>

<template>
    <div class="flex h-screen overflow-hidden" style="background:var(--bg-page);">

        <!-- ═══ SIDEBAR ═══ -->
        <aside class="app-sidebar" :style="[
            'background:var(--bg-sidebar); border-right:1px solid var(--border);',
            sidebarCollapsed ? 'width:68px;' : 'width:250px;',
            'flex-shrink:0; display:flex; flex-direction:column; transition:width 220ms cubic-bezier(0.4,0,0.2,1); overflow:hidden;'
        ].join('')">

            <!-- Logo -->
            <div class="flex items-center justify-between px-4 flex-shrink-0"
                style="height:64px; border-bottom:1px solid var(--border);">
                <div class="flex items-center gap-2.5 overflow-hidden">
                    <img v-if="!sidebarCollapsed" src="../../public/logo.png" alt="Logo"
                        class="w-8 h-8 object-contain rounded-md shrink-0" />
                    <span v-if="!sidebarCollapsed" class="text-sm font-bold truncate" style="color:var(--text-1);">
                        Yuridik Maslahat
                    </span>
                </div>

                <button @click="sidebarCollapsed = !sidebarCollapsed"
                    class="w-8 h-8 flex items-center justify-center rounded-lg transition-all shrink-0 cursor-pointer"
                    style="color:var(--text-3);"
                    @mouseover="e => { e.currentTarget.style.background = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-1)' }"
                    @mouseleave="e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-3)' }">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>

            <!-- Nav -->
            <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
                <p v-if="!sidebarCollapsed" class="px-2.5 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider" style="color:var(--text-2);">
                    {{ langStore.t('Menyu') }}
                </p>

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
            <div class="flex items-center justify-center gap-2 border-t px-3 py-3 shrink-0" style="border-color:var(--border);">
                <button @click="handleLogout" :title="sidebarCollapsed ? langStore.t('Chiqish') : ''"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg transition-all cursor-pointer"
                    style="color:var(--danger);"
                    @mouseover="e => e.currentTarget.style.background = 'var(--danger-bg)'"
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
            <header class="flex items-center justify-between flex-shrink-0 px-6"
                style="height:64px; background:var(--bg-card); border-bottom:1px solid var(--border); z-index:20;">

                <!-- Left: collapse btn + breadcrumb -->
                <div class="flex items-center gap-3">
                    <img v-if="sidebarCollapsed" src="../../public/logo.png" alt="Logo"
                        class="w-8 h-8 mr-1 object-contain rounded-md" />

                    <BackButton />

                    <!-- Breadcrumb -->
                    <nav class="flex items-center gap-1.5 text-xs" style="color:var(--text-2);">
                        <span class="cursor-pointer transition-colors hover:text-[var(--primary)]" @click="$router.push('/')">
                            {{ langStore.t('Bosh sahifa') }}
                        </span>
                        <template v-if="currentPageTitle !== langStore.t('Bosh sahifa')">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-3 h-3 flex-shrink-0">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                            <span class="font-semibold" style="color:var(--text-1);">
                                {{ currentPageTitle }}
                            </span>
                        </template>
                    </nav>
                </div>

                <!-- Right: lang + theme + user -->
                <div class="flex items-center gap-2">

                    <!-- Lang dropdown -->
                    <div class="relative" v-click-outside="() => langDropdownOpen = false">
                        <button @click="langDropdownOpen = !langDropdownOpen"
                            class="flex items-center gap-1.5 h-9 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            style="background:var(--bg-page); border:1px solid var(--border); color:var(--text-2);">
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
                            <div v-if="langDropdownOpen" class="absolute right-0 mt-1.5 w-32 overflow-hidden z-50 rounded-xl"
                                style="background:var(--bg-card); border:1px solid var(--border); box-shadow:var(--shadow-md);">
                                <button v-for="opt in langOptions" :key="opt.value" @click="selectLang(opt.value)"
                                    class="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-all cursor-pointer"
                                    :style="currentLang.value === opt.value
                                        ? 'background:var(--primary-light); color:var(--primary); font-weight:700;'
                                        : 'color:var(--text-2);'">
                                    <span class="font-bold w-8">{{ opt.label }}</span>
                                    <span style="opacity:0.55">{{ opt.sub }}</span>
                                </button>
                            </div>
                        </Transition>
                    </div>

                    <!-- Theme toggle -->
                    <button @click="themeStore.toggleTheme()"
                        class="w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer"
                        style="background:var(--bg-page); border:1px solid var(--border); color:var(--text-2);"
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
                    <router-link to="/profile"
                        class="flex items-center gap-2.5 h-9 pl-1 pr-3 rounded-lg transition-all cursor-pointer"
                        style="background:var(--bg-page); border:1px solid var(--border); text-decoration:none;">
                        <div class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            <img v-if="authStore.user?.img" :src="`${BASE_URL}${authStore.user.img}`"
                                class="w-full h-full object-cover" />
                            <img v-else src="/User-avatar.svg.png" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-xs font-semibold" style="color:var(--text-1);">
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
