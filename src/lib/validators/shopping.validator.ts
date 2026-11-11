import {NAME_MAX_LENGTH} from '@/lib/validation'
import {assertName, assertQuantity, assertUnit} from './common'

export interface ShoppingItemInput {
  name: string
  quantity: number
  unit: string
}

export function validateShoppingItemInput(input: ShoppingItemInput): ShoppingItemInput {
  return {
    name: assertName(input.name, NAME_MAX_LENGTH, 'Nazwa pozycji'),
    quantity: assertQuantity(input.quantity),
    unit: assertUnit(input.unit),
  }
}