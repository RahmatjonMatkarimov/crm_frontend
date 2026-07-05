// Yagona manba: sayt bo'ylab ishlatiladigan barcha CSS o'zgaruvchilari,
// ularning guruhlari (Theme panelida ko'rsatish uchun) va tayyor ranglar to'plami.
// App.vue (global suzuvchi panel) va ThemeCustomizer.vue (/theme sahifasi)
// shu fayldan import qiladi — ranglar ikki joyda alohida-alohida yozilmaydi.

export const STORAGE_KEY = 'theme-colors'

export const defaults = {
  '--primary':        '#16234a',
  '--primary-hover':  '#223368',
  '--primary-light':  '#eef1f8',
  '--accent':         '#16a34a',
  '--accent-hover':   '#15803d',
  '--accent-light':   '#f0fdf4',
  '--gold':           '#c89a3c',
  '--gold-hover':     '#d9ac4d',
  '--gold-light':     '#faf1de',
  '--bg-page':        '#faf6ec',
  '--bg-card':        '#ffffff',
  '--bg-sidebar':     '#11213f',
  '--border':         '#e8e0cd',
  '--border-light':   '#f3eee0',
  '--text-1':         '#1a2338',
  '--text-2':         '#6b6759',
  '--text-3':         '#94907f',
  '--success':        '#16a34a',
  '--success-bg':     '#f0fdf4',
  '--success-border': '#bbf7d0',
  '--danger':         '#a3410f',
  '--danger-bg':      '#fdf1ea',
  '--danger-border':  '#f0cba9',
  '--warning':        '#b45309',
  '--warning-bg':     '#fffbeb',
  '--warning-border': '#fde68a',
  '--info':           '#2563eb',
  '--info-bg':        '#eff6ff',
  '--info-border':    '#bfdbfe',
  '--overlay':        'rgba(15, 23, 42, 0.5)',
  '--sidebar-active-text': '#1a2338',
}

// Sidebar o'z --primary/--primary-hover'ni gold rangga almashtiradi (index.css'dagi
// .app-sidebar qoidasiga qarang) va aktiv havola matni --sidebar-active-text bilan
// belgilanadi. Bu qiymatlar :root'ga emas, .app-sidebar ichiga yozilishi kerak —
// shuning uchun App.vue va ThemeCustomizer.vue shu funksiyani chaqirib, alohida
// <style> teg orqali .app-sidebar qoidasini dinamik yangilaydi.
export function sidebarOverrideCss(vars) {
  const primary = vars['--primary'] ?? defaults['--primary']
  const primaryHover = vars['--primary-hover'] ?? defaults['--primary-hover']
  const activeText = vars['--sidebar-active-text'] ?? defaults['--sidebar-active-text']
  return `
    .app-sidebar {
      --primary: ${primary};
      --primary-hover: ${primaryHover};
      --sidebar-active-text: ${activeText};
    }
  `
}

