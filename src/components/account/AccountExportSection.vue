<script setup lang="ts">
import {ref} from 'vue'
import {Download, Shield} from 'lucide-vue-next'
import {exportService} from '@/services/export.service'
import {downloadJson} from '@/lib/download'
import {useAsyncAction} from '@/composables/useAsyncAction'

const {run} = useAsyncAction()
const downloading = ref(false)

async function handleDownload() {
  downloading.value = true
  try {
    await run(async () => {
      const payload = await exportService.exportAll()
      const date = new Date().toISOString().slice(0, 10)
      downloadJson(payload, `mealini-export-${date}.json`)
      return true as const
    }, {success: 'Eksport gotowy – sprawdź folder pobranych'})
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <section class="card">
    <h2>Eksport danych</h2>
    <p class="hint">
      Pobierz kopię swoich danych w formacie JSON. Eksport zawiera Twój profil,
      adres e-mail i metadane konta oraz pełną zawartość gospodarstw domowych,
      do których należysz (lodówka, lista zakupów, historia, sklepy ze strefami
      i przypisaniami). Zgodne z prawem do przenoszenia danych (RODO, art. 20).
    </p>
    <button class="download-btn" :disabled="downloading" @click="handleDownload">
      <Download :size="16"/>
      <span>{{ downloading ? 'Przygotowywanie...' : 'Pobierz dane (.json)' }}</span>
    </button>
    <p class="meta">
      <Shield :size="12"/>
      <span>Plik zapisuje się lokalnie – dane nie są nigdzie wysyłane.</span>
    </p>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.download-btn:hover:not(:disabled) {
  background: #086;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.75rem 0 0;
}
</style>