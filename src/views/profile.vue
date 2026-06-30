<script setup>
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import api, { ENDPOINTS, BASE_URL } from '@/api'

const { proxy } = getCurrentInstance()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isEditing = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')
const imgPreview = ref('')
const imgFile = ref(null)
const fileInput = ref(null)
const isSaving = ref(false)
const showPasswordSection = ref(false)

const form = reactive({
    name: '',
    surname: '',
    father_name: '',
    phone: '',
    phone2: '',
    birthDate: '',
    userCode: '',
    uniqueCode: '',
    username: '',
})

const passwords = reactive({
    current: '',
    new: '',
    confirm: '',
})

const passwordError = ref('')

onMounted(() => {
    fillForm()
    checkTgStatus()
})

const fillForm = () => {
    const u = authStore.user
    if (!u) return
    form.name = u.name || ''
    form.surname = u.surname || ''
    form.father_name = u.father_name || ''
    form.phone = u.phone || ''
    form.phone2 = u.phone2 || ''
    form.birthDate = u.birthDate ? u.birthDate.split('T')[0] : ''
    form.userCode = u.userCode || ''
    form.uniqueCode = u.uniqueCode || ''
    form.username = u.username || ''
    imgPreview.value = u.img || ''
}

const fullName = computed(() => {
    const parts = [form.surname, form.name, form.father_name].filter(Boolean)
    return parts.length ? parts.join(' ') : (form.username || 'Foydalanuvchi')
})

const roleLabel = computed(() => ({
    ADMIN: proxy.$t('Administrator'),
    YURIST: proxy.$t('Yurist'),
    KASSIR: proxy.$t('Kassir'),
    RAHBAR: proxy.$t('Rahbar'),
}[authStore.userRole] || authStore.userRole))

const handleImgChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    imgFile.value = file
    imgPreview.value = URL.createObjectURL(file)
}

const startEdit = () => {
    isEditing.value = true
    saveSuccess.value = false
    saveError.value = ''
}

const cancelEdit = () => {
    isEditing.value = false
    showPasswordSection.value = false
    fillForm()
    imgFile.value = null
    passwords.current = ''
    passwords.new = ''
    passwords.confirm = ''
    passwordError.value = ''
}

const saveProfile = async () => {
    // ... parol tekshiruvlari ...

    isSaving.value = true;
    try {
        const formData = new FormData();

        // Oddiy maydonlar
        if (form.name) formData.append('name', form.name);
        if (form.surname) formData.append('surname', form.surname);
        if (form.father_name) formData.append('father_name', form.father_name);
        if (form.phone) formData.append('phone', form.phone);
        if (form.phone2) formData.append('phone2', form.phone2);
        if (form.birthDate) formData.append('birthDate', form.birthDate);
        if (form.userCode) formData.append('userCode', form.userCode);
        if (form.uniqueCode) formData.append('uniqueCode', form.uniqueCode);

        if (imgPreview.value === '') {
            formData.append('img', '');
        }
        // Parol
        if (showPasswordSection.value && passwords.new) {
            formData.append('currentPassword', passwords.current);
            formData.append('password', passwords.new);
        }

        // Rasm
        if (imgFile.value instanceof File) {
            formData.append('img', imgFile.value);
        }

        const { data } = await api.post(ENDPOINTS.ME, formData)

        if (!data) throw new Error('Saqlashda xatolik')

        authStore.user = { ...authStore.user, ...data.user }
        localStorage.setItem('user', JSON.stringify(authStore.user));

        saveSuccess.value = true;
        isEditing.value = false;
        showPasswordSection.value = false;
        imgFile.value = null;

    } catch (err) {
        saveError.value = err.message;
    } finally {
        isSaving.value = false;
    }
};
const removeImage = () => {
    imgFile.value = null
    imgPreview.value = ''
}

// Telegram login
const tgStatus = ref('loading') // 'loading' | 'connected' | 'disconnected'
const tgPhone = ref('')
const tgCode = ref('')
const tgStep = ref(1)
const tgLoading = ref(false)
const tgError = ref('')

const checkTgStatus = async () => {
    try {
        const { data } = await api.get('/api/telegram/status')
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
        await api.post('/api/telegram/send-code', { phone: tgPhone.value })
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
        await api.post('/api/telegram/sign-in', { phone: tgPhone.value, code: tgCode.value })
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
        await api.post('/api/telegram/logout')
        tgStatus.value = 'disconnected'
        tgPhone.value = ''
        tgStep.value = 1
    } catch {
        tgStatus.value = 'disconnected'
    } finally {
        tgLoading.value = false
    }
}

