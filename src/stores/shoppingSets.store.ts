import {defineStore} from 'pinia'
import {ref} from 'vue'
import {shoppingSetsService} from '@/services/shopping-sets.service'
import type {ApplySetResult, ShoppingSet, ShoppingSetItem} from '@/types/database.types'

export const useShoppingSetsStore = defineStore('shoppingSets', () => {
  const sets = ref<ShoppingSet[]>([])
  const itemsBySetId = ref<Record<string, ShoppingSetItem[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSets(householdId: string) {
    loading.value = true
    error.value = null
    try {
      sets.value = await shoppingSetsService.list(householdId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function fetchItems(setId: string) {
    const items = await shoppingSetsService.listItems(setId)
    itemsBySetId.value = {...itemsBySetId.value, [setId]: items}
    return items
  }

  async function saveCurrentList(householdId: string, name: string): Promise<string> {
    const id = await shoppingSetsService.saveCurrentList(householdId, name)
    await fetchSets(householdId)
    return id
  }

  async function applyToCurrentList(setId: string): Promise<ApplySetResult> {
    return await shoppingSetsService.applyToCurrentList(setId)
  }

  async function rename(setId: string, name: string) {
    const updated = await shoppingSetsService.rename(setId, name)
    const idx = sets.value.findIndex(s => s.id === setId)
    if (idx !== -1) sets.value[idx] = updated
  }

  async function deleteSet(setId: string) {
    await shoppingSetsService.deleteSet(setId)
    sets.value = sets.value.filter(s => s.id !== setId)
    delete itemsBySetId.value[setId]
  }

  async function addItem(
    setId: string,
    item: { name: string; quantity: number; unit: string },
  ) {
    const created = await shoppingSetsService.addItem(setId, item)
    const arr = itemsBySetId.value[setId] ?? []
    itemsBySetId.value = {...itemsBySetId.value, [setId]: [...arr, created]}
  }

  async function updateItem(
    setId: string,
    itemId: string,
    updates: Partial<Pick<ShoppingSetItem, 'name' | 'quantity' | 'unit'>>,
  ) {
    const updated = await shoppingSetsService.updateItem(itemId, updates)
    const arr = itemsBySetId.value[setId] ?? []
    const idx = arr.findIndex(i => i.id === itemId)
    if (idx !== -1) {
      const next = [...arr]
      next[idx] = updated
      itemsBySetId.value = {...itemsBySetId.value, [setId]: next}
    }
  }

  async function deleteItem(setId: string, itemId: string) {
    await shoppingSetsService.deleteItem(itemId)
    const arr = itemsBySetId.value[setId] ?? []
    itemsBySetId.value = {
      ...itemsBySetId.value,
      [setId]: arr.filter(i => i.id !== itemId),
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    sets, itemsBySetId, loading, error,
    fetchSets, fetchItems, saveCurrentList, applyToCurrentList,
    rename, deleteSet, addItem, updateItem, deleteItem, clearError,
  }
})