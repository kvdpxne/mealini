<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ChefHat, Clock, Plus, Users} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useAuthStore} from '@/stores/auth.store'
import {useCustomRecipesStore} from '@/stores/customRecipes.store'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const router = useRouter()
const authStore = useAuthStore()
const recipesStore = useCustomRecipesStore()
const {recipes, loading, error} = storeToRefs(recipesStore)

const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return recipes.value
  return recipes.value.filter(r => r.name.toLowerCase().includes(q))
})

async function refresh() {
  if (authStore.householdId) await recipesStore.fetchRecipes(authStore.householdId)
}

onMounted(refresh)
useRealtimeSubscription('recipes', refresh)
</script>

<template>
  <div class="my-recipes">
    <div class="toolbar">
      <input v-model="search" type="search" placeholder="Szukaj przepisu…"/>
      <button class="primary" @click="router.push('/recipes/new')">
        <Plus :size="16"/>
        <span>Nowy przepis</span>
      </button>
    </div>

    <ErrorBanner v-if="error" :message="error" @dismiss="recipesStore.clearError"/>

    <SkeletonList v-if="loading" :count="3"/>

    <div v-else-if="filtered.length === 0" class="empty">
      <ChefHat :size="40"/>
      <p v-if="search">Brak przepisów pasujących do „{{ search }}".</p>
      <p v-else>
        Nie masz jeszcze żadnych własnych przepisów. Dodaj pierwszy – ręcznie lub
        z inspiracji z zakładki „Z lodówki".
      </p>
    </div>

    <ul v-else class="grid">
      <li v-for="r in filtered" :key="r.id" class="card" @click="router.push(`/recipes/${r.id}`)">
        <h3>{{ r.name }}</h3>
        <p v-if="r.description" class="desc">{{ r.description }}</p>
        <div class="meta">
          <span v-if="r.servings"><Users :size="12"/> {{ r.servings }}</span>
          <span v-if="r.prep_time_minutes"><Clock :size="12"/> {{ r.prep_time_minutes }} min</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.my-recipes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar input {
  flex: 1;
  min-width: 160px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  line-height: 1.6;
  max-width: 480px;
  margin: 0 auto;
}

.grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.card:hover {
  border-color: #0a7;
  box-shadow: 0 2px 8px rgba(10, 167, 119, 0.08);
}

.card h3 {
  margin: 0;
  font-size: 1rem;
  color: #111;
}

.desc {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}
</style>