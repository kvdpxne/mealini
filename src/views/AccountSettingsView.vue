<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {RouterLink} from 'vue-router'
import {Home, User} from 'lucide-vue-next'
import {useAuthStore} from '@/stores/auth.store'
import {useToastStore} from '@/stores/toast.store'
import {useProfileStore} from '@/stores/profile.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {displayName} from '@/utils/displayName'
import {useUserPreferences} from '@/composables/useUserPreferences'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const {run} = useAsyncAction()
const toast = useToastStore()
const {preferences, set} = useUserPreferences()

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

const firstName = ref('')
const lastName = ref('')
const nickname = ref('')
const profileLoading = ref(false)

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

async function handleProfileSave() {
  profileLoading.value = true
  const result = await run(
    () =>
      profileStore.update({
        first_name: firstName.value,
        last_name: lastName.value,
        nickname: nickname.value,
      }),
    {success: 'Profil zaktualizowany'},
  )
  profileLoading.value = false
  if (!result) {
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
  <div class="settings-view">
    <h1>Ustawienia konta</h1>

    <RouterLink to="/household" class="household-link">
      <Home :size="16"/>
      <span>Przejdź do ustawień gospodarstwa</span>
    </RouterLink>

    <section class="card">
      <h2>Profil</h2>
      <p class="hint">
        Nickname jest widoczny dla innych członków gospodarstwa. Imię i nazwisko
        będą używane wyłącznie w korespondencji e-mail.
      </p>
      <form @submit.prevent="handleProfileSave">
        <label>
          Imię
          <input v-model="firstName" type="text" maxlength="50" autocomplete="given-name"/>
        </label>
        <label>
          Nazwisko
          <input v-model="lastName" type="text" maxlength="50" autocomplete="family-name"/>
        </label>
        <label>
          Nickname
          <input v-model="nickname" type="text" maxlength="30" placeholder="np. anka"/>
        </label>
        <p class="preview">
          <User :size="14"/>
          <span>Tak widzą Cię inni: <strong>{{ previewName }}</strong></span>
        </p>
        <button type="submit" :disabled="profileLoading">
          {{ profileLoading ? 'Zapisywanie...' : 'Zapisz profil' }}
        </button>
      </form>
    </section>

    <section class="card">
      <h2>Preferencje</h2>
      <div class="pref-row">
        <div class="pref-info">
          <div class="pref-label">Czyść pole po dodaniu</div>
          <p class="pref-hint">
            Po dodaniu produktu do lodówki lub listy zakupów pole formularza
            zostanie automatycznie wyczyszczone, żeby ułatwić szybkie dodawanie
            kolejnych pozycji. Wyłącz, jeśli chcesz zachować wpisaną treść.
          </p>
        </div>
        <ToggleSwitch
          :model-value="preferences.clearInputAfterAdd"
          @update:model-value="set('clearInputAfterAdd', $event)"
        >
          {{ preferences.clearInputAfterAdd ? 'Włączone' : 'Wyłączone' }}
        </ToggleSwitch>
      </div>
    </section>

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

.household-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.household-link:hover {
  background: #e5e7eb;
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

.pref-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.pref-info {
  flex: 1;
}

.pref-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #111;
  margin-bottom: 0.25rem;
}

.pref-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .pref-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>