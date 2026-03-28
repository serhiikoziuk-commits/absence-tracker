import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, radius, fonts, spacing } from '@/constants/theme'

type BadgeVariant =
  | 'default'
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'modified'
  | 'cancelled'
  | 'active'
  | 'blocked'
  | 'invited'
  | 'admin'
  | 'user'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.primary[100], text: colors.primary[700] },
  approved: { bg: colors.success[100], text: colors.success[700] },
  pending: { bg: colors.warning[100], text: colors.warning[700] },
  rejected: { bg: colors.error[100], text: colors.error[600] },
  modified: { bg: colors.info[100], text: colors.info[600] },
  cancelled: { bg: colors.gray[100], text: colors.gray[500] },
  active: { bg: colors.success[100], text: colors.success[700] },
  blocked: { bg: colors.error[100], text: colors.error[600] },
  invited: { bg: colors.warning[100], text: colors.warning[700] },
  admin: { bg: colors.primary[100], text: colors.primary[700] },
  user: { bg: colors.gray[100], text: colors.gray[600] },
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const vs = variantStyles[variant]
  return (
    <View style={[styles.container, { backgroundColor: vs.bg }]}>
      <Text style={[styles.text, { color: vs.text }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.xs,
    fontFamily: fonts.medium,
    textTransform: 'capitalize',
  },
})
