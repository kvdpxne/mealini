import {LIMITS, NAME_MAX_LENGTH} from '@/lib/validation'
import {assertName, assertOptionalName, assertQuantity, assertUnit} from './common'

export interface ShoppingItemInput {
  name: string
  quantity: number
  unit: string
  note: string | null
}

export function validateShoppingItemInput(input: ShoppingItemInput): ShoppingItemInput {
  return {
    name: assertName(input.name, NAME_MAX_LENGTH, 'Nazwa pozycji'),
    quantity: assertQuantity(input.quantity),
    unit: assertUnit(input.unit),
    note: assertOptionalName(input.note, LIMITS.note, 'Notatka'),
  }
}