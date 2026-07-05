<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed, getCurrentInstance } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import api, { ENDPOINTS } from '@/api'
import { usePricesStore } from '@/stores/prices'
import { useHistoryBack } from '@/composables/useHistoryBack'

const pricesStore = usePricesStore()

import regions from "../../utils/regions.json"
import districts from "../../utils/districts.json"

const props = defineProps({ editing: Object })
const emit = defineEmits(['close', 'saved'])

useHistoryBack(() => true, () => emit('close'))

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
const source = ref('MUSTAQIL_MUROJAAT')
const telegram = ref('')
const appealType = ref('')
const paymentAmount = ref('')
const paymentType = ref('')
const price = ref('')
const showPriceMenu = ref(false)
const showPaymentMenu = ref(false)
const priceMenuAnchor = ref(null)

const formatMoney = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount)
}

const selectedRegion = ref(null)
const selectedDistrict = ref(null)

const error = ref('')
const success = ref('')
const users = ref([])
const submitted = ref(false)
const savedCustomerData = ref(null)

// Mijoz hujjatlari (ixtiyoriy, bir nechta fayl)
const documentFiles = ref([])
const documentsInputKey = ref(0)
const documentsInputRef = ref(null)

const handleDocumentFiles = (e) => {
  const newFiles = Array.from(e.target.files || [])
  documentFiles.value = [...documentFiles.value, ...newFiles]
  documentsInputKey.value++
}

const triggerDocumentsInput = () => {
  documentsInputRef.value?.click()
}

