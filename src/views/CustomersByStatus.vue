<script setup>
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import CustomerModal from '@/components/customers/CustomerModal.vue'
import ConsultationTimer from '@/components/customers/ConsultationTimer.vue'
import { useAuthStore } from '@/stores/auth'
import { useSocket } from '@/utils/useSocket'
import translateText from '@/utils/translete.js'
import { kanbanStatusLabels, statusInlineColors, statusIcons, getStatusFromCode } from '@/utils/customerStatus'

const { proxy } = getCurrentInstance()

const authStore = useAuthStore()
const store = useCustomersStore()
const route = useRoute()
const router = useRouter()

const search = ref('')
const showModal = ref(false)
const editing = ref(null)
const selected = ref([])
const filterTab = ref('all') // 'all' or 'debtors'
const dateFilter = ref('all') // 'today' | 'week' | 'monthly' | 'yearly' | 'all' | 'range' | 'my'
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('queue') // 'queue' | 'name' | 'oldest' | 'newest'
const page = ref(1)
const perPage = ref(6)
const showDatePopover = ref(false)
const showSortMenu = ref(false)
const showPerPageMenu = ref(false)

const canSeeTimer = computed(() => ['YURIST', 'RAHBAR'].includes(authStore.user?.role))

let unsubscribeCalled = null

onMounted(() => {
  store.fetchCustomers()
  unsubscribeCalled = useSocket().onCustomerCalled(() => store.fetchCustomers())
})

onUnmounted(() => {
  if (unsubscribeCalled) unsubscribeCalled()
})

const PROGRESS_STATUS_ORDER = ['NAVBATDA', 'KORIB_CHIQILDI', 'YAKUNLANDI', 'YURISTDA']

const appealTypeLabels = {
  NIKOH_AJRALISH: 'Nikohdan ajralish',
  UY_JOY: 'Uy-joy masalalari',
  MEROS: 'Meros ishlari',
  BIZNES: 'Biznesga oid muammolar',
  JINOIY_ISH: 'Jinoiy ishlar',
  BOSHQA: 'Boshqa masalalar',
}

const statusKey = computed(() => getStatusFromCode(route.params.code))
const statusLabel = computed(() => kanbanStatusLabels[statusKey.value] || statusKey.value)
const statusColors = computed(() => statusInlineColors[statusKey.value] || { bg: 'var(--border-light)', color: 'var(--text-2)' })

const byStatus = computed(() => store.customers.filter(c => c.status === statusKey.value))

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  const now = new Date()

  const normalizePhone = (phone) => {
    if (!phone) return ""
    return String(phone).replace(/\D/g, "")
  }

  const normalizedSearchPhone = normalizePhone(q)

  return byStatus.value.filter((c) => {
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

    if (filterTab.value === "debtors") {
      const paid = c.payments?.[c.payments.length - 1]?.amount || 0
      if ((c.price || 0) - paid <= 0) {
        return false
      }
    }

    return true
  })
})

const sorted = computed(() => {
  const arr = [...filtered.value]
  const queueNo = (c) => c.queueNumber ? parseInt(c.queueNumber, 10) : Infinity
  const fullName = (c) => `${c.surname || ''} ${c.name || ''}`.trim().toLowerCase()

  if (sortBy.value === 'name') {
    arr.sort((a, b) => fullName(a).localeCompare(fullName(b)))
  } else if (sortBy.value === 'newest') {
    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy.value === 'oldest') {
    arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else {
    arr.sort((a, b) => queueNo(a) - queueNo(b) || new Date(a.createdAt) - new Date(b.createdAt))
  }
  return arr
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage.value)))

const paginated = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sorted.value.slice(start, start + perPage.value)
})

