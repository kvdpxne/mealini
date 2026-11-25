<script setup lang="ts">
import {ref} from 'vue'
import {Check, Copy, Info, Share2, Smartphone} from 'lucide-vue-next'
import {useShareShoppingList} from '@/composables/useShareShoppingList'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useToastStore} from '@/stores/toast.store'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const toast = useToastStore()
const {run} = useAsyncAction()
const {previewText, shareMethod, shareText} = useShareShoppingList()

const copied = ref(false)
const sharing = ref(false)

async function handleShare() {
  sharing.value = true
  const result = await run(async () => {
    return await shareText(previewText.value, 'Lista zakupów — Mealini')
  })
  sharing.value = false

  if (!result) return
  if (result.cancelled) return // użytkownik anulował – cicho

  if (result.method === 'clipboard') {
    toast.show('Skopiowano do schowka – wklej w Google Keep', 'success')
  } else {
    toast.show('Udostępniono', 'success')
    emit('close')
  }
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(previewText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.show('Nie udało się skopiować – zaznacz tekst ręcznie', 'error')
  }
}

function openKeep() {
  // Deep link otwiera Keep, ale NIE wstawia treści – użytkownik wkleja.
  window.open('https://keep.google.com/', '_blank', 'noopener')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="emit('close')">
      <div class="dialog">
        <header class="head">
          <Share2 :size="20"/>
          <h3>Udostępnij listę</h3>
          <button class="icon-btn" @click="emit('close')">✕</button>
        </header>

        <p class="hint">
          <Info :size="14"/>
          <span>
            Google Keep nie udostępnia API dla kont osobistych. Udostępnij tekst
            przez systemowy panel lub skopiuj go i wklej w Keep.
          </span>
        </p>

        <pre class="preview">{{ previewText }}</pre>

        <div class="actions">
          <button
            v-if="shareMethod === 'web-share'"
            class="primary"
            :disabled="sharing"
            @click="handleShare"
          >
            <Share2 :size="16"/>
            <span>{{ sharing ? 'Udostępnianie...' : 'Udostępnij...' }}</span>
          </button>
          <button v-else class="primary" :disabled="!previewText" @click="handleCopy">
            <Check v-if="copied" :size="16"/>
            <Copy v-else :size="16"/>
            <span>{{ copied ? 'Skopiowano!' : 'Kopiuj tekst' }}</span>
          </button>
          <button class="secondary" @click="handleCopy">
            <Copy :size="14"/>
            <span>Kopiuj</span>
          </button>
          <button class="secondary" @click="openKeep">
            <Smartphone :size="14"/>
            <span>Otwórz Keep</span>
          </button>
        </div>

        <p class="note">
          Na Androidzie wybierz „Keep” w panelu udostępniania – tekst trafi do
          nowej notatki. Na komputerze skopiuj i wklej ręcznie.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.dialog {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 85vh;
  overflow-y: auto;
}

.head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.head h3 {
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
}

.hint {
  display: flex;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.preview {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 280px;
  overflow-y: auto;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover {
  background: #f3f4f6;
}

.note {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.45;
}
</style>