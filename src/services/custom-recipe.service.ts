import {supabase} from '@/lib/supabaseClient'
import type {Recipe, RecipeWithIngredients} from '@/types/database.types'
import {LIMITS} from '@/lib/validation'

export interface RecipeInput {
  name: string
  description: string | null
  instructions: string | null
  servings: number | null
  prep_time_minutes: number | null
  ingredients: Array<{ name: string; quantity: number; unit: string }>
}

function validateInput(input: RecipeInput): void {
  const name = input.name.trim()
  if (!name) throw new Error('Nazwa przepisu nie może być pusta.')
  if (name.length > LIMITS.recipeName) {
    throw new Error(`Nazwa może mieć maksymalnie ${LIMITS.recipeName} znaków.`)
  }
  if (input.description && input.description.length > LIMITS.recipeDescription) {
    throw new Error(`Opis może mieć maksymalnie ${LIMITS.recipeDescription} znaków.`)
  }
  if (input.instructions && input.instructions.length > LIMITS.recipeInstructions) {
    throw new Error(`Instrukcje mogą mieć maksymalnie ${LIMITS.recipeInstructions} znaków.`)
  }
  if (input.servings != null && (input.servings < 1 || input.servings > 50)) {
    throw new Error('Liczba porcji musi być w zakresie 1-50.')
  }
  if (input.prep_time_minutes != null && (input.prep_time_minutes < 1 || input.prep_time_minutes > 1440)) {
    throw new Error('Czas przygotowania musi być w zakresie 1-1440 minut.')
  }
  for (const ing of input.ingredients) {
    if (!ing.name.trim()) throw new Error('Nazwa składnika nie może być pusta.')
    if (ing.name.trim().length > 80) throw new Error('Nazwa składnika może mieć maksymalnie 80 znaków.')
    if (!Number.isFinite(ing.quantity) || ing.quantity <= 0) {
      throw new Error('Ilość składnika musi być większa od zera.')
    }
    if (!ing.unit.trim() || ing.unit.length > 20) {
      throw new Error('Nieprawidłowa jednostka składnika.')
    }
  }
}

export const customRecipeService = {
  async list(householdId: string): Promise<Recipe[]> {
    const {data, error} = await supabase
      .from('recipes')
      .select('*')
      .eq('household_id', householdId)
      .order('name', {ascending: true})
    if (error) throw new Error(`Nie udało się pobrać przepisów: ${error.message}`)
    return data ?? []
  },

  async getWithIngredients(recipeId: string): Promise<RecipeWithIngredients | null> {
    const {data: recipe, error} = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .maybeSingle()
    if (error) throw new Error(`Nie udało się pobrać przepisu: ${error.message}`)
    if (!recipe) return null

    const {data: ingredients, error: ingErr} = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('sort_order', {ascending: true})
    if (ingErr) throw new Error(`Nie udało się pobrać składników: ${ingErr.message}`)

    return {...recipe, ingredients: ingredients ?? []}
  },

  async create(householdId: string, input: RecipeInput): Promise<string> {
    validateInput(input)
    const {data, error} = await supabase.rpc('create_recipe', {
      p_household_id: householdId,
      p_name: input.name.trim(),
      p_description: input.description,
      p_instructions: input.instructions,
      p_servings: input.servings,
      p_prep_time_minutes: input.prep_time_minutes,
      p_ingredients: input.ingredients.map(i => ({
        name: i.name.trim(),
        quantity: i.quantity,
        unit: i.unit,
      })),
    })
    if (error) {
      if (error.code === '23505') throw new Error('Przepis o tej nazwie już istnieje.')
      throw new Error(`Nie udało się utworzyć przepisu: ${error.message}`)
    }
    return data as string
  },

  async update(recipeId: string, input: RecipeInput): Promise<void> {
    validateInput(input)
    const {error} = await supabase.rpc('update_recipe', {
      p_recipe_id: recipeId,
      p_name: input.name.trim(),
      p_description: input.description,
      p_instructions: input.instructions,
      p_servings: input.servings,
      p_prep_time_minutes: input.prep_time_minutes,
      p_ingredients: input.ingredients.map(i => ({
        name: i.name.trim(),
        quantity: i.quantity,
        unit: i.unit,
      })),
    })
    if (error) {
      if (error.code === '23505') throw new Error('Przepis o tej nazwie już istnieje.')
      throw new Error(`Nie udało się zapisać przepisu: ${error.message}`)
    }
  },

  async delete(recipeId: string): Promise<void> {
    const {error} = await supabase.from('recipes').delete().eq('id', recipeId)
    if (error) throw new Error(`Nie udało się usunąć przepisu: ${error.message}`)
  },
}