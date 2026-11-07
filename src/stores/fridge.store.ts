import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {FridgeItem} from '@/types/database.types'
import {fridgeService} from '@/services/fridge.service'

type FridgeItemUpdates = Partial<Pick<FridgeItem, 'name' | 'quantity' | 'unit' | 'expiry_date'>>

export const useFridgeStore = defineStore('fridge', () => {
  const items = ref<FridgeItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchItems(householdId: string, opts: { silent?: boolean } = {}) {
    loading.value = true
    if (!opts.silent) error.value = null
    try {
      items.value = await fridgeService.getItems(householdId)
      error.value = null
    } catch (e) {
      if (!opts.silent) {
        error.value = e instanceof Error ? e.message : 'Nieznany błąd'
      }
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  async function addItem(item: Omit<FridgeItem, 'id' | 'created_at' | 'updated_at'>) {
    const newItem = await fridgeService.addItem(item)
    items.value.push(newItem)
  }

  async function deleteItem(id: string) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx === -1) return
    const removed = items.value[idx]
    items.value.splice(idx, 1)
    try {
      await fridgeService.deleteItem(id)
    } catch (e) {
      items.value.splice(idx, 0, removed)
      throw e
    }
  }

  async function moveToShopping(id: string) {
    await fridgeService.moveToShopping(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function updateItem(id: string, updates: FridgeItemUpdates) {
    const previous = items.value.find(i => i.id === id)
    if (!previous) return

    const optimisticIdx = items.value.findIndex(i => i.id === id)
    items.value[optimisticIdx] = {...previous, ...updates}

    try {
      const updated = await fridgeService.updateItem(id, updates)
      const confirmIdx = items.value.findIndex(i => i.id === id)
      if (confirmIdx !== -1) items.value[confirmIdx] = updated
    } catch (e) {
      const rollbackIdx = items.value.findIndex(i => i.id === id)
      if (rollbackIdx !== -1) items.value[rollbackIdx] = previous
      throw e
    }
  }

  async function updateQuantity(id: string, quantity: number) {
    await updateItem(id, {quantity})
  }

  async function updateName(id: string, name: string) {
    await updateItem(id, {name})
  }

  return {
    items, loading, error, fetchItems, clearError, addItem, deleteItem,
    moveToShopping, updateItem, updateQuantity, updateName
  }
}, {
  persist: {
    key: 'fridge-cache-v1',
    storage: localStorage,
    pick: ['items'],
  },
})