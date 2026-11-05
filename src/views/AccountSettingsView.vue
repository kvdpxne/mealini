<script setup lang="ts">
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth.store'
import {useToastStore} from '@/stores/toast.store'

const authStore = useAuthStore()
const toast = useToastStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref<string | null>(null)
const passwordLoading = ref(false)

async function handlePasswordChange() {
  passwordError.value = null
  if (newPassword.value.length < 6) {
    passwordError.value = 'Nowe hasło musi mieć co najmniej 6 znaków.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Nowe hasła nie są identyczne.'
    return
  }
  passwordLoading.value = true
  try {
    await authStore.signIn(authStore.user!.email!, currentPassword.value)
    await authStore.updatePassword(newPassword.value)
    toast.show('Hasło zostało zmienione.', 'success')
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    passwordError.value = e instanceof Error ? e.message : 'Błąd zmiany hasła'
  } finally {
    passwordLoading.value = false
  }
}

const newEmail = ref('')
const emailError = ref<string | null>(null)
const emailLoading = ref(false)

async function handleEmailChange() {
  emailError.value = null
  if (!newEmail.value.trim()) return
  emailLoading.value = true
  try {
    await authStore.updateEmail(newEmail.value.trim())
    toast.show('Wysłaliśmy linki potwierdzające na stary i nowy adres e-mail.', 'info', 6000)
    newEmail.value = ''
  } catch (e) {
    emailError.value = e instanceof Error ? e.message : 'Błąd zmiany e-maila'
  } finally {
    emailLoading.value = false
  }
}
</script>

<template>
  <div class="settings-view">
    <h1>Ustawienia konta</h1>

    <section class="card">
      <h2>Zmiana hasła</h2>
      <form @submit.prevent="handlePasswordChange">
        <label>
          Obecne hasło
          <input v-model="currentPassword" type="password" required autocomplete="current-password"/>
        </label>
        <label>
          Nowe hasło
          <input v-model="newPassword" type="password" required minlength="6" autocomplete="new-password"/>
        </label>
        <label>
          Potwierdź nowe hasło
          <input v-model="confirmPassword" type="password" required minlength="6" autocomplete="new-password"/>
        </label>
        <p v-if="passwordError" class="error">{{ passwordError }}</p>
        <button type="submit" :disabled="passwordLoading">
          {{ passwordLoading ? 'Zmienianie...' : 'Zmień hasło' }}
        </button>
      </form>
    </section>

    <section class="card">
      <h2>Zmiana adresu e-mail</h2>
      <p class="current">Obecny adres: <strong>{{ authStore.user?.email }}</strong></p>
      <form @submit.prevent="handleEmailChange">
        <label>
          Nowy adres e-mail
          <input v-model="newEmail" type="email" required autocomplete="email"/>
        </label>
        <p v-if="emailError" class="error">{{ emailError }}</p>
        <button type="submit" :disabled="emailLoading">
          {{ emailLoading ? 'Wysyłanie...' : 'Zmień e-mail' }}
        </button>
        <p class="hint">
          Ze względów bezpieczeństwa zmiana wymaga potwierdzenia poprzez kliknięcie linków
          wysłanych na <strong>stary i nowy</strong> adres e-mail.
        </p>
      </form>
    </section>
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 520px;
  margin: 0 auto;
}

.settings-view h1 {
  margin: 0;
}

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
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.current {
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
  color: #4b5563;
}
</style>