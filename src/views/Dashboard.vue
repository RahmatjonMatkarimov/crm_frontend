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

onMounted(() => {
  store.fetchCustomers()
})

const allCustomers = computed(() => store.customers || [])

// --- FILTER ---
const selectedPeriod = ref('month')
const periods = [
  { key: 'all',   label: 'Barchasi' },
  { key: 'year',  label: 'Yillik' },
  { key: 'month', label: 'Oylik' },
  { key: 'week',  label: 'Haftali' },
]

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

// Davr ichida to'lovlarni filtrlash
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

// --- ASOSIY STATISTIKALAR ---
const totalCustomers = computed(() => customers.value.length)

const totalRevenue = computed(() =>
  paymentsInPeriod.value.reduce((sum, p) => sum + (p.amount || 0), 0)
)

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

// --- MANBA BO'YICHA ---
const sourceMap = {
  INSTAGRAM: { label: 'Instagram', color: '#e1306c' },
  TELEGRAM: { label: 'Telegram', color: '#2ea6dd' },
  YOUTUBE: { label: 'YouTube', color: '#ff0000' },
  TANISHIDAN: { label: "Tanishidan", color: '#10b981' },
}

const sourceStats = computed(() => {
  const counts = {}
  customers.value.forEach(c => {
    if (c.source) counts[c.source] = (counts[c.source] || 0) + 1
  })
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(sourceMap).map(([key, meta]) => ({
    key,
    label: meta.label,
    color: meta.color,
    count: counts[key] || 0,
    pct: Math.round(((counts[key] || 0) / total) * 100),
  }))
})

// --- TO'LOV TURI BO'YICHA ---
const paymentTypeMap = {
  NAQD: { label: "Naqd pul", color: '#6366f1' },
  KARTA: { label: 'Plastik karta', color: '#f59e0b' },
  PUL_OTKAZISH: { label: "Pul o'tkazish", color: '#14b8a6' },
}

