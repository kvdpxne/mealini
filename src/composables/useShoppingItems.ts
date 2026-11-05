import {computed, type Ref} from 'vue'
import type {ShoppingListItem} from '@/types/database.types'

export function useShoppingItems(
  source: Ref<ShoppingListItem[]>,
  search: Ref<string>,
) {
  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return source.value
    return source.value.filter(i => i.name.toLowerCase().includes(q))
  })

  const toBuy = computed(() => filtered.value.filter(i => !i.is_bought))
  const bought = computed(() => filtered.value.filter(i => i.is_bought))
  const isSearchActive = computed(() => search.value.trim().length > 0)

  return {filtered, toBuy, bought, isSearchActive}
}