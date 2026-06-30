import { defineStore } from 'pinia'
import { ref } from 'vue'
import translateText from '@/utils/translete'

export const useLangStore = defineStore('lang', () => {
  const isKiril = ref(localStorage.getItem('lang') === 'kiril')

  function toggleLang() {
    isKiril.value = !isKiril.value
    localStorage.setItem('lang', isKiril.value ? 'kiril' : 'lotin')
  }

  function setLang(lang) {
    isKiril.value = lang === 'kiril'
    localStorage.setItem('lang', lang)
  }

  function t(text) {
    if (!text) return text
    return isKiril.value ? translateText(String(text)) : String(text)
  }

  return { isKiril, toggleLang, setLang, t }
})