const fields = computed(() => [
    { label: proxy.$t('Ism'), key: 'name', type: 'text', placeholder: proxy.$t('Ismingizni kiriting') },
    { label: proxy.$t('Familiya'), key: 'surname', type: 'text', placeholder: proxy.$t('Familiyangizni kiriting') },
    { label: proxy.$t('Otasining ismi'), key: 'father_name', type: 'text', placeholder: proxy.$t('Otangizning ismini kiriting') },
    { label: proxy.$t('Login'), key: 'username', type: 'text', placeholder: '', readonly: true },
    { label: proxy.$t('Telefon'), key: 'phone', type: 'tel', placeholder: '+998 XX XXX XX XX' },
    { label: proxy.$t("Qo'shimcha telefon"), key: 'phone2', type: 'tel', placeholder: '+998 XX XXX XX XX' },
    { label: proxy.$t("Tug'ilgan sana"), key: 'birthDate', type: 'date', placeholder: '' },
    { label: proxy.$t('Pasport seriya raqami'), key: 'userCode', type: 'text', placeholder: 'AA1234567' },
    { label: proxy.$t('JSHSHIR'), key: 'uniqueCode', type: 'text', placeholder: proxy.$t('14 raqam') },
])
const formatField = (field, e) => {
    let value = e.target.value;

    // Telefon
    if (field === 'phone' || field === 'phone2') {
        value = value.replace(/\D/g, '');

        if (value.startsWith('998')) {
            value = value.slice(3);
        }

        value = value.slice(0, 9);

        let formatted = '+998';

        if (value.length > 0) formatted += ` ${value.slice(0, 2)}`;
        if (value.length > 2) formatted += ` ${value.slice(2, 5)}`;
        if (value.length > 5) formatted += ` ${value.slice(5, 7)}`;
        if (value.length > 7) formatted += ` ${value.slice(7, 9)}`;

        form[field] = formatted;
    }

    // Pasport seriya
    else if (field === 'userCode') {
        value = value.toUpperCase();

        let letters = '';
        let digits = '';

        for (const char of value) {
            if (/[A-Z]/.test(char) && letters.length < 2) {
                letters += char;
            } else if (
                /[0-9]/.test(char) &&
                letters.length === 2 &&
                digits.length < 7
            ) {
                digits += char;
            }
        }

        form[field] = digits ? `${letters} ${digits}` : letters;
    }

    // JSHSHIR
    else if (field === 'uniqueCode') {
        form[field] = value.replace(/\D/g, '').slice(0, 14);
    }
};
</script>

