<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const localError = ref<string | null>(null)
const info = ref<string | null>(null)

async function handleSubmit() {
  localError.value = null
  info.value = null
  try {
    await authStore.signUp(email.value, password.value)
    if (authStore.session) {
      await router.push('/onboarding')
    } else {
      info.value = 'Sprawdź skrzynkę email, aby potwierdzić konto.'
    }
  } catch (e) {
    localError.value = e instanceof Error ? e.message : 'Błąd rejestracji'
  }
}
</script>

<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <h2>Utwórz konto</h2>
    <label>
      Email
      <input v-model="email" type="email" required autocomplete="email"/>
    </label>
    <label>
      Hasło (min. 6 znaków)
      <input v-model="password" type="password" required minlength="6" autocomplete="new-password"/>
    </label>
    <p v-if="localError" class="error">{{ localError }}</p>
    <p v-if="info" class="info">{{ info }}</p>
    <button type="submit" :disabled="authStore.loading">
      {{ authStore.loading ? 'Tworzenie...' : 'Zarejestruj się' }}
    </button>
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

.info {
  color: #060;
  font-size: 0.85rem;
}
</style>