<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import CustomerModal from '@/components/customers/CustomerModal.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import { useAuthStore } from '@/stores/auth'
import { usePricesStore } from '@/stores/prices'
import { useThemeStore } from '@/stores/theme'
import translateText from '@/utils/translete.js'

const { proxy } = getCurrentInstance()

const authStore = useAuthStore()
const store = useCustomersStore()
const pricesStore = usePricesStore()
const themeStore = useThemeStore()
const router = useRouter()
const editingCustomer = ref(null)
const search = ref('')
const showModal = ref(false)
const editing = ref(null)
const selected = ref([])
const filterTab = ref('all') // 'all' or 'debtors'
const statusFilter = ref('all') // 'all' | CustomerStatus
const dateFilter = ref('today') // 'today' | 'monthly' | 'yearly' | 'all' | 'range'
const dateFrom = ref('')
const dateTo = ref('')
const showPricesModal = ref(false)
const editingPriceOne = ref(0)
const editingPriceTwo = ref(0)
const editingPriceThree = ref(0)
const price = ref(0)

const paymentAmount = ref(0)
const paymentType = ref('NAQD')
const showDebtModal = ref(false)

onMounted(() => {
  store.fetchCustomers()
  pricesStore.fetchPrices()
})

import { useRouter } from 'vue-router'
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  const now = new Date()

  // Telefonni faqat raqamlarga aylantirish
  const normalizePhone = (phone) => {
    if (!phone) return ""
    return String(phone).replace(/\D/g, "")
  }

  const normalizedSearchPhone = normalizePhone(q)

  return store.customers.filter((c) => {
    // Faqat o'ziga biriktirilgan mijozlar
    if (dateFilter.value === "my") {
      if (c.assignedTo?.id !== authStore.user.id) {
        return false
      }
    }

    const matchField = (val) => {
      if (!val) return false

      const text = String(val).toLowerCase()
      const textKirill = translateText(text).toLowerCase()

      return text.includes(q) || textKirill.includes(q)
    }

    const matchesSearch =
      !q ||
      matchField(c.name) ||
      matchField(c.surname) ||
      matchField(c.address) ||
      (
        c.customer_id &&
        (
          `mjz-${c.customer_id}`.toLowerCase().includes(q) ||
          String(c.customer_id).includes(q)
        )
      ) ||
      (
        normalizedSearchPhone.length > 0 &&
        normalizePhone(c.phone).includes(normalizedSearchPhone)
      )

    if (!matchesSearch) return false

    // Sana bo'yicha filter
    if (dateFilter.value !== "all" && dateFilter.value !== "my") {
      const created = new Date(c.createdAt)

      if (dateFilter.value === "today") {
        if (
          created.getFullYear() !== now.getFullYear() ||
          created.getMonth() !== now.getMonth() ||
          created.getDate() !== now.getDate()
        ) {
          return false
        }
      } else if (dateFilter.value === "monthly") {
        if (
          created.getFullYear() !== now.getFullYear() ||
          created.getMonth() !== now.getMonth()
        ) {
          return false
        }
      } else if (dateFilter.value === "yearly") {
        if (created.getFullYear() !== now.getFullYear()) {
          return false
        }
      } else if (dateFilter.value === "range") {
        if (dateFrom.value) {
          const from = new Date(dateFrom.value)
          from.setHours(0, 0, 0, 0)

          if (created < from) return false
        }

        if (dateTo.value) {
          const to = new Date(dateTo.value)
          to.setHours(23, 59, 59, 999)

          if (created > to) return false
        }
      }
    }

    // Qarzdorlar
    if (filterTab.value === "debtors") {
      const paid = c.payments?.[c.payments.length - 1]?.amount || 0

      if ((c.price || 0) - paid <= 0) {
        return false
      }
    }

    // Status
    if (
      statusFilter.value !== "all" &&
      c.status !== statusFilter.value
    ) {
      return false
    }

    return true
  })
})
// Faqat sana bo'yicha filterlangan (status select sonlari uchun)
const byDateOnly = computed(() => {
  const now = new Date()
  return store.customers.filter(c => {
    if (dateFilter.value === 'all') return true
    const created = new Date(c.createdAt)
    if (dateFilter.value === 'today') {
      return created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth() &&
        created.getDate() === now.getDate()
    } else if (dateFilter.value === 'monthly') {
      return created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
    } else if (dateFilter.value === 'yearly') {
      return created.getFullYear() === now.getFullYear()
    } else if (dateFilter.value === 'my') {
      return c.assignedTo?.id === authStore.user.id
    } else if (dateFilter.value === 'range') {
      if (dateFrom.value) {
        const from = new Date(dateFrom.value)
        from.setHours(0, 0, 0, 0)
        if (created < from) return false
      }
      if (dateTo.value) {
        const to = new Date(dateTo.value)
        to.setHours(23, 59, 59, 999)
        if (created > to) return false
      }
      return true
    }
    return true
  })
})

