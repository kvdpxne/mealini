<script setup lang="ts">
import {toRef} from 'vue'
import {Pencil, ShoppingCart, Trash2} from 'lucide-vue-next'
import type {FridgeItem} from '@/types/database.types'
import InlineEdit from '@/components/shared/InlineEdit.vue'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import {formatRelativeExpiry} from '@/utils/date'
import {useFridgeItems} from '@/composables/useFridgeItems'

const props = defineProps<{ items: FridgeItem[]; loading: boolean; disabled?: boolean }>()
const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'move-to-shopping', id: string): void
  (e: 'update-quantity', id: string, quantity: number): void
  (e: 'update-name', id: string, name: string): void
  (e: 'edit', item: FridgeItem): void
}>()

const {categorize} = useFridgeItems(toRef(props, 'items'))

function badgeClass(item: FridgeItem) {
  return `badge--${categorize(item.expiry_date)}`
}
</script>

<template>
  <SkeletonList v-if="loading" :count="3"/>
  <div v-else-if="items.length === 0" class="state">
    Brak produktów spełniających kryteria.
  </div>
  <ul v-else class="list">
    <li v-for="item in items" :key="item.id" :class="badgeClass(item)">
      <div class="info">
        <InlineEdit
          :model-value="item.name"
          type="text"
          :maxlength="NAME_MAX_LENGTH"
          :disabled="disabled"
          emphasis
          @update="emit('update-name', item.id, $event as string)"
        />
        <InlineEdit
          :model-value="item.quantity"
          type="number"
          :min="0.01"
          :step="0.01"
          :suffix="item.unit"
          :disabled="disabled"
          variant="muted"
          @update="emit('update-quantity', item.id, $event as number)"
        />
        <span v-if="item.expiry_date" class="expiry">
          {{ formatRelativeExpiry(item.expiry_date) }}
        </span>
      </div>
      <div class="actions">
        <button title="Edytuj" :disabled="disabled" @click="emit('edit', item)">
          <Pencil :size="18"/>
        </button>
        <button title="Skończyło się – dodaj do zakupów" :disabled="disabled"
                @click="emit('move-to-shopping', item.id)">
          <ShoppingCart :size="18"/>
        </button>
        <button title="Usuń" :disabled="disabled" @click="emit('delete', item.id)">
          <Trash2 :size="18"/>
        </button>
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
  padding: 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.actions button:hover {
  background: #f3f4f6;
  color: #111;
}
</style>