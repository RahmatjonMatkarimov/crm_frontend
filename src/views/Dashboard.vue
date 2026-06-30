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
  ? 'background:#1c3252; border:1px solid #2a4a6e;'
  : 'background:#ffffff; border:1px solid #d0d7e3;')
const textPrimary = computed(() => themeStore.isDark ? 'color:#e8f0ff' : 'color:#1a1f36')
const textSecondary = computed(() => themeStore.isDark ? 'color:#90b8e0' : 'color:#4a5568')
const textMuted = computed(() => themeStore.isDark ? 'color:#6090b8' : 'color:#8892a4')
const divider = computed(() => themeStore.isDark ? 'background:#3a6090' : 'background:#eaecf0')
</script>

<template>
  <div class="space-y-5">

    <!-- Period filter -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="p in periods" :key="p.key"
        @click="selectedPeriod = p.key"
        class="px-4 py-1.5 rounded text-xs font-semibold transition-all"
        :style="selectedPeriod === p.key
          ? 'background:#1A3A6B; color:#ffffff; border:1px solid #1A3A6B; border-radius:4px;'
          : themeStore.isDark
            ? 'background:#1c3252; color:#90b8e0; border:1px solid #2a4a6e;'
            : 'background:#ffffff; color:#4a5568; border:1px solid #d8dde6;'">
        {{ $t(p.label) }}
      </button>
    </div>

    <!-- STAT CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Mijozlar -->
      <div class="p-5" :style="card + '; border-top:3px solid #1A3A6B; border-radius:4px;'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded flex items-center justify-center" style="background:#eff3f9;">
            <svg class="w-5 h-5" style="color:#1A3A6B;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold leading-none" :style="textPrimary">{{ totalCustomers }}</p>
        <p class="text-xs mt-2" :style="textSecondary">{{ langStore.t('Jami mijozlar') }}</p>
      </div>

      <!-- Tushum -->
      <div class="p-5" :style="card + '; border-top:3px solid #2E8B57; border-radius:4px;'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded flex items-center justify-center" :style="themeStore.isDark ? 'background:#1a4a2a;' : 'background:#f0fdf4;'">
            <svg class="w-5 h-5" style="color:#2E8B57;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold leading-none truncate" :style="textPrimary">{{ fmt(totalRevenue) }}</p>
        <p class="text-xs mt-2" :style="textSecondary">{{ langStore.t("Jami tushum (so'm)") }}</p>
      </div>

      <!-- Qarz -->
      <div class="p-5" :style="card + '; border-top:3px solid #c53030; border-radius:4px;'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded flex items-center justify-center" :style="themeStore.isDark ? 'background:#4a1818;' : 'background:#fff5f5;'">
            <svg class="w-5 h-5" style="color:#c53030;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold leading-none truncate" :style="textPrimary">{{ fmt(totalDebt) }}</p>
        <p class="text-xs mt-2" :style="textSecondary">{{ langStore.t("Jami qarz (so'm)") }}</p>
      </div>

      <!-- Qarzdorlar -->
      <div class="p-5" :style="card + '; border-top:3px solid #b45309; border-radius:4px;'">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded flex items-center justify-center" :style="themeStore.isDark ? 'background:#4a2800;' : 'background:#fffbeb;'">
            <svg class="w-5 h-5" style="color:#b45309;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold leading-none" :style="textPrimary">{{ debtorsCount }}</p>
        <p class="text-xs mt-2" :style="textSecondary">{{ langStore.t('Qarzdor mijozlar') }}</p>
      </div>
    </div>

    <!-- GRAFIK + MANBA -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Grafik -->
      <div class="lg:col-span-2 rounded p-5" :style="card">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-sm font-semibold" :style="textPrimary">{{ langStore.t(chartTitle) }}</h3>
          <span class="text-[10px] font-semibold px-2 py-1 rounded" :style="themeStore.isDark ? 'background:#1c3252; color:#90b8e0;' : 'background:#f0f2f5; color:#4a5568;'">{{ $t("So'm") }}</span>
        </div>
        <div class="flex items-end gap-2 h-44">
          <div v-for="m in chartBars" :key="m.label" class="flex-1 flex flex-col items-center gap-1.5">
            <span class="text-[9px] font-semibold" :style="textMuted">
              {{ m.amount > 0 ? fmt(m.amount) : '' }}
            </span>
            <div class="w-full rounded-t min-h-[4px] transition-all duration-700"
              :style="{
                height: Math.max((m.amount / maxChartAmount) * 140, 4) + 'px',
                background: themeStore.isDark ? '#2d5282' : '#1A3A6B'
              }">
            </div>
            <span class="text-[9px] text-center leading-tight whitespace-pre-line" :style="textMuted">{{ langStore.t(m.label)}}</span>
          </div>
        </div>
      </div>

      <!-- Manba donut -->
      <div class="p-5" :style="card + '; border-radius:4px;'">
        <h3 class="text-sm font-semibold mb-5" :style="textPrimary">{{ langStore.t("Manba bo'yicha") }}</h3>
        <div class="flex flex-col items-center gap-4">
          <svg viewBox="0 0 100 100" class="w-28 h-28 shrink-0 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none"
              :stroke="themeStore.isDark ? '#2a4a6e' : '#eaecf0'" stroke-width="14" />
            <template v-if="sourceTotal > 0">
              <circle v-for="seg in sourceSegments" :key="seg.key"
                cx="50" cy="50" r="42" fill="none"
                :stroke="seg.color" stroke-width="14"
                :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                :stroke-dashoffset="-seg.offset"
                style="transition: stroke-dasharray 0.5s ease;" />
            </template>
            <template v-else>
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="themeStore.isDark ? '#2a4a6e' : '#eaecf0'" stroke-width="14" />
            </template>
          </svg>
          <div class="w-full space-y-2">
            <div v-for="s in sourceStats" :key="s.key" class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: s.color }"></span>
                <span class="text-xs" :style="textSecondary">{{ $t(s.label) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px]" :style="textMuted">{{ s.pct }}%</span>
                <span class="text-xs font-bold" :style="textPrimary">{{ s.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TO'LOV + HOLAT + XODIMLAR -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- To'lov turi -->
      <div class="p-5" :style="card + '; border-radius:4px;'">
        <h3 class="text-sm font-semibold mb-5" :style="textPrimary">{{ langStore.t("To'lov turi") }}</h3>
        <div class="space-y-4">
          <div v-for="pt in paymentTypeStats" :key="pt.key">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs" :style="textSecondary">{{ langStore.t(pt.label) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-[10px]" :style="textMuted">{{ fmt(pt.amount) }}</span>
                <span class="text-xs font-bold" :style="textPrimary">{{ pt.pct }}%</span>
              </div>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" :style="themeStore.isDark ? 'background:#3a6090' : 'background:#eaecf0'">
              <div class="h-1.5 rounded-full transition-all duration-700"
                :style="{ width: pt.pct + '%', background: pt.color }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- To'lov holati -->
      <div class="p-5" :style="card + '; border-radius:4px;'">
        <h3 class="text-sm font-semibold mb-5" :style="textPrimary">{{ langStore.t("To'lov holati") }}</h3>
        <div class="flex flex-col items-center gap-4">
          <div class="relative w-28 h-28">
            <svg viewBox="0 0 100 100" class="-rotate-90 w-full h-full">
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="themeStore.isDark ? '#2a4a6e' : '#eaecf0'" stroke-width="14" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="#2E8B57" stroke-width="14"
                :stroke-dasharray="`${totalCustomers > 0 ? (paidCount / totalCustomers) * 263.9 : 0} 263.9`"
                stroke-dashoffset="0" style="transition: all 0.7s ease;" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="#c53030" stroke-width="14"
                :stroke-dasharray="`${totalCustomers > 0 ? (debtorsCount / totalCustomers) * 263.9 : 0} 263.9`"
                :stroke-dashoffset="`${-(totalCustomers > 0 ? (paidCount / totalCustomers) * 263.9 : 0)}`"
                style="transition: all 0.7s ease;" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-bold" :style="textPrimary">
                {{ totalCustomers > 0 ? Math.round((paidCount / totalCustomers) * 100) : 0 }}%
              </span>
              <span class="text-[9px]" :style="textMuted">{{ $t("To'lagan") }}</span>
            </div>
          </div>
          <div class="w-full space-y-2">
            <div class="flex items-center justify-between p-2.5 rounded" :style="themeStore.isDark ? 'background:#1a4a2a; border:1px solid #2a6a3a;' : 'background:#f0fdf4;'">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" style="background:#2E8B57;"></span>
                <span class="text-xs font-medium" style="color:#2E8B57;">{{ langStore.t("To'lagan") }}</span>
              </div>
              <span class="text-sm font-bold" style="color:#2E8B57;">{{ paidCount }}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 rounded" :style="themeStore.isDark ? 'background:#4a1818; border:1px solid #6a2828;' : 'background:#fff5f5;'">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" style="background:#c53030;"></span>
                <span class="text-xs font-medium" style="color:#c53030;">{{ langStore.t('Qarzdor') }}</span>
              </div>
              <span class="text-sm font-bold" style="color:#c53030;">{{ debtorsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Xodimlar reytingi -->
      <div class="p-5" :style="card + '; border-radius:4px;'">
        <h3 class="text-sm font-semibold mb-5" :style="textPrimary">{{ langStore.t('Xodimlar reytingi') }}</h3>
        <div v-if="workerStats.length > 0" class="space-y-2">
          <div v-for="(w, i) in workerStats" :key="i"
            class="flex items-center gap-3 p-2.5 rounded transition-all"
            :style="themeStore.isDark ? 'background:#305080;' : 'background:#f7f8fa;'">
            <span class="w-6 h-6 rounded text-xs font-bold flex items-center justify-center shrink-0"
              :style="i === 0
                ? 'background:#b45309; color:#fff;'
                : i === 1
                  ? 'background:#6b7280; color:#fff;'
                  : themeStore.isDark ? 'background:#3a6090; color:#90b8e0;' : 'background:#eaecf0; color:#4a5568;'">
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold truncate" :style="textPrimary">{{ $t(w.name) }}</p>
              <p class="text-[10px]" :style="textMuted">{{ fmt(w.revenue) }} so'm</p>
            </div>
            <span class="text-xs font-bold px-2 py-0.5 rounded" :style="themeStore.isDark ? 'background:#3a6090; color:#90b8e0;' : 'background:#eff3f9; color:#1A3A6B;'">
              {{ w.count }}
            </span>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-8 gap-2">
          <p class="text-xs" :style="textMuted">{{ langStore.t("Ma'lumot yo'q") }}</p>
        </div>
      </div>
    </div>

    <!-- SO'NGGI MIJOZLAR -->
    <div class="rounded overflow-hidden" :style="card">
      <div class="px-5 py-3.5 flex items-center justify-between" :style="`border-bottom:1px solid ${themeStore.isDark ? '#2a4a6e' : '#eaecf0'};`">
        <h3 class="text-sm font-semibold" :style="textPrimary">{{ langStore.t("So'nggi mijozlar") }}</h3>
        <button @click="router.push('/customers')"
          class="text-xs font-medium flex items-center gap-1 transition-colors" style="color:#1A3A6B;">
          {{ langStore.t("Barchasini ko'rish") }}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div v-if="recentCustomers.length === 0" class="px-5 py-10 text-center">
        <p class="text-sm" :style="textMuted">{{ langStore.t("Mijozlar yo'q") }}</p>
      </div>

      <div v-else class="divide-y" :style="`border-color:${themeStore.isDark ? '#2a4a6e' : '#eaecf0'};`">
        <div v-for="c in recentCustomers" :key="c.id"
          class="px-5 py-3 flex items-center gap-4 cursor-pointer group transition-all"
          :style="themeStore.isDark ? '' : ''"
          @mouseenter="$event.currentTarget.style.background = themeStore.isDark ? '#374151' : '#f7f8fa'"
          @mouseleave="$event.currentTarget.style.background = ''"
          @click="router.push('/customer/' + c.id)">

          <!-- Avatar -->
          <div class="w-8 h-8 rounded flex items-center justify-center shrink-0 text-white text-sm font-bold" style="background:#1A3A6B;">
            {{ ($t(c.surname) || $t(c.name) || '?')[0].toUpperCase() }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate" :style="textPrimary">
              {{ $t(c.surname) }} {{ $t(c.name) }} {{ $t(c.father_name) || '' }}
            </p>
            <p class="text-[11px] truncate mt-0.5" :style="textMuted">
              {{ c.phone }}
              <span v-if="c.assignedTo" class="ml-1">· {{ $t(c.assignedTo.surname) }} {{ $t(c.assignedTo.name) }}</span>
            </p>
          </div>

          <!-- Amount & status -->
          <div class="text-right shrink-0">
            <p class="text-sm font-bold" :style="textPrimary">{{ fmt(c.price) }} {{ $t("so'm") }}</p>
            <span class="text-[10px] px-2 py-0.5 rounded font-semibold mt-0.5 inline-block"
              :style="(() => {
                const paid = (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
                return (c.price || 0) - paid > 0
                  ? (themeStore.isDark ? 'background:#4a1818; color:#e05555; border:1px solid #6a2828;' : 'background:#fff5f5; color:#c53030;')
                  : (themeStore.isDark ? 'background:#1a4a2a; color:#3aab6d; border:1px solid #2a6a3a;' : 'background:#f0fdf4; color:#2E8B57;')
              })()">
              {{ (() => {
                const paid = (c.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
                const debt = (c.price || 0) - paid
                return debt > 0 ? langStore.t('Qarz') + ': ' + fmt(debt) : langStore.t("To'langan")
              })() }}
            </span>
          </div>

          <!-- Date -->
          <p class="text-[10px] shrink-0 hidden md:block" :style="textMuted">{{ formatDate(c.createdAt) }}</p>

          <!-- Arrow -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style="color:#8892a4;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
