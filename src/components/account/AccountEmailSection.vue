<script setup lang="ts">
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth.store'
import {useAsyncAction} from '@/composables/useAsyncAction'

const authStore = useAuthStore()
const {run} = useAsyncAction()

const newEmail = ref('')

async function handleSubmit() {
  if (!newEmail.value.trim()) return
  const result = await run(async () => {
    await authStore.updateEmail(newEmail.value.trim())
    return true as const
  }, {
    success: 'Wysłaliśmy linki potwierdzające na stary i nowy adres e-mail',
  })
  if (result) newEmail.value = ''
}
</script>

<template>
  <section class="card">
    <h2>Zmiana adresu e-mail</h2>
    <p class="current">
      Obecny adres: <strong>{{ authStore.user?.email }}</strong>
    </p>
    <form @submit.prevent="handleSubmit">
      <label>
        Nowy adres e-mail
        <input v-model="newEmail" type="email" required autocomplete="email"/>
      </label>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Wysyłanie...' : 'Zmień e-mail' }}
      </button>
      <p class="hint">
        Ze względów bezpieczeństwa zmiana wymaga potwierdzenia poprzez kliknięcie linków
        wysłanych na <strong>stary i nowy</strong> adres e-mail.
      </p>
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
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.current {
  font-size: 0.9rem;
  margin: 0 0 0.75rem;
  color: #4b5563;
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

.hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.45;
}
</style>