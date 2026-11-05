<script setup lang="ts">
import type {ShoppingListItem} from '@/types/database.types'

defineProps<{ items: ShoppingListItem[]; emptyText: string }>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'move-to-fridge', id: string): void
}>()
</script>

<template>
  <p v-if="items.length === 0" class="empty">{{ emptyText }}</p>
  <ul v-else class="list">
    <li v-for="item in items" :key="item.id" :class="{ bought: item.is_bought }">
      <label>
        <input type="checkbox" :checked="item.is_bought" @change="emit('toggle', item.id)"/>
        <span>{{ item.name }}</span>
      </label>
      <div class="actions">
        <button
          class="move"
          title="Przenieś do lodówki"
          @click="emit('move-to-fridge', item.id)"
        >🧊
        </button>
        <button title="Usuń" @click="emit('delete', item.id)">🗑</button>
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
  font-size: 1rem;
  padding: 0.25rem;
}

.actions .move {
  opacity: 0.4;
  transition: opacity 0.15s;
}

.list li:hover .move, .list li.bought .move {
  opacity: 1;
}
</style>