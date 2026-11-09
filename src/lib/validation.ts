export const LIMITS = {
  householdName: 60,
  inviteCode: 20,
  fridgeItemName: 80,
  fridgeItemUnit: 20,
  shoppingItemName: 80,
  profileFirstName: 50,
  profileLastName: 50,
  profileNickname: 30,
  storeName: 60,
  storeZoneName: 40,
} as const

/** @deprecated - użyj LIMITS.fridgeItemName / LIMITS.shoppingItemName. */
export const NAME_MAX_LENGTH = LIMITS.fridgeItemName

export function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}