import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { RequestCard } from '@/components/RequestCard'
import { NewRequestModal } from '@/components/NewRequestModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { colors, typography, spacing, fonts, radius } from '@/constants/theme'

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'modified' | 'cancelled'

interface RequestItem {
  id: string
  user_id: string
  absence_type_id: string
  start_date: string
  end_date: string
  total_days: number
  status: RequestStatus
  comment: string | null
  reviewer_comment: string | null
  modified_start_date: string | null
  modified_end_date: string | null
  created_at: string
  absence_types: { name: string; color: string } | null
  absence_request_files: { id: string; file_url: string; file_name: string }[]
}

interface AbsenceType { id: string; name: string; color: string }
interface Balance { absence_type_id: string; total_days: number; used_days: number }

type ActiveTab = 'mine' | 'team'

export default function RequestsScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('mine')
  const [myRequests, setMyRequests] = useState<RequestItem[]>([])
  const [teamRequests, setTeamRequests] = useState<RequestItem[]>([])
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isManager, setIsManager] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('users')
      .select('id, workspace_id, role')
      .eq('id', authUser.id)
      .single()

    if (!profile) return
    setUserId(profile.id)
    setWorkspaceId(profile.workspace_id)
    setIsAdmin(profile.role === 'admin')

    const year = new Date().getFullYear()

    const [{ data: myReqs }, { data: types }, { data: bals }] = await Promise.all([
      supabase
        .from('absence_requests')
        .select('*, absence_types(name, color), absence_request_files(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('absence_types')
        .select('id, name, color')
        .eq('workspace_id', profile.workspace_id)
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('absence_balances')
        .select('absence_type_id, total_days, used_days')
        .eq('user_id', profile.id)
        .eq('year', year),
    ])

    setMyRequests((myReqs as RequestItem[]) ?? [])
    setAbsenceTypes(types ?? [])
    setBalances(bals ?? [])

    // Team requests for admin
    if (profile.role === 'admin') {
      const { data: teamReqs } = await supabase
        .from('absence_requests')
        .select('*, absence_types(name, color), users!user_id(first_name, last_name, avatar_url, job_title), absence_request_files(*)')
        .eq('workspace_id', profile.workspace_id)
        .neq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setTeamRequests((teamReqs as any[]) ?? [])
    } else {
      // Check if manager
      const { data: managerTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', profile.id)
        .eq('is_manager', true)

      if (managerTeams && managerTeams.length > 0) {
        setIsManager(true)
        const teamIds = managerTeams.map((t) => t.team_id)
        const { data: memberIds } = await supabase
          .from('team_members')
          .select('user_id')
          .in('team_id', teamIds)
          .neq('user_id', profile.id)

        if (memberIds && memberIds.length > 0) {
          const userIds = memberIds.map((m) => m.user_id)
          const { data: teamReqs } = await supabase
            .from('absence_requests')
            .select('*, absence_types(name, color), users!user_id(first_name, last_name, avatar_url, job_title), absence_request_files(*)')
            .in('user_id', userIds)
            .order('created_at', { ascending: false })
            .limit(50)

          setTeamRequests((teamReqs as any[]) ?? [])
        }
      }
    }
  }, [])

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const showTeamTab = isAdmin || isManager

  if (loading) return <LoadingSpinner fullScreen />

  const displayedRequests = activeTab === 'mine' ? myRequests : teamRequests

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
      </View>

      {/* Tabs */}
      {showTeamTab && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'mine' && styles.tabActive]}
            onPress={() => setActiveTab('mine')}
          >
            <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>
              Mine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'team' && styles.tabActive]}
            onPress={() => setActiveTab('team')}
          >
            <Text style={[styles.tabText, activeTab === 'team' && styles.tabTextActive]}>
              Team
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={displayedRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing[6] + 72 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary[500]} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to submit your first request</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RequestCard
            id={item.id}
            status={item.status}
            startDate={item.start_date}
            endDate={item.end_date}
            totalDays={item.total_days}
            comment={item.comment}
            reviewerComment={item.reviewer_comment}
            modifiedStartDate={item.modified_start_date}
            modifiedEndDate={item.modified_end_date}
            absenceType={item.absence_types}
            user={(item as any).users}
            showUser={activeTab === 'team'}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + spacing[5] + 60 }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>

      {/* New Request Modal */}
      {userId && workspaceId && (
        <NewRequestModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={() => {
            setModalVisible(false)
            handleRefresh()
          }}
          absenceTypes={absenceTypes}
          balances={balances}
          userId={userId}
          workspaceId={workspaceId}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: { fontSize: typography.xl, fontFamily: fonts.bold, color: colors.gray[900] },

  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
    gap: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  tabActive: { backgroundColor: colors.primary[600] },
  tabText: { fontSize: typography.sm, fontFamily: fonts.medium, color: colors.gray[500] },
  tabTextActive: { color: colors.white, fontFamily: fonts.semiBold },

  listContent: { padding: spacing[5] },
  emptyState: { alignItems: 'center', paddingTop: spacing[8] * 3 },
  emptyTitle: { fontSize: typography.lg, fontFamily: fonts.semiBold, color: colors.gray[600] },
  emptySubtitle: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[400], marginTop: spacing[2] },

  fab: {
    position: 'absolute',
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
})
