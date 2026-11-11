<script setup lang="ts">
import {ref} from 'vue'
import {storeToRefs} from 'pinia'
import {Check, Copy, RefreshCw} from 'lucide-vue-next'
import {useHouseholdStore} from '@/stores/household.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'

const householdStore = useHouseholdStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const {details} = storeToRefs(householdStore)
const {run} = useAsyncAction()

const copied = ref(false)
const regenerating = ref(false)

async function handleCopy() {
  if (!details.value) return
  try {
    await navigator.clipboard.writeText(details.value.invite_code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback dla przeglądarek bez Clipboard API lub bez HTTPS
    alert(`Kod: ${details.value.invite_code}`)
  }
}

async function handleRegenerate() {
  if (!authStore.householdId) return
  const ok = await confirm.ask(
    'Stary kod przestanie działać. Kontynuować?',
    'Nowy kod zaproszenia',
  )
  if (!ok) return
  regenerating.value = true
  await run(async () => {
    await householdStore.regenerateCode(authStore.householdId!)
    return true as const
  }, {success: 'Wygenerowano nowy kod'})
  regenerating.value = false
}
</script>

<template>
  <section v-if="details" class="card">
    <h2>Kod zaproszenia</h2>
    <p class="hint">Przekaż ten kod partnerce, aby dołączyła do gospodarstwa.</p>
    <div class="invite-row">
      <code class="invite-code">{{ details.invite_code }}</code>
      <button class="icon-text" :title="copied ? 'Skopiowano' : 'Kopiuj'" @click="handleCopy">
        <Check v-if="copied" :size="16"/>
        <Copy v-else :size="16"/>
        <span>{{ copied ? 'Skopiowano' : 'Kopiuj' }}</span>
      </button>
      <button class="icon-text" :disabled="regenerating" @click="handleRegenerate">
        <RefreshCw :size="16"/>
        <span>Nowy kod</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  color: #111;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.75rem;
}

.invite-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.invite-code {
  font-family: ui-monospace, monospace;
  font-size: 1.1rem;
  background: #f3f4f6;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.icon-text:hover {
  background: #f3f4f6;
}

.icon-text:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>