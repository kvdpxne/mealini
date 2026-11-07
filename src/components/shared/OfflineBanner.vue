<script setup lang="ts">
import {WifiOff} from 'lucide-vue-next'
</script>

<template>
  <div class="offline-banner" role="status" aria-live="polite">
    <WifiOff :size="16"/>
    <span>Jesteś offline – pokazujemy dane z cache. Zmiany są wyłączone do czasu przywrócenia połączenia.</span>
  </div>
</template>

<style scoped>
.offline-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  border-bottom: 1px solid #fde68a;
  color: #92400e;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

@media (max-width: 768px) {
  .offline-banner {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>