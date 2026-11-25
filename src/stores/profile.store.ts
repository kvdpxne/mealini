import {defineStore} from 'pinia'
import {ref, watch} from 'vue'
import {profileService} from '@/services/profile.service'
import type {ProfileInput} from '@/lib/validators/profile.validator'
import type {UserProfile} from '@/types/database.types'
import {useAuthStore} from './auth.store'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  async function load() {
    if (!authStore.user) {
      profile.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      profile.value = await profileService.getProfile(authStore.user.id)

      // OAuth seed: tylko dla nowych kont (profil pusty) i tylko raz.
      // Sprawdzamy, czy WSZYSTKIE pola tekstowe są puste – jeśli użytkownik
      // cokolwiek ustawił, nie ruszamy.
      const isBlank =
        !profile.value ||
        (profile.value.first_name == null &&
          profile.value.last_name == null &&
          profile.value.nickname == null)

      const isOAuth = authStore.user.app_metadata?.provider !== 'email'
      if (isBlank && isOAuth) {
        const seeded = await profileService.seedFromOAuth(authStore.user.id)
        if (seeded) profile.value = seeded
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function update(updates: ProfileInput) {
    if (!authStore.user) return
    profile.value = await profileService.updateProfile(authStore.user.id, updates)
  }

  watch(
    () => authStore.user?.id,
    (id) => {
      if (id) load()
      else profile.value = null
    },
    {immediate: true},
  )

  return {profile, loading, error, load, update}
})