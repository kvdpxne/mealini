<script setup lang="ts">
import {onMounted} from 'vue'
import {useRecipeSuggestions} from '@/composables/useRecipeSuggestions'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import {Search} from 'lucide-vue-next'

const {recipes, loading, error, search} = useRecipeSuggestions()

onMounted(search)
</script>

<template>
  <div class="recipes-view">
    <header class="page-head">
      <div>
        <h1>Co ugotować?</h1>
        <p class="sub">Przepisy dopasowane do zawartości Twojej lodówki.</p>
      </div>
      <button class="primary" :disabled="loading" @click="search">
        <Search :size="16"/>
        <span>{{ loading ? 'Szukanie...' : 'Odśwież' }}</span>
      </button>
    </header>

    <ErrorBanner v-if="error" :message="error" @dismiss="error = null"/>

    <SkeletonList v-if="loading" :count="5"/>

    <div v-else-if="recipes.length === 0" class="empty">
      Brak przepisów. Dodaj więcej produktów do lodówki lub spróbuj ponownie później.
    </div>

    <ul v-else class="recipe-grid">
      <li v-for="r in recipes" :key="r.id" class="recipe-card">
        <img :src="r.image" :alt="r.title" loading="lazy"/>
        <div class="recipe-body">
          <h3>{{ r.title }}</h3>
          <p class="meta">
            Wykorzystasz <strong>{{ r.usedIngredientCount }}</strong> składników z lodówki
          </p>
          <p v-if="r.missedIngredientCount > 0" class="missed">
            Brakuje: {{ r.missedIngredients.map(i => i.name).join(', ') }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.recipes-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
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

.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 3rem 1rem;
}

.recipe-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.recipe-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.recipe-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.recipe-body {
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.recipe-body h3 {
  margin: 0;
  font-size: 1rem;
}

.meta {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.missed {
  margin: 0;
  font-size: 0.8rem;
  color: #b45309;
}
</style>