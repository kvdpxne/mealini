export interface FridgeItem {
  id: string
  household_id: string
  name: string
  quantity: number
  unit: string
  expiry_date: string | null
  category: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  household_id: string
  name: string
  is_bought: boolean
  created_by: string | null
  created_at: string
}

export interface Household {
  id: string
  name: string
  created_at: string
}

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  nickname: string | null
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  household_id: string
  name: string
  map_path: string | null
  created_at: string
}

export interface StoreZone {
  id: string
  store_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface ProductLocation {
  id: string
  household_id: string
  store_id: string
  zone_id: string
  product_name_normalized: string
  created_at: string
}