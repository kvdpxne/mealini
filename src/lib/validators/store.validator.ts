import {LIMITS} from '@/lib/validation'
import {assertName} from './common'

export function validateStoreName(name: string): string {
  return assertName(name, LIMITS.storeName, 'Nazwa sklepu')
}

export function validateZoneName(name: string): string {
  return assertName(name, LIMITS.storeZoneName, 'Nazwa strefy')
}

/** Walidacja pliku mapy – typ MIME i rozmiar (5 MB). */
export function validateMapFile(file: File): void {
  const MAX_SIZE = 5 * 1024 * 1024
  const ALLOWED_TYPES = /^image\/(png|jpeg|webp|svg\+xml)$/

  if (file.size > MAX_SIZE) {
    throw new Error('Plik mapy jest za duży (max 5 MB).')
  }
  if (!ALLOWED_TYPES.test(file.type)) {
    throw new Error('Dozwolone formaty mapy: PNG, JPEG, WebP, SVG.')
  }
}