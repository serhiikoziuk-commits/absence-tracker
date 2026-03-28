import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { format, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { CalendarGrid, CalendarAbsence } from '@/components/CalendarGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { colors, typography, spacing, fonts } from '@/constants/theme'

export default function CalendarScreen() {
  const insets = useSafeAreaInsets()
  const today = new Date()

  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDay, setSelectedDay] = useState<Date | null>(today)
  const [absences, setAbsences] = useState<CalendarAbsence[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const fetchAbsences = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('id', authUser.id)
      .single()

    if (!profile) return

    const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd')
    const monthEnd = format(new Date(year, month, 0), 'yyyy-MM-dd')

    const { data } = await supabase
      .from('absence_requests')
      .select('id, user_id, start_date, end_date, total_days, absence_types(name, color), users!user_id(first_name, last_name)')
      .eq('workspace_id', profile.workspace_id)
      .eq('status', 'approved')
      .lte('start_date', monthEnd)
      .gte('end_date', monthStart)
      .order('start_date')

    setAbsences((data as CalendarAbsence[]) ?? [])
  }, [year, month])

  useEffect(() => {
    setLoading(true)
    fetchAbsences().finally(() => setLoading(false))
  }, [fetchAbsences])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAbsences()
    setRefreshing(false)
  }

  function handlePrevMonth() {
    setCurrentDate((d) => subMonths(d, 1))
    setSelectedDay(null)
  }

  function handleNextMonth() {
    setCurrentDate((d) => addMonths(d, 1))
    setSelectedDay(null)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={colors.gray[600]} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[6] }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary[500]} />
          }
          showsVerticalScrollIndicator={false}
        >
          <CalendarGrid
            year={year}
            month={month}
            absences={absences}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing[5], paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  title: { fontSize: typography.xl, fontFamily: fonts.bold, color: colors.gray[900], marginBottom: spacing[3] },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { padding: spacing[2] },
  monthTitle: { fontSize: typography.lg, fontFamily: fonts.semiBold, color: colors.gray[900] },
  content: { padding: spacing[5] },
})
