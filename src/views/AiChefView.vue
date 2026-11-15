<script setup lang="ts">
import {ref} from 'vue'
import {Copy, Loader2, Sparkles} from 'lucide-vue-next'
import {useAiPrompt} from '@/composables/useAiPrompt'
import {aiService} from '@/services/ai.service'
import {useAsyncAction} from '@/composables/useAsyncAction'

const {prompt} = useAiPrompt()
const {run} = useAsyncAction()

const copied = ref(false)
const aiResult = ref<string | null>(null)
const aiLoading = ref(false)
const aiError = ref<string | null>(null)

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(prompt.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    alert('Nie udało się skopiować – zaznacz prompt ręcznie.')
  }
}

async function handleAskAi() {
  aiLoading.value = true
  aiError.value = null
  const result = await run(async () => {
    const text = await aiService.ask(prompt.value)
    return text
  })
  aiLoading.value = false
  if (result) aiResult.value = result
  else aiError.value = 'Nie udało się uzyskać odpowiedzi AI.'
}
</script>

<template>
  <div class="ai-view">
    <header class="page-head">
      <h1>Asystent AI</h1>
      <p class="sub">Wygeneruj prompt z zawartości lodówki lub zapytaj AI bezpośrednio.</p>
    </header>

    <section class="card">
      <h2>
        <Copy :size="18"/>
        Prompt manualny
      </h2>
      <p class="hint">
        Skopiuj prompt i wklej go do ChatGPT, Claude lub innego asystenta.
        Działa bez klucza API – nic nie jest wysyłane z tej aplikacji.
      </p>
      <pre class="prompt-box">{{ prompt }}</pre>
      <button class="primary" @click="handleCopy">
        <Copy :size="16"/>
        <span>{{ copied ? 'Skopiowano!' : 'Kopiuj prompt' }}</span>
      </button>
    </section>

    <section class="card">
      <h2>
        <Sparkles :size="18"/>
        Zapytaj AI bezpośrednio
      </h2>
      <p class="hint">
        Wysyła prompt do modelu przez bezpieczny proxy. Wymaga skonfigurowanego
        klucza OpenAI po stronie serwera.
      </p>
      <p v-if="aiError" class="error">{{ aiError }}</p>
      <button class="primary" :disabled="aiLoading" @click="handleAskAi">
        <Loader2 v-if="aiLoading" :size="16" class="spin"/>
        <Sparkles v-else :size="16"/>
        <span>{{ aiLoading ? 'Generowanie...' : 'Zapytaj AI' }}</span>
      </button>
      <pre v-if="aiResult" class="ai-result">{{ aiResult }}</pre>
    </section>
  </div>
</template>

<style scoped>
.ai-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 720px;
  margin: 0 auto;
}

.page-head h1 {
  margin: 0;
  font-size: 1.5rem;
}

.sub {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.prompt-box, .ai-result {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 320px;
  overflow-y: auto;
  margin: 0 0 0.75rem;
}

.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #c00;
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>