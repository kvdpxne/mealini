<script setup lang="ts">
import {onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'
import {useHouseholdStore} from '@/stores/household.store'

const authStore = useAuthStore()
const householdStore = useHouseholdStore()
const router = useRouter()

onMounted(() => {
  if (authStore.householdId) {
    householdStore.fetchInviteCode(authStore.householdId)
  }
})

async function handleLogout() {
  await authStore.signOut()
  await router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="top">
      <div class="brand">🧊 Lodówka</div>
      <nav class="nav">
        <RouterLink to="/" active-class="active">Lodówka</RouterLink>
        <RouterLink to="/shopping" active-class="active">Zakupy</RouterLink>
      </nav>
      <button class="logout" @click="handleLogout">Wyloguj</button>
    </div>
    <div v-if="householdStore.inviteCode" class="invite">
      Kod zaproszenia: <code>{{ householdStore.inviteCode }}</code>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #1f2937;
  color: #fff;
  padding: 0.75rem 1.5rem;
}

.top {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.brand {
  font-weight: 600;
  font-size: 1.1rem;
}

.nav {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.nav a {
  color: #d1d5db;
  text-decoration: none;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.nav a.active, .nav a:hover {
  color: #fff;
  background: #374151;
}

.logout {
  background: transparent;
  border: 1px solid #6b7280;
  color: #fff;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.logout:hover {
  background: #374151;
}

.invite {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #d1d5db;
}

.invite code {
  color: #fbbf24;
  background: #374151;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
}

@media (max-width: 640px) {
  .app-header {
    padding: 0.6rem 1rem;
  }

  .brand {
    font-size: 1rem;
  }

  .nav a {
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
  }

  .logout {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>