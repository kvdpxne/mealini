import {supabase} from '@/lib/supabaseClient'
import type {FridgeItem} from '@/types/database.types'
import {normalizeName} from '@/lib/validation'
import {
  assertCategory,
  validateFridgeItemInput,
  validateFridgeItemName,
  validateFridgeItemQuantity,
  validateFridgeItemUnit,
} from '@/lib/validators/fridge.validator'

type NewFridgeItem = Omit<FridgeItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'name_normalized'>

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

  async addItem(item: NewFridgeItem): Promise<FridgeItem> {
    const validated = validateFridgeItemInput(item)

    const {data: existing} = await supabase
      .from('fridge_items')
      .select('id, name')
      .eq('household_id', item.household_id)
      .eq('name_normalized', normalizeName(validated.name))
      .maybeSingle()

    if (existing) {
      throw new Error(`„${existing.name}” już jest w lodówce – zwiększ ilość zamiast dodawać nowy.`)
    }

    const {data, error} = await supabase
      .from('fridge_items')
      .insert({...validated, household_id: item.household_id})
      .select()
      .single()

    if (error) {
      if (error.code === '23505') throw new Error(`„${validated.name}” już jest w lodówce.`)
      if (error.code === '23514') throw new Error('Nieprawidłowa kategoria produktu.')
      throw new Error(`Nie udało się dodać produktu: ${error.message}`)
    }
    return data
  },

  async updateItem(id: string, updates: Partial<FridgeItem>): Promise<FridgeItem> {
    const normalized: Partial<FridgeItem> = {...updates}

    if (updates.name !== undefined) {
      normalized.name = validateFridgeItemName(updates.name)
    }
    if (updates.unit !== undefined) {
      normalized.unit = validateFridgeItemUnit(updates.unit)
    }
    if (updates.quantity !== undefined) {
      normalized.quantity = validateFridgeItemQuantity(updates.quantity)
    }
    if (updates.category !== undefined) {
      assertCategory(updates.category)
    }

    // Sprawdzenie duplikatu przy zmianie nazwy (poza własnym wierszem)
    if (updates.name !== undefined) {
      const {data: current} = await supabase
        .from('fridge_items')
        .select('household_id')
        .eq('id', id)
        .single()

      if (current) {
        const {data: existing} = await supabase
          .from('fridge_items')
          .select('id, name')
          .eq('household_id', current.household_id)
          .eq('name_normalized', normalizeName(normalized.name!))
          .neq('id', id)
          .maybeSingle()

        if (existing) {
          throw new Error(`„${existing.name}” już jest w lodówce.`)
        }
      }
    }

    const {data, error} = await supabase
      .from('fridge_items')
      .update({...normalized, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') throw new Error('Produkt o tej nazwie już istnieje w lodówce.')
      if (error.code === '23514') throw new Error('Nieprawidłowa kategoria produktu.')
      throw new Error(`Nie udało się zaktualizować produktu: ${error.message}`)
    }
    return data
  },

  async deleteItem(id: string): Promise<void> {
    const {error} = await supabase.from('fridge_items').delete().eq('id', id)
    if (error) throw new Error(`Nie udało się usunąć produktu: ${error.message}`)
  },

  async restoreItem(item: FridgeItem): Promise<FridgeItem> {
    const { data, error } = await supabase
      .from('fridge_items')
      .insert({
        id: item.id,
        household_id: item.household_id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: item.expiry_date,
        category: item.category,
        created_at: item.created_at
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Nie można przywrócić „${item.name}” – produkt o tej nazwie już istnieje.`)
      }
      throw new Error(`Nie udało się przywrócić produktu: ${error.message}`)
    }
    return data
  },

  async moveToShopping(itemId: string): Promise<void> {
    const {error} = await supabase.rpc('move_fridge_item_to_shopping', {
      item_id: itemId,
    })
    if (error) throw new Error(`Nie udało się przenieść produktu: ${error.message}`)
  },
}