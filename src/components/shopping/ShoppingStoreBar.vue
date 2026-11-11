<script setup lang="ts">
import {Store as StoreIcon} from 'lucide-vue-next'
import {RouterLink} from 'vue-router'
import type {Store} from '@/types/database.types'

defineProps<{
  stores: Store[]
  selectedStoreId: string | null
}>()

const emit = defineEmits<{ (e: 'select', id: string | null): void }>()
</script>

<template>
  <div class="store-bar">
    <StoreIcon :size="16"/>
    <select
      class="store-select"
      :value="selectedStoreId ?? ''"
      @change="emit('select', ($event.target as HTMLSelectElement).value || null)"
    >
      <option value="">— bez sklepu —</option>
      <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }}</option>
    </select>
    <RouterLink v-if="!stores.length" to="/stores" class="manage-link">Dodaj sklep</RouterLink>
  </div>
</template>

<style scoped>
.store-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
}

.store-select {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 0.9rem;
}

.manage-link {
  font-size: 0.8rem;
  color: #0a7;
  text-decoration: none;
}
</style>