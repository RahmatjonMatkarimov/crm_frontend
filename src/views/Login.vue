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
    passwordError.value = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
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
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#0f1d40] p-4 relative font-sans select-none">
    <!-- Center Card -->
    <div class="w-full max-w-[450px] bg-white rounded-2xl p-8 shadow-2xl transition-all">
      
      <!-- Justice Scales Logo -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-2xl bg-[#0f1d40] flex items-center justify-center text-amber-500 shadow-md">
          <!-- Scales of Justice SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-9 h-9">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17m0-17L6.75 7.5M12 3l5.25 4.5M3 13.5h7.5M13.5 13.5H21M6.75 7.5L3 13.5M6.75 7.5l3.75 6M17.25 7.5L13.5 13.5M17.25 7.5L21 13.5M6.75 20.25a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5zm10.5 0a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
          </svg>
        </div>
      </div>

      <!-- Title / Subtitle -->
      <div class="text-center mb-8">
        <h1 class="text-xl font-extrabold tracking-wide text-[#0f1d40] uppercase">
          Yurist Konsul Konsalting
        </h1>
        <p class="text-slate-500 text-xs mt-1 font-medium">
          Yuridik xizmatlarni boshqarish tizimi
        </p>
      </div>

      <!-- Error alert -->
      <div v-if="authStore.error" class="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 shrink-0 text-red-500">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ authStore.error }}</span>
      </div>

      <form @submit.prevent="handleLogin" novalidate class="space-y-5">
        <!-- Username Input -->
        <div class="space-y-1">
          <label for="username" class="block text-xs font-bold text-slate-700">
            Login <span class="text-red-500">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            v-model="username"
            @blur="validateUsername"
            @input="usernameError = ''"
            class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all"
            :class="usernameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''"
            placeholder="masalan: rahbar"
          />
          <span v-if="usernameError" class="text-2xs text-red-500 block mt-0.5">{{ usernameError }}</span>
        </div>

        <!-- Password Input -->
        <div class="space-y-1">
          <label for="password" class="block text-xs font-bold text-slate-700">
            Parol <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              id="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              v-model="password"
              @blur="validatePassword"
              @input="passwordError = ''"
              class="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all"
              :class="passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''"
              placeholder="••••••"
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
          <span v-if="passwordError" class="text-2xs text-red-500 block mt-0.5">{{ passwordError }}</span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg font-bold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10"
        >
          <span v-if="authStore.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>Tizimga kirish ➔</span>
        </button>
      </form>

      <div class="mt-6 text-center text-xs text-slate-400 font-medium">
        Yangi hisob kerakmi? 
        <router-link to="/register" class="text-amber-600 hover:text-amber-700 font-bold transition-colors">
          Ro'yxatdan o'tish
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.text-2xs {
  font-size: 0.7rem;
}
</style>
