import {supabase} from '@/lib/supabaseClient'
import type {ApplySetResult, ShoppingSet, ShoppingSetItem} from '@/types/database.types'
import {LIMITS, NAME_MAX_LENGTH} from '@/lib/validation'

export const shoppingSetsService = {
  async list(householdId: string): Promise<ShoppingSet[]> {
    const {data, error} = await supabase
      .from('shopping_sets')
      .select('*')
      .eq('household_id', householdId)
      .order('name', {ascending: true})
    if (error) throw new Error(`Nie udało się pobrać zestawów: ${error.message}`)
    return data ?? []
  },

  async listItems(setId: string): Promise<ShoppingSetItem[]> {
    const {data, error} = await supabase
      .from('shopping_set_items')
      .select('*')
      .eq('set_id', setId)
      .order('sort_order', {ascending: true})
    if (error) throw new Error(`Nie udało się pobrać pozycji zestawu: ${error.message}`)
    return data ?? []
  },

  async saveCurrentList(householdId: string, name: string): Promise<string> {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Nazwa zestawu nie może być pusta.')
    if (trimmed.length > 60) throw new Error('Nazwa może mieć maksymalnie 60 znaków.')

    const {data, error} = await supabase.rpc('save_current_list_as_set', {
      p_household_id: householdId,
      p_name: trimmed,
    })
    if (error) {
      if (error.code === '23505') throw new Error('Zestaw o tej nazwie już istnieje.')
      throw new Error(`Nie udało się zapisać zestawu: ${error.message}`)
    }
    return data as string
  },

  async applyToCurrentList(setId: string): Promise<ApplySetResult> {
    const {data, error} = await supabase.rpc('apply_shopping_set_to_list', {
      p_set_id: setId,
    })
    if (error) throw new Error(`Nie udało się zastosować zestawu: ${error.message}`)
    return data as ApplySetResult
  },

  async rename(setId: string, name: string): Promise<ShoppingSet> {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Nazwa zestawu nie może być pusta.')
    if (trimmed.length > 60) throw new Error('Nazwa może mieć maksymalnie 60 znaków.')

    const {data, error} = await supabase
      .from('shopping_sets')
      .update({name: trimmed})
      .eq('id', setId)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') throw new Error('Zestaw o tej nazwie już istnieje.')
      throw new Error(`Nie udało się zmienić nazwy: ${error.message}`)
    }
    return data
  },

  async deleteSet(setId: string): Promise<void> {
    const {error} = await supabase.from('shopping_sets').delete().eq('id', setId)
    if (error) throw new Error(`Nie udało się usunąć zestawu: ${error.message}`)
  },

  async addItem(
    setId: string,
    item: { name: string; quantity: number; unit: string },
  ): Promise<ShoppingSetItem> {
    const trimmed = item.name.trim()
    if (!trimmed) throw new Error('Nazwa pozycji nie może być pusta.')
    if (trimmed.length > NAME_MAX_LENGTH) {
      throw new Error(`Nazwa może mieć maksymalnie ${NAME_MAX_LENGTH} znaków.`)
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error('Ilość musi być większa od zera.')
    }
    if (!item.unit.trim() || item.unit.length > LIMITS.fridgeItemUnit) {
      throw new Error('Nieprawidłowa jednostka.')
    }

    // sort_order = max + 1
    const {data: max} = await supabase
      .from('shopping_set_items')
      .select('sort_order')
      .eq('set_id', setId)
      .order('sort_order', {ascending: false})
      .limit(1)
      .maybeSingle()
    const nextOrder = (max?.sort_order ?? -1) + 1

    const {data, error} = await supabase
      .from('shopping_set_items')
      .insert({
        set_id: setId,
        name: trimmed,
        quantity: item.quantity,
        unit: item.unit,
        sort_order: nextOrder,
      })
      .select()
      .single()
    if (error) {
      if (error.code === '23505') throw new Error('Pozycja o tej nazwie już jest w zestawie.')
      throw new Error(`Nie udało się dodać pozycji: ${error.message}`)
    }
    return data
  },

  async updateItem(
    itemId: string,
    updates: Partial<Pick<ShoppingSetItem, 'name' | 'quantity' | 'unit'>>,
  ): Promise<ShoppingSetItem> {
    const payload: Partial<ShoppingSetItem> = {...updates}

    if (payload.name !== undefined) {
      const trimmed = payload.name.trim()
      if (!trimmed) throw new Error('Nazwa pozycji nie może być pusta.')
      if (trimmed.length > NAME_MAX_LENGTH) {
        throw new Error(`Nazwa może mieć maksymalnie ${NAME_MAX_LENGTH} znaków.`)
      }
      payload.name = trimmed
    }
    if (payload.quantity !== undefined) {
      if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) {
        throw new Error('Ilość musi być większa od zera.')
      }
    }
    if (payload.unit !== undefined) {
      if (!payload.unit.trim() || payload.unit.length > LIMITS.fridgeItemUnit) {
        throw new Error('Nieprawidłowa jednostka.')
      }
    }

    const {data, error} = await supabase
      .from('shopping_set_items')
      .update(payload)
      .eq('id', itemId)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') throw new Error('Pozycja o tej nazwie już jest w zestawie.')
      throw new Error(`Nie udało się zaktualizować pozycji: ${error.message}`)
    }
    return data
  },

  async deleteItem(itemId: string): Promise<void> {
    const {error} = await supabase.from('shopping_set_items').delete().eq('id', itemId)
    if (error) throw new Error(`Nie udało się usunąć pozycji: ${error.message}`)
  },
}