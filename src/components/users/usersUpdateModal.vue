<!-- components/users.modal.update.vue -->
<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUserModalStore } from '../../stores/users.modal'
import { useThemeStore } from '../../stores/theme'
import { BASE_URL } from '@/api'

const emit = defineEmits(['user-created'])

const { proxy } = getCurrentInstance()
const authStore = useAuthStore()
const userModalStore = useUserModalStore()
const themeStore = useThemeStore()

// Rejim
const isEditing = computed(() => !!userModalStore.editingUser?.id)

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
const editingUser = ref(null)

// Form
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

// Rasmni o'chirish
const removeImage = () => {
    newUserImg.value = null
    imgPreview.value = ''
}

// Rasm tanlash
const handleImgChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        newUserImg.value = file
        imgPreview.value = URL.createObjectURL(file)
    }
}

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

// Telefon formatlash
const handlePhoneInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('998')) value = value.slice(3);
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
    if (value.startsWith('998')) value = value.slice(3);
    value = value.slice(0, 9);
    let formatted = '+998';
    if (value.length > 0) formatted += ` ${value.slice(0, 2)}`;
    if (value.length > 2) formatted += ` ${value.slice(2, 5)}`;
    if (value.length > 5) formatted += ` ${value.slice(5, 7)}`;
    if (value.length > 7) formatted += ` ${value.slice(7, 9)}`;
    newUserPhone2.value = formatted;
};

// Passport seriya
const handlePassportInput = (e) => {
    let value = e.target.value.toUpperCase();
    let letters = '';
    let digits = '';
    for (const char of value) {
        if (/[A-Z]/.test(char) && letters.length < 2) letters += char;
        else if (/[0-9]/.test(char) && letters.length === 2 && digits.length < 7) digits += char;
    }
    newUserUserCode.value = digits ? `${letters} ${digits}` : letters;
};

// Formni to'ldirish
const fillForm = () => {
    const user = userModalStore.editingUser || {}
    editingUser.value = { ...user }

    newUserName.value = user.name || ''
    newUserSurname.value = user.surname || ''
    newUserFatherName.value = user.father_name || ''
    newUserUsername.value = user.username || ''
    newUserPhone.value = user.phone || ''
    newUserPhone2.value = user.phone2 || ''
    newUserTelegram.value = user.telegram || ''
    newUserBirthDate.value = user.birthDate ? user.birthDate.split('T')[0] : ''
    newUserUserCode.value = user.userCode || ''
    newUserUniqueCode.value = user.uniqueCode || ''
    newUserRole.value = user.role || 'KASSIR'
    imgPreview.value = user.img ? `${BASE_URL}${user.img}` : ''
    newUserPassword.value = ''
}

// Reset
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
    userCreateError.value = ''
    userCreateSuccess.value = ''
}

// Saqlash
const saveUser = async () => {
    userCreateError.value = ''
    userCreateSuccess.value = ''

    if (!newUserName.value || !newUserSurname.value || !newUserFatherName.value ||
        !newUserUsername.value || !newUserBirthDate.value || !newUserUserCode.value ||
        !newUserUniqueCode.value || !newUserTelegram.value) {
        userCreateError.value = 'Barcha majburiy maydonlarni to\'ldiring'
        return
    }

    if (newUserUniqueCode.value.length !== 14) {
        userCreateError.value = "JShSHIR 14 ta raqamdan iborat bo'lishi kerak"
        return
    }

    const formData = new FormData()
    formData.append('name', newUserName.value)
    formData.append('surname', newUserSurname.value)
    formData.append('father_name', newUserFatherName.value)
    formData.append('username', newUserUsername.value)
    formData.append('phone', newUserPhone.value)
    formData.append('phone2', newUserPhone2.value || '')
    formData.append('telegram', newUserTelegram.value || '')
    formData.append('birthDate', newUserBirthDate.value)
    formData.append('userCode', newUserUserCode.value)
    formData.append('uniqueCode', newUserUniqueCode.value)
    formData.append('role', newUserRole.value)

    if (newUserPassword.value) formData.append('password', newUserPassword.value)
    if (newUserImg.value instanceof File) formData.append('img', newUserImg.value)
    else if (imgPreview.value === '' && isEditing.value) formData.append('img', '')

    let result
    if (isEditing.value && editingUser.value?.id) {
        result = await authStore.updateUser(editingUser.value.id, formData)
    } else {
        result = await authStore.createUser(Object.fromEntries(formData))
    }

    if (result?.success) {
        userCreateSuccess.value = isEditing.value
            ? `"${newUserUsername.value}" muvaffaqiyatli yangilandi!`
            : `"${newUserUsername.value}" muvaffaqiyatli yaratildi!`

        emit('user-created')
        setTimeout(() => closeModal(), 1600)
    } else {
        userCreateError.value = result?.error || 'Xatolik yuz berdi'
    }
}

const closeModal = () => {
    userModalStore.closeEditModal()
    resetForm()
}

