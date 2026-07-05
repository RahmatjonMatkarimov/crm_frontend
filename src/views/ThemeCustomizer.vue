<template>
  <div class="max-w-5xl mx-auto px-6 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight" style="color:var(--text-1);">🎨 Rang Sozlamalari</h1>
        <p class="text-sm mt-1" style="color:var(--text-2);">CSS o'zgaruvchilarini real vaqtda o'zgartiring. Tayyor ranglar CSS kodini nusxalang.</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="resetDefaults" class="btn btn-ghost btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Standart
        </button>
        <button @click="copyCss" class="btn btn-primary btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {{ copied ? 'Nusxalandi ✓' : 'CSS Nusxalash' }}
        </button>
      </div>
    </div>

    <!-- Preset Themes -->
    <div class="card p-5 mb-6">
      <h2 class="text-xs font-bold uppercase tracking-wider mb-4" style="color:var(--text-2);">Tayyor Mavzular</h2>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="preset in presets"
          :key="preset.name"
          @click="applyPreset(preset)"
          class="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all hover:scale-[1.02]"
          :style="`background:${preset.vars['--bg-card']}; border-color:${preset.vars['--border']}; color:${preset.vars['--text-1']};`"
        >
          <span class="w-4 h-4 rounded-full shrink-0" :style="`background:${preset.vars['--primary']};`"></span>
          {{ preset.name }}
        </button>
      </div>
    </div>

    <!-- Two-column: controls + live preview -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Controls -->
      <div class="lg:col-span-3 space-y-4">
        <div v-for="group in varGroups" :key="group.title" class="card p-5">
          <h2 class="text-xs font-bold uppercase tracking-wider mb-4" style="color:var(--text-2);">{{ group.title }}</h2>
          <div class="grid grid-cols-2 gap-4">
            <ColorRow v-for="v in group.vars" :key="v.key" :label="v.label" :varKey="v.key" v-model="colors[v.key]" @update:modelValue="applyVar(v.key, $event)" />
          </div>
        </div>
      </div>

      <!-- Live Preview -->
      <div class="lg:col-span-2">
        <div class="sticky top-6 space-y-4">
          <div class="card p-5">
            <h2 class="text-xs font-bold uppercase tracking-wider mb-4" style="color:var(--text-2);">Jonli Ko'rinish</h2>

            <!-- Buttons preview -->
            <div class="flex flex-wrap gap-2 mb-5">
              <button class="btn btn-primary btn-sm">Saqlash</button>
              <button class="btn btn-success btn-sm">Tasdiqlash</button>
              <button class="btn btn-danger btn-sm">O'chirish</button>
              <button class="btn btn-ghost btn-sm">Bekor</button>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2 mb-5">
              <span class="gov-badge gov-badge-green">Faol</span>
              <span class="gov-badge gov-badge-red">Bekor</span>
              <span class="gov-badge gov-badge-yellow">Kutilmoqda</span>
              <span class="gov-badge gov-badge-blue">Admin</span>
            </div>

            <!-- Sample card -->
            <div class="card p-4 mb-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:var(--primary-light);">
                  <svg class="w-4 h-4" style="color:var(--primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-sm" style="color:var(--text-1);">Abdullayev Jasur</p>
                  <p class="text-xs" style="color:var(--text-2);">+998 90 123 45 67</p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold" style="color:var(--success);">To'liq to'langan</span>
                <span class="gov-badge gov-badge-blue">Navbatda</span>
              </div>
            </div>

            <!-- Input preview -->
            <input class="form-input" placeholder="Ism familiya..." />
          </div>

          <!-- CSS Output -->
          <div class="card p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold uppercase tracking-wider" style="color:var(--text-2);">:root { } CSS</h3>
              <button @click="copyCss" class="text-xs font-semibold transition-colors" style="color:var(--primary);">
                {{ copied ? '✓ Nusxalandi' : 'Nusxalash' }}
              </button>
            </div>
            <pre class="text-[10px] leading-relaxed overflow-x-auto rounded-lg p-3" style="background:var(--border-light); color:var(--text-2); max-height:280px;">{{ cssOutput }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { defaults, varGroups, presets, STORAGE_KEY, sidebarOverrideCss } from '@/theme-presets'

// ───────────────────────── STATE ─────────────────────────
const colors = ref({ ...defaults })
const copied = ref(false)

function injectSidebarOverride() {
  let el = document.getElementById('theme-sidebar-override')
  if (!el) {
    el = document.createElement('style')
    el.id = 'theme-sidebar-override'
    document.head.appendChild(el)
  }
  el.textContent = sidebarOverrideCss(colors.value)
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: 'Maxsus', vars: colors.value }))
}

function applyVar(key, value) {
  document.documentElement.style.setProperty(key, value)
  injectSidebarOverride()
  persist()
}

function applyAll(vars) {
  for (const [key, val] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, val)
  }
  injectSidebarOverride()
}

function applyPreset(preset) {
  colors.value = { ...preset.vars }
  applyAll(preset.vars)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: preset.name, vars: preset.vars }))
}

function resetDefaults() {
  colors.value = { ...defaults }
  applyAll(defaults)
  // clear inline overrides so :root from CSS re-takes effect
  for (const key of Object.keys(defaults)) {
    document.documentElement.style.removeProperty(key)
  }
  colors.value = { ...defaults }
  const el = document.getElementById('theme-sidebar-override')
  if (el) el.remove()
  localStorage.removeItem(STORAGE_KEY)
}

const cssOutput = computed(() => {
  const lines = Object.entries(colors.value)
    .map(([k, v]) => `  ${k.padEnd(18)}: ${v};`)
    .join('\n')
  return `:root {\n${lines}\n}`
})

function copyCss() {
  navigator.clipboard.writeText(cssOutput.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

onMounted(() => {
  // Read current computed values from :root (already applied by App.vue's saved theme, if any)
  const style = getComputedStyle(document.documentElement)
  for (const key of Object.keys(defaults)) {
    const val = style.getPropertyValue(key).trim()
    if (val) colors.value[key] = val
  }
})
</script>

<!-- ─────── Inline ColorRow component ─────── -->
<script>
import { defineComponent, h } from 'vue'

const ColorRow = defineComponent({
  name: 'ColorRow',
  props: {
    label:    { type: String, required: true },
    varKey:   { type: String, required: true },
    modelValue: { type: String, default: '#000000' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('label', {
        class: 'flex items-center gap-3 cursor-pointer group',
        title: props.varKey,
      }, [
        h('input', {
          type: 'color',
          value: props.modelValue,
          class: 'w-8 h-8 rounded-md border cursor-pointer shrink-0 p-0.5',
          style: 'border-color:var(--border);',
          onInput: (e) => emit('update:modelValue', e.target.value),
        }),
        h('div', { class: 'flex-1 min-w-0' }, [
          h('p', {
            class: 'text-xs font-semibold truncate',
            style: 'color:var(--text-1);',
          }, props.label),
          h('p', {
            class: 'text-[10px] font-mono truncate',
            style: 'color:var(--text-3);',
          }, props.varKey),
        ]),
      ])
  },
})

export default { components: { ColorRow } }
</script>
