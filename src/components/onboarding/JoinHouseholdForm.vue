<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useHouseholdStore} from '@/stores/household.store'

const householdStore = useHouseholdStore()
const router = useRouter()
const code = ref('')

async function handleSubmit() {
  try {
    await householdStore.join(code.value)
    await router.push('/')
  } catch {
    // błąd jest w store
  }
}
</script>

<template>
  <form class="card" @submit.prevent="handleSubmit">
    <h3>Dołącz do istniejącego</h3>
    <label>
      Kod zaproszenia
      <input v-model="code" type="text" placeholder="np. a1b2c3d4" required/>
    </label>
    <p v-if="householdStore.error" class="error">{{ householdStore.error }}</p>
    <button type="submit" :disabled="householdStore.loading">
      {{ householdStore.loading ? 'Dołączanie...' : 'Dołącz' }}
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