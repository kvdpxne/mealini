import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeService } from '@/services/store.service'
import type { StoreZone } from '@/types/database.types'

export const useStoreZonesStore = defineStore('storeZones', () => {
  const zones = ref<StoreZone[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchZones(storeId: string) {
    loading.value = true
    error.value = null
    try {
      zones.value = await storeService.listZones(storeId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
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

  function clear() {
    zones.value = []
    error.value = null
  }

  return {
    zones, loading, error,
    fetchZones, addZone, renameZone, deleteZone, moveZone, clear,
  }
})