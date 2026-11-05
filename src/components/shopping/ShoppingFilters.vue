<script setup lang="ts">
defineProps<{ search: string }>()
const emit = defineEmits<{
  (e: 'update:search', value: string): void
}>()
</script>

<template>
  <input
    :value="search"
    type="search"
    placeholder="Szukaj na liście…"
    class="search"
    @input="emit('update:search', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.search {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  margin: 0.75rem 0;
}
</style>