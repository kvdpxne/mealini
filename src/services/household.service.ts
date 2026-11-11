import {supabase} from '@/lib/supabaseClient'
import {validateHouseholdName} from '@/lib/validators/household.validator'

export interface HouseholdMember {
  user_id: string
  joined_at: string
  nickname: string | null
  email: string | null
}

export interface HouseholdDetails {
  id: string
  name: string
  invite_code: string
}

export const householdService = {
  async createHousehold(name: string): Promise<string> {
    const trimmed = validateHouseholdName(name)
    const {data, error} = await supabase.rpc('create_household_for_current_user', {
      household_name: trimmed,
    })
    if (error) throw new Error(`Nie udało się utworzyć gospodarstwa: ${error.message}`)
    return data as string
  },

  async joinHousehold(code: string): Promise<string> {
    const {data, error} = await supabase.rpc('join_household_by_code', {
      code: code.trim(),
    })
    if (error) throw new Error(`Nie udało się dołączyć: ${error.message}`)
    return data as string
  },

  async getInviteCode(householdId: string): Promise<string | null> {
    const {data, error} = await supabase
      .from('households')
      .select('invite_code')
      .eq('id', householdId)
      .single()
    if (error) return null
    return data?.invite_code ?? null
  },

  async getDetails(householdId: string): Promise<HouseholdDetails | null> {
    const {data, error} = await supabase
      .from('households')
      .select('id, name, invite_code')
      .eq('id', householdId)
      .single()
    if (error) return null
    return data
  },

  async getMembers(householdId: string): Promise<HouseholdMember[]> {
    const {data, error} = await supabase.rpc('get_household_members', {
      p_household_id: householdId,
    })
    if (error) throw new Error(`Nie udało się pobrać członków: ${error.message}`)
    return (data ?? []) as HouseholdMember[]
  },

  async rename(householdId: string, name: string): Promise<void> {
    const trimmed = validateHouseholdName(name)
    const {error} = await supabase.rpc('rename_household', {
      p_household_id: householdId,
      p_name: trimmed,
    })
    if (error) throw new Error(`Nie udało się zmienić nazwy: ${error.message}`)
  },

  async regenerateInviteCode(householdId: string): Promise<string> {
    const {data, error} = await supabase.rpc('regenerate_invite_code', {
      p_household_id: householdId,
    })
    if (error) throw new Error(`Nie udało się wygenerować kodu: ${error.message}`)
    return data as string
  },

  async leave(householdId: string): Promise<void> {
    const {error} = await supabase.rpc('leave_household', {
      p_household_id: householdId,
    })
    if (error) throw new Error(`Nie udało się opuścić gospodarstwa: ${error.message}`)
  },
}