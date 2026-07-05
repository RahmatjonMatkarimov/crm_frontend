<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import api, { ENDPOINTS, BASE_URL } from '@/api'
import { useSocket } from '@/utils/useSocket'

const IDLE_DELAY_MS = 10000
const AFTER_CALL_IDLE_DELAY_MS = 0
const VIDEO_POLL_MS = 60000

const MUXLISA_API_KEY = '2h2mltjlUWhL3Pq_9NZ3xKRQXpb3qpJiP7keomQw'
const MUXLISA_TTS_URL = 'https://service.muxlisa.uz/api/v2/tts'
const MUXLISA_SPEAKER = 0
const ANNOUNCE_REPEAT_COUNT = 2
const ANNOUNCE_GAP_MS = 4000
const ANNOUNCE_PLAYBACK_RATE = 0.9

const videoUrl = ref('../../public/video.mov')
const videoRef = ref(null)
let videoPollTimer = null

const playIdleVideo = () => {
  videoRef.value?.play().catch(() => {
  })
}

const loadWaitingRoomVideo = async () => {
  try {
    const { data } = await api.get(ENDPOINTS.SETTINGS_WAITING_ROOM_VIDEO)
    if (data?.waitingRoomVideo) {
      videoUrl.value = data.waitingRoomVideo.startsWith('/videos/')
        ? `${BASE_URL}${data.waitingRoomVideo}`
        : data.waitingRoomVideo
    }
  } catch {
    // default videoga qoladi
  }
}

const UZ_MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']

const currentCall = ref(null)
const justCalled = ref(false)
const callHistory = ref([])
const waitingList = ref([])
const idleMode = ref(false)
const clockNow = ref(new Date())
const todayCount = ref(128)
const audioUnlocked = ref(false)

const formattedDate = computed(() => `${String(clockNow.value.getDate()).padStart(2, '0')} ${UZ_MONTHS[clockNow.value.getMonth()]}`)
const formattedTime = computed(() => `${String(clockNow.value.getHours()).padStart(2, '0')}:${String(clockNow.value.getMinutes()).padStart(2, '0')}`)

let highlightTimer = null
let idleTimer = null
let clockTimer = null
let unsubscribe = null
let callAudio = null
// Har bir chaqiruvga o'z "token"i beriladi: shu tufayli eski (allaqachon
// keyingi mijoz bilan almashtirilgan) e'lon oqimi tugab qolsa ham, video
// hozirgi chaqiruv hali gapirib bo'lmagan holda ko'rsatilib qolmaydi.
let announceToken = 0

const numbersInWords = {
  '01': 'bir',
  '02': 'ikki',
  '03': 'uch',
  '04': 'to‘rt',
  '05': 'besh',
  '06': 'olti',
  '07': 'yetti',
  '08': 'sakkiz',
  '09': 'to‘qqiz',
  '10': 'o‘n',
  '11': 'o‘n bir',
  '12': 'o‘n ikki',
  '13': 'o‘n uch',
  '14': 'o‘n to‘rt',
  '15': 'o‘n besh',
  '16': 'o‘n olti',
  '17': 'o‘n yetti',
  '18': 'o‘n sakkiz',
  '19': 'o‘n to‘qqiz',
  '20': 'yigirma',
  '21': 'yigirma bir',
  '22': 'yigirma ikki',
  '23': 'yigirma uch',
  '24': 'yigirma to‘rt',
  '25': 'yigirma besh',
  '26': 'yigirma olti',
  '27': 'yigirma yetti',
  '28': 'yigirma sakkiz',
  '29': 'yigirma to‘qqiz',
  '30': 'o‘ttiz'
}

watch(idleMode, (val) => {
  if (val) {
    nextTick(playIdleVideo)
  }
})

