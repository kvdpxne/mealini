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
        <span class="message" @click="toastStore.dismiss(toast.id)">{{ toast.message }}</span>
        <button
          v-if="toast.action"
          type="button"
          class="action"
          @click.stop="toastStore.triggerAction(toast.id)"
        >
          {{ toast.action.label }}
        </button>
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.5rem 0.6rem 1rem;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 360px;
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

.message {
  flex: 1;
  cursor: pointer;
}

.action {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  padding: 0.25rem 0.65rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.action:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>