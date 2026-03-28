import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ChevronDown, ChevronUp, CalendarDays, Clock } from 'lucide-react-native'
import { format, parseISO } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { colors, typography, spacing, fonts } from '@/constants/theme'

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'modified' | 'cancelled'

interface RequestCardProps {
  id: string
  status: RequestStatus
  startDate: string
  endDate: string
  totalDays: number
  comment?: string | null
  reviewerComment?: string | null
  modifiedStartDate?: string | null
  modifiedEndDate?: string | null
  absenceType: { name: string; color: string } | null
  user?: { first_name: string | null; last_name: string | null; avatar_url: string | null; job_title: string | null } | null
  showUser?: boolean
}

function formatDateRange(start: string, end: string): string {
  const s = parseISO(start)
  const e = parseISO(end)
  if (start === end) return format(s, 'MMM d, yyyy')
  if (s.getFullYear() === e.getFullYear()) return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`
  return `${format(s, 'MMM d, yyyy')} – ${format(e, 'MMM d, yyyy')}`
}

export function RequestCard({
  status,
  startDate,
  endDate,
  totalDays,
  comment,
  reviewerComment,
  modifiedStartDate,
  modifiedEndDate,
  absenceType,
  user,
  showUser = false,
}: RequestCardProps) {
  const [expanded, setExpanded] = useState(false)

  const displayStart = modifiedStartDate ?? startDate
  const displayEnd = modifiedEndDate ?? endDate

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown'
    : null

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded((v) => !v)}
        style={styles.header}
      >
        {/* Left: type color dot + name */}
        <View style={styles.leftSection}>
          <View style={[styles.typeDot, { backgroundColor: absenceType?.color ?? colors.gray[300] }]} />
          <View style={styles.mainInfo}>
            <Text style={styles.typeName}>{absenceType?.name ?? 'Absence'}</Text>
            <Text style={styles.dateRange}>{formatDateRange(displayStart, displayEnd)}</Text>
          </View>
        </View>

        {/* Right: days count + badge + chevron */}
        <View style={styles.rightSection}>
          <View style={styles.rightMeta}>
            <Text style={styles.daysCount}>{totalDays}d</Text>
            <Badge variant={status}>{status}</Badge>
          </View>
          {expanded ? (
            <ChevronUp size={16} color={colors.gray[400]} />
          ) : (
            <ChevronDown size={16} color={colors.gray[400]} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded details */}
      {expanded && (
        <View style={styles.details}>
          <View style={styles.divider} />

          {showUser && fullName && (
            <View style={styles.detailRow}>
              <Avatar name={fullName} url={user?.avatar_url} size={28} />
              <View>
                <Text style={styles.detailLabel}>Requested by</Text>
                <Text style={styles.detailValue}>{fullName}</Text>
                {user?.job_title && <Text style={styles.detailSub}>{user.job_title}</Text>}
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <CalendarDays size={16} color={colors.gray[400]} />
            <View>
              <Text style={styles.detailLabel}>Period</Text>
              <Text style={styles.detailValue}>{formatDateRange(startDate, endDate)}</Text>
              {modifiedStartDate && (
                <Text style={styles.modifiedText}>
                  → Modified: {formatDateRange(modifiedStartDate, modifiedEndDate!)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={colors.gray[400]} />
            <View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{totalDays} working {totalDays === 1 ? 'day' : 'days'}</Text>
            </View>
          </View>

          {comment && (
            <View style={styles.commentBox}>
              <Text style={styles.commentLabel}>Your note</Text>
              <Text style={styles.commentText}>{comment}</Text>
            </View>
          )}

          {reviewerComment && (
            <View style={[styles.commentBox, styles.reviewerBox]}>
              <Text style={styles.commentLabel}>Reviewer's note</Text>
              <Text style={styles.commentText}>{reviewerComment}</Text>
            </View>
          )}
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing[3] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing[3] },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  mainInfo: { flex: 1 },
  typeName: { fontSize: typography.base, fontFamily: fonts.semiBold, color: colors.gray[900] },
  dateRange: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[500], marginTop: 1 },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  rightMeta: { alignItems: 'flex-end', gap: 4 },
  daysCount: { fontSize: typography.sm, fontFamily: fonts.semiBold, color: colors.gray[700] },

  details: { paddingHorizontal: spacing[4], paddingBottom: spacing[4] },
  divider: { height: 1, backgroundColor: colors.gray[100], marginBottom: spacing[3] },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  detailLabel: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.gray[400] },
  detailValue: { fontSize: typography.sm, fontFamily: fonts.medium, color: colors.gray[800], marginTop: 1 },
  detailSub: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.gray[400] },
  modifiedText: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.primary[600], marginTop: 2 },
  commentBox: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing[3],
    marginTop: spacing[1],
  },
  reviewerBox: { backgroundColor: colors.primary[50] },
  commentLabel: { fontSize: typography.xs, fontFamily: fonts.medium, color: colors.gray[400], marginBottom: 2 },
  commentText: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[700] },
})
