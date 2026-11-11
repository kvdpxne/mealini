<script setup lang="ts">
import ZoneEditor from './ZoneEditor.vue'
import type {StoreZone} from '@/types/database.types'

defineProps<{ zones: StoreZone[] }>()
const emit = defineEmits<{
  (e: 'add', name: string): void
  (e: 'rename', id: string, name: string): void
  (e: 'delete', id: string): void
  (e: 'move', id: string, direction: -1 | 1): void
}>()
</script>

<template>
  <section class="card">
    <h2>Strefy</h2>
    <p class="hint">Kolejność stref odpowiada kolejności przejścia przez sklep.</p>
    <ZoneEditor
      :zones="zones"
      @add="emit('add', $event)"
      @rename="(id, name) => emit('rename', id, name)"
      @delete="emit('delete', $event)"
      @move="(id, dir) => emit('move', id, dir)"
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

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.75rem;
}
</style>