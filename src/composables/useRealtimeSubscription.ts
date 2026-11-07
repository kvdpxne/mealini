import {onMounted, onUnmounted} from 'vue'
import {supabase} from '@/lib/supabaseClient'
import type {RealtimeChannel} from '@supabase/supabase-js'

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeChange<T> {
  eventType: RealtimeEventType
  new: T | null
  old: T | null
}

export interface UseRealtimeOptions<T> {
  onChange?: () => void | Promise<void>
  onPayload?: (change: RealtimeChange<T>) => void | Promise<void>
}

export function useRealtimeSubscription<T = Record<string, unknown>>(
  table: string,
  optionsOrCallback: UseRealtimeOptions<T> | (() => void | Promise<void>) = {},
) {
  const options: UseRealtimeOptions<T> =
    typeof optionsOrCallback === 'function'
      ? {onChange: optionsOrCallback}
      : optionsOrCallback

  let channel: RealtimeChannel | null = null

  onMounted(() => {
    channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table},
        (payload) => {
          if (options.onChange) void options.onChange()

          if (options.onPayload) {
            const change: RealtimeChange<T> = {
              eventType: payload.eventType as RealtimeEventType,
              new: (payload.new as T) ?? null,
              old: (payload.old as T) ?? null,
            }
            void options.onPayload(change)
          }
        },
      )
      .subscribe()
  })

  onUnmounted(() => {
    if (channel) supabase.removeChannel(channel)
  })
}