/**
 * Auto-discovery plików z src/assets/avatars/.
 * Dodanie pliku (svg/png/jpg/webp) → pojawia się w pickerze.
 * Nazwa pliku (bez rozszerzenia) to `id` i podstawa `label`.
 */
const modules = import.meta.glob<string>(
  '/src/assets/avatars/*.{svg,png,jpg,jpeg,webp}',
  {eager: true, query: '?url', import: 'default'},
)

export interface AvatarOption {
  id: string
  url: string
  label: string
}

function extractId(path: string): string {
  const filename = path.split('/').pop() ?? ''
  return filename.replace(/\.(svg|png|jpe?g|webp)$/i, '')
}

function makeLabel(id: string): string {
  return id
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const AVATARS: AvatarOption[] = Object.entries(modules)
  .map(([path, url]) => {
    const id = extractId(path)
    return {id, url, label: makeLabel(id)}
  })
  .sort((a, b) => a.label.localeCompare(b.label, 'pl'))

const urlById = new Map(AVATARS.map(a => [a.id, a.url]))

export function getAvatarUrl(id: string | null | undefined): string | null {
  if (!id) return null
  return urlById.get(id) ?? null
}

export function isValidAvatarId(id: unknown): id is string {
  return typeof id === 'string' && urlById.has(id)
}