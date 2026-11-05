<script setup lang="ts">
import {onMounted} from 'vue'
import {useAuthStore} from '@/stores/auth.store'
import AppHeader from '@/components/shared/AppHeader.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const authStore = useAuthStore()
onMounted(() => authStore.initialize())
</script>

<template>
  <AppHeader v-if="authStore.isAuthenticated && authStore.householdId"/>
  <main>
    <RouterView/>
  </main>
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
  padding: 1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom));
}
</style>