// Faqat status bo'yicha filterlangan (date tab sonlari uchun)
const byStatusOnly = computed(() => {
  if (statusFilter.value === 'all') return store.customers
  return store.customers.filter(c => c.status === statusFilter.value)
})

const countByDate = (dateKey) => {
  const now = new Date()
  const base = statusFilter.value === 'all' ? store.customers : store.customers.filter(c => c.status === statusFilter.value)
  return base.filter(c => {
    const created = new Date(c.createdAt)
    if (dateKey === 'today') {
      return created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth() &&
        created.getDate() === now.getDate()
    } else if (dateKey === 'monthly') {
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
    } else if (dateKey === 'my') {
      return c.assignedTo?.id === authStore.user.id
    } else if (dateKey === 'yearly') {
      return created.getFullYear() === now.getFullYear()
    }
    return true
  }).length
}


const openPricesModal = () => {
  editingPriceOne.value = pricesStore.prices.price_one
  editingPriceTwo.value = pricesStore.prices.price_two
  editingPriceThree.value = pricesStore.prices.price_three
  showPricesModal.value = true
}

const savePrices = async () => {
  const result = await pricesStore.updatePrices({
    price_one: editingPriceOne.value,
    price_two: editingPriceTwo.value,
    price_three: editingPriceThree.value,
  })
  if (result.success) {
    showPricesModal.value = false
    alert('Narx sozlamalari saqlandi!')
  } else {
    alert('Xatolik: ' + result.error)
  }
}


const allChecked = computed(() =>
  filtered.value.length > 0 && filtered.value.every(c => selected.value.includes(c.id))
)

const toggleOne = (id) => {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter(x => x !== id)
  } else {
    selected.value.push(id)
  }
}

const openCreate = () => { editing.value = null; showModal.value = true }
const openEdit = (c) => { editing.value = { ...c }; showModal.value = true }

const archive = async (c) => {
  if (!confirm(`"${c.surname} ${c.name}" ${proxy.$t("ni arxivga o'tkazmoqchimisiz?")}`)) return
  await store.archiveCustomer(c.id)
  selected.value = selected.value.filter(x => x !== c.id)
}

const archiveSelected = async () => {
  if (!selected.value.length) return
  if (!confirm(`${selected.value.length} ${proxy.$t("ta mijozni arxivga o'tkazmoqchimisiz?")}`)) return
  for (const id of selected.value) await store.archiveCustomer(id)
  selected.value = []
}

const statusInlineColors = {
  NAVBATDA: { bg: '#dbeafe', color: '#1d4ed8' },
  YURISTDA: { bg: '#ede9fe', color: '#7c3aed' },
  KORIB_CHIQILDI: { bg: '#fef3c7', color: '#d97706' },
  JARAYONDA: { bg: '#ffedd5', color: '#ea580c' },
  YAKUNLANDI: { bg: '#d1fae5', color: '#059669' },
  BEKOR_QILINDI: { bg: '#fee2e2', color: '#dc2626' },
}

const openCustomer = (id) => {
  router.push('/customer/' + id)
}
const formatMoney = (amount) => {
  if (!amount) return '—'
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount) + ' so\'m'
}
</script>

