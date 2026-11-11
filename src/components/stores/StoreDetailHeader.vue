<script setup lang="ts">
import {ArrowLeft} from 'lucide-vue-next'

defineProps<{ storeName?: string }>()
const emit = defineEmits<{
  (e: 'back'): void
  (e: 'rename'): void
}>()
</script>

<template>
  <div class="detail-header">
    <button class="back" @click="emit('back')">
      <ArrowLeft :size="16"/>
      <span>Wróć do sklepów</span>
    </button>
    <div class="title-row">
      <h1>{{ storeName }}</h1>
      <button class="secondary" @click="emit('rename')">Zmień nazwę</button>
    </div>
  </div>
</template>

<style scoped>
.detail-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  align-self: flex-start;
}

.back:hover {
  color: #0a7;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-row h1 {
  margin: 0;
  font-size: 1.5rem;
}

.secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover {
  background: #f3f4f6;
}
</style>