import { formatDateRange } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface UpcomingAbsencesProps {
  requests: Array<{
    id: string
    start_date: string
    end_date: string
    total_days: number
    status: string
    absence_types: { name: string; color: string } | null
  }>
}

export function UpcomingAbsences({ requests }: UpcomingAbsencesProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10 text-center">
        <CalendarDays className="mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-400">No upcoming approved absences.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((req) => {
        const type = req.absence_types
        return (
          <div
            key={req.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs"
          >
            {/* Color dot */}
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: type?.color ?? '#9CA3AF' }}
            />
            {/* Info */}
            <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-0.5">
              <span className="text-sm font-medium text-gray-800">{type?.name ?? 'Absence'}</span>
              <span className="text-sm text-gray-500">{formatDateRange(req.start_date, req.end_date)}</span>
            </div>
            {/* Days badge */}
            <span className="shrink-0 text-xs text-gray-400">{req.total_days}d</span>
            <Badge variant="approved">Approved</Badge>
          </div>
        )
      })}
    </div>
  )
}
