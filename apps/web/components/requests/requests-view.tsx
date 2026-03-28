'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RequestCard } from './request-card'
import { SubmitRequestDialog } from './submit-request-dialog'
import type { RequestRow } from '@/app/[workspace]/requests/page'

interface RequestsViewProps {
  myRequests: RequestRow[]
  teamRequests: RequestRow[] | null
  absenceTypes: { id: string; name: string; color: string }[]
  balances: { absence_type_id: string; total_days: number; used_days: number }[]
  workspaceSlug: string
}

export function RequestsView({ myRequests, teamRequests, absenceTypes, balances, workspaceSlug }: RequestsViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const hasTeamTab = teamRequests !== null
  const pendingTeamCount = (teamRequests ?? []).filter((r) => r.status === 'pending').length

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue="mine" className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="mine">My Requests</TabsTrigger>
              {hasTeamTab && (
                <TabsTrigger value="team" className="relative">
                  Team Requests
                  {pendingTeamCount > 0 && (
                    <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] text-white">
                      {pendingTeamCount}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4" />
              New request
            </Button>
          </div>

          <TabsContent value="mine">
            <RequestList requests={myRequests} showUser={false} />
          </TabsContent>

          {hasTeamTab && (
            <TabsContent value="team">
              <RequestList requests={teamRequests ?? []} showUser={true} isManagerView={true} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <SubmitRequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        absenceTypes={absenceTypes}
        balances={balances}
      />
    </>
  )
}

function RequestList({
  requests,
  showUser,
  isManagerView = false,
}: {
  requests: RequestRow[]
  showUser: boolean
  isManagerView?: boolean
}) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-400">No requests yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => (
        <RequestCard key={req.id} request={req} showUser={showUser} isManagerView={isManagerView} />
      ))}
    </div>
  )
}
