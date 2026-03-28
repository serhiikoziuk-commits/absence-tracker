import React from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { colors, typography, radius, fonts, spacing } from '@/constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  prefix?: string
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
}

export function Input({ label, error, prefix, containerStyle, inputStyle, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, inputStyle, style as TextStyle]}
          placeholderTextColor={colors.gray[400]}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: typography.sm,
    fontFamily: fonts.medium,
    color: colors.gray[700],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing[3],
    minHeight: 44,
  },
  inputRowError: { borderColor: colors.error[600] },
  prefix: {
    fontSize: typography.sm,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: typography.base,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    paddingVertical: spacing[2],
  },
  error: {
    fontSize: typography.xs,
    fontFamily: fonts.regular,
    color: colors.error[600],
  },
})
