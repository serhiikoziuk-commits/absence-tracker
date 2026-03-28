import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { format, parseISO, addDays } from 'date-fns'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { BalanceCard } from '@/components/BalanceCard'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { colors, typography, spacing, fonts } from '@/constants/theme'

interface UserData {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  workspace_id: string
}

interface Balance {
  total_days: number
  used_days: number
  absence_types: { name: string; color: string; icon?: string | null } | null
}

interface UpcomingAbsence {
  id: string
  start_date: string
  end_date: string
  total_days: number
  status: string
  absence_types: { name: string; color: string } | null
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingAbsence[]>([])

  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, workspace_id')
      .eq('id', authUser.id)
      .single()

    if (!profile) return
    setUserData(profile)

    const year = new Date().getFullYear()

    const [{ data: balanceData }, { data: upcomingData }] = await Promise.all([
      supabase
        .from('absence_balances')
        .select('total_days, used_days, absence_types(name, color, icon)')
        .eq('user_id', authUser.id)
        .eq('year', year),
      supabase
        .from('absence_requests')
        .select('id, start_date, end_date, total_days, status, absence_types(name, color)')
        .eq('user_id', authUser.id)
        .in('status', ['approved', 'pending', 'modified'])
        .gte('end_date', format(new Date(), 'yyyy-MM-dd'))
        .order('start_date')
        .limit(5),
    ])

    setBalances((balanceData as Balance[]) ?? [])
    setUpcoming((upcomingData as UpcomingAbsence[]) ?? [])
  }, [])

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const firstName = userData?.first_name ?? 'there'
  const fullName = [userData?.first_name, userData?.last_name].filter(Boolean).join(' ')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[6] },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary[500]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
          <Text style={styles.date}>{format(new Date(), 'MMMM d, yyyy')}</Text>
        </View>
        <Avatar name={fullName} url={userData?.avatar_url} size={48} />
      </View>

      {/* Balances */}
      {balances.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Leave balances</Text>
          <View style={styles.balancesGrid}>
            {balances.map((b, i) => (
              <View key={i} style={styles.balanceItem}>
                <BalanceCard
                  name={b.absence_types?.name ?? 'Unknown'}
                  color={b.absence_types?.color ?? colors.gray[300]}
                  totalDays={b.total_days}
                  usedDays={b.used_days}
                />
              </View>
            ))}
          </View>
        </>
      )}

      {balances.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No balance data for {new Date().getFullYear()}</Text>
        </Card>
      )}

      {/* Upcoming absences */}
      <Text style={styles.sectionTitle}>Upcoming</Text>
      {upcoming.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming absences</Text>
        </Card>
      ) : (
        <Card padding={false}>
          {upcoming.map((item, idx) => (
            <View key={item.id} style={[styles.upcomingRow, idx < upcoming.length - 1 && styles.upcomingRowBorder]}>
              <View style={[styles.upcomingDot, { backgroundColor: item.absence_types?.color ?? colors.gray[300] }]} />
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingType}>{item.absence_types?.name ?? 'Absence'}</Text>
                <Text style={styles.upcomingDate}>
                  {format(parseISO(item.start_date), 'MMM d')}
                  {item.start_date !== item.end_date && ` – ${format(parseISO(item.end_date), 'MMM d')}`}
                </Text>
              </View>
              <View style={styles.upcomingRight}>
                <Badge variant={item.status as any}>{item.status}</Badge>
                <Text style={styles.upcomingDays}>{item.total_days}d</Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing[5] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
  },
  greeting: { fontSize: typography.base, fontFamily: fonts.regular, color: colors.gray[500] },
  name: { fontSize: typography['2xl'], fontFamily: fonts.bold, color: colors.gray[900], marginTop: 2 },
  date: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[400], marginTop: 2 },
  sectionTitle: {
    fontSize: typography.base,
    fontFamily: fonts.semiBold,
    color: colors.gray[700],
    marginBottom: spacing[3],
    marginTop: spacing[5],
  },
  balancesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  balanceItem: { width: '48%' },
  emptyCard: { alignItems: 'center', paddingVertical: spacing[6] },
  emptyText: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[400] },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  upcomingRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  upcomingDot: { width: 10, height: 10, borderRadius: 5 },
  upcomingInfo: { flex: 1 },
  upcomingType: { fontSize: typography.base, fontFamily: fonts.medium, color: colors.gray[900] },
  upcomingDate: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[500], marginTop: 1 },
  upcomingRight: { alignItems: 'flex-end', gap: 4 },
  upcomingDays: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.gray[400] },
})
