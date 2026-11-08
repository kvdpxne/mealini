import {defineStore} from 'pinia'
import {ref} from 'vue'
import {storeService} from '@/services/store.service'
import {storageService} from '@/services/storage.service'
import {productLocationService} from '@/services/product-location.service'
import type {ProductLocation, Store, StoreZone} from '@/types/database.types'

export const useStoresStore = defineStore('stores', () => {
  const stores = ref<Store[]>([])
  const currentStore = ref<Store | null>(null)
  const currentMapUrl = ref<string | null>(null)
  const zones = ref<StoreZone[]>([])
  const locations = ref<ProductLocation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStores(householdId: string) {
    loading.value = true
    error.value = null
    try {
      stores.value = await storeService.list(householdId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function fetchStoreDetail(storeId: string) {
    loading.value = true
    error.value = null
    try {
      currentStore.value = await storeService.get(storeId)
      currentMapUrl.value = currentStore.value?.map_path
        ? await storageService.getSignedUrl(currentStore.value.map_path)
        : null
      zones.value = await storeService.listZones(storeId)
      locations.value = await productLocationService.listForStore(storeId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function create(householdId: string, name: string): Promise<Store> {
    const created = await storeService.create(householdId, name)
    stores.value.push(created)
    stores.value.sort((a, b) => a.name.localeCompare(b.name, 'pl'))
    return created
  }

  async function rename(id: string, name: string) {
    const updated = await storeService.rename(id, name)
    const idx = stores.value.findIndex(s => s.id === id)
    if (idx !== -1) stores.value[idx] = updated
    if (currentStore.value?.id === id) currentStore.value = updated
  }

  async function uploadMap(householdId: string, storeId: string, file: File) {
    const oldPath = currentStore.value?.map_path ?? null
    const newPath = await storageService.uploadStoreMap(householdId, storeId, file)
    await storeService.setMapPath(storeId, newPath)
    if (currentStore.value) currentStore.value.map_path = newPath
    currentMapUrl.value = await storageService.getSignedUrl(newPath)
    const idx = stores.value.findIndex(s => s.id === storeId)
    if (idx !== -1) stores.value[idx].map_path = newPath
    if (oldPath && oldPath !== newPath) {
      await storageService.deleteStoreMap(oldPath).catch(() => {
      })
    }
  }

  async function removeMap(storeId: string) {
    const oldPath = currentStore.value?.map_path
    await storeService.setMapPath(storeId, null)
    if (currentStore.value) currentStore.value.map_path = null
    currentMapUrl.value = null
    const idx = stores.value.findIndex(s => s.id === storeId)
    if (idx !== -1) stores.value[idx].map_path = null
    if (oldPath) await storageService.deleteStoreMap(oldPath).catch(() => {
    })
  }

  async function deleteStore(id: string) {
    await storeService.delete(id)
    stores.value = stores.value.filter(s => s.id !== id)
  }

  async function addZone(storeId: string, name: string) {
    const zone = await storeService.addZone(storeId, name)
    zones.value.push(zone)
  }

  async function renameZone(id: string, name: string) {
    const updated = await storeService.renameZone(id, name)
    const idx = zones.value.findIndex(z => z.id === id)
    if (idx !== -1) zones.value[idx] = updated
  }

  async function deleteZone(id: string) {
    await storeService.deleteZone(id)
    zones.value = zones.value.filter(z => z.id !== id)
    locations.value = locations.value.filter(l => l.zone_id !== id)
  }

  async function moveZone(id: string, direction: -1 | 1) {
    const idx = zones.value.findIndex(z => z.id === id)
    const swapIdx = idx + direction
    if (idx === -1 || swapIdx < 0 || swapIdx >= zones.value.length) return
    const reordered = [...zones.value]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    zones.value = reordered
    await storeService.reorderZones(reordered)
  }

  async function setProductLocation(
    householdId: string,
    storeId: string,
    productName: string,
    zoneId: string | null,
  ) {
    await productLocationService.setLocation(householdId, storeId, productName, zoneId)
    locations.value = await productLocationService.listForStore(storeId)
  }

  return {
    stores, currentStore, currentMapUrl, zones, locations, loading, error,
    fetchStores, fetchStoreDetail,
    create, rename, uploadMap, removeMap, deleteStore,
    addZone, renameZone, deleteZone, moveZone,
    setProductLocation,
  }
})