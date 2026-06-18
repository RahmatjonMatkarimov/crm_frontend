<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const usernameError = ref('')
const passwordError = ref('')

const validateUsername = () => {
  if (!username.value) {
    usernameError.value = 'Login kiritilishi shart'
  } else {
    usernameError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Parol kiritilishi shart'
  } else if (password.value.length < 6) {
    passwordError.value = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
  } else {
    passwordError.value = ''
  }
}

const handleLogin = async () => {
  validateUsername()
  validatePassword()

  if (usernameError.value || passwordError.value) {
    return
  }

  const success = await authStore.login(username.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none login-bg relative overflow-hidden">

    <!-- Background decorative circles -->
    <div class="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full border border-white/5 pointer-events-none"></div>
    <div class="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full border border-white/4 pointer-events-none"></div>

    <!-- Main card container -->
    <div class="w-full max-w-[420px] relative z-10">

      <!-- Card -->
      <div class="bg-white dark:bg-slate-800/90 dark:backdrop-blur rounded-2xl p-8 shadow-2xl border border-transparent dark:border-slate-700/50">

        <!-- Card heading -->
        <div class="mb-6">
          <h1 class="text-lg font-medium text-[#0a1850] dark:text-slate-100">Tizimga kirish</h1>
          <p class="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Iltimos, ma'lumotlaringizni kiriting</p>
        </div>

        <!-- Error alert -->
        <div
          v-if="authStore.error"
          class="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 shrink-0 text-red-500">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ authStore.error }}</span>
        </div>

        <form @submit.prevent="handleLogin" novalidate class="space-y-4">

          <!-- Username -->
          <div class="space-y-1">
            <label for="username" class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Login <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-slate-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </span>
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                v-model="username"
                @blur="validateUsername"
                @input="usernameError = ''"
                class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700"
                :class="usernameError
                  ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20'"
                placeholder="Loginni kiriting"
              />
            </div>
            <span v-if="usernameError" class="text-[11px] text-red-500 block">{{ usernameError }}</span>
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <label for="password" class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Parol <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4 text-slate-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                v-model="password"
                @blur="validatePassword"
                @input="passwordError = ''"
                class="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-700"
                :class="passwordError
                  ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'focus:border-[#1a2e7a] focus:ring-1 focus:ring-[#1a2e7a]/20'"
                placeholder="Parolni kiriting"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
            <span v-if="passwordError" class="text-[11px] text-red-500 block">{{ passwordError }}</span>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-2.5 rounded-lg font-medium text-sm text-white transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer mt-2 bg-[#0a1850] hover:bg-[#1a2e7a] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span
              v-if="authStore.loading"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>{{ authStore.loading ? 'Yuklanmoqda...' : 'Tizimga kirish' }}</span>
          </button>

        </form>
      </div>

      <!-- Footer -->
      <p class="text-center mt-4 text-[11px] text-white/30">
        © 2026 Yuridik Maslahat. Barcha huquqlar himoyalangan.
      </p>

    </div>
  </div>
</template>

<style scoped>
.login-bg {
  background: linear-gradient(150deg, #0a1850 0%, #1a2e7a 55%, #0a1850 100%);
}
</style>