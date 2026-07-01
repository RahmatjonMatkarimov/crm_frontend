<!-- components/users.modal.vue -->
<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUserModalStore } from '../../stores/users.modal'
import { useThemeStore } from '../../stores/theme'

const { proxy } = getCurrentInstance()
const authStore = useAuthStore()
const userModalStore = useUserModalStore()
const themeStore = useThemeStore()

const availableRoles = computed(() => {
    if (authStore.user?.role === 'ADMIN') {
        return [
            { value: 'KASSIR', label: proxy.$t('Kassir') },
            { value: 'YURIST', label: proxy.$t('Yurist') },
            { value: 'RAHBAR', label: proxy.$t('Rahbar') },
            { value: 'ADMIN', label: proxy.$t('Administrator') },
        ]
    }
    return [
        { value: 'KASSIR', label: proxy.$t('Kassir') },
        { value: 'YURIST', label: proxy.$t('Yurist') },
    ]
})

const newUserName = ref('')
const newUserSurname = ref('')
const newUserFatherName = ref('')
const newUserUsername = ref('')
const newUserPassword = ref('')
const newUserPhone = ref('')
const newUserPhone2 = ref('')
const newUserTelegram = ref('')
const newUserBirthDate = ref('')
const newUserUserCode = ref('')
const newUserUniqueCode = ref('')
const newUserRole = ref('KASSIR')
const newUserImg = ref(null)
const imgPreview = ref('')
const showPassword = ref(false)

const userCreateError = ref('')
const userCreateSuccess = ref('')

const handleImgChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        newUserImg.value = file
        imgPreview.value = URL.createObjectURL(file)
    }
}

const handlePhoneInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.startsWith('998')) {
        value = value.slice(3);
    }

    value = value.slice(0, 9);

    let formatted = '+998';

    if (value.length > 0) formatted += ` ${value.slice(0, 2)}`;
    if (value.length > 2) formatted += ` ${value.slice(2, 5)}`;
    if (value.length > 5) formatted += ` ${value.slice(5, 7)}`;
    if (value.length > 7) formatted += ` ${value.slice(7, 9)}`;

    newUserPhone.value = formatted;
};
const handlePhoneInput2 = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.startsWith('998')) {
        value = value.slice(3);
    }

    value = value.slice(0, 9);

    let formatted = '+998';

    if (value.length > 0) formatted += ` ${value.slice(0, 2)}`;
    if (value.length > 2) formatted += ` ${value.slice(2, 5)}`;
    if (value.length > 5) formatted += ` ${value.slice(5, 7)}`;
    if (value.length > 7) formatted += ` ${value.slice(7, 9)}`;

    newUserPhone2.value = formatted;
};
const handleInput = () => {
    let val = newUserTelegram.value

    if (!val) return

    // @ bo'lmasa birinchi belgini tekshiramiz
    const firstChar = val.replace(/^@/, '').charAt(0)

    // Harf bo'lsa
    if (/[a-zA-Z]/.test(firstChar)) {
        newUserTelegram.value = '@' + val.replace(/^@/, '')
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

    newUserTelegram.value = formatted
}

const handlePassportInput = (e) => {
    let value = e.target.value.toUpperCase();

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

    newUserUserCode.value = digits ? `${letters} ${digits}` : letters;
};

const autoCapFirst = (fieldRef) => {
    if (fieldRef.value && fieldRef.value[0] !== fieldRef.value[0].toUpperCase()) {
        fieldRef.value = fieldRef.value.charAt(0).toUpperCase() + fieldRef.value.slice(1)
    }
}

watch(newUserName, () => autoCapFirst(newUserName))
watch(newUserSurname, () => autoCapFirst(newUserSurname))
watch(newUserFatherName, () => autoCapFirst(newUserFatherName))

const resetForm = () => {
    newUserName.value = ''
    newUserSurname.value = ''
    newUserFatherName.value = ''
    newUserUsername.value = ''
    newUserPassword.value = ''
    newUserPhone.value = ''
    newUserPhone2.value = ''
    newUserTelegram.value = ''
    newUserBirthDate.value = ''
    newUserUserCode.value = ''
    newUserUniqueCode.value = ''
    newUserRole.value = 'KASSIR'
    newUserImg.value = null
    imgPreview.value = ''
    showPassword.value = false
}

const addUser = async () => {
    userCreateError.value = ''
    userCreateSuccess.value = ''

    if (!newUserUsername.value || !newUserPassword.value || !newUserPhone.value || !newUserSurname.value || !newUserFatherName.value || !newUserBirthDate.value || !newUserUserCode.value || !newUserUniqueCode.value || !newUserRole.value || !newUserName.value || !newUserTelegram.value) {
        userCreateError.value = 'barcha maydonlarni kiritilishi shart, faqat rasm va qo\'shimcha telefon raqami ixtiyoriy'
        return
    }
    if (newUserPassword.value.length < 6) {
        userCreateError.value = proxy.$t("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
        return
    }
    if (newUserUniqueCode.value.length !== 14) {
        userCreateError.value = proxy.$t("JSHSHIR 14 ta raqamdan iborat bo'lishi kerak")
        return
    }

    const result = await authStore.createUser({
        username: newUserUsername.value,
        password: newUserPassword.value,
        name: newUserName.value,
        surname: newUserSurname.value,
        father_name: newUserFatherName.value,
        phone: newUserPhone.value,
        phone2: newUserPhone2.value,
        telegram: newUserTelegram.value,
        birthDate: newUserBirthDate.value,
        userCode: newUserUserCode.value,
        uniqueCode: +newUserUniqueCode.value ? Number(newUserUniqueCode.value) : undefined,
        role: newUserRole.value,
        img: newUserImg.value
    })

    if (result.success) {
        userCreateSuccess.value = `"${newUserUsername.value}" muvaffaqiyatli yaratildi!`
        resetForm()
    } else {
        userCreateError.value = result.error
    }
}

const closeModal = () => {
    userModalStore.closeUserModal()
    userCreateError.value = ''
    userCreateSuccess.value = ''
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="userModalStore.isUserModalVisible" @click.self="closeModal"
                class="fixed inset-0 z-50 flex"
                style="background:rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
                <div class="relative w-full h-full flex flex-col overflow-hidden shadow-2xl"
                    style="background:var(--bg-card);">

                    <!-- Modal header -->
                    <div class="px-6 py-5 flex items-center justify-between shrink-0" style="border-bottom:1px solid var(--border);">
                        <div>
                            <h2 class="text-base font-bold tracking-wide" style="color:var(--text-1);">{{ $t("Yangi xodim qo'shish") }}</h2>
                            <p class="text-sm mt-0.5" style="color:var(--text-2);">{{ $t("Barcha majburiy maydonlarni to'ldiring") }}</p>
                        </div>
                        <button @click="closeModal"
                            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style="background:var(--border-light); color:var(--text-2);">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Scrollable body -->
                    <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">

                        <!-- Alerts -->
                        <div v-if="userCreateSuccess"
                            class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                class="w-4 h-4 shrink-0 text-emerald-500">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                    clip-rule="evenodd" />
                            </svg>
                            {{ userCreateSuccess }}
                        </div>
                        <div v-if="userCreateError"
                            class="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                class="w-4 h-4 shrink-0 text-red-500">
                                <path fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clip-rule="evenodd" />
                            </svg>
                            {{ userCreateError }}
                        </div>

                        <!-- Avatar upload -->
                        <div>
                            <label
                                class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-2">{{
                                $t('Profil rasmi') }}</label>
                            <label class="cursor-pointer inline-block">
                                <div
                                    class="w-20 h-20 border-2 border-dashed border-[var(--border)] rounded-xl overflow-hidden flex items-center justify-center hover:border-[var(--text-1)] transition-colors bg-[var(--border-light)]">
                                    <img v-if="imgPreview" :src="imgPreview" class="w-full h-full object-cover" />
                                    <div v-else class="flex flex-col items-center gap-1 text-[var(--text-2)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        </svg>
                                        <span class="text-[10px]">{{ $t('Rasm') }}</span>
                                    </div>
                                </div>
                                <input type="file" accept="image/*" @change="handleImgChange" class="hidden" />
                            </label>
                        </div>

                        <!-- Form grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <!-- Name -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('Ism') }} <span class="text-red-500">*</span></label>
                                <input v-model="newUserName" type="text" :placeholder="$t('Ismni kiriting')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>

                            <!-- Surname -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('Familiya') }} <span class="text-red-500">*</span></label>
                                <input v-model="newUserSurname" type="text" :placeholder="$t('Familiyani kiriting')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>

                            <!-- Father name -->
                            <div class="space-y-1 sm:col-span-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('Otasining ismi') }} <span class="text-red-500">*</span></label>
                                <input v-model="newUserFatherName" type="text"
                                    :placeholder="$t('Otasining ismini kiriting')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>

                            <!-- Username -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">
                                    {{ $t('Login') }} <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-[var(--text-2)]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </span>
                                    <input v-model="newUserUsername" type="text" required
                                        :placeholder="$t('Loginni kiriting')"
                                        class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                                </div>
                            </div>

                            <!-- Password -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">
                                    {{ $t('Parol') }} <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-[var(--text-2)]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </span>
                                    <input v-model="newUserPassword" :type="showPassword ? 'text' : 'password'" required
                                        :placeholder="$t('Parolni kiriting')"
                                        class="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                                    <button type="button" @click="showPassword = !showPassword"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-2)] hover:text-[var(--text-3)] transition-colors">
                                        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"
                                            class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Phone -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('Telefon') }} <span class="text-red-500">*</span></label>
                                <input v-model="newUserPhone" @input="handlePhoneInput" type="tel"
                                    placeholder="+998 XX XXX XX XX"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>

                            <!-- Phone 2 -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t("Qo'shimcha telefon") }}</label>
                                <input v-model="newUserPhone2" @input="handlePhoneInput2" type="tel"
                                    placeholder="+998 XX XXX XX XX"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>

                            <!-- Telegram -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('Telegram') }} <span class="text-red-500">*</span></label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[var(--text-2)]"
                                            viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                        </svg>
                                    </span>
                                    <input v-model="newUserTelegram" @input="handleInput" type="text"
                                        :placeholder="$t('@username yoki +998 XX XXX XX XX')"
                                        class="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                                </div>
                            </div>

                            <!-- Birth date -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t("Tug'ilgan sana") }} <span class="text-red-500">*</span></label>
                                <input v-model="newUserBirthDate" type="date"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>

                            <!-- User code -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('Pasport seriya raqami') }} <span class="text-red-500">*</span></label>
                                <input v-model="newUserUserCode" @input="handlePassportInput" type="text"
                                    :placeholder="$t('AA1234567')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>

                            <!-- Unique code -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('JSHSHIR') }}
                                    <span class="text-red-500">*</span></label>
                                <input v-model="newUserUniqueCode" type="text" inputmode="numeric"
                                    :placeholder="$t('14 raqam')" maxlength="14"
                                    @input="newUserUniqueCode = $event.target.value.replace(/\D/g, '').slice(0, 14)"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20" />
                            </div>
                            <!-- Role -->
                            <div class="space-y-1 sm:col-span-2">
                                <label
                                    class="block text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                    $t('Lavozim') }} <span class="text-red-500">*</span></label>
                                <select v-model="newUserRole"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[var(--border-light)] border border-[var(--border)] rounded-lg text-[var(--text-1)] text-sm transition-all focus:outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 cursor-pointer">
                                    <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                                        {{ role.label }}
                                    </option>
                                </select>
                            </div>

                        </div>
                    </div>

                    <!-- Modal footer -->
                    <div class="px-6 py-4 flex items-center justify-end gap-3 shrink-0"
                        style="border-top:1px solid var(--border); background:var(--border-light);">
                        <button @click="closeModal" class="btn btn-ghost">
                            {{ $t('Bekor qilish') }}
                        </button>
                        <button @click="addUser" :disabled="authStore.loading" class="btn btn-primary">
                            <span v-if="authStore.loading"
                                class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70"></span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                            </svg>
                            {{ authStore.loading ? $t('Yaratilmoqda...') : $t('Xodimni yaratish') }}
                        </button>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
    transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
    transform: scale(0.96) translateY(8px);
}
</style>