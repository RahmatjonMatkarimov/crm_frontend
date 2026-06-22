<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { usePricesStore } from '@/stores/prices'

const pricesStore = usePricesStore()

import regions from "../../utils/regions.json"
import districts from "../../utils/districts.json"

const props = defineProps({ editing: Object })
const emit = defineEmits(['close', 'saved'])

const store = useCustomersStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Form maydonlari
const name = ref('')
const surname = ref('')
const father_name = ref('')
const phone = ref('')
const phone2 = ref('')
const address = ref('')
const description = ref('')
const assignedToId = ref('')
const source = ref('')
const telegram = ref('')
const appealType = ref('')
const paymentAmount = ref('')
const paymentType = ref('NAQD')
const price = ref('')

const formatMoney = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount) + ' so\'m'
}

const selectedRegion = ref(null)
const selectedDistrict = ref(null)

const error = ref('')
const success = ref('')
const users = ref([])

const appealTypeOptions = [
  { value: 'NIKOH_AJRALISH', label: 'Nikoh / Ajralish' },
  { value: 'UY_JOY', label: 'Uy-joy masalasi' },
  { value: 'MEROS', label: 'Meros' },
  { value: 'BIZNES', label: 'Biznes / Shartnoma' },
  { value: 'JINOIY_ISH', label: 'Jinoiy ish' },
  { value: 'BOSHQA', label: 'Boshqa' },
]

const sourceOptions = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TANISHIDAN', label: 'Tanishidan' },
]

// Filtrlangan tumanlar
const filteredDistricts = computed(() => {
  if (!selectedRegion.value) return []
  return districts.filter(d => d.region_id === selectedRegion.value)
})

