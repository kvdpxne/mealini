import { LIMITS, NAME_MAX_LENGTH } from '@/lib/validation'
import { isValidProductCategory } from '@/lib/productCategories'
import { assertName, assertUnit, assertQuantity } from './common'

export interface FridgeItemInput {
  name: string
  quantity: number
  unit: string
  expiry_date: string | null
  category: string | null
}

export interface ValidatedFridgeItemInput extends FridgeItemInput {}

export function validateFridgeItemInput(input: FridgeItemInput): ValidatedFridgeItemInput {
  const name = assertName(input.name, NAME_MAX_LENGTH, 'Nazwa produktu')
  const unit = assertUnit(input.unit)
  const quantity = assertQuantity(input.quantity)

  if (input.category !== null && !isValidProductCategory(input.category)) {
    throw new Error('Nieprawidłowa kategoria produktu.')
  }

  return {
    name,
    quantity,
    unit,
    expiry_date: input.expiry_date,
    category: input.category,
  }
}

/** Walidacja samej kategorii – dla updateItem, gdzie name może się nie zmieniać. */
export function assertCategory(value: string | null): void {
  if (value !== null && !isValidProductCategory(value)) {
    throw new Error('Nieprawidłowa kategoria produktu.')
  }
}

/**
 * Walidacja nazwy – dla updateItem. Nie robi sprawdzenia duplikatu (to robi serwis,
 * bo potrzebuje Supabase). Zwraca przyciętą nazwę.
 */
export function validateFridgeItemName(name: string): string {
  return assertName(name, NAME_MAX_LENGTH, 'Nazwa produktu')
}

/** Walidacja jednostki – eksport dla updateItem. */
export function validateFridgeItemUnit(unit: string): string {
  return assertUnit(unit)
}

/** Walidacja ilości – eksport dla updateItem. */
export function validateFridgeItemQuantity(quantity: number): number {
  return assertQuantity(quantity)
}

// Re-eksport dla wygody importów z serwisu
export { LIMITS }