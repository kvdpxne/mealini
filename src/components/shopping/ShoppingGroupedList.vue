<script setup lang="ts">
import {Trash2} from 'lucide-vue-next'
import ZoneSelect from './ZoneSelect.vue'
import type {ShoppingListItem, StoreZone} from '@/types/database.types'
import type {ZoneGroup} from '@/composables/useShoppingLocationGroups'

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
}>()
</script>

<template>
  <div v-for="group in groups" :key="group.zone?.id ?? 'unassigned'" class="zone-group">
    <h3 class="zone-heading">
      {{ group.zone?.name ?? 'Bez przypisania' }}
      <span class="count">({{ group.items.length }})</span>
    </h3>
    <ul class="zone-items">
      <li v-for="item in group.items" :key="item.id">
        <label>
          <input
            type="checkbox"
            :checked="item.is_bought"
            :disabled="!isOnline"
            @change="emit('toggle', item.id)"
          />
          <span>{{ item.name }}</span>
          <span class="qty">{{ item.quantity }} {{ item.unit }}</span>
        </label>
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
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-radius: 6px;
}

.zone-items label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
  flex: 1;
}

.qty {
  color: #6b7280;
  font-size: 0.85rem;
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