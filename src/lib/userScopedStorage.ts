const PREFIX = 'mealini'
let currentUserId: string | null = null

export function setStorageUser(userId: string | null) {
  currentUserId = userId
}

export function getStorageUser() {
  return currentUserId
}

function fullKey(baseKey: string): string | null {
  if (!currentUserId) return null
  return `${PREFIX}:${currentUserId}:${baseKey}`
}

export const userScopedStorage = {
  getItem(baseKey: string): string | null {
    const k = fullKey(baseKey)
    return k ? localStorage.getItem(k) : null
  },
  setItem(baseKey: string, value: string): void {
    const k = fullKey(baseKey)
    if (k) localStorage.setItem(k, value)
  },
  removeItem(baseKey: string): void {
    const k = fullKey(baseKey)
    if (k) localStorage.removeItem(k)
  },
}

/**
 * Jawnie usuwa klucze konkretnego użytkownika (używane w teardown).
 * Nie polegamy na setStorageUser – chcemy móc wyczyścić byłego usera,
 * nawet gdy storage scope już przeskoczył na nowego.
 */
export function clearUserStorage(userId: string, baseKeys: string[]) {
  for (const baseKey of baseKeys) {
    localStorage.removeItem(`${PREFIX}:${userId}:${baseKey}`)
  }
}