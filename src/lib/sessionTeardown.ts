import {useFridgeStore} from '@/stores/fridge.store'
import {useShoppingStore} from '@/stores/shopping.store'
import {clearUserStorage} from './userScopedStorage'

const PERSISTED_STORE_KEYS = ['fridge-items', 'shopping-items']

/**
 * Resetuje wszystkie persystowane store'y i usuwa ich klucze z localStorage
 * dla wskazanego użytkownika. Best-effort: błąd jednego store'a nie blokuje
 * reszty – bezpieczeństwo zapewniają scoped keys, to jest higiena.
 */
export function teardownPersistedState(previousUserId: string | null) {
  try {
    useFridgeStore().$reset()
  } catch (e) {
    console.error('[teardown] fridge', e)
  }
  try {
    useShoppingStore().$reset()
  } catch (e) {
    console.error('[teardown] shopping', e)
  }

  if (previousUserId) {
    clearUserStorage(previousUserId, PERSISTED_STORE_KEYS)
  }
}