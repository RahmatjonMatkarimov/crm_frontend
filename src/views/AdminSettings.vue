<script setup>
import { ref, onMounted } from 'vue'
import api, { ENDPOINTS, BASE_URL } from '@/api'

const tabs = [
    {
        id: 'video',
        label: 'Kutish zali videosi',
        icon: 'M15.75 10.5l4.72-2.36a.75.75 0 011.03.67v10.38a.75.75 0 01-1.03.67l-4.72-2.36M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
    },
    {
        id: 'auto-messages',
        label: 'Avtomatik xabarlar',
        icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
    },
    {
        id: 'telegram',
        label: 'Telegram ulanish',
        icon: null, // custom telegram glyph rendered separately
    },
]
const activeTab = ref('video')

// ---------- Kutish zali videosi ----------
const videoUrl = ref('')
const videoFile = ref(null)
const videoPreview = ref('')
const videoInput = ref(null)
const videoSaving = ref(false)
const videoSaveSuccess = ref(false)
const videoSaveError = ref('')

const loadVideoSettings = async () => {
    try {
        const { data } = await api.get(ENDPOINTS.SETTINGS_WAITING_ROOM_VIDEO)
        videoUrl.value = data.waitingRoomVideo || ''
    } catch (e) {
        videoSaveError.value = 'Video sozlamalarini yuklab bo\'lmadi'
    }
}

const currentVideoSrc = () => {
    if (videoPreview.value) return videoPreview.value
    if (!videoUrl.value) return ''
    return videoUrl.value.startsWith('/videos/') ? `${BASE_URL}${videoUrl.value}` : videoUrl.value
}

const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    videoFile.value = file
    videoPreview.value = URL.createObjectURL(file)
    videoSaveSuccess.value = false
    videoSaveError.value = ''
}

const saveVideo = async () => {
    if (!(videoFile.value instanceof File)) return
    videoSaving.value = true
    videoSaveSuccess.value = false
    videoSaveError.value = ''
    try {
        const formData = new FormData()
        formData.append('video', videoFile.value)
        const { data } = await api.put(ENDPOINTS.SETTINGS_WAITING_ROOM_VIDEO, formData)
        videoUrl.value = data.waitingRoomVideo
        videoFile.value = null
        videoPreview.value = ''
        videoSaveSuccess.value = true
    } catch (e) {
        videoSaveError.value = e?.response?.data?.message || 'Videoni saqlashda xatolik'
    } finally {
        videoSaving.value = false
    }
}

// ---------- Telegram login ----------
const tgStatus = ref('loading') // 'loading' | 'connected' | 'disconnected'
const tgPhone = ref('')
const tgCode = ref('')
const tgStep = ref(1)
const tgLoading = ref(false)
const tgError = ref('')

const checkTgStatus = async () => {
    try {
        const { data } = await api.get(ENDPOINTS.TELEGRAM_STATUS)
        tgStatus.value = data.connected ? 'connected' : 'disconnected'
        if (data.phone) tgPhone.value = data.phone
    } catch {
        tgStatus.value = 'disconnected'
    }
}

const tgSendCode = async () => {
    tgError.value = ''
    tgLoading.value = true
    try {
        await api.post(ENDPOINTS.TELEGRAM_SEND_CODE, { phone: tgPhone.value })
        tgStep.value = 2
    } catch (e) {
        tgError.value = e?.response?.data?.message || 'Xatolik yuz berdi'
    } finally {
        tgLoading.value = false
    }
}

const tgSignIn = async () => {
    tgError.value = ''
    tgLoading.value = true
    try {
        await api.post(ENDPOINTS.TELEGRAM_SIGN_IN, { phone: tgPhone.value, code: tgCode.value })
        tgStatus.value = 'connected'
        tgStep.value = 1
        tgCode.value = ''
    } catch (e) {
        tgError.value = e?.response?.data?.message || 'Kod noto\'g\'ri'
    } finally {
        tgLoading.value = false
    }
}

