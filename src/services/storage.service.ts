import {supabase} from '@/lib/supabaseClient'

const BUCKET = 'store-maps'

export const storageService = {
  async uploadStoreMap(
    householdId: string,
    storeId: string,
    file: File,
  ): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const path = `${householdId}/${storeId}/${Date.now()}.${ext}`
    const {error} = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {cacheControl: '3600', upsert: false})
    if (error) throw new Error(`Nie udało się wgrać mapy: ${error.message}`)
    return path
  },

  async deleteStoreMap(path: string): Promise<void> {
    const {error} = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new Error(`Nie udało się usunąć mapy: ${error.message}`)
  },

  async getSignedUrl(path: string, expiresIn = 60 * 60 * 24): Promise<string | null> {
    const {data, error} = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn)
    if (error || !data) return null
    return data.signedUrl
  },
}