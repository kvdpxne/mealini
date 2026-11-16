import {supabase} from '@/lib/supabaseClient'
import {compressItemPhoto} from '@/lib/imageCompression'

const BUCKET = 'item-photos'

export type ItemType = 'fridge' | 'shopping'

function buildPath(
  householdId: string,
  itemType: ItemType,
  itemId: string,
  ext = 'webp',
): string {
  return `${householdId}/${itemType}/${itemId}/${Date.now()}.${ext}`
}

export const itemPhotoService = {
  /**
   * Kompresuje plik, wgrywa do Storage i zwraca ścieżkę.
   * Jeśli item miał już zdjęcie, stare zostanie usunięte po sukcesie.
   */
  async upload(
    householdId: string,
    itemType: ItemType,
    itemId: string,
    file: File,
    oldPath: string | null,
  ): Promise<string> {
    const compressed = await compressItemPhoto(file)
    const path = buildPath(householdId, itemType, itemId)

    const {error} = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed.file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp',
      })

    if (error) throw new Error(`Nie udało się wgrać zdjęcia: ${error.message}`)

    // Stare zdjęcie usuwamy po sukcesie – jeśli padnie, zostaje osierocone
    if (oldPath && oldPath !== path) {
      await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {
      })
    }

    return path
  },

  async remove(path: string): Promise<void> {
    const {error} = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new Error(`Nie udało się usunąć zdjęcia: ${error.message}`)
  },

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
    const {data, error} = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn)
    if (error || !data) return null
    return data.signedUrl
  },
}