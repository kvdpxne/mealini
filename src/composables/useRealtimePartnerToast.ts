import {useToastStore} from '@/stores/toast.store'
import {useAuthStore} from '@/stores/auth.store'
import {useHouseholdStore} from '@/stores/household.store'
import {useRealtimeSubscription} from './useRealtimeSubscription'
import {displayName} from '@/utils/displayName'

interface RealtimeItem {
  name: string
  created_by: string | null
}

export function useRealtimePartnerToast<T extends RealtimeItem>(
  table: string,
  buildMessage: (actor: string, itemName: string) => string,
  opts: { onChange?: () => void | Promise<void> } = {},
) {
  const toast = useToastStore()
  const authStore = useAuthStore()
  const householdStore = useHouseholdStore()

  useRealtimeSubscription<T>(table, {
    onChange: opts.onChange,
    onPayload: (change) => {
      if (change.eventType !== 'INSERT') {
        return
      }
      const item = change.new
      if (!item || !item.created_by) {
        return
      }
      // Pomijamy własne zmiany, użytkownik widzi je natychmiast w swoim widoku
      if (item.created_by === authStore.user?.id) {
        return
      }

      const actor = householdStore.members.find(m => m.user_id === item.created_by)
      const actorName = actor ? displayName(actor) : 'Twój partner'
      toast.show(buildMessage(actorName, item.name), 'info', 4500)
    },
  })
}