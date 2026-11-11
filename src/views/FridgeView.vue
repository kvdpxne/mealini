<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {storeToRefs} from 'pinia'
import {useFridgeStore} from '@/stores/fridge.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {type ExpiryFilter, useFridgeItems} from '@/composables/useFridgeItems'
import type {ProductCategoryFilter} from '@/components/fridge/FridgeFilters.vue'
import FridgeFilters from '@/components/fridge/FridgeFilters.vue'
import FridgeItemList from '@/components/fridge/FridgeItemList.vue'
import AddFridgeItemForm from '@/components/fridge/AddFridgeItemForm.vue'
import EditFridgeItemModal from '@/components/fridge/EditFridgeItemModal.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import {useRealtimePartnerToast} from '@/composables/useRealtimePartnerToast'
import {useOnlineStatus} from '@/composables/useOnlineStatus'
import type {FridgeItem} from '@/types/database.types'
import {useToastStore} from '@/stores/toast.store'

const fridgeStore = useFridgeStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const {isOnline} = useOnlineStatus()
const {items, loading, error} = storeToRefs(fridgeStore)
const {run} = useAsyncAction()

const search = ref('')
const expiryFilter = ref<ExpiryFilter>('all')
const productCategory = ref<ProductCategoryFilter>('all')

const {filteredSorted} = useFridgeItems(items, search, expiryFilter, productCategory)

const editingItem = ref<FridgeItem | null>(null)
const submitting = ref(false)
const toast = useToastStore()

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

  const deleted = await run(async () => {
    return await fridgeStore.deleteItem(id)
  })
  if (!deleted) return  // item nie istniał lub delete rzucił

  toast.showWithAction(
    `Usunięto: ${deleted.name}`,
    'info',
    {
      label: 'Cofnij',
      handler: () => handleUndoDelete(deleted),
    },
    5000,
  )
}

async function handleUndoDelete(item: FridgeItem) {
  await run(async () => {
    await fridgeStore.restoreItem(item)
    return true as const
  }, {success: 'Przywrócono produkt'})
}

async function handleMoveToShopping(id: string) {
  await run(
    () => fridgeStore.moveToShopping(id),
    {success: 'Przeniesiono na listę zakupów'},
  )
}

async function handleUpdateQuantity(id: string, quantity: number, unit: string) {
  await run(async () => {
    await fridgeStore.updateQuantity(id, quantity, unit)
    return true as const
  })
}

async function handleUpdateName(id: string, name: string) {
  await run(() => fridgeStore.updateName(id, name))
}

onMounted(async () => {
  if (isOnline.value) {
    await initialFetch()
  }
})

useRealtimePartnerToast<FridgeItem>(
  'fridge_items',
  (actor, name) => `${actor} dodał(a) do lodówki: ${name}`,
  {onChange: realtimeRefresh},
)
</script>

<template>
  <div class="fridge-view">
    <h1>Moja lodówka</h1>
    <AddFridgeItemForm :disabled="!isOnline"/>
    <ErrorBanner v-if="error" :message="error" @dismiss="fridgeStore.clearError"/>
    <FridgeFilters
      v-model:search="search"
      v-model:expiry-filter="expiryFilter"
      v-model:product-category="productCategory"
    />
    <FridgeItemList
      :items="filteredSorted"
      :loading="loading"
      :disabled="!isOnline"
      @delete="handleDelete"
      @move-to-shopping="handleMoveToShopping"
      @update-quantity="handleUpdateQuantity"
      @update-name="handleUpdateName"
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