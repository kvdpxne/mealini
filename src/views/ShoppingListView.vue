<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {storeToRefs} from 'pinia'
import {PackagePlus} from 'lucide-vue-next'
import {useShoppingStore} from '@/stores/shopping.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useShoppingItems} from '@/composables/useShoppingItems'
import ShoppingItemList from '@/components/shopping/ShoppingItemList.vue'
import ShoppingFilters from '@/components/shopping/ShoppingFilters.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import {useRealtimePartnerToast} from '@/composables/useRealtimePartnerToast'
import type {ShoppingListItem} from '@/types/database.types'

const shoppingStore = useShoppingStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const {items, error, loading} = storeToRefs(shoppingStore)
const {run} = useAsyncAction()
const {run: runMoveAll, pending: movingAll} = useAsyncAction()

const search = ref('')
const {toBuy, bought, isSearchActive} = useShoppingItems(items, search)

const newItem = ref('')

const showBoughtSection = computed(
  () => bought.value.length > 0 || loading.value,
)

async function initialFetch() {
  if (authStore.householdId) await shoppingStore.fetchItems(authStore.householdId)
}

async function realtimeRefresh() {
  if (authStore.householdId) {
    await shoppingStore.fetchItems(authStore.householdId, {silent: true})
  }
}

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
  await run(() => shoppingStore.deleteItem(id), {success: 'Usunięto z listy'})
}

async function handleClear() {
  if (!authStore.householdId) return
  const ok = await confirm.ask('Usunąć wszystkie kupione pozycje?', 'Wyczyść listę')
  if (!ok) return
  await run(
    () => shoppingStore.clearBought(authStore.householdId!),
    {success: 'Wyczyszczono kupione'},
  )
}

async function handleMoveToFridge(id: string) {
  await run(
    () => shoppingStore.moveToFridge(id),
    {success: 'Przeniesiono do lodówki'},
  )
}

async function handleMoveAllBought() {
  if (!authStore.householdId) return
  await runMoveAll(
    () => shoppingStore.moveAllBoughtToFridge(authStore.householdId!),
    {
      success: n => `Przeniesiono ${n} ${n === 1 ? 'produkt' : 'produktów'} do lodówki`,
    },
  )
}

onMounted(initialFetch)
useRealtimePartnerToast<ShoppingListItem>(
  'shopping_list_items',
  (actor, name) => `${actor} dodał(a) do zakupów: ${name}`,
  {onChange: realtimeRefresh},
)
</script>

<template>
  <div class="shopping-view">
    <h1>Lista zakupów</h1>

    <form class="add-form" @submit.prevent="handleAdd">
      <input v-model="newItem" type="text" placeholder="Co dokupić?" required/>
      <button type="submit">Dodaj</button>
    </form>

    <ShoppingFilters v-model:search="search"/>

    <ErrorBanner v-if="error" :message="error" @dismiss="shoppingStore.clearError"/>

    <section>
      <h2>Do kupienia <span v-if="toBuy.length" class="count">({{ toBuy.length }})</span></h2>
      <ShoppingItemList
        :items="toBuy"
        :loading="loading"
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
          <button class="secondary" :disabled="movingAll" @click="handleMoveAllBought">
            <PackagePlus :size="16"/>
            <span>{{ movingAll ? 'Przenoszenie...' : 'Przenieś do lodówki' }}</span>
          </button>
          <button class="secondary" @click="handleClear">Wyczyść</button>
        </div>
      </div>
      <ShoppingItemList
        :items="bought"
        :loading="loading"
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
  font-size: 0.9rem;
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
</style>