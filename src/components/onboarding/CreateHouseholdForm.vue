<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useHouseholdStore} from '@/stores/household.store'

const householdStore = useHouseholdStore()
const router = useRouter()
const name = ref('')

async function handleSubmit() {
  try {
    await householdStore.create(name.value.trim() || 'Moje gospodarstwo')
    await router.push('/')
  } catch {
    // błąd jest w store
  }
}
</script>

<template>
  <form class="card" @submit.prevent="handleSubmit">
    <h3>Utwórz nowe gospodarstwo</h3>
    <label>
      Nazwa gospodarstwa
      <input v-model="name" type="text" placeholder="np. Dom"/>
    </label>
    <p v-if="householdStore.error" class="error">{{ householdStore.error }}</p>
    <button type="submit" :disabled="householdStore.loading">
      {{ householdStore.loading ? 'Tworzenie...' : 'Utwórz' }}
    </button>
  </form>
</template>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.card input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.card button {
  padding: 0.6rem;
  cursor: pointer;
}

.error {
  color: #c00;
  font-size: 0.85rem;
}
</style>