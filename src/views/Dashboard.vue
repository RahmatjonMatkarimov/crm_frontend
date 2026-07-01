<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useThemeStore } from '@/stores/theme'
import { useLangStore } from '@/stores/lang'
import { useRouter } from 'vue-router'

const store = useCustomersStore()
const themeStore = useThemeStore()
const langStore = useLangStore()
const router = useRouter()

onMounted(() => { store.fetchCustomers() })

const allCustomers = computed(() => store.customers || [])

const selectedPeriod = ref('month')
const periods = computed(() => [
  { key: 'all',   label: langStore.t('Barchasi') },
  { key: 'year',  label: langStore.t('Yillik') },
  { key: 'month', label: langStore.t('Oylik') },
  { key: 'week',  label: langStore.t('Haftali') },
])

const periodStart = computed(() => {
  const now = new Date()
  if (selectedPeriod.value === 'year')  return new Date(now.getFullYear(), 0, 1)
  if (selectedPeriod.value === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (selectedPeriod.value === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d
  }
  return null
})

const customers = computed(() => {
  if (!periodStart.value) return allCustomers.value
  return allCustomers.value.filter(c => new Date(c.createdAt) >= periodStart.value)
})

const paymentsInPeriod = computed(() => {
  const start = periodStart.value
  const result = []
  allCustomers.value.forEach(c => {
    ;(c.payments || []).forEach(p => {
      if (!start || new Date(p.createdAt) >= start) result.push(p)
    })
  })
  return result
})

const totalCustomers = computed(() => customers.value.length)
const totalRevenue = computed(() => paymentsInPeriod.value.reduce((sum, p) => sum + (p.amount || 0), 0))
const totalDebt = computed(() =>
  customers.value.reduce((sum, c) => {
    const paid = (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
    const debt = (c.price || 0) - paid
    return sum + (debt > 0 ? debt : 0)
  }, 0)
)
const debtorsCount = computed(() =>
  customers.value.filter(c => {
    const paid = (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
    return (c.price || 0) - paid > 0
  }).length
)
const paidCount = computed(() => totalCustomers.value - debtorsCount.value)

const sourceMap = computed(() => ({
  INSTAGRAM: { label: 'Instagram',             color: '#e1306c' },
  TELEGRAM:  { label: 'Telegram',              color: '#2ea6dd' },
  YOUTUBE:   { label: 'YouTube',               color: '#ff0000' },
  TANISHIDAN:{ label: langStore.t('Tanishidan'), color: '#2E8B57' },
}))

const sourceStats = computed(() => {
  const counts = {}
  customers.value.forEach(c => { if (c.source) counts[c.source] = (counts[c.source] || 0) + 1 })
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(sourceMap.value).map(([key, meta]) => ({
    key, label: meta.label, color: meta.color,
    count: counts[key] || 0,
    pct: Math.round(((counts[key] || 0) / total) * 100),
  }))
})

const paymentTypeMap = computed(() => ({
  NAQD:        { label: langStore.t("Naqd pul"),       color: '#1A3A6B' },
  KARTA:       { label: langStore.t('Plastik karta'),  color: '#b45309' },
  PUL_OTKAZISH:{ label: langStore.t("Pul o'tkazish"),  color: '#2E8B57' },
}))

const paymentTypeStats = computed(() => {
  const amounts = {}
  paymentsInPeriod.value.forEach(p => {
    const t = p.type || 'NAQD'
    amounts[t] = (amounts[t] || 0) + (p.amount || 0)
  })
  const total = Object.values(amounts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(paymentTypeMap.value).map(([key, meta]) => ({
    key, label: meta.label, color: meta.color,
    amount: amounts[key] || 0,
    pct: Math.round(((amounts[key] || 0) / total) * 100),
  }))
})

const UZ_DAYS   = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

const chartBars = computed(() => {
  const now = new Date()
  const period = selectedPeriod.value

  if (period === 'week') {
    const bars = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      bars.push({ label: `${UZ_DAYS[d.getDay()]}\n${d.getDate()}`, year: d.getFullYear(), month: d.getMonth(), day: d.getDate(), amount: 0 })
    }
    allCustomers.value.forEach(c => {
      ;(c.payments || []).forEach(p => {
        const d = new Date(p.createdAt)
        const b = bars.find(x => x.year === d.getFullYear() && x.month === d.getMonth() && x.day === d.getDate())
        if (b) b.amount += p.amount || 0
      })
    })
    return bars
  }

  if (period === 'month') {
    const year = now.getFullYear(), month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const bars = [
      { label: `1–7`, week: 0, year, month, amount: 0 },
      { label: `8–15`, week: 1, year, month, amount: 0 },
      { label: `16–23`, week: 2, year, month, amount: 0 },
      { label: `24–${daysInMonth}`, week: 3, year, month, amount: 0 },
    ]
    allCustomers.value.forEach(c => {
      ;(c.payments || []).forEach(p => {
        const d = new Date(p.createdAt)
        if (d.getFullYear() === year && d.getMonth() === month) {
          bars[Math.min(Math.floor((d.getDate() - 1) / 7), 3)].amount += p.amount || 0
        }
      })
    })
    return bars
  }

  const bars = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    bars.push({ label: UZ_MONTHS[d.getMonth()].slice(0, 3), year: d.getFullYear(), month: d.getMonth(), amount: 0 })
  }
  allCustomers.value.forEach(c => {
    ;(c.payments || []).forEach(p => {
      const d = new Date(p.createdAt)
      const b = bars.find(x => x.year === d.getFullYear() && x.month === d.getMonth())
      if (b) b.amount += p.amount || 0
    })
  })
  return bars
})

const maxChartAmount = computed(() => Math.max(...chartBars.value.map(m => m.amount), 1))

const chartTitle = computed(() => {
  if (selectedPeriod.value === 'week')  return langStore.t("Kunlik tushum")
  if (selectedPeriod.value === 'month') return langStore.t("Haftalik tushum")
  return langStore.t("Oylik tushum")
})

const recentCustomers = computed(() =>
  [...customers.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
)

const workerStats = computed(() => {
  const map = {}
  customers.value.forEach(c => {
    if (c.assignedTo) {
      const key = c.assignedTo.id || c.assignedTo.name
      if (!map[key]) map[key] = { name: `${c.assignedTo.surname || ''} ${c.assignedTo.name || ''}`.trim(), count: 0, revenue: 0 }
      map[key].count++
      map[key].revenue += (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
    }
  })
  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5)
})

const fmt = (n) => {
  if (!n) return '0'
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n))
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const donutSegments = (data, total) => {
  const r = 42, circ = 2 * Math.PI * r
  let offset = 0
  return data.map(d => {
    const pct = total ? d.count / total : 0
    const dash = pct * circ, gap = circ - dash
    const seg = { ...d, dash, gap, offset }
    offset += dash
    return seg
  })
}

const sourceTotal = computed(() => sourceStats.value.reduce((a, b) => a + b.count, 0))
const sourceSegments = computed(() => donutSegments(sourceStats.value, sourceTotal.value))

const card = computed(() => themeStore.isDark
  ? 'background:#161c2d; border:1px solid #1e2d42;'
  : 'background:#ffffff; border:1px solid #d0d7e3;')
const textPrimary = computed(() => themeStore.isDark ? 'color:#e2e8f0' : 'color:#1a1f36')
const textSecondary = computed(() => themeStore.isDark ? 'color:#8892a4' : 'color:#4a5568')
const textMuted = computed(() => themeStore.isDark ? 'color:#4a5878' : 'color:#8892a4')
const divider = computed(() => themeStore.isDark ? 'background:#1e2d42' : 'background:#eaecf0')
</script>

<template>
  <div class="space-y-5">

    <!-- Page header + period tabs -->
    <div class="flex items-center justify-between">
      <h1 class="gov-page-title">{{ langStore.t('Bosh sahifa') }}</h1>
      <div class="flex gap-1.5">
        <button
          v-for="p in periods" :key="p.key"
          @click="selectedPeriod = p.key"
          :class="['period-tab', selectedPeriod === p.key ? 'period-tab-active' : '']">
          {{ $t(p.label) }}
        </button>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="grid grid-cols-4 gap-4">

      <!-- Mijozlar -->
      <div class="stat-card stat-card-blue">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide mb-3" :style="textSecondary">
              {{ langStore.t('Jami mijozlar') }}
            </p>
            <p class="text-4xl font-black leading-none tracking-tight" :style="textPrimary">
              {{ totalCustomers }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :style="themeStore.isDark ? 'background:#0d1f3c;' : 'background:#eff4fc;'">
            <svg class="w-5 h-5" style="color:#1A3A6B;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3" :style="`border-top:1px solid ${themeStore.isDark ? '#1e2d42' : '#eaecf3'}`">
          <span class="text-xs" :style="textSecondary">
            {{ langStore.t('Tanlangan davr') }}
          </span>
        </div>
      </div>

      <!-- Tushum -->
      <div class="stat-card stat-card-green">
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide mb-3" :style="textSecondary">
              {{ langStore.t("Jami tushum") }}
            </p>
            <p class="text-3xl font-black leading-none tracking-tight truncate" :style="textPrimary">
              {{ fmt(totalRevenue) }}
            </p>
            <p class="text-xs mt-1" :style="textSecondary">so'm</p>
          </div>
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"
            :style="themeStore.isDark ? 'background:#052e16;' : 'background:#f0fdf4;'">
            <svg class="w-5 h-5" style="color:#16a34a;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3" :style="`border-top:1px solid ${themeStore.isDark ? '#1e2d42' : '#eaecf3'}`">
          <span class="text-xs font-semibold" style="color:#16a34a;">
            ↑ {{ langStore.t("To'lovlar") }}
          </span>
        </div>
      </div>

      <!-- Qarz -->
      <div class="stat-card stat-card-red">
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide mb-3" :style="textSecondary">
              {{ langStore.t("Jami qarz") }}
            </p>
            <p class="text-3xl font-black leading-none tracking-tight truncate" :style="textPrimary">
              {{ fmt(totalDebt) }}
            </p>
            <p class="text-xs mt-1" :style="textSecondary">so'm</p>
          </div>
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"
            :style="themeStore.isDark ? 'background:#1f0a0a;' : 'background:#fef2f2;'">
            <svg class="w-5 h-5" style="color:#dc2626;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3" :style="`border-top:1px solid ${themeStore.isDark ? '#1e2d42' : '#eaecf3'}`">
          <span class="text-xs font-semibold" style="color:#dc2626;">
            {{ debtorsCount }} {{ langStore.t('ta qarzdor') }}
          </span>
        </div>
      </div>

      <!-- Qarzdorlar -->
      <div class="stat-card stat-card-amber">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide mb-3" :style="textSecondary">
              {{ langStore.t('Qarzdor mijozlar') }}
            </p>
            <p class="text-4xl font-black leading-none tracking-tight" :style="textPrimary">
              {{ debtorsCount }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :style="themeStore.isDark ? 'background:#1c1008;' : 'background:#fffbeb;'">
            <svg class="w-5 h-5" style="color:#d97706;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3" :style="`border-top:1px solid ${themeStore.isDark ? '#1e2d42' : '#eaecf3'}`">
          <span class="text-xs font-semibold" style="color:#d97706;">
            {{ totalCustomers > 0 ? Math.round((debtorsCount/totalCustomers)*100) : 0 }}% {{ langStore.t("umumiydan") }}
          </span>
        </div>
      </div>
    </div>

    <!-- GRAFIK + MANBA -->
    <div class="grid grid-cols-3 gap-4">

      <!-- Bar chart -->
      <div class="col-span-2 card p-5">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-sm font-bold" :style="textPrimary">{{ langStore.t(chartTitle) }}</h3>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
            :style="themeStore.isDark ? 'background:#1e2d42; color:#8b95a8;' : 'background:#f0f2f7; color:#4b5563;'">
            {{ $t("So'm") }}
          </span>
        </div>
        <!-- Chart bars -->
        <div class="flex items-end gap-3" style="height:160px;">
          <div v-for="m in chartBars" :key="m.label" class="flex-1 flex flex-col items-center gap-2">
            <span class="text-[11px] font-semibold" :style="textSecondary">
              {{ m.amount > 0 ? fmt(m.amount) : '' }}
            </span>
            <div class="w-full rounded-t-md min-h-[6px] transition-all duration-700 relative group cursor-default"
              :style="{
                height: Math.max((m.amount / maxChartAmount) * 130, 6) + 'px',
                background: themeStore.isDark
                  ? 'linear-gradient(180deg, #5b8dee, #3d6abf)'
                  : 'linear-gradient(180deg, #2563eb, #1A3A6B)'
              }">
              <!-- Tooltip -->
              <div v-if="m.amount > 0"
                class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 px-2 py-1 rounded text-[11px] font-semibold text-white"
                style="background:#1A3A6B; box-shadow:0 2px 8px rgba(0,0,0,0.2);">
                {{ fmt(m.amount) }}
              </div>
            </div>
            <span class="text-[11px] text-center leading-tight whitespace-pre-line font-medium" :style="textSecondary">
              {{ langStore.t(m.label) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Manba donut -->
      <div class="card p-5">
        <h3 class="text-sm font-bold mb-5" :style="textPrimary">{{ langStore.t("Manba bo'yicha") }}</h3>
        <div class="flex flex-col items-center gap-5">
          <svg viewBox="0 0 100 100" class="w-32 h-32 shrink-0 -rotate-90">
            <circle cx="50" cy="50" r="38" fill="none"
              :stroke="themeStore.isDark ? '#1e2d42' : '#e5e7eb'" stroke-width="12" />
            <template v-if="sourceTotal > 0">
              <circle v-for="seg in sourceSegments" :key="seg.key"
                cx="50" cy="50" r="38" fill="none"
                :stroke="seg.color" stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="`${seg.dash * 0.905} ${seg.gap * 0.905 + seg.dash * 0.095}`"
                :stroke-dashoffset="-seg.offset * 0.905"
                style="transition: stroke-dasharray 0.6s ease;" />
            </template>
          </svg>
          <div class="w-full space-y-2.5">
            <div v-for="s in sourceStats" :key="s.key"
              class="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md"
              :style="themeStore.isDark ? 'background:#1a2235;' : 'background:#f9fafb;'">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: s.color }"></span>
                <span class="text-xs font-medium" :style="textSecondary">{{ $t(s.label) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs" :style="textSecondary">{{ s.pct }}%</span>
                <span class="text-sm font-bold" :style="textPrimary">{{ s.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TO'LOV + HOLAT + XODIMLAR -->
    <div class="grid grid-cols-3 gap-4">

      <!-- To'lov turi -->
      <div class="card p-5">
        <h3 class="text-sm font-bold mb-5" :style="textPrimary">{{ langStore.t("To'lov turi") }}</h3>
        <div class="space-y-4">
          <div v-for="pt in paymentTypeStats" :key="pt.key">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium" :style="textSecondary">{{ langStore.t(pt.label) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold" :style="textSecondary">{{ fmt(pt.amount) }}</span>
                <span class="text-xs font-bold w-10 text-right" :style="textPrimary">{{ pt.pct }}%</span>
              </div>
            </div>
            <div class="h-2 rounded-full overflow-hidden" :style="themeStore.isDark ? 'background:#1e2d42' : 'background:#e5e7eb'">
              <div class="h-2 rounded-full transition-all duration-700"
                :style="{ width: pt.pct + '%', background: pt.color }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- To'lov holati -->
      <div class="card p-5">
        <h3 class="text-sm font-bold mb-5" :style="textPrimary">{{ langStore.t("To'lov holati") }}</h3>
        <div class="flex flex-col items-center gap-4">
          <div class="relative w-32 h-32">
            <svg viewBox="0 0 100 100" class="-rotate-90 w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none"
                :stroke="themeStore.isDark ? '#1e2d42' : '#e5e7eb'" stroke-width="12" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke="#16a34a" stroke-width="12" stroke-linecap="round"
                :stroke-dasharray="`${totalCustomers > 0 ? (paidCount / totalCustomers) * 251.3 : 0} 251.3`"
                stroke-dashoffset="0" style="transition: all 0.7s ease;" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke="#dc2626" stroke-width="12" stroke-linecap="round"
                :stroke-dasharray="`${totalCustomers > 0 ? (debtorsCount / totalCustomers) * 251.3 : 0} 251.3`"
                :stroke-dashoffset="`${-(totalCustomers > 0 ? (paidCount / totalCustomers) * 251.3 : 0)}`"
                style="transition: all 0.7s ease;" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-black" :style="textPrimary">
                {{ totalCustomers > 0 ? Math.round((paidCount / totalCustomers) * 100) : 0 }}%
              </span>
              <span class="text-[11px] font-medium" :style="textSecondary">{{ $t("To'lagan") }}</span>
            </div>
          </div>
          <div class="w-full space-y-2">
            <div class="flex items-center justify-between p-3 rounded-lg"
              :style="themeStore.isDark ? 'background:#052e16; border:1px solid #064e3b;' : 'background:#f0fdf4; border:1px solid #bbf7d0;'">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" style="background:#16a34a;"></span>
                <span class="text-xs font-semibold" style="color:#16a34a;">{{ langStore.t("To'lagan") }}</span>
              </div>
              <span class="text-sm font-black" style="color:#16a34a;">{{ paidCount }}</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg"
              :style="themeStore.isDark ? 'background:#1f0a0a; border:1px solid #450a0a;' : 'background:#fef2f2; border:1px solid #fecaca;'">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" style="background:#dc2626;"></span>
                <span class="text-xs font-semibold" style="color:#dc2626;">{{ langStore.t('Qarzdor') }}</span>
              </div>
              <span class="text-sm font-black" style="color:#dc2626;">{{ debtorsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Xodimlar reytingi -->
      <div class="card p-5">
        <h3 class="text-sm font-bold mb-5" :style="textPrimary">{{ langStore.t('Xodimlar reytingi') }}</h3>
        <div v-if="workerStats.length > 0" class="space-y-2">
          <div v-for="(w, i) in workerStats" :key="i"
            class="flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-default"
            :style="themeStore.isDark ? 'background:#1a2235;' : 'background:#f9fafb;'"
            @mouseenter="$event.currentTarget.style.background = themeStore.isDark ? '#1e2a40' : '#f0f2f7'"
            @mouseleave="$event.currentTarget.style.background = themeStore.isDark ? '#1a2235' : '#f9fafb'">
            <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
              :style="i === 0
                ? 'background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff;'
                : i === 1
                  ? 'background:linear-gradient(135deg,#94a3b8,#64748b); color:#fff;'
                  : i === 2
                    ? 'background:linear-gradient(135deg,#92400e,#78350f); color:#fff;'
                    : themeStore.isDark ? 'background:#1e2d42; color:#8b95a8;' : 'background:#e5e7eb; color:#4b5563;'">
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold truncate" :style="textPrimary">{{ $t(w.name) }}</p>
              <p class="text-[11px] font-medium" :style="textSecondary">{{ fmt(w.revenue) }} so'm</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full"
              :style="themeStore.isDark ? 'background:#0d1f3c; color:#4f8ef7;' : 'background:#eff4fc; color:#1A3A6B;'">
              {{ w.count }}
            </span>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-10 gap-3">
          <div class="w-12 h-12 rounded-full flex items-center justify-center"
            :style="themeStore.isDark ? 'background:#1e2d42;' : 'background:#f0f2f7;'">
            <svg class="w-6 h-6" :style="textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <p class="text-xs font-medium" :style="textSecondary">{{ langStore.t("Ma'lumot yo'q") }}</p>
        </div>
      </div>
    </div>

    <!-- SO'NGGI MIJOZLAR -->
    <div class="card overflow-hidden">
      <div class="px-5 py-4 flex items-center justify-between"
        :style="`border-bottom:1px solid ${themeStore.isDark ? '#1e2d42' : '#eaecf3'};`">
        <h3 class="text-sm font-bold" :style="textPrimary">{{ langStore.t("So'nggi mijozlar") }}</h3>
        <button @click="router.push('/customers')"
          class="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
          :style="themeStore.isDark ? 'color:#4f8ef7; background:#0d1f3c;' : 'color:#1A3A6B; background:#eff4fc;'"
          @mouseover="e => e.currentTarget.style.opacity='0.8'"
          @mouseleave="e => e.currentTarget.style.opacity='1'">
          {{ langStore.t("Barchasini ko'rish") }}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="recentCustomers.length === 0" class="flex flex-col items-center justify-center py-14 gap-3">
        <div class="w-14 h-14 rounded-full flex items-center justify-center"
          :style="themeStore.isDark ? 'background:#1e2d42;' : 'background:#f0f2f7;'">
          <svg class="w-7 h-7" :style="textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold" :style="textPrimary">{{ langStore.t("Mijozlar yo'q") }}</p>
          <p class="text-xs mt-1" :style="textSecondary">{{ langStore.t("Hozircha mijozlar qo'shilmagan") }}</p>
        </div>
      </div>

      <table v-else class="gov-table">
        <thead>
          <tr>
            <th>{{ langStore.t('Mijoz') }}</th>
            <th>{{ langStore.t('Telefon') }}</th>
            <th>{{ langStore.t('Yurist') }}</th>
            <th class="text-right">{{ langStore.t('Narx') }}</th>
            <th class="text-center">{{ langStore.t('Holat') }}</th>
            <th>{{ langStore.t('Sana') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in recentCustomers" :key="c.id"
            class="cursor-pointer"
            @click="router.push('/customer/' + c.id)">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                  style="background:linear-gradient(135deg,#2563eb,#1A3A6B);">
                  {{ ($t(c.surname) || $t(c.name) || '?')[0].toUpperCase() }}
                </div>
                <span class="font-semibold text-sm" :style="textPrimary">
                  {{ $t(c.surname) }} {{ $t(c.name) }}
                </span>
              </div>
            </td>
            <td :style="textSecondary">{{ c.phone }}</td>
            <td>
              <span v-if="c.assignedTo" class="text-xs" :style="textSecondary">
                {{ $t(c.assignedTo.surname) }} {{ $t(c.assignedTo.name) }}
              </span>
              <span v-else :style="textSecondary">—</span>
            </td>
            <td class="text-right font-semibold" :style="textPrimary">
              {{ fmt(c.price) }} so'm
            </td>
            <td class="text-center">
              <span class="gov-badge"
                :class="(() => {
                  const paid = (c.payments||[]).reduce((a,p)=>a+(p.amount||0),0)
                  return (c.price||0)-paid > 0 ? 'gov-badge-red' : 'gov-badge-green'
                })()">
                {{ (() => {
                  const paid = (c.payments||[]).reduce((a,p)=>a+(p.amount||0),0)
                  const debt = (c.price||0)-paid
                  return debt > 0 ? langStore.t('Qarz')+': '+fmt(debt) : langStore.t("To'langan")
                })() }}
              </span>
            </td>
            <td class="text-xs" :style="textSecondary">{{ formatDate(c.createdAt) }}</td>
            <td>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="2" stroke="currentColor" class="w-4 h-4" :style="textSecondary">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
