import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InviteAcceptForm } from '@/components/auth/invite-accept-form'

export const metadata: Metadata = { title: 'Accept Invitation' }

interface InvitePageProps {
  params: Promise<{ workspace: string; token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { workspace: slug, token } = await params
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('invites')
    .select('id, email, status, expires_at, workspace_id')
    .eq('token', token)
    .single()

  if (!invite || invite.status !== 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-gray-900">Invite not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            This invite link is invalid, has already been used, or has expired.
          </p>
        </div>
      </div>
    )
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-gray-900">Invite expired</h1>
          <p className="mt-2 text-sm text-gray-500">
            Please ask your admin to send a new invite.
          </p>
        </div>
      </div>
    )
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!workspace) notFound()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            You&apos;re invited to {workspace.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {invite.email
              ? `This invite was sent to ${invite.email}`
              : 'Create your account to get started.'}
          </p>
        </div>
        <InviteAcceptForm token={token} prefillEmail={invite.email ?? ''} />
      </div>
    </div>
  )
}
