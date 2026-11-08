import {computed, type Ref} from 'vue'
import type {ProductLocation, ShoppingListItem, StoreZone} from '@/types/database.types'
import {normalizeName} from '@/lib/validation'

export interface ZoneGroup {
  zone: StoreZone | null
  items: ShoppingListItem[]
}

export function useShoppingLocationGroups(
  items: Ref<ShoppingListItem[]>,
  zones: Ref<StoreZone[]>,
  locations: Ref<ProductLocation[]>,
) {
  const zoneIdByProduct = computed(() => {
    const map = new Map<string, string>()
    for (const loc of locations.value) {
      map.set(loc.product_name_normalized, loc.zone_id)
    }
    return map
  })

  const groups = computed<ZoneGroup[]>(() => {
    const byZone = new Map<string, ShoppingListItem[]>()
    const unassigned: ShoppingListItem[] = []

    for (const item of items.value) {
      const zoneId = zoneIdByProduct.value.get(normalizeName(item.name))
      if (zoneId) {
        const arr = byZone.get(zoneId) ?? []
        arr.push(item)
        byZone.set(zoneId, arr)
      } else {
        unassigned.push(item)
      }
    }

    const result: ZoneGroup[] = zones.value
      .map(zone => ({zone, items: byZone.get(zone.id) ?? []}))
      .filter(g => g.items.length > 0)

    if (unassigned.length > 0) {
      result.push({zone: null, items: unassigned})
    }
    return result
  })

  function zoneIdFor(item: ShoppingListItem): string | null {
    return zoneIdByProduct.value.get(normalizeName(item.name)) ?? null
  }

  return {groups, zoneIdFor}
}