<script setup lang="ts">
import {ref} from 'vue'
import {RouterLink} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'

const authStore = useAuthStore()
const email = ref('')
const sent = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null
  try {
    await authStore.resetPassword(email.value)
    sent.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Błąd wysyłania'
  }
}
</script>

<template>
  <div class="auth-page">
    <form v-if="!sent" class="auth-form" @submit.prevent="handleSubmit">
      <h2>Resetowanie hasła</h2>
      <p class="hint">Podaj adres e-mail powiązany z kontem. Wyślemy link do ustawienia nowego hasła.</p>
      <label>
        E-mail
        <input v-model="email" type="email" required autocomplete="email" autofocus/>
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Wysyłanie...' : 'Wyślij link' }}
      </button>
      <RouterLink to="/login" class="back">← Wróć do logowania</RouterLink>
    </form>

    <div v-else class="auth-form">
      <h2>Sprawdź skrzynkę</h2>
      <p class="hint">
        Jeśli konto z adresem <strong>{{ email }}</strong> istnieje, wysłaliśmy na nie link do zresetowania hasła.
        Kliknij w niego, aby ustawić nowe hasło.
      </p>
      <RouterLink to="/login" class="back">← Wróć do logowania</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 360px;
  width: 100%;
}

.auth-form h2 {
  margin: 0;
}

.hint {
  font-size: 0.9rem;
  color: #4b5563;
  margin: 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

button {
  padding: 0.6rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
}

.error {
  color: #c00;
  font-size: 0.85rem;
}

.back {
  font-size: 0.85rem;
  color: #0a7;
  text-align: center;
  margin-top: 0.5rem;
}
</style>