'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

// ── Send OTP ──────────────────────────────────────────────────────────────────
export async function sendOtp(email: string, workspaceSlug: string) {
  const supabase = await createClient()

  // Verify the user belongs to this workspace (unless first registration)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, restrict_email_domain, email_domain')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspace) return { error: 'Workspace not found.' }

  // Domain restriction check
  if (workspace.restrict_email_domain && workspace.email_domain) {
    const domain = email.split('@')[1]
    if (domain !== workspace.email_domain) {
      return { error: `Only @${workspace.email_domain} emails are allowed.` }
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // don't auto-create; handled separately
      data: { workspace_id: workspace.id },
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
export async function verifyOtp(email: string, token: string, workspaceSlug: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) return { error: 'Invalid or expired code. Please try again.' }

  // Ensure the user record exists in this workspace
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed.' }

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, status')
    .eq('id', user.id)
    .single()

  if (!dbUser) return { error: 'You are not a member of this workspace.' }
  if (dbUser.status === 'blocked') return { error: 'Your account has been disabled.' }

  redirect(`/${workspaceSlug}/dashboard`)
}

// ── Register Workspace (step 1: validate + send OTP only, no DB writes) ───────
export async function registerWorkspace(formData: FormData) {
  const companyName = formData.get('company_name') as string
  const email = formData.get('email') as string
  const rawSlug = formData.get('slug') as string
  const slug = slugify(rawSlug || companyName)

  if (!companyName || !email || !slug) return { error: 'All fields are required.' }

  const admin = createAdminClient()
  const supabase = await createClient()

  // Check slug uniqueness before sending OTP
  const { data: existing } = await admin
    .from('workspaces')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) return { error: 'This workspace URL is already taken. Please choose another.' }

  // Only send OTP — workspace is created after email is verified
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (otpError) return { error: otpError.message }

  return { success: true, slug, email }
}

// ── Complete Registration (step 2: verify OTP then create workspace + user) ───
export async function completeRegistration(
  workspaceSlug: string,
  workspaceName: string,
  email: string,
  token: string,
  firstName: string,
  lastName: string
) {
  const admin = createAdminClient()
  const supabase = await createClient()

  // Verify OTP first
  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (verifyError) return { error: 'Invalid or expired code.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed.' }

  // Re-check slug uniqueness (in case someone grabbed it during OTP window)
  const { data: existing } = await admin
    .from('workspaces')
    .select('id')
    .eq('slug', workspaceSlug)
    .single()

  if (existing) return { error: 'This workspace URL was just taken. Please go back and choose another.' }

  // Create workspace
  const { data: workspace, error: wsError } = await admin
    .from('workspaces')
    .insert({ slug: workspaceSlug, name: workspaceName })
    .select()
    .single()

  if (wsError || !workspace) return { error: 'Failed to create workspace.' }

  // Seed default absence types
  await admin.rpc('seed_default_absence_types', { p_workspace_id: workspace.id })

  // Create user record (admin client bypasses RLS for initial insert)
  const { error: userError } = await admin.from('users').insert({
    id: user.id,
    workspace_id: workspace.id,
    email,
    first_name: firstName,
    last_name: lastName,
    role: 'admin',
    status: 'active',
  })

  if (userError) return { error: userError.message }

  // Create initial balances
  const { data: types } = await admin
    .from('absence_types')
    .select('id, default_days')
    .eq('workspace_id', workspace.id)

  if (types && types.length > 0) {
    const year = new Date().getFullYear()
    await admin.from('absence_balances').insert(
      types.map((t) => ({
        workspace_id: workspace.id,
        user_id: user.id,
        absence_type_id: t.id,
        total_days: t.default_days,
        used_days: 0,
        year,
      }))
    )
  }

  redirect(`/${workspaceSlug}/dashboard`)
}

// ── Accept Invite ─────────────────────────────────────────────────────────────
export async function acceptInvite(
  token: string,
  email: string,
  otpToken: string,
  firstName: string,
  lastName: string
) {
  const supabase = await createClient()

  // Validate invite
  const { data: invite } = await supabase
    .from('invites')
    .select('*, workspaces(slug)')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (!invite) return { error: 'Invite link is invalid or has expired.' }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    await supabase.from('invites').update({ status: 'expired' }).eq('id', invite.id)
    return { error: 'This invite link has expired.' }
  }
  if (invite.email && invite.email !== email) {
    return { error: 'This invite was sent to a different email address.' }
  }

  // Verify OTP
  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otpToken, type: 'email' })
  if (verifyError) return { error: 'Invalid or expired code.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed.' }

  // Create user record
  const { error: userError } = await supabase.from('users').upsert({
    id: user.id,
    workspace_id: invite.workspace_id,
    email,
    first_name: firstName,
    last_name: lastName,
    role: 'user',
    status: 'active',
  })

  if (userError) return { error: userError.message }

  // Create balances
  const { data: types } = await supabase
    .from('absence_types')
    .select('id, default_days')
    .eq('workspace_id', invite.workspace_id)

  if (types && types.length > 0) {
    const year = new Date().getFullYear()
    await supabase.from('absence_balances').insert(
      types.map((t) => ({
        workspace_id: invite.workspace_id,
        user_id: user.id,
        absence_type_id: t.id,
        total_days: t.default_days,
        used_days: 0,
        year,
      }))
    )
  }

  // Mark invite as accepted
  await supabase.from('invites').update({ status: 'accepted' }).eq('id', invite.id)

  const workspaceSlug = (invite.workspaces as { slug: string })?.slug
  redirect(`/${workspaceSlug}/dashboard`)
}
