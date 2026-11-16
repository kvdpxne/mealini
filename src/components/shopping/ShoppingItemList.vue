<script setup lang="ts">
import {PackagePlus, Trash2} from 'lucide-vue-next'
import type {ShoppingListItem} from '@/types/database.types'
import InlineEdit from '@/components/shared/InlineEdit.vue'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import {formatQuantityParts} from '@/lib/quantity'
import {displayStepForUnit} from '@/lib/units'
import {LIMITS, NAME_MAX_LENGTH} from '@/lib/validation'
import ItemPhoto from '@/components/shared/ItemPhoto.vue'

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
  (e: 'update-note', id: string, note: string | null): void
  (e: 'update-image', id: string, path: string | null): void
}>()

function displayQty(item: ShoppingListItem) {
  return formatQuantityParts(item.quantity, item.unit)
}

function handleQtyUpdate(item: ShoppingListItem, newValue: number) {
  const parts = displayQty(item)
  emit('update-quantity', item.id, newValue, parts.unit)
}

function handleNoteUpdate(id: string, newValue: string) {
  const note = newValue.trim() || null
  emit('update-note', id, note)
}

function handleImageUpdate(id: string, newValue: string | null) {
  const path = newValue?.trim() ?? null;
  emit('update-image', id, path)
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

      <ItemPhoto
        :image-path="item.image_path"
        item-type="shopping"
        :item-id="item.id"
        :disabled="disabled"
        @update:image-path="handleImageUpdate(item.id, $event)"
      />

      <div class="content">
        <div class="main-line">
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

        <div class="note-line">
          <InlineEdit
            v-if="editable && !disabled"
            :model-value="item.note ?? ''"
            type="text"
            :maxlength="LIMITS.note"
            variant="note"
            placeholder="Dodaj notatkę"
            allow-empty
            @update="handleNoteUpdate(item.id, $event as string)"
          />
          <span v-else-if="item.note" class="note">{{ item.note }}</span>
        </div>
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
  align-items: flex-start;
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

.list li.bought .note {
  opacity: 0.6;
  text-decoration: line-through;
}

.check {
  display: inline-flex;
  cursor: pointer;
  padding-top: 0.25rem;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.main-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
}

.name {
  color: #111;
}

.qty {
  color: #6b7280;
  font-size: 0.85rem;
}

.note-line {
  padding-left: 0.15rem;
}

.note {
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
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