<script setup lang="ts">
import {storeToRefs} from 'pinia'
import {Package, X} from 'lucide-vue-next'
import {RouterLink} from 'vue-router'
import {useShoppingSetsStore} from '@/stores/shoppingSets.store'
import {useShoppingSetsView} from '@/composables/useShoppingSetsView'
import SkeletonList from '@/components/shared/SkeletonList.vue'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const setsStore = useShoppingSetsStore()
const {sets, loading} = storeToRefs(setsStore)
const {handleApply} = useShoppingSetsView()

async function handleClick(setId: string, name: string) {
  await handleApply(setId, name)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="emit('close')">
      <div class="dialog">
        <header class="dialog-head">
          <h3>Dodaj z zestawu</h3>
          <button class="icon-btn" @click="emit('close')">
            <X :size="18"/>
          </button>
        </header>
        <SkeletonList v-if="loading" :count="2"/>
        <div v-else-if="sets.length === 0" class="empty">
          Nie masz jeszcze żadnych zestawów.
          <RouterLink to="/sets" class="link" @click="emit('close')">
            Utwórz pierwszy zestaw →
          </RouterLink>
        </div>
        <ul v-else class="set-list">
          <li v-for="s in sets" :key="s.id">
            <Package :size="16"/>
            <span class="set-name">{{ s.name }}</span>
            <button class="primary" @click="handleClick(s.id, s.name)">Dodaj</button>
          </li>
        </ul>
        <footer class="dialog-foot">
          <RouterLink to="/sets" class="link" @click="emit('close')">
            Zarządzaj zestawami →
          </RouterLink>
        </footer>
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
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 80vh;
  overflow-y: auto;
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

.empty {
  text-align: center;
  color: #6b7280;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.set-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.set-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.set-name {
  flex: 1;
  font-weight: 500;
  color: #111;
}

.primary {
  padding: 0.35rem 0.85rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.dialog-foot {
  text-align: right;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.link {
  color: #0a7;
  text-decoration: none;
  font-size: 0.85rem;
}

.link:hover {
  text-decoration: underline;
}
</style>