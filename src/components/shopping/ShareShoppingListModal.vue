<script setup lang="ts">
import {ref, watch} from 'vue'
import {Check, Clock, Copy, Link2, Trash2, X} from 'lucide-vue-next'
import {useShareListModal} from '@/composables/useShareListModal'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const {ttlHours, generatedUrl, activeShares, generating, loadActive, generate, revoke, reset} =
  useShareListModal()

const copied = ref(false)

watch(
  () => props.visible,
  async (v) => {
    if (v) {
      reset()
      await loadActive()
    }
  },
  {immediate: true},
)

async function handleCopy() {
  if (!generatedUrl.value) return
  try {
    await navigator.clipboard.writeText(generatedUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    alert(`Link:\n${generatedUrl.value}`)
  }
}

function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="emit('close')">
      <div class="dialog">
        <header class="dialog-head">
          <Link2 :size="20"/>
          <h3>Udostępnij listę zakupów</h3>
          <button class="icon-btn" @click="emit('close')">
            <X :size="18"/>
          </button>
        </header>

        <p class="hint">
          Wygeneruj jednorazowy link. Odbiorca nie musi mieć konta – wystarczy, że otworzy go
          w przeglądarce. Będzie mógł przeglądać i odhaczać pozycje.
        </p>

        <div v-if="!generatedUrl" class="generate-section">
          <label>
            <Clock :size="14"/>
            Ważny przez
            <select v-model.number="ttlHours">
              <option :value="1">1 godzinę</option>
              <option :value="6">6 godzin</option>
              <option :value="24">24 godziny</option>
              <option :value="72">3 dni</option>
              <option :value="168">7 dni</option>
            </select>
          </label>
          <button class="primary" :disabled="generating" @click="generate">
            {{ generating ? 'Generowanie...' : 'Wygeneruj link' }}
          </button>
        </div>

        <div v-else class="result-section">
          <p class="success">Link gotowy – skopiuj go teraz, nie pokażemy go ponownie.</p>
          <div class="link-row">
            <input :value="generatedUrl" readonly/>
            <button class="icon-text" @click="handleCopy">
              <Check v-if="copied" :size="16"/>
              <Copy v-else :size="16"/>
              <span>{{ copied ? 'Skopiowano' : 'Kopiuj' }}</span>
            </button>
          </div>
          <button class="secondary" @click="reset">Wygeneruj kolejny link</button>
        </div>

        <section v-if="activeShares.length > 0" class="active-shares">
          <h4>Aktywne linki</h4>
          <ul>
            <li v-for="s in activeShares" :key="s.id">
              <code>{{ s.token_prefix }}…</code>
              <span class="expiry">do {{ formatExpiry(s.expires_at) }}</span>
              <button class="icon-btn danger" title="Unieważnij" @click="revoke(s.id, s.token_prefix)">
                <Trash2 :size="14"/>
              </button>
            </li>
          </ul>
        </section>

        <p class="note">
          Link jest jednorazowy w tym sensie, że po zakończeniu zakupów przez odbiorcę
          (lub po upływie czasu) przestaje działać. Możesz go unieważnić w każdej chwili.
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
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 85vh;
  overflow-y: auto;
}

.dialog-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dialog-head h3 {
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

.icon-btn.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.generate-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.generate-section label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #374151;
}

.generate-section select {
  padding: 0.35rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
}

.primary {
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

.result-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.success {
  font-size: 0.85rem;
  color: #14532d;
  margin: 0;
}

.link-row {
  display: flex;
  gap: 0.35rem;
}

.link-row input {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.icon-text:hover {
  background: #f9fafb;
}

.secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  align-self: flex-start;
}

.secondary:hover {
  background: #f3f4f6;
}

.active-shares h4 {
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
  color: #374151;
}

.active-shares ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.active-shares li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.65rem;
  background: #f9fafb;
  border-radius: 6px;
}

.active-shares code {
  font-size: 0.8rem;
  color: #111;
}

.expiry {
  flex: 1;
  font-size: 0.75rem;
  color: #6b7280;
}

.note {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.45;
}
</style>