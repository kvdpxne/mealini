import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import type {ShoppingListItem} from '@/types/database.types'
import type {ShoppingSuggestion} from '@/services/shopping-history.service'
import {shoppingHistoryService} from '@/services/shopping-history.service'
import {shoppingService} from '@/services/shopping.service'
import { userScopedStorage } from '@/lib/userScopedStorage'

export const useShoppingStore = defineStore(
  'shopping',
  () => {
    const items = ref<ShoppingListItem[]>([])
    const suggestions = ref<ShoppingSuggestion[]>([])
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

    async function fetchSuggestions(householdId: string) {
      try {
        suggestions.value = await shoppingHistoryService.getSuggestions(householdId)
      } catch {
        // sugestie są "nice to have", nie chcemy zaśmiecać UI błędem,
        // jeśli np. jesteśmy offline i nie mamy cache
      }
    }

    function clearError() {
      error.value = null
    }

    async function addItem(
      householdId: string,
      name: string,
      quantity = 1,
      unit = 'szt',
    ) {
      const created = await shoppingService.addItem({
        household_id: householdId,
        name,
        quantity,
        unit,
      })
      items.value.unshift(created)
      await fetchSuggestions(householdId)
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

    function $reset() {
      items.value = []
      suggestions.value = []
      loading.value = false
      error.value = null
    }

    return {
      items, suggestions, loading, error,
      toBuy, bought,
      fetchItems, fetchSuggestions, clearError,
      addItem, toggleBought, deleteItem, clearBought,
      moveToFridge, moveAllBoughtToFridge,
      $reset
    }
  }, {
    persist: {
      key: 'shopping-items',
      storage: userScopedStorage,
      pick: ['items', 'suggestions'],
    },
  })