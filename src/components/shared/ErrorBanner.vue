<script setup lang="ts">
import { AlertCircle, X } from 'lucide-vue-next'

defineProps<{ message: string }>()
defineEmits<{ (e: 'dismiss'): void }>()
</script>

<template>
  <div class="error-banner" role="alert">
    <AlertCircle :size="18" />
    <span class="text">{{ message }}</span>
    <button class="close" title="Zamknij" @click="$emit('dismiss')">
      <X :size="16" />
    </button>
  </div>
</template>

<style scoped>
.error-banner {
  display: flex; align-items: center; gap: 0.5rem;
  background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
  padding: 0.6rem 0.85rem; border-radius: 8px; font-size: 0.9rem;
}
.text { flex: 1; }
.close {
  background: transparent; border: none; cursor: pointer; color: inherit;
  padding: 0.2rem; border-radius: 4px; display: inline-flex;
}
.close:hover { background: #fee2e2; }
</style>