export const varGroups = [
  {
    title: 'Asosiy rang',
    vars: [
      { key: '--primary',       label: 'Asosiy rang',          desc: 'Tugmalar, chap menyu aktiv bo\'lim, mijoz raqami belgisi rangi' },
      { key: '--primary-hover', label: 'Asosiy rang (ustida)', desc: 'Tugma ustiga sichqoncha olib borganda o\'zgaradigan rang' },
      { key: '--primary-light', label: 'Asosiy rang (ochiq)',  desc: 'Belgi fonlari va maydon belgilanganda ko\'rinadigan och rang' },
    ],
  },
  {
    title: 'Yashil rang',
    vars: [
      { key: '--accent',        label: 'Yashil rang',          desc: 'Yashil tugma va "To\'liq to\'langan" yozuvi rangi' },
      { key: '--accent-hover',  label: 'Yashil rang (ustida)', desc: 'Yashil tugma ustiga sichqoncha olib borganda' },
      { key: '--accent-light',  label: 'Yashil rang (ochiq)',  desc: 'Yashil belgi va xabarlar fonidagi och yashil rang' },
    ],
  },
  {
    title: 'Oltin rang',
    vars: [
      { key: '--gold',          label: 'Oltin rang',          desc: 'Chap menyu aktiv bo\'limining fon rangi (standart holda oltin)' },
      { key: '--gold-hover',    label: 'Oltin rang (ustida)', desc: 'Oltin rang elementlari ustiga o\'tilganda' },
      { key: '--gold-light',    label: 'Oltin rang (ochiq)',  desc: 'Oltin rangli belgi va kartochkalar fonidagi och rang' },
    ],
  },
  {
    title: 'Fon ranglari',
    vars: [
      { key: '--bg-page',    label: 'Sahifa foni',    desc: 'Barcha sahifalarning asosiy orqa fon rangi' },
      { key: '--bg-card',    label: 'Kartochka foni', desc: 'Jadvallar, oynalar va oq kartochkalar foni' },
      { key: '--bg-sidebar', label: 'Menyu foni',     desc: 'Chap tomondagi navigatsiya paneli foni' },
    ],
  },
  {
    title: 'Chegara va matn ranglari',
    vars: [
      { key: '--border',       label: 'Chegara rangi',          desc: 'Kartochkalar, maydonlar va jadval qatorlari atrofidagi chiziq' },
      { key: '--border-light', label: 'Chegara rangi (ochiq)',  desc: 'Ustiga o\'tilganda va oyna pastki qismi uchun och fon rang' },
      { key: '--text-1',       label: 'Asosiy matn',            desc: 'Sarlavhalar, mijoz ismi, jadval qiymatlari — eng muhim matnlar' },
      { key: '--text-2',       label: 'Ikkinchi darajali matn', desc: 'Telefon, manzil, maydon nomlari — kamroq muhim matnlar' },
      { key: '--text-3',       label: 'Yordamchi matn',         desc: 'Sana, izoh, bo\'sh maydon yozuvi — eng kam ko\'zga tashlanadigan matnlar' },
    ],
  },
  {
    title: 'Holat ranglari',
    vars: [
      { key: '--success',        label: 'Muvaffaqiyat rangi',      desc: '"To\'liq to\'langan" va boshqa ijobiy holatlar rangi' },
      { key: '--success-bg',     label: 'Muvaffaqiyat foni',       desc: 'Yashil belgilar orqa fon rangi (masalan: Tasdiqlangan)' },
      { key: '--success-border', label: 'Muvaffaqiyat chegarasi',  desc: 'Yashil belgining atrofidagi chiziq rangi' },
      { key: '--danger',         label: 'Xavf rangi',              desc: 'Qarz miqdori, o\'chirish tugmasi va xato xabarlari rangi' },
      { key: '--danger-bg',      label: 'Xavf foni',               desc: 'Qizil belgilarning orqa fon rangi' },
      { key: '--danger-border',  label: 'Xavf chegarasi',          desc: 'Qizil belgining atrofidagi chiziq rangi' },
      { key: '--warning',        label: 'Ogohlantirish rangi',     desc: 'Ehtiyotlik talab qiladigan holatlar uchun sariq rang' },
      { key: '--warning-bg',     label: 'Ogohlantirish foni',      desc: 'Sariq belgilarning orqa fon rangi' },
      { key: '--warning-border', label: 'Ogohlantirish chegarasi', desc: 'Sariq belgining atrofidagi chiziq rangi' },
    ],
  },
  {
    title: "Ma'lumot va qoplama ranglari",
    vars: [
      { key: '--info',         label: "Ma'lumot rangi",     desc: 'Navbat raqami va "Ko\'rib chiqildi" kabi status belgilari rangi' },
      { key: '--info-bg',      label: "Ma'lumot foni",      desc: "Ko'k belgilarning orqa fon rangi" },
      { key: '--info-border',  label: "Ma'lumot chegarasi", desc: "Ko'k belgining atrofidagi chiziq rangi" },
      { key: '--overlay',      label: 'Modal qoplamasi',    desc: "Oyna ochilganda orqa fonni qorong'ulashtiruvchi rang" },
    ],
  },
  {
    title: 'Sidebar aktiv band',
    vars: [
      { key: '--sidebar-active-text', label: "Aktiv havola matni", desc: "Chap menyudagi tanlangan bo'limning oltin fon ustidagi matn rangi" },
    ],
  },
]

