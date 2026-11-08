import {ref} from 'vue'

const KEY = 'mealini:user-preferences'

export interface UserPreferences {
  clearInputAfterAdd: boolean
}

const DEFAULTS: UserPreferences = {
  clearInputAfterAdd: true,
}

function read(): UserPreferences {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    return {...DEFAULTS, ...JSON.parse(raw)}
  } catch {
    return DEFAULTS
  }
}

const preferences = ref<UserPreferences>(read())

export function useUserPreferences() {
  function set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    preferences.value = {...preferences.value, [key]: value}
    try {
      localStorage.setItem(KEY, JSON.stringify(preferences.value))
    } catch {
    }
  }

  return {preferences, set}
}