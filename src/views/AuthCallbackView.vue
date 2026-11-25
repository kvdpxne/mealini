<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {Loader2} from 'lucide-vue-next'
import {useAuthStore} from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const error = ref<string | null>(null)

onMounted(async () => {
  // detectSessionInUrl w supabase-js już przetworzył token z URL-a
  // (implicit: #access_token=..., PKCE: ?code=...).
  // Czekamy tylko aż store złapie sesję.
  await authStore.initialize()

  // Dajemy chwilę na propagację sesji, jeśli initialize() nie zdążył
  let attempts = 0
  while (!authStore.session && attempts < 20) {
    await new Promise(r => setTimeout(r, 100))
    attempts++
  }

  if (!authStore.session) {
    error.value = 'Nie udało się dokończyć logowania. Spróbuj ponownie.'
    setTimeout(() => router.push('/login'), 3000)
    return
  }

  // Router guard sam zdecyduje: /onboarding (brak gospodarstwa) lub /
  await router.push('/')
})
</script>

<template>
  <div class="callback-view">
    <Loader2 v-if="!error" :size="32" class="spin"/>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else class="hint">Kończymy logowanie…</p>
  </div>
</template>

<style scoped>
.callback-view {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
  color: #0a7;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hint {
  color: #6b7280;
  font-size: 0.9rem;
}

.error {
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>