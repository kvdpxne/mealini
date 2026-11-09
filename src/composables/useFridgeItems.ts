import {computed, type Ref} from 'vue'
import type {FridgeItem} from '@/types/database.types'
import type {ProductCategory} from '@/lib/productCategories'
import {daysBetween, parseLocalDate, todayLocalMidnight} from '@/utils/date'

export type ExpiryStatus = 'expired' | 'expiring' | 'fresh' | 'no-date'
export type ExpiryFilter = 'all' | ExpiryStatus
export type ProductCategoryFilter = 'all' | 'uncategorized' | ProductCategory

function categorizeExpiry(expiry: string | null): ExpiryStatus {
  if (!expiry) return 'no-date'
  let diffDays: number
  try {
    diffDays = daysBetween(todayLocalMidnight(), parseLocalDate(expiry))
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
  expiryFilter?: Ref<ExpiryFilter>,
  productCategory?: Ref<ProductCategoryFilter>,
) {
  const filteredSorted = computed(() => {
    let list = [...source.value]

    if (searchQuery?.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q))
    }

    const cat = productCategory?.value ?? 'all'
    if (cat === 'uncategorized') {
      list = list.filter(i => i.category === null)
    } else if (cat !== 'all') {
      list = list.filter(i => i.category === cat)
    }

    const exp = expiryFilter?.value ?? 'all'
    if (exp !== 'all') {
      list = list.filter(i => categorizeExpiry(i.expiry_date) === exp)
    }

    const order: Record<ExpiryStatus, number> = {
      expired: 0, expiring: 1, fresh: 2, 'no-date': 3,
    }
    return list.sort((a, b) => {
      const catA = categorizeExpiry(a.expiry_date)
      const catB = categorizeExpiry(b.expiry_date)
      if (order[catA] !== order[catB]) return order[catA] - order[catB]
      return a.name.localeCompare(b.name, 'pl')
    })
  })

  const expiringSoon = computed(() =>
    filteredSorted.value.filter(i => categorizeExpiry(i.expiry_date) === 'expiring'),
  )
  const expired = computed(() =>
    filteredSorted.value.filter(i => categorizeExpiry(i.expiry_date) === 'expired'),
  )

  return {filteredSorted, expiringSoon, expired, categorize: categorizeExpiry}
}