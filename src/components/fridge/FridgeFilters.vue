<script setup lang="ts">
import type {ExpiryFilter} from '@/composables/useFridgeItems'
import type {ProductCategory} from '@/lib/productCategories'
import {PRODUCT_CATEGORIES} from '@/lib/productCategories'

export type ProductCategoryFilter = 'all' | 'uncategorized' | ProductCategory

defineProps<{
  search: string
  expiryFilter: ExpiryFilter
  productCategory: ProductCategoryFilter
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:expiryFilter', value: ExpiryFilter): void
  (e: 'update:productCategory', value: ProductCategoryFilter): void
}>()

const expiryOptions: { value: ExpiryFilter; label: string }[] = [
  {value: 'all', label: 'Wszystkie'},
  {value: 'expired', label: 'Przeterminowane'},
  {value: 'expiring', label: 'Wkrótce'},
  {value: 'fresh', label: 'Świeże'},
  {value: 'no-date', label: 'Bez daty'},
]

const categoryOptions: { value: ProductCategoryFilter; label: string }[] = [
  {value: 'all', label: 'Wszystkie'},
  ...PRODUCT_CATEGORIES,
  {value: 'uncategorized', label: 'Bez kategorii'},
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

    <div class="filter-row">
      <span class="filter-label">Kategoria:</span>
      <div class="chips">
        <button
          v-for="c in categoryOptions"
          :key="c.value"
          class="chip"
          :class="{ active: productCategory === c.value }"
          @click="emit('update:productCategory', c.value)"
        >
          {{ c.label }}
        </button>
      </div>
    </div>

    <div class="filter-row">
      <span class="filter-label">Ważność:</span>
      <div class="chips">
        <button
          v-for="f in expiryOptions"
          :key="f.value"
          class="chip"
          :class="{ active: expiryFilter === f.value }"
          @click="emit('update:expiryFilter', f.value)"
        >
          {{ f.label }}
        </button>
      </div>
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

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-top: 0.35rem;
  min-width: 5.5rem;
  flex-shrink: 0;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  flex: 1;
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

@media (max-width: 640px) {
  .filter-label {
    display: none;
  }
}
</style>