<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {storeToRefs} from 'pinia'
import {MapPin, PackagePlus, Store as StoreIcon} from 'lucide-vue-next'
import {useShoppingStore} from '@/stores/shopping.store'
import {useAuthStore} from '@/stores/auth.store'
import {useStoresStore} from '@/stores/stores.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import {useShoppingItems} from '@/composables/useShoppingItems'
import {useShoppingLocationGroups} from '@/composables/useShoppingLocationGroups'
import {useSelectedStore} from '@/composables/useSelectedStore'
import {useOnlineStatus} from '@/composables/useOnlineStatus'
import {NAME_MAX_LENGTH} from '@/lib/validation'
import ShoppingItemList from '@/components/shopping/ShoppingItemList.vue'
import ShoppingFilters from '@/components/shopping/ShoppingFilters.vue'
import ZoneSelect from '@/components/shopping/ZoneSelect.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const shoppingStore = useShoppingStore()
const storesStore = useStoresStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const {items, error, loading} = storeToRefs(shoppingStore)
const {stores, zones, locations, currentMapUrl} = storeToRefs(storesStore)
const {isOnline} = useOnlineStatus()
const {run} = useAsyncAction()
const {run: runMoveAll, pending: movingAll} = useAsyncAction()

const {selectedStoreId, set: setSelectedStore} = useSelectedStore()
const search = ref('')
const newItem = ref('')

const {toBuy, bought, isSearchActive} = useShoppingItems(items, search)

// Grupowanie po strefach działa tylko dla wybranego sklepu
const activeStoreId = computed(() => {
  if (!selectedStoreId.value) return null
  return stores.value.some(s => s.id === selectedStoreId.value) ? selectedStoreId.value : null
})
const activeStore = computed(() =>
  activeStoreId.value ? stores.value.find(s => s.id === activeStoreId.value) ?? null : null,
)

const {groups, zoneIdFor} = useShoppingLocationGroups(toBuy, zones, locations)

const showBoughtSection = computed(() => bought.value.length > 0 || loading.value)

async function initialFetch() {
  if (!authStore.householdId) return
  await Promise.all([
    shoppingStore.fetchItems(authStore.householdId),
    storesStore.fetchStores(authStore.householdId),
  ])
}

async function realtimeRefresh() {
  if (authStore.householdId) {
    await shoppingStore.fetchItems(authStore.householdId, {silent: true})
  }
}

async function loadStoreContext(storeId: string | null) {
  if (!storeId) return
  await storesStore.fetchStoreDetail(storeId)
}

watch(
  activeStoreId,
  async (id) => {
    if (id) await loadStoreContext(id)
  },
  {immediate: true},
)

async function handleAdd() {
  if (!authStore.householdId || !newItem.value.trim()) return
  const result = await run(
    () => shoppingStore.addItem(authStore.householdId!, newItem.value),
    {success: 'Dodano do listy'},
  )
  if (result !== undefined) newItem.value = ''
}

async function handleToggle(id: string) {
  await run(() => shoppingStore.toggleBought(id))
}

async function handleDelete(id: string) {
  const ok = await confirm.ask('Usunąć tę pozycję?', 'Usuń pozycję')
  if (!ok) return
  await run(() => shoppingStore.deleteItem(id))
}

async function handleClear() {
  if (!authStore.householdId) return
  const ok = await confirm.ask('Usunąć wszystkie kupione pozycje?', 'Wyczyść listę')
  if (!ok) return
  await run(() => shoppingStore.clearBought(authStore.householdId!))
}

async function handleMoveToFridge(id: string) {
  await run(() => shoppingStore.moveToFridge(id), {success: 'Przeniesiono do lodówki'})
}

async function handleMoveAllBought() {
  if (!authStore.householdId) return
  await runMoveAll(
    () => shoppingStore.moveAllBoughtToFridge(authStore.householdId!),
    {success: n => `Przeniesiono ${n} ${n === 1 ? 'produkt' : 'produktów'} do lodówki`},
  )
}

async function handleSetZone(itemId: string, itemName: string, zoneId: string | null) {
  if (!authStore.householdId || !activeStoreId.value) return
  await run(() =>
    storesStore.setProductLocation(authStore.householdId!, activeStoreId.value!, itemName, zoneId),
  )
}

onMounted(async () => {
  if (isOnline.value) await initialFetch()
})
useRealtimeSubscription('shopping_list_items', realtimeRefresh)
useRealtimeSubscription('product_locations', () => {
  if (activeStoreId.value) loadStoreContext(activeStoreId.value)
})
</script>

