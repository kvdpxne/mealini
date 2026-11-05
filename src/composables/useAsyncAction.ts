import {ref} from 'vue'
import {useToastStore} from '@/stores/toast.store'

interface ActionOptions<T> {
  success?: string | ((result: T) => string)
}

export function useAsyncAction() {
  const toast = useToastStore()
  const pending = ref(false)

  async function run<T>(
    fn: () => Promise<T>,
    opts: ActionOptions<T> = {},
  ): Promise<T | undefined> {
    pending.value = true
    try {
      const result = await fn()
      if (opts.success) {
        const message =
          typeof opts.success === 'function' ? opts.success(result) : opts.success
        toast.show(message, 'success')
      }
      return result
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Coś poszło nie tak'
      toast.show(message, 'error')
      return undefined
    } finally {
      pending.value = false
    }
  }

  return {run, pending}
}