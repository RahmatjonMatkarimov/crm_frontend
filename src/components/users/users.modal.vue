<!-- components/users.modal.vue -->
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUserModalStore } from '../../stores/users.modal'
import { useThemeStore } from '../../stores/theme'

const authStore = useAuthStore()
const userModalStore = useUserModalStore()
const themeStore = useThemeStore()

const availableRoles = computed(() => {
    if (authStore.user?.role === 'ADMIN') {
        return [
            { value: 'KASSIR', label: 'Kassir' },
            { value: 'YURIST', label: 'Yurist' },
            { value: 'RAHBAR', label: 'Rahbar' },
            { value: 'ADMIN', label: 'Administrator' },
        ]
    }
    // RAHBAR faqat YURIST va KASSIR yarata oladi
    return [
        { value: 'KASSIR', label: 'Kassir' },
        { value: 'YURIST', label: 'Yurist' },
    ]
})

const newUserName = ref('')
const newUserSurname = ref('')
const newUserFatherName = ref('')
const newUserUsername = ref('')
const newUserPassword = ref('')
const newUserPhone = ref('')
const newUserPhone2 = ref('')
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

const resetForm = () => {
    newUserName.value = ''
    newUserSurname.value = ''
    newUserFatherName.value = ''
    newUserUsername.value = ''
    newUserPassword.value = ''
    newUserPhone.value = ''
    newUserPhone2.value = ''
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

    if (!newUserUsername.value || !newUserPassword.value || !newUserPhone.value || !newUserSurname.value || !newUserFatherName.value || !newUserBirthDate.value || !newUserUserCode.value || !newUserUniqueCode.value || !newUserRole.value || !newUserName.value) {
        userCreateError.value = 'barcha maydonlarni kiritilishi shart, faqat rasm va qo\'shimcha telefon raqami ixtiyoriy'
        return
    }
    if (newUserPassword.value.length < 6) {
        userCreateError.value = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
        return
    }
    if (newUserUniqueCode.value.length !== 14) {
        userCreateError.value = "JShSHIR 14 ta raqamdan iborat bo'lishi kerak"
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
                class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div
                    class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                    <!-- Modal header (styled like login gradient) -->
                    <div class="px-6 py-5 flex items-center justify-between relative overflow-hidden"
                        :style="{ background: themeStore.isDark ? 'linear-gradient(150deg, #0d1b3e 0%, #162766 55%, #1535c4 100%)' : 'linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%)' }">
                        <div
                            class="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full border border-white/5 pointer-events-none">
                        </div>
                        <div>
                            <h2 class="text-white text-base font-semibold">Yangi xodim qo'shish</h2>
                            <p class="text-white/50 text-xs mt-0.5">Barcha majburiy maydonlarni to'ldiring</p>
                        </div>
                        <button @click="closeModal"
                            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Scrollable body -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-5">

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
                                class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Profil
                                rasmi</label>
                            <label class="cursor-pointer inline-block">
                                <div
                                    class="w-20 h-20 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden flex items-center justify-center hover:border-[#1a2e7a] transition-colors bg-slate-50 dark:bg-slate-700">
                                    <img v-if="imgPreview" :src="imgPreview" class="w-full h-full object-cover" />
                                    <div v-else class="flex flex-col items-center gap-1 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        </svg>
                                        <span class="text-[10px]">Rasm</span>
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
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ism <span class="text-red-500">*</span></label>
                                <input v-model="newUserName" type="text" placeholder="Ismni kiriting"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>

                            <!-- Surname -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Familiya <span class="text-red-500">*</span></label>
                                <input v-model="newUserSurname" type="text" placeholder="Familiyani kiriting"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>

                            <!-- Father name -->
                            <div class="space-y-1 sm:col-span-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Otasining
                                    ismi <span class="text-red-500">*</span></label>
                                <input v-model="newUserFatherName" type="text" placeholder="Otasining ismini kiriting"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>

                            <!-- Username -->
                            <div class="space-y-1">
                                <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Login <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-slate-400">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </span>
                                    <input v-model="newUserUsername" type="text" required placeholder="Loginni kiriting"
                                        class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                                </div>
                            </div>

                            <!-- Password -->
                            <div class="space-y-1">
                                <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Parol <span class="text-red-500">*</span>
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
                                        placeholder="Parolni kiriting"
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

                            <!-- Phone -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telefon <span class="text-red-500">*</span></label>
                                <input v-model="newUserPhone" @input="handlePhoneInput" type="tel"
                                    placeholder="+998 XX XXX XX XX"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>

                            <!-- Phone 2 -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qo'shimcha
                                    telefon</label>
                                <input v-model="newUserPhone2" @input="handlePhoneInput2" type="tel"
                                    placeholder="+998 XX XXX XX XX"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>

                            <!-- Birth date -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tug'ilgan
                                    sana <span class="text-red-500">*</span></label>
                                <input v-model="newUserBirthDate" type="date"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>

                            <!-- User code -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passport
                                    seriya raqami <span class="text-red-500">*</span></label>
                                <input v-model="newUserUserCode" @input="handlePassportInput" type="text"
                                    placeholder="AA1234567"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>

                            <!-- Unique code -->
                            <div class="space-y-1">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">JShSHIR
                                    <span class="text-red-500">*</span></label>
                                <input v-model="newUserUniqueCode" type="text" inputmode="numeric"
                                    placeholder="14 raqam" maxlength="14"
                                    @input="newUserUniqueCode = $event.target.value.replace(/\D/g, '').slice(0, 14)"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                            </div>
                            <!-- Role -->
                            <div class="space-y-1 sm:col-span-2">
                                <label
                                    class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lavozim <span class="text-red-500">*</span></label>
                                <select v-model="newUserRole"
                                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 cursor-pointer">
                                    <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                                        {{ role.label }}
                                    </option>
                                </select>
                            </div>

                        </div>
                    </div>

                    <!-- Modal footer -->
                    <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button @click="closeModal"
                            class="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Bekor qilish
                        </button>
                        <button @click="addUser" :disabled="authStore.loading"
                            class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium btn-primary transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                            <span v-if="authStore.loading"
                                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                            </svg>
                            {{ authStore.loading ? 'Yaratilmoqda...' : 'Xodimni yaratish' }}
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