<template>
  <div class="shopping-view">
    <h1>Lista zakupów</h1>

    <div class="store-bar">
      <StoreIcon :size="16"/>
      <select
        class="store-select"
        :value="selectedStoreId ?? ''"
        @change="setSelectedStore(($event.target as HTMLSelectElement).value || null)"
      >
        <option value="">— bez sklepu —</option>
        <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <RouterLink v-if="!stores.length" to="/stores" class="manage-link">Dodaj sklep</RouterLink>
    </div>

    <details v-if="activeStore && currentMapUrl" class="map-panel">
      <summary>
        <MapPin :size="14"/>
        <span>Mapa: {{ activeStore.name }}</span>
      </summary>
      <img :src="currentMapUrl" alt="Mapa sklepu"/>
    </details>

    <form class="add-form" @submit.prevent="handleAdd">
      <input v-model="newItem" type="text" placeholder="Co dokupić?" required :maxlength="NAME_MAX_LENGTH"/>
      <button type="submit" :disabled="!isOnline">Dodaj</button>
    </form>

    <ShoppingFilters v-model:search="search"/>

    <ErrorBanner v-if="error" :message="error" @dismiss="shoppingStore.clearError"/>

    <section>
      <h2>Do kupienia <span v-if="toBuy.length" class="count">({{ toBuy.length }})</span></h2>

      <template v-if="activeStore">
        <div v-for="group in groups" :key="group.zone?.id ?? 'unassigned'" class="zone-group">
          <h3 class="zone-heading">
            {{ group.zone?.name ?? 'Bez przypisania' }}
            <span class="count">({{ group.items.length }})</span>
          </h3>
          <ul class="zone-items">
            <li v-for="item in group.items" :key="item.id">
              <label>
                <input type="checkbox" :checked="item.is_bought" :disabled="!isOnline" @change="handleToggle(item.id)"/>
                <span>{{ item.name }}</span>
              </label>
              <div class="zone-actions">
                <ZoneSelect
                  :zones="zones"
                  :value="zoneIdFor(item)"
                  :disabled="!isOnline"
                  @change="handleSetZone(item.id, item.name, $event)"
                />
                <button class="icon-btn" title="Usuń" :disabled="!isOnline" @click="handleDelete(item.id)">🗑</button>
              </div>
            </li>
          </ul>
        </div>
        <p v-if="groups.length === 0" class="empty">
          {{ isSearchActive ? 'Brak wyników.' : 'Nic do kupienia.' }}
        </p>
      </template>

      <ShoppingItemList
        v-else
        :items="toBuy"
        :loading="loading"
        :disabled="!isOnline"
        :empty-text="isSearchActive ? 'Brak wyników w liście do kupienia.' : 'Nic do kupienia.'"
        @toggle="handleToggle"
        @delete="handleDelete"
        @move-to-fridge="handleMoveToFridge"
      />
    </section>

    <section v-if="showBoughtSection">
      <div class="section-head">
        <h2>Kupione <span v-if="bought.length" class="count">({{ bought.length }})</span></h2>
        <div v-if="bought.length > 0" class="bulk-actions">
          <button class="secondary" :disabled="!isOnline || movingAll" @click="handleMoveAllBought">
            <PackagePlus :size="16"/>
            <span>{{ movingAll ? 'Przenoszenie...' : 'Przenieś do lodówki' }}</span>
          </button>
          <button class="secondary" :disabled="!isOnline" @click="handleClear">Wyczyść</button>
        </div>
      </div>
      <ShoppingItemList
        :items="bought"
        :loading="loading"
        :disabled="!isOnline"
        empty-text=""
        @toggle="handleToggle"
        @delete="handleDelete"
        @move-to-fridge="handleMoveToFridge"
      />
    </section>
  </div>
</template>

<style scoped>
.shopping-view h1 {
  margin: 0 0 1rem;
}

.shopping-view h2 {
  font-size: 1.05rem;
  margin: 0;
  color: #374151;
}

.count {
  color: #6b7280;
  font-weight: 400;
  font-size: 0.85rem;
}

.store-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
}

.store-select {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 0.9rem;
}

.manage-link {
  font-size: 0.8rem;
  color: #0a7;
}

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

.add-form {
  display: flex;
  gap: 0.5rem;
}

.add-form input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.add-form button {
  padding: 0.5rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-form button:disabled {
  opacity: 0.6;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.25rem 0 0.25rem;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover {
  background: #f3f4f6;
}

.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.zone-group {
  margin: 1rem 0;
}

.zone-heading {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.4rem;
}

.zone-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.zone-items li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-radius: 6px;
}

.zone-items label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
  flex: 1;
}

.zone-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.empty {
  color: #6b7280;
  text-align: center;
  padding: 1rem;
}
</style>