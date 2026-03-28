'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { RequestSubmittedEmail } from '@/lib/email/templates/request-submitted'
import { RequestReviewedEmail } from '@/lib/email/templates/request-reviewed'
import { format, parseISO } from 'date-fns'

async function getWorkspaceContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, workspace_id, role')
    .eq('id', user.id)
    .single()

  if (!dbUser) throw new Error('User not found')
  return { supabase, dbUser }
}

// ── Submit Request ────────────────────────────────────────────────────────────
export async function submitRequest(formData: FormData) {
  const { supabase, dbUser } = await getWorkspaceContext()

  const absenceTypeId = formData.get('absence_type_id') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const comment = formData.get('comment') as string | null

  if (!absenceTypeId || !startDate || !endDate) return { error: 'Missing required fields.' }

  // Calculate working days (simple: end - start + 1, no weekend handling for now)
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end < start) return { error: 'End date must be after start date.' }

  const diffMs = end.getTime() - start.getTime()
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1

  // Check balance
  const year = start.getFullYear()
  const { data: balance } = await supabase
    .from('absence_balances')
    .select('total_days, used_days')
    .eq('user_id', dbUser.id)
    .eq('absence_type_id', absenceTypeId)
    .eq('year', year)
    .single()

  if (balance && balance.total_days - balance.used_days < totalDays) {
    return { error: `Insufficient balance. You have ${balance.total_days - balance.used_days} days available.` }
  }

  const { error } = await supabase.from('absence_requests').insert({
    workspace_id: dbUser.workspace_id,
    user_id: dbUser.id,
    absence_type_id: absenceTypeId,
    start_date: startDate,
    end_date: endDate,
    total_days: totalDays,
    comment: comment || null,
    status: 'pending',
  })

  if (error) return { error: error.message }

  // Notify managers and admins
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const { data: submitter } = await supabase
      .from('users')
      .select('first_name, last_name, workspace_id')
      .eq('id', dbUser.id)
      .single()
    const { data: absenceType } = await supabase
      .from('absence_types')
      .select('name')
      .eq('id', absenceTypeId)
      .single()
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('slug')
      .eq('id', dbUser.workspace_id)
      .single()

    if (submitter && absenceType && workspace) {
      const employeeName = [submitter.first_name, submitter.last_name].filter(Boolean).join(' ') || 'A team member'
      const reviewUrl = `${appUrl}/${workspace.slug}/requests`

      // Find admins + managers in this workspace
      const { data: managers } = await supabase
        .from('users')
        .select('email, first_name')
        .eq('workspace_id', dbUser.workspace_id)
        .eq('role', 'admin')
        .neq('id', dbUser.id)

      const { data: teamManagers } = await supabase
        .from('team_members')
        .select('users!user_id(email, first_name)')
        .eq('is_manager', true)
        .neq('user_id', dbUser.id)

      const managerEmails = new Map<string, string>()
      for (const m of managers ?? []) {
        managerEmails.set(m.email, m.first_name ?? 'Manager')
      }
      for (const tm of teamManagers ?? []) {
        const u = (tm as any).users
        if (u?.email) managerEmails.set(u.email, u.first_name ?? 'Manager')
      }

      await Promise.all(
        Array.from(managerEmails.entries()).map(([email, firstName]) =>
          sendEmail({
            to: email,
            subject: `New absence request from ${employeeName}`,
            template: RequestSubmittedEmail({
              managerName: firstName,
              employeeName,
              absenceType: absenceType.name,
              startDate: format(parseISO(startDate), 'MMM d, yyyy'),
              endDate: format(parseISO(endDate), 'MMM d, yyyy'),
              totalDays,
              comment,
              reviewUrl,
            }),
          })
        )
      )
    }
  } catch (e) {
    console.error('[email] submitRequest notification failed:', e)
  }

  revalidatePath('/[workspace]/requests', 'page')
  revalidatePath('/[workspace]/dashboard', 'page')
  return { success: true }
}

// ── Delete Request ────────────────────────────────────────────────────────────
export async function deleteRequest(requestId: string) {
  const { supabase, dbUser } = await getWorkspaceContext()

  const { error } = await supabase
    .from('absence_requests')
    .delete()
    .eq('id', requestId)
    .eq('user_id', dbUser.id)
    .eq('status', 'pending')

  if (error) return { error: error.message }

  revalidatePath('/[workspace]/requests', 'page')
  return { success: true }
}

