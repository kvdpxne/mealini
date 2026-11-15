import {defineStore} from 'pinia'
import {ref} from 'vue'
import {customRecipeService, type RecipeInput} from '@/services/custom-recipe.service'
import type {Recipe, RecipeWithIngredients} from '@/types/database.types'

export const useCustomRecipesStore = defineStore('customRecipes', () => {
  const recipes = ref<Recipe[]>([])
  const currentRecipe = ref<RecipeWithIngredients | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRecipes(householdId: string) {
    loading.value = true
    error.value = null
    try {
      recipes.value = await customRecipeService.list(householdId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function fetchRecipe(recipeId: string) {
    loading.value = true
    error.value = null
    try {
      currentRecipe.value = await customRecipeService.getWithIngredients(recipeId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  async function create(householdId: string, input: RecipeInput): Promise<string> {
    const id = await customRecipeService.create(householdId, input)
    await fetchRecipes(householdId)
    return id
  }

  async function update(recipeId: string, input: RecipeInput): Promise<void> {
    await customRecipeService.update(recipeId, input)
    if (currentRecipe.value?.id === recipeId) {
      currentRecipe.value = await customRecipeService.getWithIngredients(recipeId)
    }
  }

  async function deleteRecipe(recipeId: string): Promise<void> {
    await customRecipeService.delete(recipeId)
    recipes.value = recipes.value.filter(r => r.id !== recipeId)
    if (currentRecipe.value?.id === recipeId) currentRecipe.value = null
  }

  function clearCurrent() {
    currentRecipe.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    recipes, currentRecipe, loading, error,
    fetchRecipes, fetchRecipe, create, update, deleteRecipe,
    clearCurrent, clearError,
  }
})