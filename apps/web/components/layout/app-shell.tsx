'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type WorkspaceRow = Database['public']['Tables']['workspaces']['Row']

interface AppShellProps {
  children: React.ReactNode
  workspace: WorkspaceRow
  user: UserRow
}

export function AppShell({ children, workspace, user }: AppShellProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push(`/${workspace.slug}/login`)
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        workspaceSlug={workspace.slug}
        workspaceName={workspace.name}
        userFirstName={user.first_name}
        userLastName={user.last_name}
        userAvatarUrl={user.avatar_url}
        isAdmin={user.role === 'admin'}
        onSignOut={handleSignOut}
      />
      <main className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
