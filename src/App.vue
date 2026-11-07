<script setup lang="ts">
import {onMounted, watch} from 'vue'
import {useAuthStore} from '@/stores/auth.store'
import {useFridgeStore} from '@/stores/fridge.store'
import {useShoppingStore} from '@/stores/shopping.store'
import {useOnlineStatus} from '@/composables/useOnlineStatus'
import AppHeader from '@/components/shared/AppHeader.vue'
import BottomNav from '@/components/shared/BottomNav.vue'
import OfflineBanner from '@/components/shared/OfflineBanner.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import ErrorBoundary from '@/components/shared/ErrorBoundary.vue'

const authStore = useAuthStore()
const fridgeStore = useFridgeStore()
const shoppingStore = useShoppingStore()
const {isOnline} = useOnlineStatus()

onMounted(() => authStore.initialize())

watch(isOnline, async (online) => {
  if (!online || !authStore.householdId) return
  await Promise.all([
    fridgeStore.fetchItems(authStore.householdId, {silent: true}),
    shoppingStore.fetchItems(authStore.householdId, {silent: true}),
  ])
})
</script>

<template>
  <OfflineBanner v-if="!isOnline"/>
  <AppHeader v-if="authStore.isAuthenticated && authStore.householdId"/>
  <main :class="{ 'with-header': authStore.isAuthenticated && authStore.householdId }">
    <ErrorBoundary>
      <RouterView/>
    </ErrorBoundary>
  </main>
  <BottomNav v-if="authStore.isAuthenticated && authStore.householdId"/>
  <ToastContainer/>
  <ConfirmDialog/>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9fafb;
  color: #111;
}

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

main.with-header {
  padding-top: 2rem;
}

@media (max-width: 768px) {
  main {
    padding: 1rem;
    padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  }
}
</style>