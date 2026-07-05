import { watch, onUnmounted } from 'vue'

export function useHistoryBack(isOpenSource, closeFn) {
  let closingViaBack = false
  let pushed = false
  let suppressBack = false

  function handlePopState() {
    if (!pushed) return
    pushed = false
    window.removeEventListener('popstate', handlePopState)
    closingViaBack = true
    closeFn()
  }

  function pushEntry() {
    pushed = true
    closingViaBack = false
    history.pushState({ overlayOpen: true }, '')
    window.addEventListener('popstate', handlePopState)
  }

  function popEntry() {
    if (!pushed) return
    pushed = false
    window.removeEventListener('popstate', handlePopState)
    if (!closingViaBack && !suppressBack) history.back()
    closingViaBack = false
    suppressBack = false
  }

  watch(isOpenSource, (isOpen) => (isOpen ? pushEntry() : popEntry()), { immediate: true })
  onUnmounted(popEntry)

  // Bitta overlay yopilib, o'rniga darhol boshqasi ochilganda (masalan, drawer'dan
  // tahrirlash modaliga o'tish) history.back() chaqirilishi kerak emas — u asinxron
  // bo'lgani uchun endigina push qilingan yangi entry'ni kutilmaganda yopib qo'yadi.
  function suppressNextClose() {
    suppressBack = true
  }

  return { suppressNextClose }
}
