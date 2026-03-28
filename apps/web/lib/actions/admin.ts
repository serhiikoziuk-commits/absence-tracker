'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/lib/email'
import { InviteEmail } from '@/lib/email/templates/invite'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, workspace_id, role')
    .eq('id', user.id)
    .single()

  if (!dbUser || dbUser.role !== 'admin') throw new Error('Admin only')
  return { supabase, dbUser }
}

// ── Invite ─────────────────────────────────────────────────────────────────────
export async function createInvite(emails: string[]) {
  const { supabase, dbUser } = await requireAdmin()

  const invites = emails.map((email) => ({
    workspace_id: dbUser.workspace_id,
    email: email.trim().toLowerCase(),
    invited_by: dbUser.id,
    token: nanoid(32),
  }))

  const { error } = await supabase.from('invites').insert(invites)
  if (error) return { error: error.message }

  // Send invite emails
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const [{ data: inviter }, { data: workspace }] = await Promise.all([
      supabase.from('users').select('first_name, last_name').eq('id', dbUser.id).single(),
      supabase.from('workspaces').select('name').eq('id', dbUser.workspace_id).single(),
    ])
    if (inviter && workspace) {
      const inviterName = [inviter.first_name, inviter.last_name].filter(Boolean).join(' ') || 'Your admin'
      await Promise.all(
        invites.map((invite) =>
          sendEmail({
            to: invite.email,
            subject: `You've been invited to join ${workspace.name}`,
            template: InviteEmail({
              workspaceName: workspace.name,
              invitedByName: inviterName,
              acceptUrl: `${appUrl}/accept-invite?token=${invite.token}`,
            }),
          })
        )
      )
    }
  } catch (e) {
    console.error('[email] createInvite notification failed:', e)
  }

  revalidatePath('/[workspace]/admin/users', 'page')
  return { success: true, tokens: invites.map((i) => i.token) }
}

export async function createOpenInvite() {
  const { supabase, dbUser } = await requireAdmin()

  const token = nanoid(32)
  const { error } = await supabase.from('invites').insert({
    workspace_id: dbUser.workspace_id,
    email: null,
    invited_by: dbUser.id,
    token,
  })

  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/users', 'page')
  return { success: true, token }
}

// ── User management ────────────────────────────────────────────────────────────
export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('users').update({ role }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/users', 'page')
  return { success: true }
}

export async function updateUserStatus(userId: string, status: 'active' | 'blocked') {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('users').update({ status }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/users', 'page')
  return { success: true }
}

export async function updateUserDetails(userId: string, data: {
  job_title?: string
  start_date?: string
}) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('users').update(data).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/users', 'page')
  return { success: true }
}

export async function adjustBalance(userId: string, typeId: string, year: number, totalDays: number) {
  const { supabase, dbUser } = await requireAdmin()

  const { error } = await supabase
    .from('absence_balances')
    .upsert({
      workspace_id: dbUser.workspace_id,
      user_id: userId,
      absence_type_id: typeId,
      total_days: totalDays,
      year,
    }, { onConflict: 'user_id,absence_type_id,year' })

  if (error) return { error: error.message }
  return { success: true }
}

// ── Teams ──────────────────────────────────────────────────────────────────────
export async function createTeam(name: string) {
  const { supabase, dbUser } = await requireAdmin()
  const { error } = await supabase.from('teams').insert({ workspace_id: dbUser.workspace_id, name })
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/teams', 'page')
  return { success: true }
}

export async function updateTeam(teamId: string, name: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('teams').update({ name }).eq('id', teamId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/teams', 'page')
  return { success: true }
}

export async function deleteTeam(teamId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/teams', 'page')
  return { success: true }
}

export async function addTeamMember(teamId: string, userId: string, isManager: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('team_members').upsert({ team_id: teamId, user_id: userId, is_manager: isManager })
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/teams', 'page')
  return { success: true }
}

export async function removeTeamMember(teamId: string, userId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/teams', 'page')
  return { success: true }
}

// ── Absence Types ──────────────────────────────────────────────────────────────
export async function createAbsenceType(data: {
  name: string; color: string; default_days: number
  accrual_type: 'none' | 'monthly' | 'yearly'; accrual_amount: number; requires_attachment: boolean
}) {
  const { supabase, dbUser } = await requireAdmin()
  const { error } = await supabase.from('absence_types').insert({ ...data, workspace_id: dbUser.workspace_id })
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/absence-types', 'page')
  return { success: true }
}

export async function updateAbsenceType(typeId: string, data: Partial<{
  name: string; color: string; default_days: number
  accrual_type: 'none' | 'monthly' | 'yearly'; accrual_amount: number; requires_attachment: boolean; is_active: boolean
}>) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('absence_types').update(data).eq('id', typeId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/absence-types', 'page')
  return { success: true }
}

export async function deleteAbsenceType(typeId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('absence_types').delete().eq('id', typeId)
  if (error) return { error: error.message }
  revalidatePath('/[workspace]/admin/absence-types', 'page')
  return { success: true }
}