const paginationRange = computed(() => {
  if (sorted.value.length === 0) return { from: 0, to: 0 }
  const from = (page.value - 1) * perPage.value + 1
  const to = Math.min(sorted.value.length, page.value * perPage.value)
  return { from, to }
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = page.value
  const span = 2
  const nums = new Set([1, total])
  for (let i = current - span; i <= current + span; i++) {
    if (i >= 1 && i <= total) nums.add(i)
  }
  return [...nums].sort((a, b) => a - b)
})

watch([search, dateFilter, dateFrom, dateTo, filterTab, sortBy, perPage], () => {
  page.value = 1
})

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

watch([dateFrom, dateTo], ([from, to]) => {
  if (from || to) dateFilter.value = 'range'
  else if (dateFilter.value === 'range') dateFilter.value = 'all'
})

const sortOptions = [
  { key: 'queue', label: "Navbat raqami bo'yicha" },
  { key: 'oldest', label: 'Avval kelganlar' },
  { key: 'newest', label: 'Keyin kelganlar' },
  { key: 'name', label: 'Ism bo\'yicha' },
]
const currentSortLabel = computed(() => sortOptions.find(o => o.key === sortBy.value)?.label || '')

const perPageOptions = [6, 12, 24, 48]

const formatDDMMYYYY = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

const dateRangeLabel = computed(() => {
  if (dateFrom.value && dateTo.value) return `${formatDDMMYYYY(dateFrom.value)} — ${formatDDMMYYYY(dateTo.value)}`
  if (dateFrom.value) return `${formatDDMMYYYY(dateFrom.value)} —`
  if (dateTo.value) return `— ${formatDDMMYYYY(dateTo.value)}`
  return proxy.$t("Sana oralig'i")
})

const clearDateRange = () => {
  dateFrom.value = ''
  dateTo.value = ''
  showDatePopover.value = false
}

