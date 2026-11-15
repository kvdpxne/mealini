<script setup lang="ts">
import {Plus, Trash2} from 'lucide-vue-next'
import {UNITS} from '@/lib/units'
import type {IngredientRow} from '@/composables/useRecipeForm'

defineProps<{ rows: IngredientRow[]; disabled?: boolean }>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', key: number): void
  (e: 'update', key: number, field: 'name' | 'quantity' | 'unit', value: string | number): void
}>()
</script>

<template>
  <div class="ingredients">
    <div class="head">
      <span>Składnik</span>
      <span>Ilość</span>
      <span>Jednostka</span>
      <span></span>
    </div>
    <div v-for="row in rows" :key="row.key" class="row">
      <input
        :value="row.name"
        type="text"
        placeholder="np. mleko"
        maxlength="80"
        :disabled="disabled"
        @input="emit('update', row.key, 'name', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="row.quantity"
        type="number"
        min="0.01"
        step="0.01"
        :disabled="disabled"
        @input="emit('update', row.key, 'quantity', Number(($event.target as HTMLInputElement).value))"
      />
      <select
        :value="row.unit"
        :disabled="disabled"
        @change="emit('update', row.key, 'unit', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
      </select>
      <button
        type="button"
        class="icon-btn"
        title="Usuń"
        :disabled="disabled || rows.length === 1"
        @click="emit('remove', row.key)"
      >
        <Trash2 :size="16"/>
      </button>
    </div>
    <button type="button" class="add" :disabled="disabled" @click="emit('add')">
      <Plus :size="14"/>
      <span>Dodaj składnik</span>
    </button>
  </div>
</template>

<style scoped>
.ingredients {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.head {
  display: grid;
  grid-template-columns: 1fr 90px 100px 36px;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0 0.25rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr 90px 100px 36px;
  gap: 0.5rem;
  align-items: center;
}

.row input, .row select {
  padding: 0.45rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
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
  background: #fef2f2;
  color: #dc2626;
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px dashed #d1d5db;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.4rem;
  align-self: flex-start;
}

.add:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #0a7;
  color: #0a7;
}

@media (max-width: 640px) {
  .head {
    display: none;
  }

  .row {
    grid-template-columns: 1fr 36px;
    grid-template-areas: "name del" "qty unit";
  }

  .row > :nth-child(1) {
    grid-area: name;
  }

  .row > :nth-child(2) {
    grid-area: qty;
  }

  .row > :nth-child(3) {
    grid-area: unit;
  }

  .row > :nth-child(4) {
    grid-area: del;
  }
}
</style>