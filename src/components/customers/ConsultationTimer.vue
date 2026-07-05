<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  calledAt: { type: String, default: null },   // ISO — taymer boshlanishi
  seconds: { type: Number, default: null },    // yakuniy davomiylik (saqlangan bo'lsa)
})

const CYCLE = 20 * 60 // 20 daqiqa = 1200 sekund
const nowTs = ref(Date.now())
let interval = null

onMounted(() => { interval = setInterval(() => { nowTs.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(interval))

const isFinished = computed(() => props.seconds !== null && props.seconds !== undefined)

const elapsed = computed(() => {
  if (isFinished.value) return props.seconds
  if (!props.calledAt) return 0
  return Math.max(0, Math.floor((nowTs.value - new Date(props.calledAt).getTime()) / 1000))
})

const cycle = computed(() => Math.floor(elapsed.value / CYCLE) + 1)
const withinCycle = computed(() => elapsed.value % CYCLE)

const pad = (n) => String(n).padStart(2, '0')
const liveText = computed(() =>
  `${cycle.value}-davr · ${pad(Math.floor(withinCycle.value / 60))}:${pad(withinCycle.value % 60)}`)
const finishedText = computed(() =>
  `${Math.max(1, Math.round(elapsed.value / 60))} daqiqa (${cycle.value} davr)`)
</script>

<template>
  <span v-if="isFinished"
    class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
    style="background:var(--success-bg); color:var(--success); border:1px solid var(--success);">
    ⏱ {{ finishedText }}
  </span>
  <span v-else-if="calledAt"
    class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg tabular-nums"
    style="background:var(--warning-bg); color:var(--warning); border:1px solid var(--warning);">
    ⏱ {{ liveText }}
  </span>
</template>