watch(
    () => userModalStore.isUserEditingModalVisible,
    (isVisible) => {
        if (isVisible && userModalStore.editingUser) {
            fillForm()
        }
    },
    { immediate: true }
)
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="userModalStore.isUserEditingModalVisible" @click.self="closeModal"
                class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

                <div
                    class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                    <!-- Header -->
                    <div class="px-6 py-5 flex items-center justify-between relative overflow-hidden"
                        :style="{ background: themeStore.isDark ? 'linear-gradient(150deg, #0d1b3e 0%, #162766 55%, #1535c4 100%)' : 'linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%)' }">
                        <div>
                            <h2 class="text-white text-base font-semibold">
                                {{ isEditing ? $t('Xodimni tahrirlash') : $t("Yangi xodim qo'shish") }}
                            </h2>
                            <p class="text-white/50 text-xs mt-0.5">{{ $t("Barcha majburiy maydonlarni to'ldiring") }}</p>
                        </div>
                        <button @click="closeModal"
                            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                            ✕
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-5">
                        <!-- Alerts -->
                        <div v-if="userCreateSuccess"
                            class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                            <!-- success icon -->
                            {{ userCreateSuccess }}
                        </div>
                        <div v-if="userCreateError"
                            class="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                            <!-- error icon -->
                            {{ userCreateError }}
                        </div>

                        <!-- Avatar -->
                        <div>
                            <label
                                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ $t('Profil rasmi') }}</label>
                            <label class="cursor-pointer inline-block">
                                <div
                                    class="w-24 h-24 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden flex items-center justify-center hover:border-[#1a2e7a] bg-slate-50 dark:bg-slate-700">
                                    <img v-if="imgPreview" :src="imgPreview" class="w-full h-full object-cover" />
                                    <div v-else class="flex flex-col items-center gap-1 text-slate-400">
                                        <span class="text-3xl">+</span>
                                        <span class="text-xs">{{ $t('Rasm') }}</span>
                                    </div>
                                </div>
                                <input type="file" accept="image/*" @change="handleImgChange" class="hidden" />
                            </label>
                            <button v-if="imgPreview && isEditing" @click="removeImage"
                                class="ml-4 text-red-500 text-sm hover:underline">
                                {{ $t("Rasmni o'chirish") }}
                            </button>
                        </div>

                        <!-- Form -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('Ism') }}
                                    </label>
                                <input v-model="newUserName" type="text" :placeholder="$t('Ismni kiriting')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a]" />
                            </div>
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('Familiya') }}
                                    </label>
                                <input v-model="newUserSurname" type="text" :placeholder="$t('Familiyani kiriting')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a]" />
                            </div>
                            <div class="space-y-1 sm:col-span-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('Otasining ismi') }}</label>
                                <input v-model="newUserFatherName" type="text" :placeholder="$t('Otasining ismini kiriting')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a]" />
                            </div>

                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('Login') }}
                                   </label>
                                <input v-model="newUserUsername" type="text" :placeholder="$t('Loginni kiriting')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a]" />
                            </div>

                            <!-- Parol -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {{ isEditing ? $t('Yangi parol (ixtiyoriy)') : $t('Parol') }}
                                    
                                </label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-slate-400">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </span>
                                    <input v-model="newUserPassword" :type="showPassword ? 'text' : 'password'" required
                                        :placeholder="$t('Parolni kiriting')"
                                        class="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                                    <button type="button" @click="showPassword = !showPassword"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
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


                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('Telefon') }}</label>
                                <input v-model="newUserPhone" @input="handlePhoneInput" type="tel"
                                    placeholder="+998 XX XXX XX XX"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a2e7a]" />
                            </div>
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t("Qo'shimcha telefon") }}</label>
                                <input v-model="newUserPhone2" @input="handlePhoneInput2" type="tel"
                                    placeholder="+998 XX XXX XX XX"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a2e7a]" />
                            </div>

                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{
                                    $t('Telegram') }} <span class="text-red-500">*</span></label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-400"
                                            viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                        </svg>
                                    </span>
                                    <input v-model="newUserTelegram" @input="handleInput" type="text"
                                        :placeholder="$t('@username yoki +998 XX XXX XX XX')"
                                        class="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t("Tug'ilgan sana") }}</label>
                                <input v-model="newUserBirthDate" type="date"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a2e7a]" />
                            </div>

                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('Passport seriya') }}</label>
                                <input v-model="newUserUserCode" @input="handlePassportInput" type="text"
                                    :placeholder="$t('AA1234567')"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a2e7a]" />
                            </div>

                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('JShSHIR') }}
                                </label>
                                <input v-model="newUserUniqueCode" type="text" maxlength="14" :placeholder="$t('14 raqam')"
                                    @input="newUserUniqueCode = $event.target.value.replace(/\D/g, '').slice(0, 14)"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a2e7a]" />
                            </div>

                            <div class="space-y-1 sm:col-span-2">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('Lavozim') }}
                                    </label>
                                <select v-model="newUserRole"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a2e7a]">
                                    <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                                        {{ role.label }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div
                        class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button @click="closeModal"
                            class="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
                            {{ $t('Bekor qilish') }}
                        </button>
                        <button @click="saveUser" :disabled="authStore.loading"
                            class="btn-primary px-5 py-2.5 rounded-lg text-white flex items-center gap-2">
                            <span v-if="authStore.loading"
                                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            {{ authStore.loading ? $t('Saqlanmoqda...') : (isEditing ? $t('Saqlash') : $t('Yaratish')) }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-header {
    background: linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%);
}

:global(.dark) .modal-header {
    background: linear-gradient(150deg, #0a1a5c 0%, #0f2a9e 55%, #1535c4 100%);
}

.btn-primary {
    background: linear-gradient(135deg, #0a1850, #1a2e7a);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #1a2e7a, #2a3e9a);
}
</style>