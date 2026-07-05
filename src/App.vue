<template>
  <div>
    <!-- ── Floating toggle button ── -->
    <Teleport to="body">
      <!-- <button
        v-if="!open"
        @click="open = true"
        title="Rang Sozlamalari"
        class="fixed z-[9999] bottom-6 right-6 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style="background:var(--primary); color:#fff;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
        </svg>
      </button> -->

      <!-- ── Drawer Panel ── -->
      <Transition name="theme-drawer">
        <div
          v-if="open"
          class="fixed z-[9999] top-0 right-0 h-full w-[340px] flex flex-col shadow-2xl overflow-hidden"
          style="background:var(--bg-card); border-left:1px solid var(--border);"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 shrink-0" style="border-bottom:1px solid var(--border); background:var(--border-light);">
            <div>
              <h2 class="text-sm font-bold" style="color:var(--text-1);">🎨 Rang Sozlamalari</h2>
              <p class="text-[11px] mt-0.5" style="color:var(--text-2);">Real vaqtda butun sayt o'zgaradi</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="resetDefaults" title="Standart" class="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--border)]" style="color:var(--text-2);">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <button @click="copyCss" title="CSS nusxalash" class="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--border)]" :style="`color:${copied ? 'var(--success)' : 'var(--text-2)'};`">
                <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
              <button @click="open = false" class="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--border)]" style="color:var(--text-2);">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Presets -->
          <div class="px-4 pt-4 pb-2 shrink-0">
            <p class="text-[10px] font-bold uppercase tracking-wider mb-2" style="color:var(--text-3);">Tayyor Mavzular</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in presets"
                :key="p.name"
                @click="applyPreset(p)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:scale-[1.04] active:scale-95"
                :class="activePreset === p.name ? 'ring-2 ring-[var(--primary)]' : ''"
                :style="`background:${p.vars['--bg-card']}; border-color:${p.vars['--border']}; color:${p.vars['--text-1']};`"
              >
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="`background:${p.vars['--primary']};`"></span>
                {{ p.name }}
              </button>
            </div>
          </div>

          <!-- Scrollable color pickers -->
          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-5">

            <section v-for="group in varGroups" :key="group.title">
              <p class="text-[10px] font-bold uppercase tracking-wider mb-2.5" style="color:var(--text-3);">{{ group.title }}</p>
              <div class="space-y-2">
                <label
                  v-for="v in group.vars"
                  :key="v.key"
                  class="flex items-center gap-3 cursor-pointer group py-1"
                >
                  <input
                    type="color"
                    :value="colors[v.key]"
                    @input="onColorInput(v.key, $event.target.value)"
                    class="w-8 h-8 rounded-md cursor-pointer shrink-0 p-0.5 border"
                    style="border-color:var(--border);"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold" style="color:var(--text-1);">{{ v.label }}</p>
                    <p class="text-[10px] font-mono" style="color:var(--text-3);">{{ colors[v.key] }}</p>
                    <p v-if="v.desc" class="text-[10px] leading-tight mt-0.5" style="color:var(--text-2);">{{ v.desc }}</p>
                  </div>
                </label>
              </div>
            </section>

          </div>

          <!-- Footer: copy CSS -->
          <div class="px-4 py-3 shrink-0" style="border-top:1px solid var(--border); background:var(--border-light);">
            <button @click="copyCss" class="w-full btn btn-primary btn-sm justify-center">
              {{ copied ? '✓ Nusxalandi — index.css ga joylashtiring' : 'CSS :root ni nusxalash' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <RouterView />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from './stores/auth'
import { defaults, varGroups, presets, STORAGE_KEY, sidebarOverrideCss } from '@/theme-presets'

useThemeStore()
const authStore = useAuthStore()
if (authStore.isAuthenticated) {
  authStore.fetchPermission()
}

// ── panel state ──
const open = ref(false)
const copied = ref(false)
const activePreset = ref('Standart (Navy)')

const colors = ref({ ...defaults })

// ── apply single var ──
function injectSidebarOverride(vars) {
  let el = document.getElementById('theme-sidebar-override')
  if (!el) {
    el = document.createElement('style')
    el.id = 'theme-sidebar-override'
    document.head.appendChild(el)
  }
  el.textContent = sidebarOverrideCss({ ...colors.value, ...vars })
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: activePreset.value, vars: colors.value }))
}

function onColorInput(key, value) {
  colors.value[key] = value
  document.documentElement.style.setProperty(key, value)
  injectSidebarOverride(colors.value)
  activePreset.value = 'Maxsus'
  persist()
}

function applyAll(vars) {
  for (const [k, v] of Object.entries(vars)) {
    colors.value[k] = v
    document.documentElement.style.setProperty(k, v)
  }
  injectSidebarOverride(vars)
}

function resetDefaults() {
  for (const k of Object.keys(defaults)) {
    document.documentElement.style.removeProperty(k)
  }
  colors.value = { ...defaults }
  // Remove sidebar override so CSS file's gold re-applies
  const el = document.getElementById('theme-sidebar-override')
  if (el) el.remove()
  activePreset.value = 'Standart (Navy)'
  localStorage.removeItem(STORAGE_KEY)
}

function applyPreset(preset) {
  applyAll(preset.vars)
  activePreset.value = preset.name
  persist()
}

// ── CSS output & copy ──
const cssOutput = computed(() => {
  const lines = Object.entries(colors.value)
    .map(([k, v]) => `  ${k.padEnd(18)}: ${v};`)
    .join('\n')
  return `:root {\n${lines}\n}`
})

function copyCss() {
  navigator.clipboard.writeText(cssOutput.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2500)
}

// ── restore saved theme, or read current CSS vars on mount ──
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const { preset, vars } = JSON.parse(saved)
      applyAll(vars)
      activePreset.value = preset || 'Maxsus'
      return
    } catch {
      // ignore malformed saved theme
    }
  }
  const style = getComputedStyle(document.documentElement)
  for (const key of Object.keys(defaults)) {
    const val = style.getPropertyValue(key).trim()
    if (val) colors.value[key] = val
  }
})
</script>

<style>
.theme-drawer-enter-active,
.theme-drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.theme-drawer-enter-from,
.theme-drawer-leave-to {
  transform: translateX(100%);
}
</style>
