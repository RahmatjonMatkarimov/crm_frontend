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

import html2pdf from 'html2pdf.js'
import { useRouter } from 'vue-router'
// const generateReceiptPDF = async (customer, paymentAmount) => {
//   console.log('🚀 generateReceiptPDF chaqirildi');
//   console.log('Customer:', customer?.surname, customer?.name);
//   console.log('Payment Amount:', paymentAmount);

//   if (!customer) {
//     console.error("❌ Mijoz ma'lumotlari yo'q");
//     return null;
//   }

//   if (!paymentAmount || paymentAmount <= 0) {
//     console.error("❌ Payment amount noto'g'ri:", paymentAmount);
//     return null;
//   }

//   const today = new Date();
//   const day = String(today.getDate()).padStart(2, '0');
//   const month = String(today.getMonth() + 1).padStart(2, '0');
//   const year = today.getFullYear();
//   const formattedDate = `${day}.${month}.${year}`;

//   const receiptHTML = `
//      <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Chek</title>
//     </head>
//     <body>
//       <table style="border: 1px solid black; height:80px; width:100%; border-collapse: collapse;">
//         <tr>
//             <td rowspan="8" style="text-align: center; color: black; border: 1px solid black;"><div style="display: flex; justify-content: center; align-items: center;"><img src="/telegram-cloud.jpg"  width="150px" alt=""></div></td>
//             <td rowspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">Markaziy korxona manzili</td>
//             <td rowspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">Xorazm viloyati, Xiva shaxar, <br> Yangi-hayot mahallasi, Sportchilar ko'chasi 14-uy</td>
//             <td rowspan="5" style="width: 70px; text-align: center; color: black; padding-bottom:10px; border: 1px solid black;"></td>
//         </tr>
//         <tr>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; padding-bottom:10px;font-size:10px;">Shartnoma raqami</td>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; padding-bottom:10px;font-size:10px; ">№${1 || 'Mavjud emas'}</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; padding-bottom:10px;font-size:10px; ">To'lov maqsadi</td>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; padding-bottom:10px;font-size:10px; ">Konsalting xizmat</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; padding-bottom:10px;font-size:10px; ">Shartnomani umumiy bahosi</td>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; padding-bottom:10px;font-size:10px; ">${formatNumberWithDots(customer.price)} so'm</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; height:15px;font-size:10px; padding-bottom:10px; ">Joriy to'lov</td>
//           <td colspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;height:15px;font-size:10px; padding-bottom:10px; ">${formatNumberWithDots(paymentAmount)} so'm</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">Qoldiq qarzdorlik</td>
//           <td colspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">${customer.price - (customer.payments.reduce((a, b) => a + b.amount, 0) + paymentAmount) <= 0 ? "To'landi" : formatNumberWithDots(customer.price - (customer.payments.reduce((a, b) => a + b.amount, 0) + paymentAmount)) + " so'm"}</td>
//         </tr>
//         <tr>
//             <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">Joriy to'lov qilingan sana</td>
//             <td colspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">${formattedDate}</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">To'lovchining F.I.O.:</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">${customer.name} ${customer.surname} ${customer.father_name}</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">Xiva Shaxar</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">STIR 307675491      MFO: 01037</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">To'lovni qabul qiluvchi korxona</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black;font-size:10px; padding-bottom:10px;  border: 1px solid black;">"YURIST KONSUL KONSALTING" X/k</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; padding-bottom:10px; ">TO'LOV SUMMASI SO"Z BILAN</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black;font-size:10px;  text-transform: uppercase; border: 1px solid black; padding-bottom:10px; ">${numberToUzbekWords(+paymentAmount)} so'm</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; font-size:10px;  border: 1px solid black; padding-bottom:10px; ">Texnik yordam: +998 62 226 99 00</td>
//             <td colspan="3" style="width: 110px; text-align: center; color: black;font-size:10px;  border: 1px solid black; padding-bottom:10px; ">ushbu to'lov ARIZASUD.UZ tizimi orqali amalga oshirilgan</td>
//         </tr>
//         <tr>
//             <td colspan="4" style="width: 100px; text-align: center; color: black;font-size:9px; padding-bottom:10px; text-transform: uppercase; border: 1px solid black;">To'lov pattasi faqatgina kassa muhri bilan tasdiqlangandan so'ng haqiqiy hisoblanadi. Agar pattada muhr bo'lmasa, u rasmiy kuchga ega emas va yaroqsiz deb topiladi. Shu sababli, har qanday to'lov hujjatining muhrlanganligiga e'tibor berish lozim.</td>
//         </tr>
//     </table>
//       <script>
//         window.onload = () => {
//           setTimeout(() => {
//             window.print();
//             setTimeout(() => window.close(), 500);
//           }, 300);
//         }
//       <\/script>
//     </body>
//     </html>
//   `;

