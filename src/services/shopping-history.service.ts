import {supabase} from '@/lib/supabaseClient'

export interface ShoppingSuggestion {
  name: string
}

export const shoppingHistoryService = {
  async getSuggestions(householdId: string, limit = 10): Promise<ShoppingSuggestion[]> {
    const {data, error} = await supabase.rpc('get_shopping_suggestions', {
      p_household_id: householdId,
      p_limit: limit,
    })
    if (error) throw new Error(`Nie udało się pobrać sugestii: ${error.message}`)
    return (data ?? []) as ShoppingSuggestion[]
  },
}