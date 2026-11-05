import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {FridgeItem} from '@/types/database.types'
import {fridgeService} from '@/services/fridge.service'

export const useFridgeStore = defineStore('fridge', () => {
  const items = ref<FridgeItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchItems(householdId: string) {
    loading.value = true
    error.value = null
    try {
      items.value = await fridgeService.getItems(householdId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
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

  async function updateQuantity(id: string, quantity: number) {
    const updated = await fridgeService.updateItem(id, {quantity})
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = updated
  }

  return {items, loading, error, fetchItems, addItem, deleteItem, moveToShopping, updateQuantity}
})