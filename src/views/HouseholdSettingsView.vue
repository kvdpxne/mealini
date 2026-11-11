<script setup lang="ts">
import {onMounted} from 'vue'
import {storeToRefs} from 'pinia'
import {useAuthStore} from '@/stores/auth.store'
import {useHouseholdStore} from '@/stores/household.store'
import HouseholdNameSection from '@/components/household/HouseholdNameSection.vue'
import HouseholdInviteSection from '@/components/household/HouseholdInviteSection.vue'
import HouseholdMembersSection from '@/components/household/HouseholdMembersSection.vue'
import HouseholdDangerSection from '@/components/household/HouseholdDangerSection.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import SkeletonList from '@/components/shared/SkeletonList.vue'

const authStore = useAuthStore()
const householdStore = useHouseholdStore()
const {loading, error} = storeToRefs(householdStore)

onMounted(() => {
  if (authStore.householdId) {
    // Store sam się ładuje przez watch na authStore.householdId,
    // ale force: true gwarantuje świeże dane przy wejściu z innego widoku
    householdStore.fetchDetails(authStore.householdId, {force: true})
  }
})
</script>

<template>
  <div class="settings-page">
    <header class="page-head">
      <h1>Gospodarstwo domowe</h1>
      <p class="sub">Zarządzaj nazwą, kodem zaproszenia i członkami.</p>
    </header>

    <ErrorBanner v-if="error" :message="error" @dismiss="householdStore.error = null"/>

    <SkeletonList v-if="loading" :count="3"/>

    <template v-else>
      <HouseholdNameSection/>
      <HouseholdInviteSection/>
      <HouseholdMembersSection/>
      <HouseholdDangerSection/>
    </template>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
}

.page-head h1 {
  margin: 0;
  font-size: 1.5rem;
}

.sub {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}
</style>