import {defineStore} from 'pinia'
import {ref, watch} from 'vue'
import {profileService, type ProfileUpdates} from '@/services/profile.service'
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
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function update(updates: ProfileUpdates) {
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