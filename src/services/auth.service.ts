import {supabase} from './../lib/supabaseClient'
import type {Session} from '@supabase/supabase-js'

export const authService = {
  async signIn(email: string, password: string): Promise<Session | null> {
    const {data, error} = await supabase.auth.signInWithPassword({email, password})
    if (error) throw error
    return data.session
  },

  async signUp(email: string, password: string): Promise<Session | null> {
    const {data, error} = await supabase.auth.signUp({email, password})
    if (error) throw error
    return data.session
  },

  async signOut(): Promise<void> {
    const {error} = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession(): Promise<Session | null> {
    const {data: {session}} = await supabase.auth.getSession()
    return session
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const {data} = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
    return () => data.subscription.unsubscribe()
  },

  async getCurrentUserHouseholdId(): Promise<string | null> {
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) return null

    const {data, error} = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return data.household_id
  },
}