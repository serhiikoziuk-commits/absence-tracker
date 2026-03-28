import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersAdminView } from '@/components/admin/users-admin-view'

export const metadata: Metadata = { title: 'Users — Admin' }

interface Props { params: Promise<{ workspace: string }> }

export default async function AdminUsersPage({ params }: Props) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect(`/${slug}/login`)

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, workspace_id')
    .eq('id', authUser.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') redirect(`/${slug}/dashboard`)

  const { data: users } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, avatar_url, role, status, job_title, start_date, created_at, team_members(is_manager, teams(id, name))')
    .eq('workspace_id', currentUser.workspace_id)
    .order('created_at')

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('workspace_id', currentUser.workspace_id)
    .order('name')

  const year = new Date().getFullYear()
  const { data: absenceTypes } = await supabase
    .from('absence_types')
    .select('id, name, color')
    .eq('workspace_id', currentUser.workspace_id)
    .eq('is_active', true)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">Manage workspace members and their access.</p>
      </div>
      <UsersAdminView
        users={(users ?? []) as AdminUserRow[]}
        teams={teams ?? []}
        absenceTypes={absenceTypes ?? []}
        year={year}
        workspaceSlug={slug}
      />
    </div>
  )
}

export type AdminUserRow = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
  status: 'active' | 'blocked' | 'invited'
  job_title: string | null
  start_date: string | null
  created_at: string
  team_members: { is_manager: boolean; teams: { id: string; name: string } | null }[]
}
