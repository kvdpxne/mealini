<script setup lang="ts">
import {UNITS} from '@/lib/units'
import {NAME_MAX_LENGTH} from '@/lib/validation'

defineProps<{
  name: string
  quantity: number
  unit: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:name', v: string): void
  (e: 'update:quantity', v: number): void
  (e: 'update:unit', v: string): void
  (e: 'submit'): void
}>()
</script>

<template>
  <form class="add-form" @submit.prevent="emit('submit')">
    <input
      :value="name"
      type="text"
      placeholder="Co dokupić?"
      required
      :maxlength="NAME_MAX_LENGTH"
      class="add-form__name"
      @input="emit('update:name', ($event.target as HTMLInputElement).value)"
    />
    <input
      :value="quantity"
      type="number"
      min="0.01"
      step="0.01"
      placeholder="Ilość"
      class="add-form__qty"
      @input="emit('update:quantity', Number(($event.target as HTMLInputElement).value))"
    />
    <select
      :value="unit"
      class="add-form__unit"
      @change="emit('update:unit', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
    </select>
    <button type="submit" :disabled="disabled">Dodaj</button>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-form__name {
  flex: 1;
  min-width: 160px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.add-form__qty {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.add-form__unit {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
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

@media (max-width: 640px) {
  .add-form {
    flex-direction: column;
    align-items: stretch;
  }

  .add-form__name, .add-form__qty, .add-form__unit, .add-form button {
    width: 100%;
  }
}
</style>