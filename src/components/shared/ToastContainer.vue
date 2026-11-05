<script setup lang="ts">
import {useToastStore} from '@/stores/toast.store'

const toastStore = useToastStore()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        @click="toastStore.dismiss(toast.id)"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  max-width: 320px;
}

.toast--success {
  background: #059669;
}

.toast--error {
  background: #dc2626;
}

.toast--info {
  background: #1f2937;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>