<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ArrowLeft} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useStoresStore} from '@/stores/stores.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import MapUploader from '@/components/stores/MapUploader.vue'
import ZoneEditor from '@/components/stores/ZoneEditor.vue'
import StoreFormModal from '@/components/stores/StoreFormModal.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const route = useRoute()
const router = useRouter()
const storesStore = useStoresStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const {currentStore, currentMapUrl, zones, error, loading} = storeToRefs(storesStore)
const {run} = useAsyncAction()

const storeId = route.params.id as string
const showRename = ref(false)

async function load() {
  await storesStore.fetchStoreDetail(storeId)
}

async function handleRename(name: string) {
  const result = await run(
    () => storesStore.rename(storeId, name),
    {success: 'Nazwa zmieniona'},
  )
  if (result) showRename.value = false
}

async function handleUploadMap(file: File) {
  if (!authStore.householdId) return
  await run(
    () => storesStore.uploadMap(authStore.householdId!, storeId, file),
    {success: 'Mapa zaktualizowana'},
  )
}

async function handleRemoveMap() {
  const ok = await confirm.ask('Usunąć mapę sklepu?', 'Usuń mapę')
  if (!ok) return
  await run(() => storesStore.removeMap(storeId), {success: 'Mapa usunięta'})
}

async function handleAddZone(name: string) {
  await run(() => storesStore.addZone(storeId, name), {success: 'Strefa dodana'})
}

async function handleRenameZone(id: string, name: string) {
  await run(() => storesStore.renameZone(id, name))
}

async function handleDeleteZone(id: string) {
  const ok = await confirm.ask(
    'Usunąć strefę? Produkty przypisane do niej wrócą do „Bez przypisania”.',
    'Usuń strefę',
  )
  if (!ok) return
  await run(() => storesStore.deleteZone(id), {success: 'Strefa usunięta'})
}

async function handleMoveZone(id: string, direction: -1 | 1) {
  await run(() => storesStore.moveZone(id, direction))
}

onMounted(load)
useRealtimeSubscription('stores', load)
useRealtimeSubscription('store_zones', load)

watch(() => route.params.id, load)
</script>

<template>
  <div class="store-detail">
    <button class="back" @click="router.push('/stores')">
      <ArrowLeft :size="16"/>
      <span>Wróć do sklepów</span>
    </button>

    <ErrorBanner v-if="error" :message="error" @dismiss="storesStore.error = null"/>

    <div v-if="loading && !currentStore" class="state">Ładowanie...</div>
    <template v-else-if="currentStore">
      <header class="page-head">
        <h1>{{ currentStore.name }}</h1>
        <button class="secondary" @click="showRename = true">Zmień nazwę</button>
      </header>

      <section class="card">
        <h2>Mapa sklepu</h2>
        <MapUploader :map-url="currentMapUrl" @upload="handleUploadMap" @remove="handleRemoveMap"/>
      </section>

      <section class="card">
        <h2>Strefy</h2>
        <p class="hint">Kolejność stref odpowiada kolejności przejścia przez sklep.</p>
        <ZoneEditor
          :zones="zones"
          @add="handleAddZone"
          @rename="handleRenameZone"
          @delete="handleDeleteZone"
          @move="handleMoveZone"
        />
      </section>
    </template>

    <StoreFormModal
      :visible="showRename"
      title="Zmień nazwę sklepu"
      :initial-name="currentStore?.name"
      @save="handleRename"
      @close="showRename = false"
    />
  </div>
</template>

<style scoped>
.store-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 720px;
  margin: 0 auto;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  align-self: flex-start;
}

.back:hover {
  color: #0a7;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-head h1 {
  margin: 0;
  font-size: 1.5rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.75rem;
}

.secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover {
  background: #f3f4f6;
}

.state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}
</style>