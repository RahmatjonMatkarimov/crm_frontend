<script setup>
defineProps({
    checked: Boolean,
    indeterminate: Boolean,
})
defineEmits(['change'])
</script>

<template>
    <button type="button" @click="$emit('change')"
        class="relative w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-150 focus:outline-none"
        :style="(checked || indeterminate)
            ? 'background:#1A3A6B; border:2px solid #1A3A6B;'
            : 'background:#ffffff; border:2px solid #d8dde6;'
        ">
        <!-- Checkmark -->
        <svg v-if="checked && !indeterminate" xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <path d="M2 6l3 3 5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- Indeterminate dash -->
        <svg v-else-if="indeterminate" xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <path d="M2.5 6h7" stroke-width="2.5" stroke-linecap="round" />
        </svg>
    </button>
</template>
