import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/components/calendar/calendar-view'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export const metadata: Metadata = { title: 'Calendar' }

interface Props {
  params: Promise<{ workspace: string }>
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ params, searchParams }: Props) {
  const { workspace: slug } = await params
  const sp = await searchParams

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect(`/${slug}/login`)

  const { data: currentUser } = await supabase
    .from('users')
    .select('workspace_id')
    .eq('id', authUser.id)
    .single()

  if (!currentUser) redirect(`/${slug}/login`)

  const year = parseInt(sp.year ?? String(new Date().getFullYear()))
  const month = parseInt(sp.month ?? String(new Date().getMonth() + 1))

  const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd')

  // Approved absences in this month
  const { data: absences } = await supabase
    .from('absence_requests')
    .select('id, user_id, start_date, end_date, total_days, absence_types(name, color), users!user_id(first_name, last_name, avatar_url)')
    .eq('workspace_id', currentUser.workspace_id)
    .eq('status', 'approved')
    .lte('start_date', monthEnd)
    .gte('end_date', monthStart)
    .order('start_date')

  // Birthdays this month
  const { data: birthdays } = await supabase
    .from('users')
    .select('id, first_name, last_name, avatar_url, date_of_birth')
    .eq('workspace_id', currentUser.workspace_id)
    .eq('status', 'active')
    .not('date_of_birth', 'is', null)

  // Filter birthdays to this month
  const birthdaysThisMonth = (birthdays ?? []).filter((u) => {
    if (!u.date_of_birth) return false
    const dob = new Date(u.date_of_birth)
    return dob.getMonth() + 1 === month
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">Team absences and upcoming birthdays.</p>
      </div>
      <CalendarView
        absences={(absences ?? []) as AbsenceEvent[]}
        birthdays={birthdaysThisMonth}
        year={year}
        month={month}
        workspaceSlug={slug}
      />
    </div>
  )
}

export type AbsenceEvent = {
  id: string
  user_id: string
  start_date: string
  end_date: string
  total_days: number
  absence_types: { name: string; color: string } | null
  users: { first_name: string | null; last_name: string | null; avatar_url: string | null } | null
}
