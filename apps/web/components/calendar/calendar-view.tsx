'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, getDay, isToday, isSameDay, parseISO, isWithinInterval
} from 'date-fns'
import { ChevronLeft, ChevronRight, Cake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { AbsenceEvent } from '@/app/[workspace]/calendar/page'

interface Birthday {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  date_of_birth: string | null
}

interface CalendarViewProps {
  absences: AbsenceEvent[]
  birthdays: Birthday[]
  year: number
  month: number
  workspaceSlug: string
}

export function CalendarView({ absences, birthdays, year, month, workspaceSlug }: CalendarViewProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const currentDate = new Date(year, month - 1, 1)
  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) })

  // Pad start: Monday = 0
  const firstDayOfWeek = (getDay(days[0]) + 6) % 7 // convert Sun=0 to Mon=0
  const paddedDays: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ]

  function navigate(dir: -1 | 1) {
    const next = new Date(year, month - 1 + dir, 1)
    router.push(`/${workspaceSlug}/calendar?year=${next.getFullYear()}&month=${next.getMonth() + 1}`)
  }

  // Build dot map: date string → array of colors
  const dotMap: Record<string, string[]> = {}
  for (const absence of absences) {
    const start = parseISO(absence.start_date)
    const end = parseISO(absence.end_date)
    const color = absence.absence_types?.color ?? '#9CA3AF'
    for (const day of days) {
      if (isWithinInterval(day, { start, end })) {
        const key = format(day, 'yyyy-MM-dd')
        if (!dotMap[key]) dotMap[key] = []
        dotMap[key].push(color)
      }
    }
  }

  // Selected day absences
  const selectedDayAbsences = selectedDay
    ? absences.filter((a) => {
        const start = parseISO(a.start_date)
        const end = parseISO(a.end_date)
        return isWithinInterval(selectedDay, { start, end })
      })
    : []

  // Birthday map
  const birthdayMap: Record<string, Birthday[]> = {}
  for (const b of birthdays) {
    if (!b.date_of_birth) continue
    const dob = new Date(b.date_of_birth)
    const key = format(new Date(year, month - 1, dob.getDate()), 'yyyy-MM-dd')
    if (!birthdayMap[key]) birthdayMap[key] = []
    birthdayMap[key].push(b)
  }

  const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Calendar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
          {/* Month nav */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week day headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />
              const key = format(day, 'yyyy-MM-dd')
              const dots = dotMap[key] ?? []
              const bdays = birthdayMap[key] ?? []
              const today = isToday(day)
              const selected = selectedDay ? isSameDay(day, selectedDay) : false

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(selected ? null : day)}
                  className={`flex flex-col items-center rounded-xl py-1.5 transition-colors hover:bg-gray-50 ${
                    selected ? 'bg-primary-50 ring-1 ring-primary-200' : ''
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                      today
                        ? 'bg-primary-600 text-white'
                        : selected
                        ? 'text-primary-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {/* Absence dots */}
                  {dots.length > 0 && (
                    <div className="mt-0.5 flex gap-0.5 flex-wrap justify-center max-w-[36px]">
                      {dots.slice(0, 5).map((color, ci) => (
                        <span key={ci} className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                      ))}
                      {dots.length > 5 && (
                        <span className="text-[8px] text-gray-400">+{dots.length - 5}</span>
                      )}
                    </div>
                  )}
                  {/* Birthday indicator */}
                  {bdays.length > 0 && (
                    <span className="mt-0.5 text-[9px]">🎂</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col gap-4">
          {selectedDay && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                {format(selectedDay, 'MMMM d, yyyy')}
              </h3>
              {selectedDayAbsences.length === 0 ? (
                <p className="text-sm text-gray-400">No absences on this day.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedDayAbsences.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.absence_types?.color }} />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={a.users?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[9px]">
                          {getInitials(a.users?.first_name, a.users?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm text-gray-700">
                        {[a.users?.first_name, a.users?.last_name].filter(Boolean).join(' ')}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: (a.absence_types?.color ?? '#9CA3AF') + '20', color: a.absence_types?.color }}
                      >
                        {a.absence_types?.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Monthly breakdown */}
      <MonthlyBreakdown absences={absences} year={year} month={month} />

      {/* Birthdays */}
      {birthdays.length > 0 && <BirthdaysBlock birthdays={birthdays} month={month} />}
    </div>
  )
}

function MonthlyBreakdown({ absences, year, month }: { absences: AbsenceEvent[]; year: number; month: number }) {
  // Group by user
  const byUser: Record<string, { user: AbsenceEvent['users']; absences: AbsenceEvent[] }> = {}
  for (const a of absences) {
    if (!byUser[a.user_id]) byUser[a.user_id] = { user: a.users, absences: [] }
    byUser[a.user_id].absences.push(a)
  }

  const entries = Object.entries(byUser)
  if (entries.length === 0) return null

  const daysInMonth = new Date(year, month, 0).getDate()

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        {format(new Date(year, month - 1, 1), 'MMMM')} — who&apos;s out
      </h3>
      <div className="flex flex-col gap-3">
        {entries.map(([userId, { user, absences: userAbsences }]) => (
          <div key={userId} className="flex items-center gap-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">{getInitials(user?.first_name, user?.last_name)}</AvatarFallback>
            </Avatar>
            <span className="w-28 shrink-0 text-sm text-gray-700 truncate">
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ')}
            </span>
            {/* Timeline bar */}
            <div className="relative flex-1 h-6">
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd')
                  const matchingAbsence = userAbsences.find((a) =>
                    isWithinInterval(new Date(year, month - 1, day), {
                      start: parseISO(a.start_date),
                      end: parseISO(a.end_date),
                    })
                  )
                  return (
                    <div
                      key={day}
                      className={`h-full ${matchingAbsence ? 'opacity-90' : ''}`}
                      style={matchingAbsence ? {
                        background: matchingAbsence.absence_types?.color ?? '#9CA3AF',
                        borderRadius: '2px',
                      } : {}}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BirthdaysBlock({ birthdays, month }: { birthdays: Birthday[]; month: number }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Cake className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-amber-800">
          Birthdays in {format(new Date(2024, month - 1, 1), 'MMMM')}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {birthdays.map((b) => (
          <div key={b.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-xs">
            <Avatar className="h-6 w-6">
              <AvatarImage src={b.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">{getInitials(b.first_name, b.last_name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-700">
              {[b.first_name, b.last_name].filter(Boolean).join(' ')}
            </span>
            {b.date_of_birth && (
              <span className="text-xs text-amber-600">
                {format(new Date(b.date_of_birth), 'MMM d')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
