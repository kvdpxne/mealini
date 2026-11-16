<script setup lang="ts">
import {HOUSEHOLD_MEMBERSHIP_LIMIT} from '@/lib/limits'
import CreateHouseholdForm from '@/components/onboarding/CreateHouseholdForm.vue'
import JoinHouseholdForm from '@/components/onboarding/JoinHouseholdForm.vue'
import {Info} from 'lucide-vue-next'
</script>

<template>
  <div class="onboarding">
    <header>
      <h1>Witaj w Lodówce</h1>
      <p>Skonfigurujmy Twoje gospodarstwo domowe. Utwórz nowe lub dołącz do istniejącego kodem od partnerki.</p>
      <p class="limit-note">
        <Info :size="14"/>
        <span>Możesz należeć do maksymalnie <strong>{{
            HOUSEHOLD_MEMBERSHIP_LIMIT
          }}</strong> gospodarstw domowych.</span>
      </p>
    </header>
    <div class="grid">
      <CreateHouseholdForm/>
      <JoinHouseholdForm/>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

header {
  margin-bottom: 1.5rem;
}

header p {
  color: #555;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.limit-note {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0.75rem 0 0;
  padding: 0.4rem 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #075985;
  border-radius: 6px;
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>