import {ref} from 'vue'

const KEY = 'mealini:selected-store-id'
const selectedStoreId = ref<string | null>(localStorage.getItem(KEY))

export function useSelectedStore() {
  function set(id: string | null) {
    selectedStoreId.value = id
    if (id) localStorage.setItem(KEY, id)
    else localStorage.removeItem(KEY)
  }

  return {selectedStoreId, set}
}