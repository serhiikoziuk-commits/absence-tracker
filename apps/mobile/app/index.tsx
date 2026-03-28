import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function Index() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  if (session === undefined) return <LoadingSpinner fullScreen />
  if (session) return <Redirect href="/(app)/dashboard" />
  return <Redirect href="/(auth)/login" />
}
