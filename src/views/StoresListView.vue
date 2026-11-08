<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {RouterLink} from 'vue-router'
import {Plus, Store as StoreIcon, Trash2} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useStoresStore} from '@/stores/stores.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import StoreFormModal from '@/components/stores/StoreFormModal.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import SkeletonList from '@/components/shared/SkeletonList.vue'

const storesStore = useStoresStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const {stores, loading, error} = storeToRefs(storesStore)
const {run} = useAsyncAction()

const showCreate = ref(false)
const creating = ref(false)

async function refresh() {
  if (authStore.householdId) await storesStore.fetchStores(authStore.householdId)
}

async function handleCreate(name: string) {
  if (!authStore.householdId) return
  creating.value = true
  const result = await run(
    () => storesStore.create(authStore.householdId!, name),
    {success: 'Sklep dodany'},
  )
  creating.value = false
  if (result) showCreate.value = false
}

async function handleDelete(id: string, name: string) {
  const ok = await confirm.ask(`Usunąć sklep „${name}” wraz ze strefami i przypisaniami?`, 'Usuń sklep')
  if (!ok) return
  await run(() => storesStore.deleteStore(id), {success: 'Sklep usunięty'})
}

onMounted(refresh)
useRealtimeSubscription('stores', refresh)
</script>

<template>
  <div class="stores-view">
    <header class="page-head">
      <div>
        <h1>Sklepy</h1>
        <p class="sub">Mapy sklepów i przypisania produktów do stref.</p>
      </div>
      <button class="primary" @click="showCreate = true">
        <Plus :size="16"/>
        <span>Nowy sklep</span>
      </button>
    </header>

    <ErrorBanner v-if="error" :message="error" @dismiss="storesStore.error = null"/>

    <SkeletonList v-if="loading" :count="3"/>
    <div v-else-if="stores.length === 0" class="empty">
      <StoreIcon :size="32"/>
      <p>Nie masz jeszcze żadnych sklepów. Dodaj pierwszy, żeby móc przypisywać produkty do stref.</p>
    </div>
    <ul v-else class="store-list">
      <li v-for="s in stores" :key="s.id">
        <RouterLink :to="`/stores/${s.id}`" class="store-link">
          <StoreIcon :size="18"/>
          <span>{{ s.name }}</span>
        </RouterLink>
        <button class="icon-btn" title="Usuń" @click="handleDelete(s.id, s.name)">
          <Trash2 :size="16"/>
        </button>
      </li>
    </ul>

    <StoreFormModal
      :visible="showCreate"
      title="Nowy sklep"
      :submitting="creating"
      @save="handleCreate"
      @close="showCreate = false"
    />
  </div>
</template>

<style scoped>
.stores-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-head h1 {
  margin: 0;
  font-size: 1.5rem;
}

.sub {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.store-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.store-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.store-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #111;
  text-decoration: none;
  flex: 1;
  font-weight: 500;
}

.store-link:hover {
  color: #0a7;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.35rem;
  border-radius: 4px;
}

.icon-btn:hover {
  background: #f3f4f6;
  color: #dc2626;
}
</style>