import {supabase} from '@/lib/supabaseClient'

export const aiService = {
  async ask(prompt: string): Promise<string> {
    const {data, error} = await supabase.functions.invoke('ai-proxy', {
      body: {prompt},
    })
    if (error) throw new Error(`AI nie odpowiedziało: ${error.message}`)
    return data.text ?? ''
  },
}