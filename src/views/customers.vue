<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { usePricesStore } from '@/stores/prices'
import { useSocket } from '@/utils/useSocket'
import { KANBAN_STATUS_ORDER, kanbanStatusLabels, statusInlineColors, statusIcons, getStatusCode } from '@/utils/customerStatus'

const authStore = useAuthStore()
const store = useCustomersStore()
const pricesStore = usePricesStore()
const router = useRouter()

const showPricesModal = ref(false)
const editingPriceOne = ref(0)
const editingPriceTwo = ref(0)

let unsubscribeCalled = null

onMounted(() => {
  store.fetchCustomers()
  pricesStore.fetchPrices()
  unsubscribeCalled = useSocket().onCustomerCalled(() => store.fetchCustomers())
})

onUnmounted(() => {
  if (unsubscribeCalled) unsubscribeCalled()
})

const openPricesModal = () => {
  editingPriceOne.value = pricesStore.prices.price_one
  editingPriceTwo.value = pricesStore.prices.price_two
  showPricesModal.value = true
}

const savePrices = async () => {
  const result = await pricesStore.updatePrices({
    price_one: editingPriceOne.value,
    price_two: editingPriceTwo.value,
  })
  if (result.success) {
    showPricesModal.value = false
    alert('Narx sozlamalari saqlandi!')
  } else {
    alert('Xatolik: ' + result.error)
  }
}

const groupedByStatus = computed(() =>
  KANBAN_STATUS_ORDER.map(key => ({
    key,
    label: kanbanStatusLabels[key],
    colors: statusInlineColors[key],
    count: store.customers.filter(c => c.status === key).length,
  }))
)

const openStatus = (key) => {
  router.push('/customers/status/' + getStatusCode(key))
}
</script>

<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="gov-page-title">{{ $t('Mijozlar') }}</h1>
        <p class="text-sm mt-1" style="color:var(--text-2);">
          {{ $t('Faol mijozlar') }} — {{ $t('Jami') }}
          <span class="font-bold" style="color:var(--text-1);">{{ store.customers.length }}</span>
          {{ $t('ta') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openPricesModal" v-if="authStore.permission.edit_prices" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8"
            stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          {{ $t('Narx sozlamalari') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex items-center justify-center py-16 gap-3" style="color:var(--text-2);">
      <div class="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
      <span class="text-sm">{{ $t('Yuklanmoqda...') }}</span>
    </div>

    <!-- Status cards: ustiga bosilganda shu statusdagi mijozlar sahifasi ochiladi -->
    <div v-else class="grid grid-cols-3 border-4 border-[var(--border)] rounded-2xl p-4 gap-4">
      <div v-for="col in groupedByStatus" :key="col.key" @click="openStatus(col.key)"
        class="card card-hover cursor-pointer p-6 transition-all flex items-center gap-4"
        style="border:2px solid var(--border);">
        <div class="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
          :style="{ background: col.colors.bg, color: col.colors.color }">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-10 h-10">
            <path v-for="(d, i) in statusIcons[col.key]" :key="i" stroke-linecap="round" stroke-linejoin="round"
              :d="d" />
          </svg>
        </div>
        <div class="flex-1 flex items-center justify-between gap-3 min-w-0">
          <h3 class="font-bold w-full text-center uppercase" style="color:var(--text-1);">
            {{ $t(col.label) }}
          </h3>
          <p class="text-2xl font-extrabold shrink-0" :style="{ color: col.colors.color }">{{ col.count }}</p>
        </div>
      </div>
    </div>

  </div>

  <!-- Global Prices Settings Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showPricesModal" class="fixed inset-0 z-50 flex"
        style="background:var(--overlay); backdrop-filter: blur(4px);" @click.self="showPricesModal = false">
        <div class="m-auto w-full max-w-md rounded-lg overflow-hidden flex flex-col shadow-2xl card">
          <div class="px-6 py-5 flex items-center justify-between border-b" style="border-color:var(--border);">
            <div>
              <h2 class="text-base font-bold tracking-wide" style="color:var(--text-1);">
                {{ $t("Xizmat narxlarini o'zgartirish") }}</h2>
              <p class="text-sm mt-0.5" style="color:var(--text-2);">{{ $t("Narxlarni o'zgartiring") }}</p>
            </div>
            <button @click="showPricesModal = false"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style="background:var(--border-light); color:var(--text-2);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4 flex-1">
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold uppercase tracking-wider" style="color:var(--text-2);">{{
                $t('1-narx (so\'mda)') }}</label>
              <input v-model="editingPriceOne" type="number" class="form-input bg-[var(--border-light)]" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold uppercase tracking-wider" style="color:var(--text-2);">{{
                $t('2-narx (so\'mda)') }}</label>
              <input v-model="editingPriceTwo" type="number" class="form-input bg-[var(--border-light)]" />
            </div>
          </div>

          <div class="px-6 py-4 flex justify-end gap-3 border-t"
            style="border-color:var(--border); background:var(--border-light);">
            <button @click="showPricesModal = false" class="btn btn-ghost btn-sm">
              {{ $t('Bekor qilish') }}
            </button>
            <button @click="savePrices" class="btn btn-primary btn-sm">
              {{ $t('Saqlash') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
