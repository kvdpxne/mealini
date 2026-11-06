export interface NameableUser {
  email?: string | null
  nickname?: string | null
  first_name?: string | null
  last_name?: string | null
}

/**
 * Nazwa do wyświetlania w UI (listy członków, nagłówek, powitania).
 * Priorytet: nickname → email → generyczny fallback.
 */
export function displayName(user: NameableUser | null | undefined): string {
  if (!user) return 'Użytkownik'
  const nick = user.nickname?.trim()
  if (nick) return nick
  const email = user.email?.trim()
  if (email) return email
  return 'Użytkownik'
}

/**
 * Nazwa do korespondencji e-mail ("Szanowna Pani Anno", "Cześć Anna").
 * Priorytet: "First Last" → displayName (nickname → email).
 */
export function correspondenceName(user: NameableUser | null | undefined): string {
  if (!user) return 'Użytkowniku'
  const first = user.first_name?.trim()
  const last = user.last_name?.trim()
  const full = [first, last].filter(Boolean).join(' ').trim()
  if (full) return full
  return displayName(user)
}