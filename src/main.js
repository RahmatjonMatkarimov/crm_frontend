import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Global $t plugin — useLangStore.t() ni template da ishlatish uchun
import { useLangStore } from '@/stores/lang'
app.config.globalProperties.$t = (text) => {
  try {
    return useLangStore().t(text)
  } catch {
    return text
  }
}

app.mount('#app')
