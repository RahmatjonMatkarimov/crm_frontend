<script setup>
import { ref, watch, onMounted, computed, getCurrentInstance } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import api, { ENDPOINTS } from '@/api'
import { usePricesStore } from '@/stores/prices'

const pricesStore = usePricesStore()

import regions from "../../utils/regions.json"
import districts from "../../utils/districts.json"

const props = defineProps({ editing: Object })
const emit = defineEmits(['close', 'saved'])

const { proxy } = getCurrentInstance()
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
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount)
}

const selectedRegion = ref(null)
const selectedDistrict = ref(null)

const error = ref('')
const success = ref('')
const users = ref([])

const handleInputPrice = (e) => {
  const rawValue = e.target.value.replace(/\D/g, '')
  paymentAmount.value = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const formatNumberWithDots = (number) => {
  if (!number || isNaN(number)) return "0";
  return Number(number).toLocaleString("uz-UZ", { minimumFractionDigits: 0 }).replace(/,/g, ".");
};
function numberToUzbekWords(n) {
  const ones = [
    '',
    'bir',
    'ikki',
    'uch',
    "to'rt",
    'besh',
    'olti',
    'yetti',
    'sakkiz',
    "to'qqiz",
  ];
  const tens = [
    '',
    "o'n",
    'yigirma',
    "o'ttiz",
    'qirq',
    'ellik',
    'oltmish',
    'yetmish',
    'sakson',
    "to'qson",
  ];
  const hundreds = [
    '',
    'bir yuz',
    'ikki yuz',
    'uch yuz',
    "to'rt yuz",
    'besh yuz',
    'olti yuz',
    'yetti yuz',
    'sakkiz yuz',
    "to'qqiz yuz",
  ];

  if (typeof n !== 'number' || isNaN(n)) return "Noto'g'ri qiymat";
  if (n === 0) return 'nol';
  if (n < 0) return 'manfiy ' + numberToUzbekWords(-n);
  if (n > 999_999_999_999) return 'Milliardgacha son kiriting.';

  const getThreeDigitWords = (num) => {
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;

    let parts = [];
    if (h > 0) parts.push(hundreds[h]);
    if (t > 0 || o > 0) parts.push(tens[t] + (o > 0 ? ' ' + ones[o] : ''));
    return parts.join(' ').trim();
  };

  let result = '';

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const rest = n % 1_000;

  if (billions > 0) result += getThreeDigitWords(billions) + ' milliard ';
  if (millions > 0) result += getThreeDigitWords(millions) + ' million ';
  if (thousands > 0) result += getThreeDigitWords(thousands) + ' ming ';
  if (rest > 0) result += getThreeDigitWords(rest);

  return result.trim();
}

const appealTypeOptions = computed(() => [
  { value: 'NIKOH_AJRALISH', label: proxy.$t('Nikoh / Ajralish') },
  { value: 'UY_JOY', label: proxy.$t('Uy-joy masalasi') },
  { value: 'MEROS', label: proxy.$t('Meros') },
  { value: 'BIZNES', label: proxy.$t('Biznes / Shartnoma') },
  { value: 'JINOIY_ISH', label: proxy.$t('Jinoiy ish') },
  { value: 'BOSHQA', label: proxy.$t('Boshqa') },
])

const sourceOptions = computed(() => [
  { value: 'INSTAGRAM', label: proxy.$t('Instagram') },
  { value: 'TELEGRAM', label: proxy.$t('Telegram') },
  { value: 'YOUTUBE', label: proxy.$t('YouTube') },
  { value: 'TANISHIDAN', label: proxy.$t('Tanishidan') },
])

// Filtrlangan tumanlar
const filteredDistricts = computed(() => {
  if (!selectedRegion.value) return []
  return districts.filter(d => d.region_id === selectedRegion.value)
})

import html2pdf from 'html2pdf.js'

const generateReceiptPDF = async (data) => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}.${month}.${year}`;

  const receiptHTML = `
      <!DOCTYPE html>
    <html>
    <head>
      <title>Chek</title>
