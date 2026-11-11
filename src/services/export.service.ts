import {supabase} from '@/lib/supabaseClient'
import type {
  FridgeItem,
  ProductLocation,
  ShoppingListItem,
  Store,
  StoreZone,
  UserProfile,
} from '@/types/database.types'

export const EXPORT_SCHEMA_VERSION = '1.0' as const

export interface ExportMember {
  user_id: string
  nickname: string | null
  email: string | null  // null gdy nickname ustawiony (spójne z RPC z #5)
  joined_at: string
}

export interface ExportStore extends Store {
  zones: StoreZone[]
}

export interface ExportHousehold {
  id: string
  name: string
  invite_code: string
  created_at: string
  members: ExportMember[]
  fridge_items: FridgeItem[]
  shopping_list_items: ShoppingListItem[]
  shopping_history: Array<{
    name: string
    add_count: number
    last_added_at: string
  }>
  stores: ExportStore[]
  product_locations: ProductLocation[]
}

export interface ExportPayload {
  schemaVersion: typeof EXPORT_SCHEMA_VERSION
  exportedAt: string
  user: {
    id: string
    email: string | null
    created_at: string
    last_sign_in_at: string | null
    user_metadata: Record<string, unknown>
    app_metadata: Record<string, unknown>
  }
  profile: UserProfile | null
  households: ExportHousehold[]
}

async function getProfile(userId: string): Promise<UserProfile | null> {
  const {data} = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
}

async function getHouseholdIds(userId: string): Promise<string[]> {
  const {data, error} = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)
  if (error) throw new Error(`Nie udało się pobrać gospodarstw: ${error.message}`)
  return (data ?? []).map(m => m.household_id)
}

async function exportHousehold(householdId: string): Promise<ExportHousehold | null> {
  const [householdRes, membersRes, fridgeRes, shoppingRes, historyRes, storesRes, locationsRes] =
    await Promise.all([
      supabase.from('households').select('id, name, invite_code, created_at').eq('id', householdId).single(),
      supabase.rpc('get_household_members', {p_household_id: householdId}),
      supabase.from('fridge_items').select('*').eq('household_id', householdId).order('created_at'),
      supabase.from('shopping_list_items').select('*').eq('household_id', householdId).order('created_at'),
      supabase.from('shopping_history').select('name, add_count, last_added_at').eq('household_id', householdId).order('add_count', {ascending: false}),
      supabase.from('stores').select('*').eq('household_id', householdId).order('name'),
      supabase.from('product_locations').select('*').eq('household_id', householdId),
    ])

  if (!householdRes.data) return null

  const storeIds = (storesRes.data ?? []).map(s => s.id)
  let zones: StoreZone[] = []
  if (storeIds.length > 0) {
    const {data} = await supabase
      .from('store_zones')
      .select('*')
      .in('store_id', storeIds)
      .order('sort_order')
    zones = data ?? []
  }

  const zonesByStore = zones.reduce<Record<string, StoreZone[]>>((acc, z) => {
    if (!acc[z.store_id]) acc[z.store_id] = []
    acc[z.store_id].push(z)
    return acc
  }, {})

  const stores: ExportStore[] = (storesRes.data ?? []).map(s => ({
    ...s,
    zones: zonesByStore[s.id] ?? [],
  }))

  return {
    id: householdRes.data.id,
    name: householdRes.data.name,
    invite_code: householdRes.data.invite_code,
    created_at: householdRes.data.created_at,
    members: (membersRes.data ?? []).map(m => ({
      user_id: m.user_id,
      nickname: m.nickname,
      email: m.email,
      joined_at: m.joined_at,
    })),
    fridge_items: fridgeRes.data ?? [],
    shopping_list_items: shoppingRes.data ?? [],
    shopping_history: historyRes.data ?? [],
    stores,
    product_locations: locationsRes.data ?? [],
  }
}

export const exportService = {
  async exportAll(): Promise<ExportPayload> {
    const {data: {user}, error: authError} = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Brak zalogowanego użytkownika.')

    const [profile, householdIds] = await Promise.all([
      getProfile(user.id),
      getHouseholdIds(user.id),
    ])

    const householdsRaw = await Promise.all(householdIds.map(exportHousehold))
    const households = householdsRaw.filter((h): h is ExportHousehold => h !== null)

    return {
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        user_metadata: user.user_metadata ?? {},
        app_metadata: user.app_metadata ?? {},
      },
      profile,
      households,
    }
  },
}