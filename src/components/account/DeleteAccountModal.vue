<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {AlertTriangle, X} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useAuthStore} from '@/stores/auth.store'
import {useHouseholdStore} from '@/stores/household.store'
import {useAsyncAction} from '@/composables/useAsyncAction'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const authStore = useAuthStore()
const householdStore = useHouseholdStore()
const router = useRouter()
const {run} = useAsyncAction()

const {members} = storeToRefs(householdStore)

const confirmText = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

const isLastMember = computed(() => members.value.length <= 1)
const REQUIRED_PHRASE = 'USUŃ'

watch(
  () => props.visible,
  (v) => {
    if (v) {
      confirmText.value = ''
      error.value = null
    }
  },
)

async function handleDelete() {
  error.value = null
  if (confirmText.value !== REQUIRED_PHRASE) {
    error.value = `Wpisz dokładnie „${REQUIRED_PHRASE}”, aby potwierdzić.`
    return
  }

  submitting.value = true
  const result = await run(async () => {
    await authStore.deleteAccount()
    return true as const
  })

  if (result) {
    await router.push('/login')
    emit('close')
  } else {
    error.value = 'Nie udało się usunąć konta. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.'
  }
  submitting.value = false
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="emit('close')">
      <div class="dialog" role="dialog" aria-modal="true">
        <header class="dialog-head">
          <AlertTriangle :size="22" class="icon-danger"/>
          <h3>Usunąć konto?</h3>
          <button type="button" class="icon-btn" title="Zamknij" @click="emit('close')">
            <X :size="18"/>
          </button>
        </header>

        <div class="warning">
          <p><strong>Ta operacja jest nieodwracalna.</strong> Usuniemy:</p>
          <ul>
            <li>Twój profil (imię, nazwisko, nickname)</li>
            <li>Twój adres e-mail i dane logowania</li>
            <li>Twoje członkostwo we wszystkich gospodarstwach</li>
            <li v-if="isLastMember">
              <strong>Całe gospodarstwo</strong> wraz z lodówką, listą zakupów,
              historią, sklepami i strefami – jesteś jego ostatnim członkiem.
            </li>
            <li v-else>
              Produkty dodane przez Ciebie w gospodarstwie <strong>pozostaną</strong>
              (bez informacji o autorze).
            </li>
          </ul>
        </div>

        <label>
          Wpisz <code>{{ REQUIRED_PHRASE }}</code>, aby potwierdzić
          <input
            v-model="confirmText"
            type="text"
            autocomplete="off"
            :placeholder="REQUIRED_PHRASE"
            @keyup.enter="handleDelete"
          />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="actions">
          <button type="button" class="secondary" @click="emit('close')">Anuluj</button>
          <button
            type="button"
            class="danger"
            :disabled="confirmText !== REQUIRED_PHRASE || submitting"
            @click="handleDelete"
          >
            {{ submitting ? 'Usuwanie...' : 'Usuń konto na zawsze' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.dialog {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.dialog-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dialog-head h3 {
  margin: 0;
  flex: 1;
  font-size: 1.15rem;
  color: #b91c1c;
}

.icon-danger {
  color: #dc2626;
  flex-shrink: 0;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.warning {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: #7f1d1d;
}

.warning p {
  margin: 0 0 0.5rem;
}

.warning ul {
  margin: 0;
  padding-left: 1.25rem;
}

.warning li {
  margin: 0.15rem 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #374151;
}

label code {
  background: #f3f4f6;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.85em;
}

input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

input:focus {
  outline: 2px solid #dc2626;
  outline-offset: -1px;
  border-color: transparent;
}

.error {
  color: #b91c1c;
  font-size: 0.85rem;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.9rem;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
}

.secondary:hover {
  background: #f3f4f6;
}

.danger {
  background: #dc2626;
  color: #fff;
}

.danger:hover:not(:disabled) {
  background: #b91c1c;
}

.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>