<style>
  @page {
    size: 80mm 200mm;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  body {
    width: 80mm;
    margin: 0;
    padding-right: 5mm;
    padding-left: 5mm;
    padding-top: 10mm;
    
    font-family: "Courier New", monospace;
    color: #000;
    font-size: 12px;
  }

  .center {
    text-align: center;
  }

  .company {
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .subtitle {
    font-size: 11px;
    margin-bottom: 10px;
  }

  .divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
  }

  .info {
    width: 100%;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
  }

  .label {
    font-weight: bold;
  }

  .client-name {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    margin: 10px 0;
    word-break: break-word;
  }

  .queue-box {
    border: 2px solid #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5mm;
    justify-content: center;
    text-align: center;
  }

  .queue-number {
    font-size: 42px;
    font-weight: bold;
    line-height: 1;
  }

  .queue-text {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 5mm;
  }

  .notice {
    text-align: center;
    font-size: 11px;
    margin-top: 10px;
    margin-bottom: 10px;
    line-height: 1.5;
  }

  .footer {
    text-align: center;
    margin-top: 12px;
    padding-bottom: 10mm;
    font-size: 10px;
  }
</style>
    </head>

<body>

  <div class="center">
    <div class="company">
      Yuridik Xizmatlar va Hujjatlar Tayyorlash Byurosi
    </div>

    <div class="subtitle">
      QABUL CHEKI
    </div>
  </div>

  <div class="divider"></div>

  <div class="info">
    <div class="info-row">
      <span class="label">Sana:</span>
      <span>${formattedDate}</span>
    </div>

    <div class="info-row">
      <span class="label">ID:</span>
      <span>${'MJZ-' + data.clientId}</span>
    </div>
  </div>

  <div class="divider"></div>

  <div class="center">
    <div class="label">MIJOZ</div>

    <div class="client-name">
      ${data.fullName}
    </div>
  </div>

  <div class="divider"></div>

  <div class="queue-box">
    <div class="queue-number">
      A-${String(data.queueNumber).padStart(2, '0')}
    </div>

    <div class="queue-text">
      NAVBAT RAQAMI
    </div>
  </div>

  <div class="divider"></div>

  <div class="notice">
    <b>{{ $t('Eslatma') }}</b><br>
    Ushbu chekni saqlab qo'ying.<br>
    Navbatni tekshirish uchun ID raqamdan foydalaning.
  </div>

  <div class="divider"></div>

  <div class="footer">
    Amal qilish muddati: 7 ish kuni
    <br><br>
    Tashrifingiz uchun rahmat!
  </div>

</body>
    </html>

  `;


  const element = document.createElement('div');
  element.innerHTML = receiptHTML;

  const options = {
    margin: [2, 2, 2, 2],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' }
  };

  try {
    const pdfBlob = await html2pdf()
      .from(element)
      .set(options)
      .outputPdf('blob');

    console.log('✅ PDF muvaffaqiyatli yaratildi! Size:', pdfBlob.size, 'bytes');
    return pdfBlob;
  } catch (error) {
    console.error('❌ PDF yaratishda xatolik:', error);
    return null;
  }
};
const printReceiptFrontend = (data, qabulxatiUrl = null, w = null) => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}.${month}.${year}`;
  if (!w) w = window.open('about:blank', '_blank');

  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Chek</title>
<style>
  @page {
    size: 80mm auto;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  body {
    width: 80mm;
    margin: 0;
    padding-right: 5mm;
    padding-left: 5mm;
    padding-top: 10mm;
    
    font-family: "Courier New", monospace;
    color: #000;
    font-size: 12px;
  }

  .center {
    text-align: center;
  }

  .company {
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .subtitle {
    font-size: 11px;
    margin-bottom: 10px;
  }

  .divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
  }

  .info {
    width: 100%;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
  }

  .label {
    font-weight: bold;
  }

  .client-name {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    margin: 10px 0;
    word-break: break-word;
  }

  .queue-box {
    border: 2px solid #000;
    text-align: center;
    padding: 10px 0;
    margin: 10px 0;
  }

  .queue-number {
    font-size: 42px;
    font-weight: bold;
    line-height: 1;
  }

  .queue-text {
    font-size: 12px;
    margin-top: 5px;
    font-weight: bold;
  }

  .notice {
    text-align: center;
    font-size: 11px;
    margin-top: 10px;
    line-height: 1.5;
  }

  .footer {
    text-align: center;
    margin-top: 12px;
    font-size: 10px;
  }
</style>
    </head>

<body>

  <div class="center">
    <div class="company">
Yuridik Xizmatlar va Hujjatlar Tayyorlash Byurosi
    </div>

    <div class="subtitle">
      QABUL CHEKI
    </div>
  </div>

  <div class="divider"></div>

  <div class="info">
    <div class="info-row">
      <span class="label">Sana:</span>
      <span>${formattedDate}</span>
    </div>

    <div class="info-row">
      <span class="label">ID:</span>
      <span>MJZ-${data.clientId}</span>
    </div>
  </div>

  <div class="divider"></div>

  <div class="center">
    <div class="label">MIJOZ</div>

    <div class="client-name">
      ${data.fullName}
    </div>
  </div>

  <div class="divider"></div>

  <div class="queue-box">
    <div class="queue-number">
      A-${String(data.queueNumber).padStart(2, '0')}
    </div>

    <div class="queue-text">
      NAVBAT RAQAMI
    </div>
  </div>

  <div class="divider"></div>

  <div class="notice">
    <b>{{ $t('Eslatma') }}</b><br>
    Ushbu chekni saqlab qo'ying.<br>
    Navbatni tekshirish uchun ID raqamdan foydalaning.
  </div>

  <div class="divider"></div>

  <div class="footer">
    <br><br>
    Tashrifingiz uchun rahmat!
  </div>

</body>
    </html>
  `);

  w.document.close();

  setTimeout(() => {
    w.focus();
    w.onafterprint = () => {
      if (qabulxatiUrl) {
        w.location.href = qabulxatiUrl
      } else {
        w.close()
      }
    };
    w.print();
  }, 400);
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
    const { data: all } = await api.get(ENDPOINTS.ALL_USERS)
    users.value = all.filter(u => u.role === 'YURIST')
  } catch (e) {
    console.error('Users yuklashda xatolik:', e)
  }
})

// ==================== EDITING WATCH ====================
watch(() => props.editing, (val) => {
  if (!val) {
    // Yangi mijoz yaratish
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
    paymentAmount.value = ''
    paymentType.value = 'NAQD'
    price.value = ''
    error.value = ''
    success.value = ''
    return
  }

  // === TAHRIRLASH REJIMI ===
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

  // 🔴 ASOSIY O'ZGARTIRISH
  if (val.payments && val.payments.length > 0) {
    const lastPayment = 0
    paymentAmount.value = lastPayment.amount || ''   // Oxirgi to'lovni yuklaymiz
    paymentType.value = lastPayment.type || 'NAQD'
  } else {
    paymentAmount.value = ''
    paymentType.value = 'NAQD'
  }

  // Address qismi (o'zgartirmasangiz ham bo'ladi)
  selectedRegion.value = null
  selectedDistrict.value = null
  address.value = ''
  if (val.address) {
    const parts = val.address.split(',').map(p => p.trim())
    const foundRegion = regions.find(r => parts.some(part => part === r.name_uz || part.includes(r.name_uz)))
    if (foundRegion) {
      selectedRegion.value = foundRegion.id
      const foundDistrict = districts.find(d => d.region_id === foundRegion.id &&
        parts.some(part => part === d.name_uz || part.includes(d.name_uz)))
      if (foundDistrict) selectedDistrict.value = foundDistrict.id
    }
    if (parts.length > 2) {
      address.value = parts.slice(2).join(', ')
    } else if (!foundRegion) {
      address.value = val.address
    }
  }

  error.value = ''
  success.value = ''
}, { immediate: true })
const autoCapFirst = (fieldRef) => {
  if (fieldRef.value && fieldRef.value[0] !== fieldRef.value[0].toUpperCase()) {
    fieldRef.value = fieldRef.value.charAt(0).toUpperCase() + fieldRef.value.slice(1)
  }
}

watch(name, () => autoCapFirst(name))
watch(surname, () => autoCapFirst(surname))
watch(father_name, () => autoCapFirst(father_name))

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
  const isEditing = !!props.editing?.id
  price.value = pricesStore.prices.price_one
  const emptyFields = []
  if (!name.value) emptyFields.push('Ism')
  if (!surname.value) emptyFields.push('Familiya')
  if (!father_name.value) emptyFields.push('Otasining ismi')
  if (!phone.value) emptyFields.push('Telefon raqam')
  if (!selectedRegion.value) emptyFields.push('Viloyat')
  if (!selectedDistrict.value) emptyFields.push('Tuman')
  if (!source.value) emptyFields.push('Manba')
  if (!assignedToId.value) emptyFields.push('Mas\'ul xodim')
  if (!paymentAmount.value) emptyFields.push('To\'lov miqdori')
  if (!paymentType.value) emptyFields.push('To\'lov turi')
  if (!price.value) emptyFields.push('Narx')
  if (!telegram.value) emptyFields.push('Telegram')
  if (emptyFields.length > 0) {
    error.value = `Quyidagi maydonlar to\'ldirilmagan: ${emptyFields.join(', ')}`
    return
  }


  if (!isEditing && price.value !== Number(String(paymentAmount.value).replace(/\./g, ''))) {
    error.value = 'To\'liq to\'lov amalga oshirilishi kerak'
    return
  }

  // Popup brauzer tomonidan bloklanmasligi uchun user gesture paytida ochib qo'yamiz
  const isNewCash = !props.editing?.id && paymentAmount.value && paymentType.value === 'NAQD'
  let popupWindow = null
  if (isNewCash) {
    popupWindow = window.open('about:blank', '_blank')
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
    paymentAmount: paymentAmount.value ? Number(String(paymentAmount.value).replace(/\./g, '')) : null,
    paymentType: paymentType.value || null,
    // price: price.value !== '' ? Number(price.value) : 0,
    price: pricesStore.prices.price_one
  }

  const result = props.editing?.id
    ? await store.updateCustomer(props.editing.id, data)
    : await store.createCustomer(data)

  if (result?.success) {
    success.value = props.editing?.id ? 'Mijoz yangilandi!' : 'Mijoz yaratildi!'

    // Yangi mijoz yaratilganda va naqd to'lov bo'lsa — PDF yaratib backendga saqlaymiz
    const isNewCustomerWithCashPayment = !props.editing?.id &&
      paymentAmount.value
    if (isNewCustomerWithCashPayment) {
      const customerData = result.customer || result
      const createdCustomer = result.customer || result

      const pdfBlob = await generateReceiptPDF({
        fullName: `${surname.value} ${name.value} ${father_name.value}`,
        clientId: createdCustomer?.customer_id || '—',
        queueNumber: createdCustomer?.queueNumber || '—',
      })

      if (pdfBlob) {
        const formData = new FormData()
        formData.append('checkFile', pdfBlob, `chek-${surname.value || 'mijoz'}-${Date.now()}.pdf`)

        const newPayment = customerData.payments?.[customerData.payments?.length - 1]
        if (newPayment?.id) {
          formData.append('paymentId', newPayment.id)
        }

        const res = await api.post(ENDPOINTS.CUSTOMER_CHECK(customerData.id), formData)

        if (res.status === 200 || res.status === 201) {
          const fish = `${surname.value} ${name.value} ${father_name.value}`.trim()
          const params = new URLSearchParams({
            fish,
            telefon: phone.value || '',
            manzil: fullAddress || '',
            id: `MJZ-${createdCustomer?.customer_id || ''}`,
            raqam: `A-${String(createdCustomer?.queueNumber).padStart(2, '0')}` || '',
            yurist: createdCustomer.assignedTo ? `${createdCustomer.assignedTo.surname} ${createdCustomer.assignedTo.name}` : '—',
            sana: Date.now().toString()
          })
          printReceiptFrontend({
            fullName: fish,
            clientId: createdCustomer?.customer_id || '—',
            queueNumber: createdCustomer?.queueNumber || '—',
          }, `/qabulxati.html?${params.toString()}`, popupWindow)
        } else {
          console.error('❌ Chek saqlanmadi:', res.status)
          if (popupWindow) popupWindow.close()
        }
      }
    }

    emit('saved')
    setTimeout(() => emit('close'), 1800)
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
    <Transition name="modal-fade">
    <div class="fixed inset-0 z-50 flex flex-col"
      :style="themeStore.isDark ? 'background:#1f2937;' : 'background:#ffffff;'">

        <!-- Modal Header -->
        <div class="px-6 py-5 flex items-center justify-between shrink-0" style="background:#1e3a5f;">
          <div>
            <h2 class="text-white text-base font-bold">
              {{ props.editing?.id ? $t('Mijozni tahrirlash') : $t("Yangi mijoz qo'shish") }}
            </h2>
            <p class="text-sm mt-0.5" style="color:rgba(255,255,255,0.55);">{{ $t("Majburiy maydonlarni to'ldiring") }}</p>
          </div>
          <button @click="$emit('close')"
            class="w-8 h-8 rounded flex items-center justify-center text-white transition-all"
            style="background:rgba(255,255,255,0.12);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
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
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Ism') }}
                <span class="text-red-500">*</span></label>
              <input v-model="name" type="text" :placeholder="$t('Ismni kiriting')"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
            </div>

            <!-- Familiya -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Familiya') }}
                <span class="text-red-500">*</span></label>
              <input v-model="surname" type="text" :placeholder="$t('Familiyani kiriting')"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
            </div>

            <!-- Otasining ismi -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Otasining ismi') }} <span class="text-red-500">*</span></label>
              <input v-model="father_name" type="text" :placeholder="$t('Otasining ismi')"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
            </div>

            <!-- Telefon -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Telefon') }}
                <span class="text-red-500">*</span></label>
              <input v-model="phone" @input="handlePhone($event, 1)" type="tel" placeholder="+998 XX XXX XX XX"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
            </div>

            <!-- Qo'shimcha telefon -->
            <div class="space-y-1">
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ $t("Qo'shimcha telefon") }}
              </label>


              <input v-model="phone2" @input="handlePhone($event, 2)" type="tel" placeholder="+998 XX XXX XX XX"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
              <label class="flex items-center mt-1 gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="phone2isTelegram" @change="handlePhone2isTelegram"
                  class="w-4 h-4 accent-blue-600">
                <span class="text-slate-600 dark:text-slate-400">{{ $t('Bu raqamda Telegram bormi?') }}</span>
              </label>
            </div>


            <!-- Telegram -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Telegram') }}
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
                  :placeholder="$t('@username yoki +998 XX XXX XX XX')"
                  class="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
              </div>
            </div>

            <!-- Viloyat -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Viloyat') }}
                <span class="text-red-500">*</span></label>
              <select v-model="selectedRegion"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 cursor-pointer appearance-none">
                <option value="">{{ $t('— Viloyatni tanlang —') }}</option>
                <option v-for="r in regions" :key="r.id" :value="r.id">{{ $t(r.name_uz) }}</option>
              </select>
            </div>

            <!-- Tuman -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Tuman / Shahar') }} <span class="text-red-500">*</span></label>
              <select v-model="selectedDistrict" :disabled="!selectedRegion"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 cursor-pointer appearance-none">
                <option value="">{{ $t('— Tuman tanlang —') }}</option>
                <option v-for="d in filteredDistricts" :key="d.id" :value="d.id">{{ $t(d.name_uz) }}</option>
              </select>
            </div>

            <!-- 
            <div class="sm:col-span-2 space-y-1">
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qo'shimcha manzil (ko'cha, mahalla, uy va h.k.)</label>
              <input v-model="address" type="text" :placeholder="$t(\"Ko'cha, mahalla, uy raqami, qo'shimcha ma'lumot\")"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
            </div> -->

            <!-- Manba -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Qayerdan eshitib kelgan') }} <span class="text-red-500">*</span></label>
              <select v-model="source"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 cursor-pointer appearance-none">
                <option value="">{{ $t('— Tanlanmagan —') }}</option>
                <option v-for="s in sourceOptions" :key="s.value" :value="s.value">{{ $t(s.label) }}</option>
              </select>
            </div>

            <!-- Mas'ul yurist -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t("Mas'ul yurist") }} <span class="text-red-500">*</span></label>
              <select v-model="assignedToId"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 cursor-pointer appearance-none">
                <option value="">{{ $t('— Belgilanmagan —') }}</option>
                <option v-for="u in users" :key="u.id" :value="u.id">
                  {{ $t(u.surname) }} {{ $t(u.name) }}
                </option>
              </select>
            </div>

            <!-- To'lov summasi -->
            <div class="space-y-1">
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ props.editing?.id ? $t("Qarzni to'lash summasi (so'mda)") : $t("To'lov summasi (so'mda)") }}
                <span v-if="!props.editing?.id" class="text-red-500">*</span>
              </label>
              <input v-model="paymentAmount" @input="handleInputPrice" type="string"
                :placeholder="$t('Masalan: 500000')"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20" />
            </div>

            <!-- To'lov turi -->
            <div class="space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t("To'lov turi") }} <span class="text-red-500">*</span></label>
              <select v-model="paymentType"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 cursor-pointer appearance-none">
                <option value="NAQD">{{ $t('Naqd pul') }}</option>
                <option value="KARTA">{{ $t('Plastik karta') }}</option>
                <option value="ONLINE">{{ $t("Online to'lov") }}</option>
                <option value="BANK_TRANSFER">{{ $t("Bank o'tkazmasi") }}</option>
              </select>
            </div>

            <!-- <div class="sm:col-span-2 space-y-2">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t("Shartnoma summasi (so'mda)") }} <span class="text-red-500">*</span></label>

              <div class="grid grid-cols-3 gap-2">
                <button type="button" @click="price = pricesStore.prices.price_one"
                  :class="Number(price) === pricesStore.prices.price_one ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'"
                  class="px-3 py-2 border rounded-lg text-[10px] font-medium hover:border-[#1e3a5f] transition-all cursor-pointer">
                  {{ formatMoney(pricesStore.prices.price_one) + $t(' so\'m') }}
                </button>
                <button type="button" @click="price = pricesStore.prices.price_two"
                  :class="Number(price) === pricesStore.prices.price_two ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'"
                  class="px-3 py-2 border rounded-lg text-[10px] font-medium hover:border-[#1e3a5f] transition-all cursor-pointer">
                  {{ formatMoney(pricesStore.prices.price_two) + $t(' so\'m') }}
                </button>
                <button type="button" @click="price = pricesStore.prices.price_three"
                  :class="Number(price) === pricesStore.prices.price_three ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'"
                  class="px-3 py-2 border rounded-lg text-[10px] font-medium hover:border-[#1e3a5f] transition-all cursor-pointer">
                  {{ formatMoney(pricesStore.prices.price_three) + $t(' so\'m') }}
                </button>
              </div>
            </div> -->

            <!-- Izoh -->
            <div class="sm:col-span-2 space-y-1">
              <label
                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                  $t('Murojaatning qisqacha mazmuni') }}</label>
              <textarea v-model="description" rows="3" :placeholder="$t('Murojaatning qisqacha mazmuni...')"
                class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 resize-none"></textarea>
            </div>

            <!-- Yaratilgan sana -->
            <div v-if="props.editing?.id"
              class="sm:col-span-2 flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">{{ $t('Yaratilgan sana:') }}</span>
              <span class="text-[11px] font-medium text-slate-700 dark:text-slate-300">{{
                formatDate(props.editing?.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 flex justify-end gap-3 shrink-0"
          :style="themeStore.isDark ? 'border-top:1px solid #374151; background:#111827;' : 'border-top:1px solid #eaecf0; background:#f7f8fa;'">
          <button @click="$emit('close')"
            class="px-5 py-2 rounded text-sm font-medium transition-all"
            :style="themeStore.isDark ? 'color:#9ca3af;' : 'color:#4a5568;'">
            {{ $t('Bekor qilish') }}
          </button>
          <button @click="save" class="px-5 py-2 rounded text-white text-sm font-semibold active:scale-[0.97] transition-all" style="background:#1e3a5f;">
            {{ props.editing?.id ? $t('Saqlash') : $t('Yaratish') }}
          </button>
        </div>
    </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.22s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active > *, .modal-fade-leave-active > * {
  transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease;
}
.modal-fade-enter-from > *, .modal-fade-leave-to > * {
  transform: scale(0.96) translateY(10px);
  opacity: 0;
}
</style>