const tgLogout = async () => {
    tgLoading.value = true
    try {
        await api.post(ENDPOINTS.TELEGRAM_LOGOUT)
        tgStatus.value = 'disconnected'
        tgPhone.value = ''
        tgStep.value = 1
    } catch {
        tgStatus.value = 'disconnected'
    } finally {
        tgLoading.value = false
    }
}

// ---------- Mijoz yaratilganda yuboriladigan xabarlar ----------
const autoMessages = ref([])
const amLoading = ref(false)
const amSavingId = ref(null)
const amError = ref('')

const loadAutoMessages = async () => {
    amLoading.value = true
    amError.value = ''
    try {
        const { data } = await api.get(ENDPOINTS.AUTO_MESSAGES)
        autoMessages.value = data
    } catch (e) {
        amError.value = e?.response?.data?.message || 'Xabarlarni yuklab bo\'lmadi'
    } finally {
        amLoading.value = false
    }
}

const addAutoMessage = async () => {
    try {
        const order = autoMessages.value.length
        const { data } = await api.post(ENDPOINTS.AUTO_MESSAGES, {
            text: '',
            order,
            delayMinutes: 0,
            isActive: true,
        })
        autoMessages.value.push(data)
    } catch (e) {
        amError.value = e?.response?.data?.message || 'Xabar qo\'shib bo\'lmadi'
    }
}

const saveAutoMessage = async (msg) => {
    amSavingId.value = msg.id
    amError.value = ''
    try {
        const { data } = await api.put(ENDPOINTS.AUTO_MESSAGE(msg.id), {
            text: msg.text,
            order: msg.order,
            delayMinutes: msg.delayMinutes,
            isActive: msg.isActive,
        })
        Object.assign(msg, data)
    } catch (e) {
        amError.value = e?.response?.data?.message || 'Xabarni saqlashda xatolik'
    } finally {
        amSavingId.value = null
    }
}

const removeAutoMessage = async (msg) => {
    try {
        await api.delete(ENDPOINTS.AUTO_MESSAGE(msg.id))
        autoMessages.value = autoMessages.value.filter((m) => m.id !== msg.id)
    } catch (e) {
        amError.value = e?.response?.data?.message || 'Xabarni o\'chirishda xatolik'
    }
}

// ---------- Necha kundan keyin yuboriladigan xabarlar (yillik takrorlanadigan) ----------
const scheduledMessages = ref([])
const smLoading = ref(false)
const smSavingId = ref(null)
const smError = ref('')

const loadScheduledMessages = async () => {
    smLoading.value = true
    smError.value = ''
    try {
        const { data } = await api.get(ENDPOINTS.SCHEDULED_MESSAGES)
        scheduledMessages.value = data
    } catch (e) {
        smError.value = e?.response?.data?.message || 'Xabarlarni yuklab bo\'lmadi'
    } finally {
        smLoading.value = false
    }
}

const addScheduledMessage = async () => {
    try {
        const order = scheduledMessages.value.length
        const { data } = await api.post(ENDPOINTS.SCHEDULED_MESSAGES, {
            text: '',
            order,
            dayOffset: 0,
            isActive: true,
        })
        scheduledMessages.value.push(data)
    } catch (e) {
        smError.value = e?.response?.data?.message || 'Xabar qo\'shib bo\'lmadi'
    }
}

const saveScheduledMessage = async (msg) => {
    smSavingId.value = msg.id
    smError.value = ''
    try {
        const { data } = await api.put(ENDPOINTS.SCHEDULED_MESSAGE(msg.id), {
            text: msg.text,
            order: msg.order,
            dayOffset: msg.dayOffset,
            isActive: msg.isActive,
        })
        Object.assign(msg, data)
    } catch (e) {
        smError.value = e?.response?.data?.message || 'Xabarni saqlashda xatolik'
    } finally {
        smSavingId.value = null
    }
}

