import {supabase} from '@/lib/supabaseClient'

export const householdService = {
  async createHousehold(name: string): Promise<string> {
    const {data, error} = await supabase.rpc('create_household_for_current_user', {
      household_name: name,
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
}