// ── Approve Request (manager/admin) ──────────────────────────────────────────
export async function approveRequest(requestId: string, comment?: string) {
  const { supabase, dbUser } = await getWorkspaceContext()

  // Get the request
  const { data: request } = await supabase
    .from('absence_requests')
    .select('user_id, absence_type_id, total_days, start_date, end_date')
    .eq('id', requestId)
    .single()

  if (!request) return { error: 'Request not found.' }

  const { error } = await supabase
    .from('absence_requests')
    .update({
      status: 'approved',
      reviewer_id: dbUser.id,
      reviewer_comment: comment || null,
    })
    .eq('id', requestId)

  if (error) return { error: error.message }

  // Deduct from balance
  const year = new Date(request.start_date).getFullYear()
  await supabase.rpc('increment_used_days', {
    p_user_id: request.user_id,
    p_type_id: request.absence_type_id,
    p_year: year,
    p_days: request.total_days,
  })

  // Notify employee
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const [{ data: employee }, { data: absenceType }, { data: reviewer }, { data: workspace }] = await Promise.all([
      supabase.from('users').select('email, first_name, last_name').eq('id', request.user_id).single(),
      supabase.from('absence_types').select('name').eq('id', request.absence_type_id).single(),
      supabase.from('users').select('first_name, last_name').eq('id', dbUser.id).single(),
      supabase.from('workspaces').select('slug').eq('id', dbUser.workspace_id).single(),
    ])
    if (employee && absenceType && reviewer && workspace) {
      await sendEmail({
        to: employee.email,
        subject: `Your ${absenceType.name} request has been approved`,
        template: RequestReviewedEmail({
          employeeName: [employee.first_name, employee.last_name].filter(Boolean).join(' ') || 'there',
          reviewerName: [reviewer.first_name, reviewer.last_name].filter(Boolean).join(' ') || 'Your manager',
          status: 'approved',
          absenceType: absenceType.name,
          startDate: format(parseISO(request.start_date), 'MMM d, yyyy'),
          endDate: format(parseISO(request.end_date), 'MMM d, yyyy'),
          totalDays: request.total_days,
          reviewerComment: comment,
          requestsUrl: `${appUrl}/${workspace.slug}/requests`,
        }),
      })
    }
  } catch (e) {
    console.error('[email] approveRequest notification failed:', e)
  }

  revalidatePath('/[workspace]/requests', 'page')
  revalidatePath('/[workspace]/calendar', 'page')
  return { success: true }
}

// ── Reject Request ────────────────────────────────────────────────────────────
export async function rejectRequest(requestId: string, comment: string) {
  const { supabase, dbUser } = await getWorkspaceContext()

  const { data: request } = await supabase
    .from('absence_requests')
    .select('user_id, absence_type_id, total_days, start_date, end_date')
    .eq('id', requestId)
    .single()

  const { error } = await supabase
    .from('absence_requests')
    .update({
      status: 'rejected',
      reviewer_id: dbUser.id,
      reviewer_comment: comment,
    })
    .eq('id', requestId)

  if (error) return { error: error.message }

  // Notify employee
  if (request) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
      const [{ data: employee }, { data: absenceType }, { data: reviewer }, { data: workspace }] = await Promise.all([
        supabase.from('users').select('email, first_name, last_name').eq('id', request.user_id).single(),
        supabase.from('absence_types').select('name').eq('id', request.absence_type_id).single(),
        supabase.from('users').select('first_name, last_name').eq('id', dbUser.id).single(),
        supabase.from('workspaces').select('slug').eq('id', dbUser.workspace_id).single(),
      ])
      if (employee && absenceType && reviewer && workspace) {
        await sendEmail({
          to: employee.email,
          subject: `Your ${absenceType.name} request has been declined`,
          template: RequestReviewedEmail({
            employeeName: [employee.first_name, employee.last_name].filter(Boolean).join(' ') || 'there',
            reviewerName: [reviewer.first_name, reviewer.last_name].filter(Boolean).join(' ') || 'Your manager',
            status: 'rejected',
            absenceType: absenceType.name,
            startDate: format(parseISO(request.start_date), 'MMM d, yyyy'),
            endDate: format(parseISO(request.end_date), 'MMM d, yyyy'),
            totalDays: request.total_days,
            reviewerComment: comment,
            requestsUrl: `${appUrl}/${workspace.slug}/requests`,
          }),
        })
      }
    } catch (e) {
      console.error('[email] rejectRequest notification failed:', e)
    }
  }

  revalidatePath('/[workspace]/requests', 'page')
  return { success: true }
}

