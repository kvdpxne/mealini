import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {ShoppingListItem} from '@/types/database.types'
import {shoppingService} from '@/services/shopping.service'

export const useShoppingStore = defineStore('shopping', () => {
  const items = ref<ShoppingListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const toBuy = computed(() => items.value.filter(i => !i.is_bought))
  const bought = computed(() => items.value.filter(i => i.is_bought))

  async function fetchItems(householdId: string, opts: { silent?: boolean } = {}) {
    loading.value = true
    if (!opts.silent) error.value = null
    try {
      items.value = await shoppingService.getItems(householdId)
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

  async function addItem(householdId: string, name: string) {
    const created = await shoppingService.addItem({
      household_id: householdId,
      name: name.trim(),
    })
    items.value.unshift(created)
  }

  async function toggleBought(id: string) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    const updated = await shoppingService.toggleBought(id, !item.is_bought)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = updated
  }

  async function deleteItem(id: string) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx === -1) return
    const removed = items.value[idx]
    items.value.splice(idx, 1)
    try {
      await shoppingService.deleteItem(id)
    } catch (e) {
      items.value.splice(idx, 0, removed)
      throw e
    }
  }

  async function clearBought(householdId: string) {
    const removed = items.value.filter(i => i.is_bought)
    if (removed.length === 0) return
    items.value = items.value.filter(i => !i.is_bought)
    try {
      await shoppingService.clearBought(householdId)
    } catch (e) {
      const currentIds = new Set(items.value.map(i => i.id))
      const toRestore = removed.filter(i => !currentIds.has(i.id))
      if (toRestore.length > 0) {
        items.value = [...items.value, ...toRestore]
      }
      throw e
    }
  }

  async function moveToFridge(id: string) {
    await shoppingService.moveToFridge(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function moveAllBoughtToFridge(householdId: string): Promise<number> {
    const count = await shoppingService.moveAllBoughtToFridge(householdId)
    items.value = items.value.filter(i => !i.is_bought)
    return count
  }

  return {
    items, loading, error, toBuy, bought,
    fetchItems, clearError, addItem, toggleBought, deleteItem, clearBought,
    moveToFridge, moveAllBoughtToFridge
  }
}, {
  persist: {
    key: 'shopping-cache-v1',
    storage: localStorage,
    pick: ['items'],
  },
})