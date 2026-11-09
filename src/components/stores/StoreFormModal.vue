<script setup lang="ts">
import {nextTick, ref, watch} from 'vue'
import {X} from 'lucide-vue-next'
import {LIMITS} from '@/lib/validation'

const props = defineProps<{
  visible: boolean
  initialName?: string
  title: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', name: string): void
  (e: 'close'): void
}>()

const name = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

watch(
  () => props.visible,
  async (v) => {
    if (!v) return
    name.value = props.initialName ?? ''
    await nextTick()
    inputEl.value?.focus()
    inputEl.value?.select()
  },
)

function submit() {
  if (!name.value.trim()) return
  emit('save', name.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="emit('close')">
      <form class="dialog" @submit.prevent="submit">
        <header class="dialog-head">
          <h3>{{ title }}</h3>
          <button type="button" class="icon-btn" @click="emit('close')">
            <X :size="18"/>
          </button>
        </header>
        <label>
          Nazwa sklepu
          <input ref="inputEl" v-model="name" type="text" :maxlength="LIMITS.storeName" required/>
        </label>
        <div class="actions">
          <button type="button" class="secondary" @click="emit('close')">Anuluj</button>
          <button type="submit" class="primary" :disabled="submitting">
            {{ submitting ? 'Zapisywanie...' : 'Zapisz' }}
          </button>
        </div>
      </form>
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
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-head h3 {
  margin: 0;
  font-size: 1.1rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
}

.icon-btn:hover {
  background: #f3f4f6;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #374151;
}

input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
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
  font-size: 0.9rem;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
}

.primary {
  background: #0a7;
  color: #fff;
}

.primary:disabled {
  opacity: 0.6;
}
</style>