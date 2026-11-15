import {supabase} from '@/lib/supabaseClient'

export interface ActiveSession {
  id: string
  created_at: string
  updated_at: string
  refreshed_at: string | null
  user_agent: string | null
  ip: string | null
  aal: string | null
}

export const sessionService = {
  async list(): Promise<ActiveSession[]> {
    const {data, error} = await supabase.rpc('list_current_user_sessions')
    if (error) throw new Error(`Nie udało się pobrać sesji: ${error.message}`)
    return (data ?? []) as ActiveSession[]
  },

  async revoke(sessionId: string): Promise<void> {
    const {error} = await supabase.rpc('revoke_session', {
      p_session_id: sessionId,
    })
    if (error) throw new Error(`Nie udało się unieważnić sesji: ${error.message}`)
  },

  /** Wylogowuje wszystkie sesje POZA bieżącą. */
  async signOutOthers(): Promise<void> {
    const {error} = await supabase.auth.signOut({scope: 'others'})
    if (error) throw new Error(`Nie udało się wylogować innych sesji: ${error.message}`)
  },
}