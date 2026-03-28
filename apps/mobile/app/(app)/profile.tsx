import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { format, parseISO } from 'date-fns'
import { LogOut, Briefcase, Calendar, Mail, Shield } from 'lucide-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { colors, typography, spacing, fonts, radius } from '@/constants/theme'

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  job_title: string | null
  start_date: string | null
  role: 'user' | 'admin'
  status: 'active' | 'blocked' | 'invited'
  workspace_id: string
}

interface TeamInfo {
  teams: { name: string } | null
  is_manager: boolean
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [teams, setTeams] = useState<TeamInfo[]>([])
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const [{ data: profileData }, { data: teamData }] = await Promise.all([
      supabase
        .from('users')
        .select('id, first_name, last_name, email, avatar_url, job_title, start_date, role, status, workspace_id')
        .eq('id', authUser.id)
        .single(),
      supabase
        .from('team_members')
        .select('is_manager, teams(name)')
        .eq('user_id', authUser.id),
    ])

    if (profileData) {
      setProfile(profileData as UserProfile)

      // Get workspace name
      const { data: ws } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', profileData.workspace_id)
        .single()
      setWorkspaceName(ws?.name ?? null)
    }

    setTeams((teamData as TeamInfo[]) ?? [])
  }, [])

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          await AsyncStorage.removeItem('workspace_slug')
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  if (loading) return <LoadingSpinner fullScreen />

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Unknown'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[8] },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary[500]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileTop}>
          <Avatar name={fullName} url={profile?.avatar_url} size={72} />
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            <View style={styles.badgeRow}>
              <Badge variant={profile?.role ?? 'user'}>{profile?.role ?? 'user'}</Badge>
              <Badge variant={profile?.status ?? 'active'}>{profile?.status ?? 'active'}</Badge>
            </View>
          </View>
        </View>
        {workspaceName && (
          <View style={styles.workspaceRow}>
            <Shield size={14} color={colors.gray[400]} />
            <Text style={styles.workspaceName}>{workspaceName}</Text>
          </View>
        )}
      </Card>

      {/* Info rows */}
      <Card style={styles.infoCard}>
        {profile?.job_title && (
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Briefcase size={16} color={colors.gray[400]} />
            <View>
              <Text style={styles.infoLabel}>Job title</Text>
              <Text style={styles.infoValue}>{profile.job_title}</Text>
            </View>
          </View>
        )}
        {profile?.start_date && (
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Calendar size={16} color={colors.gray[400]} />
            <View>
              <Text style={styles.infoLabel}>Start date</Text>
              <Text style={styles.infoValue}>{format(parseISO(profile.start_date), 'MMMM d, yyyy')}</Text>
            </View>
          </View>
        )}
        <View style={styles.infoRow}>
          <Mail size={16} color={colors.gray[400]} />
          <View>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>
        </View>
      </Card>

      {/* Teams */}
      {teams.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Teams</Text>
          <Card>
            {teams.map((t, i) => (
              <View key={i} style={[styles.teamRow, i < teams.length - 1 && styles.teamRowBorder]}>
                <Text style={styles.teamName}>{t.teams?.name ?? 'Unknown team'}</Text>
                {t.is_manager && <Badge variant="admin">Manager</Badge>}
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <LogOut size={18} color={colors.error[600]} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing[5] },
  profileCard: { marginBottom: spacing[4] },
  profileTop: { flexDirection: 'row', gap: spacing[4], alignItems: 'flex-start' },
  profileMeta: { flex: 1 },
  profileName: { fontSize: typography.xl, fontFamily: fonts.bold, color: colors.gray[900] },
  profileEmail: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[500], marginTop: 2, marginBottom: spacing[2] },
  badgeRow: { flexDirection: 'row', gap: spacing[2] },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  workspaceName: { fontSize: typography.sm, fontFamily: fonts.medium, color: colors.gray[500] },

  infoCard: { marginBottom: spacing[4] },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], paddingVertical: spacing[3] },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  infoLabel: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.gray[400] },
  infoValue: { fontSize: typography.sm, fontFamily: fonts.medium, color: colors.gray[800], marginTop: 1 },

  sectionTitle: {
    fontSize: typography.sm,
    fontFamily: fonts.semiBold,
    color: colors.gray[500],
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[3] },
  teamRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  teamName: { fontSize: typography.base, fontFamily: fonts.medium, color: colors.gray[800] },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.error[100],
    backgroundColor: colors.error[100],
  },
  signOutText: { fontSize: typography.base, fontFamily: fonts.semiBold, color: colors.error[600] },
})
