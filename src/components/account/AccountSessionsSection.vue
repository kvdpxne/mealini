<script setup lang="ts">
import {onMounted} from 'vue'
import {LogOut, Monitor, ShieldAlert, Smartphone} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useSessionsStore} from '@/stores/sessions.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {parseUserAgent} from '@/lib/userAgent'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const sessionsStore = useSessionsStore()
const confirm = useConfirmStore()
const {sessions, loading, error, currentSessionId, otherSessions} =
  storeToRefs(sessionsStore)
const {run} = useAsyncAction()

async function refresh() {
  await run(async () => {
    await sessionsStore.fetchSessions()
    return true as const
  })
}

async function handleRevoke(sessionId: string) {
  const ok = await confirm.ask(
    'Unieważnić tę sesję? Urządzenie zostanie wylogowane przy następnym odświeżeniu tokena.',
    'Wyloguj urządzenie',
  )
  if (!ok) return
  await run(async () => {
    await sessionsStore.revoke(sessionId)
    return true as const
  }, {success: 'Sesja unieważniona'})
}

async function handleSignOutOthers() {
  const ok = await confirm.ask(
    'Wylogować wszystkie inne urządzenia? Bieżąca sesja pozostanie aktywna.',
    'Wyloguj inne urządzenia',
  )
  if (!ok) return
  await run(async () => {
    await sessionsStore.signOutOthers()
    return true as const
  }, {success: 'Wylogowano inne urządzenia'})
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function sessionLabel(s: { user_agent: string | null }) {
  return parseUserAgent(s.user_agent)
}

onMounted(refresh)
</script>

<template>
  <section class="card">
    <header class="head">
      <h2>Aktywne sesje</h2>
      <button
        v-if="otherSessions.length > 0"
        class="secondary"
        :disabled="loading"
        @click="handleSignOutOthers"
      >
        <ShieldAlert :size="14"/>
        <span>Wyloguj inne urządzenia</span>
      </button>
    </header>

    <p class="hint">
      To urządzenia i przeglądarki, na których jesteś zalogowany(a). Jeśli nie
      rozpoznajesz którejś sesji, wyloguj ją i zmień hasło.
    </p>

    <ErrorBanner v-if="error" :message="error" @dismiss="sessionsStore.clear"/>

    <SkeletonList v-if="loading" :count="2"/>

    <ul v-else class="sessions">
      <li v-for="s in sessions" :key="s.id" class="session">
        <div class="icon">
          <component
            :is="sessionLabel(s).isMobile ? Smartphone : Monitor"
            :size="20"
          />
        </div>
        <div class="info">
          <div class="line">
            <strong>{{ sessionLabel(s).browser }} · {{ sessionLabel(s).os }}</strong>
            <span v-if="s.id === currentSessionId" class="badge">Ta sesja</span>
          </div>
          <div class="meta">
            <span v-if="s.ip">IP: {{ s.ip }}</span>
            <span>Ostatnia aktywność: {{ formatDate(s.updated_at) }}</span>
          </div>
        </div>
        <button
          v-if="s.id !== currentSessionId"
          class="icon-btn danger"
          title="Wyloguj tę sesję"
          :disabled="loading"
          @click="handleRevoke(s.id)"
        >
          <LogOut :size="16"/>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.head h2 {
  margin: 0;
  font-size: 1.1rem;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0.75rem 0 1rem;
  line-height: 1.5;
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover:not(:disabled) {
  background: #f3f4f6;
}

.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sessions {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.session {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.icon {
  color: #6b7280;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.line strong {
  font-size: 0.9rem;
  color: #111;
}

.badge {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #6b7280;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.4rem;
  border-radius: 4px;
}

.icon-btn.danger:hover:not(:disabled) {
  background: #fef2f2;
  color: #dc2626;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>