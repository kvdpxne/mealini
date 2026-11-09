import {supabase} from '@/lib/supabaseClient'
import {NAME_MAX_LENGTH, normalizeName} from '@/lib/validation'
import type {FridgeItem} from '@/types/database.types'
import {isValidProductCategory} from '@/lib/productCategories'

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

  async addItem(
    item: Omit<FridgeItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
  ): Promise<FridgeItem> {
    const trimmed = item.name.trim()
    if (trimmed.length === 0) {
      throw new Error('Nazwa produktu nie może być pusta.')
    }
    if (trimmed.length > NAME_MAX_LENGTH) {
      throw new Error(`Nazwa może mieć maksymalnie ${NAME_MAX_LENGTH} znaków.`)
    }
    if (item.category !== null && !isValidProductCategory(item.category)) {
      throw new Error('Nieprawidłowa kategoria produktu.')
    }

    const normalized = normalizeName(trimmed)
    const {data: existing} = await supabase
      .from('fridge_items')
      .select('id, name')
      .eq('household_id', item.household_id)
      .eq('name_normalized', normalized)
      .maybeSingle()

    if (existing) {
      throw new Error(`„${existing.name}” już jest w lodówce – zwiększ ilość zamiast dodawać nowy.`)
    }

    const {data, error} = await supabase
      .from('fridge_items')
      .insert({...item, name: trimmed})
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error(`„${trimmed}” już jest w lodówce.`)
      }
      if (error.code === '23514') {
        throw new Error('Nieprawidłowa kategoria produktu.')
      }
      throw new Error(`Nie udało się dodać produktu: ${error.message}`)
    }
    return data
  },

  async updateItem(id: string, updates: Partial<FridgeItem>): Promise<FridgeItem> {
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim()
      if (trimmed.length === 0) {
        throw new Error('Nazwa produktu nie może być pusta.')
      }
      if (trimmed.length > NAME_MAX_LENGTH) {
        throw new Error(`Nazwa może mieć maksymalnie ${NAME_MAX_LENGTH} znaków.`)
      }

      const {data: current, error: fetchErr} = await supabase
        .from('fridge_items')
        .select('household_id')
        .eq('id', id)
        .single()

      if (fetchErr || !current) throw new Error('Produkt nie istnieje.')

      const {data: existing} = await supabase
        .from('fridge_items')
        .select('id, name')
        .eq('household_id', current.household_id)
        .eq('name_normalized', normalizeName(trimmed))
        .neq('id', id)          // ← kluczowe: wykluczamy siebie
        .maybeSingle()

      if (existing) {
        throw new Error(`„${existing.name}” już jest w lodówce.`)
      }

      updates = {...updates, name: trimmed}
    }

    if (
      updates.category !== undefined &&
      updates.category !== null &&
      !isValidProductCategory(updates.category)
    ) {
      throw new Error('Nieprawidłowa kategoria produktu.')
    }

    const {data, error} = await supabase
      .from('fridge_items')
      .update({...updates, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Produkt o tej nazwie już istnieje w lodówce.')
      }
      if (error.code === '23514') {
        throw new Error('Nieprawidłowa kategoria produktu.')
      }
      throw new Error(`Nie udało się zaktualizować produktu: ${error.message}`)
    }
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