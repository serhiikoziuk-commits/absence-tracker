import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card } from '@/components/ui/Card'
import { colors, typography, spacing, radius, fonts } from '@/constants/theme'

interface BalanceCardProps {
  name: string
  color: string
  totalDays: number
  usedDays: number
}

export function BalanceCard({ name, color, totalDays, usedDays }: BalanceCardProps) {
  const remaining = Math.max(0, totalDays - usedDays)
  const progress = totalDays > 0 ? (usedDays / totalDays) * 100 : 0

  return (
    <Card style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.daysRow}>
          <Text style={styles.remaining}>{remaining}</Text>
          <Text style={styles.total}> / {totalDays}d</Text>
        </View>
        <Text style={styles.label}>{usedDays} used</Text>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` as any, backgroundColor: color }]} />
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  colorBar: {
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: { padding: spacing[3] },
  name: {
    fontSize: typography.xs,
    fontFamily: fonts.medium,
    color: colors.gray[500],
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  daysRow: { flexDirection: 'row', alignItems: 'baseline' },
  remaining: {
    fontSize: typography['2xl'],
    fontFamily: fonts.bold,
    color: colors.gray[900],
  },
  total: {
    fontSize: typography.sm,
    fontFamily: fonts.regular,
    color: colors.gray[400],
  },
  label: {
    fontSize: typography.xs,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    marginTop: 2,
    marginBottom: spacing[2],
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
})