const countByDate = (dateKey) => {
  const now = new Date()
  const base = byStatus.value

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

const statCards = computed(() => [
  { key: 'today', label: 'Bugun', count: countByDate('today') },
  { key: 'week', label: 'Haftalik', count: countByDate('week') },
  { key: 'monthly', label: 'Oylik', count: countByDate('monthly') },
  { key: 'yearly', label: 'Yillik', count: countByDate('yearly') },
  { key: 'all', label: 'Hammasi', count: byStatus.value.length },
])

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

const nextStatus = (status) => {
  const idx = PROGRESS_STATUS_ORDER.indexOf(status)
  return idx >= 0 && idx < PROGRESS_STATUS_ORDER.length - 1 ? PROGRESS_STATUS_ORDER[idx + 1] : null
}

const moveNext = async (c) => {
  const next = nextStatus(c.status)
  if (!next) return
  await store.updateCustomer(c.id, { status: next })
}
const callCustomers = ref(false)
const callCustomer = async (c) => {
  const res = await store.callCustomer(c.id)
  if (!res.success) alert(res.error)
  callCustomers.value = true
  setTimeout(() => {
    callCustomers.value = false
  }, 30000)
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

const toggleSelect = (id) => {
  const idx = selected.value.indexOf(id)
  if (idx === -1) selected.value.push(id)
  else selected.value.splice(idx, 1)
}

const allVisibleSelected = computed(() =>
  filtered.value.length > 0 && filtered.value.every(c => selected.value.includes(c.id))
)

const toggleSelectAll = () => {
  if (allVisibleSelected.value) {
    const visibleIds = filtered.value.map(c => c.id)
    selected.value = selected.value.filter(id => !visibleIds.includes(id))
  } else {
    const visibleIds = filtered.value.map(c => c.id)
    selected.value = [...new Set([...selected.value, ...visibleIds])]
  }
}
const formatMoney = (amount) => {
  if (!amount) return '—'
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount) + ' so\'m'
}

const avatarPalette = [
  '#16234a', '#7c3aed', '#0d9488', '#92400e', '#db2777', '#1e293b',
]
const avatarStyle = (idx) => `background:${avatarPalette[idx % avatarPalette.length]}; color:#ffffff;`

const priorityInfo = (c) => {
  const mins = (Date.now() - new Date(c.createdAt).getTime()) / 60000
  if (mins >= 30) return { label: 'Yuqori', bg: 'var(--warning-bg)', color: 'var(--warning)' }
  if (mins >= 10) return { label: "O'rta", bg: 'var(--info-bg)', color: 'var(--info)' }
  return { label: 'Past', bg: 'var(--border-light)', color: 'var(--text-2)' }
}

const paymentInfo = (c) => {
  const paid = c.payments.reduce((a, b) => a + b.amount, 0)
  const debt = (c.price || 0) - paid
  return debt <= 0
    ? { label: "To'langan", bg: 'var(--success-bg)', color: 'var(--success)' }
    : { label: 'Kutilmoqda', bg: 'var(--warning-bg)', color: 'var(--warning)' }
}

const formatVaqt = (dateStr) => {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (isToday) return `${proxy.$t('Bugun')}, ${hm}`
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}, ${hm}`
}

const downloadReport = () => {
  const header = ['MJZ-ID', 'F.I.Sh', 'Telefon', 'Telegram', 'Manzil', 'Yurist', "To'lov holati", 'Vaqt']
  const rows = sorted.value.map(c => [
    c.customer_id ? `MJZ-${c.customer_id}` : '',
    `${c.surname || ''} ${c.name || ''}`.trim(),
    c.phone || '',
    c.telegram || '',
    c.address || '',
    c.assignedTo ? `${c.assignedTo.surname} ${c.assignedTo.name}` : '',
    paymentInfo(c).label,
    formatVaqt(c.createdAt),
  ])
  const csv = [header, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${statusLabel.value}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="showModal">
    <CustomerModal :editing="editing" @close="showModal = false" @saved="store.fetchCustomers()" />
  </div>

  <div v-else class="space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          :style="{ background: statusColors.bg, color: statusColors.color }">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6"
            stroke="currentColor" class="w-7 h-7">
            <path v-for="(d, i) in statusIcons[statusKey]" :key="i" stroke-linecap="round" stroke-linejoin="round"
              :d="d" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-wide" style="color:var(--text-1);">
            {{ $t(statusLabel) }}
          </h1>
          <p class="text-sm mt-0.5" style="color:var(--text-2);">
            {{ $t('Jami') }}
            <span class="font-bold" style="color:var(--text-1);">{{ byStatus.length }}</span>
            {{ $t('ta') }} {{ $t(statusLabel).toLowerCase() }}
          </p>
        </div>
      </div>

      <button v-if="sorted.length > 0" @click="downloadReport" class="btn btn-lg font-bold self-start sm:self-auto"
        style="background:transparent; color:var(--gold); border:1.5px solid var(--gold);"
        @mouseover="e => { e.currentTarget.style.background = 'var(--gold-light)' }"
        @mouseleave="e => { e.currentTarget.style.background = 'transparent' }">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        {{ $t('Hisobot yuklab olish') }}
      </button>
    </div>

    <!-- Stat cards (date filter) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <button v-for="tab in statCards" :key="tab.key" @click="dateFilter = tab.key" class="stat-card text-left"
        :style="dateFilter === tab.key ? 'background:var(--primary); border-color:var(--primary);' : ''">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3" :style="dateFilter === tab.key
          ? 'background:rgba(255,255,255,0.14); color:var(--gold-hover);'
          : 'background:var(--gold-light); color:var(--gold);'">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
            stroke="currentColor" class="w-4.5 h-4.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v7.5" />
          </svg>
        </div>
        <p class="text-xs font-semibold"
          :style="dateFilter === tab.key ? 'color:rgba(255,255,255,0.7);' : 'color:var(--text-2);'">
          {{ $t(tab.label) }}
        </p>
        <p class="text-2xl font-bold mt-0.5" :style="dateFilter === tab.key ? 'color:#fff;' : 'color:var(--text-1);'">
          {{ tab.count }} <span class="text-sm font-semibold">{{ $t('ta') }}</span>
        </p>
      </button>
    </div>

    <!-- Filter bar -->
    <div class="card p-4">
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Search -->
        <div class="relative flex-1 min-w-[240px]">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            style="color:var(--text-3);">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input v-model="search" type="text"
            :placeholder="$t('Ism, telefon, manzil yoki') + ' MJZ-ID orqali qidirish...'"
            class="form-input pl-11 w-full" />
        </div>

        <!-- Date range picker -->
        <div class="relative" v-click-outside="() => showDatePopover = false">
          <button @click="showDatePopover = !showDatePopover"
            class="flex items-center gap-2 h-9.5 px-3.5 rounded-lg text-xs font-semibold transition-colors"
            style="background:var(--bg-page); border:1px solid var(--border); color:var(--text-1);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
              stroke="currentColor" class="w-4 h-4 shrink-0" style="color:var(--text-3);">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v7.5" />
            </svg>
            {{ dateRangeLabel }}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
              stroke="currentColor" class="w-3 h-3" :style="showDatePopover ? 'transform:rotate(180deg)' : ''">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <Transition enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-100" leave-to-class="opacity-0">
            <div v-if="showDatePopover" class="absolute left-0 mt-1.5 w-72 p-3.5 z-50 rounded-xl"
              style="background:var(--bg-card); border:1px solid var(--border); box-shadow:var(--shadow-md);">
              <div class="space-y-2.5">
                <div class="flex items-center gap-2">
                  <label class="text-xs font-semibold w-14 shrink-0" style="color:var(--text-2);">{{ $t('Dan')
                  }}:</label>
                  <input v-model="dateFrom" type="date" class="form-input" />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-xs font-semibold w-14 shrink-0" style="color:var(--text-2);">{{ $t('Gacha')
                  }}:</label>
                  <input v-model="dateTo" type="date" class="form-input" />
                </div>
              </div>
              <button v-if="dateFrom || dateTo" @click="clearDateRange"
                class="btn btn-sm btn-danger w-full mt-3 justify-center">
                {{ $t('Tozalash') }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Sort dropdown -->
        <div class="relative" v-click-outside="() => showSortMenu = false">
          <button @click="showSortMenu = !showSortMenu"
            class="flex items-center gap-2 h-9.5 px-3.5 rounded-lg text-xs font-semibold transition-colors"
            style="background:var(--bg-page); border:1px solid var(--border); color:var(--text-1);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
              stroke="currentColor" class="w-4 h-4 shrink-0" style="color:var(--text-3);">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 7.5h10.5M3 12h7.5M3 16.5h4.5M17.25 4.5v15m0 0l-3.75-3.75M17.25 19.5L21 15.75" />
            </svg>
            {{ currentSortLabel }}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
              stroke="currentColor" class="w-3 h-3" :style="showSortMenu ? 'transform:rotate(180deg)' : ''">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <Transition enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-100" leave-to-class="opacity-0">
            <div v-if="showSortMenu" class="absolute left-0 mt-1.5 w-52 overflow-hidden z-50 rounded-xl"
              style="background:var(--bg-card); border:1px solid var(--border); box-shadow:var(--shadow-md);">
              <button v-for="opt in sortOptions" :key="opt.key" @click="sortBy = opt.key; showSortMenu = false"
                class="w-full flex items-center px-3.5 py-2.5 text-left text-xs transition-all cursor-pointer"
                :style="sortBy === opt.key ? 'background:var(--primary-light); color:var(--primary); font-weight:700;' : 'color:var(--text-2);'">
                {{ $t(opt.label) }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Select all -->
        <label v-if="authStore.permission.delete_customers"
          class="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none ml-auto"
          style="color:var(--text-2);">
          <input type="checkbox" :checked="allVisibleSelected" @change="toggleSelectAll"
            class="w-3.5 h-3.5 rounded cursor-pointer" style="accent-color:var(--primary);" />
          {{ $t('Barchasini tanlash') }}
        </label>
      </div>
    </div>

    <!-- Bulk bar -->
    <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="selected.length > 0" class="flex items-center justify-between px-5 py-3 rounded-lg sticky top-0 z-10"
        style="background:var(--border-light); border:1px solid var(--border);">
        <span class="text-sm font-semibold" style="color:var(--text-1);">
          {{ selected.length }} {{ $t('ta tanlandi') }}
        </span>
        <div class="flex gap-2">
          <button @click="selected = []" class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style="color:var(--text-2);">
            {{ $t('Bekor qilish') }}
          </button>
          <button v-if="authStore.permission.delete_customers" @click="archiveSelected" class="btn btn-sm btn-danger">
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

    <!-- Results count -->
    <p v-if="!store.loading && sorted.length > 0" class="text-xs font-medium px-1" style="color:var(--text-2);">
      {{ sorted.length }} {{ $t('ta natija topildi') }}
    </p>

    <!-- Customer cards -->
    <div v-if="paginated.length > 0" class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div v-for="(c, idx) in paginated" :key="c.id"
        class="card card-hover group p-4 cursor-pointer transition-all bg-[var(--bg-card)] relative"
        :style="`border-top:3px solid ${statusColors.color};` + (selected.includes(c.id) ? ` border-color:var(--primary); box-shadow:0 0 0 1.5px var(--primary);` : '')"
        @click="openCustomer(c.id)">

        <!-- Header: avatar + name + badges + priority/select -->
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-base font-bold"
              :style="avatarStyle(idx)">
              {{ (c.surname || c.name || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-bold text-sm truncate" style="color:var(--text-1);">
                {{ $t(c.surname) }} {{ $t(c.name) }}
              </p>
              <div class="flex items-center gap-1.5 flex-wrap mt-1">
                <span v-if="c.customer_id"
                  class="text-[10px] font-semibold tracking-wide pill-selected px-2 py-0.5 rounded-md">
                  MJZ-{{ c.customer_id }}
                </span>
                <span v-if="c.queueNumber" class="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-md"
                  style="background:var(--info-bg); color:var(--info); border:1px solid var(--info);">
                  A-{{ String(c.queueNumber).padStart(2, '0') }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <label v-if="authStore.permission.delete_customers"
              class="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-opacity"
              :class="selected.includes(c.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
              style="background:var(--bg-card); border:1px solid var(--border);" @click.stop>
              <input type="checkbox" :checked="selected.includes(c.id)" @change="toggleSelect(c.id)"
                class="w-3.5 h-3.5 rounded cursor-pointer" style="accent-color:var(--primary);" />
            </label>
          </div>
        </div>

        <!-- Konsultatsiya taymeri (faqat YURIST va RAHBAR) -->
        <div v-if="canSeeTimer && (c.status === 'KORIB_CHIQILDI' || c.consultationSeconds != null)" class="mb-3">
          <ConsultationTimer :called-at="c.calledAt" :seconds="c.consultationSeconds" />
        </div>

        <!-- Info grid: contact info (left) + meta info (right) -->
        <div class="flex justify-between gap-x-4 gap-y-3 mb-3">
          <div class="space-y-1.5 min-w-0">
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
            <div v-if="c.telegram" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke-width="1.8">
                <path d="M0 0h24v24H0z" fill="none" />
                <path fill="currentColor" fill-rule="evenodd"
                  d="M5.788 14.02a1 1 0 0 0 .132.031a456 456 0 0 1 .844 2.002c.503 1.202 1.01 2.44 1.121 2.796c.139.438.285.736.445.94c.083.104.178.196.29.266a1 1 0 0 0 .186.088c.32.12.612.07.795.009a1.3 1.3 0 0 0 .304-.15L9.91 20l2.826-1.762l3.265 2.502q.072.055.156.093c.392.17.772.23 1.13.182c.356-.05.639-.199.85-.368a2 2 0 0 0 .564-.728l.009-.022l.003-.008l.002-.004v-.002l.001-.001a1 1 0 0 0 .04-.133l2.98-15.025a1 1 0 0 0 .014-.146c0-.44-.166-.859-.555-1.112c-.334-.217-.705-.227-.94-.209c-.252.02-.486.082-.643.132a4 4 0 0 0-.26.094l-.011.005l-16.714 6.556l-.002.001a2 2 0 0 0-.167.069a2.5 2.5 0 0 0-.38.212c-.227.155-.75.581-.661 1.285c.07.56.454.905.689 1.071c.128.091.25.156.34.199c.04.02.126.054.163.07l.01.003zm14.138-9.152h-.002l-.026.011l-16.734 6.565l-.026.01l-.01.003a1 1 0 0 0-.09.04a1 1 0 0 0 .086.043l3.142 1.058a1 1 0 0 1 .16.076l10.377-6.075l.01-.005a2 2 0 0 1 .124-.068c.072-.037.187-.091.317-.131c.09-.028.357-.107.645-.014a.85.85 0 0 1 .588.689a.84.84 0 0 1 .003.424c-.07.275-.262.489-.437.653c-.15.14-2.096 2.016-4.015 3.868l-2.613 2.52l-.465.45l5.872 4.502a.54.54 0 0 0 .251.04a.23.23 0 0 0 .117-.052a.5.5 0 0 0 .103-.12l.002-.001l2.89-14.573a2 2 0 0 0-.267.086zm-8.461 12.394l-1.172-.898l-.284 1.805zm-2.247-2.68l1.165-1.125l2.613-2.522l.973-.938l-6.52 3.817l.035.082a339 339 0 0 1 1.22 2.92l.283-1.8a.75.75 0 0 1 .231-.435"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-xs truncate" style="color:var(--text-2);">{{ $t(c.telegram) }}</span>
            </div>
          </div>

          <div class="space-y-1.5 max-w-[150px]">
            <div v-if="c.assignedTo" class="flex items-center justify-between gap-2 text-xs">
              <span style="color:var(--text-3);">{{ $t('Yurist') }}:</span>
              <span class="font-semibold truncate" style="color:var(--text-1);">{{ $t(c.assignedTo.surname) }} {{
                $t(c.assignedTo.name) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 text-xs">
              <span style="color:var(--text-3);">{{ $t("To'lov") }}:</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :style="`background:${paymentInfo(c).bg}; color:${paymentInfo(c).color};`">
                {{ $t(paymentInfo(c).label) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2 text-xs">
              <span style="color:var(--text-3);">{{ $t('Vaqt') }}:</span>
              <span class="font-semibold" style="color:var(--text-1);">{{ formatVaqt(c.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="border-t -mx-4 mb-3" style="border-color:var(--border-light);"></div>

        <!-- Actions row -->
        <div class="flex items-center gap-2" @click.stop>
          <button
            v-if="c.status === 'NAVBATDA' && (authStore.user.role === 'RAHBAR' || authStore.user.role === 'YURIST' || authStore.user.role === 'ADMIN')"
            @click="callCustomer(c)" class="btn btn-sm flex-1 justify-center font-bold" :disabled="callCustomers"
            style="background:var(--success); color:#fff;">
            {{ $t('Chaqirish') }}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </button>

          <button
            v-if="(authStore.user.role === 'RAHBAR' || authStore.user.role === 'YURIST' || authStore.user.role === 'ADMIN') && nextStatus(c.status)"
            @click="moveNext(c)" class="btn btn-primary btn-sm flex-1 justify-center">
            {{
              c.status === 'NAVBATDA'
                ? $t('Qabul qilish')
                : c.status === 'KORIB_CHIQILDI'
                  ? $t('Maslahat berish')
                  : c.status === 'YAKUNLANDI'
                    ? $t('Shartnoma tuzish')
            : $t('Boshqa holat')
            }}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
              stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button @click="printCustomer(c)" class="p-2 rounded-lg shrink-0 transition-all"
            style="border:1px solid var(--border); color:var(--text-2);" :title="$t('Qabul xatini chop etish')">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M6.72 13.83A2.25 2.25 0 004.5 16.08v3.42a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75v-3.42a2.25 2.25 0 00-2.22-2.25M6.72 13.83V8.25a.75.75 0 01.75-.75h9.06a.75.75 0 01.75.75v5.58M6.72 13.83h10.56" />
            </svg>
          </button>
        </div>

        <!-- Utility row: edit / archive -->
        <div v-if="authStore.permission.edit_customers || authStore.permission.delete_customers"
          class="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop>
          <button v-if="authStore.permission.edit_customers" @click="openEdit(c)"
            class="p-1.5 rounded-lg transition-all" style="color:var(--text-2);" :title="$t('Tahrirlash')">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" />
            </svg>
          </button>
          <button v-if="authStore.permission.delete_customers" @click="archive(c)"
            class="p-1.5 rounded-lg transition-all" style="color:var(--danger);" :title="$t('Arxivga o\'tkazish')">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
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
        <p class="font-semibold" style="color:var(--text-2);">{{ $t('Mijoz topilmadi') }}</p>
        <p class="text-sm mt-1" style="color:var(--text-3);">
          {{ $t('Qidiruv natijasi bo\'sh') }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!store.loading && sorted.length > 0" class="flex items-center justify-between flex-wrap gap-3 pt-1">
      <p class="text-xs font-medium" style="color:var(--text-2);">
        {{ paginationRange.from }}–{{ paginationRange.to }} / {{ sorted.length }} {{ $t('ta natija') }}
      </p>

      <div class="flex items-center gap-1.5">
        <button @click="page = Math.max(1, page - 1)" :disabled="page === 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style="border:1px solid var(--border); color:var(--text-2);"
          :style="page === 1 ? 'opacity:0.4; cursor:not-allowed;' : ''">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <template v-for="(n, i) in pageNumbers" :key="n">
          <span v-if="i > 0 && n - pageNumbers[i - 1] > 1" class="px-1 text-xs" style="color:var(--text-3);">…</span>
          <button @click="page = n"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors"
            :style="page === n ? 'background:var(--primary); color:#fff;' : 'border:1px solid var(--border); color:var(--text-2);'">
            {{ n }}
          </button>
        </template>

        <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style="border:1px solid var(--border); color:var(--text-2);"
          :style="page === totalPages ? 'opacity:0.4; cursor:not-allowed;' : ''">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div class="relative" v-click-outside="() => showPerPageMenu = false">
        <button @click="showPerPageMenu = !showPerPageMenu"
          class="flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-semibold transition-colors"
          style="border:1px solid var(--border); color:var(--text-2);">
          {{ $t('Har sahifada') }}: {{ perPage }}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-3 h-3" :style="showPerPageMenu ? 'transform:rotate(180deg)' : ''">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <Transition enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-100" leave-to-class="opacity-0">
          <div v-if="showPerPageMenu" class="absolute right-0 bottom-full mb-1.5 w-24 overflow-hidden z-50 rounded-xl"
            style="background:var(--bg-card); border:1px solid var(--border); box-shadow:var(--shadow-md);">
            <button v-for="n in perPageOptions" :key="n" @click="perPage = n; showPerPageMenu = false"
              class="w-full flex items-center px-3.5 py-2 text-left text-xs transition-all cursor-pointer"
              :style="perPage === n ? 'background:var(--primary-light); color:var(--primary); font-weight:700;' : 'color:var(--text-2);'">
              {{ n }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

  </div>
</template>

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
