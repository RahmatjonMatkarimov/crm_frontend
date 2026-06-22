<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from './stores/auth';

useThemeStore()
const authStore = useAuthStore()

if (authStore.isAuthenticated) {
    authStore.fetchPermission()
}
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles can go here if needed */
</style>
