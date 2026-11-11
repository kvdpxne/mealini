<script setup lang="ts">
import {RouterLink} from 'vue-router'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import type {Store} from '@/types/database.types'

defineProps<{
  store: Store
  routeSortEnabled: boolean
  hasZones: boolean
}>()

const emit = defineEmits<{ (e: 'update:routeSortEnabled', v: boolean): void }>()
</script>

<template>
  <div class="route-sort-bar">
    <ToggleSwitch
      :model-value="routeSortEnabled"
      :disabled="!hasZones"
      @update:model-value="emit('update:routeSortEnabled', $event)"
    >
      Sortuj po trasie sklepu
    </ToggleSwitch>
    <RouterLink v-if="!hasZones" :to="`/stores/${store.id}`" class="hint-link">
      Dodaj strefy →
    </RouterLink>
  </div>
</template>

<style scoped>
.route-sort-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0 0.25rem;
  margin-bottom: 0.75rem;
}

.hint-link {
  font-size: 0.8rem;
  color: #0a7;
  text-decoration: none;
}

.hint-link:hover {
  text-decoration: underline;
}
</style>