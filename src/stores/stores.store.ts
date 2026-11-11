import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeService } from '@/services/store.service'
import { storageService } from '@/services/storage.service'
import type { Store } from '@/types/database.types'

export const useStoresStore = defineStore('stores', () => {
  const stores = ref<Store[]>([])
  const currentStore = ref<Store | null>(null)
  const currentMapUrl = ref<string | null>(null)
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

  /** Ładuje szczegóły sklepu + signed URL mapy. Nie dotyka zones/locations. */
  async function fetchStore(storeId: string) {
    loading.value = true
    error.value = null
    try {
      currentStore.value = await storeService.get(storeId)
      currentMapUrl.value = currentStore.value?.map_path
        ? await storageService.getSignedUrl(currentStore.value.map_path)
        : null
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
      await storageService.deleteStoreMap(oldPath).catch(() => {})
    }
  }

  async function removeMap(storeId: string) {
    const oldPath = currentStore.value?.map_path
    await storeService.setMapPath(storeId, null)
    if (currentStore.value) currentStore.value.map_path = null
    currentMapUrl.value = null
    const idx = stores.value.findIndex(s => s.id === storeId)
    if (idx !== -1) stores.value[idx].map_path = null
    if (oldPath) await storageService.deleteStoreMap(oldPath).catch(() => {})
  }

  async function deleteStore(id: string) {
    await storeService.delete(id)
    stores.value = stores.value.filter(s => s.id !== id)
    if (currentStore.value?.id === id) {
      currentStore.value = null
      currentMapUrl.value = null
    }
  }

  function clearCurrent() {
    currentStore.value = null
    currentMapUrl.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    stores, currentStore, currentMapUrl, loading, error,
    fetchStores, fetchStore,
    create, rename, uploadMap, removeMap, deleteStore,
    clearCurrent, clearError,
  }
})