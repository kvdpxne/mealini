import {LIMITS} from '@/lib/validation'

/**
 * Sprawdza, że string po trimie ma długość w [1, max].
 * Zwraca przyciętą wartość – serwisy nie muszą robić trim() drugi raz.
 */
export function assertName(value: string, max: number, label = 'Nazwa'): string {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new Error(`${label} nie może być pusta.`)
  }
  if (trimmed.length > max) {
    throw new Error(`${label} może mieć maksymalnie ${max} znaków.`)
  }
  return trimmed
}

/** Sprawdza jednostkę (szt, kg, ...) – długość + niepusta po trimie. */
export function assertUnit(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new Error('Jednostka nie może być pusta.')
  }
  if (trimmed.length > LIMITS.fridgeItemUnit) {
    throw new Error(`Jednostka może mieć maksymalnie ${LIMITS.fridgeItemUnit} znaków.`)
  }
  return trimmed
}

/** Sprawdza ilość – skończona liczba > 0. */
export function assertQuantity(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Ilość musi być większa od zera.')
  }
  return value
}

/** Sprawdza opcjonalny string: null lub niepusty po trimie, długość ≤ max. */
export function assertOptionalName(
  value: string | null | undefined,
  max: number,
  label = 'Pole',
): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > max) {
    throw new Error(`${label} może mieć maksymalnie ${max} znaków.`)
  }
  return trimmed
}