//   console.log('📄 HTML tayyorlandi (length:', receiptHTML.length, ')');

//   const element = document.createElement('div');
//   element.innerHTML = receiptHTML;

//   const options = {
//     margin: [1, 1, 1, 1],
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { scale: 2, useCORS: true },
//     jsPDF: { unit: 'mm', format: [100, 250], orientation: 'landscape' }
//   };

//   try {
//     console.log('🔄 html2pdf ishga tushmoqda...');
//     const pdfBlob = await html2pdf()
//       .from(element)
//       .set(options)
//       .outputPdf('blob');

//     console.log('✅ PDF muvaffaqiyatli yaratildi! Size:', pdfBlob.size, 'bytes');
//     return pdfBlob;
//   } catch (error) {
//     console.error('❌ PDF yaratish xatosi:', error);
//     return null;
//   }
// };
// const printReceiptFrontend = async (customer) => {
//   if (paymentType.value !== 'NAQD' || !paymentAmount.value) return

//   const today = new Date();
//   const day = String(today.getDate()).padStart(2, '0');
//   const month = String(today.getMonth() + 1).padStart(2, '0');
//   const year = today.getFullYear();
//   const formattedDate = `${day}.${month}.${year}`;
//   // Chek oynasini ochish
//   const printWindow = window.open('', '_blank')
//   printWindow.document.write(`
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Chek</title>
//     </head>
//     <body>
//       <table style="border: 1px solid black; height:80px; width:100%; border-collapse: collapse;">
//         <tr>
//             <td rowspan="8" style="text-align: center; color: black; border: 1px solid black;"><img src="/telegram-cloud.jpg" width="150px" alt=""></td>
//             <td rowspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; vertical-align: middle;">Markaziy korxona manzili</td>
//             <td rowspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; vertical-align: middle;">Xorazm viloyati, Xiva shaxar, <br> Yangi-hayot mahallasi, Sportchilar ko'chasi 14-uy</td>
//             <td rowspan="5" style="width: 70px; text-align: center; color: black; border: 1px solid black;"></td>
//         </tr>
//         <tr>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px;">Shartnoma raqami</td>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">№${1 || 'Mavjud emas'}</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">To'lov maqsadi</td>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">Konsalting xizmat</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">Shartnomani umumiy bahosi</td>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">${formatNumberWithDots(customer.price)} so'm</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black; height:15px;font-size:10px; ">Joriy to'lov</td>
//           <td colspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;height:15px;font-size:10px; ">${formatNumberWithDots(paymentAmount.value)} so'm</td>
//         </tr>
//         <tr>
//           <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">Qoldiq qarzdorlik</td>
//           <td colspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">${customer.price - (customer.payments.reduce((a, b) => a + b.amount, 0) + paymentAmount.value) <= 0 ? "To'landi" : formatNumberWithDots(customer.price - (customer.payments.reduce((a, b) => a + b.amount, 0) + paymentAmount.value)) + " so'm"}</td>
//         </tr>
//         <tr>
//             <td style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">Joriy to'lov qilingan sana</td>
//             <td colspan="2" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">${formattedDate}</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">To'lovchining F.I.O.:</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">${customer.name} ${customer.surname} ${customer.father_name}</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">Xiva Shaxar</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">STIR 307675491      MFO: 01037</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">To'lovni qabul qiluvchi korxona</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black;font-size:10px;  border: 1px solid black;">"YURIST KONSUL KONSALTING" X/k</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; border: 1px solid black;font-size:10px; ">TO'LOV SUMMASI SO"Z BILAN</td>
//             <td colspan="3" style="width: 100px; text-align: center; color: black;font-size:10px;  text-transform: uppercase; border: 1px solid black;">${numberToUzbekWords(+paymentAmount.value)} so'm</td>
//         </tr>
//         <tr>
//             <td style="width: 80px; text-align: center; color: black; font-size:10px;  border: 1px solid black;">Texnik yordam: +998 62 226 99 00</td>
//             <td colspan="3" style="width: 110px; text-align: center; color: black;font-size:10px;  border: 1px solid black;">ushbu to'lov ARIZASUD.UZ tizimi orqali amalga oshirilgan</td>
//         </tr>
//         <tr>
//             <td colspan="4" style="width: 100px; text-align: center; color: black;font-size:9px;  text-transform: uppercase; border: 1px solid black;">To'lov pattasi faqatgina kassa muhri bilan tasdiqlangandan so'ng haqiqiy hisoblanadi. Agar pattada muhr bo'lmasa, u rasmiy kuchga ega emas va yaroqsiz deb topiladi. Shu sababli, har qanday to'lov hujjatining muhrlanganligiga e'tibor berish lozim.</td>
//         </tr>
//     </table>
//       <script>
//         window.onload = () => {
//           setTimeout(() => {
//             window.print();
//             setTimeout(() => window.close(), 500);
//           }, 300);
//         }
//       <\/script>
//     </body>
//     </html>
//   `)

