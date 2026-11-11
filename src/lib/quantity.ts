import {type Dimension, isKnownUnit, UNIT_DEFS} from './units'

export interface QuantityParts {
  value: number
  unit: string
}

/**
 * Konwertuje (qty, unit) na wartość w jednostce bazowej wymiaru.
 * Zwraca null dla nieznanej jednostki.
 */
export function toBase(
  qty: number,
  unit: string,
): { value: number; dimension: Dimension } | null {
  if (!isKnownUnit(unit)) return null
  const def = UNIT_DEFS[unit]
  return {value: qty * def.toBaseFactor, dimension: def.dimension}
}

/** Odwrotność toBase – konwertuje wartość bazową na docelową jednostkę. */
export function fromBase(baseValue: number, targetUnit: string): number | null {
  if (!isKnownUnit(targetUnit)) return null
  return baseValue / UNIT_DEFS[targetUnit].toBaseFactor
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Zwraca (wartość, jednostka) w najbardziej czytelnej formie.
 * - mass:   < 1000 g → g,    ≥ 1000 g → kg
 * - volume: < 1000 ml → ml,  ≥ 1000 ml → l
 * - count:  bez konwersji (szt i opak to różne rzeczy)
 * Wynik zaokrąglony do 2 miejsc (unika 0.30000000000000004).
 */
export function formatQuantityParts(qty: number, unit: string): QuantityParts {
  if (!Number.isFinite(qty)) return {value: qty, unit}
  if (!isKnownUnit(unit)) return {value: qty, unit}

  const def = UNIT_DEFS[unit]
  if (def.dimension === 'count') return {value: qty, unit}

  const base = qty * def.toBaseFactor

  if (def.dimension === 'mass') {
    return base >= 1000
      ? {value: roundTo(base / 1000, 2), unit: 'kg'}
      : {value: roundTo(base, 2), unit: 'g'}
  }
  // volume
  return base >= 1000
    ? {value: roundTo(base / 1000, 2), unit: 'l'}
    : {value: roundTo(base, 2), unit: 'ml'}
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/\.?0+$/, '')
}

/** Czytelny string, np. "500 g", "1.5 kg", "3 szt". */
export function formatQuantity(qty: number, unit: string): string {
  const parts = formatQuantityParts(qty, unit)
  if (!parts.unit) return formatNumber(parts.value)
  return `${formatNumber(parts.value)} ${parts.unit}`
}