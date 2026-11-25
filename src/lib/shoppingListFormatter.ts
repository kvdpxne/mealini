import type {ShoppingListItem, StoreZone} from '@/types/database.types'
import {formatQuantity} from '@/lib/quantity'

export interface FormatOptions {
  /** Nazwa sklepu, jeśli wybrany (dla nagłówka). */
  storeName?: string | null
  /** Strefy w kolejności trasy – jeśli podane, grupujemy po strefach. */
  zones?: StoreZone[]
  /** Funkcja przypisania pozycji do strefy (dla grupowania). */
  zoneIdFor?: (item: ShoppingListItem) => string | null
  /** Czy dołączyć sekcję „Kupione”. */
  includeBought?: boolean
}

export function formatShoppingList(
  toBuy: ShoppingListItem[],
  bought: ShoppingListItem[],
  opts: FormatOptions = {},
): string {
  const lines: string[] = []
  const date = new Date().toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  lines.push('🛒 Lista zakupów — Mealini')
  if (opts.storeName) lines.push(`Sklep: ${opts.storeName}`)
  lines.push(`Data: ${date}`)
  lines.push('')

  if (toBuy.length === 0 && (!opts.includeBought || bought.length === 0)) {
    lines.push('(lista jest pusta)')
    return lines.join('\n')
  }

  // Grupowanie po strefach (jeśli podane), inaczej płaska lista
  const useZones = opts.zones && opts.zones.length > 0 && opts.zoneIdFor

  if (useZones) {
    const byZone = new Map<string, ShoppingListItem[]>()
    const unassigned: ShoppingListItem[] = []

    for (const item of toBuy) {
      const zoneId = opts.zoneIdFor!(item)
      if (zoneId) {
        const arr = byZone.get(zoneId) ?? []
        arr.push(item)
        byZone.set(zoneId, arr)
      } else {
        unassigned.push(item)
      }
    }

    for (const zone of opts.zones!) {
      const items = byZone.get(zone.id)
      if (!items || items.length === 0) continue
      lines.push(`📍 ${zone.name}`)
      for (const item of items) lines.push(formatItemLine(item))
      lines.push('')
    }

    if (unassigned.length > 0) {
      lines.push('📍 Bez przypisania')
      for (const item of unassigned) lines.push(formatItemLine(item))
      lines.push('')
    }
  } else {
    lines.push(`Do kupienia (${toBuy.length}):`)
    for (const item of toBuy) lines.push(formatItemLine(item))
    lines.push('')
  }

  if (opts.includeBought && bought.length > 0) {
    lines.push(`Kupione (${bought.length}):`)
    for (const item of bought) lines.push(`✓ ${formatItemLine(item, false)}`)
    lines.push('')
  }

  lines.push('—')
  lines.push('Wygenerowano w Mealini')
  return lines.join('\n').trim()
}

function formatItemLine(item: ShoppingListItem, withBox = true): string {
  const prefix = withBox ? '☐ ' : ''
  const qty = formatQuantity(item.quantity, item.unit)
  const note = item.note ? `  (${item.note})` : ''
  return `${prefix}${item.name} — ${qty}${note}`
}