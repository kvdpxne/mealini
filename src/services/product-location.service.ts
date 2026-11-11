import {supabase} from '@/lib/supabaseClient'
import type {ProductLocation} from '@/types/database.types'
import {normalizeName} from '@/lib/validation'

export const productLocationService = {
  async listForStore(storeId: string): Promise<ProductLocation[]> {
    const {data, error} = await supabase
      .from('product_locations')
      .select('*')
      .eq('store_id', storeId)
    if (error) throw new Error(`Nie udało się pobrać przypisań: ${error.message}`)
    return data ?? []
  },

  async setLocation(
    householdId: string,
    storeId: string,
    productName: string,
    zoneId: string | null,
  ): Promise<void> {
    const normalized = normalizeName(productName)
    if (!normalized) throw new Error('Nazwa produktu jest pusta.')

    if (zoneId === null) {
      const {error} = await supabase
        .from('product_locations')
        .delete()
        .eq('store_id', storeId)
        .eq('product_name_normalized', normalized)
      if (error) throw new Error(`Nie udało się usunąć przypisania: ${error.message}`)
      return
    }

    const {error} = await supabase.from('product_locations').upsert({
      household_id: householdId,
      store_id: storeId,
      zone_id: zoneId,
      product_name_normalized: normalized,
    }, {
      onConflict: 'store_id,product_name_normalized'
    })

    if (error) {
      if (error.code === '23503') {
        // FK violation = bug klienta. Nie pokazujemy surowego komunikatu
        // Postgresa użytkownikowi, ale logujemy pełne szczegóły.
        console.error('[product_locations] FK violation', {
          householdId,
          storeId,
          zoneId,
          productName,
          error,
        })
        throw new Error('Dane są niespójne. Odśwież stronę i spróbuj ponownie.')
      }
      throw new Error(`Nie udało się zapisać przypisania: ${error.message}`)
    }
  }
}