<script setup lang="ts">
import {useUserPreferences} from '@/composables/useUserPreferences'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'

const {preferences, set} = useUserPreferences()
</script>

<template>
  <section class="card">
    <h2>Preferencje</h2>
    <div class="pref-row">
      <div class="pref-info">
        <div class="pref-label">Czyść pole po dodaniu</div>
        <p class="pref-hint">
          Po dodaniu produktu do lodówki lub listy zakupów pole formularza
          zostanie automatycznie wyczyszczone, żeby ułatwić szybkie dodawanie
          kolejnych pozycji. Wyłącz, jeśli chcesz zachować wpisaną treść.
        </p>
      </div>
      <ToggleSwitch
        :model-value="preferences.clearInputAfterAdd"
        @update:model-value="set('clearInputAfterAdd', $event)"
      >
        {{ preferences.clearInputAfterAdd ? 'Włączone' : 'Wyłączone' }}
      </ToggleSwitch>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.pref-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.pref-info {
  flex: 1;
}

.pref-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #111;
  margin-bottom: 0.25rem;
}

.pref-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .pref-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>