import {defineStore} from 'pinia'
import {ref} from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number;
  message: string;
  type: ToastType
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let counter = 0

  function show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = ++counter
    toasts.value.push({id, message, type})
    if (duration > 0) setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {toasts, show, dismiss}
})