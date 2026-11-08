<script setup lang="ts">
import {ref} from 'vue'
import {ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X} from 'lucide-vue-next'
import type {StoreZone} from '@/types/database.types'

const props = defineProps<{ zones: StoreZone[]; disabled?: boolean }>()
const emit = defineEmits<{
  (e: 'add', name: string): void
  (e: 'rename', id: string, name: string): void
  (e: 'delete', id: string): void
  (e: 'move', id: string, direction: -1 | 1): void
}>()

const newName = ref('')
const editingId = ref<string | null>(null)
const editingName = ref('')

function handleAdd() {
  const n = newName.value.trim()
  if (!n) return
  emit('add', n)
  newName.value = ''
}

function startRename(zone: StoreZone) {
  editingId.value = zone.id
  editingName.value = zone.name
}

function commitRename() {
  if (!editingId.value) return
  const n = editingName.value.trim()
  if (n) emit('rename', editingId.value, n)
  editingId.value = null
}

function cancelRename() {
  editingId.value = null
}
</script>

<template>
  <div class="zone-editor">
    <ul class="zone-list">
      <li v-for="(zone, i) in props.zones" :key="zone.id">
        <span class="order">{{ i + 1 }}</span>
        <template v-if="editingId === zone.id">
          <input
            v-model="editingName"
            class="rename-input"
            maxlength="40"
            autofocus
            @keyup.enter="commitRename"
            @keyup.esc="cancelRename"
          />
          <button class="icon-btn" title="Zapisz" @click="commitRename">
            <Check :size="14"/>
          </button>
          <button class="icon-btn" title="Anuluj" @click="cancelRename">
            <X :size="14"/>
          </button>
        </template>
        <template v-else>
          <span class="name">{{ zone.name }}</span>
          <button class="icon-btn" title="Zmień nazwę" :disabled="disabled" @click="startRename(zone)">
            <Pencil :size="14"/>
          </button>
          <button class="icon-btn" title="W górę" :disabled="disabled || i === 0" @click="emit('move', zone.id, -1)">
            <ArrowUp :size="14"/>
          </button>
          <button class="icon-btn" title="W dół" :disabled="disabled || i === props.zones.length - 1"
                  @click="emit('move', zone.id, 1)">
            <ArrowDown :size="14"/>
          </button>
          <button class="icon-btn danger" title="Usuń" :disabled="disabled" @click="emit('delete', zone.id)">
            <Trash2 :size="14"/>
          </button>
        </template>
      </li>
      <li v-if="props.zones.length === 0" class="empty">Brak stref. Dodaj pierwszą poniżej.</li>
    </ul>

    <form class="add-form" @submit.prevent="handleAdd">
      <input v-model="newName" type="text" maxlength="40" placeholder="np. Pieczywo" :disabled="disabled"/>
      <button type="submit" :disabled="disabled || !newName.trim()">
        <Plus :size="14"/>
        <span>Dodaj strefę</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.zone-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.zone-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.zone-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.zone-list li.empty {
  color: #9ca3af;
  font-size: 0.85rem;
  font-style: italic;
}

.order {
  font-size: 0.8rem;
  color: #9ca3af;
  min-width: 1.5rem;
}

.name {
  flex: 1;
  font-size: 0.9rem;
}

.rename-input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
}

.icon-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111;
}

.icon-btn.danger:hover:not(:disabled) {
  background: #fef2f2;
  color: #dc2626;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.add-form {
  display: flex;
  gap: 0.5rem;
}

.add-form input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.add-form button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.9rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.add-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>