<script setup lang="ts">
import {ref} from 'vue'
import {Image as ImageIcon, Trash2, Upload} from 'lucide-vue-next'

const props = defineProps<{ mapUrl: string | null; disabled?: boolean }>()
const emit = defineEmits<{
  (e: 'upload', file: File): void
  (e: 'remove'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function handlePick() {
  if (!props.disabled) fileInput.value?.click()
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('Plik jest za duży (max 5 MB).')
    return
  }
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
    alert('Dozwolone formaty: PNG, JPEG, WebP, SVG.')
    return
  }
  emit('upload', file)
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="map-uploader">
    <div v-if="mapUrl" class="map-preview">
      <img :src="mapUrl" alt="Mapa sklepu"/>
      <div class="map-actions">
        <button class="secondary" :disabled="disabled" @click="handlePick">
          <Upload :size="14"/>
          <span>Zmień</span>
        </button>
        <button class="danger" :disabled="disabled" @click="emit('remove')">
          <Trash2 :size="14"/>
          <span>Usuń</span>
        </button>
      </div>
    </div>
    <button v-else class="upload-zone" :disabled="disabled" @click="handlePick">
      <ImageIcon :size="32"/>
      <span>Dodaj mapę sklepu</span>
      <small>PNG, JPEG, WebP lub SVG, max 5 MB</small>
    </button>
    <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden
           @change="handleFile"/>
  </div>
</template>

<style scoped>
.map-uploader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  background: #f9fafb;
  cursor: pointer;
  color: #6b7280;
}

.upload-zone:hover:not(:disabled) {
  border-color: #0a7;
  background: #f0fdf4;
  color: #0a7;
}

.upload-zone small {
  font-size: 0.75rem;
}

.map-preview img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.map-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.map-actions button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  border: 1px solid transparent;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
}

.secondary:hover:not(:disabled) {
  background: #f3f4f6;
}

.danger {
  background: transparent;
  border-color: #fecaca;
  color: #b91c1c;
}

.danger:hover:not(:disabled) {
  background: #fef2f2;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>