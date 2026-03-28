/**
 * Typed helpers that cast Supabase query results to our known row types.
 * These casts are safe — they will be replaced by generated types once
 * `npx supabase gen types typescript` is run against a real project.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

export type WorkspaceRow      = Tables['workspaces']['Row']
export type UserRow           = Tables['users']['Row']
export type TeamRow           = Tables['teams']['Row']
export type TeamMemberRow     = Tables['team_members']['Row']
export type AbsenceTypeRow    = Tables['absence_types']['Row']
export type AbsenceBalanceRow = Tables['absence_balances']['Row']
export type AbsenceRequestRow = Tables['absence_requests']['Row']
export type InviteRow         = Tables['invites']['Row']
export type NotificationRow   = Tables['notifications']['Row']

type SB = SupabaseClient<Database>

// Generic typed query — use when .select() returns `never` due to stub types
export async function typedQuery<T>(
  promise: Promise<{ data: unknown; error: unknown }>
): Promise<T | null> {
  const { data, error } = await promise
  if (error || !data) return null
  return data as T
}
