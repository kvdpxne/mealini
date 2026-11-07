<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), {count: 3})
</script>

<template>
  <div class="skeleton-list" aria-busy="true" aria-live="polite">
    <span class="sr-only">Ładowanie…</span>
    <div v-for="i in count" :key="i" class="skeleton-row" aria-hidden="true">
      <div class="left">
        <div class="bar bar--name"></div>
        <div class="bar bar--meta"></div>
      </div>
      <div class="right">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.skeleton-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
}

.left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.bar {
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 50%,
    #e5e7eb 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.bar--name {
  width: 45%;
  max-width: 220px;
  height: 14px;
}

.bar--meta {
  width: 30%;
  max-width: 140px;
}

.right {
  display: flex;
  gap: 0.5rem;
  padding-left: 1rem;
}

.dot {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 50%,
    #e5e7eb 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .bar, .dot {
    animation: none;
    background: #e5e7eb;
  }
}

@media (max-width: 640px) {
  .right .dot:nth-child(3) {
    display: none;
  }
}
</style>