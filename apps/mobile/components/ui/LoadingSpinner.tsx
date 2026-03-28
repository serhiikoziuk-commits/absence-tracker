import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { colors } from '@/constants/theme'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  color?: string
}

export function LoadingSpinner({ fullScreen = false, color }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" color={color ?? colors.primary[500]} />
      </View>
    )
  }
  return <ActivityIndicator size="small" color={color ?? colors.primary[500]} />
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
})