//   printWindow.document.close()
// }

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return store.customers.filter(c => {
    const matchField = (val) => {
      if (!val) return false
      const v = val.toLowerCase()
      const vKirill = translateText(v).toLowerCase()
      return v.includes(q) || vKirill.includes(q)
    }
    const matchesSearch = !q ||
      matchField(c.name) ||
      matchField(c.surname) ||
      c.phone?.includes(q) ||
      matchField(c.address)

    if (!matchesSearch) return false

    if (filterTab.value === 'debtors') {
      const paid = c.payments?.[c.payments?.length - 1]?.amount
      return (c.price || 0) - paid > 0
    }

    return true
  })
})

const debtorsCount = computed(() => {
  return store.customers.filter(c => {
    const paid = c.payments?.[c.payments?.length - 1]?.amount
    return (c.price || 0) - paid > 0
  }).length
})

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

// const payDebt = async (customer) => {
//   console.log('💰 payDebt boshlandi - Customer ID:', customer?.id);

//   if (!paymentAmount.value || Number(paymentAmount.value) <= 0) {
//     alert("To'lov summasini kiriting!");
//     return;
//   }

//   const data = {
//     paymentAmount: Number(paymentAmount.value),
//     paymentType: paymentType.value || 'NAQD',
//   };

//   const result = await store.updateCustomer(customer.id, data);

//   if (result.success) {
//     const newPayment = result.customer?.payments?.[result.customer.payments?.length - 1];
//     console.log('🆕 Yangi payment:', newPayment);

//     // PDF yaratish
//     const pdfBlob = await generateReceiptPDF(customer, Number(paymentAmount.value));

//     if (pdfBlob && newPayment?.id) {
//       console.log('📤 Backendga PDF yuborilmoqda...');

//       const formData = new FormData();
//       formData.append('checkFile', pdfBlob, `chek-${customer.surname || 'mijoz'}-${Date.now()}.pdf`);
//       formData.append('paymentId', newPayment.id);

//       // ✅ TOKEN BILAN YUBORISH
//       const res = await fetch(`http://localhost:4000/api/customers/${customer.id}/check`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${useAuthStore().token}`
//         },
//         body: formData
//       });

//       console.log('Backend javobi status:', res.status);

//       if (res.ok) {
//         console.log('✅ Chek backendga muvaffaqiyatli saqlandi!');
//         const checkResult = await res.json();
//         console.log('Check result:', checkResult);
//       } else {
//         const errorText = await res.text();
//         console.error('❌ Backend xatosi:', res.status, errorText);
//         alert(`Chek saqlanmadi! Xato: ${res.status}`);
//       }
//     }

//     // Chop etish (eski usul)
//     // await printReceiptFrontend(customer);

//     paymentAmount.value = 0;
//     showDebtModal.value = false;
//     await store.fetchCustomers();
//   } else {
//     alert('Xatolik: ' + (result.error || 'Noma'lum xato'));
//   }
// };


const allChecked = computed(() =>
  filtered.value.length > 0 && filtered.value.every(c => selected.value.includes(c.id))
)
const indeterminate = computed(() => selected.value.length > 0 && !allChecked.value)

const toggleAll = () => {
  if (allChecked.value) {
    selected.value = selected.value.filter(id => !filtered.value.find(c => c.id === id))
  } else {
    selected.value = [...new Set([...selected.value, ...filtered.value.map(c => c.id)])]
  }
}

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
  if (!confirm(`"${c.surname} ${c.name}" ni arxivga o'tkazmoqchimisiz?`)) return
  await store.archiveCustomer(c.id)
  selected.value = selected.value.filter(x => x !== c.id)
}

