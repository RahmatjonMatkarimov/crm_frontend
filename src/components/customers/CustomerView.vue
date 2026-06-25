<template>
    <div class="customer-detail p-6 max-w-6xl mx-auto">
        <!-- Yuklanmoqda -->
        <div v-if="loading" class="text-center py-20">
            <p class="text-xl text-gray-600 dark:text-gray-400">Ma'lumotlar yuklanmoqda...</p>
        </div>

        <!-- Mijoz topilmadi -->
        <div v-else-if="!customer" class="text-center py-20">
            <p class="text-red-500 text-xl">Mijoz topilmadi</p>
        </div>

        <!-- Asosiy kontent -->
        <div v-else>
            <!-- Sarlavha -->
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
                    {{ customer.fullName || customer.name || 'Noma\'lum mijoz' }}
                </h1>
                <button @click="goBack" class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                 text-gray-700 dark:text-gray-200 rounded-xl flex items-center gap-2 transition-colors">
                    ← Orqaga
                </button>
            </div>

            <!-- Mijoz ma'lumotlari -->
            <div
                class="bg-white dark:bg-gray-800 shadow rounded-2xl p-8 mb-10 border border-gray-100 dark:border-gray-700">
                <h2 class="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Mijoz haqida</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 text-lg">
                    <!-- Asosiy ma'lumotlar -->
                    <div class="flex items-center gap-4">
                        <span class="w-40 text-gray-600 dark:text-gray-400 font-medium">F.I.Sh:</span>
                        <span class="font-semibold text-gray-800 dark:text-white">
                            {{ customer.surname }} {{ customer.name }} {{ customer.father_name || '' }}
                        </span>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-40 text-gray-600 dark:text-gray-400 font-medium">Telefon 1:</span>
                        <span class="font-semibold text-gray-800 dark:text-white">{{ customer.phone || '-' }}</span>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-40 text-gray-600 dark:text-gray-400 font-medium">Telefon 2:</span>
                        <span class="font-semibold text-gray-800 dark:text-white">{{ customer.phone2 || '-' }}</span>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-40 text-gray-600 dark:text-gray-400 font-medium">Telegram:</span>
                        <span class="font-semibold text-gray-800 dark:text-white">{{ customer.telegram || '-' }}</span>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-40 text-gray-600 dark:text-gray-400 font-medium">Manzil:</span>
                        <span class="font-semibold text-gray-800 dark:text-white">
                            {{ customer.address || '-' }}
                            <span v-if="customer.region || customer.district" class="text-sm text-gray-500">
                                ({{ customer.region }} {{ customer.district }})
                            </span>
                        </span>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-40 text-gray-600 dark:text-gray-400 font-medium">Maslahat narxi:</span>
                        <span class="font-semibold text-gray-800 dark:text-white">
                            {{ Number(customer.price || 0) }} so'm
                        </span>
                    </div>

                    <!-- Tavsif -->
                    <div class="md:col-span-2" v-if="authStore.userRole ==='YURIST'||authStore.userRole==='RAHBAR'">
                        <span class="block text-gray-600 dark:text-gray-400 font-medium mb-1">Izoh / Tavsif:</span>
                        <p
                            class="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl whitespace-pre-wrap">
                            {{ customer.description || 'Izoh yo‘q' }}
                        </p>
                    </div>

                    <!-- Qo‘shimcha ma'lumotlar -->
                    <div class="md:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
                        <div class="grid grid-cols-2 gap-4">
                            <div>Yaratilgan sana: <span class="font-medium text-gray-700 dark:text-gray-300">{{
                                    formatDate(customer.createdAt) }}</span></div>
                            <div v-if="customer.assignedTo">
                                Mas'ul:
                                <span class="font-medium text-gray-700 dark:text-gray-300">
                                    {{ customer.assignedTo.name }} {{ customer.assignedTo.surname }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- To'lov Tarixi -->
            <div class="mb-10">
                <h2 class="text-2xl font-semibold mb-5 text-gray-800 dark:text-white">To'lov Tarixi</h2>
                <div
                    class="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <table class="w-full">
                        <thead class="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th class="px-6 py-4 text-left text-gray-600 dark:text-gray-400">Sana</th>
                                <th class="px-6 py-4 text-left text-gray-600 dark:text-gray-400">Summa</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            <tr v-for="payment in payments" :key="payment.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="px-6 py-5 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    {{ formatDate(payment.createdAt) }}
                                </td>
                                <td class="px-6 py-5 font-semibold text-emerald-600 dark:text-emerald-500">
                                    +{{ payment.amount }} so'm
                                </td>
                            </tr>
                            <tr v-if="payments.length === 0">
                                <td colspan="4" class="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                    Hali hech qanday to‘lov yo‘q
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Checklar -->
            <div>
                <h2 class="text-2xl font-semibold mb-5 text-gray-800 dark:text-white">Checklar</h2>

                <div v-if="checks.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div v-for="check in checks" :key="check.id" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                      rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200">

                        <div @click="openCheck(check)"
                            class="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition">

                            <!-- Rasm -->
                            <img v-if="isImage(check.checkUrl)" :src="check.checkUrl" class="w-full h-full object-cover"
                                alt="Check">

                            <!-- PDF -->
                            <div v-else-if="isPDF(check.checkUrl)"
                                class="flex flex-col items-center justify-center text-6xl">
                                <span class="text-red-500 dark:text-red-400">📕</span>
                                <span class="text-sm mt-3 text-gray-600 dark:text-gray-400 font-medium">PDF</span>
                            </div>

                            <!-- Boshqa -->
                            <span v-else class="text-7xl opacity-70 text-gray-400 dark:text-gray-600">📄</span>
                        </div>

                        <div class="p-4">
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                {{ formatDate(check.createdAt) }}
                            </div>
                            <button @click="openCheck(check)"
                                class="mt-3 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-1 transition">
                                Ochish →
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 
                          rounded-2xl p-16 text-center">
                    <p class="text-gray-500 dark:text-gray-400">Bu mijoz uchun hali check yuklanmagan</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const customer = ref(null)
const payments = ref([])
const checks = ref([])
const loading = ref(false)

const authStore = useAuthStore()

const token = localStorage.getItem('token')

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
})

