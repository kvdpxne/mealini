<script setup lang="ts">
import {PackagePlus} from 'lucide-vue-next'
import ShoppingItemList from './ShoppingItemList.vue'
import type {ShoppingListItem} from '@/types/database.types'

defineProps<{
  bought: ShoppingListItem[]
  loading: boolean
  isOnline: boolean
  movingAll: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'move-to-fridge', id: string): void
  (e: 'move-all-bought'): void
  (e: 'clear'): void
}>()
</script>

<template>
  <section>
    <div class="section-head">
      <h2>Kupione <span v-if="bought.length" class="count">({{ bought.length }})</span></h2>
      <div v-if="bought.length > 0" class="bulk-actions">
        <button class="secondary" :disabled="!isOnline || movingAll" @click="emit('move-all-bought')">
          <PackagePlus :size="16"/>
          <span>{{ movingAll ? 'Przenoszenie...' : 'Przenieś do lodówki' }}</span>
        </button>
        <button class="secondary" :disabled="!isOnline" @click="emit('clear')">Wyczyść</button>
      </div>
    </div>
    <ShoppingItemList
      :items="bought"
      :loading="loading"
      :disabled="!isOnline"
      empty-text=""
      @toggle="emit('toggle', $event)"
      @delete="emit('delete', $event)"
      @move-to-fridge="emit('move-to-fridge', $event)"
    />
  </section>
</template>

<style scoped>
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.25rem 0 0.25rem;
}

.section-head h2 {
  font-size: 1.05rem;
  margin: 0;
  color: #374151;
}

.count {
  color: #6b7280;
  font-weight: 400;
  font-size: 0.85rem;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover:not(:disabled) {
  background: #f3f4f6;
}

.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>