<script setup lang="ts">
import {nextTick, ref} from 'vue'

const props = defineProps<{ quantity: number; unit: string }>()
const emit = defineEmits<{ (e: 'update', value: number): void }>()

const editing = ref(false)
const draft = ref(props.quantity)
const inputEl = ref<HTMLInputElement | null>(null)

async function startEdit() {
  draft.value = props.quantity
  editing.value = true
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}

function commit() {
  if (!editing.value) return
  const value = Number(draft.value)
  editing.value = false
  if (Number.isFinite(value) && value > 0 && value !== props.quantity) {
    emit('update', value)
  }
}

function cancel() {
  editing.value = false
}
</script>

<template>
  <span v-if="!editing" class="qty" title="Kliknij, aby edytować" @click="startEdit">
    {{ quantity }} {{ unit }}
  </span>
  <input
    v-else
    ref="inputEl"
    v-model.number="draft"
    type="number"
    min="0.01"
    step="0.01"
    class="qty-input"
    @blur="commit"
    @keyup.enter="commit"
    @keyup.esc="cancel"
  />
</template>

<style scoped>
.qty {
  cursor: pointer;
  color: #6b7280;
  font-size: 0.9rem;
  border-bottom: 1px dashed transparent;
}

.qty:hover {
  border-bottom-color: #9ca3af;
}

.qty-input {
  width: 80px;
  padding: 0.1rem 0.3rem;
  font-size: 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
</style>