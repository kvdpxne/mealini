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
    await shoppingService.deleteItem(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function clearBought(householdId: string) {
    await shoppingService.clearBought(householdId)
    items.value = items.value.filter(i => !i.is_bought)
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
})