import {LIMITS} from '@/lib/validation'
import {assertName} from './common'

export function validateHouseholdName(name: string): string {
  return assertName(name, LIMITS.householdName, 'Nazwa gospodarstwa')
}