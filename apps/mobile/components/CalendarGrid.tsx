import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, format, isSameDay, isToday, parseISO,
} from 'date-fns'
import { colors, typography, spacing, radius, fonts } from '@/constants/theme'

export interface CalendarAbsence {
  id: string
  user_id: string
  start_date: string
  end_date: string
  total_days: number
  absence_types: { name: string; color: string } | null
  users: { first_name: string | null; last_name: string | null } | null
}

interface CalendarGridProps {
  year: number
  month: number
  absences: CalendarAbsence[]
  selectedDay: Date | null
  onSelectDay: (date: Date) => void
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function isInRange(date: Date, start: string, end: string): boolean {
  const d = date.getTime()
  const s = parseISO(start).getTime()
  const e = parseISO(end).getTime()
  return d >= s && d <= e
}

export function CalendarGrid({ year, month, absences, selectedDay, onSelectDay }: CalendarGridProps) {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = endOfMonth(monthStart)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad start
  const startPad = getDay(monthStart)
  const totalCells = startPad + days.length
  const rows = Math.ceil(totalCells / 7)

  // Get absences for a given day
  function getDotsForDay(date: Date) {
    return absences
      .filter((a) => isInRange(date, a.start_date, a.end_date))
      .slice(0, 3)
  }

  // Get absences for selected day
  const selectedAbsences = selectedDay
    ? absences.filter((a) => isInRange(selectedDay, a.start_date, a.end_date))
    : []

  return (
    <View>
      {/* Day headers */}
      <View style={styles.weekRow}>
        {DAYS.map((d) => (
          <View key={d} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={styles.weekRow}>
          {Array.from({ length: 7 }).map((_, col) => {
            const cellIdx = row * 7 + col
            const dayIdx = cellIdx - startPad
            const date = dayIdx >= 0 && dayIdx < days.length ? days[dayIdx] : null
            const dots = date ? getDotsForDay(date) : []
            const isSelected = date && selectedDay ? isSameDay(date, selectedDay) : false
            const isTodayDate = date ? isToday(date) : false

            return (
              <TouchableOpacity
                key={col}
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                onPress={() => date && onSelectDay(date)}
                disabled={!date}
                activeOpacity={0.7}
              >
                {date && (
                  <>
                    <Text
                      style={[
                        styles.dayNumber,
                        isTodayDate && styles.dayNumberToday,
                        isSelected && styles.dayNumberSelected,
                      ]}
                    >
                      {format(date, 'd')}
                    </Text>
                    {dots.length > 0 && (
                      <View style={styles.dotsRow}>
                        {dots.map((a, i) => (
                          <View
                            key={i}
                            style={[
                              styles.dot,
                              { backgroundColor: a.absence_types?.color ?? colors.gray[300] },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      ))}

      {/* Selected day absences */}
      {selectedDay && selectedAbsences.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>{format(selectedDay, 'MMMM d')}</Text>
          {selectedAbsences.map((a) => {
            const name = a.users
              ? [a.users.first_name, a.users.last_name].filter(Boolean).join(' ')
              : 'Unknown'
            return (
              <View key={a.id} style={styles.absenceRow}>
                <View style={[styles.absenceDot, { backgroundColor: a.absence_types?.color ?? colors.gray[300] }]} />
                <View style={styles.absenceInfo}>
                  <Text style={styles.absenceName}>{name}</Text>
                  <Text style={styles.absenceType}>{a.absence_types?.name}</Text>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {selectedDay && selectedAbsences.length === 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>{format(selectedDay, 'MMMM d')}</Text>
          <Text style={styles.emptyText}>No absences on this day</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  weekRow: { flexDirection: 'row' },
  dayHeader: { flex: 1, alignItems: 'center', paddingVertical: spacing[2] },
  dayHeaderText: {
    fontSize: typography.xs,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    textTransform: 'uppercase',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[1],
    minHeight: 48,
    borderRadius: radius.md,
  },
  dayCellSelected: { backgroundColor: colors.primary[50] },
  dayNumber: {
    fontSize: typography.base,
    fontFamily: fonts.regular,
    color: colors.gray[800],
    width: 28,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
    borderRadius: 14,
  },
  dayNumberToday: {
    backgroundColor: colors.primary[600],
    color: colors.white,
    fontFamily: fonts.bold,
  },
  dayNumberSelected: { color: colors.primary[700], fontFamily: fonts.semiBold },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  selectedSection: {
    marginTop: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.gray[50],
    borderRadius: radius.xl,
  },
  selectedTitle: {
    fontSize: typography.base,
    fontFamily: fonts.semiBold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  },
  absenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] },
  absenceDot: { width: 10, height: 10, borderRadius: 5 },
  absenceInfo: {},
  absenceName: { fontSize: typography.sm, fontFamily: fonts.medium, color: colors.gray[800] },
  absenceType: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.gray[500] },
  emptyText: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[400] },
})
