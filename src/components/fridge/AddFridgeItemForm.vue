<script setup lang="ts">
import {ref} from 'vue'
import { UNITS } from '@/lib/units'
import {useFridgeStore} from '@/stores/fridge.store'
import {useAuthStore} from '@/stores/auth.store'

const fridgeStore = useFridgeStore()
const authStore = useAuthStore()

const name = ref('')
const quantity = ref<number>(1)
const unit = ref('szt')
const expiryDate = ref('')
const submitting = ref(false)
const localError = ref<string | null>(null)

async function handleSubmit() {
  if (!authStore.householdId || !name.value.trim()) return
  submitting.value = true
  localError.value = null
  try {
    await fridgeStore.addItem({
      household_id: authStore.householdId,
      name: name.value.trim(),
      quantity: quantity.value,
      unit: unit.value,
      expiry_date: expiryDate.value || null,
    })
    name.value = ''
    quantity.value = 1
    unit.value = 'szt'
    expiryDate.value = ''
  } catch (e) {
    localError.value = e instanceof Error ? e.message : 'Błąd dodawania'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="add-form" @submit.prevent="handleSubmit">
    <input v-model="name" type="text" placeholder="Nazwa produktu" required/>
    <input v-model.number="quantity" type="number" min="0.01" step="0.01" placeholder="Ilość"/>
    <select v-model="unit">
      <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
    </select>
    <input v-model="expiryDate" type="date" title="Data ważności (opcjonalnie)"/>
    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Dodawanie...' : 'Dodaj do lodówki' }}
    </button>
    <p v-if="localError" class="error">{{ localError }}</p>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.add-form input, .add-form select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.add-form input[type="text"] {
  flex: 1;
  min-width: 160px;
}

.add-form input[type="number"] {
  width: 80px;
}

.add-form button {
  padding: 0.5rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  flex-basis: 100%;
  color: #c00;
  font-size: 0.85rem;
  margin: 0;
}

@media (max-width: 640px) {
  .add-form {
    flex-direction: column;
    align-items: stretch;
  }

  .add-form input[type="text"],
  .add-form input[type="number"],
  .add-form select,
  .add-form button {
    width: 100%;
  }
}
</style>