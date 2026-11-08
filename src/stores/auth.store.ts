import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {AuthChangeEvent, Session, User} from '@supabase/supabase-js'
import {authService} from '@/services/auth.service'

export type SessionEndReason = 'voluntary' | 'expired' | null

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const householdId = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const sessionEndedReason = ref<SessionEndReason>(null)
  const lastVoluntarySignOutAt = ref<number | null>(null)

  const user = computed<User | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => session.value !== null)

  async function initialize() {
    if (initialized.value) return

    session.value = await authService.getSession()
    if (session.value) {
      householdId.value = await authService.getCurrentUserHouseholdId()
    }

    authService.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      session.value = newSession
      householdId.value = newSession
        ? await authService.getCurrentUserHouseholdId()
        : null

      if (event === 'SIGNED_OUT') {
        const at = lastVoluntarySignOutAt.value
        const isVoluntary = at !== null && Date.now() - at < 3000
        sessionEndedReason.value = isVoluntary ? 'voluntary' : 'expired'
      }
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
    // Znacznik czasu – listener sprawdzi go, gdy przyjdzie SIGNED_OUT
    lastVoluntarySignOutAt.value = Date.now()
    loading.value = true
    try {
      await authService.signOut()
    } finally {
      session.value = null
      householdId.value = null
      loading.value = false
    }
  }

  function clearSessionEndedReason() {
    sessionEndedReason.value = null
  }

  async function refreshHouseholdId() {
    householdId.value = await authService.getCurrentUserHouseholdId()
  }

  async function resetPassword(email: string) {
    loading.value = true
    try {
      await authService.resetPassword(email)
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(newPassword: string) {
    loading.value = true
    try {
      await authService.updatePassword(newPassword)
    } finally {
      loading.value = false
    }
  }

  async function updateEmail(newEmail: string) {
    loading.value = true
    try {
      await authService.updateEmail(newEmail)
    } finally {
      loading.value = false
    }
  }

  return {
    session, user, householdId, initialized, loading,
    isAuthenticated, sessionEndedReason,
    initialize, signIn, signUp, signOut, refreshHouseholdId,
    resetPassword, updatePassword, updateEmail,
    clearSessionEndedReason
  }
})