const clearIdleTimer = () => {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

const scheduleIdle = (delay = IDLE_DELAY_MS) => {
  clearIdleTimer()
  idleTimer = setTimeout(() => {
    idleMode.value = true
  }, delay)
}

const getAudio = () => {
  if (!callAudio) {
    callAudio = new Audio('/sound.mp3')
    callAudio.preload = 'auto'
  }
  return callAudio
}

const unlockAudio = () => {
  if (idleMode.value) playIdleVideo()
  if (audioUnlocked.value) return
  const audio = getAudio()
  const prevVolume = audio.volume
  audio.volume = 0
  audio.play()
    .then(() => {
      audio.pause()
      audio.currentTime = 0
      audio.volume = prevVolume
      audioUnlocked.value = true
    })
    .catch((err) => {
      console.warn('Audio unlock muvaffaqiyatsiz:', err)
    })
}

// ==================== MUXLISA TTS FUNKSIYALARI ====================

// Chaqiriladigan matnni tayyorlaydi: "A besh, navbatingiz keldi"
const buildAnnounceText = () => {
  if (!currentCall.value) return ''
  const queueNum = String(currentCall.value.queueNumber).padStart(2, '0')
  const numberWord = numbersInWords[queueNum] || queueNum.split('').join(' ')
  return `A ${numberWord}inchi raqam, sizning navbatingiz keldi, qabulga kirishingiz mumkin.`
}

// Muxlisa API to'g'ridan-to'g'ri audio fayl (WAV) qaytaradi — JSON emas.
// Shuning uchun responseType: 'arraybuffer' bilan olib, Blob URL'ga aylantiramiz.
let lastMuxlisaBlobUrl = null

const fetchMuxlisaAudioSrc = async (text) => {
  const response = await axios.post(
    MUXLISA_TTS_URL,
    { text, speaker: MUXLISA_SPEAKER },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MUXLISA_API_KEY
      },
      responseType: 'arraybuffer'
    }
  )

  // Oldingi ijro tugagan blob URL'ni tozalab qo'yamiz (xotira sizib chiqmasligi uchun)
  if (lastMuxlisaBlobUrl) {
    URL.revokeObjectURL(lastMuxlisaBlobUrl)
  }

  const blob = new Blob([response.data], { type: 'audio/wav' })
  lastMuxlisaBlobUrl = URL.createObjectURL(blob)
  return lastMuxlisaBlobUrl
}

// Berilgan audio manbasini `times` marta, har biri orasida `gapMs` kutib ijro etadi, so'ng onDone chaqiriladi.
// Har bir ijro uchun yangi Audio obyekti yaratiladi — bitta elementni qayta ishlatish
// ba'zi brauzerlarda 'ended' hodisasini haqiqiy ovozsiz tezda qayta chaqirib yuborishi mumkin.
const playAudioSequentially = (src, times, gapMs, onDone) => {
  let playedCount = 0

  const playOnce = () => {
    const audio = new Audio(src)
    audio.playbackRate = ANNOUNCE_PLAYBACK_RATE
    audio.onended = () => {
      playedCount += 1
      if (playedCount >= times) {
        onDone?.()
      } else {
        setTimeout(playOnce, gapMs)
      }
    }

    audio.onerror = (e) => {
      console.error('Muxlisa TTS audio elementida xato:', e)
      onDone?.()
    }

    audio.play().catch((err) => {
      console.error('Muxlisa TTS audio ijro xatosi:', err)
      onDone?.()
    })
  }

  playOnce()
}

// Qo'ng'iroq ovozidan keyin ishga tushadi: matnni Muxlisa orqali ANNOUNCE_REPEAT_COUNT
// (3) marta aytadi, so'ng AFTER_CALL_IDLE_DELAY_MS dan keyin idle videoga o'tkazadi.
// `token` shu chaqiruvga tegishli ekanini bildiradi — agar shu payt ichida
// yangi mijoz chaqirilib announceToken o'zgargan bo'lsa (masalan eski oqim
// kechikib tugagan bo'lsa), bu ESKIRGAN natija video holatiga ta'sir qilmaydi.
const announceQueueWithMuxlisa = async (token) => {
  if (token !== announceToken) return

  const text = buildAnnounceText()
  if (!text) {
    if (token === announceToken) scheduleIdle(AFTER_CALL_IDLE_DELAY_MS)
    return
  }

  try {
    const audioSrc = await fetchMuxlisaAudioSrc(text)
    playAudioSequentially(audioSrc, ANNOUNCE_REPEAT_COUNT, ANNOUNCE_GAP_MS, () => {
      if (token === announceToken) scheduleIdle(AFTER_CALL_IDLE_DELAY_MS)
    })
  } catch (err) {
    console.error('Muxlisa TTS xatosi:', err)
    if (token === announceToken) scheduleIdle(AFTER_CALL_IDLE_DELAY_MS)
  }
}

