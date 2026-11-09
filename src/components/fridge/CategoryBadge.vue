<script setup lang="ts">
import {computed} from 'vue'
import {CATEGORY_LABELS, isValidProductCategory, type ProductCategory} from '@/lib/productCategories'

const props = defineProps<{ category: string | null }>()

const label = computed(() => {
  if (!isValidProductCategory(props.category)) return null
  return CATEGORY_LABELS[props.category as ProductCategory]
})

const variant = computed<ProductCategory | 'uncategorized'>(() => {
  if (!isValidProductCategory(props.category)) return 'uncategorized'
  return props.category as ProductCategory
})
</script>

<template>
  <span v-if="label" class="badge" :data-variant="variant">{{ label }}</span>
  <span v-else class="badge" data-variant="uncategorized">Bez kategorii</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge[data-variant='dairy'] {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge[data-variant='meat'] {
  background: #fee2e2;
  color: #b91c1c;
}

.badge[data-variant='vegetables'] {
  background: #dcfce7;
  color: #15803d;
}

.badge[data-variant='fruits'] {
  background: #ffedd5;
  color: #c2410c;
}

.badge[data-variant='frozen'] {
  background: #cffafe;
  color: #0e7490;
}

.badge[data-variant='bread'] {
  background: #fef3c7;
  color: #a16207;
}

.badge[data-variant='drinks'] {
  background: #ede9fe;
  color: #6d28d9;
}

.badge[data-variant='other'] {
  background: #f3f4f6;
  color: #4b5563;
}

.badge[data-variant='uncategorized'] {
  background: transparent;
  color: #9ca3af;
  border: 1px dashed #d1d5db;
}
</style>