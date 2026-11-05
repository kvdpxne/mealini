<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'
import {useToastStore} from '@/stores/toast.store'

const authStore = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const password = ref('')
const confirm = ref('')
const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null
  if (password.value.length < 6) {
    error.value = 'Hasło musi mieć co najmniej 6 znaków.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Hasła nie są identyczne.'
    return
  }
  try {
    await authStore.updatePassword(password.value)
    toast.show('Hasło zostało zmienione. Możesz się zalogować.', 'success')
    await authStore.signOut() // czyścimy tymczasową sesję recovery
    await router.push('/login')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Błąd zmiany hasła'
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-form" @submit.prevent="handleSubmit">
      <h2>Ustaw nowe hasło</h2>
      <label>
        Nowe hasło
        <input v-model="password" type="password" required minlength="6" autocomplete="new-password" autofocus/>
      </label>
      <label>
        Potwierdź hasło
        <input v-model="confirm" type="password" required minlength="6" autocomplete="new-password"/>
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Zapisywanie...' : 'Zapisz nowe hasło' }}
      </button>
    </form>
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
</style>