<script setup lang="ts">
import type {CategoryFilter} from '@/composables/useFridgeItems'

defineProps<{ search: string; category: CategoryFilter }>()
const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:category', value: CategoryFilter): void
}>()

const categories: { value: CategoryFilter; label: string }[] = [
  {value: 'all', label: 'Wszystkie'},
  {value: 'expired', label: 'Przeterminowane'},
  {value: 'expiring', label: 'Wkrótce'},
  {value: 'fresh', label: 'Świeże'},
  {value: 'no-date', label: 'Bez daty'},
]
</script>

<template>
  <div class="fridge-filters">
    <input
      :value="search"
      type="search"
      placeholder="Szukaj produktu…"
      class="search"
      @input="emit('update:search', ($event.target as HTMLInputElement).value)"
    />
    <div class="chips">
      <button
        v-for="c in categories"
        :key="c.value"
        class="chip"
        :class="{ active: category === c.value }"
        @click="emit('update:category', c.value)"
      >
        {{ c.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.fridge-filters {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0.75rem 0;
}

.search {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
}

.chip:hover {
  background: #e5e7eb;
}

.chip.active {
  background: #1f2937;
  color: #fff;
  border-color: #1f2937;
}
</style>