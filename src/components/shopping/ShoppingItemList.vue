<script setup lang="ts">
import {PackagePlus, Trash2} from 'lucide-vue-next'
import type {ShoppingListItem} from '@/types/database.types'
import SkeletonList from '@/components/shared/SkeletonList.vue'

defineProps<{
  items: ShoppingListItem[]
  emptyText: string
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'move-to-fridge', id: string): void
}>()
</script>

<
<template>
  <SkeletonList v-if="loading" :count="3"/>
  <p v-else-if="items.length === 0" class="empty">{{ emptyText }}</p>
  <ul v-else class="list">
    <li v-for="item in items" :key="item.id" :class="{ bought: item.is_bought }">
      <label>
        <input
          type="checkbox"
          :checked="item.is_bought"
          :disabled="disabled"
          @change="emit('toggle', item.id)"
        />
        <span>{{ item.name }}</span>
      </label>
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
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-radius: 6px;
}

.list li.bought span {
  text-decoration: line-through;
  color: #9ca3af;
}

.list label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
  flex: 1;
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

.actions .move {
  opacity: 0.4;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
}

.list li:hover .move, .list li.bought .move {
  opacity: 1;
}
</style>