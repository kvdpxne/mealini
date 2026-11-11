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
}