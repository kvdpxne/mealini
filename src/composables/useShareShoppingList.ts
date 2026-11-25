import {computed, ref} from 'vue'
import {useShoppingStore} from '@/stores/shopping.store'
import {useStoresStore} from '@/stores/stores.store'
import {useStoreZonesStore} from '@/stores/storeZones.store'
import {useProductLocationsStore} from '@/stores/productLocations.store'
import {useSelectedStore} from '@/composables/useSelectedStore'
import {useRouteSortPreference} from '@/composables/useRouteSortPreference'
import {useShoppingLocationGroups} from '@/composables/useShoppingLocationGroups'
import {useShoppingItems} from '@/composables/useShoppingItems'
import {formatShoppingList} from '@/lib/shoppingListFormatter'
import {detectShareMethod, type ShareMethod, shareText} from '@/lib/share'
import {storeToRefs} from 'pinia'

export function useShareShoppingList() {
  const shoppingStore = useShoppingStore()
  const storesStore = useStoresStore()
  const zonesStore = useStoreZonesStore()
  const locationsStore = useProductLocationsStore()

  const {items} = storeToRefs(shoppingStore)
  const {stores} = storeToRefs(storesStore)
  const {zones} = storeToRefs(zonesStore)
  const {locations} = storeToRefs(locationsStore)

  const {selectedStoreId} = useSelectedStore()
  const {isEnabled: isRouteSortEnabled} = useRouteSortPreference()

  // Te same dane, co w widoku – ale bez filtra wyszukiwania.
  // Do share chcemy pełną listę „do kupienia”, nie tylko widoczną.
  const allItems = computed(() => items.value)
  const search = ref('')
  const {toBuy, bought} = useShoppingItems(allItems, search)

  const activeStore = computed(() =>
    selectedStoreId.value
      ? stores.value.find(s => s.id === selectedStoreId.value) ?? null
      : null,
  )

  const useZoneGrouping = computed(
    () =>
      !!activeStore.value &&
      zones.value.length > 0 &&
      isRouteSortEnabled(activeStore.value.id),
  )

  const {zoneIdFor} = useShoppingLocationGroups(toBuy, zones, locations)

  const shareMethod = computed<ShareMethod>(() => detectShareMethod())

  const previewText = computed(() =>
    formatShoppingList(toBuy.value, bought.value, {
      storeName: activeStore.value?.name ?? null,
      zones: useZoneGrouping.value ? zones.value : undefined,
      zoneIdFor: useZoneGrouping.value ? zoneIdFor : undefined,
      includeBought: true,
    }),
  )

  return {
    previewText,
    shareMethod,
    shareText: (text: string, title: string) => shareText(text, title),
  }
}