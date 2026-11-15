import {supabase} from '@/lib/supabaseClient'

export interface SharedListItem {
  id: string
  name: string
  quantity: number
  unit: string
  is_bought: boolean
}

export interface SharedList {
  share_id: string
  expires_at: string
  items: SharedListItem[]
}

export interface ActiveShare {
  id: string
  token_prefix: string
  created_at: string
  expires_at: string
}

export const shoppingShareService = {
  async create(householdId: string, ttlHours: number): Promise<string> {
    const {data, error} = await supabase.rpc('create_shopping_list_share', {
      p_household_id: householdId,
      p_ttl_hours: ttlHours,
    })
    if (error) throw new Error(`Nie udało się utworzyć linku: ${error.message}`)
    return data as string
  },

  async listActive(householdId: string): Promise<ActiveShare[]> {
    const {data, error} = await supabase.rpc('list_shopping_list_shares', {
      p_household_id: householdId,
    })
    if (error) throw new Error(`Nie udało się pobrać udostępnień: ${error.message}`)
    return (data ?? []) as ActiveShare[]
  },

  async revoke(shareId: string): Promise<void> {
    const {error} = await supabase.rpc('revoke_shopping_list_share', {
      p_share_id: shareId,
    })
    if (error) throw new Error(`Nie udało się unieważnić linku: ${error.message}`)
  },

  // --- Wywoływane przez odbiorcę (anon) ---

  async getSharedList(token: string): Promise<SharedList> {
    const {data, error} = await supabase.rpc('get_shared_list', {p_token: token})
    if (error) throw new Error(error.message)
    return data as SharedList
  },

  async toggleItem(token: string, itemId: string, isBought: boolean): Promise<void> {
    const {error} = await supabase.rpc('toggle_shared_list_item', {
      p_token: token,
      p_item_id: itemId,
      p_is_bought: isBought,
    })
    if (error) throw new Error(error.message)
  },

  async complete(token: string): Promise<void> {
    const {error} = await supabase.rpc('complete_shared_list', {p_token: token})
    if (error) throw new Error(error.message)
  },
}