export const UNITS = ['szt', 'kg', 'g', 'l', 'ml', 'opak'] as const
export type Unit = (typeof UNITS)[number]

export type Dimension = 'mass' | 'volume' | 'count'

export interface UnitDefinition {
  symbol: Unit
  dimension: Dimension
  /** Mnożnik do jednostki bazowej wymiaru (g / ml / count-as-is). */
  toBaseFactor: number
}

/**
 * Kanoniczne jednostki bazowe:
 * - mass → g
 * - volume → ml
 * - count → brak konwersji (szt i opak to różne rzeczy)
 */
export const UNIT_DEFS: Record<Unit, UnitDefinition> = {
  g: {symbol: 'g', dimension: 'mass', toBaseFactor: 1},
  kg: {symbol: 'kg', dimension: 'mass', toBaseFactor: 1000},
  ml: {symbol: 'ml', dimension: 'volume', toBaseFactor: 1},
  l: {symbol: 'l', dimension: 'volume', toBaseFactor: 1000},
  szt: {symbol: 'szt', dimension: 'count', toBaseFactor: 1},
  opak: {symbol: 'opak', dimension: 'count', toBaseFactor: 1},
}

export function isKnownUnit(u: string): u is Unit {
  return u in UNIT_DEFS
}

/** Krok pola liczbowego odpowiedni dla jednostki (całkowity dla g/ml/szt, dziesiętny dla kg/l). */
export function displayStepForUnit(unit: string): number {
  const def = isKnownUnit(unit) ? UNIT_DEFS[unit] : null
  if (!def) return 0.01
  if (def.dimension === 'count') return 1
  if (def.toBaseFactor === 1) return 1
  return 0.01
}