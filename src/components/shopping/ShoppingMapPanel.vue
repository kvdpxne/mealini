<script setup lang="ts">
import {MapPin} from 'lucide-vue-next'

defineProps<{ storeName: string; mapUrl: string }>()
</script>

<template>
  <details class="map-panel">
    <summary>
      <MapPin :size="14"/>
      <span>Mapa: {{ storeName }}</span>
    </summary>
    <img :src="mapUrl" alt="Mapa sklepu"/>
  </details>
</template>

<style scoped>
.map-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
}

.map-panel summary {
  cursor: pointer;
  font-size: 0.85rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.map-panel img {
  width: 100%;
  border-radius: 6px;
  margin-top: 0.5rem;
}
</style>