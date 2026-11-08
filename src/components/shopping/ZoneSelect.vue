<script setup lang="ts">
import type {StoreZone} from '@/types/database.types'

defineProps<{ zones: StoreZone[]; value: string | null; disabled?: boolean }>()
const emit = defineEmits<{ (e: 'change', zoneId: string | null): void }>()

function onChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  emit('change', v || null)
}
</script>

<template>
  <select
    class="zone-select"
    :class="{ unassigned: !value }"
    :value="value ?? ''"
    :disabled="disabled"
    @change="onChange"
  >
    <option value="">— strefa —</option>
    <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
  </select>
</template>

<style scoped>
.zone-select {
  appearance: none;
  background: #e0e7ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  padding: 0.2rem 1.4rem 0.2rem 0.6rem;
  font-size: 0.72rem;
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%233730a3' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.4rem center;
  max-width: 140px;
}

.zone-select.unassigned {
  background-color: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
}

.zone-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>