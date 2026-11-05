import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  householdService,
  type HouseholdDetails,
  type HouseholdMember,
} from '@/services/household.service'
import { useAuthStore } from './auth.store'

export const useHouseholdStore = defineStore('household', () => {
  const details = ref<HouseholdDetails | null>(null)
  const members = ref<HouseholdMember[]>([])
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

  async function fetchDetails(householdId: string) {
    loading.value = true
    error.value = null
    try {
      details.value = await householdService.getDetails(householdId)
      members.value = await householdService.getMembers(householdId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function rename(householdId: string, name: string) {
    await householdService.rename(householdId, name)
    if (details.value) details.value.name = name.trim()
  }

  async function regenerateCode(householdId: string): Promise<string> {
    const code = await householdService.regenerateInviteCode(householdId)
    if (details.value) details.value.invite_code = code
    return code
  }

  async function leave(householdId: string) {
    await householdService.leave(householdId)
    details.value = null
    members.value = []
    await useAuthStore().refreshHouseholdId()
  }

  return {
    details, members, loading, error,
    create, join, fetchInviteCode,
    fetchDetails, rename, regenerateCode, leave,
  }
})