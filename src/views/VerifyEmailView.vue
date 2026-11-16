<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {LogOut, Mail, RefreshCw} from 'lucide-vue-next'
import {useAuthStore} from '@/stores/auth.store'
import {authService} from '@/services/auth.service'
import {useAsyncAction} from '@/composables/useAsyncAction'

const authStore = useAuthStore()
const router = useRouter()
const {run} = useAsyncAction()

const email = ref(authStore.user?.email ?? '')
const resending = ref(false)
const sent = ref(false)

async function handleResend() {
  if (!email.value) return
  resending.value = true
  await run(async () => {
    await authService.resendVerification(email.value)
    sent.value = true
    return true as const
  }, {success: 'Link weryfikacyjny wysłany ponownie'})
  resending.value = false
}

async function handleLogout() {
  await authStore.signOut()
  await router.push('/login')
}

onMounted(() => {
  // Sprawdzamy co 5 s, czy e-mail został potwierdzony w innej karcie
  const interval = setInterval(() => {
    if (authStore.user?.email_confirmed_at) {
      clearInterval(interval)
      router.push('/')
    }
  }, 5000)
  return () => clearInterval(interval)
})
</script>

<template>
  <div class="verify-view">
    <div class="card">
      <Mail :size="40" class="icon"/>
      <h1>Potwierdź swój adres e-mail</h1>
      <p class="hint">
        Wysłaliśmy link weryfikacyjny na <strong>{{ email }}</strong>.
        Kliknij w niego, aby aktywować konto. Jeśli nie widzisz wiadomości,
        sprawdź folder spam.
      </p>
      <p v-if="sent" class="success">Link został wysłany ponownie.</p>
      <div class="actions">
        <button class="primary" :disabled="resending" @click="handleResend">
          <RefreshCw :size="16"/>
          <span>{{ resending ? 'Wysyłanie...' : 'Wyślij ponownie' }}</span>
        </button>
        <button class="secondary" @click="handleLogout">
          <LogOut :size="16"/>
          <span>Wyloguj</span>
        </button>
      </div>
      <p class="note">
        Zmiana adresu e-mail jest możliwa po zalogowaniu w ustawieniach konta,
        ale dopiero po potwierdzeniu obecnego adresu.
      </p>
    </div>
  </div>
</template>

<style scoped>
.verify-view {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.card {
  max-width: 440px;
  width: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.icon {
  color: #0a7;
}

h1 {
  margin: 0;
  font-size: 1.35rem;
}

.hint {
  font-size: 0.9rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.6;
}

.success {
  color: #15803d;
  font-size: 0.85rem;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}

.primary, .secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  border: 1px solid transparent;
}

.primary {
  background: #0a7;
  color: #fff;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
}

.secondary:hover {
  background: #f3f4f6;
}

.note {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.5rem 0 0;
  line-height: 1.45;
}
</style>