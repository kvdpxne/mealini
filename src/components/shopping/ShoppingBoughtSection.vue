<script setup lang="ts">
import {PackagePlus} from 'lucide-vue-next'
import ShoppingItemList from './ShoppingItemList.vue'
import type {ShoppingListItem} from '@/types/database.types'

defineProps<{
  bought: ShoppingListItem[]
  loading: boolean
  isOnline: boolean
  movingAll: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'move-to-fridge', id: string): void
  (e: 'move-all-bought'): void
  (e: 'clear'): void
  (e: 'update-name', id: string, name: string): void
  (e: 'update-quantity', id: string, quantity: number, unit: string): void
  (e: 'update-note', id: string, note: string | null): void
  (e: 'update-image', id: string, path: string | null): void
}>()
</script>

<template>
  <section>
    <div class="section-head">
      <h2>Kupione <span v-if="bought.length" class="count">({{ bought.length }})</span></h2>
      <div v-if="bought.length > 0" class="bulk-actions">
        <button class="secondary" :disabled="!isOnline || movingAll" @click="emit('move-all-bought')">
          <PackagePlus :size="16"/>
          <span>{{ movingAll ? 'Przenoszenie...' : 'Przenieś do lodówki' }}</span>
        </button>
        <button class="secondary" :disabled="!isOnline" @click="emit('clear')">Wyczyść</button>
      </div>
    </div>
    <ShoppingItemList
      :items="bought"
      :loading="loading"
      :disabled="!isOnline"
      :editable="true"
      empty-text=""
      @toggle="emit('toggle', $event)"
      @delete="emit('delete', $event)"
      @move-to-fridge="emit('move-to-fridge', $event)"
      @update-name="(id, name) => emit('update-name', id, name)"
      @update-quantity="(id, qty, unit) => emit('update-quantity', id, qty, unit)"
      @update-note="(id, note) => emit('update-note', id, note)"
      @update-image="(id, path) => emit('update-image', id, path)"
    />
  </section>
</template>