// ── Modify Request (manager proposes new dates) ───────────────────────────────
export async function modifyRequest(requestId: string, startDate: string, endDate: string, comment?: string) {
  const { supabase, dbUser } = await getWorkspaceContext()

  const { data: request } = await supabase
    .from('absence_requests')
    .select('user_id, absence_type_id, total_days, start_date, end_date')
    .eq('id', requestId)
    .single()

  const { error } = await supabase
    .from('absence_requests')
    .update({
      status: 'modified',
      reviewer_id: dbUser.id,
      reviewer_comment: comment || null,
      modified_start_date: startDate,
      modified_end_date: endDate,
    })
    .eq('id', requestId)

  if (error) return { error: error.message }

  // Notify employee
  if (request) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
      const [{ data: employee }, { data: absenceType }, { data: reviewer }, { data: workspace }] = await Promise.all([
        supabase.from('users').select('email, first_name, last_name').eq('id', request.user_id).single(),
        supabase.from('absence_types').select('name').eq('id', request.absence_type_id).single(),
        supabase.from('users').select('first_name, last_name').eq('id', dbUser.id).single(),
        supabase.from('workspaces').select('slug').eq('id', dbUser.workspace_id).single(),
      ])
      if (employee && absenceType && reviewer && workspace) {
        await sendEmail({
          to: employee.email,
          subject: `Your ${absenceType.name} request has a proposed modification`,
          template: RequestReviewedEmail({
            employeeName: [employee.first_name, employee.last_name].filter(Boolean).join(' ') || 'there',
            reviewerName: [reviewer.first_name, reviewer.last_name].filter(Boolean).join(' ') || 'Your manager',
            status: 'modified',
            absenceType: absenceType.name,
            startDate: format(parseISO(request.start_date), 'MMM d, yyyy'),
            endDate: format(parseISO(request.end_date), 'MMM d, yyyy'),
            totalDays: request.total_days,
            reviewerComment: comment,
            modifiedStartDate: format(parseISO(startDate), 'MMM d, yyyy'),
            modifiedEndDate: format(parseISO(endDate), 'MMM d, yyyy'),
            requestsUrl: `${appUrl}/${workspace.slug}/requests`,
          }),
        })
      }
    } catch (e) {
      console.error('[email] modifyRequest notification failed:', e)
    }
  }

  revalidatePath('/[workspace]/requests', 'page')
  return { success: true }
}

// ── Accept Modification (user accepts manager's modified dates) ───────────────
export async function acceptModification(requestId: string) {
  const { supabase, dbUser } = await getWorkspaceContext()

  const { data: request } = await supabase
    .from('absence_requests')
    .select('modified_start_date, modified_end_date, absence_type_id, user_id')
    .eq('id', requestId)
    .eq('user_id', dbUser.id)
    .single()

  if (!request || !request.modified_start_date || !request.modified_end_date) {
    return { error: 'Request not found or no modification pending.' }
  }

  const start = new Date(request.modified_start_date)
  const end = new Date(request.modified_end_date)
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const { error } = await supabase
    .from('absence_requests')
    .update({
      status: 'approved',
      start_date: request.modified_start_date,
      end_date: request.modified_end_date,
      total_days: totalDays,
      modified_start_date: null,
      modified_end_date: null,
    })
    .eq('id', requestId)

  if (error) return { error: error.message }

  const year = start.getFullYear()
  await supabase.rpc('increment_used_days', {
    p_user_id: dbUser.id,
    p_type_id: request.absence_type_id,
    p_year: year,
    p_days: totalDays,
  })

  revalidatePath('/[workspace]/requests', 'page')
  return { success: true }
}
