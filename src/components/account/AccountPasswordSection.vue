<script setup lang="ts">
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth.store'
import {useAsyncAction} from '@/composables/useAsyncAction'

const authStore = useAuthStore()
const {run} = useAsyncAction()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)

function reset() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
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

  const result = await run(async () => {
    // Weryfikacja obecnego hasła przez ponowne logowanie
    await authStore.signIn(authStore.user!.email!, currentPassword.value)
    await authStore.updatePassword(newPassword.value)
    return true as const
  }, {success: 'Hasło zostało zmienione'})

  if (result) reset()
  else error.value = 'Nie udało się zmienić hasła'
}
</script>

<template>
  <section class="card">
    <h2>Zmiana hasła</h2>
    <form @submit.prevent="handleSubmit">
      <label>
        Obecne hasło
        <input v-model="currentPassword" type="password" required autocomplete="current-password"/>
      </label>
      <label>
        Nowe hasło
        <input
          v-model="newPassword"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
        />
      </label>
      <label>
        Potwierdź nowe hasło
        <input
          v-model="confirmPassword"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
        />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Zmienianie...' : 'Zmień hasło' }}
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
</style>