const paymentTypeStats = computed(() => {
  const amounts = {}
  paymentsInPeriod.value.forEach(p => {
    const t = p.type || 'NAQD'
    amounts[t] = (amounts[t] || 0) + (p.amount || 0)
  })
  const total = Object.values(amounts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(paymentTypeMap).map(([key, meta]) => ({
    key,
    label: meta.label,
    color: meta.color,
    amount: amounts[key] || 0,
    pct: Math.round(((amounts[key] || 0) / total) * 100),
  }))
})

const UZ_DAYS   = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

// --- GRAFIK (davr bo'yicha o'zgaradi) ---
const chartBars = computed(() => {
  const now = new Date()
  const period = selectedPeriod.value

  if (period === 'week') {
    const bars = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      bars.push({
        label: `${UZ_DAYS[d.getDay()]}\n${d.getDate()}-${UZ_MONTHS[d.getMonth()].slice(0,4)}`,
        year: d.getFullYear(), month: d.getMonth(), day: d.getDate(),
        amount: 0,
      })
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
    // Oyning kunlari soniga qarab haftalar
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const bars = [
      { label: `1–7\n${UZ_MONTHS[month].slice(0,4)}`,  week: 0, year, month, amount: 0 },
      { label: `8–15\n${UZ_MONTHS[month].slice(0,4)}`, week: 1, year, month, amount: 0 },
      { label: `16–23\n${UZ_MONTHS[month].slice(0,4)}`,week: 2, year, month, amount: 0 },
      { label: `24–${daysInMonth}\n${UZ_MONTHS[month].slice(0,4)}`, week: 3, year, month, amount: 0 },
    ]
    allCustomers.value.forEach(c => {
      ;(c.payments || []).forEach(p => {
        const d = new Date(p.createdAt)
        if (d.getFullYear() === year && d.getMonth() === month) {
          const w = Math.min(Math.floor((d.getDate() - 1) / 7), 3)
          bars[w].amount += p.amount || 0
        }
      })
    })
    return bars
  }

  // year yoki all → so'nggi 6 oy
  const bars = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    bars.push({
      label: UZ_MONTHS[d.getMonth()],
      year: d.getFullYear(), month: d.getMonth(),
      amount: 0,
    })
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
  if (selectedPeriod.value === 'week')  return "Kunlik tushum (so'nggi 7 kun)"
  if (selectedPeriod.value === 'month') return "Haftalik tushum (joriy oy)"
  return "Oylik tushum (so'nggi 6 oy)"
})

// --- YANGI MIJOZLAR (so'nggi 5) ---
const recentCustomers = computed(() =>
  [...customers.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
)

// --- XODIMLAR BO'YICHA ---
const workerStats = computed(() => {
  const map = {}
  customers.value.forEach(c => {
    if (c.assignedTo) {
      const key = c.assignedTo.id || c.assignedTo.name
      if (!map[key]) {
        map[key] = {
          name: `${c.assignedTo.surname || ''} ${c.assignedTo.name || ''}`.trim(),
          count: 0,
          revenue: 0,
        }
      }
      map[key].count++
      map[key].revenue += (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
    }
  })
  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5)
})

// --- HELPERS ---
const fmt = (n) => {
  if (!n) return '0'
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n))
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// Donut chart SVG helper
const donutSegments = (data, total) => {
  const r = 42
  const circ = 2 * Math.PI * r
  let offset = 0
  return data.map(d => {
    const pct = total ? d.count / total : 0
    const dash = pct * circ
    const gap = circ - dash
    const seg = { ...d, dash, gap, offset }
    offset += dash
    return seg
  })
}

const sourceTotal = computed(() => sourceStats.value.reduce((a, b) => a + b.count, 0))
const sourceSegments = computed(() => donutSegments(sourceStats.value, sourceTotal.value))
</script>

<template>
  <div class="space-y-6">
    <!-- FILTER TUGMALAR -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="p in periods" :key="p.key"
        @click="selectedPeriod = p.key"
        class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border"
        :class="selectedPeriod === p.key
          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
          : themeStore.isDark
            ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50'">
        {{ $t(p.label) }}
      </button>
    </div>

    <!-- STAT KARTALAR -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Jami mijozlar -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40">
            <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
            {{ langStore.t('Jami') }}
          </span>
        </div>
        <p class="text-2xl font-bold" :class="themeStore.isDark ? 'text-white' : 'text-slate-800'">{{ totalCustomers }}</p>
        <p class="text-xs mt-1" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">{{ langStore.t('Mijozlar') }}</p>
      </div>

      <!-- Jami tushum -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40">
            <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            {{ langStore.t("To'landi") }}
          </span>
        </div>
        <p class="text-xl font-bold truncate" :class="themeStore.isDark ? 'text-white' : 'text-slate-800'">{{ fmt(totalRevenue) }}</p>
        <p class="text-xs mt-1" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">{{ langStore.t("Jami tushum (so'm)") }}</p>
      </div>

      <!-- Jami qarzdorlik -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-100 dark:bg-rose-900/40">
            <svg class="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
            {{ langStore.t('Qarz') }}
          </span>
        </div>
        <p class="text-xl font-bold truncate" :class="themeStore.isDark ? 'text-white' : 'text-slate-800'">{{ fmt(totalDebt) }}</p>
        <p class="text-xs mt-1" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">{{ langStore.t("Jami qarz (so'm)") }}</p>
      </div>

      <!-- Qarzdorlar soni -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/40">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            {{ langStore.t('Qarzdor') }}
          </span>
        </div>
        <p class="text-2xl font-bold" :class="themeStore.isDark ? 'text-white' : 'text-slate-800'">{{ debtorsCount }}</p>
        <p class="text-xs mt-1" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">{{ langStore.t('Qarzdor mijozlar') }}</p>
      </div>
    </div>

    <!-- 2-QATOR: Oylik grafik + Manba donut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Grafik -->
      <div class="lg:col-span-2 rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <h3 class="text-sm font-semibold mb-4" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
          {{ langStore.t(chartTitle) }}
        </h3>
        <div class="flex items-end gap-2 h-40">
          <div v-for="m in chartBars" :key="m.label"
            class="flex-1 flex flex-col items-center gap-1">
            <span class="text-[10px] font-medium" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">
              {{ fmt(m.amount) === '0' ? '' : fmt(m.amount) }}
            </span>
            <div class="w-full rounded-t-lg transition-all duration-500 min-h-[4px]"
              :style="{
                height: Math.max((m.amount / maxChartAmount) * 128, 4) + 'px',
                background: themeStore.isDark
                  ? 'linear-gradient(180deg, #818cf8, #4f46e5)'
                  : 'linear-gradient(180deg, #6366f1, #4338ca)'
              }">
            </div>
            <span class="text-[10px]" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">{{ $t(m.label) }}</span>
          </div>
        </div>
      </div>

      <!-- Manba donut -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <h3 class="text-sm font-semibold mb-4" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
          {{ langStore.t('Manba bo\'yicha') }}
        </h3>
        <div class="flex items-center gap-4">
          <!-- Donut SVG -->
          <svg viewBox="0 0 100 100" class="w-24 h-24 shrink-0 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none"
              :stroke="themeStore.isDark ? '#1e293b' : '#f1f5f9'" stroke-width="16" />
            <template v-if="sourceTotal > 0">
              <circle v-for="seg in sourceSegments" :key="seg.key"
                cx="50" cy="50" r="42" fill="none"
                :stroke="seg.color" stroke-width="16"
                :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                :stroke-dashoffset="-seg.offset" />
            </template>
            <template v-else>
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="themeStore.isDark ? '#334155' : '#e2e8f0'" stroke-width="16" />
            </template>
          </svg>
          <!-- Legend -->
          <div class="flex-1 space-y-1.5">
            <div v-for="s in sourceStats" :key="s.key" class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: s.color }"></span>
                <span class="text-[11px]" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-600'">{{ $t(s.label) }}</span>
              </div>
              <span class="text-[11px] font-semibold" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">{{ s.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3-QATOR: To'lov turi + Holat + Xodimlar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- To'lov turi bo'yicha -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <h3 class="text-sm font-semibold mb-4" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
          {{ langStore.t("To'lov turi") }}
        </h3>
        <div class="space-y-3">
          <div v-for="pt in paymentTypeStats" :key="pt.key">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-600'">{{ langStore.t(pt.label) }}</span>
              <span class="text-xs font-semibold" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">{{ pt.pct }}%</span>
            </div>
            <div class="h-2 rounded-full" :class="themeStore.isDark ? 'bg-slate-700' : 'bg-slate-100'">
              <div class="h-2 rounded-full transition-all duration-500"
                :style="{ width: pt.pct + '%', background: pt.color }">
              </div>
            </div>
            <p class="text-[10px] mt-0.5" :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'">
              {{ fmt(pt.amount) }} {{ $t("so'm") }}
            </p>
          </div>
        </div>
      </div>

      <!-- To'lov holati (Doughnut CSS) -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <h3 class="text-sm font-semibold mb-4" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
          {{ langStore.t("To'lov holati") }}
        </h3>
        <div class="flex flex-col items-center gap-4">
          <!-- Simple donut -->
          <div class="relative w-24 h-24">
            <svg viewBox="0 0 100 100" class="-rotate-90 w-full h-full">
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="themeStore.isDark ? '#1e293b' : '#f1f5f9'" stroke-width="16" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="#10b981" stroke-width="16"
                :stroke-dasharray="`${totalCustomers > 0 ? (paidCount / totalCustomers) * 263.9 : 0} 263.9`"
                stroke-dashoffset="0" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="#f43f5e" stroke-width="16"
                :stroke-dasharray="`${totalCustomers > 0 ? (debtorsCount / totalCustomers) * 263.9 : 0} 263.9`"
                :stroke-dashoffset="`${-(totalCustomers > 0 ? (paidCount / totalCustomers) * 263.9 : 0)}`" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold" :class="themeStore.isDark ? 'text-white' : 'text-slate-700'">
                {{ totalCustomers > 0 ? Math.round((paidCount / totalCustomers) * 100) : 0 }}%
              </span>
            </div>
          </div>
          <div class="w-full space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-xs" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-600'">{{ langStore.t("To'lagan") }}</span>
              </div>
              <span class="text-xs font-semibold" :class="themeStore.isDark ? 'text-white' : 'text-slate-700'">{{ paidCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span class="text-xs" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-600'">{{ langStore.t('Qarzdor') }}</span>
              </div>
              <span class="text-xs font-semibold" :class="themeStore.isDark ? 'text-white' : 'text-slate-700'">{{ debtorsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Xodimlar reytingi -->
      <div class="rounded-2xl p-5 shadow-sm"
        :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
        <h3 class="text-sm font-semibold mb-4" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
          {{ langStore.t('Xodimlar reytingi') }}
        </h3>
        <div v-if="workerStats.length > 0" class="space-y-2.5">
          <div v-for="(w, i) in workerStats" :key="i" class="flex items-center gap-3">
            <span class="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
              :class="i === 0
                ? 'bg-amber-100 text-amber-600'
                : i === 1
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-orange-50 text-orange-400'">
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium truncate" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">{{ $t(w.name) }}</p>
              <p class="text-[10px]" :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'">{{ fmt(w.revenue) }} {{ $t("so'm") }}</p>
            </div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="themeStore.isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'">
              {{ w.count }} {{ $t("ta") }}
            </span>
          </div>
        </div>
        <div v-else class="text-center py-6">
          <p class="text-xs" :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'">{{ langStore.t("Ma'lumot yo'q") }}</p>
        </div>
      </div>
    </div>

    <!-- 4-QATOR: So'nggi mijozlar -->
    <div class="rounded-2xl shadow-sm overflow-hidden"
      :class="themeStore.isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-indigo-50'">
      <div class="px-5 py-4 border-b flex items-center justify-between"
        :class="themeStore.isDark ? 'border-slate-700' : 'border-slate-100'">
        <h3 class="text-sm font-semibold" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
          {{ langStore.t("So'nggi mijozlar") }}
        </h3>
        <button @click="router.push('/customers')"
          class="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
          {{ langStore.t("Barchasini ko'rish") }} →
        </button>
      </div>
      <div class="divide-y" :class="themeStore.isDark ? 'divide-slate-700' : 'divide-slate-50'">
        <div v-if="recentCustomers.length === 0" class="px-5 py-8 text-center">
          <p class="text-sm" :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'">{{ langStore.t("Mijozlar yo'q") }}</p>
        </div>
        <div v-for="c in recentCustomers" :key="c.id"
          class="px-5 py-3 flex items-center gap-4 hover:opacity-80 cursor-pointer transition-opacity"
          @click="router.push('/customer/' + c.id)">
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
            {{ ($t(c.surname) || $t(c.name) || '?')[0].toUpperCase() }}
          </div>
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
              {{ $t(c.surname) }} {{ $t(c.name) }} {{ $t(c.father_name) || '' }}
            </p>
            <p class="text-[11px] truncate" :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'">
              {{ c.phone }}
              <span v-if="c.assignedTo"> · {{ $t(c.assignedTo.surname) }} {{ $t(c.assignedTo.name) }}</span>
            </p>
          </div>
          <!-- Price & debt badge -->
          <div class="text-right shrink-0">
            <p class="text-xs font-semibold" :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
              {{ fmt(c.price) }} {{ $t("so'm") }}
            </p>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              :class="(() => {
                const paid = (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
                const debt = (c.price || 0) - paid
                return debt > 0
                  ? themeStore.isDark ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-600'
                  : themeStore.isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              })()">
              {{ (() => {
                const paid = (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
                const debt = (c.price || 0) - paid
                return debt > 0 ? langStore.t('Qarz') + ': ' + fmt(debt) : langStore.t("To'langan")
              })() }}
            </span>
          </div>
          <!-- Date -->
          <p class="text-[10px] shrink-0 hidden md:block" :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'">
            {{ formatDate(c.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
