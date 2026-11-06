<script setup lang="ts">
import {onErrorCaptured, ref} from 'vue'
import {AlertTriangle, RotateCw} from 'lucide-vue-next'

const hasError = ref(false)
const errorMessage = ref<string>('')

onErrorCaptured((err) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  console.error('[ErrorBoundary] Przechwycono błąd:', err)
  // Zatrzymuje propagację do app.config.errorHandler
  return false
})

function reload() {
  window.location.reload()
}

function reset() {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div v-if="hasError" class="error-boundary" role="alert">
    <AlertTriangle :size="48" class="icon"/>
    <h2>Coś poszło nie tak</h2>
    <p class="message">
      Wystąpił nieoczekiwany błąd. Możesz spróbować ponownie lub odświeżyć stronę.
    </p>
    <details class="details">
      <summary>Szczegóły techniczne</summary>
      <pre>{{ errorMessage }}</pre>
    </details>
    <div class="actions">
      <button class="secondary" @click="reset">Spróbuj ponownie</button>
      <button class="primary" @click="reload">
        <RotateCw :size="16"/>
        <span>Odśwież stronę</span>
      </button>
    </div>
  </div>
  <slot v-else/>
</template>

<style scoped>
.error-boundary {
  max-width: 520px;
  margin: 4rem auto;
  padding: 2rem 1.5rem;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  color: #dc2626;
}

h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #111;
}

.message {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.details {
  width: 100%;
  text-align: left;
  margin-top: 0.5rem;
}

.details summary {
  cursor: pointer;
  font-size: 0.85rem;
  color: #6b7280;
}

.details pre {
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  overflow-x: auto;
  color: #991b1b;
  margin: 0.5rem 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.actions button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  border: 1px solid transparent;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
  color: #374151;
}

.secondary:hover {
  background: #f3f4f6;
}

.primary {
  background: #0a7;
  color: #fff;
}

.primary:hover {
  background: #086;
}
</style>