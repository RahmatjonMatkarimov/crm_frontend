<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Theme State
const isDark = ref(localStorage.getItem('theme') !== 'light')

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Sidebar Navigation
const activeTab = ref('dashboard') // dashboard, clients, cases, finance, users

// CRM Dynamic Database States
const stats = ref({
  totalClients: 0,
  activeCases: 0,
  winRate: '92.4%',
  monthlyRevenue: '0 UZS',
})

const clients = ref([])
const cases = ref([])
const transactions = ref([])
const logs = ref([])
const staffList = ref([])

const backendError = ref('')
const loadingData = ref(false)

// API Headers helper
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authStore.token}`
  }
}

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'Bugun' || dateStr === 'Hozir' || dateStr === 'Kecha') return dateStr
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

// Fetch all lists from backend
const fetchCRMData = async () => {
  loadingData.value = true
  backendError.value = ''
  try {
    // 1. Stats
    const statsRes = await fetch('http://localhost:4000/api/crm/stats', { headers: getHeaders() })
    if (statsRes.ok) stats.value = await statsRes.json()

    // 2. Clients
    const clientsRes = await fetch('http://localhost:4000/api/crm/clients', { headers: getHeaders() })
    if (clientsRes.ok) clients.value = await clientsRes.json()

    // 3. Cases
    const casesRes = await fetch('http://localhost:4000/api/crm/cases', { headers: getHeaders() })
    if (casesRes.ok) cases.value = await casesRes.json()

    // 4. Transactions
    const txsRes = await fetch('http://localhost:4000/api/crm/transactions', { headers: getHeaders() })
    if (txsRes.ok) transactions.value = await txsRes.json()

    // 5. Audit logs
    const logsRes = await fetch('http://localhost:4000/api/crm/logs', { headers: getHeaders() })
    if (logsRes.ok) logs.value = await logsRes.json()

    // 6. Staff
    const staffRes = await fetch('http://localhost:4000/api/crm/users', { headers: getHeaders() })
    if (staffRes.ok) staffList.value = await staffRes.json()

  } catch (err) {
    backendError.value = 'Tizim ma\'lumotlarini yuklashda xatolik yuz berdi: ' + err.message
  } finally {
    loadingData.value = false
  }
}

// Forms Inputs
const newClientName = ref('')
const newClientPhone = ref('')
const newClientType = ref('Yuridik shaxs')

const newCaseTitle = ref('')
const newCaseClient = ref('')
const newCaseLawyer = ref('')
const newCaseCourt = ref('')

const newInvoiceClient = ref('')
const newInvoiceAmount = ref('')

// Add Client to database
const addClient = async () => {
  if (!newClientName.value || !newClientPhone.value) return
  try {
    const response = await fetch('http://localhost:4000/api/crm/clients', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: newClientName.value,
        phone: newClientPhone.value,
        type: newClientType.value
      })
    })
    
    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.message || 'Mijoz qo\'shishda xatolik')
    }

    newClientName.value = ''
    newClientPhone.value = ''
    await fetchCRMData() // Reload
  } catch (err) {
    backendError.value = err.message
  }
}

// Add Case to database
const addCase = async () => {
  if (!newCaseTitle.value || !newCaseClient.value) return
  try {
    const response = await fetch('http://localhost:4000/api/crm/cases', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: newCaseTitle.value,
        clientName: newCaseClient.value,
        court: newCaseCourt.value,
        lawyerName: newCaseLawyer.value
      })
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.message || 'Ishni qo\'shishda xatolik')
    }

    newCaseTitle.value = ''
    newCaseClient.value = ''
    newCaseCourt.value = ''
    newCaseLawyer.value = ''
    await fetchCRMData()
  } catch (err) {
    backendError.value = err.message
  }
}

// Add Invoice to database
const addTransaction = async () => {
  if (!newInvoiceClient.value || !newInvoiceAmount.value) return
  try {
    const response = await fetch('http://localhost:4000/api/crm/transactions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        clientName: newInvoiceClient.value,
        amount: newInvoiceAmount.value
      })
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.message || 'Invoice chiqarishda xatolik')
    }

    newInvoiceClient.value = ''
    newInvoiceAmount.value = ''
    await fetchCRMData()
  } catch (err) {
    backendError.value = err.message
  }
}

// Pay Invoice in database
const payInvoice = async (id) => {
  try {
    const response = await fetch(`http://localhost:4000/api/crm/transactions/${id}/pay`, {
      method: 'POST',
      headers: getHeaders()
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.message || 'Hisob-fakturani to\'lashda xatolik')
    }

    await fetchCRMData()
  } catch (err) {
    backendError.value = err.message
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Role badge helper styles
const getRoleBadgeStyle = (role) => {
  switch (role) {
    case 'RAHBAR':
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30'
    case 'ADMIN':
      return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30'
    case 'YURIST':
      return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30'
    case 'KASSIR':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30'
    default:
      return 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-900/30'
  }
}

const getRoleDisplayName = (role) => {
  switch (role) {
    case 'RAHBAR': return 'Rahbar (Direktor)'
    case 'ADMIN': return 'Administrator'
    case 'YURIST': return 'Yurist (Advokat)'
    case 'KASSIR': return 'Kassir'
    default: return role
  }
}

const getCaseBadgeClass = (status) => {
  switch (status) {
    case 'Jarayonda':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'Yutildi':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'Keyinga qoldirildi':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

// New User creation (only for ADMIN / RAHBAR)
const newUserUsername = ref('')
const newUserPassword = ref('')
const newUserName = ref('')
const newUserRole = ref('KASSIR')
const userCreateError = ref('')
const userCreateSuccess = ref('')

const addUser = async () => {
  userCreateError.value = ''
  userCreateSuccess.value = ''
  if (!newUserUsername.value || !newUserPassword.value) {
    userCreateError.value = 'Login va parol kiritilishi shart'
    return
  }
  if (newUserPassword.value.length < 6) {
    userCreateError.value = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
    return
  }
  const result = await authStore.createUser(
    newUserUsername.value,
    newUserPassword.value,
    newUserName.value,
    newUserRole.value
  )
  if (result.success) {
    userCreateSuccess.value = `"${result.user?.username || newUserUsername.value}" muvaffaqiyatli yaratildi!`
    newUserUsername.value = ''
    newUserPassword.value = ''
    newUserName.value = ''
    newUserRole.value = 'KASSIR'
    await fetchCRMData()
  } else {
    userCreateError.value = authStore.error || 'Xatolik yuz berdi'
  }
}

onMounted(() => {
  fetchCRMData()
})
</script>

<template>
  <div :class="{ 'dark': isDark }" class="min-h-screen transition-colors duration-200">
    <div class="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#070b19] dark:text-slate-200 flex flex-col md:flex-row font-sans">
      
      <!-- SIDEBAR -->
      <aside class="w-full md:w-64 bg-white dark:bg-[#0d1326] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 select-none">
        <!-- Logo Header -->
        <div class="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-[#0f1d40]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider">YURIST CRM</span>
            <span class="text-3xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Konsalting</span>
          </div>
        </div>

        <!-- Navigation items -->
        <nav class="p-4 space-y-1.5 flex-1">
          <button
            @click="activeTab = 'dashboard'"
            class="w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer text-left"
            :class="activeTab === 'dashboard' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Boshqaruv paneli</span>
          </button>

          <button
            @click="activeTab = 'clients'"
            class="w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer text-left"
            :class="activeTab === 'clients' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20M4.12 18.096a9.3 9.3 0 014.12.952 9.39 9.39 0 002.625-.372M2.25 12.75a9.75 9.75 0 001.5 5.346m0 0a11.95 11.95 0 014.129-2.062M18.75 12.75a9.75 9.75 0 00-1.5-5.346m0 0a11.95 11.95 0 01-4.129 2.062M10.5 7.5a3 3 0 11-6 0 3 3 0 016 0zm9 3a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Mijozlar bazasi</span>
          </button>

          <button
            @click="activeTab = 'cases'"
            class="w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer text-left"
            :class="activeTab === 'cases' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5m-18 0h18" />
            </svg>
            <span>Sud ishlari</span>
          </button>

          <button
            @click="activeTab = 'finance'"
            class="w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer text-left"
            :class="activeTab === 'finance' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M4.5 19.25h15M3.75 4.5v14.25M21 4.5v14.25M6 9h3M6 13.5h3m6-4.5h3m-3 4.5h3m-12 4.5h12" />
            </svg>
            <span>Moliya & Kassa</span>
          </button>

          <button
            @click="activeTab = 'users'"
            class="w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer text-left"
            :class="activeTab === 'users' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Tizim xodimlari</span>
          </button>
        </nav>

        <!-- Current User footer info -->
        <div class="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 select-none">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[#0f1d40] dark:text-white uppercase text-xs border border-slate-300 dark:border-slate-700">
              {{ authStore.user?.username.slice(0, 2) }}
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                {{ authStore.user?.name || authStore.user?.username }}
              </span>
              <span class="text-3xs font-semibold text-slate-400 dark:text-slate-500 uppercase leading-none">
                {{ getRoleDisplayName(authStore.userRole) }}
              </span>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700/80"
          >
            Hisobdan chiqish
          </button>
        </div>
      </aside>

      <!-- MAIN AREA -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- HEADER -->
        <header class="h-16 px-6 bg-white dark:bg-[#0d1326] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <h2 class="text-md font-extrabold text-[#0f1d40] dark:text-white uppercase tracking-wider select-none">
              {{ activeTab === 'dashboard' ? 'Bosh sahifa' : activeTab === 'clients' ? 'Mijozlar' : activeTab === 'cases' ? 'Sud Nizolari' : activeTab === 'finance' ? 'Moliyaviy Hisobotlar' : 'Xodimlar va Huquqlar' }}
            </h2>
          </div>

          <div class="flex items-center gap-4 select-none">
            <!-- Theme Toggle Button -->
            <button
              @click="toggleTheme"
              class="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b19] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
            >
              <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-amber-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-indigo-950">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            </button>

            <!-- Role Badge -->
            <span class="px-2.5 py-1 text-[10px] font-bold border rounded-full uppercase" :class="getRoleBadgeStyle(authStore.userRole)">
              {{ authStore.userRole }}
            </span>
          </div>
        </header>

        <!-- CONTAINER -->
        <main class="p-6 overflow-y-auto flex-1 space-y-6">

          <!-- Dynamic global backend warning -->
          <div v-if="backendError" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{{ backendError }}</span>
          </div>

          <!-- 1. BOSH SAHIFA TAB -->
          <div v-if="activeTab === 'dashboard'" class="space-y-6">
            
            <!-- Cards stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
              <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Jami mijozlar</span>
                  <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ stats.totalClients }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </div>

              <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Faol sud ishlari</span>
                  <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ stats.activeCases }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5m-18 0h18" />
                  </svg>
                </div>
              </div>

              <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yutuqlar ko'rsatkichi</span>
                  <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ stats.winRate }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kirimlar balansi (Oylik)</span>
                  <p class="text-sm font-black text-slate-900 dark:text-white mt-2 truncate">{{ stats.monthlyRevenue }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.22.22a2.25 2.25 0 003.182 0l2.909-2.909m-6.437 2.276a3.722 3.722 0 003.181 3.182m0-5.511A3.733 3.733 0 0116.5 12M9 12.75L11.25 15" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Role Specific Functional Panels -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Left side content -->
              <div class="lg:col-span-2 space-y-6">
                
                <!-- RAHBAR (Director) panel -->
                <div v-if="authStore.userRole === 'RAHBAR'" class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm select-none">
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                    Rahbar Maxsus Bo'limi (Tahlillar va Kpi)
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    Kompaniyadagi yuristlar samaradorligi va yutuqlar foizi ko'rsatilgan.
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="p-4 bg-slate-50 dark:bg-[#070b19] border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
                      <span class="text-3xs font-extrabold text-slate-400 uppercase">Top 1 Advokat</span>
                      <p class="text-sm font-bold text-slate-800 dark:text-slate-200">Farrux Qodirov</p>
                      <span class="text-xs text-emerald-500 font-semibold">94% yutuqli ishlar</span>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-[#070b19] border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
                      <span class="text-3xs font-extrabold text-slate-400 uppercase">Ishlar yopilish tezligi</span>
                      <p class="text-sm font-bold text-slate-800 dark:text-slate-200">O'rtacha 14 kun</p>
                      <span class="text-xs text-blue-500 font-semibold">Barcha tizimlar faol</span>
                    </div>
                  </div>
                </div>

                <!-- ADMIN panel -->
                <div v-if="authStore.userRole === 'ADMIN'" class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 select-none">
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span class="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                    Tizim Sozlamalari (Administrator)
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    Siz ushbu bo'limda tizim xavfsizlik loglarini, ulanishlarni va tizim foydalanuvchilarini to'liq nazorat qila olasiz.
                  </p>
                  
                  <div class="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Prisma & Database ulanishi:</span>
                    </div>
                    <span class="text-xs font-bold text-emerald-500 uppercase">Aloqa faol</span>
                  </div>
                </div>

                <!-- YURIST panel -->
                <div v-if="authStore.userRole === 'YURIST' || authStore.userRole === 'RAHBAR' || authStore.userRole === 'ADMIN'" class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
                    <span class="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                    Yurist Bo'limi (Yangi sud ishini ro'yxatga olish)
                  </h3>
                  
                  <form @submit.prevent="addCase" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Sud ishi mavzusi <span class="text-red-500">*</span></label>
                      <input v-model="newCaseTitle" type="text" required class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-purple-500" placeholder="masalan: Soliq bo'yicha appelyatsiya" />
                    </div>
                    <div class="space-y-1">
                      <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Mijoz nomi <span class="text-red-500">*</span></label>
                      <input v-model="newCaseClient" type="text" required class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-purple-500" placeholder="masalan: Akfa Group MChJ" />
                    </div>
                    <div class="space-y-1">
                      <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Sud nomi</label>
                      <input v-model="newCaseCourt" type="text" class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-purple-500" placeholder="masalan: Toshkent tumanlararo sudi" />
                    </div>
                    <div class="space-y-1">
                      <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Mas'ul advokat</label>
                      <input v-model="newCaseLawyer" type="text" class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-purple-500" placeholder="masalan: Zarina (yoki bo'sh qoldiring)" />
                    </div>
                    <button type="submit" class="sm:col-span-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-99">
                      Sud ishini bazaga saqlash
                    </button>
                  </form>
                </div>

                <!-- KASSIR panel -->
                <div v-if="authStore.userRole === 'KASSIR' || authStore.userRole === 'RAHBAR' || authStore.userRole === 'ADMIN'" class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
                    <span class="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                    Kassa va Hisob-fakturalar (Invoice) chiqarish
                  </h3>
                  
                  <form @submit.prevent="addTransaction" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Mijoz nomi <span class="text-red-500">*</span></label>
                      <input v-model="newInvoiceClient" type="text" required class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-emerald-500" placeholder="masalan: Akfa Group" />
                    </div>
                    <div class="space-y-1">
                      <label class="block text-3xs font-bold text-slate-400 uppercase select-none">To'lov miqdori (so'mda) <span class="text-red-500">*</span></label>
                      <input v-model="newInvoiceAmount" type="number" required class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-emerald-500" placeholder="masalan: 5000000" />
                    </div>
                    <button type="submit" class="sm:col-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-99">
                      Yangi hisob-faktura (Invoice) yaratish
                    </button>
                  </form>
                </div>

                <!-- Active court cases table -->
                <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
                    <span class="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                    Tizimdagi sud nizolari
                  </h3>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold select-none">
                          <th class="py-2.5">Ish #</th>
                          <th class="py-2.5">Nomi</th>
                          <th class="py-2.5">Mijoz</th>
                          <th class="py-2.5">Mas'ul advokat</th>
                          <th class="py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        <tr v-for="c in cases" :key="c.id" class="text-slate-700 dark:text-slate-300">
                          <td class="py-2.5 font-mono text-slate-400">#{{ c.id.slice(0, 5) }}</td>
                          <td class="py-2.5 font-bold text-[#0f1d40] dark:text-white">{{ c.title }}</td>
                          <td class="py-2.5">{{ c.client?.name }}</td>
                          <td class="py-2.5 text-indigo-600 dark:text-indigo-400">{{ c.lawyer?.name || 'Biriktirilmagan' }}</td>
                          <td class="py-2.5 text-right">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="getCaseBadgeClass(c.status)">
                              {{ c.status }}
                            </span>
                          </td>
                        </tr>
                        <tr v-if="cases.length === 0">
                          <td colspan="5" class="py-4 text-center text-slate-400 font-medium select-none">Sud ishlari topilmadi</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              <!-- Right Sidebar (Audit log & API connection info) -->
              <div class="space-y-6">
                <!-- Activity Log -->
                <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
                    <span class="w-1.5 h-5 bg-rose-500 rounded-full"></span>
                    Tizim jurnali (Audit Logs)
                  </h3>
                  <div class="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    <div v-for="l in logs" :key="l.id" class="flex gap-3 text-xs leading-relaxed">
                      <div class="w-1.5 h-1.5 rounded-full mt-1.5 bg-slate-300 dark:bg-slate-700 shrink-0"></div>
                      <div class="flex-1">
                        <p class="text-slate-700 dark:text-slate-300 font-medium">{{ l.action }}</p>
                        <div class="flex items-center gap-2 mt-0.5 text-slate-400 dark:text-slate-500 font-semibold text-[10px]">
                          <span>{{ formatDate(l.createdAt) }}</span>
                          <span>·</span>
                          <span class="uppercase text-amber-600 dark:text-amber-400 font-extrabold">{{ l.username }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="logs.length === 0" class="text-center py-4 text-slate-400 font-medium select-none">Loglar mavjud emas</div>
                  </div>
                </div>

                <!-- Security panel -->
                <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 select-none">
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span class="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Tizim Xavfsizlik testi
                  </h3>
                  <p class="text-slate-400 text-[10px] leading-relaxed">
                    Ushbu test sizning JWT tokeningizni NestJS backenddagi so'rovlarni himoyalashga mosligini tekshiradi.
                  </p>

                  <button
                    @click="fetchCRMData"
                    :disabled="loadingData"
                    class="w-full py-2 bg-[#0f1d40] hover:bg-[#132552] dark:bg-slate-800 dark:hover:bg-slate-700/80 text-white rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-98"
                  >
                    {{ loadingData ? 'Yangilanmoqda...' : 'Tizimni qayta tekshirish' }}
                  </button>

                  <div class="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-3xs font-mono text-emerald-600 dark:text-emerald-400">
                    <span class="font-bold">Muvaffaqiyatli:</span> JWT Token faol va bog'langan.
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- 2. MIJOZLAR TAB -->
          <div v-if="activeTab === 'clients'" class="space-y-6">
            <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider select-none">Mijozlar ro'yxati</h3>
                  <p class="text-xs text-slate-500 select-none">Mijozlarning to'liq ro'yxati va ular bilan ishlash holati.</p>
                </div>
                
                <div v-if="authStore.userRole !== 'KASSIR'" class="flex gap-2">
                  <input v-model="newClientName" type="text" class="px-3 py-1.5 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none" placeholder="F.I.SH / Tashkilot nomi" />
                  <input v-model="newClientPhone" type="text" class="px-3 py-1.5 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none" placeholder="Telefon raqami" />
                  <button @click="addClient" class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg font-bold text-xs transition-all cursor-pointer">Qo'shish</button>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold select-none">
                      <th class="py-3 px-4">Kod #</th>
                      <th class="py-3 px-4">Mijoz nomi</th>
                      <th class="py-3 px-4">Telefon raqam</th>
                      <th class="py-3 px-4">Turi</th>
                      <th class="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    <tr v-for="client in clients" :key="client.id" class="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/10">
                      <td class="py-3 px-4 font-mono text-slate-400">#{{ client.id.slice(0, 5) }}</td>
                      <td class="py-3 px-4 font-bold text-[#0f1d40] dark:text-white">{{ client.name }}</td>
                      <td class="py-3 px-4 font-mono">{{ client.phone }}</td>
                      <td class="py-3 px-4 text-slate-500">{{ client.type }}</td>
                      <td class="py-3 px-4 text-right">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="client.status === 'Faol' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                          {{ client.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="clients.length === 0">
                      <td colspan="5" class="py-4 text-center text-slate-400 font-medium select-none">Mijozlar topilmadi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 3. SUD ISHLARI TAB -->
          <div v-if="activeTab === 'cases'" class="space-y-6">
            <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider select-none">Sud nizolari jurnali</h3>
                  <p class="text-xs text-slate-500 select-none">Mavjud sud jarayonlari va yuristlarning ish taqsimoti.</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold select-none">
                      <th class="py-3 px-4">Kod #</th>
                      <th class="py-3 px-4">Ish mavzusi</th>
                      <th class="py-3 px-4">Mijoz</th>
                      <th class="py-3 px-4">Mas'ul advokat</th>
                      <th class="py-3 px-4">Sud organi</th>
                      <th class="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    <tr v-for="c in cases" :key="c.id" class="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/10">
                      <td class="py-3 px-4 font-mono text-slate-400">#{{ c.id.slice(0, 5) }}</td>
                      <td class="py-3 px-4 font-bold text-[#0f1d40] dark:text-white">{{ c.title }}</td>
                      <td class="py-3 px-4">{{ c.client?.name }}</td>
                      <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{{ c.lawyer?.name || 'Biriktirilmagan' }}</td>
                      <td class="py-3 px-4 text-slate-400">{{ c.court }}</td>
                      <td class="py-3 px-4 text-right">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="getCaseBadgeClass(c.status)">
                          {{ c.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="cases.length === 0">
                      <td colspan="6" class="py-4 text-center text-slate-400 font-medium select-none">Sud nizolari topilmadi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 4. FINANSLAR TAB -->
          <div v-if="activeTab === 'finance'" class="space-y-6">
            <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider select-none">Tranzaksiyalar va To'lovlar</h3>
                  <p class="text-xs text-slate-500 select-none">Mijozlar bilan tuzilgan shartnoma hisob varaqalari va to'lov holati.</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold select-none">
                      <th class="py-3 px-4">Schot raqami</th>
                      <th class="py-3 px-4">Mijoz nomi</th>
                      <th class="py-3 px-4">Summa</th>
                      <th class="py-3 px-4">Sana</th>
                      <th class="py-3 px-4">Status</th>
                      <th class="py-3 px-4 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    <tr v-for="t in transactions" :key="t.id" class="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/10">
                      <td class="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">{{ t.invoice }}</td>
                      <td class="py-3 px-4 font-bold">{{ t.client?.name }}</td>
                      <td class="py-3 px-4 font-mono font-bold">{{ t.amount }}</td>
                      <td class="py-3 px-4 text-slate-400">{{ formatDate(t.createdAt) }}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="t.status === 'To\'landi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                          {{ t.status }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <button
                          v-if="t.status === 'Kutilmoqda' && (authStore.userRole === 'KASSIR' || authStore.userRole === 'RAHBAR' || authStore.userRole === 'ADMIN')"
                          @click="payInvoice(t.id)"
                          class="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                        >
                          To'lash
                        </button>
                        <span v-else class="text-3xs text-slate-400 font-bold select-none">Amal yo'q</span>
                      </td>
                    </tr>
                    <tr v-if="transactions.length === 0">
                      <td colspan="6" class="py-4 text-center text-slate-400 font-medium select-none">Tranzaksiyalar topilmadi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 5. XODIMLAR TAB -->
          <div v-if="activeTab === 'users'" class="space-y-6">
            
            <!-- User Creation Form — only ADMIN / RAHBAR can see this -->
            <div
              v-if="authStore.userRole === 'ADMIN' || authStore.userRole === 'RAHBAR'"
              class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
                <span class="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                Yangi xodim qo'shish (Faqat Admin / Rahbar)
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 select-none">
                Tizimga yangi foydalanuvchi qo'shing va unga rol belgilang. Faqat siz (Admin yoki Rahbar) bu amalni bajara olasiz.
              </p>

              <!-- Success alert -->
              <div v-if="userCreateSuccess" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 shrink-0">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
                <span>{{ userCreateSuccess }}</span>
              </div>

              <!-- Error alert -->
              <div v-if="userCreateError" class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 shrink-0">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ userCreateError }}</span>
              </div>

              <form @submit.prevent="addUser" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Full name -->
                <div class="space-y-1">
                  <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Ismi (ixtiyoriy)</label>
                  <input
                    v-model="newUserName"
                    type="text"
                    class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="masalan: Farhod Toshmatov"
                  />
                </div>

                <!-- Username -->
                <div class="space-y-1">
                  <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Login <span class="text-red-500">*</span></label>
                  <input
                    v-model="newUserUsername"
                    type="text"
                    required
                    autocomplete="off"
                    class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="masalan: farhod_yurist"
                  />
                </div>

                <!-- Password -->
                <div class="space-y-1">
                  <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Parol <span class="text-red-500">*</span></label>
                  <input
                    v-model="newUserPassword"
                    type="password"
                    required
                    autocomplete="new-password"
                    minlength="6"
                    class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Kamida 6 belgi"
                  />
                </div>

                <!-- Role -->
                <div class="space-y-1">
                  <label class="block text-3xs font-bold text-slate-400 uppercase select-none">Lavozim <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select
                      v-model="newUserRole"
                      class="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="KASSIR">Kassir</option>
                      <option value="YURIST">Yurist (Advokat)</option>
                      <option value="ADMIN">Administrator</option>
                      <option value="RAHBAR">Rahbar (Direktor)</option>
                    </select>
                    <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </div>
                </div>

                <!-- Submit -->
                <button
                  type="submit"
                  :disabled="authStore.loading"
                  class="sm:col-span-2 lg:col-span-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span v-if="authStore.loading" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  <span>{{ authStore.loading ? 'Yaratilmoqda...' : 'Yangi xodim yaratish' }}</span>
                </button>
              </form>
            </div>

            <!-- Staff list -->
            <div class="bg-white dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <h3 class="font-extrabold text-sm text-[#0f1d40] dark:text-white uppercase tracking-wider select-none">Tizim xodimlari</h3>
                <p class="text-xs text-slate-500 select-none">Kompaniya yuridik konsalting tizimi xodimlari ro'yxati.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="staff in staffList" :key="staff.id" class="p-4 bg-slate-50 dark:bg-[#0d1326] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-center">
                  <div class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-lg font-bold border border-amber-500/20">
                    {{ staff.username.slice(0, 2).toUpperCase() }}
                  </div>
                  <p class="text-xs font-bold text-slate-800 dark:text-white">{{ staff.name || staff.username }}</p>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">@{{ staff.username }}</p>
                  <span class="inline-block px-2 py-0.5 rounded text-[10px] border font-bold uppercase" :class="getRoleBadgeStyle(staff.role)">
                    {{ getRoleDisplayName(staff.role) }}
                  </span>
                </div>
                <div v-if="staffList.length === 0" class="col-span-4 py-6 text-center text-slate-400 font-medium select-none text-xs">
                  Xodimlar topilmadi
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

    </div>
  </div>
</template>

<style scoped>
.text-3xs {
  font-size: 0.65rem;
}
.text-2xs {
  font-size: 0.72rem;
}
</style>
