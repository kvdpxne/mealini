import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {type ActiveSession, sessionService} from '@/services/session.service'
import {useAuthStore} from '@/stores/auth.store'

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<ActiveSession[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  /** ID bieżącej sesji wyciągamy z JWT (claim session_id). */
  const currentSessionId = computed(() => {
    const token = authStore.session?.access_token
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return (payload.session_id as string) ?? null
    } catch {
      return null
    }
  })

  const otherSessions = computed(() =>
    sessions.value.filter(s => s.id !== currentSessionId.value),
  )

  async function fetchSessions() {
    loading.value = true
    error.value = null
    try {
      sessions.value = await sessionService.list()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function revoke(sessionId: string) {
    await sessionService.revoke(sessionId)
    sessions.value = sessions.value.filter(s => s.id !== sessionId)
  }

  async function signOutOthers() {
    await sessionService.signOutOthers()
    sessions.value = sessions.value.filter(s => s.id === currentSessionId.value)
  }

  function clear() {
    sessions.value = []
    error.value = null
  }

  return {
    sessions, loading, error, currentSessionId, otherSessions,
    fetchSessions, revoke, signOutOthers, clear,
  }
})