import {computed, onMounted} from 'vue'
import {storeToRefs} from 'pinia'
import {useShoppingSetsStore} from '@/stores/shoppingSets.store'
import {useAuthStore} from '@/stores/auth.store'
import {useShoppingStore} from '@/stores/shopping.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useToastStore} from '@/stores/toast.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'

export function useShoppingSetsView() {
  const setsStore = useShoppingSetsStore()
  const authStore = useAuthStore()
  const shoppingStore = useShoppingStore()
  const confirm = useConfirmStore()
  const toast = useToastStore()
  const {sets, loading, error} = storeToRefs(setsStore)
  const {run} = useAsyncAction()

  const currentListCount = computed(() => shoppingStore.toBuy.length)

  async function refresh() {
    if (authStore.householdId) await setsStore.fetchSets(authStore.householdId)
  }

  async function handleRename(setId: string, name: string) {
    await run(async () => {
      await setsStore.rename(setId, name)
      return true as const
    }, {success: 'Nazwa zmieniona'})
  }

  async function handleDelete(setId: string, name: string) {
    const ok = await confirm.ask(`Usunąć zestaw „${name}"?`, 'Usuń zestaw')
    if (!ok) return
    await run(async () => {
      await setsStore.deleteSet(setId)
      return true as const
    }, {success: 'Zestaw usunięty'})
  }

  async function handleApply(setId: string, name: string) {
    const result = await run(async () => {
      return await setsStore.applyToCurrentList(setId)
    })
    if (!result) return

    // Odśwież listę zakupów
    if (authStore.householdId) {
      await shoppingStore.fetchItems(authStore.householdId, {silent: true})
    }

    const parts: string[] = []
    if (result.added > 0) parts.push(`dodano ${result.added}`)
    if (result.merged > 0) parts.push(`zsumowano ${result.merged}`)
    if (result.skipped.length > 0) parts.push(`pominięto ${result.skipped.length}`)

    toast.show(
      `Zestaw „${name}": ${parts.join(', ')}`,
      result.skipped.length > 0 ? 'info' : 'success',
      result.skipped.length > 0 ? 7000 : 4000,
    )

    if (result.skipped.length > 0) {
      const details = result.skipped
        .map(s => `${s.name} (${s.reason})`)
        .join('; ')
      toast.show(`Pominięto: ${details}`, 'info', 8000)
    }
  }

  onMounted(refresh)
  useRealtimeSubscription('shopping_sets', refresh)

  return {
    sets, loading, error,
    currentListCount,
    refresh, handleRename, handleDelete, handleApply,
    clearError: setsStore.clearError,
  }
}