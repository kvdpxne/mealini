<script setup lang="ts">
import {nextTick, ref, watch} from 'vue'
import {X} from 'lucide-vue-next'
import {UNITS} from '@/lib/units'
import { NAME_MAX_LENGTH } from '@/lib/validation'
import type {FridgeItem} from '@/types/database.types'

type FridgeItemUpdates = Partial<Pick<FridgeItem, 'name' | 'quantity' | 'unit' | 'expiry_date'>>

const props = defineProps<{
  item: FridgeItem | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', id: string, updates: FridgeItemUpdates): void
  (e: 'close'): void
}>()

const name = ref('')
const quantity = ref<number>(1)
const unit = ref<string>('szt')
const expiryDate = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.item,
  async (item) => {
    if (!item) return
    name.value = item.name
    quantity.value = item.quantity
    unit.value = item.unit
    expiryDate.value = item.expiry_date ?? ''
    await nextTick()
    nameInput.value?.focus()
    nameInput.value?.select()
  },
  {immediate: true},
)

function handleSubmit() {
  if (!props.item || !name.value.trim()) return
  emit('save', props.item.id, {
    name: name.value.trim(),
    quantity: quantity.value,
    unit: unit.value,
    expiry_date: expiryDate.value || null,
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="item"
      class="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-fridge-item-title"
      @click.self="emit('close')"
      @keydown="handleKeydown"
    >
      <form class="dialog" @submit.prevent="handleSubmit">
        <header class="dialog-head">
          <h3 id="edit-fridge-item-title">Edytuj produkt</h3>
          <button type="button" class="icon-btn" title="Zamknij" @click="emit('close')">
            <X :size="18"/>
          </button>
        </header>

        <label>
          Nazwa
          <input ref="nameInput" v-model="name" type="text" :maxlength="NAME_MAX_LENGTH" required/>
        </label>

        <div class="row">
          <label>
            Ilość
            <input v-model.number="quantity" type="number" min="0.01" step="0.01" required/>
          </label>
          <label>
            Jednostka
            <select v-model="unit">
              <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
            </select>
          </label>
        </div>

        <label>
          Data ważności (opcjonalnie)
          <input v-model="expiryDate" type="date"/>
        </label>

        <div class="actions">
          <button type="button" class="secondary" @click="emit('close')">Anuluj</button>
          <button type="submit" class="primary" :disabled="submitting">
            {{ submitting ? 'Zapisywanie...' : 'Zapisz' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.dialog {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-head h3 {
  margin: 0;
  font-size: 1.1rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
  display: inline-flex;
}

.icon-btn:hover {
  background: #f3f4f6;
  color: #111;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #374151;
}

input, select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
}

.row {
  display: flex;
  gap: 0.75rem;
}

.row label {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.9rem;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
}

.primary {
  background: #0a7;
  color: #fff;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>