// ⚠️ TUZATILDI: callAudio endi bu yerda QAYTA ISHLATILMAYDI.
// Har bir chaqiruv uchun yangi Audio('/sound.mp3') obyekti yaratiladi,
// chunki bitta obyektni qayta ishlatish (currentTime = 0 + qayta play())
// brauzerda soxta AbortError'ga olib kelib, ovoz hali tugamasdan
// Muxlisa TTS zanjirini erta ishga tushirib yuborayotgan edi.
// Endi AbortError kelsa, biz hech narsa qilmaymiz va haqiqiy 'onended'ni kutamiz —
// faqat boshqa (haqiqiy) xatolarda darhol oldinga o'tamiz.
const announce = (token) => {
  const audio = new Audio('/sound.mp3')
  audio.currentTime = 0

  let advanced = false
  const advanceOnce = () => {
    if (advanced) return
    advanced = true
    announceQueueWithMuxlisa(token)
  }

  audio.onended = advanceOnce

  audio.onerror = (e) => {
    console.error('Audio ijro xatosi (onerror):', e)
    advanceOnce()
  }

  audio.play().catch((err) => {
    // AbortError odatda ovoz aslida davom etayotganini bildiradi
    // (masalan eski audio elementi play/pause bilan to'qnashganda).
    // Bunday holda oldinga o'tmaymiz — haqiqiy 'onended' ni kutamiz.
    if (err?.name === 'AbortError') {
      console.warn('Audio play() AbortError — onended kutilmoqda:', err)
      return
    }
    console.error('Audio play() bloklandi yoki xato berdi:', err)
    advanceOnce()
  })
}

const loadQueue = async () => {
  try {
    const { data } = await api.get(ENDPOINTS.WAITING_ROOM_QUEUE)
    waitingList.value = data.filter((c) => c.status === 'NAVBATDA')
  } catch (e) {
    console.warn('Queue yuklashda xato')
  }
}

const handleCustomerCalled = (payload) => {
  clearIdleTimer()
  idleMode.value = false
  currentCall.value = payload
  callHistory.value = [payload, ...callHistory.value].slice(0, 10)
  waitingList.value = waitingList.value.filter((c) => c.id !== payload.customerId)
  justCalled.value = true

  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => { justCalled.value = false }, 7000)

  const token = ++announceToken
  announce(token)
}

onMounted(() => {
  loadQueue()
  loadWaitingRoomVideo()
  const { onCustomerCalled } = useSocket()
  unsubscribe = onCustomerCalled(handleCustomerCalled)

  clockTimer = setInterval(() => {
    clockNow.value = new Date()
  }, 30000)

  videoPollTimer = setInterval(loadWaitingRoomVideo, VIDEO_POLL_MS)

  scheduleIdle()

  window.addEventListener('click', unlockAudio, { once: true })
  window.addEventListener('touchstart', unlockAudio, { once: true })
  window.addEventListener('keydown', unlockAudio, { once: true })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
  if (highlightTimer) clearTimeout(highlightTimer)
  if (clockTimer) clearInterval(clockTimer)
  if (videoPollTimer) clearInterval(videoPollTimer)
  clearIdleTimer()

  window.removeEventListener('click', unlockAudio)
  window.removeEventListener('touchstart', unlockAudio)
  window.removeEventListener('keydown', unlockAudio)
})
</script>

