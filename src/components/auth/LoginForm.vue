<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const localError = ref<string | null>(null)

async function handleSubmit() {
  localError.value = null
  try {
    await authStore.signIn(email.value, password.value)
    await router.push('/')
  } catch (e) {
    localError.value = e instanceof Error ? e.message : 'Błąd logowania'
  }
}
</script>

<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <h2>Zaloguj się</h2>
    <label>
      Email
      <input v-model="email" type="email" required autocomplete="email" autofocus/>
    </label>
    <label>
      Hasło
      <input v-model="password" type="password" required autocomplete="current-password"/>
    </label>
    <p v-if="localError" class="error">{{ localError }}</p>
    <button type="submit" :disabled="authStore.loading">
      {{ authStore.loading ? 'Logowanie...' : 'Zaloguj' }}
    </button>
    <RouterLink to="/forgot-password" class="forgot">Nie pamiętam hasła</RouterLink>
  </form>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 320px;
}

.auth-form label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.auth-form input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.auth-form button {
  padding: 0.6rem;
  cursor: pointer;
}

.error {
  color: #c00;
  font-size: 0.85rem;
}

.forgot {
  font-size: 0.85rem;
  color: #0a7;
  text-align: center;
  margin-top: 0.25rem;
}
</style>