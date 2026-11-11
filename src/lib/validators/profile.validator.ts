import { LIMITS } from '@/lib/validation'
import { assertOptionalName } from './common'

export interface ProfileInput {
  first_name?: string | null
  last_name?: string | null
  nickname?: string | null
}

export interface ValidatedProfileInput {
  first_name: string | null
  last_name: string | null
  nickname: string | null
}

export function validateProfileInput(input: ProfileInput): ValidatedProfileInput {
  return {
    first_name: assertOptionalName(input.first_name, LIMITS.profileFirstName, 'Imię'),
    last_name: assertOptionalName(input.last_name, LIMITS.profileLastName, 'Nazwisko'),
    nickname: assertOptionalName(input.nickname, LIMITS.profileNickname, 'Nickname'),
  }
}