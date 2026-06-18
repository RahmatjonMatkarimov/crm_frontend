<script setup>
import { ref, watch, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({ editing: Object })
const emit = defineEmits(['close', 'saved'])

const store = useCustomersStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const name = ref('')
const surname = ref('')
const father_name = ref('')
const phone = ref('')
const phone2 = ref('')
const address = ref('')
const description = ref('')
const assignedToId = ref('')
const error = ref('')
const success = ref('')
const users = ref([])

onMounted(async () => {
    const res = await fetch('http://localhost:4000/api/auth/all-users', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    users.value = await res.json()
})

watch(() => props.editing, (val) => {
    name.value = val?.name || ''
    surname.value = val?.surname || ''
    father_name.value = val?.father_name || ''
    phone.value = val?.phone || ''
    phone2.value = val?.phone2 || ''
    address.value = val?.address || ''
    description.value = val?.description || ''
    assignedToId.value = val?.assignedToId || ''
    error.value = ''
    success.value = ''
}, { immediate: true })

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

const save = async () => {
    error.value = ''
    if (!name.value || !surname.value || !phone.value) {
        error.value = 'Ism, familiya va telefon majburiy'
        return
    }
    const data = { name: name.value, surname: surname.value, father_name: father_name.value || null,
        phone: phone.value, phone2: phone2.value || null, address: address.value || null,
        description: description.value || null, assignedToId: assignedToId.value || null }

    const result = props.editing?.id
        ? await store.updateCustomer(props.editing.id, data)
        : await store.createCustomer(data)

    if (result?.success) {
        success.value = props.editing?.id ? 'Mijoz yangilandi!' : 'Mijoz yaratildi!'
        emit('saved')
        setTimeout(() => emit('close'), 1200)
    } else {
        error.value = result?.error || 'Xatolik yuz berdi'
    }
}
</script>

<template>
    <Teleport to="body">
        <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="$emit('close')">
            <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div class="px-6 py-5 flex items-center justify-between"
                    :style="{ background: themeStore.isDark ? 'linear-gradient(150deg, #0d1b3e 0%, #162766 55%, #1535c4 100%)' : 'linear-gradient(150deg, #0c2ba6 0%, #1a3fe1 55%, #2439f0 100%)' }">
                    <div>
                        <h2 class="text-white text-base font-semibold">{{ editing?.id ? 'Mijozni tahrirlash' : 'Yangi mijoz qo\'shish' }}</h2>
                        <p class="text-white/50 text-xs mt-0.5">Majburiy maydonlarni to'ldiring</p>
                    </div>
                    <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">✕</button>
                </div>
                <div class="flex-1 overflow-y-auto p-6 space-y-4">
                    <div v-if="success" class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs">{{ success }}</div>
                    <div v-if="error" class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-xs">{{ error }}</div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ism <span class="text-red-500">*</span></label>
                            <input v-model="name" type="text" placeholder="Ismni kiriting" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                        </div>
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Familiya <span class="text-red-500">*</span></label>
                            <input v-model="surname" type="text" placeholder="Familiyani kiriting" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                        </div>
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Otasining ismi</label>
                            <input v-model="father_name" type="text" placeholder="Otasining ismi" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                        </div>
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telefon <span class="text-red-500">*</span></label>
                            <input v-model="phone" @input="handlePhone($event, 1)" type="tel" placeholder="+998 XX XXX XX XX" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                        </div>
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qo'shimcha telefon</label>
                            <input v-model="phone2" @input="handlePhone($event, 2)" type="tel" placeholder="+998 XX XXX XX XX" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                        </div>
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Manzil</label>
                            <input v-model="address" type="text" placeholder="Yashash manzili" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20" />
                        </div>
                        <div class="sm:col-span-2 space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mas'ul yurist</label>
                            <select v-model="assignedToId" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 cursor-pointer appearance-none">
                                <option value="">— Belgilanmagan —</option>
                                <option v-for="u in users" :key="u.id" :value="u.id">
                                    {{ u.surname }} {{ u.name }} ({{ u.role }})
                                </option>
                            </select>
                        </div>
                        <div class="sm:col-span-2 space-y-1">
                            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Izoh</label>
                            <textarea v-model="description" rows="3" placeholder="Qo'shimcha ma'lumot..." class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20 resize-none"></textarea>
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                    <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm">Bekor qilish</button>
                    <button @click="save" class="btn-primary px-5 py-2.5 rounded-lg text-white text-sm">{{ editing?.id ? 'Saqlash' : 'Yaratish' }}</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.btn-primary { background: linear-gradient(135deg, #1a3fd2, #2439f0); }
.btn-primary:hover { background: linear-gradient(135deg, #2439f0, #1a2e7a); }
</style>