const archiveSelected = async () => {
  if (!selected.value.length) return
  if (!confirm(`${selected.value.length} ta mijozni arxivga o'tkazmoqchimisiz?`)) return
  for (const id of selected.value) await store.archiveCustomer(id)
  selected.value = []
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ') : '—'

const sourceLabels = {
  INSTAGRAM: 'Instagram',
  TELEGRAM: 'Telegram',
  YOUTUBE: 'YouTube',
  TANISHIDAN: 'Tanishidan'
}

const sourceColors = {
  INSTAGRAM: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  TELEGRAM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  YOUTUBE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  TANISHIDAN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const paymentTypeLabels = computed(() => ({
  NAQD: proxy.$t('Naqd pul'),
  KARTA: proxy.$t('Plastik karta'),
  PUL_OTKAZISH: proxy.$t("Pul o'tkazish"),
}))
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
        <h1 class="text-2xl font-bold text-[#0a1850] dark:text-white">{{ $t('Mijozlar') }}</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{{ $t('Faol mijozlar') }} — {{ $t('jami') }} {{ store.customers.length }} {{ $t('ta') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openPricesModal" v-if="authStore.permission.add_customers"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 active:scale-[0.98] transition-all cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-4 h-4 text-slate-500">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          {{ $t('Narx sozlamalari') }}
        </button>
        <button @click="openCreate" v-if="authStore.permission.add_customers"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium btn-primary shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {{ $t('Yangi mijoz') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div
      class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl border border-indigo-100 dark:border-slate-700/60 p-4">
      <div class="relative">
        <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input v-model="search" type="text" :placeholder="$t('Ism, familiya, telefon yoki manzil...')"
          class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all" />
      </div>
    </div>

    <!-- Bulk bar -->
    <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="selected.length > 0"
        class="flex items-center justify-between px-5 py-3 bg-indigo-100 dark:bg-blue-900/40 border border-indigo-200 dark:border-blue-700/40 rounded-2xl shadow-lg">
        <span class="text-indigo-700 dark:text-blue-200 text-sm font-medium">{{ selected.length }} {{ $t('ta tanlandi') }}</span>
        <div class="flex gap-2">
          <button @click="selected = []"
            class="px-4 py-1.5 rounded-lg text-sm text-indigo-600 dark:text-blue-300 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-200/60 dark:hover:bg-white/10 transition-colors">{{ $t('Bekor qilish') }}</button>
          <button @click="archiveSelected"
            class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {{ $t("Arxivga o'tkazish") }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Table -->
    <div
      class="bg-white dark:bg-slate-800/60 dark:backdrop-blur rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700/60 overflow-hidden">
      <div v-if="store.loading" class="p-12 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
        <div
          class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin">
        </div>
        {{ $t('Yuklanmoqda...') }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[680px]">
          <thead>
            <tr class="border-b border-indigo-100 dark:border-slate-700/60 bg-indigo-50/60 dark:bg-slate-700/30">
              <th class="px-4 py-3.5 w-10" v-if="authStore.permission.delete_customers" @click.stop>
                <AppCheckbox :checked="allChecked" :indeterminate="indeterminate" @change="toggleAll" />
              </th>
              <th
                class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('Mijoz') }}</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('Telefon') }}</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('Telegram') }}</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('Qayerdan') }}</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('Manzil') }}</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t("Mas'ul yurist") }}</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t("To'lov") }}</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('Sana') }}</th>
              <th class="px-4 py-3.5 text-center text-[11px] font-semibold text-indigo-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('Amallar') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-indigo-100/70 dark:divide-slate-700/50">
            <tr v-for="c in filtered" :key="c.id"
              :class="selected.includes(c.id) ? 'bg-indigo-50 dark:bg-blue-900/10' : 'hover:bg-indigo-50/60 dark:hover:bg-slate-700/20'"
              class="transition-colors group cursor-pointer" @click="openCustomer(c.id)">
              <td class="px-4 py-3.5 cursor-default" v-if="authStore.permission.delete_customers" @click.stop>
                <AppCheckbox :checked="selected.includes(c.id)" @change="toggleOne(c.id)" class="cursor-pointer"/>
              </td>
              <td class="px-4 py-3.5">
                <p class="font-medium text-slate-800 dark:text-slate-100 text-sm">{{ $t(c.surname) }} {{ $t(c.name) }} {{
                  $t(c.father_name) }}</p>
              </td>
              <td class="px-4 min-w-[160px] py-3.5 text-sm text-slate-600 dark:text-slate-400">
                <p>{{ c.phone }}</p>
                <p v-if="c.phone2" class="text-xs text-slate-400 dark:text-slate-500">{{ c.phone2 }}</p>
              </td>
              <td class="px-4 py-3.5 min-w-[160px] text-sm text-slate-500 dark:text-slate-400">
                <a v-if="c.telegram && c.telegram.startsWith('@')" :href="`https://t.me/${c.telegram.slice(1)}`"
                  target="_blank" class="text-blue-500 hover:underline">{{ c.telegram }}</a>
                <span v-else-if="c.telegram">{{ c.telegram }}</span>
                <span v-else class="text-slate-400 dark:text-slate-500">—</span>
              </td>
              <td class="px-4 py-3.5">
                <span v-if="c.source"
                  :class="['text-[11px] font-medium px-2 py-0.5 rounded-full', sourceColors[c.source]]">{{
                    $t(sourceLabels[c.source]) }}</span>
                <span v-else class="text-sm text-slate-400 dark:text-slate-500">—</span>
              </td>
              <td class="px-4 max-w-[200px] py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ $t(c.address) || '' }}
              </td>
              <td class="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                {{ c.assignedTo ? `${$t(c.assignedTo.surname)} ${$t(c.assignedTo.name)}` : '' }}
              </td>
              <td class="px-4 min-w-[200px] py-3.5 text-sm">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ $t('Maslahat narxi') }}:</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200">{{ formatMoney(c.price) }}</span>
                  </div>

                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ $t('To\'landi') }}:</span>
                    <span class="font-medium text-emerald-600 dark:text-emerald-400">
                      {{ formatMoney(c.payments.reduce((a, b) => a + b.amount, 0)) }}
                    </span>
                  </div>
                  <span v-if="c.payments && c.payments.length > 0"
                    class="text-[10px] w-[60px] text-slate-400 dark:text-slate-500">
                    ({{ $t(paymentTypeLabels[c.payments[c.payments.length - 1].type] || c.payments[c.payments.length - 1].type) }})
                  </span>

                  <!-- <div v-if="(c.price || 0) - (c.payments.reduce((a, b) => a + b.amount, 0)) > 0"
                    class="flex items-center gap-1.5 mt-1">
                    <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">Qarz:</span>
                    <span class="font-bold text-red-600 dark:text-red-400">
                      {{ formatMoney(c.price - c.payments.reduce((a, b) => a + b.amount, 0))}}
                    </span>
                  </div> -->
                  <!-- <div v-else-if="c.price > 0" class="flex items-center gap-1.5 mt-1">
                    <span
                      class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-semibold">To'liq
                      to'langan</span>
                  </div> -->
                </div>
              </td>
              <td class="px-4 py-3.5 text-sm min-w-[120px] text-slate-400 dark:text-slate-500">{{
                formatDate(c.createdAt) }}</td>
              <td class="px-4 py-3.5 cursor-default" @click.stop
                v-if="authStore.permission.edit_customers || authStore.permission.delete_customers">
                <div
                  class="hidden items-center justify-center gap-1 opacity-0 group-hover:opacity-100 group-hover:flex transition-opacity">
                  <button @click="openEdit(c)" v-if="authStore.permission.edit_customers"
                    class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                    title="Tahrirlash">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" />
                    </svg>
                  </button>
                  <button @click="archive(c)" v-if="authStore.permission.delete_customers"
                    class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    title="Arxivga o'tkazish">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                </div>
                <!-- Table ichidagi tugma (har bir qator uchun) -->
                <!-- <button
                  @click.stop="showDebtModal = true; editingCustomer = c; price = c.payments[c.payments?.length - 1].amount"
                  v-if="(c.price || 0) - (c.payments[c.payments?.length - 1].amount || 0) > 0"
                  class="px-4 py-2 mt-1 text-sm font-medium rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white transition-all active:scale-[0.97] shadow-sm hover:shadow flex items-center gap-1.5">
                  To'lash
                </button> -->
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="10" class="px-6 py-14 text-center">
                <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p class="text-sm">{{ $t('Mijoz topilmadi') }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <CustomerModal v-if="showModal" :editing="editing" @close="showModal = false" @saved="store.fetchCustomers()" />

  <!-- Global Prices Settings Modal -->
  <Teleport to="body">
    <div v-if="showPricesModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showPricesModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div class="px-6 py-5 flex items-center justify-between"
          :style="{ background: themeStore.isDark ? 'linear-gradient(150deg, #0d1b3e 0%, #162766 55%, #1535c4 100%)' : 'linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%)' }">
          <div>
            <h2 class="text-white text-base font-semibold">{{ $t("Xizmat narxlarini o'zgartirish") }}</h2>
            <p class="text-white/50 text-xs mt-0.5">{{ $t("Narxlarni o'zgartiring") }}</p>
          </div>
          <button @click="showPricesModal = false"
            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl leading-none">✕</button>
        </div>

        <div class="p-6 space-y-4 flex-1">
          <div class="space-y-1">
            <label
              class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('1-narx (so\'mda)') }}</label>
            <input v-model="editingPriceOne" type="number"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a]" />
          </div>
          <div class="space-y-1">
            <label
              class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{$t('2-narx (so\'mda)') }}</label>
            <input v-model="editingPriceTwo" type="number"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a]" />
          </div>
          <div class="space-y-1">
            <label
              class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('3-narx (so\'mda)') }}</label>
            <input v-model="editingPriceThree" type="number"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a]" />
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
          <button @click="showPricesModal = false"
            class="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm cursor-pointer">{{ $t('Bekor qilish') }}</button>
          <button @click="savePrices"
            class="btn-primary px-5 py-2.5 rounded-lg text-white text-sm cursor-pointer">{{ $t('Saqlash') }}</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Debt Payment Modal -->
  <Teleport to="body">
    <div v-if="showDebtModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showDebtModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

        <!-- Header (Prices modal bilan bir xil gradient) -->
        <div class="px-6 py-5 flex items-center justify-between"
          :style="{ background: themeStore.isDark ? 'linear-gradient(150deg, #0d1b3e 0%, #162766 55%, #1535c4 100%)' : 'linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%)' }">
          <div>
            <h3 class="text-white text-lg font-semibold">{{ $t("Qarzni to'lash") }}</h3>
            <p class="text-white/70 text-sm mt-0.5">
              {{ editingCustomer?.surname }} {{ editingCustomer?.name }}
            </p>
          </div>
          <button @click="showDebtModal = false"
            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl leading-none transition-colors">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-slate-400">{{ $t('Jami shartnoma summasi') }}:</span>
              <span class="font-semibold">{{ formatMoney(editingCustomer?.price) }}</span>
            </div>
            <div class="flex justify-between text-sm mt-2">
              <span class="text-slate-500 dark:text-slate-400">{{ $t("To'langan") }}:</span>
              <span class="font-medium text-emerald-600 dark:text-emerald-400">
                {{ formatMoney(editingCustomer?.payments.reduce((a, b) => a + b.amount, 0)) }}
              </span>
            </div>
            <div class="h-px bg-slate-200 dark:bg-slate-700 my-3"></div>
            <div class="flex justify-between text-base font-semibold">
              <span class="text-slate-600 dark:text-slate-300">{{ $t('Qolgan qarz') }}:</span>
              <span class="text-red-600 dark:text-red-400">
                {{ formatMoney((editingCustomer?.price || 0) -
                  (editingCustomer?.payments.reduce((a, b) => a + b.amount, 0))) }}
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ $t("To'lov summasi (so'm)") }}
            </label>
            <input v-model="paymentAmount" type="number" placeholder="0"
              class="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          </div>

          <div class="space-y-1">
            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ $t("To'lov usuli") }}
            </label>
            <select v-model="paymentType"
              class="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all">
              <option value="NAQD">{{ $t('Naqd pul') }}</option>
              <option value="KARTA">{{ $t('Plastik karta') }}</option>
              <option value="PUL_OTKAZISH">{{ $t("Pul o'tkazish") }}</option>
            </select>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-6 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="showDebtModal = false"
            class="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {{ $t('Bekor qilish') }}
          </button>
          <button @click="payDebt(editingCustomer)"
            class="btn-primary px-6 py-2.5 rounded-xl text-white flex items-center gap-2 active:scale-[0.97] transition-all">
            {{ $t("To'lovni saqlash") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.btn-primary {
  background: linear-gradient(135deg, #2142c8, #2f49d0);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1a2e7a, #2a3e9a);
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