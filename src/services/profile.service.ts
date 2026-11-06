import {supabase} from '@/lib/supabaseClient'
import type {UserProfile} from '@/types/database.types'

export type ProfileUpdates = Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'nickname'>>

function normalize(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

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

  async updateProfile(userId: string, updates: ProfileUpdates): Promise<UserProfile> {
    const payload: ProfileUpdates = {
      first_name: normalize(updates.first_name),
      last_name: normalize(updates.last_name),
      nickname: normalize(updates.nickname),
    }
    const {data, error} = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw new Error(`Nie udało się zapisać profilu: ${error.message}`)
    return data
  },
}