<script setup lang="ts">
import {ArrowLeft} from 'lucide-vue-next'
import {useRecipeForm} from '@/composables/useRecipeForm'
import RecipeIngredientsEditor from '@/components/recipes/RecipeIngredientsEditor.vue'
import {LIMITS} from '@/lib/validation'

const {
  isEdit,
  name, description, instructions, servings, prepTime, ingredients,
  saving,
  addIngredient, removeIngredient, handleSubmit, goBack,
} = useRecipeForm()

function updateIngredient(key: number, field: 'name' | 'quantity' | 'unit', value: string | number) {
  const row = ingredients.value.find(i => i.key === key)
  if (!row) return
  if (field === 'quantity') row.quantity = Number(value)
  else if (field === 'unit') row.unit = String(value)
  else row.name = String(value)
}
</script>

<template>
  <div class="recipe-form">
    <button class="back" @click="goBack">
      <ArrowLeft :size="16"/>
      <span>Wróć</span>
    </button>

    <h1>{{ isEdit ? 'Edytuj przepis' : 'Nowy przepis' }}</h1>

    <form @submit.prevent="handleSubmit">
      <section class="card">
        <h2>Podstawowe</h2>
        <label>
          Nazwa
          <input v-model="name" type="text" required :maxlength="LIMITS.recipeName"/>
        </label>
        <label>
          Opis
          <textarea
            v-model="description"
            rows="2"
            :maxlength="LIMITS.recipeDescription"
            placeholder="Krótki opis, np. Szybkie danie na kolację"
          />
        </label>
        <div class="row">
          <label>
            Porcje
            <input v-model.number="servings" type="number" min="1" max="50" placeholder="np. 4"/>
          </label>
          <label>
            Czas przygotowania (min)
            <input v-model.number="prepTime" type="number" min="1" max="1440" placeholder="np. 30"/>
          </label>
        </div>
      </section>

      <section class="card">
        <h2>Składniki</h2>
        <RecipeIngredientsEditor
          :rows="ingredients"
          @add="addIngredient"
          @remove="removeIngredient"
          @update="updateIngredient"
        />
      </section>

      <section class="card">
        <h2>Instrukcje</h2>
        <label>
          Krok po kroku
          <textarea
            v-model="instructions"
            rows="8"
            :maxlength="LIMITS.recipeInstructions"
            placeholder="1. Zagotuj wodę...&#10;2. Wrzuć makaron...&#10;3. ..."
          />
        </label>
      </section>

      <div class="actions">
        <button type="button" class="secondary" @click="goBack">Anuluj</button>
        <button type="submit" class="primary" :disabled="saving">
          {{ saving ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Utwórz przepis' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.recipe-form {
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

h1 {
  margin: 0;
  font-size: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.card h2 {
  margin: 0;
  font-size: 1.05rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #374151;
}

input, textarea, select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
}

textarea {
  resize: vertical;
}

.row {
  display: flex;
  gap: 0.75rem;
}

.row label {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.actions button {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.9rem;
}

.secondary {
  background: transparent;
  border-color: #d1d5db;
}

.secondary:hover {
  background: #f3f4f6;
}

.primary {
  background: #0a7;
  color: #fff;
}

.primary:hover:not(:disabled) {
  background: #086;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .row {
    flex-direction: column;
  }
}
</style>