export const presets = [
  {
    name: 'Standart (Navy)',
    vars: { ...defaults },
  },
  {
    name: "Ocean (Ko'k dengiz)",
    vars: {
      '--primary': '#0e4f8e', '--primary-hover': '#1464b0', '--primary-light': '#e8f2fc',
      '--accent': '#0891b2', '--accent-hover': '#0e7490', '--accent-light': '#ecfeff',
      '--gold': '#ca8a04', '--gold-hover': '#a16207', '--gold-light': '#fefce8',
      '--bg-page': '#f0f7ff', '--bg-card': '#ffffff', '--bg-sidebar': '#0c2e52',
      '--border': '#bfdbfe', '--border-light': '#dbeafe',
      '--text-1': '#0f2942', '--text-2': '#4b7198', '--text-3': '#82a6c6',
      '--success': '#059669', '--success-bg': '#ecfdf5', '--success-border': '#a7f3d0',
      '--danger': '#dc2626', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#d97706', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(12,46,82,0.55)', '--sidebar-active-text': '#0f2942',
    },
  },
  {
    name: 'Emerald (Zangori yashil)',
    vars: {
      '--primary': '#065f46', '--primary-hover': '#047857', '--primary-light': '#ecfdf5',
      '--accent': '#7c3aed', '--accent-hover': '#6d28d9', '--accent-light': '#ede9fe',
      '--gold': '#c89a3c', '--gold-hover': '#d9ac4d', '--gold-light': '#faf1de',
      '--bg-page': '#f0fdf4', '--bg-card': '#ffffff', '--bg-sidebar': '#022c22',
      '--border': '#a7f3d0', '--border-light': '#d1fae5',
      '--text-1': '#022c22', '--text-2': '#065f46', '--text-3': '#34d399',
      '--success': '#059669', '--success-bg': '#ecfdf5', '--success-border': '#a7f3d0',
      '--danger': '#dc2626', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#d97706', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(2,44,34,0.55)', '--sidebar-active-text': '#022c22',
    },
  },
  {
    name: 'Slate (Kulrang zamonaviy)',
    vars: {
      '--primary': '#334155', '--primary-hover': '#475569', '--primary-light': '#f1f5f9',
      '--accent': '#6366f1', '--accent-hover': '#4f46e5', '--accent-light': '#eef2ff',
      '--gold': '#c89a3c', '--gold-hover': '#d9ac4d', '--gold-light': '#faf1de',
      '--bg-page': '#f8fafc', '--bg-card': '#ffffff', '--bg-sidebar': '#0f172a',
      '--border': '#e2e8f0', '--border-light': '#f1f5f9',
      '--text-1': '#0f172a', '--text-2': '#64748b', '--text-3': '#94a3b8',
      '--success': '#16a34a', '--success-bg': '#f0fdf4', '--success-border': '#bbf7d0',
      '--danger': '#dc2626', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#d97706', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(15,23,42,0.55)', '--sidebar-active-text': '#0f172a',
    },
  },
  {
    name: 'Rose (Pushti Premium)',
    vars: {
      '--primary': '#9f1239', '--primary-hover': '#be123c', '--primary-light': '#fff1f2',
      '--accent': '#e11d48', '--accent-hover': '#be123c', '--accent-light': '#ffe4e6',
      '--gold': '#c89a3c', '--gold-hover': '#d9ac4d', '--gold-light': '#faf1de',
      '--bg-page': '#fff5f7', '--bg-card': '#ffffff', '--bg-sidebar': '#4a0010',
      '--border': '#fecdd3', '--border-light': '#ffe4e6',
      '--text-1': '#4a0010', '--text-2': '#9f1239', '--text-3': '#fb7185',
      '--success': '#16a34a', '--success-bg': '#f0fdf4', '--success-border': '#bbf7d0',
      '--danger': '#dc2626', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#d97706', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(74,0,16,0.55)', '--sidebar-active-text': '#4a0010',
    },
  },
  {
    name: "Sunset (Quyosh botishi)",
    vars: {
      '--primary': '#c2410c', '--primary-hover': '#ea580c', '--primary-light': '#fff7ed',
      '--accent': '#0d9488', '--accent-hover': '#0f766e', '--accent-light': '#f0fdfa',
      '--gold': '#eab308', '--gold-hover': '#ca8a04', '--gold-light': '#fefce8',
      '--bg-page': '#fff8f1', '--bg-card': '#ffffff', '--bg-sidebar': '#431407',
      '--border': '#fed7aa', '--border-light': '#ffedd5',
      '--text-1': '#431407', '--text-2': '#9a3412', '--text-3': '#c2703d',
      '--success': '#16a34a', '--success-bg': '#f0fdf4', '--success-border': '#bbf7d0',
      '--danger': '#dc2626', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#d97706', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(67,20,7,0.55)', '--sidebar-active-text': '#431407',
    },
  },
  {
    name: 'Violet (Binafsha)',
    vars: {
      '--primary': '#6d28d9', '--primary-hover': '#7c3aed', '--primary-light': '#f5f3ff',
      '--accent': '#db2777', '--accent-hover': '#be185d', '--accent-light': '#fdf2f8',
      '--gold': '#c89a3c', '--gold-hover': '#d9ac4d', '--gold-light': '#faf1de',
      '--bg-page': '#faf8ff', '--bg-card': '#ffffff', '--bg-sidebar': '#2e1065',
      '--border': '#e9d5ff', '--border-light': '#f3e8ff',
      '--text-1': '#2e1065', '--text-2': '#6b21a8', '--text-3': '#a78bfa',
      '--success': '#16a34a', '--success-bg': '#f0fdf4', '--success-border': '#bbf7d0',
      '--danger': '#dc2626', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#d97706', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(46,16,101,0.55)', '--sidebar-active-text': '#2e1065',
    },
  },
  {
    name: "Forest (O'rmon)",
    vars: {
      '--primary': '#3f6212', '--primary-hover': '#4d7c0f', '--primary-light': '#f7fee7',
      '--accent': '#b45309', '--accent-hover': '#92400e', '--accent-light': '#fffbeb',
      '--gold': '#a16207', '--gold-hover': '#ca8a04', '--gold-light': '#fefce8',
      '--bg-page': '#f7f8f0', '--bg-card': '#ffffff', '--bg-sidebar': '#1a2e05',
      '--border': '#d9e4c0', '--border-light': '#eef2e0',
      '--text-1': '#1a2e05', '--text-2': '#3f6212', '--text-3': '#65a30d',
      '--success': '#16a34a', '--success-bg': '#f0fdf4', '--success-border': '#bbf7d0',
      '--danger': '#b91c1c', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#b45309', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#0369a1', '--info-bg': '#f0f9ff', '--info-border': '#bae6fd',
      '--overlay': 'rgba(26,46,5,0.55)', '--sidebar-active-text': '#1a2e05',
    },
  },
  {
    name: 'Midnight (Tungi ko\'k)',
    vars: {
      '--primary': '#4338ca', '--primary-hover': '#4f46e5', '--primary-light': '#eef2ff',
      '--accent': '#0891b2', '--accent-hover': '#0e7490', '--accent-light': '#ecfeff',
      '--gold': '#eab308', '--gold-hover': '#ca8a04', '--gold-light': '#fefce8',
      '--bg-page': '#f5f5ff', '--bg-card': '#ffffff', '--bg-sidebar': '#1e1b4b',
      '--border': '#e0e0f8', '--border-light': '#eeeefc',
      '--text-1': '#1e1b4b', '--text-2': '#4338ca', '--text-3': '#8b87c9',
      '--success': '#16a34a', '--success-bg': '#f0fdf4', '--success-border': '#bbf7d0',
      '--danger': '#dc2626', '--danger-bg': '#fef2f2', '--danger-border': '#fecaca',
      '--warning': '#d97706', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(30,27,75,0.55)', '--sidebar-active-text': '#1e1b4b',
    },
  },
  {
    name: 'Coffee (Qahva)',
    vars: {
      '--primary': '#78350f', '--primary-hover': '#92400e', '--primary-light': '#fef3e7',
      '--accent': '#166534', '--accent-hover': '#15803d', '--accent-light': '#f0fdf4',
      '--gold': '#c89a3c', '--gold-hover': '#d9ac4d', '--gold-light': '#faf1de',
      '--bg-page': '#faf6f0', '--bg-card': '#ffffff', '--bg-sidebar': '#2b1608',
      '--border': '#e8d9c5', '--border-light': '#f5ede2',
      '--text-1': '#2b1608', '--text-2': '#78350f', '--text-3': '#a8794f',
      '--success': '#16a34a', '--success-bg': '#f0fdf4', '--success-border': '#bbf7d0',
      '--danger': '#a3410f', '--danger-bg': '#fdf1ea', '--danger-border': '#f0cba9',
      '--warning': '#b45309', '--warning-bg': '#fffbeb', '--warning-border': '#fde68a',
      '--info': '#2563eb', '--info-bg': '#eff6ff', '--info-border': '#bfdbfe',
      '--overlay': 'rgba(43,22,8,0.55)', '--sidebar-active-text': '#2b1608',
    },
  },
]