const removeScheduledMessage = async (msg) => {
    try {
        await api.delete(ENDPOINTS.SCHEDULED_MESSAGE(msg.id))
        scheduledMessages.value = scheduledMessages.value.filter((m) => m.id !== msg.id)
    } catch (e) {
        smError.value = e?.response?.data?.message || 'Xabarni o\'chirishda xatolik'
    }
}

const dayOffsetHint = (dayOffset) => {
    const n = Number(dayOffset) || 0
    if (n === 0) return 'Mijoz qo\'shilgan kuni yuboriladi, so\'ng har yili shu kuni qaytariladi'
    return `Mijoz qo'shilganidan ${n} kun o'tgach yuboriladi, so'ng har yili shu kunda qaytariladi`
}

onMounted(() => {
    loadVideoSettings()
    checkTgStatus()
    loadAutoMessages()
    loadScheduledMessages()
})
</script>

<template>
    <div class="max-w-5xl mx-auto">
        <div class="mb-6">
            <h1 class="text-lg font-bold" style="color:var(--text-1);">Rahbar sozlamalari</h1>
            <p class="text-sm mt-1" style="color:var(--text-2);">Tizim va mijozlar bilan aloqador umumiy sozlamalar</p>
        </div>

        <div class="settings-layout">
            <!-- Tab navigatsiya -->
            <nav class="settings-nav">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" class="settings-nav-item"
                    :class="{ 'settings-nav-item-active': activeTab === tab.id }">
                    <span class="settings-nav-icon" :class="{ 'settings-nav-icon-active': activeTab === tab.id }">
                        <svg v-if="tab.icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="2" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#229ED9" class="w-4 h-4">
                            <path
                                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.4 13.893l-2.93-.918c-.638-.196-.651-.638.136-.943l11.438-4.41c.531-.197.999.131.85.599z" />
                        </svg>
                    </span>
                    <span class="text-sm font-semibold">{{ tab.label }}</span>
                    <span v-if="tab.id === 'telegram' && tgStatus !== 'loading'" class="ml-auto w-2 h-2 rounded-full"
                        :style="tgStatus === 'connected' ? 'background:var(--success);' : 'background:var(--danger);'"></span>
                </button>
            </nav>

            <!-- Tanlangan bo'lim kontenti -->
            <div class="settings-content">

                <!-- Kutish zali videosi -->
                <div v-show="activeTab === 'video'" class="card overflow-hidden">
                    <div class="settings-card-header">
                        <h3 class="text-sm font-bold" style="color:var(--text-1);">Kutish zali videosi</h3>
                    </div>

                    <div class="p-6 space-y-4">
                        <p class="text-sm" style="color:var(--text-2);">
                            Bu video mijozlar kutish zalidagi (<code>/waiting-room</code>) ekranda navbat bo'lmagan
                            paytda avtomatik ijro etiladi.
                        </p>

                        <div v-if="currentVideoSrc()" class="rounded-xl overflow-hidden border"
                            style="border-color:var(--border);">
                            <video :src="currentVideoSrc()" class="w-full max-h-64 object-contain bg-black" controls
                                muted></video>
                        </div>

                        <div v-if="videoSaveSuccess" class="settings-alert settings-alert-success">
                            Video muvaffaqiyatli saqlandi!
                        </div>
                        <div v-if="videoSaveError" class="settings-alert settings-alert-danger">
                            {{ videoSaveError }}
                        </div>

                        <input ref="videoInput" type="file" accept="video/*" class="hidden" @change="handleVideoChange" />

                        <div class="flex gap-2">
                            <button @click="videoInput.click()" class="btn btn-ghost btn-sm">Video tanlash</button>
                            <button v-if="videoFile" @click="saveVideo" :disabled="videoSaving"
                                class="btn btn-primary btn-sm">
                                <span v-if="videoSaving"
                                    class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70"></span>
                                {{ videoSaving ? 'Saqlanmoqda...' : 'Saqlash' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Avtomatik xabarlar -->
                <div v-show="activeTab === 'auto-messages'" class="space-y-5">

                    <!-- 1) Mijoz yaratilganda yuboriladigan xabarlar -->
                    <div class="card overflow-hidden">
                        <div class="settings-card-header">
                            <h3 class="text-sm font-bold" style="color:var(--text-1);">Mijoz yaratilganda yuboriladigan
                                xabarlar</h3>
                        </div>

                        <div class="p-6 space-y-4">
                            <p class="text-sm" style="color:var(--text-2);">
                                Yangi mijoz tizimga qo'shilgan zahoti ushbu xabarlar Telegram orqali avtomatik
                                yuboriladi. Bir nechta xabar bo'lsa, har birini necha daqiqa kechikish bilan yuborishni
                                belgilash mumkin. Faqat rahbar va admin o'zgartira oladi.
                            </p>

                            <div v-if="amError" class="settings-alert settings-alert-danger">{{ amError }}</div>
                            <div v-if="amLoading" class="text-sm" style="color:var(--text-2);">Yuklanmoqda...</div>

                            <div v-else class="space-y-3">
                                <div v-for="(msg, i) in autoMessages" :key="msg.id" class="am-item">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-semibold uppercase tracking-widest"
                                            style="color:var(--text-2);">
                                            Xabar #{{ i + 1 }}
                                        </span>
                                        <label class="flex items-center gap-2 text-xs" style="color:var(--text-2);">
                                            <input type="checkbox" v-model="msg.isActive" @change="saveAutoMessage(msg)" />
                                            Faol
                                        </label>
                                    </div>

                                    <textarea v-model="msg.text" rows="2" class="am-textarea"
                                        placeholder="Xabar matni..."></textarea>

                                    <div class="flex flex-wrap items-center gap-3">
                                        <div class="flex items-center gap-2">
                                            <label class="text-xs whitespace-nowrap" style="color:var(--text-2);">Kechikish
                                                (daqiqa)</label>
                                            <input v-model.number="msg.delayMinutes" type="number" min="0"
                                                class="am-day-input" />
                                        </div>

                                        <button @click="saveAutoMessage(msg)" :disabled="amSavingId === msg.id"
                                            class="ml-auto btn btn-primary btn-sm">
                                            {{ amSavingId === msg.id ? 'Saqlanmoqda...' : 'Saqlash' }}
                                        </button>
                                        <button @click="removeAutoMessage(msg)" class="btn btn-ghost btn-sm"
                                            style="color:var(--danger);">
                                            O'chirish
                                        </button>
                                    </div>
                                </div>

                                <button @click="addAutoMessage" class="btn btn-ghost btn-sm">+ Xabar qo'shish</button>
                            </div>
                        </div>
                    </div>

                    <!-- 2) Necha kundan keyin yuboriladigan xabarlar -->
                    <div class="card overflow-hidden">
                        <div class="settings-card-header">
                            <h3 class="text-sm font-bold" style="color:var(--text-1);">Necha kundan keyin
                                yuboriladigan xabarlar</h3>
                        </div>

                        <div class="p-6 space-y-4">
                            <p class="text-sm" style="color:var(--text-2);">
                                Har bir xabar mijoz tizimga qo'shilgan sanadan hisoblab, belgilangan kun soni o'tgach
                                Telegram orqali avtomatik yuboriladi. Xabar yuborilgandan <strong>1 yil</strong>
                                o'tgach, xuddi shu xabar mijozga <strong>qayta yuboriladi</strong> — bu har yili
                                takrorlanadi, agar mijoz arxivlanmagan bo'lsa. Faqat rahbar va admin o'zgartira oladi.
                            </p>

                            <div v-if="smError" class="settings-alert settings-alert-danger">{{ smError }}</div>
                            <div v-if="smLoading" class="text-sm" style="color:var(--text-2);">Yuklanmoqda...</div>

                            <div v-else class="space-y-3">
                                <div v-for="(msg, i) in scheduledMessages" :key="msg.id" class="am-item">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-semibold uppercase tracking-widest"
                                            style="color:var(--text-2);">
                                            Xabar #{{ i + 1 }}
                                        </span>
                                        <label class="flex items-center gap-2 text-xs" style="color:var(--text-2);">
                                            <input type="checkbox" v-model="msg.isActive"
                                                @change="saveScheduledMessage(msg)" />
                                            Faol
                                        </label>
                                    </div>

                                    <textarea v-model="msg.text" rows="2" class="am-textarea"
                                        placeholder="Xabar matni..."></textarea>

                                    <div class="flex flex-wrap items-center gap-3">
                                        <div class="flex items-center gap-2">
                                            <label class="text-xs whitespace-nowrap" style="color:var(--text-2);">Necha
                                                kundan keyin</label>
                                            <input v-model.number="msg.dayOffset" type="number" min="0"
                                                class="am-day-input" />
                                        </div>

                                        <button @click="saveScheduledMessage(msg)" :disabled="smSavingId === msg.id"
                                            class="ml-auto btn btn-primary btn-sm">
                                            {{ smSavingId === msg.id ? 'Saqlanmoqda...' : 'Saqlash' }}
                                        </button>
                                        <button @click="removeScheduledMessage(msg)" class="btn btn-ghost btn-sm"
                                            style="color:var(--danger);">
                                            O'chirish
                                        </button>
                                    </div>

                                    <p class="text-xs" style="color:var(--text-3);">{{ dayOffsetHint(msg.dayOffset) }}
                                    </p>
                                </div>

                                <button @click="addScheduledMessage" class="btn btn-ghost btn-sm">+ Xabar
                                    qo'shish</button>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Telegram ulanish -->
                <div v-show="activeTab === 'telegram'" class="card overflow-hidden">
                    <div class="settings-card-header">
                        <h3 class="text-sm font-bold" style="color:var(--text-1);">Telegram ulanish</h3>
                        <span v-if="tgStatus === 'connected'"
                            class="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--success-bg)] text-[var(--success)]">
                            Ulangan ✓
                        </span>
                        <span v-else-if="tgStatus === 'disconnected'"
                            class="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--danger-bg)] text-[var(--danger)]">
                            Ulanmagan
                        </span>
                    </div>

                    <div class="p-6 space-y-4">
                        <!-- Ulangan holat -->
                        <div v-if="tgStatus === 'connected'" class="space-y-3">
                            <div class="flex items-center gap-3 p-3 rounded-xl"
                                style="background:var(--success-bg); border:1px solid var(--success-border);">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                    stroke="currentColor" class="w-5 h-5 shrink-0" style="color:var(--success);">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p class="text-sm font-semibold" style="color:var(--success);">Muvaffaqiyatli
                                        ulangan</p>
                                    <p v-if="tgPhone" class="text-xs" style="color:var(--success); opacity:0.7;">+{{
                                        tgPhone }}</p>
                                </div>
                            </div>
                            <button @click="tgLogout" :disabled="tgLoading"
                                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                                style="color:var(--danger); border:1px solid var(--danger-border);"
                                onmouseover="this.style.background='var(--danger-bg)'"
                                onmouseout="this.style.background=''">
                                <div v-if="tgLoading"
                                    class="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                                    style="border-color:var(--danger); border-top-color:transparent;">
                                </div>
                                Chiqish (logout)
                            </button>
                        </div>

                        <!-- Login holat -->
                        <div v-else class="space-y-4">
                            <p class="text-sm" style="color:var(--text-2);">
                                Telegram akkauntingizni ulang — shundan keyin mijozlarga to'g'ridan-to'g'ri xabar
                                yuborish mumkin bo'ladi.
                            </p>

                            <!-- Qadam 1: telefon -->
                            <div v-if="tgStep === 1" class="space-y-3">
                                <div class="space-y-1.5">
                                    <label class="block text-[11px] font-semibold uppercase tracking-widest"
                                        style="color:var(--text-2);">
                                        Telefon raqam (xalqaro format)
                                    </label>
                                    <input v-model="tgPhone" type="tel" placeholder="+998901234567"
                                        class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none bg-[var(--border-light)] border border-[var(--border)] text-[var(--text-1)] placeholder-[var(--text-3)] focus:border-[#229ED9]" />
                                </div>
                                <p v-if="tgError" class="text-xs" style="color:var(--danger);">{{ tgError }}</p>
                                <button @click="tgSendCode" :disabled="tgLoading || !tgPhone"
                                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                                    style="background:#229ED9;">
                                    <div v-if="tgLoading"
                                        class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin">
                                    </div>
                                    SMS kod yuborish
                                </button>
                            </div>

                            <!-- Qadam 2: kod -->
                            <div v-if="tgStep === 2" class="space-y-3">
                                <div class="space-y-1.5">
                                    <label class="block text-[11px] font-semibold uppercase tracking-widest"
                                        style="color:var(--text-2);">
                                        Telegram dan kelgan kod
                                    </label>
                                    <input v-model="tgCode" type="text" placeholder="12345" maxlength="6"
                                        class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none tracking-widest font-mono bg-[var(--border-light)] border border-[var(--border)] text-[var(--text-1)] placeholder-[var(--text-3)] focus:border-[#229ED9]" />
                                </div>
                                <p v-if="tgError" class="text-xs" style="color:var(--danger);">{{ tgError }}</p>
                                <div class="flex gap-2">
                                    <button @click="tgStep = 1; tgCode = ''; tgError = ''"
                                        class="px-4 py-2.5 rounded-xl text-sm font-medium" style="color:var(--text-2);">
                                        Orqaga
                                    </button>
                                    <button @click="tgSignIn" :disabled="tgLoading || !tgCode"
                                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                                        style="background:#229ED9;">
                                        <div v-if="tgLoading"
                                            class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin">
                                        </div>
                                        Tasdiqlash
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
    align-items: start;
}

.settings-nav {
    position: sticky;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    border: 1px solid var(--border);
}

.settings-nav-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius);
    color: var(--text-2);
    text-align: left;
    transition: background 0.15s ease, color 0.15s ease;
}

