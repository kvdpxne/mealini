<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAsyncAction } from '@/composables/useAsyncAction'

const authStore = useAuthStore()
const { run } = useAsyncAction()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const otp = ref('')
const error = ref<string | null>(null)
const needsReauth = ref(false)
const needsCurrentPassword = ref(false)

function reset() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  otp.value = ''
  needsReauth.value = false
  needsCurrentPassword.value = false
  error.value = null
}

function classifyError(e: unknown): 'reauth' | 'current_password' | 'other' {
  if (!(e instanceof Error)) return 'other'
  const msg = e.message.toLowerCase()
  if (msg.includes('reauthentication') || msg.includes('reauthenticate')) return 'reauth'
  // Supabase zwraca "current password required" lub podobny wariant
  if (msg.includes('current password') || msg.includes('current_password')) return 'current_password'
  return 'other'
}

async function handleSubmit() {
  error.value = null

  if (newPassword.value.length < 6) {
    error.value = 'Nowe hasło musi mieć co najmniej 6 znaków.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Nowe hasła nie są identyczne.'
    return
  }
  if (needsReauth.value && !otp.value.trim()) {
    error.value = 'Wpisz kod z e-maila.'
    return
  }
  if (needsCurrentPassword.value && !currentPassword.value) {
    error.value = 'Wpisz obecne hasło.'
    return
  }

  try {
    await run(async () => {
      // W normalnym trybie weryfikujemy hasło przez signIn – daje czytelny błąd
      if (!needsReauth.value && !needsCurrentPassword.value) {
        await authStore.signIn(authStore.user!.email!, currentPassword.value)
      }
      await authStore.updatePassword(newPassword.value, {
        nonce: needsReauth.value ? otp.value.trim() : undefined,
        currentPassword: needsCurrentPassword.value ? currentPassword.value : undefined,
      })
      return true as const
    }, { success: 'Hasło zostało zmienione' })
    reset()
  } catch (e) {
    const kind = classifyError(e)

    if (kind === 'reauth' && !needsReauth.value) {
      needsReauth.value = true
      needsCurrentPassword.value = false
      otp.value = ''
      try {
        await authStore.reauthenticate()
        error.value = 'Wysłaliśmy kod na Twój e-mail. Wpisz go poniżej, aby dokończyć zmianę hasła.'
      } catch (reauthErr) {
        error.value = reauthErr instanceof Error ? reauthErr.message : 'Nie udało się wysłać kodu.'
        needsReauth.value = false
      }
      return
    }

    if (kind === 'current_password' && !needsCurrentPassword.value) {
      needsCurrentPassword.value = true
      needsReauth.value = false
      error.value = 'Ze względów bezpieczeństwa potwierdź zmianę obecnym hasłem.'
      return
    }

    error.value = e instanceof Error ? e.message : 'Nie udało się zmienić hasła'
  }
}
</script>

<template>
  <section class="card">
    <h2>Zmiana hasła</h2>
    <form @submit.prevent="handleSubmit">
      <label v-if="!needsReauth || needsCurrentPassword">
        Obecne hasło
        <input
          v-model="currentPassword"
          type="password"
          :required="!needsReauth || needsCurrentPassword"
          autocomplete="current-password"
        />
      </label>
      <label>
        Nowe hasło
        <input v-model="newPassword" type="password" required minlength="6" autocomplete="new-password" />
      </label>
      <label>
        Potwierdź nowe hasło
        <input v-model="confirmPassword" type="password" required minlength="6" autocomplete="new-password" />
      </label>

      <template v-if="needsReauth">
        <p class="hint">
          Ze względów bezpieczeństwa musisz potwierdzić zmianę kodem wysłanym na e-mail.
        </p>
        <label>
          Kod z e-maila
          <input v-model="otp" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="Wpisz kod" />
        </label>
      </template>

      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Przetwarzanie...' : needsReauth ? 'Potwierdź zmianę' : 'Zmień hasło' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #374151;
}

input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

button {
  padding: 0.55rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  align-self: flex-start;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #c00;
  font-size: 0.85rem;
  margin: 0;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.45;
}

.error {
  color: #c00;
  font-size: 0.85rem;
  margin: 0;
}
</style>