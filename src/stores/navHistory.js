import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavHistoryStore = defineStore('navHistory', () => {
  const currentPosition = ref(window.history.state?.position ?? 0)

  function track() {
    currentPosition.value = window.history.state?.position ?? 0
  }

  const canGoBack = computed(() => currentPosition.value > 0)

  return { track, canGoBack }
})