.settings-nav-item:hover {
    background: var(--border-light);
    color: var(--text-1);
}

.settings-nav-item-active {
    background: var(--primary-light);
    color: var(--primary);
}

.settings-nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-sm);
    background: var(--border-light);
    color: var(--text-2);
    flex-shrink: 0;
}

.settings-nav-icon-active {
    background: var(--bg-card);
    color: var(--primary);
}

.settings-content {
    min-width: 0;
}

.settings-card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--border-light);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.settings-alert {
    padding: 0.875rem;
    border-radius: var(--radius);
    border: 1px solid;
    font-size: 0.875rem;
}

.settings-alert-success {
    background: var(--success-bg);
    border-color: var(--success-border);
    color: var(--success);
}

.settings-alert-danger {
    background: var(--danger-bg);
    border-color: var(--danger-border);
    color: var(--danger);
}

.am-item {
    padding: 1rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.am-textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    background: var(--border-light);
    border: 1px solid var(--border);
    color: var(--text-1);
    resize: vertical;
}

.am-textarea::placeholder {
    color: var(--text-3);
}

.am-day-input {
    width: 5rem;
    padding: 0.375rem 0.625rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    background: var(--border-light);
    border: 1px solid var(--border);
    color: var(--text-1);
}

@media (max-width: 720px) {
    .settings-layout {
        grid-template-columns: 1fr;
    }

    .settings-nav {
        position: static;
        flex-direction: row;
        overflow-x: auto;
        gap: 0.375rem;
    }

    .settings-nav-item {
        flex-shrink: 0;
        width: auto;
    }
}
</style>
