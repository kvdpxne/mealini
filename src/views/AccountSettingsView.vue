<script setup lang="ts">
import {Home} from 'lucide-vue-next'
import {RouterLink} from 'vue-router'
import AccountProfileSection from '@/components/account/AccountProfileSection.vue'
import AccountPreferencesSection from '@/components/account/AccountPreferencesSection.vue'
import AccountPasswordSection from '@/components/account/AccountPasswordSection.vue'
import AccountEmailSection from '@/components/account/AccountEmailSection.vue'
import AccountExportSection from '@/components/account/AccountExportSection.vue'
</script>

<template>
  <div class="settings-view">
    <h1>Ustawienia konta</h1>

    <RouterLink to="/household" class="household-link">
      <Home :size="16"/>
      <span>Przejdź do ustawień gospodarstwa</span>
    </RouterLink>

    <AccountProfileSection/>
    <AccountPreferencesSection/>
    <AccountPasswordSection/>
    <AccountEmailSection/>
    <AccountExportSection/>
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
</style>