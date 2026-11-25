import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {supabase} from '@/lib/supabaseClient'
import type {AuthChangeEvent, Session, User} from '@supabase/supabase-js'
import {authService} from '@/services/auth.service'
import {setStorageUser} from '@/lib/userScopedStorage'
import {teardownPersistedState} from '@/lib/sessionTeardown'

export type SessionEndReason = 'voluntary' | 'expired' | null

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const householdId = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)
  const sessionEndedReason = ref<SessionEndReason>(null)
  const lastVoluntarySignOutAt = ref<number | null>(null)
  const lastSignedInUserId = ref<string | null>(null)

  const user = computed<User | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => session.value !== null)

  async function initialize() {
    if (initialized.value) return

    session.value = await authService.getSession()
    if (session.value) {
      setStorageUser(session.value.user.id)
      lastSignedInUserId.value = session.value.user.id
      householdId.value = await authService.getCurrentUserHouseholdId()
    } else {
      setStorageUser(null)
    }

    authService.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      session.value = newSession
      householdId.value = newSession
        ? await authService.getCurrentUserHouseholdId()
        : null

      if (event === 'SIGNED_OUT') {
        const prevUser = lastSignedInUserId.value
        const at = lastVoluntarySignOutAt.value
        const isVoluntary = at !== null && Date.now() - at < 3000
        sessionEndedReason.value = isVoluntary ? 'voluntary' : 'expired'

        // Teardown – kolejność: reset (przez scoped key byłego usera),
        // jawny removeItem, dopiero potem scope null.
        teardownPersistedState(prevUser)

        lastSignedInUserId.value = null
        setStorageUser(null)
      } else if (newSession) {
        setStorageUser(newSession.user.id)
        lastSignedInUserId.value = newSession.user.id
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

  async function signInWithGoogle() {
    loading.value = true
    try {
      await authService.signInWithGoogle()
      // Przekierowanie następuje po stronie przeglądarki (window.location),
      // więc dalszy kod się nie wykona w tej karcie.
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
    // NIE czyścimy lastSignedInUserId tutaj – listener SIGNED_OUT potrzebuje
    // go do wyczyszczenia kluczy. Wyczyścimy dopiero po teardownie.
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

  async function refreshSession() {
    const {data, error} = await supabase.auth.refreshSession()
    if (!error && data.session) {
      session.value = data.session
    }
  }

  async function reauthenticate() {
    loading.value = true
    try {
      await authService.reauthenticate()
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    loading.value = true
    try {
      await authService.resetPassword(email)
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(
    newPassword: string,
    opts: { nonce?: string; currentPassword?: string } = {},
  ) {
    loading.value = true
    try {
      await authService.updatePassword(newPassword, opts)
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

  async function deleteAccount() {
    loading.value = true
    try {
      await authService.deleteAccount()
    } finally {
      // Po delete user już nie istnieje, signOut może zwrócić błąd,
      // ale i tak czyścimy lokalną sesję i stan.
      try {
        await authService.signOut()
      } catch {
        // świadomie ignorujemy, konto jest usunięte, liczy się cleanup
      }
      session.value = null
      householdId.value = null
      loading.value = false
    }
  }

  return {
    session, user, householdId, initialized, loading,
    isAuthenticated, sessionEndedReason,
    initialize, signIn, signInWithGoogle, signUp, signOut,
    refreshHouseholdId, refreshSession,
    reauthenticate, resetPassword, updatePassword, updateEmail,
    clearSessionEndedReason, deleteAccount
  }
})