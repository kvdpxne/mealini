export type ShareMethod = 'web-share' | 'clipboard' | 'none'

export function detectShareMethod(): ShareMethod {
  if (typeof navigator === 'undefined') return 'none'
  if (typeof navigator.share === 'function') return 'web-share'
  if (typeof navigator.clipboard?.writeText === 'function') return 'clipboard'
  return 'none'
}

export interface ShareResult {
  ok: boolean
  method: ShareMethod
  /** True, gdy użytkownik anulował natywny share sheet. */
  cancelled?: boolean
}

/**
 * Udostępnia tekst przez Web Share API, z fallbackiem do schowka.
 * Rzuca wyjątek tylko przy realnym błędzie (np. brak uprawnień do schowka).
 */
export async function shareText(text: string, title: string): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({title, text})
      return {ok: true, method: 'web-share'}
    } catch (e) {
      // AbortError = użytkownik anulował – nie traktujemy jako błąd
      if (e instanceof Error && e.name === 'AbortError') {
        return {ok: false, method: 'web-share', cancelled: true}
      }
      // Inny błąd Web Share (np. brak uprawnień) → fallback do schowka
    }
  }

  if (typeof navigator.clipboard?.writeText === 'function') {
    await navigator.clipboard.writeText(text)
    return {ok: true, method: 'clipboard'}
  }

  throw new Error('Ta przeglądarka nie obsługuje udostępniania ani schowka.')
}