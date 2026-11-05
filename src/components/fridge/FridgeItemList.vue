<script setup lang="ts">
import type {FridgeItem} from '@/types/database.types'
import EditableQuantity from './EditableQuantity.vue'
import {formatRelativeExpiry} from '@/utils/date'
import {categorize} from "@/composables/useFridgeItems.ts";

const props = defineProps<{ items: FridgeItem[]; loading: boolean }>()
const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'move-to-shopping', id: string): void
  (e: 'update-quantity', id: string, quantity: number): void
}>()

function badgeClass(item: FridgeItem) {
  return `badge--${categorize(item.expiry_date)}`
}
</script>

<template>
  <div v-if="loading" class="state">Ładowanie...</div>
  <div v-else-if="items.length === 0" class="state">
    Brak produktów spełniających kryteria.
  </div>
  <ul v-else class="list">
    <li v-for="item in items" :key="item.id" :class="badgeClass(item)">
      <div class="info">
        <strong>{{ item.name }}</strong>
        <EditableQuantity
          :quantity="item.quantity"
          :unit="item.unit"
          @update="emit('update-quantity', item.id, $event)"
        />
        <span v-if="item.expiry_date" class="expiry">
          {{ formatRelativeExpiry(item.expiry_date) }}
        </span>
      </div>
      <div class="actions">
        <button title="Skończyło się – dodaj do zakupów" @click="emit('move-to-shopping', item.id)">🛒</button>
        <button title="Usuń" @click="emit('delete', item.id)">🗑</button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.state {
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
}

.list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fff;
  border-left: 4px solid #d1d5db;
}

.list li.badge--expired {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.list li.badge--expiring {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.list li.badge--fresh {
  border-left-color: #10b981;
}

.list li.badge--no-date {
  border-left-color: #9ca3af;
}

.info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: baseline;
}

.qty {
  color: #6b7280;
  font-size: 0.9rem;
}

.expiry {
  color: #6b7280;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 0.25rem;
}

.actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
}
</style>