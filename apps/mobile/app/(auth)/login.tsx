import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { colors, typography, spacing, radius, fonts } from '@/constants/theme'

type Step = 'workspace' | 'email' | 'otp'

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<Step>('workspace')
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: Validate workspace slug
  const handleWorkspaceNext = async () => {
    const slug = workspaceSlug.trim().toLowerCase()
    if (!slug) return
    setLoading(true)

    const { data, error } = await supabase
      .from('workspaces')
      .select('name')
      .eq('slug', slug)
      .single()

    setLoading(false)

    if (error || !data) {
      Alert.alert('Workspace not found', 'No workspace found with that slug. Check with your admin.')
      return
    }

    setWorkspaceName(data.name)
    setStep('email')
  }

  // Step 2: Send OTP
  const handleEmailNext = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { shouldCreateUser: false },
    })

    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    setStep('otp')
  }

  // Step 3: Verify OTP + workspace membership
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp,
      type: 'email',
    })

    if (verifyError) {
      setLoading(false)
      Alert.alert('Invalid code', 'The code is incorrect or has expired. Try again.')
      return
    }

    // Verify user is a member of this workspace
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('slug', workspaceSlug.trim().toLowerCase())
        .single()

      if (workspace) {
        const { data: member } = await supabase
          .from('users')
          .select('id')
          .eq('workspace_id', workspace.id)
          .eq('email', user.email!)
          .single()

        if (!member) {
          await supabase.auth.signOut()
          setLoading(false)
          Alert.alert(
            'Not a member',
            "Your account isn't part of this workspace. Contact your admin.",
          )
          return
        }
      }
    }

    await AsyncStorage.setItem('workspace_slug', workspaceSlug.trim().toLowerCase())
    setLoading(false)
    router.replace('/(app)/dashboard')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing[8], paddingBottom: insets.bottom + spacing[6] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AT</Text>
          </View>
          <Text style={styles.appName}>AbsenceTracker</Text>
          <Text style={styles.appTagline}>Team leave management</Text>
        </View>

        {/* Step indicators */}
        <View style={styles.steps}>
          {(['workspace', 'email', 'otp'] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                step === s && styles.stepDotActive,
                ['workspace', 'email', 'otp'].indexOf(step) > i && styles.stepDotDone,
              ]}
            />
          ))}
        </View>

        {/* Step 1: Workspace */}
        {step === 'workspace' && (
          <View style={styles.form}>
            <Text style={styles.title}>Enter your workspace</Text>
            <Text style={styles.subtitle}>Your workspace slug is provided by your admin</Text>
            <Input
              label="Workspace slug"
              placeholder="acme-corp"
              value={workspaceSlug}
              onChangeText={setWorkspaceSlug}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleWorkspaceNext}
            />
            <Button onPress={handleWorkspaceNext} loading={loading}>
              Continue
            </Button>
          </View>
        )}

        {/* Step 2: Email */}
        {step === 'email' && (
          <View style={styles.form}>
            <TouchableOpacity onPress={() => setStep('workspace')} style={styles.backRow}>
              <Text style={styles.backText}>← {workspaceName}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Enter your work email to receive a sign-in code</Text>
            <Input
              label="Work email"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="send"
              onSubmitEditing={handleEmailNext}
            />
            <Button onPress={handleEmailNext} loading={loading}>
              Send code
            </Button>
          </View>
        )}

        {/* Step 3: OTP */}
        {step === 'otp' && (
          <View style={styles.form}>
            <TouchableOpacity onPress={() => setStep('email')} style={styles.backRow}>
              <Text style={styles.backText}>← {email}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Check your inbox</Text>
            <Text style={styles.subtitle}>We sent a 6-digit code to your email</Text>
            <Input
              label="Verification code"
              placeholder="000000"
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              inputStyle={styles.otpInput}
            />
            <Button
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={otp.length !== 6}
            >
              Sign in
            </Button>
            <TouchableOpacity onPress={handleEmailNext} style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive a code? Resend</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, paddingHorizontal: spacing[6] },
  logoSection: { alignItems: 'center', marginBottom: spacing[8] },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  logoText: { color: colors.white, fontSize: typography['2xl'], fontFamily: fonts.bold },
  appName: { fontSize: typography.xl, fontFamily: fonts.bold, color: colors.gray[900] },
  appTagline: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[400], marginTop: 2 },

  steps: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing[6] },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.gray[200],
  },
  stepDotActive: { backgroundColor: colors.primary[500], width: 20 },
  stepDotDone: { backgroundColor: colors.primary[200] },

  form: { gap: spacing[4] },
  title: { fontSize: typography['2xl'], fontFamily: fonts.bold, color: colors.gray[900] },
  subtitle: { fontSize: typography.base, fontFamily: fonts.regular, color: colors.gray[500], marginTop: -spacing[2] },
  backRow: { marginBottom: -spacing[1] },
  backText: { fontSize: typography.sm, fontFamily: fonts.medium, color: colors.primary[600] },

  otpInput: { letterSpacing: 12, textAlign: 'center', fontSize: typography['2xl'], fontFamily: fonts.bold },

  resendRow: { alignItems: 'center' },
  resendText: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.primary[600] },
})
