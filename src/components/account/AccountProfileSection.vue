<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {User} from 'lucide-vue-next'
import {useAuthStore} from '@/stores/auth.store'
import {useProfileStore} from '@/stores/profile.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {displayName} from '@/utils/displayName'
import {LIMITS} from '@/lib/validation'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const {run} = useAsyncAction()

const firstName = ref('')
const lastName = ref('')
const nickname = ref('')
const saving = ref(false)

watch(
  () => profileStore.profile,
  (p) => {
    if (!p) return
    firstName.value = p.first_name ?? ''
    lastName.value = p.last_name ?? ''
    nickname.value = p.nickname ?? ''
  },
  {immediate: true},
)

const previewName = computed(() =>
  displayName({nickname: nickname.value, email: authStore.user?.email}),
)

async function handleSave() {
  saving.value = true
  const result = await run(
    () =>
      profileStore.update({
        first_name: firstName.value,
        last_name: lastName.value,
        nickname: nickname.value,
      }),
    {success: 'Profil zaktualizowany'},
  )
  saving.value = false
  if (!result) {
    // Rollback przy błędzie – przywracamy stan z serwera
    const p = profileStore.profile
    if (p) {
      firstName.value = p.first_name ?? ''
      lastName.value = p.last_name ?? ''
      nickname.value = p.nickname ?? ''
    }
  }
}
</script>

<template>
  <section class="card">
    <h2>Profil</h2>
    <p class="hint">
      Nickname jest widoczny dla innych członków gospodarstwa. Imię i nazwisko
      będą używane wyłącznie w korespondencji e-mail.
    </p>
    <form @submit.prevent="handleSave">
      <label>
        Imię
        <input
          v-model="firstName"
          type="text"
          :maxlength="LIMITS.profileFirstName"
          autocomplete="given-name"
        />
      </label>
      <label>
        Nazwisko
        <input
          v-model="lastName"
          type="text"
          :maxlength="LIMITS.profileLastName"
          autocomplete="family-name"
        />
      </label>
      <label>
        Nickname
        <input
          v-model="nickname"
          type="text"
          :maxlength="LIMITS.profileNickname"
          placeholder="np. anka"
        />
      </label>
      <p class="preview">
        <User :size="14"/>
        <span>Tak widzą Cię inni: <strong>{{ previewName }}</strong></span>
      </p>
      <button type="submit" :disabled="saving">
        {{ saving ? 'Zapisywanie...' : 'Zapisz profil' }}
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
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.45;
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

.preview {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.preview strong {
  color: #111;
}
</style>