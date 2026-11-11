import {defineStore} from 'pinia'
import {ref} from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  handler: () => void | Promise<void>
}

export interface Toast {
  id: number
  message: string
  type: ToastType
  action?: ToastAction
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let counter = 0

  function show(message: string, type: ToastType = 'info', duration = 3000): number {
    const id = ++counter
    toasts.value.push({id, message, type})
    if (duration > 0) setTimeout(() => dismiss(id), duration)
    return id
  }

  function showWithAction(
    message: string,
    type: ToastType,
    action: ToastAction,
    duration = 5000,
  ): number {
    const id = ++counter
    toasts.value.push({id, message, type, action})
    if (duration > 0) setTimeout(() => dismiss(id), duration)
    return id
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  async function triggerAction(id: number) {
    const toast = toasts.value.find(t => t.id === id)
    if (!toast?.action) return
    // Dismiss first – prevents double-click from firing handler twice
    dismiss(id)
    try {
      await toast.action.handler()
    } catch (e) {
      console.error('[toast action]', e)
    }
  }

  return {toasts, show, showWithAction, dismiss, triggerAction}
})