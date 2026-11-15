import {ref} from 'vue'
import {recipeService, type RecipeSuggestion} from '@/services/recipe.service'
import {useFridgeStore} from '@/stores/fridge.store'

export function useRecipeSuggestions() {
  const fridgeStore = useFridgeStore()
  const recipes = ref<RecipeSuggestion[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function search() {
    const ingredients = Array.from(
      new Set(fridgeStore.items.map(i => i.name.toLowerCase())),
    )

    if (ingredients.length === 0) {
      error.value = 'Lodówka jest pusta – dodaj produkty, żeby szukać przepisów.'
      return
    }

    loading.value = true
    error.value = null
    try {
      recipes.value = await recipeService.findByIngredients(ingredients)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  return {recipes, loading, error, search}
}