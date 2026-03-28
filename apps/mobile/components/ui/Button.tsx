import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native'
import { colors, typography, radius, fonts, spacing } from '@/constants/theme'

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary[600]}
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  size_sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[3], minHeight: 36 },
  size_md: { paddingVertical: spacing[3], paddingHorizontal: spacing[4], minHeight: 44 },
  size_lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[6], minHeight: 52 },

  variant_primary: { backgroundColor: colors.primary[600] },
  variant_secondary: { backgroundColor: colors.primary[100] },
  variant_outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.gray[300] },
  variant_ghost: { backgroundColor: 'transparent' },
  variant_destructive: { backgroundColor: colors.error[600] },

  disabled: { opacity: 0.5 },

  text: { fontFamily: fonts.semiBold },
  text_primary: { color: colors.white },
  text_secondary: { color: colors.primary[700] },
  text_outline: { color: colors.gray[700] },
  text_ghost: { color: colors.gray[700] },
  text_destructive: { color: colors.white },

  textSize_sm: { fontSize: typography.sm },
  textSize_md: { fontSize: typography.base },
  textSize_lg: { fontSize: typography.lg },
})