<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="gov-page-title text-xl font-bold" :style="themeStore.isDark ? 'color:#e2e8f0' : 'color:#1A3A6B'">{{
          $t('Mijozlar') }}</h1>
        <p class="text-sm mt-1" :style="themeStore.isDark ? 'color:#4a5878' : 'color:#4a5568'">
          {{ $t('Faol mijozlar') }} — {{ $t('Jami') }}
          <span class="font-bold" :style="themeStore.isDark ? 'color:#e2e8f0' : 'color:#1A3A6B'">{{
            store.customers.length }}</span>
          {{ $t('ta') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openCreate" v-if="authStore.permission.add_customers"
          class="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold active:scale-[0.98] transition-all cursor-pointer"
          style="background:#1A3A6B; border-radius:4px; letter-spacing:0.03em;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {{ $t('Yangi mijoz') }}
        </button>
        <button @click="openPricesModal" v-if="authStore.permission.edit_prices"
          class="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-all cursor-pointer active:scale-[0.98]"
          :style="themeStore.isDark
            ? 'background:#161c2d; border:1px solid #1e2d42; color:#8892a4;'
            : 'background:#ffffff; border:1px solid #d8dde6; color:#4a5568;'">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
            stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          {{ $t('Narx sozlamalari') }}
        </button>

      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style="color:#8892a4;">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input v-model="search" type="text" :placeholder="$t('Ism, familiya, telefon, manzil yoki') + ' MJZ-ID...'"
        class="w-full pl-11 pr-4 py-3 rounded text-sm transition-all focus:outline-none" :style="themeStore.isDark
          ? 'background:#161c2d; border:1px solid #1e2d42; color:#e2e8f0;'
          : 'background:#ffffff; border:1px solid #d8dde6; color:#1a1f36;'" />
    </div>

    <!-- Date Filter Tabs -->
    <div class="flex items-center gap-2 flex-wrap">
      <button v-for="tab in [
        { key: 'today', label: $t('Bugun') },
        { key: 'monthly', label: $t('Oylik') },
        { key: 'yearly', label: $t('Yillik') },
        { key: 'all', label: $t('Hammasi') },
        { key: 'my', label: $t('Menga biriktirilgan') },
        { key: 'range', label: $t('Sana oralig\'i') },
      ]" :key="tab.key" @click="dateFilter = tab.key"
        class="px-4 py-2 rounded text-sm font-semibold transition-all cursor-pointer" :style="dateFilter === tab.key
          ? 'background:#1A3A6B; color:#ffffff;'
          : themeStore.isDark
            ? 'background:#161c2d; border:1px solid #1e2d42; color:#8892a4;'
            : 'background:#ffffff; border:1px solid #d8dde6; color:#4a5568;'">
        {{ tab.label }}
        <span v-if="tab.key !== 'range'" class="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
          :style="dateFilter === tab.key ? 'background:rgba(255,255,255,0.2); color:#ffffff;' : themeStore.isDark ? 'background:#1e2d42; color:#8892a4;' : 'background:#eef2f7; color:#1A3A6B;'">
          {{ tab.key === 'all' ? byStatusOnly.length : countByDate(tab.key) }}
        </span>
      </button>
      <!-- Status Filter -->
      <div class="flex items-center gap-3">

        <div class="relative">
          <select v-model="statusFilter"
            class="pl-3 pr-8 py-2 rounded text-sm font-medium transition-all focus:outline-none appearance-none cursor-pointer"
            :style="statusFilter !== 'all'
              ? `background:${statusInlineColors[statusFilter]?.bg}; color:${statusInlineColors[statusFilter]?.color}; border:1px solid ${statusInlineColors[statusFilter]?.color}40;`
              : themeStore.isDark
                ? 'background:#161c2d; border:1px solid #1e2d42; color:#e2e8f0;'
                : 'background:#ffffff; border:1px solid #d8dde6; color:#1a1f36;'">
            <option value="all">{{ $t('Barchasi') }} ({{ byDateOnly.length }})</option>
            <option value="NAVBATDA">{{ $t('Navbatda') }} ({{byDateOnly.filter(c => c.status === 'NAVBATDA').length}})
            </option>
            <option value="KORIB_CHIQILDI">{{ $t("Ko'rib chiqildi") }} ({{byDateOnly.filter(c => c.status ===
              'KORIB_CHIQILDI').length}})</option>
            <option value="JARAYONDA">{{ $t('Shartnoma tuzildi') }} ({{byDateOnly.filter(c => c.status ===
              'JARAYONDA').length}})</option>
            <option value="YAKUNLANDI">{{ $t('Maslahat berildi') }} ({{byDateOnly.filter(c => c.status ===
              'YAKUNLANDI').length}})</option>
            <option value="YURISTDA">{{ $t('Maslahat berildi va shartnoma tuzildiz') }} ({{byDateOnly.filter(c =>
              c.status === 'YURISTDA').length}})</option>
            <!-- <option value="BEKOR_QILINDI">{{ $t('Bekor qilindi') }} ({{ byDateOnly.filter(c => c.status === 'BEKOR_QILINDI').length }})</option> -->
          </select>
          <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" fill="none"
            viewBox="0 0 24 24" stroke="currentColor"
            :style="statusFilter !== 'all' ? `color:${statusInlineColors[statusFilter]?.color}` : themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4'">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>



    <!-- Date Range Inputs -->
    <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="dateFilter === 'range'" class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <label class="text-xs font-semibold shrink-0"
            :style="themeStore.isDark ? 'color:#4a5878' : 'color:#4a5568'">{{ $t('Dan') }}:</label>
          <input v-model="dateFrom" type="date"
            class="flex-1 px-3 py-2 rounded text-sm transition-all focus:outline-none" :style="themeStore.isDark
              ? 'background:#161c2d; border:1px solid #1e2d42; color:#e2e8f0;'
              : 'background:#ffffff; border:1px solid #d8dde6; color:#1a1f36;'" />
        </div>
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <label class="text-xs font-semibold shrink-0"
            :style="themeStore.isDark ? 'color:#4a5878' : 'color:#4a5568'">{{ $t('Gacha') }}:</label>
          <input v-model="dateTo" type="date" class="flex-1 px-3 py-2 rounded text-sm transition-all focus:outline-none"
            :style="themeStore.isDark
              ? 'background:#161c2d; border:1px solid #1e2d42; color:#e2e8f0;'
              : 'background:#ffffff; border:1px solid #d8dde6; color:#1a1f36;'" />
        </div>
        <button v-if="dateFrom || dateTo" @click="dateFrom = ''; dateTo = ''"
          class="px-3 py-2 rounded-xl text-xs font-medium transition-all"
          :class="themeStore.isDark ? 'bg-rose-900/20 text-rose-400 border border-rose-500/20 hover:bg-rose-900/40' : 'bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100'">
          {{ $t('Tozalash') }}
        </button>
      </div>
    </Transition>

    <!-- Bulk bar -->
    <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="selected.length > 0" class="flex items-center justify-between px-5 py-3 rounded"
        :style="themeStore.isDark ? 'background:#161c2d; border:1px solid #1e2d42;' : 'background:#eef2f7; border:1px solid #d8dde6;'">
        <span class="text-sm font-semibold" :style="themeStore.isDark ? 'color:#e2e8f0' : 'color:#1a1f36'">
          {{ selected.length }} {{ $t('ta tanlandi') }}
        </span>
        <div class="flex gap-2">
          <button @click="selected = []" class="px-4 py-1.5 rounded text-sm font-medium transition-colors"
            :style="themeStore.isDark ? 'color:#8892a4' : 'color:#4a5568'">
            {{ $t('Bekor qilish') }}
          </button>
          <button @click="archiveSelected"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium bg-red-500/15 text-red-500 hover:bg-red-500/25 border border-red-500/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {{ $t("Arxivga o'tkazish") }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="store.loading" class="flex items-center justify-center py-16 gap-3"
      :style="themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4'">
      <div class="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
      <span class="text-sm">{{ $t('Yuklanmoqda...') }}</span>
    </div>

    <!-- Cards grid -->
    <div v-else-if="filtered.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 bg-[#1A3A6B1e] p-5 border-2 border-[#1A3A6B7e] gap-4">
      <div v-for="c in filtered" :key="c.id" class="relative rounded p-5 cursor-pointer transition-all group" :style="themeStore.isDark
        ? 'background:#161c2d; border:1px solid ' + (selected.includes(c.id) ? '#1A3A6B' : '#1e2d42') + ';'
        : 'background:#ffffff; border:1px solid ' + (selected.includes(c.id) ? '#1A3A6B' : '#d8dde6') + ';'"
        @click="openCustomer(c.id)">
<!--
        <div v-if="authStore.permission.delete_customers" class="absolute top-3 right-3 z-10" @click.stop>
          <AppCheckbox :checked="selected.includes(c.id)" @change="toggleOne(c.id)" />
        </div>
-->


        <!-- Top: Avatar + Name + Source -->
        <div class="flex items-start gap-3 mb-4">
          <div class="w-11 h-11 rounded flex items-center justify-center text-white font-bold text-base shrink-0"
            style="background:#1A3A6B;">
            {{ ($t(c.surname) || $t(c.name) || '?')[0].toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between">
              <p class="font-bold text-sm truncate leading-tight"
              :style="themeStore.isDark ? 'color:#e2e8f0' : 'color:#1a1f36'">
              {{ $t(c.surname) }} {{ $t(c.name) }}
            </p>
            <p v-if="c.customer_id" class="text-[10px] mt-0.5 font-semibold tracking-wide bg-[#1A3A6B] px-2 rounded-xl text-white py-1">
              MJZ-{{ c.customer_id }}
            </p>
            </div>
            <p class="text-xs mt-0.5 truncate" :style="themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4'">
              {{ $t(c.father_name) || '' }}
            </p>
          </div>
        </div>

        <!-- Contact info -->
        <div class="space-y-1.5 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5 shrink-0" style="color:#8892a4;" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span class="text-xs" :style="themeStore.isDark ? 'color:#8892a4' : 'color:#4a5568'">{{ c.phone }}</span>
            <span v-if="c.phone2" class="text-[10px]" :style="themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4'">/
              {{ c.phone2 }}</span>
          </div>
          <div v-if="c.assignedTo" class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5 shrink-0" style="color:#8892a4;" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-xs truncate" :style="themeStore.isDark ? 'color:#8892a4' : 'color:#4a5568'">
              {{ $t(c.assignedTo.surname) }} {{ $t(c.assignedTo.name) }}
            </span>
          </div>
          <div v-if="c.address" class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5 shrink-0" style="color:#8892a4;" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span class="text-xs truncate" :style="themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4'">{{
              $t(c.address) }}</span>
          </div>
        </div>


        <!-- Bottom: Status + Actions -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold px-2.5 py-1 rounded-xl" :class="(() => {
            const paid = c.payments.reduce((a, b) => a + b.amount, 0)
            const debt = (c.price || 0) - paid
            return debt > 0
              ? themeStore.isDark ? 'bg-rose-900/25 text-rose-400' : 'bg-rose-50 text-rose-600'
              : themeStore.isDark ? 'bg-emerald-900/25 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
          })()">
            {{(() => {
              const paid = c.payments.reduce((a, b) => a + b.amount, 0)
              const debt = (c.price || 0) - paid
              return debt > 0 ? $t('Qarz') + ': ' + formatMoney(debt) : $t("To'langan")
            })()}}
          </span>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
            <button v-if="authStore.permission.edit_customers" @click="openEdit(c)" class="p-1.5 rounded transition-all"
              :style="themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4'" title="Tahrirlash">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" />
              </svg>
            </button>
            <button v-if="authStore.permission.delete_customers" @click="archive(c)"
              class="p-1.5 rounded-lg transition-all"
              :class="themeStore.isDark ? 'text-rose-400/50 hover:text-rose-400 hover:bg-rose-900/20' : 'text-rose-300 hover:text-rose-500 hover:bg-rose-50'"
              :title="$t('Arxivga o\'tkazish')">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="w-20 h-20 rounded flex items-center justify-center"
        :style="themeStore.isDark ? 'background:#1e2d42' : 'background:#eaecf0'">
        <svg class="w-10 h-10" :style="themeStore.isDark ? 'color:#1e2d42' : 'color:#c1c9d6'" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div class="text-center">
        <p class="font-semibold" :style="themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4'">{{ $t('Mijoz topilmadi')
          }}</p>
        <p class="text-sm mt-1" :style="themeStore.isDark ? 'color:#1e2d42' : 'color:#c1c9d6'">
          {{ $t('Qidiruv natijasi bo\'sh') }}</p>
      </div>
    </div>

  </div>

  <CustomerModal v-if="showModal" :editing="editing" @close="showModal = false" @saved="store.fetchCustomers()" />

  <!-- Global Prices Settings Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showPricesModal" class="fixed inset-0 z-50 flex"
        :class="themeStore.isDark ? 'bg-black/70' : 'bg-black/40'" style="backdrop-filter: blur(4px);"
        @click.self="showPricesModal = false">
        <div class="m-auto w-full max-w-md rounded overflow-hidden flex flex-col shadow-2xl"
          :style="themeStore.isDark ? 'background:#161c2d;' : 'background:#ffffff;'">
          <div class="px-6 py-5 flex items-center justify-between"
            style="background:#1A3A6B; border-bottom:3px solid #2E8B57;">
            <div>
              <h2 class="text-white text-base font-bold tracking-wide">{{ $t("Xizmat narxlarini o'zgartirish") }}</h2>
              <p class="text-sm mt-0.5" style="color:rgba(255,255,255,0.55);">{{ $t("Narxlarni o'zgartiring") }}</p>
            </div>
            <button @click="showPricesModal = false"
              class="w-8 h-8 rounded flex items-center justify-center text-white transition-all"
              style="background:rgba(255,255,255,0.12);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4 flex-1">
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold uppercase tracking-wider"
                :style="themeStore.isDark ? 'color:#4a5878' : 'color:#4a5568'">{{ $t('1-narx (so\'mda)') }}</label>
              <input v-model="editingPriceOne" type="number"
                class="w-full px-3 py-2.5 rounded text-sm transition-all focus:outline-none"
                :style="themeStore.isDark ? 'background:#0d1117; border:1px solid #1e2d42; color:#e2e8f0;' : 'background:#f7f8fa; border:1px solid #d8dde6; color:#1a1f36;'" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold uppercase tracking-wider"
                :style="themeStore.isDark ? 'color:#4a5878' : 'color:#4a5568'">{{ $t('2-narx (so\'mda)') }}</label>
              <input v-model="editingPriceTwo" type="number"
                class="w-full px-3 py-2.5 rounded text-sm transition-all focus:outline-none"
                :style="themeStore.isDark ? 'background:#0d1117; border:1px solid #1e2d42; color:#e2e8f0;' : 'background:#f7f8fa; border:1px solid #d8dde6; color:#1a1f36;'" />
            </div>
          </div>

          <div class="px-6 py-4 flex justify-end gap-3"
            :style="themeStore.isDark ? 'border-top:1px solid #1e2d42; background:#0d1117;' : 'border-top:1px solid #eaecf0; background:#f7f8fa;'">
            <button @click="showPricesModal = false" class="px-5 py-2 rounded text-sm font-medium transition-all"
              :style="themeStore.isDark ? 'color:#8892a4' : 'color:#4a5568'">
              {{ $t('Bekor qilish') }}
            </button>
            <button @click="savePrices"
              class="px-5 py-2 text-white text-sm font-bold active:scale-[0.97] transition-all"
              style="background:#1A3A6B; border-radius:4px; letter-spacing:0.03em;">
              {{ $t('Saqlash') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
<style>
@media print {
  @page {
    size: 80mm auto;
    padding-top: 5px;
    padding-right: 5px;
    padding-left: 170px;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }

  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 8px !important;
    text-align: left;
    line-height: 1.2 !important;
    white-space: pre-wrap !important;
    box-sizing: border-box;
  }

  h2 {
    text-align: center;
    font-size: 8px !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    padding: 0 !important;
    vertical-align: top;
  }

  th {
    text-align: center;
  }

  .hidden,
  [hidden] {
    display: none !important;
  }

  * {
    box-sizing: border-box !important;
  }
}
</style>