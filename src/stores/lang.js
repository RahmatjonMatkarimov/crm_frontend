import { defineStore } from 'pinia'
import { ref } from 'vue'
import translateText from '@/utils/translete'

export const useLangStore = defineStore('lang', () => {
  const isKiril = ref(localStorage.getItem('lang') === 'kiril')

  function toggleLang() {
    isKiril.value = !isKiril.value
    localStorage.setItem('lang', isKiril.value ? 'kiril' : 'lotin')
  }

  function t(text) {
    if (!text) return text
    return isKiril.value ? translateText(String(text)) : String(text)
  }

  return { isKiril, toggleLang, t }
})
