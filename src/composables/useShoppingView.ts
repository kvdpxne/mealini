import {computed, onMounted, ref, watch} from 'vue'
import {storeToRefs} from 'pinia'
import {useShoppingStore} from '@/stores/shopping.store'
import {useAuthStore} from '@/stores/auth.store'
import {useStoresStore} from '@/stores/stores.store'
import {useStoreZonesStore} from '@/stores/storeZones.store'
import {useProductLocationsStore} from '@/stores/productLocations.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import {useShoppingItems} from '@/composables/useShoppingItems'
import {useShoppingLocationGroups} from '@/composables/useShoppingLocationGroups'
import {useSelectedStore} from '@/composables/useSelectedStore'
import {useRouteSortPreference} from '@/composables/useRouteSortPreference'
import {useOnlineStatus} from '@/composables/useOnlineStatus'
import {useUserPreferences} from '@/composables/useUserPreferences'
import {useToastStore} from '@/stores/toast.store'
import type {ShoppingListItem} from '@/types/database.types'

export function useShoppingView() {
  const shoppingStore = useShoppingStore()
  const storesStore = useStoresStore()
  const zonesStore = useStoreZonesStore()
  const locationsStore = useProductLocationsStore()
  const authStore = useAuthStore()
  const confirm = useConfirmStore()
  const toast = useToastStore()

  const {items, suggestions, error, loading} = storeToRefs(shoppingStore)
  const {stores, currentMapUrl} = storeToRefs(storesStore)
  const {zones} = storeToRefs(zonesStore)
  const {locations} = storeToRefs(locationsStore)
  const {isOnline} = useOnlineStatus()
  const {preferences} = useUserPreferences()
  const {run} = useAsyncAction()
  const {run: runMoveAll, pending: movingAll} = useAsyncAction()

  const {selectedStoreId, set: setSelectedStore} = useSelectedStore()
  const {isEnabled, setEnabled} = useRouteSortPreference()

  const search = ref('')
  const newItem = ref('')
  const newQuantity = ref(1)
  const newUnit = ref('szt')

  const {toBuy, bought, isSearchActive} = useShoppingItems(items, search)

  const activeStoreId = computed(() => {
    if (!selectedStoreId.value) return null
    return stores.value.some(s => s.id === selectedStoreId.value) ? selectedStoreId.value : null
  })
  const activeStore = computed(() =>
    activeStoreId.value ? stores.value.find(s => s.id === activeStoreId.value) ?? null : null,
  )

  const routeSortEnabled = computed(() =>
    activeStoreId.value ? isEnabled(activeStoreId.value) : false,
  )
  const useGroupedView = computed(
    () => activeStoreId.value !== null && zones.value.length > 0 && routeSortEnabled.value,
  )
  const showBoughtSection = computed(() => bought.value.length > 0 || loading.value)

  const {groups, zoneIdFor} = useShoppingLocationGroups(toBuy, zones, locations)

  function handleToggleRouteSort(enabled: boolean) {
    if (!activeStoreId.value) return
    setEnabled(activeStoreId.value, enabled)
  }

  async function initialFetch() {
    if (!authStore.householdId) return
    await Promise.all([
      shoppingStore.fetchItems(authStore.householdId),
      shoppingStore.fetchSuggestions(authStore.householdId),
      storesStore.fetchStores(authStore.householdId),
    ])
  }

  async function realtimeRefresh() {
    if (!authStore.householdId) return
    await Promise.all([
      shoppingStore.fetchItems(authStore.householdId, {silent: true}),
      shoppingStore.fetchSuggestions(authStore.householdId),
    ])
  }

  async function loadStoreContext(storeId: string | null) {
    if (!storeId) return
    // Ładujemy strefy i przypisania równolegle; currentStore nie jest tu potrzebny
    // (dropdown sklepu korzysta z listy `stores`), ale `currentMapUrl` tak.
    await Promise.all([
      storesStore.fetchStore(storeId),
      zonesStore.fetchZones(storeId),
      locationsStore.fetchLocations(storeId),
    ])
  }

  async function handleAdd() {
    if (!authStore.householdId || !newItem.value.trim()) return
    const result = await run(async () => {
      await shoppingStore.addItem(
        authStore.householdId!,
        newItem.value,
        newQuantity.value,
        newUnit.value,
      )
      return true as const
    }, {success: 'Dodano do listy'})
    if (result && preferences.value.clearInputAfterAdd) {
      newItem.value = ''
      newQuantity.value = 1
      newUnit.value = 'szt'
    }
  }

  async function handleQuickAdd(name: string) {
    if (!authStore.householdId || !isOnline.value) return
    await run(async () => {
      await shoppingStore.addItem(authStore.householdId!, name)
      return true as const
    }, {success: `Dodano: ${name}`})
  }

  async function handleToggle(id: string) {
    await run(async () => {
      await shoppingStore.toggleBought(id)
      return true as const
    })
  }

  async function handleDelete(id: string) {
    const ok = await confirm.ask('Usunąć tę pozycję?', 'Usuń pozycję')
    if (!ok) return

    const deleted = await run(async () => {
      return await shoppingStore.deleteItem(id)
    })
    if (!deleted) return

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

  async function handleUndoDelete(item: ShoppingListItem) {
    await run(async () => {
      await shoppingStore.restoreItem(item)
      return true as const
    }, {success: 'Przywrócono pozycję'})
  }

  async function handleClear() {
    if (!authStore.householdId) return
    const ok = await confirm.ask('Usunąć wszystkie kupione pozycje?', 'Wyczyść listę')
    if (!ok) return
    await run(async () => {
      await shoppingStore.clearBought(authStore.householdId!)
      return true as const
    })
  }

  async function handleMoveToFridge(id: string) {
    await run(async () => {
      await shoppingStore.moveToFridge(id)
      return true as const
    }, {success: 'Przeniesiono do lodówki'})
  }

  async function handleMoveAllBought() {
    if (!authStore.householdId) return
    await runMoveAll(async () => {
      const count = await shoppingStore.moveAllBoughtToFridge(authStore.householdId!)
      return count
    }, {
      success: n => `Przeniesiono ${n} ${n === 1 ? 'produkt' : 'produktów'} do lodówki`,
    })
  }

  async function handleSetZone(itemName: string, zoneId: string | null) {
    if (!authStore.householdId || !activeStoreId.value) return
    await run(async () => {
      await locationsStore.setLocation(
        authStore.householdId!,
        activeStoreId.value!,
        itemName,
        zoneId,
      )
      return true as const
    })
  }

  function selectStore(id: string | null) {
    setSelectedStore(id)
  }

  watch(
    activeStoreId,
    async (id) => {
      if (id) await loadStoreContext(id)
    },
    {immediate: true},
  )

  onMounted(async () => {
    if (isOnline.value) await initialFetch()
  })
  useRealtimeSubscription('shopping_list_items', realtimeRefresh)
  useRealtimeSubscription('product_locations', () => {
    if (activeStoreId.value) locationsStore.fetchLocations(activeStoreId.value)
  })

  return {
    items, suggestions, error, loading,
    stores, zones, currentMapUrl,
    isOnline, preferences, movingAll,
    search, newItem, newQuantity, newUnit,
    toBuy, bought, isSearchActive,
    activeStoreId, activeStore, routeSortEnabled, useGroupedView, showBoughtSection,
    groups, zoneIdFor,
    selectStore, handleToggleRouteSort,
    handleAdd, handleQuickAdd, handleToggle,
    handleDelete, handleClear,
    handleMoveToFridge, handleMoveAllBought, handleSetZone,
    clearError: shoppingStore.clearError,
  }
}