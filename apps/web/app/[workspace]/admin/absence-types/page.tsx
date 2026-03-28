import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AbsenceTypesAdminView } from '@/components/admin/absence-types-admin-view'

export const metadata: Metadata = { title: 'Absence Types — Admin' }

interface Props { params: Promise<{ workspace: string }> }

export default async function AdminAbsenceTypesPage({ params }: Props) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect(`/${slug}/login`)

  const { data: currentUser } = await supabase
    .from('users').select('role, workspace_id').eq('id', authUser.id).single()
  if (!currentUser || currentUser.role !== 'admin') redirect(`/${slug}/dashboard`)

  const { data: absenceTypes } = await supabase
    .from('absence_types')
    .select('*')
    .eq('workspace_id', currentUser.workspace_id)
    .order('sort_order')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Absence Types</h1>
        <p className="mt-1 text-sm text-gray-500">Configure absence categories and accrual rules.</p>
      </div>
      <AbsenceTypesAdminView absenceTypes={absenceTypes ?? []} />
    </div>
  )
}
