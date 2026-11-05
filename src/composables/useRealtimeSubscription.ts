import {onMounted, onUnmounted} from 'vue'
import {supabase} from '@/lib/supabaseClient'
import type {RealtimeChannel} from '@supabase/supabase-js'

export function useRealtimeSubscription(
  table: string,
  onChange: () => void
) {
  let channel: RealtimeChannel | null = null

  onMounted(() => {
    channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table},
        () => {
          onChange()
        }
      )
      .subscribe()
  })

  onUnmounted(() => {
    if (channel) supabase.removeChannel(channel)
  })
}