<script setup lang="ts">
import {Plus} from 'lucide-vue-next'
import type {ShoppingSuggestion} from '@/services/shopping-history.service'

defineProps<{
  suggestions: ShoppingSuggestion[]
  disabled?: boolean
}>()

const emit = defineEmits<{ (e: 'add', name: string): void }>()
</script>

<template>
  <div v-if="suggestions.length > 0" class="quick-add">
    <span class="quick-add__label">Często kupujesz:</span>
    <div class="quick-add__chips">
      <button
        v-for="s in suggestions"
        :key="s.name"
        type="button"
        class="chip"
        :disabled="disabled"
        :title="disabled ? 'Niedostępne offline' : `Dodaj „${s.name}”`"
        @click="emit('add', s.name)"
      >
        <Plus :size="12"/>
        <span>{{ s.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-add {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0.5rem 0 0.75rem;
}

.quick-add__label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-top: 0.35rem;
  flex-shrink: 0;
}

.quick-add__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  flex: 1;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.chip:hover:not(:disabled) {
  background: #e0e7ff;
  border-color: #a5b4fc;
}

.chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .quick-add__label {
    display: none;
  }
}
</style>