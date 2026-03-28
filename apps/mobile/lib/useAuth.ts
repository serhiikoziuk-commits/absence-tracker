import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'

export type AuthState = {
  session: Session | null
  workspaceSlug: string | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const slug = await AsyncStorage.getItem('workspace_slug')
        setWorkspaceSlug(slug)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        const slug = await AsyncStorage.getItem('workspace_slug')
        setWorkspaceSlug(slug)
      } else {
        setWorkspaceSlug(null)
        await AsyncStorage.removeItem('workspace_slug')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, workspaceSlug, loading }
}