const removeDocumentFile = (index) => {
  documentFiles.value = documentFiles.value.filter((_, i) => i !== index)
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

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
  { value: 'MUSTAQIL_MUROJAAT', label: proxy.$t('Mustaqil murojaat qildi') },
  { value: 'INSTAGRAM', label: proxy.$t('Instagram') },
  { value: 'TELEGRAM', label: proxy.$t('Telegram') },
  { value: 'YOUTUBE', label: proxy.$t('YouTube') },
  { value: 'TANISHIDAN', label: proxy.$t('Tanishidan') },
  { value: 'TASHQI_REKLAMA', label: proxy.$t('Tashqi reklama orqali') },
  { value: 'AVVALGI_MIJOZ', label: proxy.$t('Avvalgi mijoz') },
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
    <b>Eslatma</b><br>
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

const handleClickOutside = (e) => {
  if (priceMenuAnchor.value && !priceMenuAnchor.value.contains(e.target)) {
    showPriceMenu.value = false
    showPaymentMenu.value = false
  }
}

onMounted(async () => {
  pricesStore.fetchPrices()
  document.addEventListener('click', handleClickOutside, true)
  try {
    const { data: all } = await api.get(ENDPOINTS.ALL_USERS)
    users.value = all.filter(u => u.role === 'YURIST')
  } catch (e) {
    console.error('Users yuklashda xatolik:', e)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
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
    source.value = 'MUSTAQIL_MUROJAAT'
    telegram.value = ''
    appealType.value = ''
    paymentAmount.value = ''
    paymentType.value = 'NAQD'
    price.value = ''
    error.value = ''
    success.value = ''
    savedCustomerData.value = null
    documentFiles.value = []
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
  submitted.value = false
  savedCustomerData.value = null
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

const buildFullAddress = () => {
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
  return fullAddress
}

const validate = () => {
  const emptyFields = []
  if (!name.value) emptyFields.push('Ism')
  if (!surname.value) emptyFields.push('Familiya')
  if (!father_name.value) emptyFields.push('Otasining ismi')
  if (!phone.value) emptyFields.push('Telefon raqam')
  if (!selectedRegion.value) emptyFields.push('Viloyat')
  if (!selectedDistrict.value) emptyFields.push('Tuman')
  if (!source.value) emptyFields.push("Qayerdan eshitib kelgan")
  if (!assignedToId.value) emptyFields.push("Mas'ul xodim")
  if (!paymentType.value) emptyFields.push("To'lov turi")
  if (!price.value) emptyFields.push('Narx')
  if (!telegram.value) emptyFields.push('Telegram')
  return emptyFields
}

const openPreviewWindow = (fullAddress) => {
  const fish = `${surname.value} ${name.value} ${father_name.value}`.trim()
  const today = new Date()
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`

  const yuristUser = users.value.find(u => u.id === assignedToId.value)
  const yuristName = yuristUser ? `${yuristUser.surname} ${yuristUser.name}` : '—'

  const paymentLabel = paymentType.value === 'NAQD' ? 'Naqd pul'
    : paymentType.value === 'KARTA' ? 'Plastik karta'
    : paymentType.value === 'ONLINE' ? "Online to'lov"
    : paymentType.value === 'NASIYA' ? 'Nasiya'
    : "Bank o'tkazmasi"

  const amountNum = paymentType.value === 'NASIYA' ? 0
    : (paymentAmount.value ? Number(String(paymentAmount.value).replace(/\./g, '')) : 0)

  sessionStorage.setItem('previewData', JSON.stringify({
    fish,
    formattedDate,
    yuristName,
    fullAddress,
    phone: phone.value,
    amountNum,
    paymentLabel,
    price: price.value,
  }))

  const pw = window.open('/preview', '_blank')
  return pw
}

const save = async () => {
  error.value = ''
  submitted.value = true
  const isEditing = !!props.editing?.id

  const emptyFields = validate()
  if (emptyFields.length > 0) {
    error.value = `Quyidagi maydonlar to'ldirilmagan: ${emptyFields.join(', ')}`
    return
  }

  if (!isEditing) {
    // Preview oynasini ochamiz
    const fullAddress = buildFullAddress()
    const previewWin = openPreviewWindow(fullAddress)

    // Preview sahifadan chaqiriladigan funksiya
    window.__doSaveAndPrint = async () => {
      const fullAddress2 = buildFullAddress()
      const data = {
        name: name.value,
        surname: surname.value,
        father_name: father_name.value || null,
        phone: phone.value,
        phone2: phone2.value || null,
        address: fullAddress2 || null,
        description: description.value || null,
        assignedToId: assignedToId.value || null,
        source: source.value || null,
        telegram: telegram.value || null,
        appealType: appealType.value || '',
        paymentAmount: paymentType.value === 'NASIYA' ? 0 : (paymentAmount.value ? Number(String(paymentAmount.value).replace(/\./g, '')) : null),
        paymentType: paymentType.value || null,
        price: price.value !== '' ? Number(price.value) : 0,
      }

      const result = await store.createCustomer(data)

      if (!result?.success) {
        error.value = result?.error || 'Xatolik yuz berdi'
        return null
      }

      success.value = 'Mijoz yaratildi!'
      const createdCustomer = result.customer
      const fish = `${surname.value} ${name.value} ${father_name.value}`.trim()

      // PDF chek yaratib backendga yuborish
      const pdfBlob = await generateReceiptPDF({
        fullName: fish,
        clientId: createdCustomer?.customer_id || '—',
        queueNumber: createdCustomer?.queueNumber || '—',
      })

      if (pdfBlob) {
        const formData = new FormData()
        formData.append('checkFile', pdfBlob, `chek-${surname.value || 'mijoz'}-${Date.now()}.pdf`)
        const newPayment = createdCustomer.payments?.[createdCustomer.payments?.length - 1]
        if (newPayment?.id) formData.append('paymentId', newPayment.id)
        try {
          await api.post(ENDPOINTS.CUSTOMER_CHECK(createdCustomer.id), formData)
        } catch (e) {
          console.error('❌ Chek yuklashda xato:', e)
        }
      }

      // Ixtiyoriy hujjatlarni yuklash (bir nechta fayl bo'lishi mumkin)
      if (documentFiles.value.length > 0) {
        const docsFormData = new FormData()
        documentFiles.value.forEach((file) => docsFormData.append('files', file))
        try {
          await api.post(ENDPOINTS.CUSTOMER_DOCUMENTS(createdCustomer.id), docsFormData)
        } catch (e) {
          console.error('❌ Hujjatlarni yuklashda xato:', e)
          success.value = `Mijoz yaratildi, lekin hujjatlar yuklanmadi: ${e?.response?.data?.message || 'Xatolik yuz berdi'}`
        }
      }

      const params = new URLSearchParams({
        fish,
        telefon: phone.value || '',
        manzil: fullAddress2 || '',
        id: `MJZ-${createdCustomer?.customer_id || ''}`,
        raqam: `A-${String(createdCustomer?.queueNumber).padStart(2, '0')}`,
        yurist: createdCustomer.assignedTo ? `${createdCustomer.assignedTo.surname} ${createdCustomer.assignedTo.name}` : '—',
        sana: Date.now().toString()
      })

      emit('saved')
      setTimeout(() => emit('close'), 1800)

      // Preview sahifaga print ma'lumotlarini qaytaramiz
      return {
        receiptData: {
          fullName: fish,
          clientId: createdCustomer?.customer_id || '—',
          queueNumber: createdCustomer?.queueNumber || '—',
        },
        qabulxatUrl: `/qabulxati.html?${params.toString()}`,
      }
    }
    return
  }

  // Tahrirlash rejimi — to'g'ridan backend
  const fullAddress = buildFullAddress()
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
    appealType: appealType.value || '',
    paymentAmount: paymentType.value === 'NASIYA' ? 0 : (paymentAmount.value ? Number(String(paymentAmount.value).replace(/\./g, '')) : null),
    paymentType: paymentType.value || null,
    price: price.value !== '' ? Number(price.value) : 0,
  }

  const result = await store.updateCustomer(props.editing.id, data)
  if (result?.success) {
    success.value = 'Mijoz yangilandi!'
    emit('saved')
    setTimeout(() => emit('close'), 1800)
  } else {
    error.value = result?.error || 'Xatolik yuz berdi'
  }
}

const printQabulxat = () => {
  if (savedCustomerData.value?.qabulxatUrl) {
    window.open(savedCustomerData.value.qabulxatUrl, '_blank')
  }
}

const phone2isTelegram = ref(false)

watch(phone2, (newVal) => {
  if (phone2isTelegram.value && newVal) {
    telegram.value = newVal
  }
})

watch(paymentType, (val) => {
  if (val === 'NASIYA') {
    paymentAmount.value = ''
  } else if (price.value) {
    paymentAmount.value = String(price.value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
})

const handlePhone2isTelegram = () => {
  if (phone2isTelegram.value && phone.value) {
    telegram.value = phone.value
  } else if (!phone2isTelegram.value) {
    telegram.value = ''
  }
}

const paymentOptions = ref([
  { value: 'NAQD', label: 'Naqd pul' },
  { value: 'KARTA', label: 'Plastik karta' },
  { value: 'ONLINE', label: "Online to'lov" },
  { value: 'BANK_TRANSFER', label: "Bank o'tkazmasi" },
  { value: 'NASIYA', label: 'Nasiya' },
])

// Eslatma — faqat shu ekranda qolib turadigan izoh (backendda maydon yo'q)
const note = ref('')

// Telegram shablon xabarlar — mijozga yuboriladigan tayyor matnlar
const telegramTemplates = ref([
  { id: 1, text: "Assalomu alaykum! Siz yuridik xizmatlar buyurtmasiga muvaffaqiyatli ro'yxatdan o'tdingiz. Navbatingiz tayinlandi. Tez orada mutaxassis siz bilan bog'lanadi.", selected: false },
  { id: 2, text: "Hurmatli mijoz! Sizning arizangiz qabul qilindi. Iltimos, navbatingizni kuting. Qo'shimcha ma'lumot uchun biz bilan bog'laning.", selected: false },
  { id: 3, text: "Xush kelibsiz! Sizning murojaatingiz ro'yxatga olindi. Mutaxassisimiz yaqin orada siz bilan aloqaga chiqadi. Rahmat.", selected: false },
])

const copiedTemplateId = ref(null)
const copyTemplate = (tmpl) => {
  navigator.clipboard?.writeText(tmpl.text)
  copiedTemplateId.value = tmpl.id
  setTimeout(() => {
    if (copiedTemplateId.value === tmpl.id) copiedTemplateId.value = null
  }, 1500)
}
</script>
<template>
  <div class="space-y-5">

    <!-- Sarlavha va info banner -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style="background:linear-gradient(135deg, var(--info), #7c5cf5);">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 8v6M22 11h-6" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold tracking-wide" style="color:var(--text-1);">
            {{ props.editing?.id ? $t('Mijozni tahrirlash') : $t("Yangi mijoz qo'shish") }}
          </h2>
          <p class="text-sm mt-0.5" style="color:var(--text-2);">{{ $t("Majburiy maydonlarni to'ldiring") }}</p>
        </div>
      </div>

<!-- Info banner clone -->
<div
  class="relative ml-auto flex h-16 flex-1 min-w-[600px] max-w-md items-center overflow-hidden rounded-[10px] border border-[#dfe3ff] bg-gradient-to-r from-white via-[#fbfbff] to-[#f2f3ff] px-6 shadow-[0_1px_3px_rgba(70,84,180,0.05),inset_0_0_0_1px_rgba(255,255,255,0.7)]"
>
  <div class="relative z-[5] flex items-center gap-4">
    <div
      class="flex h-7 w-7 min-w-7 items-center justify-center rounded-full border-2 border-[#4f67ff] bg-white font-serif text-[18px] font-bold leading-none text-[#4f67ff]"
    >
      i
    </div>

    <p class="whitespace-nowrap text-[14px] font-semibold tracking-[-0.1px] text-[#26345d]">
      {{ $t("Yulduzcha") }}
      <span class="font-bold text-[#f04438]">( * )</span>
      {{ $t("bilan belgilangan maydonlar majburiy.") }}
    </p>
  </div>

  <div class="pointer-events-none absolute right-0 top-0 z-[1] h-[78px] w-[185px]">
    <svg viewBox="0 0 185 78" xmlns="http://www.w3.org/2000/svg" class="block h-full w-full">
      <defs>
        <linearGradient id="mainCard" x1="73" y1="10" x2="162" y2="70">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="1" stop-color="#eef1ff" stop-opacity="0.85" />
        </linearGradient>

        <linearGradient id="plusGradient" x1="136" y1="52" x2="160" y2="76">
          <stop offset="0" stop-color="#7c8cff" />
          <stop offset="1" stop-color="#5067ff" />
        </linearGradient>

        <filter id="shadow" x="0" y="0" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#6676ff" flood-opacity="0.18" />
        </filter>

        <filter id="plusShadow" x="0" y="0" width="200%" height="200%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#4f67ff" flood-opacity="0.35" />
        </filter>
      </defs>

      <path
        d="M18 78C45 47 70 31 105 23C137 16 160 18 185 0V78H18Z"
        fill="#eef0ff"
        opacity="0.8"
      />

      <path
        d="M88 0C112 15 131 24 160 19C171 17 179 12 185 8V78H80Z"
        fill="#e8ebff"
        opacity="0.65"
      />

      <rect
        x="104"
        y="-14"
        width="72"
        height="92"
        rx="13"
        fill="#e4e7ff"
        opacity="0.72"
        transform="rotate(8 104 -14)"
      />

      <rect
        x="75"
        y="10"
        width="90"
        height="62"
        rx="10"
        fill="url(#mainCard)"
        stroke="#dfe3ff"
        stroke-width="1"
        filter="url(#shadow)"
        transform="rotate(7 75 10)"
      />

      <rect x="144" y="17" width="17" height="15" rx="4" fill="#6272f7" opacity="0.95" />

      <path
        d="M148 17V12.5C148 9 150 6.8 152.5 6.8C155 6.8 157 9 157 12.5V17"
        fill="none"
        stroke="#6272f7"
        stroke-width="3"
        stroke-linecap="round"
      />

      <circle cx="98" cy="35" r="6.5" fill="none" stroke="#6676ff" stroke-width="2.4" />

      <path
        d="M85.5 53C87.2 45.5 91.8 42 98 42C104.2 42 108.8 45.5 110.5 53"
        fill="none"
        stroke="#6676ff"
        stroke-width="2.4"
        stroke-linecap="round"
      />

      <rect x="119" y="32" width="27" height="3.2" rx="2" fill="#9da7ff" opacity="0.75" />
      <rect x="118" y="44" width="38" height="3.2" rx="2" fill="#9da7ff" opacity="0.65" />
      <rect x="91" y="60" width="49" height="3.2" rx="2" fill="#b4bcff" opacity="0.55" />

      <circle cx="148" cy="63" r="14" fill="url(#plusGradient)" filter="url(#plusShadow)" />

      <path
        d="M148 56.5V69.5M141.5 63H154.5"
        stroke="#ffffff"
        stroke-width="2.6"
        stroke-linecap="round"
      />
    </svg>
  </div>
</div>
    </div>

    <div v-if="success" class="p-3 rounded-xl text-xs"
      style="background:var(--success-bg); border:1px solid var(--success-border); color:var(--success);">
      {{ success }}</div>
    <div v-if="error" class="p-3 rounded-xl text-xs"
      style="background:var(--danger-bg); border:1px solid var(--danger-border); color:var(--danger);">
      {{ error }}</div>

    <!-- Asosiy 2 ustunli tarkib -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

      <!-- ══ Chap ustun ══ -->
      <div class="space-y-5 flex flex-col">

        <!-- 1. Shaxsiy ma'lumotlar -->
        <div class="card p-5 space-y-4">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style="background:var(--primary);">1</span>
            <h3 class="text-sm font-bold" style="color:var(--text-1);">{{ $t("Shaxsiy ma'lumotlar") }}</h3>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Ism -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !name ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">
                {{ $t('Ism') }}
                <span :class="name ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <input v-model="name" type="text" :placeholder="$t('Ism')"
                  :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1', submitted && !name ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']" />
              </div>
            </div>

            <!-- Familiya -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !surname ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                  $t('Familiya') }}
                <span :class="surname ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <input v-model="surname" type="text" :placeholder="$t('Familiya')"
                  :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1', submitted && !surname ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']" />
              </div>
            </div>
          </div>

          <!-- Otasining ismi -->
          <div class="space-y-1">
            <label
              :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !father_name ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                $t('Otasining ismi') }} <span :class="father_name ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <input v-model="father_name" type="text" :placeholder="$t('Otasining ismi')"
                :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1', submitted && !father_name ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Telefon -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !phone ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                  $t('Telefon') }}
                <span :class="phone ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input v-model="phone" @input="handlePhone($event, 1)" type="tel" placeholder="+998 XX XXX XX XX"
                  :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1', submitted && !phone ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']" />
              </div>
              <label class="flex items-center mt-1 gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="phone2isTelegram" @change="handlePhone2isTelegram"
                  class="w-4 h-4 accent-[var(--primary)]">
                <span class="text-[11px]" style="color:var(--text-3);">{{ $t('Bu raqamda Telegram bormi?') }}</span>
              </label>
            </div>

            <!-- Telegram -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !telegram ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                  $t('Telegram') }}
                <span :class="telegram ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[var(--info)]" viewBox="0 0 24 24"
                    fill="currentColor">
                    <path
                      d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </span>
                <input v-model="telegram" @input="handleInput()" type="text"
                  :placeholder="$t('@username yoki +998 XX XXX XX XX')"
                  :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1', submitted && !telegram ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']" />
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Manzil ma'lumotlari -->
        <div class="card p-5 space-y-4">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style="background:var(--primary);">2</span>
            <h3 class="text-sm font-bold" style="color:var(--text-1);">{{ $t("Manzil ma'lumotlari") }}</h3>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Viloyat -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !selectedRegion ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                  $t('Viloyat') }}
                <span :class="selectedRegion ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </span>
                <select v-model="selectedRegion"
                  :class="['w-full pl-9 pr-8 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1 cursor-pointer appearance-none', submitted && !selectedRegion ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']">
                  <option value="">{{ $t('— Viloyatni tanlang —') }}</option>
                  <option v-for="r in regions" :key="r.id" :value="r.id">{{ $t(r.name_uz) }}</option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--text-2);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            <!-- Tuman -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !selectedDistrict ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                  $t('Tuman / Shahar') }} <span :class="selectedDistrict ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <select v-model="selectedDistrict" :disabled="!selectedRegion"
                  :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1 cursor-pointer appearance-none', submitted && !selectedDistrict ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']">
                  <option value="">{{ $t('— Tuman tanlang —') }}</option>
                  <option v-for="d in filteredDistricts" :key="d.id" :value="d.id">{{ $t(d.name_uz) }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Manzil (ixtiyoriy) -->
          <div class="space-y-1">
            <label class="block text-[11px] font-medium uppercase tracking-wider" style="color:var(--text-2);">
              {{ $t('Manzil') }} <span class="normal-case font-normal" style="color:var(--text-3);">({{ $t('ixtiyoriy') }})</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </span>
              <input v-model="address" type="text" :placeholder="$t('Manzilni kiriting')"
                class="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
            </div>
          </div>
        </div>
      </div>

      <!-- ══ O'ng ustun ══ -->
      <div class="space-y-5 flex flex-col">

        <!-- 3. Qo'shimcha ma'lumotlar -->
        <div class="card p-5 space-y-4">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style="background:var(--primary);">3</span>
            <h3 class="text-sm font-bold" style="color:var(--text-1);">{{ $t("Qo'shimcha ma'lumotlar") }}</h3>
          </div>

          <!-- Manba -->
          <div class="space-y-1">
            <label
              :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !source ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                $t('Qayerdan eshitib keldi yoki kim yubordi') }} <span :class="source ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.33 0-6 1.79-6 4v2h12v-2c0-2.21-2.67-4-6-4z" />
                  <path d="M16.5 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm.35 1.98c-.11-.01-.22-.02-.35-.02-.9 0-1.75.15-2.53.42 1.24.85 2.03 2.02 2.03 3.42v2.2h5v-2c0-2.02-2.36-3.69-4.15-4.02z" />
                </svg>
              </span>
              <select v-model="source"
                :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1 cursor-pointer appearance-none', submitted && !source ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']">
                <option value="">{{ $t('— Tanlanmagan —') }}</option>
                <option v-for="s in sourceOptions" :key="s.value" :value="s.value">{{ $t(s.label) }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Mas'ul yurist -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !assignedToId ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                  $t("Qabul qiluvchi mutahasis") }} <span :class="assignedToId ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <select v-model="assignedToId"
                  :class="['w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-[var(--text-1)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:ring-1 cursor-pointer appearance-none', submitted && !assignedToId ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20']">
                  <option value="">{{ $t('— Belgilanmagan —') }}</option>
                  <option v-for="u in users" :key="u.id" :value="u.id">
                    {{ $t(u.surname) }} {{ $t(u.name) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Maslahat narxi -->
            <div class="space-y-1">
              <label
                :class="['block text-[11px] font-medium uppercase tracking-wider', submitted && !price ? 'text-[var(--danger)]' : 'text-[var(--text-2)]']">{{
                  $t("Maslaxat narxi") }} <span :class="price ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span></label>

              <div class="relative" ref="priceMenuAnchor">
                <div class="relative">
                  <div
                    @click="showPriceMenu = !showPriceMenu; showPaymentMenu = false"
                    :class="['w-full flex items-center justify-between gap-2 pl-9 pr-3 py-2 bg-gray-50 border rounded-lg text-sm cursor-pointer transition-all relative', submitted && !price ? 'border-[var(--danger)]' : 'border-[var(--border)] hover:border-[var(--primary)]', price ? 'text-[var(--text-1)]' : 'text-[var(--text-2)]']">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2M9.401 15c.52.598 1.488 1 2.599 1" />
                        <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                    <span class="truncate">{{ price ? formatMoney(price) + $t(" so'm") : $t("Narxni tanlang") }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[var(--text-2)] transition-transform ml-auto shrink-0" :class="showPriceMenu ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <!-- Narx dropdown -->
                  <Transition name="submenu-fade">
                    <div v-if="showPriceMenu"
                      class="absolute z-50 top-full mt-1 left-0 w-56 rounded-xl shadow-2xl border"
                      style="background:var(--bg-card); border-color:var(--border);">
                      <div class="px-3 py-2 border-b rounded-t-xl overflow-hidden"
                        style="border-color:var(--border-light);">
                        <p class="text-[10px] font-semibold uppercase tracking-wider"
                          style="color:var(--text-3);">
                          {{ $t("Narxni tanlang") }}
                        </p>
                      </div>
                      <div class="py-1" style="position: relative;">
                        <button type="button"
                          @click.stop="price = pricesStore.prices.price_one; paymentAmount = String(pricesStore.prices.price_one).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); showPaymentMenu = true"
                          class="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-all text-left"
                          :class="Number(price) === pricesStore.prices.price_one
                            ? 'pill-selected'
                            : 'text-[var(--text-1)] hover:bg-[var(--border-light)]'">
                          {{ formatMoney(pricesStore.prices.price_one) + $t(" so'm") }}
                          <svg v-if="Number(price) === pricesStore.prices.price_one" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button type="button"
                          @click.stop="price = pricesStore.prices.price_two; paymentAmount = String(pricesStore.prices.price_two).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); showPaymentMenu = true"
                          class="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-all text-left"
                          :class="Number(price) === pricesStore.prices.price_two
                            ? 'pill-selected'
                            : 'text-[var(--text-1)] hover:bg-[var(--border-light)]'">
                          {{ formatMoney(pricesStore.prices.price_two) + $t(" so'm") }}
                          <svg v-if="Number(price) === pricesStore.prices.price_two" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>

                        <!-- To'lov turi submenu -->
                        <Transition name="submenu-fade">
                          <div v-if="showPaymentMenu"
                            class="absolute z-50 top-full mt-1 left-0 w-56 rounded-xl shadow-2xl border overflow-hidden"
                            style="background:var(--bg-card); border-color:var(--border);">
                            <div class="px-3 py-2 border-b"
                              style="border-color:var(--border-light);">
                              <p class="text-[10px] font-semibold uppercase tracking-wider"
                                style="color:var(--text-3);">
                                {{ $t("To'lov turini tanlang") }}
                              </p>
                            </div>
                            <div class="py-1">
                              <button v-for="opt in paymentOptions" :key="opt.value"
                                type="button"
                                @click.stop="paymentType = opt.value; showPaymentMenu = false; showPriceMenu = false"
                                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left"
                                :class="paymentType === opt.value
                                  ? 'pill-selected'
                                  : 'text-[var(--text-1)] hover:bg-[var(--border-light)]'">
                                <span class="font-medium text-[13px]">{{ $t(opt.label) }}</span>
                                <svg v-if="paymentType === opt.value" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </Transition>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Tanlangan narx va to'lov turi ko'rsatkich -->
                <div v-if="price && paymentType && !showPriceMenu && !showPaymentMenu" class="mt-2 flex items-center gap-2 flex-wrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer"
                    style="background:var(--primary-light); color:var(--primary);"
                    @click="showPriceMenu = true">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ formatMoney(price) }} {{ $t("so'm") }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer"
                    style="background:var(--success-bg); color:var(--success);"
                    @click="showPaymentMenu = true">
                    {{ paymentType === 'NAQD' ? '💵' : paymentType === 'KARTA' ? '💳' : paymentType === 'ONLINE' ? '📱' : paymentType === 'NASIYA' ? '🤝' : '🏦' }}
                    {{ paymentType === 'NAQD' ? $t('Naqd pul') : paymentType === 'KARTA' ? $t('Plastik karta') : paymentType === 'ONLINE' ? $t("Online to'lov") : paymentType === 'NASIYA' ? $t('Nasiya') : $t("Bank o'tkazmasi") }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Murojaat ma'lumotlari -->
        <div class="card p-5 space-y-3 flex-1 flex flex-col">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style="background:var(--primary);">4</span>
            <h3 class="text-sm font-bold" style="color:var(--text-1);">{{ $t("Murojaat ma'lumotlari") }}</h3>
          </div>

          <div class="space-y-1 flex-1 flex flex-col">
            <label class="block text-[11px] font-medium uppercase tracking-wider" style="color:var(--text-2);">
              {{ $t('Murojaatning qisqacha mazmuni') }} <span :class="description ? 'text-[var(--success)]' : 'text-[var(--danger)]'">*</span>
            </label>
            <div class="relative flex-1 flex flex-col">
              <textarea v-model="description" maxlength="500" :placeholder="$t('Murojaatning qisqacha mazmunini yozing...')"
                class="w-full flex-1 min-h-[140px] px-3 py-2.5 bg-gray-50 border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-[var(--bg-card)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 resize-none"></textarea>
              <span class="absolute bottom-2 right-3 text-[10px]" style="color:var(--text-3);">{{ description.length }}/500</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Eslatma / Fayl ilova qilish -->
    <div class="grid grid-cols-1 lg:grid-cols-1 gap-5">
      <!-- Fayl ilova qilish (ixtiyoriy) -->
      <div v-if="!props.editing?.id" class="card p-5 space-y-2">
        <label class="block text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5" style="color:var(--text-2);">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:var(--info);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 10-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {{ $t('Fayl ilova qilish') }} <span class="normal-case font-normal" style="color:var(--text-3);">({{ $t('ixtiyoriy') }})</span>
        </label>

        <div class="flex items-center justify-between gap-3 px-4 py-4 bg-gray-50 border border-dashed rounded-lg cursor-pointer"
          style="border-color:var(--border);" @click="triggerDocumentsInput">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background:var(--info-bg); color:var(--info);">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 10-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium truncate" style="color:var(--text-1);">{{ $t("Fayllarni yuklang yoki sudrab olib keling") }}</p>
              <p class="text-[11px]" style="color:var(--text-3);">JPG, PNG, PDF, DOCX ({{ $t('maks.') }} 10MB)</p>
            </div>
          </div>
          <label class="btn btn-ghost btn-sm shrink-0 cursor-pointer flex items-center gap-1.5 whitespace-nowrap" @click.stop>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
            </svg>
            {{ $t('Fayl tanlash') }}
            <input ref="documentsInputRef" :key="documentsInputKey" type="file" multiple class="hidden"  @change="handleDocumentFiles" />
          </label>
        </div>

        <div v-if="documentFiles.length > 0" class="flex flex-wrap gap-2 mt-1">
          <div v-for="(file, idx) in documentFiles" :key="idx"
            class="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg text-xs"
            style="background:var(--info-bg); color:var(--info);">
            <span class="truncate max-w-[160px]">{{ file.name }}</span>
            <span style="color:var(--text-3);">{{ formatFileSize(file.size) }}</span>
            <button type="button" @click="removeDocumentFile(idx)"
              class="w-4 h-4 flex items-center justify-center rounded-full shrink-0"
              style="color:var(--danger);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Yaratilgan sana (tahrirlashda) -->
    <div v-if="props.editing?.id"
      class="flex items-center gap-2 px-4 py-2.5 rounded-lg" style="background:var(--border-light);">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:var(--text-2);" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-[11px]" style="color:var(--text-2);">{{ $t('Yaratilgan sana:') }}</span>
      <span class="text-[11px] font-medium" style="color:var(--text-1);">{{ formatDate(props.editing?.createdAt) }}</span>
    </div>

    <!-- Pastki tugmalar -->
    <div class="flex justify-end gap-3 flex-wrap pt-1">
      <button @click="$emit('close')" class="btn btn-ghost flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ $t('Bekor qilish') }}
      </button>

      <button @click="save" class="btn flex items-center gap-2 text-white"
        style="background:linear-gradient(135deg, var(--info), #7c5cf5);">
        {{ props.editing?.id ? $t('Saqlash') : $t('Yaratish') }}
        <svg v-if="!props.editing?.id" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m-3-3h6" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.submenu-fade-enter-active,
.submenu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.submenu-fade-enter-from,
.submenu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
