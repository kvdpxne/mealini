import {supabase} from '@/lib/supabaseClient'
import type {UserProfile} from '@/types/database.types'
import {type ProfileInput, validateProfileInput} from '@/lib/validators/profile.validator'

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const {data, error} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw new Error(`Nie udało się pobrać profilu: ${error.message}`)
    return data
  },

  async updateProfile(userId: string, updates: ProfileInput): Promise<UserProfile> {
    const validated = validateProfileInput(updates)
    const {data, error} = await supabase
      .from('profiles')
      .update(validated)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw new Error(`Nie udało się zapisać profilu: ${error.message}`)
    return data
  },

  /**
   * Jednorazowe mapowanie profilu z OAuth (Google).
   * Wywoływane po pierwszym SIGNED_IN, gdy profil jest pusty.
   * NIGDY nie nadpisuje istniejących wartości first_name/last_name.
   */
  async seedFromOAuth(userId: string): Promise<UserProfile | null> {
    const {data: {user}} = await supabase.auth.getUser()
    if (!user || user.id !== userId) return null

    const provider = user.app_metadata?.provider
    if (provider === 'email') return null   // nie dotykamy email/hasło

    const meta = user.user_metadata ?? {}
    const fullName: string | undefined = meta.full_name || meta.name
    if (!fullName || typeof fullName !== 'string') return null

    const parts = fullName.trim().split(/\s+/)
    const firstName = parts[0] ?? null
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null

    // Warunkowy UPDATE: ustawiamy tylko tam, gdzie pole jest NULL.
    // Dzięki temu nigdy nie nadpiszemy wartości edytowanych przez użytkownika.
    const {data, error} = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq('id', userId)
      .is('first_name', null)   // tylko jeśli puste
      .select()
      .maybeSingle()

    if (error) {
      console.error('[profile seed]', error)
      return null
    }
    return data
  },
}