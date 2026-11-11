import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {storeToRefs} from 'pinia'
import {useStoresStore} from '@/stores/stores.store'
import {useStoreZonesStore} from '@/stores/storeZones.store'
import {useProductLocationsStore} from '@/stores/productLocations.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'

export function useStoreDetail() {
  const route = useRoute()
  const router = useRouter()
  const storesStore = useStoresStore()
  const zonesStore = useStoreZonesStore()
  const locationsStore = useProductLocationsStore()
  const authStore = useAuthStore()
  const confirm = useConfirmStore()

  const {currentStore, currentMapUrl, loading, error} = storeToRefs(storesStore)
  const {zones} = storeToRefs(zonesStore)
  const {locations} = storeToRefs(locationsStore)
  const {run} = useAsyncAction()

  const showRename = ref(false)
  const storeId = computed(() => route.params.id as string)

  async function load() {
    if (!storeId.value) return
    await Promise.all([
      storesStore.fetchStore(storeId.value),
      zonesStore.fetchZones(storeId.value),
      locationsStore.fetchLocations(storeId.value),
    ])
  }

  async function handleRename(name: string) {
    const result = await run(async () => {
      await storesStore.rename(storeId.value, name)
      return true as const
    }, {success: 'Nazwa zmieniona'})
    if (result) showRename.value = false
  }

  async function handleUploadMap(file: File) {
    if (!authStore.householdId) return
    await run(async () => {
      await storesStore.uploadMap(authStore.householdId!, storeId.value, file)
      return true as const
    }, {success: 'Mapa zaktualizowana'})
  }

  async function handleRemoveMap() {
    const ok = await confirm.ask('Usunąć mapę sklepu?', 'Usuń mapę')
    if (!ok) return
    await run(async () => {
      await storesStore.removeMap(storeId.value)
      return true as const
    }, {success: 'Mapa usunięta'})
  }

  async function handleAddZone(name: string) {
    await run(async () => {
      await zonesStore.addZone(storeId.value, name)
      return true as const
    }, {success: 'Strefa dodana'})
  }

  async function handleRenameZone(id: string, name: string) {
    await run(async () => {
      await zonesStore.renameZone(id, name)
      return true as const
    })
  }

  async function handleDeleteZone(id: string) {
    const ok = await confirm.ask(
      'Usunąć strefę? Produkty przypisane do niej wrócą do „Bez przypisania”.',
      'Usuń strefę',
    )
    if (!ok) return
    await run(async () => {
      await zonesStore.deleteZone(id)
      // Usunięcie strefy kaskadowo usuwa przypisania – czyścimy lokalnie,
      // żeby lista zakupów nie pokazywała starych powiązań
      locationsStore.removeLocationsForZone(id)
      return true as const
    }, {success: 'Strefa usunięta'})
  }

  async function handleMoveZone(id: string, direction: -1 | 1) {
    await run(async () => {
      await zonesStore.moveZone(id, direction)
      return true as const
    })
  }

  function goBack() {
    // Czyścimy kontekst aktywnego sklepu, żeby kolejne wejście
    // nie migało starymi danymi z poprzedniego sklepu
    storesStore.clearCurrent()
    zonesStore.clear()
    locationsStore.clear()
    router.push('/stores')
  }

  function clearError() {
    storesStore.clearError()
    zonesStore.error = null
    locationsStore.error = null
  }

  onMounted(load)
  useRealtimeSubscription('stores', load)
  useRealtimeSubscription('store_zones', load)
  useRealtimeSubscription('product_locations', load)
  watch(storeId, load)

  return {
    currentStore, currentMapUrl, zones, locations, loading, error,
    showRename,
    handleRename, handleUploadMap, handleRemoveMap,
    handleAddZone, handleRenameZone, handleDeleteZone, handleMoveZone,
    goBack, clearError,
  }
}