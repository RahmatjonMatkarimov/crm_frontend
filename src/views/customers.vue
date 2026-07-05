<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import CustomerModal from '@/components/customers/CustomerModal.vue'
import ConsultationTimer from '@/components/customers/ConsultationTimer.vue'
import { useAuthStore } from '@/stores/auth'
import { usePricesStore } from '@/stores/prices'
import { useThemeStore } from '@/stores/theme'
import { useSocket } from '@/utils/useSocket'
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

// Konsultatsiya taymeri faqat YURIST va RAHBAR uchun ko'rinadi
const canSeeTimer = computed(() => ['YURIST', 'RAHBAR'].includes(authStore.user?.role))

let unsubscribeCalled = null

onMounted(() => {
  store.fetchCustomers()
  pricesStore.fetchPrices()
  // Boshqa oynada mijoz chaqirilsa, taymer jonli ko'rinishi uchun
  unsubscribeCalled = useSocket().onCustomerCalled(() => store.fetchCustomers())
})

onUnmounted(() => {
  if (unsubscribeCalled) unsubscribeCalled()
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
      }
      else if (dateFilter.value === "week") {
        const oneWeekAgo = new Date(now)
        oneWeekAgo.setDate(now.getDate() - 7)
        oneWeekAgo.setHours(0, 0, 0, 0)

        if (created < oneWeekAgo) return false
      }
      else if (dateFilter.value === "monthly") {
        if (
          created.getFullYear() !== now.getFullYear() ||
          created.getMonth() !== now.getMonth()
        ) {
          return false
        }
      }
      else if (dateFilter.value === "yearly") {
        if (created.getFullYear() !== now.getFullYear()) {
          return false
        }
      }
      else if (dateFilter.value === "range") {
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

    return true
  })
})
const countByDate = (dateKey) => {
  const now = new Date()
  const base = store.customers

  return base.filter(c => {
    const created = new Date(c.createdAt)

    if (dateKey === 'today') {
      return created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth() &&
        created.getDate() === now.getDate()
    }
    else if (dateKey === 'week') {
      const oneWeekAgo = new Date(now)
      oneWeekAgo.setDate(now.getDate() - 7)
      oneWeekAgo.setHours(0, 0, 0, 0)
      return created >= oneWeekAgo
    }
    else if (dateKey === 'monthly') {
      return created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
    }
    else if (dateKey === 'my') {
      return c.assignedTo?.id === authStore.user.id
    }
    else if (dateKey === 'yearly') {
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
  NAVBATDA: { bg: 'var(--border-light)', color: 'var(--text-2)' },
  YURISTDA: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  KORIB_CHIQILDI: { bg: 'var(--info-bg)', color: 'var(--info)' },
  JARAYONDA: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  YAKUNLANDI: { bg: 'var(--success-bg)', color: 'var(--success)' },
  BEKOR_QILINDI: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

// Navbat doskasi (Kanban) ustunlari — kartalar shu tartibda status bo'yicha guruhlanadi
const KANBAN_STATUS_ORDER = ['NAVBATDA', 'KORIB_CHIQILDI', 'YAKUNLANDI', 'YURISTDA', 'BEKOR_QILINDI']
// "Keyingi" tugmasi bilan avtomatik o'tiladigan bosqichlar — YURISTDA va BEKOR_QILINDI yakuniy holatlar,
// ularga faqat qo'lda (masalan "Bekor qilish" tugmasi bilan) o'tiladi
const PROGRESS_STATUS_ORDER = ['NAVBATDA', 'KORIB_CHIQILDI', 'YAKUNLANDI', 'YURISTDA']
const kanbanStatusLabels = {
  NAVBATDA: 'Navbatda',
  KORIB_CHIQILDI: "Qabulga kirildi",
  YAKUNLANDI: 'Maslahat berildi',
  YURISTDA: 'Maslahat berildi va shartnoma tuzildi',
  BEKOR_QILINDI: 'Rad etildi',
}

const appealTypeLabels = {
  NIKOH_AJRALISH: 'Nikohdan ajralish',
  UY_JOY: 'Uy-joy masalalari',
  MEROS: 'Meros ishlari',
  BIZNES: 'Biznesga oid muammolar',
  JINOIY_ISH: 'Jinoiy ishlar',
  BOSHQA: 'Boshqa masalalar',
}

const groupedByStatus = computed(() =>
  KANBAN_STATUS_ORDER.map(key => ({
    key,
    label: kanbanStatusLabels[key],
    colors: statusInlineColors[key],
    items: filtered.value
      .filter(c => c.status === key)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }))
)

const nextStatus = (status) => {
  const idx = PROGRESS_STATUS_ORDER.indexOf(status)
  return idx >= 0 && idx < PROGRESS_STATUS_ORDER.length - 1 ? PROGRESS_STATUS_ORDER[idx + 1] : null
}

const moveNext = async (c) => {
  const next = nextStatus(c.status)
  if (!next) return
  await store.updateCustomer(c.id, { status: next })
}

const rejectCustomer = async (c) => {
  if (!confirm(`"${c.surname} ${c.name}" ${proxy.$t("ni bekor qilmoqchimisiz?")}`)) return
  await store.updateCustomer(c.id, { status: 'BEKOR_QILINDI' })
}

const callCustomer = async (c) => {
  const res = await store.callCustomer(c.id)
  if (!res.success) alert(res.error)
}

const printCustomer = (c) => {
  const params = new URLSearchParams({
    fish: `${c.surname || ''} ${c.name || ''}`.trim(),
    telefon: c.phone || '',
    manzil: c.address || '',
    id: `MJZ-${c.customer_id || ''}`,
    raqam: c.queueNumber ? `A-${String(c.queueNumber).padStart(2, '0')}` : '—',
    yurist: c.assignedTo ? `${c.assignedTo.surname} ${c.assignedTo.name}` : '—',
    sana: (c.createdAt ? new Date(c.createdAt) : new Date()).getTime().toString(),
  })
  window.open(`/qabulxati.html?${params.toString()}`, '_blank')
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
  <div v-if="showModal">
    <CustomerModal :editing="editing" @close="showModal = false" @saved="store.fetchCustomers()" />
  </div>

  <div v-else class="space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="gov-page-title">{{ $t('Mijozlar') }}</h1>
        <p class="text-sm mt-1" style="color:var(--text-2);">
          {{ $t('Faol mijozlar') }} — {{ $t('Jami') }}
          <span class="font-bold" style="color:var(--text-1);">{{
            store.customers.length }}</span>
          {{ $t('ta') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openPricesModal" v-if="authStore.permission.edit_prices" class="btn btn-ghost">
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

    <!-- Date Filter Tabs -->
    <div class="border-4 rounded-md p-4 border-[var(--border)]">
      <div class="flex items-center gap-2 flex-wrap">
        <button v-for="tab in [
          { key: 'today', label: $t('Bugun') },
          { key: 'week', label: $t('Haftalik') },
          { key: 'monthly', label: $t('Oylik') },
          { key: 'yearly', label: $t('Yillik') },
          { key: 'all', label: $t('Hammasi') },
          { key: 'range', label: $t('Sana oralig\'i') },
        ]" :key="tab.key" @click="dateFilter = tab.key"
          :class="['period-tab', dateFilter === tab.key ? 'period-tab-active' : 'border-2 border-[var(--border)]']">
          {{ tab.label }}
          <span v-if="tab.key !== 'range'" class="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            :style="dateFilter === tab.key ? 'background:rgba(255,255,255,0.2); color:inherit;' : 'background:var(--border-light); color:var(--text-2);'">
            {{ tab.key === 'all' ? store.customers.length : countByDate(tab.key) }}
          </span>
        </button>
        <!-- Search -->
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style="color:var(--text-3);">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input v-model="search" type="text" :placeholder="$t('Ism, familiya, telefon, manzil yoki') + ' MJZ-ID...'"
            class="form-input pl-11 w-[370px]" />
        </div>
      </div>
      <!-- Date Range Inputs -->
      <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="dateFilter === 'range'" class="flex items-center gap-3 flex-wrap mt-3 w-fit">
          <div class="flex items-center gap-2">
            <label class="text-xs font-semibold shrink-0" style="color:var(--text-2);">{{ $t('Dan') }}:</label>
            <input v-model="dateFrom" type="date" class="form-input" />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs font-semibold shrink-0" style="color:var(--text-2);">{{ $t('Gacha') }}:</label>
            <input v-model="dateTo" type="date" class="form-input" />
          </div>
          <button v-if="dateFrom || dateTo" @click="dateFrom = ''; dateTo = ''" class="btn btn-sm btn-danger">
            {{ $t('Tozalash') }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Bulk bar -->
    <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="selected.length > 0" class="flex items-center justify-between px-5 py-3 rounded-lg"
        style="background:var(--border-light); border:1px solid var(--border);">
        <span class="text-sm font-semibold" style="color:var(--text-1);">
          {{ selected.length }} {{ $t('ta tanlandi') }}
        </span>
        <div class="flex gap-2">
          <button @click="selected = []" class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style="color:var(--text-2);">
            {{ $t('Bekor qilish') }}
          </button>
          <button @click="archiveSelected" class="btn btn-sm btn-danger">
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
    <div v-if="store.loading" class="flex items-center justify-center py-16 gap-3" style="color:var(--text-2);">
      <div class="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
      <span class="text-sm">{{ $t('Yuklanmoqda...') }}</span>
    </div>


    <div class="grid grid-cols-1 md:grid-cols-3 border-4 border-[var(--border)] rounded-lg p-4 gap-3 mb-5">
      <button @click="openCreate" v-if="authStore.permission.add_customers"
        class="btn btn-primary h-[80px] flex justify-center items-center text-[15px] font-bold gap-2">
        {{ $t('Yangi mijoz yaratish') }}
      </button>
      <button @click="dateFilter = 'my'" v-if="authStore.user.role === 'YURIST'"
        class="btn btn-primary h-[80px] flex justify-center items-center text-[15px] font-bold gap-2">
        {{ $t('Menga biriktirilgan ishlar') }}
      </button>
    </div>

    <!-- Kanban board: Table-grid layout -->
    <div v-if="filtered.length > 0" class="relative rounded-xl bg-[var(--bg-card)] overflow-hidden flex flex-col">
      <!-- Ramka alohida qatlamda — ichki gorizontal scroll paytida chetlar yo'qolib qolmasligi uchun -->
      <div class="pointer-events-none absolute inset-0 rounded-xl border-4 z-10" style="border-color:var(--border);">
      </div>

      <!-- Single scroll container: header va body birga scroll bo'ladi -->
      <div class="overflow-x-auto">
        <!-- Table Header Row -->
        <div class="flex  divide-x-4 divide-[var(--border)] select-none">
          <div v-for="col in groupedByStatus" :key="'h-' + col.key"
            class="flex-1 min-w-[280px] border-b-4 border-[var(--border)] px-5 py-3.5 justify-center text-center flex items-center gap-2">
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: col.colors.color }"></span>
            <h3 class="text-xs font-bold uppercase tracking-wider" style="color:var(--text-1);">{{ $t(col.label) }}</h3>
            <span class="text-xs font-semibold" style="color:var(--text-3);">({{ col.items.length }})</span>
          </div>
        </div>

        <!-- Table Body Columns -->
        <div class="flex divide-x-4 divide-[var(--border)] bg-[var(--bg-page)]/20 min-h-[600px]">
          <div v-for="col in groupedByStatus" :key="'col-' + col.key"
            class="flex-1 min-w-[280px] p-4 flex flex-col gap-3">

            <!-- Cards -->
            <div v-for="c in col.items" :key="c.id"
              class="card card-hover group p-4 cursor-pointer transition-all bg-[var(--bg-card)]"
              @click="openCustomer(c.id)">

              <!-- Top row: MJZ id + source icon -->
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span v-if="c.customer_id"
                    class="text-[10px] font-semibold tracking-wide pill-selected px-2 py-1 rounded-lg">
                    MJZ-{{ c.customer_id }}
                  </span>
                  <span v-if="c.queueNumber" class="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-lg"
                    style="background:var(--info-bg); color:var(--info); border:1px solid var(--info);">
                    A-{{ String(c.queueNumber).padStart(2, '0') }}
                  </span>
                </div>
                <span v-if="c.source" class="shrink-0" style="color:var(--text-3);" :title="c.source">
                  <!-- Instagram -->
                  <svg v-if="c.source === 'INSTAGRAM'" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.8">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="16.7" cy="7.3" r="0.6" fill="currentColor" stroke="none" />
                  </svg>
                  <!-- YouTube -->
                  <svg v-else-if="c.source === 'YOUTUBE'" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.8">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
                    <path d="M10.5 9.5l4.5 2.5-4.5 2.5v-5z" fill="currentColor" stroke="none" />
                  </svg>
                  <!-- Telegram -->
                  <svg v-else-if="c.source === 'TELEGRAM'" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 4.5L2.5 11.5l6 2m12.5-9l-3.5 15-9-6m12.5-9l-12.5 9" />
                  </svg>
                  <!-- Tanishidan -->
                  <svg v-else-if="c.source === 'TANISHIDAN'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <circle cx="10" cy="8" r="3.25" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 20a6.5 6.5 0 0113 0" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 11.5l1.5 1.5 3-3" />
                  </svg>
                  <!-- Mustaqil murojaat qildi -->
                  <svg v-else-if="c.source === 'MUSTAQIL_MUROJAAT'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M4 4.5c0 8.5 6.5 15 15 15l1-3.2-4-1.3-1.6 1.6a11 11 0 01-6.5-6.5l1.6-1.6-1.3-4-3.2-1z" />
                  </svg>
                  <!-- Tashqi reklama orqali -->
                  <svg v-else-if="c.source === 'TASHQI_REKLAMA'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 10v4h3l5 4V6L6 10H3z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.5 9a3 3 0 010 6M18.5 6.5a7 7 0 010 11" />
                  </svg>
                  <!-- Avvalgi mijoz -->
                  <svg v-else-if="c.source === 'AVVALGI_MIJOZ'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 0113.5-5.5M20 12a8 8 0 01-13.5 5.5" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.5 3.5v3.5H14M6.5 20.5V17H10" />
                  </svg>
                  <!-- Boshqa -->
                  <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="8.5" />
                    <path stroke-linecap="round" d="M12 12h.01" />
                  </svg>
                </span>
              </div>

              <p class="font-bold text-sm mb-2 truncate" style="color:var(--text-1);">
                {{ $t(c.surname) }} {{ $t(c.name) }}
              </p>

              <!-- Konsultatsiya taymeri (faqat YURIST va RAHBAR) -->
              <div v-if="canSeeTimer && (c.status === 'KORIB_CHIQILDI' || c.consultationSeconds != null)" class="mb-2">
                <ConsultationTimer :called-at="c.calledAt" :seconds="c.consultationSeconds" />
              </div>

              <!-- Contact info -->
              <div class="space-y-1.5 mb-3">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 shrink-0" style="color:var(--text-2);" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span class="text-xs" style="color:var(--text-2);">{{ c.phone }}</span>
                </div>
                <div v-if="c.address" class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 shrink-0" style="color:var(--text-2);" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span class="text-xs truncate" style="color:var(--text-2);">{{ $t(c.address) }}</span>
                </div>
              </div>

              <!-- Category tag -->
              <span v-if="c.appealType" class="inline-block text-[11px] font-medium px-2.5 py-1 rounded-lg mb-3"
                style="border:1px solid var(--border); color:var(--text-2);">
                {{ $t(appealTypeLabels[c.appealType] || c.appealType) }}
              </span>

              <!-- Debt / paid -->
              <p class="text-sm font-bold mb-0.5" :style="(() => {
                const paid = c.payments.reduce((a, b) => a + b.amount, 0)
                const debt = (c.price || 0) - paid
                return debt > 0 ? 'color:var(--danger)' : 'color:var(--success)'
              })()">
                {{(() => {
                  const paid = c.payments.reduce((a, b) => a + b.amount, 0)
                  const debt = (c.price || 0) - paid
                  return debt > 0 ? $t('Qarz') + ': ' + formatMoney(debt) : $t("To'liq to'langan")
                })()}}
              </p>
              <p v-if="c.assignedTo" class="text-xs mb-3" style="color:var(--text-3);">
                {{ $t('Yurist') }}: {{ $t(c.assignedTo.surname) }} {{ $t(c.assignedTo.name) }}
              </p>

              <!-- Chaqirish (call to waiting room) -->
              <button
                v-if="c.status === 'NAVBATDA' && (authStore.user.role === 'RAHBAR' || authStore.user.role === 'YURIST' || authStore.user.role === 'ADMIN')"
                @click.stop="callCustomer(c)" class="btn btn-sm w-full justify-center mb-2 font-bold"
                style="background:var(--success); color:#fff;">
                {{ $t('Chaqirish') }}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                  stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              </button>

              <!-- Status workflow actions -->
              <div
                v-if="(authStore.user.role === 'RAHBAR' || authStore.user.role === 'YURIST' || authStore.user.role === 'ADMIN') && (nextStatus(c.status) || ['NAVBATDA', 'KORIB_CHIQILDI'].includes(c.status))"
                class="flex items-center gap-2 mb-2" @click.stop>
                <button v-if="nextStatus(c.status)" @click="moveNext(c)"
                  class="btn btn-primary btn-sm flex-1 justify-center">
                  {{ $t('Keyingi') }}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                    stroke="currentColor" class="w-3 h-3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
                <button v-if="['NAVBATDA', 'KORIB_CHIQILDI'].includes(c.status)" @click="rejectCustomer(c)"
                  class="btn btn-sm flex-1 justify-center transition-colors"
                  style="background:var(--danger-bg); color:var(--danger); border:1.5px solid var(--danger);"
                  onmouseover="this.style.background='var(--danger)'; this.style.color='#fff';"
                  onmouseout="this.style.background='var(--danger-bg)'; this.style.color='var(--danger)';"
                  :title="$t('Rad etilish')">
                  {{ $t('Rad etilish') }}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                    stroke="currentColor" class="w-3.5 h-3.5">
                    <circle cx="12" cy="12" r="9" />
                    <path stroke-linecap="round" d="M7.5 7.5l9 9" />
                  </svg>
                </button>
              </div>

              <!-- Utility row: print / edit / archive -->
              <div class="flex items-center justify-between" @click.stop>
                <button @click="printCustomer(c)" class="flex items-center gap-1.5 text-xs transition-colors"
                  style="color:var(--text-3);">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6.72 13.83A2.25 2.25 0 004.5 16.08v3.42a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75v-3.42a2.25 2.25 0 00-2.22-2.25M6.72 13.83V8.25a.75.75 0 01.75-.75h9.06a.75.75 0 01.75.75v5.58M6.72 13.83h10.56" />
                  </svg>
                  {{ $t('Chop etish') }}
                </button>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button v-if="authStore.permission.edit_customers" @click="openEdit(c)"
                    class="p-1.5 rounded-lg transition-all" style="color:var(--text-2);" :title="$t('Tahrirlash')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" />
                    </svg>
                  </button>
                  <button v-if="authStore.permission.delete_customers" @click="archive(c)"
                    class="p-1.5 rounded-lg transition-all" style="color:var(--danger);"
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

            <div v-if="col.items.length === 0" class="text-xs text-center py-6 rounded-lg bg-[var(--bg-card)]/50"
              style="color:var(--text-3); border:1px dashed var(--border);">
              {{ $t("Mijoz yo'q") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="w-20 h-20 rounded-lg flex items-center justify-center" style="background:var(--border-light);">
        <svg class="w-10 h-10" style="color:var(--text-3);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div class="text-center">
        <p class="font-semibold" style="color:var(--text-2);">{{ $t('Mijoz topilmadi')
        }}</p>
        <p class="text-sm mt-1" style="color:var(--text-3);">
          {{ $t('Qidiruv natijasi bo\'sh') }}</p>
      </div>
    </div>

  </div>

  <!-- Global Prices Settings Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showPricesModal" class="fixed inset-0 z-50 flex"
        style="background:var(--overlay); backdrop-filter: blur(4px);" @click.self="showPricesModal = false">
        <div class="m-auto w-full max-w-md rounded-lg overflow-hidden flex flex-col shadow-2xl card">
          <div class="px-6 py-5 flex items-center justify-between border-b" style="border-color:var(--border);">
            <div>
              <h2 class="text-base font-bold tracking-wide" style="color:var(--text-1);">
                {{ $t("Xizmat narxlarini o'zgartirish") }}</h2>
              <p class="text-sm mt-0.5" style="color:var(--text-2);">{{ $t("Narxlarni o'zgartiring") }}</p>
            </div>
            <button @click="showPricesModal = false"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style="background:var(--border-light); color:var(--text-2);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4 flex-1">
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold uppercase tracking-wider" style="color:var(--text-2);">{{
                $t('1-narx (so\'mda)') }}</label>
              <input v-model="editingPriceOne" type="number" class="form-input bg-[var(--border-light)]" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold uppercase tracking-wider" style="color:var(--text-2);">{{
                $t('2-narx (so\'mda)') }}</label>
              <input v-model="editingPriceTwo" type="number" class="form-input bg-[var(--border-light)]" />
            </div>
          </div>

          <div class="px-6 py-4 flex justify-end gap-3 border-t"
            style="border-color:var(--border); background:var(--border-light);">
            <button @click="showPricesModal = false" class="btn btn-ghost btn-sm">
              {{ $t('Bekor qilish') }}
            </button>
            <button @click="savePrices" class="btn btn-primary btn-sm">
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