// Ma'lumotlarni yuklash
const fetchCustomerData = async () => {
    const id = route.params.id
    if (!id) return

    loading.value = true
    try {
        const customerRes = await fetch(`http://localhost:4000/api/customers/${id}`, { headers: headers() })
        if (customerRes.ok) {
            customer.value = await customerRes.json()
            payments.value = customer.value.payments || []
        }

        const checksRes = await fetch(`http://localhost:4000/api/customers/${id}/checks`, { headers: headers() })
        if (checksRes.ok) {
            checks.value = await checksRes.json()
        }
    } catch (error) {
        console.error('Xatolik:', error)
        alert('Ma\'lumotlarni yuklashda xatolik yuz berdi')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchCustomerData()
})

// === Yordamchi funksiyalar ===
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const year = new Date(dateString).getFullYear()
    const month = new Date(dateString).getMonth() + 1
    const day = new Date(dateString).getDate()
    const hour = new Date(dateString).getHours()
    const minute = new Date(dateString).getMinutes()
    return `${day}.${month}.${year} ${hour}:${minute}`
}

const isImage = (url) => {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
}

const isPDF = (url) => {
    return /\.pdf$/i.test(url)
}

const openCheck = (check) => {
    const filterUrl = (url) => {
        if (!url) return url;

        // "/uploads/" yoki "uploads/" ni boshidan olib tashlaydi
        return url
            .replace(/^\/*uploads\//i, '/')           // /uploads/ ni / ga aylantiradi
            .replace(/^uploads\//i, '/');             // uploads/ ni / ga aylantiradi
    };
    console.log(filterUrl(check.check_url));
    window.location.href = `http://localhost:4000/${filterUrl(check.check_url)}`
}

const goBack = () => {
    router.push('/customers')
}
</script>