import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import type {ShoppingListItem} from '@/types/database.types'
import type {ShoppingSuggestion} from '@/services/shopping-history.service'
import {shoppingHistoryService} from '@/services/shopping-history.service'
import {shoppingService} from '@/services/shopping.service'
import {userScopedStorage} from '@/lib/userScopedStorage'

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
      note: string | null = null,
    ) {
      const created = await shoppingService.addItem({
        household_id: householdId,
        name,
        quantity,
        unit,
        note,
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

    async function updateItem(
      id: string,
      updates: Partial<Pick<ShoppingListItem, 'name' | 'quantity' | 'unit' | 'note'>>,
    ) {
      const previous = items.value.find(i => i.id === id)
      if (!previous) return

      const optimisticIdx = items.value.findIndex(i => i.id === id)
      items.value[optimisticIdx] = {...previous, ...updates}

      try {
        const updated = await shoppingService.updateItem(id, updates)
        const confirmIdx = items.value.findIndex(i => i.id === id)
        if (confirmIdx !== -1) items.value[confirmIdx] = updated
      } catch (e) {
        const rollbackIdx = items.value.findIndex(i => i.id === id)
        if (rollbackIdx !== -1) items.value[rollbackIdx] = previous
        throw e
      }
    }

    async function updateName(id: string, name: string) {
      await updateItem(id, {name})
    }

    async function updateQuantity(id: string, quantity: number, unit: string) {
      await updateItem(id, {quantity, unit})
    }

    async function updateNote(id: string, note: string | null) {
      await updateItem(id, { note })
    }

    async function deleteItem(id: string): Promise<ShoppingListItem | undefined> {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx === -1) return undefined
      const removed = items.value[idx]
      items.value.splice(idx, 1)
      try {
        await shoppingService.deleteItem(id)
        return removed
      } catch (e) {
        items.value.splice(idx, 0, removed)
        throw e
      }
    }

    async function restoreItem(item: ShoppingListItem) {
      const restored = await shoppingService.restoreItem(item)
      items.value.push(restored)
      // Historia zakupów: restore podbije add_count przez trigger –
      // nieznaczny efekt uboczny, akceptowalny dla MVP
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
      addItem, toggleBought, updateItem, updateName, updateQuantity, updateNote,
      deleteItem, clearBought, restoreItem,
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