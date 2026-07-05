<template>
    <button @click="router.back()"
        class="w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer"
        style="background:var(--bg-page); border:1px solid var(--border); color:var(--text-2);"
        :title="langStore.t('Orqaga')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
            stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    </button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNavHistoryStore } from '@/stores/navHistory'
import { useLangStore } from '@/stores/lang'

const router = useRouter()
const navHistoryStore = useNavHistoryStore()
const langStore = useLangStore()
</script>
