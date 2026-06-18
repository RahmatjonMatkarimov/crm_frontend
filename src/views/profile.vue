<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

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

const roleLabel = computed(() => {
    const roles = {
        ADMIN: 'Administrator',
        YURIST: 'Yurist',
        KASSIR: 'Kassir',
        RAHBAR: 'Rahbar',
    }
    return roles[authStore.userRole] || authStore.userRole
})

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

        const response = await fetch('http://localhost:4000/api/users/me', {
            method: 'POST',           // yoki 'PATCH'
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Saqlashda xatolik');

        // Local store yangilash
        authStore.user = { ...authStore.user, ...data.user };
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

const fields = computed(() => [
    { label: 'Ism', key: 'name', type: 'text', placeholder: 'Ismingizni kiriting' },
    { label: 'Familiya', key: 'surname', type: 'text', placeholder: 'Familiyangizni kiriting' },
    { label: 'Otasining ismi', key: 'father_name', type: 'text', placeholder: 'Otangizning ismini kiriting' },
    { label: 'Login', key: 'username', type: 'text', placeholder: '', readonly: true },
    { label: 'Telefon', key: 'phone', type: 'tel', placeholder: '+998 XX XXX XX XX' },
    { label: "Qo'shimcha telefon", key: 'phone2', type: 'tel', placeholder: '+998 XX XXX XX XX' },
    { label: "Tug'ilgan sana", key: 'birthDate', type: 'date', placeholder: '' },
    { label: 'Passport seriya raqami', key: 'userCode', type: 'text', placeholder: 'AA1234567' },
    { label: 'JShSHIR', key: 'uniqueCode', type: 'text', placeholder: '14 raqam' },
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

    // Passport seriya
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

    // JShSHIR
    else if (field === 'uniqueCode') {
        form[field] = value.replace(/\D/g, '').slice(0, 14);
    }
};
</script>

<template>
    <div class="max-w-3xl mx-auto space-y-5">

        <!-- Profile header card -->
        <div
            class="rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden"
            :style="{ background: themeStore.isDark ? 'linear-gradient(150deg, #0d1b3e 0%, #162766 55%, #1535c4 100%)' : 'linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%)' }">
            <div
                class="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full border border-white/5 pointer-events-none">
            </div>

            <!-- Avatar -->
            <div class="relative shrink-0">
                <div class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20">
                    <img v-if="imgPreview" :src="`http://localhost:4000${imgPreview}`"
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
                        Tahrirlash
                    </button>
                </template>
                <template v-else>
                    <button @click="cancelEdit"
                        class="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-all">
                        Bekor
                    </button>
                    <button @click="saveProfile" :disabled="isSaving"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0a1850] text-xs font-semibold hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-60">
                        <span v-if="isSaving"
                            class="w-3.5 h-3.5 border-2 border-[#0a1850]/30 border-t-[#0a1850] rounded-full animate-spin"></span>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {{ isSaving ? 'Saqlanmoqda...' : 'Saqlash' }}
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
            Ma'lumotlar muvaffaqiyatli saqlandi!
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
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                    stroke="currentColor" class="w-4 h-4 text-[#1a2e7a] dark:text-slate-400">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <h3 class="text-sm font-semibold text-[#0a1850] dark:text-slate-100">Shaxsiy ma'lumotlar</h3>
            </div>

            <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div v-for="field in fields" :key="field.key" class="space-y-1">
                    <label class="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {{ field.label }}
                    </label>
                    <template v-if="isEditing && !field.readonly">
                        <input v-model="form[field.key]" :type="field.key === 'uniqueCode' ? 'text' : field.type"
                            :placeholder="field.placeholder" @input="formatField(field.key, $event)"
                            class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:border-slate-600 border border-slate-200 rounded-lg text-slate-900 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 placeholder-slate-400" />
                    </template>
                    <template v-else>
                        <div class="px-3 py-2.5 rounded-lg text-sm"
                            :class="form[field.key] ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 italic'">
                            {{ form[field.key] || "Ko'rsatilmagan" }}
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Password change card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <button @click="showPasswordSection = !showPasswordSection"
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
                        stroke="currentColor" class="w-4 h-4 text-[#1a2e7a] dark:text-slate-400">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <h3 class="text-sm font-semibold text-[#0a1850] dark:text-slate-100">Parolni o'zgartirish</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform"
                    :class="showPasswordSection ? 'rotate-180' : ''">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            <div v-if="showPasswordSection" class="px-6 pb-6 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-5">
                <div v-if="passwordError" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs">
                    {{ passwordError }}
                </div>

                <div class="space-y-1">
                    <label class="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Joriy
                        parol</label>
                    <input v-model="passwords.current" type="password" placeholder="Joriy parolni kiriting"
                        class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:border-slate-600 border border-slate-200 rounded-lg text-slate-900 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 placeholder-slate-400" />
                </div>
                <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yangi
                            parol</label>
                        <input v-model="passwords.new" type="password" placeholder="Yangi parol (min. 6)"
                            class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:border-slate-600 border border-slate-200 rounded-lg text-slate-900 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 placeholder-slate-400" />
                    </div>
                    <div class="space-y-1">
                        <label
                            class="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tasdiqlash</label>
                        <input v-model="passwords.confirm" type="password" placeholder="Parolni qayta kiriting"
                            class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:border-slate-600 border border-slate-200 rounded-lg text-slate-900 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 placeholder-slate-400" />
                    </div>
                </div>

                <button @click="saveProfile" :disabled="isSaving"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium btn-primary transition-all active:scale-[0.98] disabled:opacity-60">
                    <span v-if="isSaving"
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {{ isSaving ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish' }}
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
.profile-header {
    background: linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%);
}

:global(.dark) .profile-header {
    background: linear-gradient(150deg, #0a1a5c 0%, #0f2a9e 55%, #1535c4 100%);
}

.btn-primary {
    background: linear-gradient(135deg, #0a1850, #1a2e7a);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #1a2e7a, #2a3e9a);
}
</style>