import {supabase} from '@/lib/supabaseClient'
import type {Store, StoreZone} from '@/types/database.types'
import {LIMITS} from '@/lib/validation'

export interface StoreWithMapUrl extends Store {
  mapUrl: string | null
}

export const storeService = {
  async list(householdId: string): Promise<Store[]> {
    const {data, error} = await supabase
      .from('stores')
      .select('*')
      .eq('household_id', householdId)
      .order('name', {ascending: true})
    if (error) throw new Error(`Nie udało się pobrać sklepów: ${error.message}`)
    return data ?? []
  },

  async get(id: string): Promise<Store | null> {
    const {data, error} = await supabase.from('stores').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(`Nie udało się pobrać sklepu: ${error.message}`)
    return data
  },

  async create(householdId: string, name: string): Promise<Store> {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Nazwa sklepu nie może być pusta.')
    if (trimmed.length > LIMITS.storeName) {
      throw new Error(`Nazwa sklepu może mieć maksymalnie ${LIMITS.storeName} znaków.`)
    }
    const {data, error} = await supabase
      .from('stores')
      .insert({household_id: householdId, name: trimmed})
      .select()
      .single()
    if (error) throw new Error(`Nie udało się utworzyć sklepu: ${error.message}`)
    return data
  },

  async rename(id: string, name: string): Promise<Store> {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Nazwa sklepu nie może być pusta.')
    if (trimmed.length > LIMITS.storeName) {
      throw new Error(`Nazwa sklepu może mieć maksymalnie ${LIMITS.storeName} znaków.`)
    }
    const {data, error} = await supabase
      .from('stores')
      .update({name: trimmed})
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Nie udało się zmienić nazwy: ${error.message}`)
    return data
  },

  async setMapPath(id: string, path: string | null): Promise<void> {
    const {error} = await supabase.from('stores').update({map_path: path}).eq('id', id)
    if (error) throw new Error(`Nie udało się zapisać mapy: ${error.message}`)
  },

  async delete(id: string): Promise<void> {
    const {error} = await supabase.from('stores').delete().eq('id', id)
    if (error) throw new Error(`Nie udało się usunąć sklepu: ${error.message}`)
  },

  async listZones(storeId: string): Promise<StoreZone[]> {
    const {data, error} = await supabase
      .from('store_zones')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', {ascending: true})
      .order('created_at', {ascending: true})
    if (error) throw new Error(`Nie udało się pobrać stref: ${error.message}`)
    return data ?? []
  },

  async addZone(storeId: string, name: string): Promise<StoreZone> {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Nazwa strefy nie może być pusta.')
    if (trimmed.length > LIMITS.storeZoneName) {
      throw new Error(`Nazwa strefy może mieć maksymalnie ${LIMITS.storeZoneName} znaków.`)
    }

    const {data: max} = await supabase
      .from('store_zones')
      .select('sort_order')
      .eq('store_id', storeId)
      .order('sort_order', {ascending: false})
      .limit(1)
      .maybeSingle()
    const nextOrder = (max?.sort_order ?? -1) + 1

    const {data, error} = await supabase
      .from('store_zones')
      .insert({store_id: storeId, name: trimmed, sort_order: nextOrder})
      .select()
      .single()
    if (error) throw new Error(`Nie udało się dodać strefy: ${error.message}`)
    return data
  },

  async renameZone(id: string, name: string): Promise<StoreZone> {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Nazwa strefy nie może być pusta.')
    if (trimmed.length > LIMITS.storeZoneName) {
      throw new Error(`Nazwa strefy może mieć maksymalnie ${LIMITS.storeZoneName} znaków.`)
    }
    const {data, error} = await supabase
      .from('store_zones')
      .update({name: trimmed})
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Nie udało się zmienić nazwy strefy: ${error.message}`)
    return data
  },

  async deleteZone(id: string): Promise<void> {
    const {error} = await supabase.from('store_zones').delete().eq('id', id)
    if (error) throw new Error(`Nie udało się usunąć strefy: ${error.message}`)
  },

  async reorderZones(zones: StoreZone[]): Promise<void> {
    await Promise.all(
      zones.map((z, i) =>
        supabase.from('store_zones').update({sort_order: i}).eq('id', z.id),
      ),
    )
  },
}