export const NAME_MAX_LENGTH = 80

export function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}