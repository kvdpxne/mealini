<script setup lang="ts">
import MapUploader from './MapUploader.vue'

defineProps<{ mapUrl: string | null }>()
const emit = defineEmits<{
  (e: 'upload', file: File): void
  (e: 'remove'): void
}>()
</script>

<template>
  <section class="card">
    <h2>Mapa sklepu</h2>
    <MapUploader
      :map-url="mapUrl"
      @upload="emit('upload', $event)"
      @remove="emit('remove')"
    />
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
}
</style>