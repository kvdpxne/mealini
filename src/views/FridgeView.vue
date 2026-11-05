<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {storeToRefs} from 'pinia'
import {useFridgeStore} from '@/stores/fridge.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import {type CategoryFilter, useFridgeItems} from '@/composables/useFridgeItems'
import FridgeFilters from '@/components/fridge/FridgeFilters.vue'
import FridgeItemList from '@/components/fridge/FridgeItemList.vue'
import AddFridgeItemForm from '@/components/fridge/AddFridgeItemForm.vue'
import EditFridgeItemModal from '@/components/fridge/EditFridgeItemModal.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import type {FridgeItem} from '@/types/database.types'

const fridgeStore = useFridgeStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const {items, loading, error} = storeToRefs(fridgeStore)
const {run} = useAsyncAction()

const search = ref('')
const category = ref<CategoryFilter>('all')
const {filteredSorted} = useFridgeItems(items, search, category)

const editingItem = ref<FridgeItem | null>(null)
const submitting = ref(false)

async function initialFetch() {
  if (authStore.householdId) {
    await fridgeStore.fetchItems(authStore.householdId)
  }
}

async function realtimeRefresh() {
  if (authStore.householdId) {
    await fridgeStore.fetchItems(authStore.householdId, {silent: true})
  }
}

async function handleSave(id: string, updates: Parameters<typeof fridgeStore.updateItem>[1]) {
  submitting.value = true
  const result = await run(
    () => fridgeStore.updateItem(id, updates),
    {success: 'Produkt zaktualizowany'},
  )
  submitting.value = false
  if (result) editingItem.value = null
}

async function handleDelete(id: string) {
  const ok = await confirm.ask('Usunąć ten produkt z lodówki?', 'Usuń produkt')
  if (!ok) return
  await run(() => fridgeStore.deleteItem(id), {success: 'Produkt usunięty'})
}

async function handleMoveToShopping(id: string) {
  await run(
    () => fridgeStore.moveToShopping(id),
    {success: 'Przeniesiono na listę zakupów'},
  )
}

async function handleUpdateQuantity(id: string, quantity: number) {
  await run(() => fridgeStore.updateQuantity(id, quantity))
}

onMounted(initialFetch)
useRealtimeSubscription('fridge_items', realtimeRefresh)
</script>

<template>
  <div class="fridge-view">
    <h1>Moja lodówka</h1>
    <AddFridgeItemForm/>
    <ErrorBanner v-if="error" :message="error" @dismiss="fridgeStore.clearError"/>
    <FridgeFilters v-model:search="search" v-model:category="category"/>
    <FridgeItemList
      :items="filteredSorted"
      :loading="loading"
      @delete="handleDelete"
      @move-to-shopping="handleMoveToShopping"
      @update-quantity="handleUpdateQuantity"
      @edit="editingItem = $event"
    />
    <EditFridgeItemModal
      :item="editingItem"
      :submitting="submitting"
      @save="handleSave"
      @close="editingItem = null"
    />
  </div>
</template>