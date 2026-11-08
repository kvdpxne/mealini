import {ref} from 'vue'

const KEY = 'mealini:route-sort-by-store'

function readAll(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

const preferences = ref<Record<string, boolean>>(readAll())

export function useRouteSortPreference() {
  function isEnabled(storeId: string | null): boolean {
    if (!storeId) return false
    return preferences.value[storeId] === true
  }

  function setEnabled(storeId: string, enabled: boolean) {
    preferences.value = {...preferences.value, [storeId]: enabled}
    try {
      localStorage.setItem(KEY, JSON.stringify(preferences.value))
    } catch {
    }
  }

  return {isEnabled, setEnabled}
}