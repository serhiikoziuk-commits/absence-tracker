import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'

export const metadata: Metadata = { title: 'Profile' }

interface Props { params: Promise<{ workspace: string }> }

export default async function ProfilePage({ params }: Props) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect(`/${slug}/login`)

  const { data: user } = await supabase
    .from('users')
    .select('*, teams:team_members(teams(name))')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect(`/${slug}/login`)

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your personal information and preferences.</p>
      </div>
      <ProfileForm user={user as UserWithTeams} workspaceSlug={slug} />
    </div>
  )
}

export type UserWithTeams = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  job_title: string | null
  start_date: string | null
  date_of_birth: string | null
  role: string
  status: string
  push_notifications_enabled: boolean
  teams: { teams: { name: string } | null }[]
}
