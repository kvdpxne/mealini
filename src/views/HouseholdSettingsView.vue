<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {Check, Copy, LogOut, RefreshCw} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useHouseholdStore} from '@/stores/household.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import {formatRelativeExpiry} from '@/utils/date'

const householdStore = useHouseholdStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const router = useRouter()
const {details, members, error} = storeToRefs(householdStore)
const {run} = useAsyncAction()

const nameDraft = ref('')
const copied = ref(false)
const regenerating = ref(false)

const isLastMember = computed(() => members.value.length <= 1)

async function load() {
  if (authStore.householdId) {
    await householdStore.fetchDetails(authStore.householdId)
    if (details.value) nameDraft.value = details.value.name
  }
}

async function handleRename() {
  if (!authStore.householdId || !nameDraft.value.trim()) return
  await run(
    () => householdStore.rename(authStore.householdId!, nameDraft.value),
    {success: 'Nazwa zmieniona'},
  )
}

async function handleCopyCode() {
  if (!details.value) return
  try {
    await navigator.clipboard.writeText(details.value.invite_code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // fallback: pokaż alert
    alert(`Kod: ${details.value.invite_code}`)
  }
}

async function handleRegenerate() {
  if (!authStore.householdId) return
  const ok = await confirm.ask(
    'Stary kod przestanie działać. Kontynuować?',
    'Nowy kod zaproszenia',
  )
  if (!ok) return
  regenerating.value = true
  try {
    await run(
      () => householdStore.regenerateCode(authStore.householdId!),
      {success: 'Wygenerowano nowy kod'},
    )
  } finally {
    regenerating.value = false
  }
}

async function handleLeave() {
  if (!authStore.householdId) return
  const message = isLastMember.value
    ? 'Opuszczasz ostatnie gospodarstwo – zostanie ono usunięte wraz z zawartością. Kontynuować?'
    : 'Na pewno chcesz opuścić gospodarstwo? Utracisz dostęp do jego lodówki i listy zakupów.'
  const ok = await confirm.ask(message, 'Opuść gospodarstwo')
  if (!ok) return
  await run(
    () => householdStore.leave(authStore.householdId!),
    {success: 'Opuszczono gospodarstwo'},
  )
  await router.push('/onboarding')
}

onMounted(load)
</script>

<template>
  <div class="settings-page">
    <header class="page-head">
      <h1>Gospodarstwo domowe</h1>
      <p class="sub">Zarządzaj nazwą, kodem zaproszenia i członkami.</p>
    </header>

    <ErrorBanner v-if="error" :message="error" @dismiss="householdStore.error = null"/>

    <section class="card">
      <h2>Nazwa</h2>
      <form class="inline-form" @submit.prevent="handleRename">
        <input v-model="nameDraft" type="text" maxlength="60" placeholder="Nazwa gospodarstwa"/>
        <button type="submit">Zapisz</button>
      </form>
    </section>

    <section v-if="details" class="card">
      <h2>Kod zaproszenia</h2>
      <p class="hint">Przekaż ten kod partnerce, aby dołączyła do gospodarstwa.</p>
      <div class="invite-row">
        <code class="invite-code">{{ details.invite_code }}</code>
        <button class="icon-text" :title="copied ? 'Skopiowano' : 'Kopiuj'" @click="handleCopyCode">
          <Check v-if="copied" :size="16"/>
          <Copy v-else :size="16"/>
          <span>{{ copied ? 'Skopiowano' : 'Kopiuj' }}</span>
        </button>
        <button class="icon-text" :disabled="regenerating" @click="handleRegenerate">
          <RefreshCw :size="16"/>
          <span>Nowy kod</span>
        </button>
      </div>
    </section>

    <section class="card">
      <h2>Członkowie ({{ members.length }})</h2>
      <ul class="members">
        <li v-for="m in members" :key="m.user_id">
          <div class="member-main">
            <strong>{{ m.email }}</strong>
            <span v-if="m.user_id === authStore.user?.id" class="badge-you">Ty</span>
          </div>
          <span class="joined">dołączył(a) {{ formatRelativeExpiry(m.joined_at) }}</span>
        </li>
      </ul>
    </section>

    <section class="card danger">
      <h2>Strefa niebezpieczna</h2>
      <p class="hint">
        {{
          isLastMember
            ? 'Jesteś ostatnim członkiem. Opuszczenie usunie gospodarstwo wraz z całą zawartością.'
            : 'Po opuszczeniu utracisz dostęp do lodówki i listy zakupów tego gospodarstwa.'
        }}
      </p>
      <button class="danger-btn" @click="handleLeave">
        <LogOut :size="16"/>
        <span>Opuść gospodarstwo</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
}

.page-head h1 {
  margin: 0;
  font-size: 1.5rem;
}

.sub {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  color: #111;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.75rem;
}

.inline-form {
  display: flex;
  gap: 0.5rem;
}

.inline-form input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.inline-form button {
  padding: 0.5rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.invite-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.invite-code {
  font-family: ui-monospace, monospace;
  font-size: 1.1rem;
  background: #f3f4f6;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.icon-text:hover {
  background: #f3f4f6;
}

.icon-text:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.members {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.members li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.members li:last-child {
  border-bottom: none;
}

.member-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-you {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.joined {
  font-size: 0.8rem;
  color: #6b7280;
}

.card.danger {
  border-color: #fecaca;
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.danger-btn:hover {
  background: #b91c1c;
}

@media (max-width: 640px) {
  .card {
    padding: 1rem;
  }

  .inline-form {
    flex-direction: column;
  }

  .members li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
  }
}
</style>