const printReceiptFrontend = () => {
  if (paymentType.value !== 'NAQD' || !paymentAmount.value) return

  const fullName = `${name.value} ${surname.value}`.trim()
  const amount = Number(paymentAmount.value).toLocaleString('uz-UZ')
  const currentDate = new Date().toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  // Chek oynasini ochish
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Chek</title>
      <style>
        @page {
          size: 80mm  auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          width: 80mm;
          margin: 0 auto;
          padding: 5mm;
          font-size: 12px;
          line-height: 1.4;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .title { font-size: 14px; margin: 8px 0; }
        .separator { border-top: 1px dashed #000; margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="center">
        <h2 class="title bold">YURIDIK MASLAHAT 24</h2>
        <p>Telefon: +998 XX XXX XX XX</p>
        <div class="separator"></div>
      </div>

      <p><strong>Mijoz:</strong> ${fullName}</p>
      <p><strong>Telefon:</strong> ${phone.value}</p>
      ${telegram.value ? `<p><strong>Telegram:</strong> ${telegram.value}</p>` : ''}
      
      <div class="separator"></div>

      <p><strong>Sana:</strong> ${currentDate}</p>
      <p><strong>To'lov turi:</strong> NAQD PUL</p>
      ${description.value ? `<p><strong>Izoh:</strong> ${description.value}</p>` : ''}

      <div class="separator"></div>

      <div class="center bold" style="font-size: 16px; margin: 12px 0;">
        ${amount} so'm
      </div>

      <div class="separator"></div>
      
      <p class="center">Rahmat! Yana murojaat qiling ❤️</p>
      <p class="center" style="font-size: 10px; margin-top: 15px;">
        Powered by Your Company
      </p>

      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 500);
          }, 300);
        }
      <\/script>
    </body>
    </html>
  `)

  printWindow.document.close()
}

const formatDate = (d) => d ? new Date(d).toLocaleString('uz-UZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}) : '—'

onMounted(async () => {
  pricesStore.fetchPrices()
  try {
    const res = await fetch('http://localhost:4000/api/auth/all-users', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (res.ok) {
      const all = await res.json()
      users.value = all.filter(u => u.role === 'YURIST')
    }
  } catch (e) {
    console.error('Users yuklashda xatolik:', e)
  }
})

// ==================== EDITING WATCH ====================
watch(() => props.editing, (val) => {
  // Yangi mijoz yaratish
  if (!val) {
    name.value = ''
    surname.value = ''
    father_name.value = ''
    phone.value = ''
    phone2.value = ''
    address.value = ''
    description.value = ''
    assignedToId.value = ''
    source.value = ''
    telegram.value = ''
    appealType.value = ''
    selectedRegion.value = null
    selectedDistrict.value = null
    paymentAmount.value = ''
    paymentType.value = 'NAQD'
    price.value = ''
    error.value = ''
    success.value = ''
    return
  }

  // Tahrirlash rejimi
  name.value = val.name || ''
  surname.value = val.surname || ''
  father_name.value = val.father_name || ''
  phone.value = val.phone || ''
  phone2.value = val.phone2 || ''
  description.value = val.description || ''
  assignedToId.value = val.assignedToId || val.assignedTo?.id || ''
  source.value = val.source || ''
  telegram.value = val.telegram || ''
  appealType.value = val.appealType || ''
  price.value = val.price || ''
  if (val.payments && val.payments.length > 0) {
    paymentAmount.value = val.payments[0].amount || ''
    paymentType.value = val.payments[0].type || 'NAQD'
  } else {
    paymentAmount.value = ''
    paymentType.value = 'NAQD'
  }

  // Reset
  selectedRegion.value = null
  selectedDistrict.value = null
  address.value = ''

  // Addressdan region va districtni ajratib olish
  if (val.address) {
    const parts = val.address.split(',').map(p => p.trim())

    const foundRegion = regions.find(r =>
      parts.some(part => part === r.name_uz || part.includes(r.name_uz))
    )

    if (foundRegion) {
      selectedRegion.value = foundRegion.id

      const foundDistrict = districts.find(d =>
        d.region_id === foundRegion.id &&
        parts.some(part => part === d.name_uz || part.includes(d.name_uz))
      )

      if (foundDistrict) {
        selectedDistrict.value = foundDistrict.id
      }
    }

    // Qo'shimcha manzil
    if (parts.length > 2) {
      address.value = parts.slice(2).join(', ')
    } else if (!foundRegion) {
      address.value = val.address
    }
  }

  error.value = ''
  success.value = ''
}, { immediate: true })

const handlePhone = (e, field) => {
  let v = e.target.value.replace(/\D/g, '')
  if (v.startsWith('998')) v = v.slice(3)
  v = v.slice(0, 9)
  let f = '+998'
  if (v.length > 0) f += ` ${v.slice(0, 2)}`
  if (v.length > 2) f += ` ${v.slice(2, 5)}`
  if (v.length > 5) f += ` ${v.slice(5, 7)}`
  if (v.length > 7) f += ` ${v.slice(7, 9)}`

  if (field === 1) phone.value = f
  else phone2.value = f
}

const handleInput = () => {
  let val = telegram.value

  if (!val) return

  // @ bo'lmasa birinchi belgini tekshiramiz
  const firstChar = val.replace(/^@/, '').charAt(0)

  // Harf bo'lsa
  if (/[a-zA-Z]/.test(firstChar)) {
    telegram.value = '@' + val.replace(/^@/, '')
    return
  }

  // Raqam bo'lsa
  let digits = val.replace(/\D/g, '')

  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }

  digits = digits.slice(0, 9)

  let formatted = '+998'

  if (digits.length > 0) {
    formatted += ' ' + digits.slice(0, 2)
  }
  if (digits.length > 2) {
    formatted += ' ' + digits.slice(2, 5)
  }
  if (digits.length > 5) {
    formatted += ' ' + digits.slice(5, 7)
  }
  if (digits.length > 7) {
    formatted += ' ' + digits.slice(7, 9)
  }

  telegram.value = formatted
}

const save = async () => {
  error.value = ''
  if (!name.value || !surname.value || !phone.value) {
    error.value = 'Ism, familiya va telefon majburiy'
    return
  }

  // To'liq manzilni birlashtirish
  let fullAddress = ''
  if (selectedRegion.value) {
    const region = regions.find(r => r.id === selectedRegion.value)
    if (region) fullAddress += region.name_uz
  }
  if (selectedDistrict.value) {
    const district = districts.find(d => d.id === selectedDistrict.value)
    if (fullAddress) fullAddress += ', '
    if (district) fullAddress += district.name_uz
  }
  if (address.value?.trim()) {
    if (fullAddress) fullAddress += ', '
    fullAddress += address.value.trim()
  }

  const data = {
    name: name.value,
    surname: surname.value,
    father_name: father_name.value || null,
    phone: phone.value,
    phone2: phone2.value || null,
    address: fullAddress || null,
    description: description.value || null,
    assignedToId: assignedToId.value || null,
    source: source.value || null,
    telegram: telegram.value || null,
    appealType: appealType.value || "",
    paymentAmount: paymentAmount.value !== '' ? Number(paymentAmount.value) : null,
    paymentType: paymentType.value || null,
    price: price.value !== '' ? Number(price.value) : 0,
  }

  const result = props.editing?.id
    ? await store.updateCustomer(props.editing.id, data)
    : await store.createCustomer(data)

  if (result?.success) {
    success.value = props.editing?.id ? 'Mijoz yangilandi!' : 'Mijoz yaratildi!'

    // NAQD bo'lsa chekni chop et
    if (paymentType.value === 'NAQD' && paymentAmount.value) {
      setTimeout(() => {
        printReceiptFrontend()
      }, 800) // biroz kutib turib chop etadi (success xabari ko'rinishi uchun)
    }

    emit('saved')
    setTimeout(() => emit('close'), 2000)
  } else {
    error.value = result?.error || 'Xatolik yuz berdi'
  }
}

const phone2isTelegram = ref(false)

watch(phone2, (newVal) => {
  if (phone2isTelegram.value && newVal) {
    telegram.value = newVal
  }
})

const handlePhone2isTelegram = () => {
  if (phone2isTelegram.value && phone2.value) {
    telegram.value = phone2.value
  } else if (!phone2isTelegram.value) {
    telegram.value = ''
  }
}

</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        <!-- Modal Header -->
        <div class="px-6 py-5 flex items-center justify-between"
          :style="{ background: themeStore.isDark ? 'linear-gradient(150deg, #0d1b3e 0%, #162766 55%, #1535c4 100%)' : 'linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%)' }">
          <div>
            <h2 class="text-white text-base font-semibold">
              {{ props.editing?.id ? 'Mijozni tahrirlash' : 'Yangi mijoz qo\'shish' }}
            </h2>
            <p class="text-white/50 text-xs mt-0.5">Majburiy maydonlarni to'ldiring</p>
          </div>
          <button @click="$emit('close')"
            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl leading-none">✕</button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="success"
            class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs">
            {{ success }}</div>
          <div v-if="error"
            class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-xs">
            {{ error }}</div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Ism -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ism
                <span class="text-red-500">*</span></label>
              <input v-model="name" type="text" placeholder="Ismni kiriting"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
            </div>

            <!-- Familiya -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Familiya
                <span class="text-red-500">*</span></label>
              <input v-model="surname" type="text" placeholder="Familiyani kiriting"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
            </div>

            <!-- Otasining ismi -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Otasining
                ismi <span class="text-red-500">*</span></label>
              <input v-model="father_name" type="text" placeholder="Otasining ismi"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
            </div>

            <!-- Telefon -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telefon
                <span class="text-red-500">*</span></label>
              <input v-model="phone" @input="handlePhone($event, 1)" type="tel" placeholder="+998 XX XXX XX XX"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
            </div>

            <!-- Qo'shimcha telefon -->
            <div class="space-y-1">
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Qo'shimcha telefon
              </label>

              
              <input v-model="phone2" @input="handlePhone($event, 2)" type="tel" placeholder="+998 XX XXX XX XX"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
              <label class="flex items-center mt-1 gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="phone2isTelegram" @change="handlePhone2isTelegram"
                  class="w-4 h-4 accent-blue-600">
                <span class="text-slate-600 dark:text-slate-400">Bu raqamda telegram bormi?</span>
              </label>
            </div>


            <!-- Telegram -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telegram
                <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-400" viewBox="0 0 24 24"
                    fill="currentColor">
                    <path
                      d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </span>
                <input v-model="telegram" @input="handleInput()" type="text"
                  placeholder="@username yoki +998 XX XXX XX XX"
                  class="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
              </div>
            </div>

            <!-- Viloyat -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Viloyat
                <span class="text-red-500">*</span></label>
              <select v-model="selectedRegion"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 cursor-pointer appearance-none">
                <option value="">— Viloyatni tanlang —</option>
                <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name_uz }}</option>
              </select>
            </div>

            <!-- Tuman -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tuman
                / Shahar <span class="text-red-500">*</span></label>
              <select v-model="selectedDistrict" :disabled="!selectedRegion"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 cursor-pointer appearance-none">
                <option value="">— Tuman tanlang —</option>
                <option v-for="d in filteredDistricts" :key="d.id" :value="d.id">{{ d.name_uz }}</option>
              </select>
            </div>

            <!-- 
            <div class="sm:col-span-2 space-y-1">
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qo'shimcha manzil (ko'cha, mahalla, uy va h.k.)</label>
              <input v-model="address" type="text" placeholder="Ko'cha, mahalla, uy raqami, qo'shimcha ma'lumot"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
            </div> -->

            <!-- Manba -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qayerdan
                eshitib kelgan <span class="text-red-500">*</span></label>
              <select v-model="source"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 cursor-pointer appearance-none">
                <option value="">— Tanlanmagan —</option>
                <option v-for="s in sourceOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>

            <!-- Mas'ul yurist -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mas'ul
                yurist <span class="text-red-500">*</span></label>
              <select v-model="assignedToId"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 cursor-pointer appearance-none">
                <option value="">— Belgilanmagan —</option>
                <option v-for="u in users" :key="u.id" :value="u.id">
                  {{ u.surname }} {{ u.name }}
                </option>
              </select>
            </div>

            <!-- To'lov summasi -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">To'lov
                summasi (so'mda) <span class="text-red-500">*</span></label>
              <input v-model="paymentAmount" type="number" placeholder="Masalan: 500000"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
            </div>

            <!-- To'lov turi -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">To'lov
                turi <span class="text-red-500">*</span></label>
              <select v-model="paymentType"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 cursor-pointer appearance-none">
                <option value="NAQD">Naqd pul</option>
                <option value="KARTA">Plastik karta</option>
                <option value="PUL_OTKAZISH">Pul o'tkazish</option>
              </select>
            </div>

            <!-- Shartnoma summasi -->
            <div class="sm:col-span-2 space-y-2">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shartnoma
                summasi (so'mda) <span class="text-red-500">*</span></label>

              <!-- Quick Select Buttons -->
              <div class="grid grid-cols-3 gap-2">
                <button type="button" @click="price = pricesStore.prices.price_one"
                  :class="Number(price) === pricesStore.prices.price_one ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'"
                  class="px-3 py-2 border rounded-lg text-[10px] font-medium hover:border-blue-500 transition-all cursor-pointer">
                  {{ formatMoney(pricesStore.prices.price_one) }}
                </button>
                <button type="button" @click="price = pricesStore.prices.price_two"
                  :class="Number(price) === pricesStore.prices.price_two ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'"
                  class="px-3 py-2 border rounded-lg text-[10px] font-medium hover:border-blue-500 transition-all cursor-pointer">
                  {{ formatMoney(pricesStore.prices.price_two) }}
                </button>
                <button type="button" @click="price = pricesStore.prices.price_three"
                  :class="Number(price) === pricesStore.prices.price_three ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'"
                  class="px-3 py-2 border rounded-lg text-[10px] font-medium hover:border-blue-500 transition-all cursor-pointer">
                  {{ formatMoney(pricesStore.prices.price_three) }}
                </button>
              </div>

              <!-- Manual Input -->
              <input v-model="price" type="number" placeholder="Boshqa summa kiriting"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
            </div>

            <!-- Izoh -->
            <div class="sm:col-span-2 space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Murojaatning
                qisqacha mazmuni <span class="text-red-500">*</span></label>
              <textarea v-model="description" rows="3" placeholder="Murojaatning qisqacha mazmuni..."
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 resize-none"></textarea>
            </div>

            <!-- Yaratilgan sana -->
            <div v-if="props.editing?.id"
              class="sm:col-span-2 flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Yaratilgan sana:</span>
              <span class="text-[11px] font-medium text-slate-700 dark:text-slate-300">{{
                formatDate(props.editing?.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
          <button @click="$emit('close')"
            class="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm">Bekor
            qilish</button>
          <button @click="save" class="btn-primary px-5 py-2.5 rounded-lg text-white text-sm">
            {{ props.editing?.id ? 'Saqlash' : 'Yaratish' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.btn-primary {
  background: linear-gradient(135deg, #1a3fd2, #2439f0);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2439f0, #1a2e7a);
}
</style>