import {computed, type Ref} from 'vue'
import type {FridgeItem} from '@/types/database.types'

export type FridgeCategory = 'expired' | 'expiring' | 'fresh' | 'no-date'
export type CategoryFilter = 'all' | FridgeCategory

export function categorize(expiry: string | null): FridgeCategory {
  if (!expiry) return 'no-date'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiryDate = new Date(expiry)
  const diffDays = Math.floor((expiryDate.getTime() - today.getTime()) / 86_400_000)
  if (diffDays < 0) return 'expired'
  if (diffDays <= 3) return 'expiring'
  return 'fresh'
}

export function useFridgeItems(
  source: Ref<FridgeItem[]>,
  searchQuery?: Ref<string>,
  categoryFilter?: Ref<CategoryFilter>,
) {
  const filteredSorted = computed(() => {
    let list = [...source.value]

    if (searchQuery?.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q))
    }

    const cat = categoryFilter?.value ?? 'all'
    if (cat !== 'all') {
      list = list.filter(i => categorize(i.expiry_date) === cat)
    }

    // Sortowanie: przeterminowane -> wkrótce -> świeże -> bez daty, potem alfabetycznie
    const order: Record<FridgeCategory, number> = {
      expired: 0,
      expiring: 1,
      fresh: 2,
      'no-date': 3,
    }
    return list.sort((a, b) => {
      const catA = categorize(a.expiry_date)
      const catB = categorize(b.expiry_date)
      if (order[catA] !== order[catB]) return order[catA] - order[catB]
      return a.name.localeCompare(b.name, 'pl')
    })
  })

  const expiringSoon = computed(() =>
    filteredSorted.value.filter(i => categorize(i.expiry_date) === 'expiring'),
  )
  const expired = computed(() =>
    filteredSorted.value.filter(i => categorize(i.expiry_date) === 'expired'),
  )

  return {filteredSorted, expiringSoon, expired, categorize}
}