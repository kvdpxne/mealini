import {supabase} from '@/lib/supabaseClient'
import type {UserProfile} from '@/types/database.types'
import {LIMITS} from '@/lib/validation'

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
    const validate = (value: string | null | undefined, max: number, label: string) => {
      const t = value?.trim()
      if (t && t.length > max) {
        throw new Error(`${label} może mieć maksymalnie ${max} znaków.`)
      }
    }
    validate(updates.first_name, LIMITS.profileFirstName, 'Imię')
    validate(updates.last_name, LIMITS.profileLastName, 'Nazwisko')
    validate(updates.nickname, LIMITS.profileNickname, 'Nickname')

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