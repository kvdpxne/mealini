<script setup lang="ts">
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import {storeToRefs} from 'pinia'
import {LogOut} from 'lucide-vue-next'
import {useHouseholdStore} from '@/stores/household.store'
import {useAuthStore} from '@/stores/auth.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'

const householdStore = useHouseholdStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const router = useRouter()
const {members} = storeToRefs(householdStore)
const {run} = useAsyncAction()

const isLastMember = computed(() => members.value.length <= 1)

async function handleLeave() {
  if (!authStore.householdId) return
  const message = isLastMember.value
    ? 'Opuszczasz ostatnie gospodarstwo – zostanie ono usunięte wraz z zawartością. Kontynuować?'
    : 'Na pewno chcesz opuścić gospodarstwo? Utracisz dostęp do jego lodówki i listy zakupów.'
  const ok = await confirm.ask(message, 'Opuść gospodarstwo')
  if (!ok) return
  const result = await run(async () => {
    await householdStore.leave(authStore.householdId!)
    return true as const
  }, {success: 'Opuszczono gospodarstwo'})
  if (result) await router.push('/onboarding')
}
</script>

<template>
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
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card.danger {
  border-color: #fecaca;
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
  line-height: 1.45;
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
</style>