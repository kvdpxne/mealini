<script setup lang="ts">
import {ref, watch} from 'vue'
import {storeToRefs} from 'pinia'
import {useHouseholdStore} from '@/stores/household.store'
import {useAuthStore} from '@/stores/auth.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {LIMITS} from '@/lib/validation'

const householdStore = useHouseholdStore()
const authStore = useAuthStore()
const {details} = storeToRefs(householdStore)
const {run} = useAsyncAction()

const nameDraft = ref('')
const saving = ref(false)

watch(
  details,
  (d) => {
    if (d) nameDraft.value = d.name
  },
  {immediate: true},
)

async function handleSave() {
  if (!authStore.householdId || !nameDraft.value.trim()) return
  saving.value = true
  const result = await run(async () => {
    await householdStore.rename(authStore.householdId!, nameDraft.value)
    return true as const
  }, {success: 'Nazwa zmieniona'})
  saving.value = false
  if (!result && details.value) {
    nameDraft.value = details.value.name
  }
}
</script>

<template>
  <section class="card">
    <h2>Nazwa</h2>
    <form class="inline-form" @submit.prevent="handleSave">
      <input
        v-model="nameDraft"
        type="text"
        :maxlength="LIMITS.householdName"
        placeholder="Nazwa gospodarstwa"
        required
      />
      <button type="submit" :disabled="saving">
        {{ saving ? 'Zapisywanie...' : 'Zapisz' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  color: #111;
}

.inline-form {
  display: flex;
  gap: 0.5rem;
}

.inline-form input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.inline-form button {
  padding: 0.5rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.inline-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .inline-form {
    flex-direction: column;
  }
}
</style>