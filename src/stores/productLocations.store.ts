import {defineStore} from 'pinia'
import {ref} from 'vue'
import {productLocationService} from '@/services/product-location.service'
import type {ProductLocation} from '@/types/database.types'

export const useProductLocationsStore = defineStore('productLocations', () => {
  const locations = ref<ProductLocation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLocations(storeId: string) {
    loading.value = true
    error.value = null
    try {
      locations.value = await productLocationService.listForStore(storeId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function setLocation(
    householdId: string,
    storeId: string,
    productName: string,
    zoneId: string | null,
  ) {
    await productLocationService.setLocation(householdId, storeId, productName, zoneId)
    // Odświeżamy lokalnie – upsert/delete nie zwraca wiersza
    locations.value = await productLocationService.listForStore(storeId)
  }

  /** Usuwa lokalne przypisania strefy (np. po usunięciu strefy). */
  function removeLocationsForZone(zoneId: string) {
    locations.value = locations.value.filter(l => l.zone_id !== zoneId)
  }

  function clear() {
    locations.value = []
    error.value = null
  }

  return {
    locations, loading, error,
    fetchLocations, setLocation, removeLocationsForZone, clear,
  }
})