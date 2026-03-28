'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ChevronDown, Trash2, Check, X, Pencil, Paperclip, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn, formatDateRange, getInitials } from '@/lib/utils'
import { deleteRequest, approveRequest, rejectRequest, modifyRequest, acceptModification } from '@/lib/actions/requests'
import type { RequestRow } from '@/app/[workspace]/requests/page'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',  variant: 'pending'   as const },
  approved:  { label: 'Approved', variant: 'approved'  as const },
  rejected:  { label: 'Rejected', variant: 'rejected'  as const },
  modified:  { label: 'Modified', variant: 'modified'  as const },
  cancelled: { label: 'Cancelled',variant: 'cancelled' as const },
}

interface RequestCardProps {
  request: RequestRow
  showUser: boolean
  isManagerView: boolean
}

export function RequestCard({ request, showUser, isManagerView }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [actionMode, setActionMode] = useState<'none' | 'reject' | 'modify'>('none')
  const [rejectComment, setRejectComment] = useState('')
  const [modStart, setModStart] = useState(request.start_date)
  const [modEnd, setModEnd] = useState(request.end_date)
  const [modComment, setModComment] = useState('')
  const [isPending, startTransition] = useTransition()

  const status = STATUS_CONFIG[request.status]
  const type = request.absence_types

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteRequest(request.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Request deleted.')
    })
  }

  function handleApprove() {
    startTransition(async () => {
      const res = await approveRequest(request.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Request approved.')
    })
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectRequest(request.id, rejectComment)
      if (res?.error) toast.error(res.error)
      else { toast.success('Request rejected.'); setActionMode('none') }
    })
  }

  function handleModify() {
    startTransition(async () => {
      const res = await modifyRequest(request.id, modStart, modEnd, modComment)
      if (res?.error) toast.error(res.error)
      else { toast.success('Modification sent to employee.'); setActionMode('none') }
    })
  }

  function handleAcceptModification() {
    startTransition(async () => {
      const res = await acceptModification(request.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Modification accepted and approved.')
    })
  }

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: type?.color ?? '#9CA3AF' }}
    >
      {/* Card header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {showUser && request.users && (
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={request.users.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {getInitials(request.users.first_name, request.users.last_name)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {showUser && request.users && (
              <span className="text-sm font-semibold text-gray-900">
                {[request.users.first_name, request.users.last_name].filter(Boolean).join(' ')}
              </span>
            )}
            <span
              className="text-sm font-medium"
              style={{ color: type?.color ?? '#374151' }}
            >
              {type?.name ?? 'Absence'}
            </span>
            <span className="text-sm text-gray-500">
              {formatDateRange(request.start_date, request.end_date)}
            </span>
            <span className="text-xs text-gray-400">{request.total_days}d</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={status.variant}>{status.label}</Badge>
          {request.absence_request_files?.length > 0 && (
            <Paperclip className="h-3.5 w-3.5 text-gray-400" />
          )}
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Comment */}
          {request.comment && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Employee note</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{request.comment}</p>
            </div>
          )}

          {/* Manager comment */}
          {request.reviewer_comment && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Manager note</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{request.reviewer_comment}</p>
            </div>
          )}

          {/* Modification proposed */}
          {request.status === 'modified' && request.modified_start_date && (
            <div className="rounded-lg border border-info-100 bg-info-100/50 px-3 py-3 space-y-2">
              <p className="text-xs font-semibold text-info-600">Manager proposed new dates</p>
              <p className="text-sm text-gray-700">
                {formatDateRange(request.modified_start_date, request.modified_end_date!)}
              </p>
              {!isManagerView && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleAcceptModification} disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Accept
                  </Button>
                  <Button size="sm" variant="outline">Propose different dates</Button>
                </div>
              )}
            </div>
          )}

          {/* Files */}
          {request.absence_request_files?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {request.absence_request_files.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    <Paperclip className="h-3 w-3" />
                    {file.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Manager actions */}
          {isManagerView && request.status === 'pending' && actionMode === 'none' && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={handleApprove} disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActionMode('modify')}>
                <Pencil className="h-3.5 w-3.5" />
                Modify dates
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActionMode('reject')} className="text-error-600 hover:bg-error-100 border-error-600/30">
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          )}

          {/* Reject form */}
          {actionMode === 'reject' && (
            <div className="space-y-3">
              <Textarea
                label="Reason for rejection (optional)"
                placeholder="Please provide a reason..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : null}
                  Confirm rejection
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setActionMode('none')}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Modify form */}
          {actionMode === 'modify' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="New start date" type="date" value={modStart} onChange={(e) => setModStart(e.target.value)} />
                <Input label="New end date" type="date" value={modEnd} onChange={(e) => setModEnd(e.target.value)} />
              </div>
              <Textarea
                label="Note to employee (optional)"
                value={modComment}
                onChange={(e) => setModComment(e.target.value)}
                placeholder="Explain why you're modifying the dates..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleModify} disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : null}
                  Send modification
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setActionMode('none')}>Cancel</Button>
              </div>
            </div>
          )}

          {/* User: delete pending */}
          {!isManagerView && request.status === 'pending' && (
            <div className="flex justify-end pt-1">
              <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending}
                className="text-error-600 hover:bg-error-100">
                <Trash2 className="h-3.5 w-3.5" />
                Cancel request
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Submitted {format(new Date(request.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      )}
    </div>
  )
}
