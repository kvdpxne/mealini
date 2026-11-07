import {ref} from 'vue'

const isOnline = ref(navigator.onLine)
let initialized = false

function handleOnline() {
  isOnline.value = true
}

function handleOffline() {
  isOnline.value = false
}

export function useOnlineStatus() {
  if (!initialized) {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    initialized = true
  }
  return {isOnline}
}