<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ArrowLeft, Check, Circle, Clock, Pencil, Trash2, Users} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useCustomRecipesStore} from '@/stores/customRecipes.store'
import {useAuthStore} from '@/stores/auth.store'
import {useFridgeStore} from '@/stores/fridge.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import {formatQuantity} from '@/lib/quantity'
import {normalizeName} from '@/lib/validation'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const recipesStore = useCustomRecipesStore()
const fridgeStore = useFridgeStore()
const confirm = useConfirmStore()
const {currentRecipe, loading, error} = storeToRefs(recipesStore)
const {run} = useAsyncAction()

const recipeId = computed(() => route.params.id as string)
const deleting = ref(false)

const fridgeNames = computed(() => new Set(fridgeStore.items.map(i => normalizeName(i.name))))

const ingredientsWithAvailability = computed(() => {
  if (!currentRecipe.value) return []
  return currentRecipe.value.ingredients.map(i => ({
    ...i,
    inFridge: fridgeNames.value.has(normalizeName(i.name)),
  }))
})

const availableCount = computed(() =>
  ingredientsWithAvailability.value.filter(i => i.inFridge).length,
)

async function load() {
  await recipesStore.fetchRecipe(recipeId.value)
}

async function handleDelete() {
  if (!authStore.householdId || !currentRecipe.value) return
  const ok = await confirm.ask(`Usunąć przepis „${currentRecipe.value.name}"?`, 'Usuń przepis')
  if (!ok) return
  deleting.value = true
  const result = await run(async () => {
    await recipesStore.deleteRecipe(recipeId.value)
    return true as const
  }, {success: 'Przepis usunięty'})
  deleting.value = false
  if (result) router.push('/recipes')
}

onMounted(load)
watch(recipeId, load)
useRealtimeSubscription('recipes', load)
</script>

<template>
  <div class="recipe-detail">
    <button class="back" @click="router.push('/recipes')">
      <ArrowLeft :size="16"/>
      <span>Wróć do przepisów</span>
    </button>

    <ErrorBanner v-if="error" :message="error" @dismiss="recipesStore.clearError"/>

    <div v-if="loading && !currentRecipe" class="state">Ładowanie...</div>

    <template v-else-if="currentRecipe">
      <header class="header">
        <div class="title-row">
          <h1>{{ currentRecipe.name }}</h1>
          <div class="actions">
            <button class="secondary" @click="router.push(`/recipes/${currentRecipe.id}/edit`)">
              <Pencil :size="16"/>
              <span>Edytuj</span>
            </button>
            <button class="secondary danger" :disabled="deleting" @click="handleDelete">
              <Trash2 :size="16"/>
              <span>Usuń</span>
            </button>
          </div>
        </div>
        <p v-if="currentRecipe.description" class="description">{{ currentRecipe.description }}</p>
        <div class="meta">
          <span v-if="currentRecipe.servings">
            <Users :size="14"/>
            {{ currentRecipe.servings }} {{ currentRecipe.servings === 1 ? 'porcja' : 'porcji' }}
          </span>
          <span v-if="currentRecipe.prep_time_minutes">
            <Clock :size="14"/>
            {{ currentRecipe.prep_time_minutes }} min
          </span>
        </div>
      </header>

      <section class="card">
        <h2>
          Składniki
          <span class="available">
            ({{ availableCount }}/{{ ingredientsWithAvailability.length }} w lodówce)
          </span>
        </h2>
        <ul class="ingredients">
          <li v-for="ing in ingredientsWithAvailability" :key="ing.id">
            <span :class="['dot', { 'dot--in': ing.inFridge }]">
              <Check v-if="ing.inFridge" :size="12"/>
              <Circle v-else :size="10"/>
            </span>
            <span class="ing-name">{{ ing.name }}</span>
            <span class="ing-qty">{{ formatQuantity(ing.quantity, ing.unit) }}</span>
          </li>
        </ul>
      </section>

      <section v-if="currentRecipe.instructions" class="card">
        <h2>Przygotowanie</h2>
        <p class="instructions">{{ currentRecipe.instructions }}</p>
      </section>
    </template>

    <div v-else class="state">Przepis nie istnieje.</div>
  </div>
</template>

<style scoped>
.recipe-detail {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  align-self: flex-start;
}

.back:hover {
  color: #0a7;
}

.state {
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-row h1 {
  margin: 0;
  font-size: 1.5rem;
  flex: 1;
}

.actions {
  display: flex;
  gap: 0.35rem;
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover:not(:disabled) {
  background: #f3f4f6;
}

.secondary.danger {
  color: #b91c1c;
  border-color: #fecaca;
}

.secondary.danger:hover:not(:disabled) {
  background: #fef2f2;
}

.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.description {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.available {
  color: #9ca3af;
  font-weight: 400;
  font-size: 0.85rem;
}

.ingredients {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ingredients li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.ingredients li:last-child {
  border-bottom: none;
}

.dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  flex-shrink: 0;
}

.dot--in {
  background: #dcfce7;
  color: #15803d;
}

.ing-name {
  flex: 1;
}

.ing-qty {
  color: #6b7280;
  font-size: 0.85rem;
}

.instructions {
  white-space: pre-wrap;
  line-height: 1.6;
  margin: 0;
  color: #374151;
}
</style>