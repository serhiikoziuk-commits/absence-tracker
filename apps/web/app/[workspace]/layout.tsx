import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import type { Database } from '@/types/database'

type WorkspaceRow = Database['public']['Tables']['workspaces']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ workspace: string }>
}

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  // Resolve workspace by slug
  const { data: workspaceData } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!workspaceData) notFound()
  const workspace = workspaceData as WorkspaceRow

  // Get current session
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Auth check is handled by middleware, but we resolve the DB user here
  if (!authUser) {
    redirect(`/${slug}/login`)
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .eq('workspace_id', workspace.id)
    .single()

  if (!userData) redirect(`/${slug}/login`)
  const user = userData as UserRow

  return (
    <AppShell workspace={workspace} user={user}>
      {children}
    </AppShell>
  )
}
