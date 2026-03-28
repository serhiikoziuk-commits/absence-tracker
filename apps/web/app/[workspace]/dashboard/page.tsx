import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { UpcomingAbsences } from '@/components/dashboard/upcoming-absences'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Dashboard' }

interface Props { params: Promise<{ workspace: string }> }

export default async function DashboardPage({ params }: Props) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect(`/${slug}/login`)

  const { data: user } = await supabase
    .from('users')
    .select('id, first_name, workspace_id')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect(`/${slug}/login`)

  const year = new Date().getFullYear()

  // Fetch balances with absence type info
  const { data: balances } = await supabase
    .from('absence_balances')
    .select('*, absence_types(name, color, icon)')
    .eq('user_id', user.id)
    .eq('year', year)
    .order('created_at')

  // Fetch upcoming approved absences
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: upcoming } = await supabase
    .from('absence_requests')
    .select('*, absence_types(name, color)')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .gte('end_date', today)
    .order('start_date')
    .limit(5)

  const greeting = user.first_name ? `Welcome back, ${user.first_name}` : 'Welcome back'

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{greeting} 👋</h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s your time-off overview for {year}.</p>
      </div>

      {/* Balance Cards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Your balances — {year}
        </h2>
        {(!balances || balances.length === 0) ? (
          <p className="text-sm text-gray-400">No absence types configured yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {balances.map((b) => (
              <BalanceCard key={b.id} balance={b} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Upcoming time off
        </h2>
        <UpcomingAbsences requests={upcoming ?? []} />
      </section>
    </div>
  )
}
