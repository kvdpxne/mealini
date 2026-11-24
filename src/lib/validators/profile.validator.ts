import {LIMITS} from '@/lib/validation'
import {assertOptionalName} from './common'
import {isValidAvatarId} from '@/lib/avatars'

export interface ProfileInput {
  first_name?: string | null
  last_name?: string | null
  nickname?: string | null
  avatar_id?: string | null
}

export interface ValidatedProfileInput {
  first_name: string | null
  last_name: string | null
  nickname: string | null
  avatar_id: string | null
}

function validateAvatarId(id: string | null | undefined): string | null {
  if (id == null) return null
  const trimmed = id.trim()
  if (!trimmed) return null
  if (!isValidAvatarId(trimmed)) {
    throw new Error('Nieprawidłowy avatar.')
  }
  return trimmed
}

export function validateProfileInput(input: ProfileInput): ValidatedProfileInput {
  return {
    first_name: assertOptionalName(input.first_name, LIMITS.profileFirstName, 'Imię'),
    last_name: assertOptionalName(input.last_name, LIMITS.profileLastName, 'Nazwisko'),
    nickname: assertOptionalName(input.nickname, LIMITS.profileNickname, 'Nickname'),
    avatar_id: validateAvatarId(input.avatar_id),
  }
}