import {supabase} from '@/lib/supabaseClient'
import type {FridgeItem} from '@/types/database.types'

export const fridgeService = {
  async getItems(householdId: string): Promise<FridgeItem[]> {
    const {data, error} = await supabase
      .from('fridge_items')
      .select('*')
      .eq('household_id', householdId)
      .order('name', {ascending: true})

    if (error) throw new Error(`Nie udało się pobrać produktów: ${error.message}`)
    return data ?? []
  },

  async addItem(item: Omit<FridgeItem, 'id' | 'created_at' | 'updated_at'>): Promise<FridgeItem> {
    const {data, error} = await supabase
      .from('fridge_items')
      .insert(item)
      .select()
      .single()

    if (error) throw new Error(`Nie udało się dodać produktu: ${error.message}`)
    return data
  },

  async updateItem(id: string, updates: Partial<FridgeItem>): Promise<FridgeItem> {
    const {data, error} = await supabase
      .from('fridge_items')
      .update({...updates, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Nie udało się zaktualizować produktu: ${error.message}`)
    return data
  },

  async deleteItem(id: string): Promise<void> {
    const {error} = await supabase.from('fridge_items').delete().eq('id', id)
    if (error) throw new Error(`Nie udało się usunąć produktu: ${error.message}`)
  },

  async moveToShopping(itemId: string): Promise<void> {
    const {error} = await supabase.rpc('move_fridge_item_to_shopping', {
      item_id: itemId,
    })
    if (error) throw new Error(`Nie udało się przenieść produktu: ${error.message}`)
  },
}