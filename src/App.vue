<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
// Initialize theme store on app start so dark class is applied immediately
useThemeStore()
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles can go here if needed */
</style>
