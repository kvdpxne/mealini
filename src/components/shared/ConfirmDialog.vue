<script setup lang="ts">
import {useConfirmStore} from '@/stores/confirm.store'

const confirmStore = useConfirmStore()
</script>

<template>
  <Teleport to="body">
    <div v-if="confirmStore.visible" class="overlay" @click.self="confirmStore.cancel">
      <div class="dialog" role="dialog" aria-modal="true">
        <h3>{{ confirmStore.title }}</h3>
        <p>{{ confirmStore.message }}</p>
        <div class="actions">
          <button class="secondary" @click="confirmStore.cancel">Anuluj</button>
          <button class="danger" @click="confirmStore.confirm">Potwierdź</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.dialog {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.dialog h3 {
  margin: 0 0 0.5rem;
}

.dialog p {
  margin: 0 0 1.25rem;
  color: #4b5563;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
}

.danger {
  background: #dc2626;
  color: #fff;
}
</style>