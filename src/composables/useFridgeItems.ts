import {computed, type Ref} from 'vue'
import type {FridgeItem} from '@/types/database.types'
import {daysBetween, parseLocalDate, todayLocalMidnight} from '@/utils/date'

export type FridgeCategory = 'expired' | 'expiring' | 'fresh' | 'no-date'
export type CategoryFilter = 'all' | FridgeCategory

function categorize(expiry: string | null): FridgeCategory {
  if (!expiry) return 'no-date'

  let diffDays: number
  try {
    const target = parseLocalDate(expiry)
    diffDays = daysBetween(todayLocalMidnight(), target)
  } catch {
    return 'no-date'
  }

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