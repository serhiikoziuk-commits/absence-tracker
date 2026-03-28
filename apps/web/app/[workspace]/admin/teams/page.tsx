import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamsAdminView } from '@/components/admin/teams-admin-view'

export const metadata: Metadata = { title: 'Teams — Admin' }

interface Props { params: Promise<{ workspace: string }> }

export default async function AdminTeamsPage({ params }: Props) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect(`/${slug}/login`)

  const { data: currentUser } = await supabase
    .from('users').select('role, workspace_id').eq('id', authUser.id).single()
  if (!currentUser || currentUser.role !== 'admin') redirect(`/${slug}/dashboard`)

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, team_members(user_id, is_manager, users(id, first_name, last_name, avatar_url, email))')
    .eq('workspace_id', currentUser.workspace_id)
    .order('name')

  const { data: allUsers } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, avatar_url')
    .eq('workspace_id', currentUser.workspace_id)
    .eq('status', 'active')
    .order('first_name')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
        <p className="mt-1 text-sm text-gray-500">Create teams and assign managers.</p>
      </div>
      <TeamsAdminView teams={(teams ?? []) as TeamRow[]} allUsers={allUsers ?? []} />
    </div>
  )
}

export type TeamRow = {
  id: string
  name: string
  team_members: {
    user_id: string
    is_manager: boolean
    users: { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null; email: string } | null
  }[]
}
