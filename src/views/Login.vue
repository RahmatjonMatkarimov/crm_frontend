<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLangStore } from '@/stores/lang'

const router = useRouter()
const authStore = useAuthStore()
const langStore = useLangStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const usernameError = ref('')
const passwordError = ref('')

const validateUsername = () => {
  usernameError.value = !username.value ? 'Login kiritilishi shart' : ''
}

const validatePassword = () => {
  if (!password.value) passwordError.value = 'Parol kiritilishi shart'
  else if (password.value.length < 6) passwordError.value = langStore.t("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
  else passwordError.value = ''
}

const handleLogin = async () => {
  validateUsername()
  validatePassword()
  if (usernameError.value || passwordError.value) return
  const success = await authStore.login(username.value, password.value)
  if (success) router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex select-none" style="background:#f0f2f7;">

  

    <!-- Right login panel -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-[400px]">

        <!-- Mobile logo (only on small screens) -->
        <div class="lg:hidden flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" class="w-14 h-14 object-contain mb-3" />
          <p class="font-black text-xl" style="color:#1A3A6B;">YURIDIK MASLAHAT 24</p>
        </div>

        <div class="mb-8">
          <h1 class="text-2xl font-black tracking-tight" style="color:#111827;">Tizimga kirish</h1>
          <p class="text-sm mt-1.5" style="color:#6b7280;">Hisobingiz ma'lumotlarini kiriting</p>
        </div>

        <!-- Card -->
        <div style="background:#fff; border:1px solid #dce1ea; border-radius:10px; box-shadow:0 4px 24px rgba(26,58,107,0.08), 0 1px 4px rgba(0,0,0,0.04);">
          <div style="padding:28px 32px;">

            <!-- Error -->
            <div v-if="authStore.error"
              class="mb-5 p-3.5 rounded-lg flex items-center gap-2.5"
              style="background:#fef2f2; border:1px solid #fecaca;">
              <svg class="w-4 h-4 shrink-0" style="color:#dc2626;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium" style="color:#dc2626;">{{ authStore.error }}</span>
            </div>

            <form @submit.prevent="handleLogin" novalidate class="space-y-5">

              <!-- Username -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider mb-2" style="color:#374151;">
                  Login <span style="color:#dc2626;">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style="color:#9ca3af;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input
                    id="username" name="username" type="text" autocomplete="username" required
                    v-model="username" @blur="validateUsername" @input="usernameError = ''"
                    :placeholder="$t('Loginni kiriting')"
                    class="w-full pl-10 pr-4 text-sm rounded-lg"
                    style="height:42px; color:#111827; background:#fff;"
                    :style="`border: 1.5px solid ${usernameError ? '#fca5a5' : '#dce1ea'};`"
                  />
                </div>
                <span v-if="usernameError" class="text-xs font-medium mt-1.5 flex items-center gap-1" style="color:#dc2626;">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ usernameError }}
                </span>
              </div>

              <!-- Password -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider mb-2" style="color:#374151;">
                  Parol <span style="color:#dc2626;">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style="color:#9ca3af;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    id="password" name="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required
                    v-model="password" @blur="validatePassword" @input="passwordError = ''"
                    :placeholder="$t('Parolni kiriting')"
                    class="w-full pl-10 pr-11 text-sm rounded-lg"
                    style="height:42px; color:#111827; background:#fff;"
                    :style="`border: 1.5px solid ${passwordError ? '#fca5a5' : '#dce1ea'};`"
                  />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors" style="color:#9ca3af;"
                    @mouseover="e => e.currentTarget.style.color='#6b7280'"
                    @mouseleave="e => e.currentTarget.style.color='#9ca3af'">
                    <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>
                </div>
                <span v-if="passwordError" class="text-xs font-medium mt-1.5 block" style="color:#dc2626;">{{ passwordError }}</span>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="authStore.loading"
                class="w-full text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style="height:44px; background:linear-gradient(135deg,#2563eb,#1A3A6B); border-radius:8px; letter-spacing:0.04em; box-shadow:0 2px 8px rgba(26,58,107,0.3); transition:all 150ms ease; border:none;"
                @mouseover="e => { if(!e.currentTarget.disabled) e.currentTarget.style.boxShadow='0 4px 16px rgba(26,58,107,0.4)' }"
                @mouseleave="e => e.currentTarget.style.boxShadow='0 2px 8px rgba(26,58,107,0.3)'"
              >
                <span v-if="authStore.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                {{ authStore.loading ? 'Yuklanmoqda...' : 'Kirish' }}
              </button>
            </form>
          </div>
        </div>

        <p class="text-center mt-6 text-xs" style="color:#9ca3af;">
          © {{ new Date().getFullYear() }} Yuridik Maslahat 24 · Barcha huquqlar himoyalangan
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  border-color: #1A3A6B !important;
  box-shadow: 0 0 0 3px rgba(26,58,107,0.1) !important;
  outline: none;
}
</style>
