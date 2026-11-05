import {defineStore} from 'pinia'
import {ref} from 'vue'
import {householdService} from '@/services/household.service'
import {useAuthStore} from './auth.store'

export const useHouseholdStore = defineStore('household', () => {
  const inviteCode = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function create(name: string): Promise<string> {
    loading.value = true
    error.value = null
    try {
      const id = await householdService.createHousehold(name)
      await useAuthStore().refreshHouseholdId()
      return id
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function join(code: string): Promise<string> {
    loading.value = true
    error.value = null
    try {
      const id = await householdService.joinHousehold(code)
      await useAuthStore().refreshHouseholdId()
      return id
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchInviteCode(householdId: string) {
    inviteCode.value = await householdService.getInviteCode(householdId)
  }

  return {inviteCode, loading, error, create, join, fetchInviteCode}
})