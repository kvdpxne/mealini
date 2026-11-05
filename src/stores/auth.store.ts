import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {Session, User} from '@supabase/supabase-js'
import {authService} from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const householdId = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const user = computed<User | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => session.value !== null)

  async function initialize() {
    if (initialized.value) return

    session.value = await authService.getSession()
    if (session.value) {
      householdId.value = await authService.getCurrentUserHouseholdId()
    }

    authService.onAuthStateChange(async (newSession) => {
      session.value = newSession
      householdId.value = newSession
        ? await authService.getCurrentUserHouseholdId()
        : null
    })

    initialized.value = true
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      const newSession = await authService.signIn(email, password)
      session.value = newSession
      householdId.value = await authService.getCurrentUserHouseholdId()
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string) {
    loading.value = true
    try {
      const newSession = await authService.signUp(email, password)
      session.value = newSession
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await authService.signOut()
    session.value = null
    householdId.value = null
  }

  async function refreshHouseholdId() {
    householdId.value = await authService.getCurrentUserHouseholdId()
  }

  return {
    session, user, householdId, initialized, loading,
    isAuthenticated,
    initialize, signIn, signUp, signOut, refreshHouseholdId,
  }
})