<template>
  <div
    class="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0a1740] via-[#0d1f52] to-[#123a8f] text-slate-50 font-sans">

    <!-- Idle video -->
    <div v-show="idleMode" class="absolute inset-0">
      <video ref="videoRef" class="w-full h-full" :src="videoUrl" autoplay muted loop playsinline
        preload="auto"></video>
    </div>

    <!-- Main content -->
    <div v-show="!idleMode" class="relative z-10 flex flex-col h-full px-[2.5vw] py-[2.2vh] gap-[2vh]">
      <!-- HEADER -->
      <header class="flex items-center justify-between rounded-2xl bg-[#0d2160]/60 border border-white/10 px-8 py-4">
        <div class="flex items-center gap-4">
          <img src="../../public/logo-white.png" width="200" alt="">
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5">
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor"
              stroke-width="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" stroke-linecap="round" />
            </svg>
            <div class="text-base font-medium">
              {{ formattedDate }}
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5">
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor"
              stroke-width="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="text-base font-medium">
              {{ formattedTime }}
            </div>
          </div>
        </div>
      </header>

      <!-- MAIN CALL PANEL -->
      <main class="flex-1 grid grid-cols-1 gap-[2vh]">
        <section
          class="relative flex-1 flex flex-col items-center justify-center text-center overflow-hidden rounded-[28px] border border-white/10 bg-[#0a1a45]/70 backdrop-blur-md px-[3vw] py-[3vh] transition-[box-shadow,border-color] duration-500"
          :class="justCalled ? 'border-amber-400 animate-pulse-ring' : ''">
          <template v-if="currentCall">
            <div class="relative z-10 flex items-center gap-3 mb-6">
              <svg viewBox="0 0 24 24" class="w-8 h-8 text-amber-400 animate-[wiggle_1.4s_ease-in-out_infinite]"
                fill="currentColor">
                <path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-6v-5a7 7 0 10-14 0v5l-2 2v1h18v-1l-2-2z" />
              </svg>
              <p class="text-2xl md:text-3xl font-bold text-amber-400 uppercase tracking-[3px]">
                Sizning navbatingiz keldi
              </p>
            </div>
            <p class="relative z-10 text-[14vw] md:text-[9rem] font-extrabold leading-none mb-6 tracking-tight">
              <span class="bg-gradient-to-b from-sky-300 to-blue-600 bg-clip-text text-transparent">A</span>
              <span class="text-slate-400/70">-</span>
              <span class="bg-gradient-to-b from-amber-300 to-amber-600 bg-clip-text text-transparent">{{
                String(currentCall.queueNumber).padStart(2, '0') }}</span>
            </p>
            <div
              class="relative z-10 flex flex-wrap items-center justify-center divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 mb-6">
              <div class="flex items-center gap-3 px-6">
                <div class="text-left leading-tight">
                  <div class="text-2xl font-semibold">{{ currentCall.surname }} {{ currentCall.name }}</div>
                </div>
              </div>
            </div>
            <p class="relative z-10 text-lg md:text-2xl font-bold uppercase tracking-[2px]">
              Iltimos, yurist qabuliga kiring.
            </p>
          </template>
          <template v-else>
            <p class="relative z-10 text-2xl text-slate-300 mt-2">Mijoz chaqirilganda shu yerda ko'rinadi</p>
          </template>
        </section>
      </main>
    </div>

  </div>
</template>

<style scoped>
@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.55);
  }

  70% {
    box-shadow: 0 0 0 40px rgba(212, 175, 55, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
  }
}

.animate-pulse-ring {
  animation: pulse-ring 1.4s ease-out 3;
}

@keyframes wiggle {

  0%,
  100% {
    transform: rotate(0deg);
  }

  20% {
    transform: rotate(-12deg);
  }

  40% {
    transform: rotate(10deg);
  }

  60% {
    transform: rotate(-8deg);
  }

  80% {
    transform: rotate(5deg);
  }
}
</style>