import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RequestsView } from '@/components/requests/requests-view'

export const metadata: Metadata = { title: 'Requests' }

interface Props { params: Promise<{ workspace: string }> }

export default async function RequestsPage({ params }: Props) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect(`/${slug}/login`)

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, workspace_id, role')
    .eq('id', authUser.id)
    .single()

  if (!currentUser) redirect(`/${slug}/login`)

  // Fetch user's own requests
  const { data: myRequests } = await supabase
    .from('absence_requests')
    .select('*, absence_types(name, color), absence_request_files(*)')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })

  // If admin or manager — fetch team requests
  let teamRequests = null
  const isAdmin = currentUser.role === 'admin'

  if (isAdmin) {
    const { data } = await supabase
      .from('absence_requests')
      .select('*, absence_types(name, color), users!user_id(first_name, last_name, avatar_url, job_title), absence_request_files(*)')
      .eq('workspace_id', currentUser.workspace_id)
      .neq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
    teamRequests = data
  } else {
    // Check if user is a manager of any team
    const { data: managerTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', currentUser.id)
      .eq('is_manager', true)

    if (managerTeams && managerTeams.length > 0) {
      const teamIds = managerTeams.map((t) => t.team_id)
      // Get team members
      const { data: teamMemberIds } = await supabase
        .from('team_members')
        .select('user_id')
        .in('team_id', teamIds)
        .neq('user_id', currentUser.id)

      if (teamMemberIds && teamMemberIds.length > 0) {
        const userIds = teamMemberIds.map((m) => m.user_id)
        const { data } = await supabase
          .from('absence_requests')
          .select('*, absence_types(name, color), users!user_id(first_name, last_name, avatar_url, job_title), absence_request_files(*)')
          .in('user_id', userIds)
          .order('created_at', { ascending: false })
        teamRequests = data
      }
    }
  }

  // Fetch absence types for submit form
  const { data: absenceTypes } = await supabase
    .from('absence_types')
    .select('id, name, color')
    .eq('workspace_id', currentUser.workspace_id)
    .eq('is_active', true)
    .order('sort_order')

  // Fetch balances
  const year = new Date().getFullYear()
  const { data: balances } = await supabase
    .from('absence_balances')
    .select('absence_type_id, total_days, used_days')
    .eq('user_id', currentUser.id)
    .eq('year', year)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your time-off requests.</p>
        </div>
      </div>
      <RequestsView
        myRequests={(myRequests ?? []) as RequestRow[]}
        teamRequests={teamRequests as RequestRow[] | null}
        absenceTypes={absenceTypes ?? []}
        balances={balances ?? []}
        workspaceSlug={slug}
      />
    </div>
  )
}

export type RequestRow = {
  id: string
  user_id: string
  absence_type_id: string
  start_date: string
  end_date: string
  total_days: number
  status: 'pending' | 'approved' | 'rejected' | 'modified' | 'cancelled'
  comment: string | null
  reviewer_comment: string | null
  modified_start_date: string | null
  modified_end_date: string | null
  created_at: string
  absence_types: { name: string; color: string } | null
  users?: { first_name: string | null; last_name: string | null; avatar_url: string | null; job_title: string | null } | null
  absence_request_files: { id: string; file_url: string; file_name: string }[]
}
