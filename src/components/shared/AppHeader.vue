<script setup lang="ts">
import {LogOut, Refrigerator} from 'lucide-vue-next'
import {RouterLink, useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.signOut()
  await router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="inner">
      <RouterLink to="/" class="brand">
        <Refrigerator :size="22"/>
        <span>Mealini</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/" active-class="active">Lodówka</RouterLink>
        <RouterLink to="/shopping" active-class="active">Zakupy</RouterLink>
        <RouterLink to="/household" active-class="active">Dom</RouterLink>
        <RouterLink to="/account" active-class="active">Konto</RouterLink>
      </nav>

      <div class="user">
        <span class="email">{{ authStore.user?.email }}</span>
        <button class="logout" title="Wyloguj" @click="handleLogout">
          <LogOut :size="16"/>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #1f2937;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 50;
}

.inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 960px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
}

.nav {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}

.nav a {
  color: #d1d5db;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.nav a.active {
  color: #fff;
  background: #374151;
}

.nav a:hover:not(.active) {
  color: #fff;
}

.user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.email {
  font-size: 0.85rem;
  color: #d1d5db;
  opacity: 0.8;
}

.logout {
  background: transparent;
  border: 1px solid #4b5563;
  color: #e5e7eb;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
}

.logout:hover {
  background: #374151;
}

@media (max-width: 768px) {
  .app-header {
    display: none;
  }
}
</style>