import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {storeToRefs} from 'pinia'
import {useAuthStore} from '@/stores/auth.store'
import {useCustomRecipesStore} from '@/stores/customRecipes.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import type {RecipeInput} from '@/services/custom-recipe.service'

export interface IngredientRow {
  key: number
  name: string
  quantity: number
  unit: string
}

let nextKey = 1

function newIngredient(): IngredientRow {
  return {key: nextKey++, name: '', quantity: 1, unit: 'szt'}
}

export function useRecipeForm() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const recipesStore = useCustomRecipesStore()
  const {currentRecipe} = storeToRefs(recipesStore)
  const {run} = useAsyncAction()

  const isEdit = computed(() => route.params.id !== undefined && route.name === 'recipe-edit')
  const recipeId = computed(() => route.params.id as string | undefined)

  const name = ref('')
  const description = ref('')
  const instructions = ref('')
  const servings = ref<number | null>(null)
  const prepTime = ref<number | null>(null)
  const ingredients = ref<IngredientRow[]>([newIngredient()])

  const saving = ref(false)

  function addIngredient() {
    ingredients.value.push(newIngredient())
  }

  function removeIngredient(key: number) {
    if (ingredients.value.length === 1) return
    ingredients.value = ingredients.value.filter(i => i.key !== key)
  }

  async function loadForEdit() {
    if (!isEdit.value || !recipeId.value) return
    await recipesStore.fetchRecipe(recipeId.value)
    const r = currentRecipe.value
    if (!r) return
    name.value = r.name
    description.value = r.description ?? ''
    instructions.value = r.instructions ?? ''
    servings.value = r.servings
    prepTime.value = r.prep_time_minutes
    ingredients.value = r.ingredients.length > 0
      ? r.ingredients.map(i => ({key: nextKey++, name: i.name, quantity: i.quantity, unit: i.unit}))
      : [newIngredient()]
  }

  async function handleSubmit() {
    if (!authStore.householdId || !name.value.trim()) return

    const input: RecipeInput = {
      name: name.value,
      description: description.value.trim() || null,
      instructions: instructions.value.trim() || null,
      servings: servings.value,
      prep_time_minutes: prepTime.value,
      ingredients: ingredients.value
        .filter(i => i.name.trim())
        .map(i => ({name: i.name, quantity: i.quantity, unit: i.unit})),
    }

    saving.value = true
    const result = await run(async () => {
      if (isEdit.value && recipeId.value) {
        await recipesStore.update(recipeId.value, input)
        return recipeId.value
      }
      return await recipesStore.create(authStore.householdId!, input)
    }, {success: isEdit.value ? 'Przepis zapisany' : 'Przepis dodany'})
    saving.value = false

    if (result) {
      await router.push(`/recipes/${result}`)
    }
  }

  function goBack() {
    router.push(isEdit.value && recipeId.value ? `/recipes/${recipeId.value}` : '/recipes')
  }

  onMounted(loadForEdit)

  return {
    isEdit,
    name, description, instructions, servings, prepTime, ingredients,
    saving,
    addIngredient, removeIngredient, handleSubmit, goBack,
  }
}