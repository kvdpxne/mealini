<script setup lang="ts">
import {Package, Pencil, Trash2} from 'lucide-vue-next'
import type {ShoppingSet} from '@/types/database.types'

defineProps<{ set: ShoppingSet; itemCount: number }>()
const emit = defineEmits<{
  (e: 'apply'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <li class="set-card">
    <div class="info">
      <Package :size="18"/>
      <div>
        <strong>{{ set.name }}</strong>
        <span class="count">{{ itemCount }} {{ itemCount === 1 ? 'pozycja' : 'pozycji' }}</span>
      </div>
    </div>
    <div class="actions">
      <button class="primary" @click="emit('apply')">Dodaj do listy</button>
      <button class="icon-btn" title="Edytuj" @click="emit('edit')">
        <Pencil :size="16"/>
      </button>
      <button class="icon-btn danger" title="Usuń" @click="emit('delete')">
        <Trash2 :size="16"/>
      </button>
    </div>
  </li>
</template>

<style scoped>
.set-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  flex-wrap: wrap;
}

.info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #111;
  flex: 1;
  min-width: 0;
}

.info strong {
  display: block;
  font-size: 0.95rem;
}

.count {
  font-size: 0.8rem;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.primary {
  padding: 0.4rem 0.9rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.primary:hover {
  background: #086;
}

.icon-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  color: #6b7280;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
}

.icon-btn:hover {
  background: #f3f4f6;
  color: #111;
}

.icon-btn.danger:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}
</style>