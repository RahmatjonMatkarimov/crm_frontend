<template>
    <div class="min-h-screen py-8 px-4">
        <div class="max-w-5xl mx-auto">

            <!-- Loading -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-32 gap-3">
                <div class="w-8 h-8 border-2 rounded-full animate-spin" style="border-color:#d8dde6; border-top-color:#1e3a5f;"></div>
                <p class="text-slate-400 text-sm">{{ $t("Ma'lumotlar yuklanmoqda...") }}</p>
            </div>

            <!-- Not found -->
            <div v-else-if="!customer"
                class="p-8 rounded-3xl text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                <p class="text-red-500 text-lg font-medium">{{ $t('Mijoz topilmadi') }}</p>
            </div>

            <div v-else class="space-y-5">

                <!-- Hero Header -->
                <div class="overflow-hidden rounded shadow-sm" style="background:#1e3a5f;">
                    <div class="px-6 py-5 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-5">
                            <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 text-2xl font-bold text-white">
                                {{ (customer.surname || customer.name || '?').charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h1 class="text-white text-xl font-bold leading-tight">
                                    {{ $t(customer.surname) }} {{ $t(customer.name) }} {{ $t(customer.father_name || '') }}
                                </h1>
                                <div class="flex items-center gap-2 mt-1 flex-wrap">
                                    <span class="inline-flex items-center gap-1 text-xs text-white/60">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        {{ customer.phone || '-' }}
                                    </span>
                                    <span v-if="customer.customer_id" class="text-white/40 text-xs">•</span>
                                    <span v-if="customer.customer_id" class="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 text-white px-2 py-0.5 rounded-lg">
                                        ID: MJZ-{{ customer.customer_id }}
                                    </span>
                                    <span v-if="customer.queueNumber" class="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 text-white px-2 py-0.5 rounded-lg">
                                        {{ $t("Navbat") }}: A-{{ String(customer.queueNumber).padStart(2, '0') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button @click="goBack"
                            class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            {{ $t('Orqaga') }}
                        </button>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <!-- Main Info Card -->
                    <div class="lg:col-span-2 rounded-3xl border shadow-sm overflow-hidden"
                        :class="themeStore.isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-slate-200'">
                        <div class="px-6 py-4 border-b"
                            :class="themeStore.isDark ? 'border-white/5 bg-white/3' : 'border-slate-100 bg-slate-50'">
                            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {{ $t('Mijoz haqida') }}
                            </p>
                        </div>
                        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow :label="$t('F.I.Sh')"
                                :value="`${$t(customer.surname || '')} ${$t(customer.name || '')} ${$t(customer.father_name || '')}`" icon="user" />
                            <InfoRow :label="$t('Telefon raqam')" :value="customer.phone || '-'" icon="phone" />
                            <InfoRow :label="$t('Qo\'shimcha telefon raqam')" :value="customer.phone2 || '-'" icon="phone" />
                            <InfoRow :label="$t('Telegram')" :value="customer.telegram || '-'" icon="telegram" />
                            <InfoRow :label="$t('Manzil')"
                                :value="`${$t(customer.address || '')} ${customer.region || customer.district ? `(${$t(customer.region)} ${$t(customer.district)})` : ''}`"
                                icon="location" />
                            <InfoRow :label="$t('Maslahat narxi')"
                                :value="`${Number(customer.price || 0).toLocaleString()} ${$t('so\'m')}`"
                                icon="money" highlight />
                        </div>

                        <!-- Description -->
                        <div v-if="authStore.userRole === 'YURIST' || authStore.userRole === 'RAHBAR'"
                            class="px-6 pb-6">
                            <div class="rounded-2xl p-4"
                                :class="themeStore.isDark ? 'bg-white/3 border border-white/5' : 'bg-slate-50 border border-slate-100'">
                                <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                                    {{ $t('Izoh / Tavsif') }}
                                </p>
                                <p class="text-sm whitespace-pre-wrap"
                                    :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
                                    {{ $t(customer.description) || $t("Izoh yo'q") }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Meta Card -->
                    <div class="rounded-3xl border shadow-sm overflow-hidden"
                        :class="themeStore.isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-slate-200'">
                        <div class="px-6 py-4 border-b"
                            :class="themeStore.isDark ? 'border-white/5 bg-white/3' : 'border-slate-100 bg-slate-50'">
                            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {{ $t("Qo'shimcha") }}
                            </p>
                        </div>
                        <div class="p-6 space-y-5">
                            <!-- Status -->
                            <div>
                                <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                    {{ $t('Ish jarayoni') }}
                                </p>
                                <div class="relative">
                                    <select
                                        :value="customer.status || 'NAVBATDA'"
                                        @change="changeStatus($event.target.value)"
                                        :disabled="statusSaving"
                                        class="w-full pl-3 pr-8 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none appearance-none cursor-pointer disabled:opacity-60"
                                        :style="`background:${statusInlineColors[customer.status || 'NAVBATDA']?.bg}; color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}; border:1.5px solid ${statusInlineColors[customer.status || 'NAVBATDA']?.color}40;`"
                                    >
                                        <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
                                    </select>
                                    <svg v-if="!statusSaving" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        :style="`color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}`">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <div v-else class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
                                        :style="`color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}`"></div>
                                </div>
                            </div>

                            <div>
                                <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    {{ $t('Yaratilgan sana') }}
                                </p>
                                <p class="text-sm font-semibold"
                                    :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
                                    {{ formatDate(customer.createdAt) }}
                                </p>
                            </div>
                            <div v-if="customer.assignedTo">
                                <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    {{ $t("Mas'ul") }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <div class="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white"
                                        style="background:#1e3a5f;">
                                        {{ (customer.assignedTo.name || '?').charAt(0).toUpperCase() }}
                                    </div>
                                    <p class="text-sm font-semibold"
                                        :class="themeStore.isDark ? 'text-slate-200' : 'text-slate-700'">
                                        {{ $t(customer.assignedTo.name) }} {{ $t(customer.assignedTo.surname) }}
                                    </p>
                                </div>
                            </div>

                            <!-- Payment summary -->
                            <div class="pt-4 border-t"
                                :class="themeStore.isDark ? 'border-white/5' : 'border-slate-100'">
                                <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                                    {{ $t("To'lovlar") }}
                                </p>
                                <div class="rounded-xl px-4 py-3 flex items-center justify-between"
                                    :class="themeStore.isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'">
                                    <span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        {{ $t('Jami to\'langan') }}
                                    </span>
                                    <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {{ totalPaid.toLocaleString() }} {{ $t("so'm") }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment History -->
                <div class="rounded-3xl border shadow-sm overflow-hidden"
                    :class="themeStore.isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-slate-200'">
                    <div class="px-6 py-4 border-b flex items-center justify-between"
                        :class="themeStore.isDark ? 'border-white/5 bg-white/3' : 'border-slate-100 bg-slate-50'">
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {{ $t("To'lov Tarixi") }}
                        </p>
                        <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                            :class="themeStore.isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'">
                            {{ payments.length }} {{ $t('ta') }}
                        </span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr :class="themeStore.isDark ? 'border-b border-white/5' : 'border-b border-slate-100'">
                                    <th class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        {{ $t('Sana') }}
                                    </th>
                                    <th class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        {{ $t('Summa') }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y"
                                :class="themeStore.isDark ? 'divide-white/5' : 'divide-slate-100'">
                                <tr v-for="payment in payments" :key="payment.id"
                                    class="transition-colors"
                                    :class="themeStore.isDark ? 'hover:bg-white/3' : 'hover:bg-slate-50/80'">
                                    <td class="px-6 py-4 text-sm"
                                        :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-600'">
                                        {{ formatDate(payment.createdAt) }}
                                    </td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            {{ Number(payment.amount).toLocaleString() }} {{ $t("so'm") }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="payments.length === 0">
                                    <td colspan="2" class="px-6 py-16 text-center">
                                        <div class="flex flex-col items-center gap-3">
                                            <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                :class="themeStore.isDark ? 'bg-white/5' : 'bg-slate-100'">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    stroke-width="1.5" stroke="currentColor"
                                                    class="w-6 h-6 text-slate-400">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                                </svg>
                                            </div>
                                            <p class="text-sm text-slate-400 dark:text-slate-500">
                                                {{ $t("Hali hech qanday to'lov yo'q") }}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Checks -->
                <div class="rounded-3xl border shadow-sm overflow-hidden"
                    :class="themeStore.isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-slate-200'">
                    <div class="px-6 py-4 border-b flex items-center justify-between"
                        :class="themeStore.isDark ? 'border-white/5 bg-white/3' : 'border-slate-100 bg-slate-50'">
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {{ $t('Cheklar') }}
                        </p>
                        <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                            :class="themeStore.isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'">
                            {{ checks.length }} {{ $t('ta') }}
                        </span>
                    </div>

                    <div v-if="checks.length > 0" class="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div v-for="check in checks" :key="check.id"
                            @click="openCheck(check)"
                            class="group cursor-pointer rounded-2xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-0.5"
                            :class="themeStore.isDark
                                ? 'bg-white/5 border-white/8 hover:border-white/15'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'">
                            <div class="aspect-video flex items-center justify-center overflow-hidden"
                                :class="themeStore.isDark ? 'bg-white/3' : 'bg-slate-100'">
                                <img v-if="isImage(check.checkUrl)" :src="check.checkUrl"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    alt="Check" />
                                <div v-else-if="isPDF(check.checkUrl)"
                                    class="flex flex-col items-center justify-center gap-2">
                                    <span class="text-4xl">📕</span>
                                    <span class="text-xs font-medium text-slate-500 dark:text-slate-400">PDF</span>
                                </div>
                                <span v-else class="text-5xl opacity-50">📄</span>
                            </div>
                            <div class="p-3">
                                <p class="text-xs text-slate-500 dark:text-slate-400">
                                    {{ formatDate(check.createdAt) }}
                                </p>
                                <p class="text-xs font-medium mt-1.5 flex items-center gap-1" style="color:#1e3a5f;">
                                    {{ $t('Ochish') }}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="2" stroke="currentColor" class="w-3 h-3">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div v-else class="p-16 text-center">
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                                :class="themeStore.isDark ? 'bg-white/5' : 'bg-slate-100'">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-slate-400">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <p class="text-sm text-slate-400 dark:text-slate-500">
                                {{ $t('Bu mijoz uchun hali check yuklanmagan') }}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLangStore } from '@/stores/lang'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { ENDPOINTS, BASE_URL } from '@/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const langStore = useLangStore()

const customer = ref(null)
const payments = ref([])
const checks = ref([])
const loading = ref(false)
const statusSaving = ref(false)

const statusLabels = computed(() => ({
  NAVBATDA: langStore.t('Navbatda'),
//   YURISTDA: langStore.t('Yuristda'),
  KORIB_CHIQILDI: langStore.t("Ko'rib chiqildi"),
  JARAYONDA: langStore.t('Maslahat berildi'),
  YAKUNLANDI: langStore.t('Shartnoma tushuldi'),
//   BEKOR_QILINDI: langStore.t('Bekor qilindi'),
}))

const statusInlineColors = {
  NAVBATDA: { bg: '#dbeafe', color: '#1d4ed8' },
  YURISTDA: { bg: '#ede9fe', color: '#7c3aed' },
  KORIB_CHIQILDI: { bg: '#fef3c7', color: '#d97706' },
  JARAYONDA: { bg: '#ffedd5', color: '#ea580c' },
  YAKUNLANDI: { bg: '#d1fae5', color: '#059669' },
  BEKOR_QILINDI: { bg: '#fee2e2', color: '#dc2626' },
}

const changeStatus = async (newStatus) => {
  if (!customer.value || statusSaving.value) return
  statusSaving.value = true
  try {
    const { data } = await api.put(ENDPOINTS.CUSTOMER(customer.value.id), { status: newStatus })
    customer.value = { ...customer.value, status: data.status }
  } finally {
    statusSaving.value = false
  }
}

const totalPaid = computed(() =>
    payments.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
)

const fetchCustomerData = async () => {
    const id = route.params.id
    if (!id) return
    loading.value = true
    try {
        const [{ data: cust }, { data: ch }] = await Promise.all([
            api.get(ENDPOINTS.CUSTOMER(id)),
            api.get(`${ENDPOINTS.CUSTOMER(id)}/checks`),
        ])
        customer.value = cust
        payments.value = cust.payments || []
        checks.value = ch
    } catch (error) {
        console.error('Xatolik:', error)
        alert("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
        loading.value = false
    }
}

onMounted(fetchCustomerData)

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const isImage = (url) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
const isPDF = (url) => /\.pdf$/i.test(url)

const openCheck = (check) => {
    const filterUrl = (url) => {
        if (!url) return url
        return url.replace(/^\/*uploads\//i, '/').replace(/^uploads\//i, '/')
    }
    window.location.href = `${BASE_URL}/${filterUrl(check.check_url)}`
}

const goBack = () => router.push('/customers')
</script>

<script>
// InfoRow inline component
import { defineComponent, h } from 'vue'
import { useThemeStore } from '@/stores/theme'

export default defineComponent({
    components: {
        InfoRow: defineComponent({
            props: ['label', 'value', 'icon', 'highlight'],
            setup(props) {
                const themeStore = useThemeStore()
                const icons = {
                    user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
                    phone: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
                    location: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
                    money: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
                }
                return () => h('div', { class: 'flex flex-col gap-1' }, [
                    h('p', { class: 'text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider' }, props.label),
                    h('p', {
                        class: `text-sm font-semibold ${props.highlight
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : themeStore.isDark ? 'text-slate-200' : 'text-slate-700'}`
                    }, props.value || '-')
                ])
            }
        })
    }
})
</script>
