import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {type ActiveShare, shoppingShareService} from '@/services/shopping-share.service'

export function useShareListModal() {
  const authStore = useAuthStore()
  const confirm = useConfirmStore()
  const {run} = useAsyncAction()

  const ttlHours = ref(24)
  const generatedUrl = ref<string | null>(null)
  const activeShares = ref<ActiveShare[]>([])
  const generating = ref(false)

  async function loadActive() {
    if (!authStore.householdId) return
    try {
      activeShares.value = await shoppingShareService.listActive(authStore.householdId)
    } catch {
      activeShares.value = []
    }
  }

  async function generate() {
    if (!authStore.householdId) return
    generating.value = true
    const token = await run(async () => {
      return await shoppingShareService.create(authStore.householdId!, ttlHours.value)
    }, {success: 'Link utworzony'})
    generating.value = false
    if (!token) return
    generatedUrl.value = `${window.location.origin}/share/${token}`
    await loadActive()
  }

  async function revoke(shareId: string, prefix: string) {
    const ok = await confirm.ask(
      `Unieważnić link ${prefix}…? Odbiorca nie będzie mógł już z niego skorzystać.`,
      'Unieważnij link',
    )
    if (!ok) return
    await run(async () => {
      await shoppingShareService.revoke(shareId)
      return true as const
    }, {success: 'Link unieważniony'})
    await loadActive()
  }

  function reset() {
    generatedUrl.value = null
    ttlHours.value = 24
  }

  return {ttlHours, generatedUrl, activeShares, generating, loadActive, generate, revoke, reset}
}