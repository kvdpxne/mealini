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
    await fridgeService.deleteItem(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function moveToShopping(id: string) {
    await fridgeService.moveToShopping(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function updateItem(id: string, updates: FridgeItemUpdates) {
    const updated = await fridgeService.updateItem(id, updates)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = updated
  }

  async function updateQuantity(id: string, quantity: number) {
    await updateItem(id, {quantity})
  }

  return {
    items, loading, error, fetchItems, clearError, addItem, deleteItem,
    moveToShopping, updateItem, updateQuantity
  }
}, {
  persist: {
    key: 'fridge-cache-v1',
    storage: localStorage,
    pick: ['items'],
  },
})