import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius, spacing, shadows } from '@/constants/theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: boolean
}

export function Card({ children, style, padding = true }: CardProps) {
  return (
    <View style={[styles.card, padding && styles.padding, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...shadows.sm,
  },
  padding: {
    padding: spacing[4],
  },
})
