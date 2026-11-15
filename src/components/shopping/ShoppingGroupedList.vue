<script setup lang="ts">
import {Trash2} from 'lucide-vue-next'
import ZoneSelect from './ZoneSelect.vue'
import InlineEdit from '@/components/shared/InlineEdit.vue'
import type {ShoppingListItem, StoreZone} from '@/types/database.types'
import type {ZoneGroup} from '@/composables/useShoppingLocationGroups'
import {formatQuantityParts} from '@/lib/quantity'
import {displayStepForUnit} from '@/lib/units'
import {LIMITS, NAME_MAX_LENGTH} from '@/lib/validation'

defineProps<{
  groups: ZoneGroup[]
  zones: StoreZone[]
  isOnline: boolean
  isSearchActive: boolean
  zoneIdFor: (item: ShoppingListItem) => string | null
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'set-zone', itemName: string, zoneId: string | null): void
  (e: 'update-name', id: string, name: string): void
  (e: 'update-quantity', id: string, quantity: number, unit: string): void
  (e: 'update-note', id: string, note: string | null): void
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
</script>

<template>
  <div v-for="group in groups" :key="group.zone?.id ?? 'unassigned'" class="zone-group">
    <h3 class="zone-heading">
      {{ group.zone?.name ?? 'Bez przypisania' }}
      <span class="count">({{ group.items.length }})</span>
    </h3>
    <ul class="zone-items">
      <li v-for="item in group.items" :key="item.id">
        <label class="check">
          <input
            type="checkbox"
            :checked="item.is_bought"
            :disabled="!isOnline"
            @change="emit('toggle', item.id)"
          />
        </label>

        <div class="content">
          <div class="main-line">
            <InlineEdit
              :model-value="item.name"
              type="text"
              :maxlength="NAME_MAX_LENGTH"
              :disabled="!isOnline"
              emphasis
              @update="emit('update-name', item.id, $event as string)"
            />
            <InlineEdit
              :model-value="displayQty(item).value"
              type="number"
              :min="0.01"
              :step="displayStepForUnit(displayQty(item).unit)"
              :suffix="displayQty(item).unit"
              :disabled="!isOnline"
              variant="muted"
              @update="handleQtyUpdate(item, $event as number)"
            />
          </div>
          <div class="note-line">
            <InlineEdit
              :model-value="item.note ?? ''"
              type="text"
              :maxlength="LIMITS.note"
              :disabled="!isOnline"
              variant="note"
              placeholder="Dodaj notatkę"
              allow-empty
              @update="handleNoteUpdate(item.id, $event as string)"
            />
          </div>
        </div>

        <div class="zone-actions">
          <ZoneSelect
            :zones="zones"
            :value="zoneIdFor(item)"
            :disabled="!isOnline"
            @change="emit('set-zone', item.name, $event)"
          />
          <button class="icon-btn" title="Usuń" :disabled="!isOnline" @click="emit('delete', item.id)">
            <Trash2 :size="16"/>
          </button>
        </div>
      </li>
    </ul>
  </div>
  <p v-if="groups.length === 0" class="empty">
    {{ isSearchActive ? 'Brak wyników.' : 'Nic do kupienia.' }}
  </p>
</template>

<style scoped>
.zone-group {
  margin: 1rem 0;
}

.zone-heading {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.4rem;
}

.count {
  color: #9ca3af;
  font-weight: 400;
}

.zone-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.zone-items li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-radius: 6px;
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

.note-line {
  padding-left: 0.15rem;
}

.zone-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.3rem;
  border-radius: 4px;
}

.icon-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #dc2626;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty {
  color: #6b7280;
  text-align: center;
  padding: 1rem;
}
</style>