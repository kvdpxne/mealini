import {supabase} from '@/lib/supabaseClient'

export interface RecipeSuggestion {
  id: number
  title: string
  image: string
  usedIngredientCount: number
  missedIngredientCount: number
  missedIngredients: Array<{ name: string; amount: number; unit: string }>
  usedIngredients: Array<{ name: string }>
}

export const recipeService = {
  async findByIngredients(ingredients: string[], number = 10): Promise<RecipeSuggestion[]> {
    const {data, error} = await supabase.functions.invoke('spoonacular-proxy', {
      body: {ingredients, number},
    })
    if (error) throw new Error(`Nie udało się pobrać przepisów: ${error.message}`)
    return data ?? []
  },
}