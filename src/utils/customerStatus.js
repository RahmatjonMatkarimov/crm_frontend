// Statuslar bo'yicha umumiy ma'lumotlar: label, rang va URL uchun tushunarsiz (opaque) kod.
// Kod status nomini o'zida aks ettirmaydi — link orqali qaysi status ekanini bilib bo'lmaydi.
export const KANBAN_STATUS_ORDER = ['NAVBATDA', 'KORIB_CHIQILDI', 'YAKUNLANDI', 'YURISTDA', 'BEKOR_QILINDI']

export const kanbanStatusLabels = {
  NAVBATDA: 'Maslahat olish uchun navbatda turgan fuqarolar',
  KORIB_CHIQILDI: 'Qabuldagi mijozlar',
  YAKUNLANDI: 'Maslahat berilgan mijozlar',
  YURISTDA: 'Shartnoma tuzilgan mijozlar',
  BEKOR_QILINDI: 'Rad etilgan murojaatlar',
}

export const statusInlineColors = {
  NAVBATDA: { bg: 'var(--border-light)', color: 'var(--text-2)' },
  YURISTDA: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  KORIB_CHIQILDI: { bg: 'var(--info-bg)', color: 'var(--info)' },
  YAKUNLANDI: { bg: 'var(--success-bg)', color: 'var(--success)' },
  BEKOR_QILINDI: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

// Har bir status uchun bitta yoki bir nechta SVG path ("d" atributi) - ikonni tashkil qiladi.
export const statusIcons = {
  NAVBATDA: ['M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  KORIB_CHIQILDI: ['M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  YAKUNLANDI: ['M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  // Imzolangan hujjat: burchagi qayrilgan varaq + matn qatori + pastda imzo chizig'i
  YURISTDA: [
    'M6 4 H14 L18 8 V20 H6 Z',
    'M14 4 V8 H18',
    'M9 12 H15',
    'M8 16.5c.8-1.2 1.6-1.2 2.4 0s1.6 1.2 2.4 0 1.6-1.2 2.4 0',
  ],
  BEKOR_QILINDI: ['m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
}

const STATUS_TO_CODE = {
  NAVBATDA: '7f3a1c',
  KORIB_CHIQILDI: '2b9e44',
  YAKUNLANDI: 'd81f6a',
  YURISTDA: '4c0b92',
  BEKOR_QILINDI: '91ffa3',
}

const CODE_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_CODE).map(([status, code]) => [code, status])
)

export const getStatusCode = (status) => STATUS_TO_CODE[status] || status
export const getStatusFromCode = (code) => CODE_TO_STATUS[code] || code
