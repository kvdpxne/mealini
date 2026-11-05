import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const visible = ref(false)
  const title = ref('')
  const message = ref('')
  let resolver: ((v: boolean) => void) | null = null

  function ask(msg: string, t = 'Potwierdź'): Promise<boolean> {
    return new Promise((resolve) => {
      title.value = t
      message.value = msg
      visible.value = true
      resolver = resolve
    })
  }

  function confirm() {
    visible.value = false;
    resolver?.(true);
    resolver = null
  }

  function cancel() {
    visible.value = false;
    resolver?.(false);
    resolver = null
  }

  return {visible, title, message, ask, confirm, cancel}
})