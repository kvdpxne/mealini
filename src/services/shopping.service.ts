import {supabase} from '@/lib/supabaseClient'
import type {ShoppingListItem} from '@/types/database.types'

export const shoppingService = {
  async getItems(householdId: string): Promise<ShoppingListItem[]> {
    const {data, error} = await supabase
      .from('shopping_list_items')
      .select('*')
      .eq('household_id', householdId)
      .order('is_bought', {ascending: true})
      .order('created_at', {ascending: false})

    if (error) throw new Error(`Nie udało się pobrać listy zakupów: ${error.message}`)
    return data ?? []
  },

  async addItem(item: { household_id: string; name: string }): Promise<ShoppingListItem> {
    const {data, error} = await supabase
      .from('shopping_list_items')
      .insert(item)
      .select()
      .single()

    if (error) throw new Error(`Nie udało się dodać pozycji: ${error.message}`)
    return data
  },

  async toggleBought(id: string, isBought: boolean): Promise<ShoppingListItem> {
    const {data, error} = await supabase
      .from('shopping_list_items')
      .update({is_bought: isBought})
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Nie udało się zaktualizować pozycji: ${error.message}`)
    return data
  },

  async deleteItem(id: string): Promise<void> {
    const {error} = await supabase.from('shopping_list_items').delete().eq('id', id)
    if (error) throw new Error(`Nie udało się usunąć pozycji: ${error.message}`)
  },

  async clearBought(householdId: string): Promise<void> {
    const {error} = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('household_id', householdId)
      .eq('is_bought', true)

    if (error) throw new Error(`Nie udało się wyczyścić listy: ${error.message}`)
  },

  async moveToFridge(itemId: string): Promise<void> {
    const {error} = await supabase.rpc('move_shopping_item_to_fridge', {
      item_id: itemId,
    })
    if (error) throw new Error(`Nie udało się przenieść do lodówki: ${error.message}`)
  },

  async moveAllBoughtToFridge(householdId: string): Promise<number> {
    const {data, error} = await supabase.rpc('move_bought_shopping_items_to_fridge', {
      p_household_id: householdId,
    })
    if (error) throw new Error(`Nie udało się przenieść: ${error.message}`)
    return data as number
  },
}