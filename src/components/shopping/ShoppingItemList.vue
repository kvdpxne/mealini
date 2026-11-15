<script setup lang="ts">
import {PackagePlus, Trash2} from 'lucide-vue-next'
import type {ShoppingListItem} from '@/types/database.types'
import InlineEdit from '@/components/shared/InlineEdit.vue'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import {formatQuantityParts} from '@/lib/quantity'
import {displayStepForUnit} from '@/lib/units'
import {NAME_MAX_LENGTH} from '@/lib/validation'

withDefaults(defineProps<{
  items: ShoppingListItem[]
  emptyText: string
  loading?: boolean
  disabled?: boolean
  editable?: boolean
}>(), {
  editable: true,
})

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'move-to-fridge', id: string): void
  (e: 'update-name', id: string, name: string): void
  (e: 'update-quantity', id: string, quantity: number, unit: string): void
}>()

function displayQty(item: ShoppingListItem) {
  return formatQuantityParts(item.quantity, item.unit)
}

function handleQtyUpdate(item: ShoppingListItem, newValue: number) {
  const parts = displayQty(item)
  emit('update-quantity', item.id, newValue, parts.unit)
}
</script>

<template>
  <SkeletonList v-if="loading" :count="3"/>
  <p v-else-if="items.length === 0" class="empty">{{ emptyText }}</p>
  <ul v-else class="list">
    <li v-for="item in items" :key="item.id" :class="{ bought: item.is_bought }">
      <label class="check">
        <input
          type="checkbox"
          :checked="item.is_bought"
          :disabled="disabled"
          @change="emit('toggle', item.id)"
        />
      </label>

      <div class="content">
        <InlineEdit
          v-if="editable && !disabled"
          :model-value="item.name"
          type="text"
          :maxlength="NAME_MAX_LENGTH"
          @update="emit('update-name', item.id, $event as string)"
        />
        <span v-else class="name">{{ item.name }}</span>

        <InlineEdit
          v-if="editable && !disabled"
          :model-value="displayQty(item).value"
          type="number"
          :min="0.01"
          :step="displayStepForUnit(displayQty(item).unit)"
          :suffix="displayQty(item).unit"
          variant="muted"
          @update="handleQtyUpdate(item, $event as number)"
        />
        <span v-else class="qty">
          {{ displayQty(item).value }} {{ displayQty(item).unit }}
        </span>
      </div>

      <div class="actions">
        <button class="move" title="Przenieś do lodówki" :disabled="disabled" @click="emit('move-to-fridge', item.id)">
          <PackagePlus :size="18"/>
        </button>
        <button title="Usuń" :disabled="disabled" @click="emit('delete', item.id)">
          <Trash2 :size="18"/>
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.empty {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-radius: 6px;
}

.list li.bought .name {
  text-decoration: line-through;
  color: #9ca3af;
}

.list li.bought .qty {
  opacity: 0.6;
}

.check {
  display: inline-flex;
  cursor: pointer;
}

.content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.name {
  color: #111;
}

.qty {
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
  color: #6b7280;
  padding: 0.3rem;
  border-radius: 4px;
  display: inline-flex;
}

.actions button:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111;
}

.actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.actions .move {
  opacity: 0.4;
  transition: opacity 0.15s;
}

.list li:hover .move, .list li.bought .move {
  opacity: 1;
}
</style>