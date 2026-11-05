<script setup lang="ts">
import CreateHouseholdForm from '@/components/onboarding/CreateHouseholdForm.vue'
import JoinHouseholdForm from '@/components/onboarding/JoinHouseholdForm.vue'
</script>

<template>
  <div class="onboarding">
    <header>
      <h1>Witaj w Lodówce 👋</h1>
      <p>Skonfigurujmy Twoje gospodarstwo domowe. Utwórz nowe lub dołącz do istniejącego kodem od partnerki.</p>
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

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>