<template>
    <div class="max-w-3xl mx-auto space-y-5">

        <!-- Profile header card -->
        <div
            class="rounded p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden"
            style="background:#1A3A6B;">
            <div class="absolute top-0 right-0 w-0 h-0 pointer-events-none"></div>

            <!-- Avatar -->
            <div class="relative shrink-0">
                <div class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20">
                    <img v-if="imgPreview" :src="imgPreview.startsWith('blob:') ? imgPreview : `${BASE_URL}${imgPreview}`"
                        class="w-full h-full object-cover" />
                    <img v-else src="../../public/User-avatar.svg.png" class="w-full h-full object-cover" />
                    <button v-if="isEditing && imgPreview" @click="removeImage"
                        class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                        ✕
                    </button>
                </div>
                <button v-if="isEditing" @click="fileInput.click()"
                    class="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-3.5 h-3.5 text-[#0a1850]">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                </button>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImgChange" />
            </div>

            <!-- Name & role -->
            <div class="flex-1 text-center sm:text-left">
                <h2 class="text-white text-xl font-semibold">{{ fullName }}</h2>
                <div
                    class="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white/80 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                        stroke="currentColor" class="w-3 h-3">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {{ roleLabel }}
                </div>
                <p v-if="form.phone" class="mt-1 text-white/50 text-xs">{{ form.phone }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 sm:self-start">
                <template v-if="!isEditing">
                    <button @click="startEdit"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0a1850] text-xs font-semibold hover:bg-slate-100 transition-all active:scale-[0.98]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                        {{ $t('Tahrirlash') }}
                    </button>
                </template>
                <template v-else>
                    <button @click="cancelEdit"
                        class="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-all">
                        {{ $t('Bekor') }}
                    </button>
                    <button @click="saveProfile" :disabled="isSaving"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0a1850] text-xs font-semibold hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-60">
                        <span v-if="isSaving"
                            class="w-3.5 h-3.5 border-2 border-[#0a1850]/30 border-t-[#0a1850] rounded-full animate-spin"></span>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {{ isSaving ? $t('Saqlanmoqda...') : $t('Saqlash') }}
                    </button>
                </template>
            </div>
        </div>

        <!-- Success / Error alerts -->
        <div v-if="saveSuccess"
            class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                class="w-4 h-4 shrink-0 text-emerald-500">
                <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clip-rule="evenodd" />
            </svg>
            {{ $t("Ma'lumotlar muvaffaqiyatli saqlandi!") }}
        </div>
        <div v-if="saveError"
            class="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                class="w-4 h-4 shrink-0 text-red-500">
                <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
            </svg>
            {{ saveError }}
        </div>

        <!-- Info fields card -->
        <div class="rounded overflow-hidden shadow-sm"
            :style="themeStore.isDark ? 'background:#264a75; border:1px solid #3a6090;' : 'background:#ffffff; border:1px solid #d8dde6;'">
            <div class="px-6 py-4 border-b flex items-center gap-3"
                :style="themeStore.isDark ? 'border-color:#3a6090; background:#1e3a5f;' : 'border-color:#eaecf0; background:#f7f8fa;'">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center"
                    :class="themeStore.isDark ? 'bg-blue-500/15' : 'bg-blue-50'">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-3.5 h-3.5 text-blue-500">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <h3 class="text-sm font-bold"
                    :style="themeStore.isDark ? 'color:#ddeaff' : 'color:#1a1f36'">
                    {{ $t("Shaxsiy ma'lumotlar") }}
                </h3>
            </div>

            <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="field in fields" :key="field.key" class="space-y-1.5">
                    <label class="block text-[11px] font-semibold uppercase tracking-widest"
                        :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                        {{ $t(field.label) }}
                    </label>
                    <template v-if="isEditing && !field.readonly">
                        <input v-model="form[field.key]"
                            :type="field.key === 'uniqueCode' ? 'text' : field.type"
                            :placeholder="field.placeholder"
                            @input="formatField(field.key, $event)"
                            class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1a2e7a]/25"
                            :class="themeStore.isDark
                                ? 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/8'
                                : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#1a2e7a] focus:bg-white'" />
                    </template>
                    <template v-else>
                        <div class="px-3.5 py-2.5 rounded-xl text-sm font-medium"
                            :class="form[field.key]
                                ? themeStore.isDark ? 'text-slate-200 bg-white/4' : 'text-slate-800 bg-slate-50'
                                : themeStore.isDark ? 'text-slate-600 italic' : 'text-slate-400 italic'">
                            {{ form[field.key] || $t("Ko'rsatilmagan") }}
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Telegram ulanish card -->
        <div class="rounded overflow-hidden shadow-sm"
            :style="themeStore.isDark ? 'background:#264a75; border:1px solid #3a6090;' : 'background:#ffffff; border:1px solid #d8dde6;'">
            <div class="px-6 py-4 border-b flex items-center gap-3"
                :style="themeStore.isDark ? 'border-color:#3a6090; background:#1e3a5f;' : 'border-color:#eaecf0; background:#f7f8fa;'">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center" style="background:#229ED9/15">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#229ED9" class="w-4 h-4">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.4 13.893l-2.93-.918c-.638-.196-.651-.638.136-.943l11.438-4.41c.531-.197.999.131.85.599z"/>
                    </svg>
                </div>
                <h3 class="text-sm font-bold" :style="themeStore.isDark ? 'color:#ddeaff' : 'color:#1a1f36'">
                    Telegram ulanish
                </h3>
                <span v-if="tgStatus === 'connected'"
                    class="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    Ulangan ✓
                </span>
                <span v-else-if="tgStatus === 'disconnected'"
                    class="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    Ulanmagan
                </span>
            </div>

            <div class="p-6 space-y-4">
                <!-- Ulangan holat -->
                <div v-if="tgStatus === 'connected'" class="space-y-3">
                    <div class="flex items-center gap-3 p-3 rounded-xl"
                        :class="themeStore.isDark ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-200'">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-emerald-500 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Muvaffaqiyatli ulangan</p>
                            <p v-if="tgPhone" class="text-xs text-emerald-600/70 dark:text-emerald-500/70">+{{ tgPhone }}</p>
                        </div>
                    </div>
                    <button @click="tgLogout" :disabled="tgLoading"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 border border-red-200 dark:border-red-800/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-60">
                        <div v-if="tgLoading" class="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        Chiqish (logout)
                    </button>
                </div>

                <!-- Login holat -->
                <div v-else class="space-y-4">
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                        Telegram akkauntingizni ulang — shundan keyin mijozlarga to'g'ridan-to'g'ri xabar yuborish mumkin bo'ladi.
                    </p>

                    <!-- Qadam 1: telefon -->
                    <div v-if="tgStep === 1" class="space-y-3">
                        <div class="space-y-1.5">
                            <label class="block text-[11px] font-semibold uppercase tracking-widest"
                                :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                                Telefon raqam (xalqaro format)
                            </label>
                            <input v-model="tgPhone" type="tel" placeholder="+998901234567"
                                class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                                :class="themeStore.isDark
                                    ? 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 focus:border-[#229ED9]'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#229ED9]'" />
                        </div>
                        <p v-if="tgError" class="text-xs text-red-500">{{ tgError }}</p>
                        <button @click="tgSendCode" :disabled="tgLoading || !tgPhone"
                            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                            style="background:#229ED9;">
                            <div v-if="tgLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            SMS kod yuborish
                        </button>
                    </div>

                    <!-- Qadam 2: kod -->
                    <div v-if="tgStep === 2" class="space-y-3">
                        <div class="space-y-1.5">
                            <label class="block text-[11px] font-semibold uppercase tracking-widest"
                                :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                                Telegram dan kelgan kod
                            </label>
                            <input v-model="tgCode" type="text" placeholder="12345" maxlength="6"
                                class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none tracking-widest font-mono"
                                :class="themeStore.isDark
                                    ? 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 focus:border-[#229ED9]'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#229ED9]'" />
                        </div>
                        <p v-if="tgError" class="text-xs text-red-500">{{ tgError }}</p>
                        <div class="flex gap-2">
                            <button @click="tgStep = 1; tgCode = ''; tgError = ''"
                                class="px-4 py-2.5 rounded-xl text-sm font-medium"
                                :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">
                                Orqaga
                            </button>
                            <button @click="tgSignIn" :disabled="tgLoading || !tgCode"
                                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                                style="background:#229ED9;">
                                <div v-if="tgLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Tasdiqlash
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Password change card -->
        <div class="rounded overflow-hidden shadow-sm"
            :style="themeStore.isDark ? 'background:#264a75; border:1px solid #3a6090;' : 'background:#ffffff; border:1px solid #d8dde6;'">
            <button @click="showPasswordSection = !showPasswordSection"
                class="w-full px-6 py-4 flex items-center justify-between transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-7 h-7 rounded-xl flex items-center justify-center"
                        :class="themeStore.isDark ? 'bg-violet-500/15' : 'bg-violet-50'">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-3.5 h-3.5 text-violet-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h3 class="text-sm font-bold"
                        :style="themeStore.isDark ? 'color:#ddeaff' : 'color:#1a1f36'">
                        {{ $t("Parolni o'zgartirish") }}
                    </h3>
                </div>
                <div class="w-7 h-7 rounded-xl flex items-center justify-center transition-colors"
                    :class="themeStore.isDark ? 'bg-white/5' : 'bg-slate-100'">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                        stroke="currentColor" class="w-3.5 h-3.5 text-slate-400 transition-transform"
                        :class="showPasswordSection ? 'rotate-180' : ''">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </button>

            <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                leave-active-class="transition-all duration-150 ease-in"
                leave-to-class="opacity-0 -translate-y-2">
                <div v-if="showPasswordSection" class="px-6 pb-6 space-y-4 border-t pt-5"
                    :style="themeStore.isDark ? 'border-color:#3a6090' : 'border-color:#eaecf0'">

                    <div v-if="passwordError"
                        class="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 shrink-0">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        {{ passwordError }}
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-semibold uppercase tracking-widest"
                            :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                            {{ $t('Joriy parol') }}
                        </label>
                        <input v-model="passwords.current" type="password" :placeholder="$t('Joriy parolni kiriting')"
                            class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1a2e7a]/25"
                            :class="themeStore.isDark
                                ? 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 focus:border-blue-500/50'
                                : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#1a2e7a] focus:bg-white'" />
                    </div>

                    <div class="grid sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label class="block text-[11px] font-semibold uppercase tracking-widest"
                                :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                                {{ $t('Yangi parol') }}
                            </label>
                            <input v-model="passwords.new" type="password" :placeholder="$t('Yangi parol (min. 6)')"
                                class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1a2e7a]/25"
                                :class="themeStore.isDark
                                    ? 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 focus:border-blue-500/50'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#1a2e7a] focus:bg-white'" />
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-[11px] font-semibold uppercase tracking-widest"
                                :style="themeStore.isDark ? 'color:#4d7eaa' : 'color:#4a5568'">
                                {{ $t('Tasdiqlash') }}
                            </label>
                            <input v-model="passwords.confirm" type="password" :placeholder="$t('Parolni qayta kiriting')"
                                class="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1a2e7a]/25"
                                :class="themeStore.isDark
                                    ? 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 focus:border-blue-500/50'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#1a2e7a] focus:bg-white'" />
                        </div>
                    </div>

                    <button @click="saveProfile" :disabled="isSaving"
                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                        style="background:#1A3A6B;">
                        <span v-if="isSaving"
                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2"
                            stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {{ isSaving ? $t('Saqlanmoqda...') : $t("Parolni o'zgartirish") }}
                    </button>
                </div>
            </Transition>
        </div>

    </div>
</template>

<style scoped>
.btn-primary {
    background: #1A3A6B;
}
.btn-primary:hover {
    background: #163060;
}
</style>