<script setup lang="ts">
import {toRef} from 'vue'
import {Pencil, ShoppingCart, Trash2} from 'lucide-vue-next'
import type {FridgeItem} from '@/types/database.types'
import InlineEdit from '@/components/shared/InlineEdit.vue'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import CategoryBadge from './CategoryBadge.vue'
import ItemPhoto from '@/components/shared/ItemPhoto.vue'
import {formatRelativeExpiry} from '@/utils/date'
import {useFridgeItems} from '@/composables/useFridgeItems'
import {LIMITS, NAME_MAX_LENGTH} from '@/lib/validation'
import {formatQuantityParts} from '@/lib/quantity'
import {displayStepForUnit} from '@/lib/units'

const props = defineProps<{ items: FridgeItem[]; loading: boolean; disabled?: boolean }>()
const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'move-to-shopping', id: string): void
  (e: 'update-quantity', id: string, quantity: number, unit: string): void
  (e: 'update-name', id: string, name: string): void
  (e: 'update-note', id: string, note: string | null): void
  (e: 'update-image', id: string, path: string | null): void
  (e: 'edit', item: FridgeItem): void
}>()

const {categorize} = useFridgeItems(toRef(props, 'items'))

function badgeClass(item: FridgeItem) {
  return `badge--${categorize(item.expiry_date)}`
}

function displayQty(item: FridgeItem) {
  return formatQuantityParts(item.quantity, item.unit)
}

function handleQtyUpdate(item: FridgeItem, newValue: number) {
  const parts = displayQty(item)
  emit('update-quantity', item.id, newValue, parts.unit)
}

function handleNoteUpdate(id: string, newValue: string) {
  const note = newValue.trim() || null
  emit('update-note', id, note)
}
</script>

<template>
  <SkeletonList v-if="loading" :count="3"/>
  <div v-else-if="items.length === 0" class="state">
    Brak produktów spełniających kryteria.
  </div>
  <ul v-else class="list">
    <li v-for="item in items" :key="item.id" :class="badgeClass(item)">
      <ItemPhoto
        :image-path="item.image_path"
        item-type="fridge"
        :item-id="item.id"
        :disabled="disabled"
        @update:image-path="emit('update-image', item.id, $event)"
      />
      <div class="info">
        <div class="main-line">
          <InlineEdit
            :model-value="item.name"
            type="text"
            :maxlength="NAME_MAX_LENGTH"
            :disabled="disabled"
            emphasis
            @update="emit('update-name', item.id, $event as string)"
          />
          <CategoryBadge :category="item.category"/>
          <InlineEdit
            :model-value="displayQty(item).value"
            type="number"
            :min="0.01"
            :step="displayStepForUnit(displayQty(item).unit)"
            :suffix="displayQty(item).unit"
            :disabled="disabled"
            variant="muted"
            @update="handleQtyUpdate(item, $event as number)"
          />
          <span v-if="item.expiry_date" class="expiry">
            {{ formatRelativeExpiry(item.expiry_date) }}
          </span>
        </div>
        <div class="note-line">
          <InlineEdit
            :model-value="item.note ?? ''"
            type="text"
            :maxlength="LIMITS.note"
            :disabled="disabled"
            variant="note"
            placeholder="Dodaj notatkę"
            allow-empty
            @update="handleNoteUpdate(item.id, $event as string)"
          />
        </div>
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
  align-items: flex-start;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fff;
  border-left: 4px solid #d1d5db;
  gap: 0.5rem;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.main-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: baseline;
}

.note-line {
  padding-left: 0.15rem;
}

.expiry {
  color: #6b7280;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.35rem;
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
</style>