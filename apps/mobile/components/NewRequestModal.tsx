import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native'
import { X, ChevronDown } from 'lucide-react-native'
import {
  format, addDays, eachDayOfInterval, isWeekend, parseISO,
  startOfMonth, endOfMonth, eachDayOfInterval as eachDay, getDay,
} from 'date-fns'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { colors, typography, spacing, radius, fonts } from '@/constants/theme'

interface AbsenceType {
  id: string
  name: string
  color: string
}

interface Balance {
  absence_type_id: string
  total_days: number
  used_days: number
}

interface NewRequestModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  absenceTypes: AbsenceType[]
  balances: Balance[]
  userId: string
  workspaceId: string
}

type PickingFor = 'start' | 'end' | null

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function countWorkingDays(start: Date, end: Date): number {
  if (start > end) return 0
  return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d)).length
}

function MiniCalendar({
  year, month, selectedStart, selectedEnd, pickingFor, onSelect,
}: {
  year: number; month: number
  selectedStart: Date | null; selectedEnd: Date | null
  pickingFor: PickingFor; onSelect: (date: Date) => void
}) {
  const monthStart = new Date(year, month - 1, 1)
  const days = eachDay({ start: monthStart, end: endOfMonth(monthStart) })
  const startPad = getDay(monthStart)
  const totalCells = startPad + days.length
  const rows = Math.ceil(totalCells / 7)

  return (
    <View>
      {/* Headers */}
      <View style={calStyles.weekRow}>
        {DAYS.map((d) => (
          <View key={d} style={calStyles.hCell}>
            <Text style={calStyles.hText}>{d}</Text>
          </View>
        ))}
      </View>
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={calStyles.weekRow}>
          {Array.from({ length: 7 }).map((_, col) => {
            const idx = row * 7 + col - startPad
            const date = idx >= 0 && idx < days.length ? days[idx] : null
            if (!date) return <View key={col} style={calStyles.cell} />

            const t = date.getTime()
            const isStart = selectedStart && t === selectedStart.getTime()
            const isEnd = selectedEnd && t === selectedEnd.getTime()
            const inRange = selectedStart && selectedEnd && t >= selectedStart.getTime() && t <= selectedEnd.getTime()
            const weekend = isWeekend(date)

            return (
              <TouchableOpacity
                key={col}
                style={[
                  calStyles.cell,
                  inRange && calStyles.cellInRange,
                  (isStart || isEnd) && calStyles.cellEndpoint,
                  weekend && calStyles.cellWeekend,
                ]}
                onPress={() => !weekend && onSelect(date)}
                disabled={weekend}
                activeOpacity={0.7}
              >
                <Text style={[
                  calStyles.cellText,
                  (isStart || isEnd) && calStyles.cellEndpointText,
                  weekend && calStyles.cellWeekendText,
                ]}>
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

export function NewRequestModal({
  visible, onClose, onSuccess, absenceTypes, balances, userId, workspaceId,
}: NewRequestModalProps) {
  const insets = useSafeAreaInsets()
  const today = new Date()
  const [selectedType, setSelectedType] = useState<AbsenceType | null>(
    absenceTypes.length > 0 ? absenceTypes[0] : null
  )
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [pickingFor, setPickingFor] = useState<PickingFor>('start')
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const workingDays = startDate && endDate ? countWorkingDays(startDate, endDate) : 0
  const balance = selectedType ? balances.find((b) => b.absence_type_id === selectedType.id) : null
  const remaining = balance ? balance.total_days - balance.used_days : null

  function handleDateSelect(date: Date) {
    if (pickingFor === 'start') {
      setStartDate(date)
      setEndDate(null)
      setPickingFor('end')
    } else {
      if (startDate && date < startDate) {
        setStartDate(date)
        setEndDate(null)
        setPickingFor('end')
      } else {
        setEndDate(date)
        setPickingFor(null)
      }
    }
  }

  function handlePrevMonth() {
    if (calMonth === 1) { setCalMonth(12); setCalYear((y) => y - 1) }
    else setCalMonth((m) => m - 1)
  }

  function handleNextMonth() {
    if (calMonth === 12) { setCalMonth(1); setCalYear((y) => y + 1) }
    else setCalMonth((m) => m + 1)
  }

  async function handleSubmit() {
    if (!selectedType || !startDate || !endDate || workingDays === 0) return
    setLoading(true)

    const { error } = await supabase.from('absence_requests').insert({
      workspace_id: workspaceId,
      user_id: userId,
      absence_type_id: selectedType.id,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      total_days: workingDays,
      comment: comment.trim() || null,
    })

    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    // Reset form
    setStartDate(null)
    setEndDate(null)
    setComment('')
    setPickingFor('start')
    onSuccess()
  }

  const calMonthName = format(new Date(calYear, calMonth - 1, 1), 'MMMM yyyy')

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Request</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Type selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Absence type</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setShowTypePicker((v) => !v)}
            >
              {selectedType && (
                <View style={[styles.typeColorDot, { backgroundColor: selectedType.color }]} />
              )}
              <Text style={styles.typeSelectorText}>{selectedType?.name ?? 'Select type'}</Text>
              <ChevronDown size={16} color={colors.gray[400]} />
            </TouchableOpacity>

            {showTypePicker && (
              <View style={styles.typePicker}>
                {absenceTypes.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeOption, selectedType?.id === t.id && styles.typeOptionSelected]}
                    onPress={() => { setSelectedType(t); setShowTypePicker(false) }}
                  >
                    <View style={[styles.typeColorDot, { backgroundColor: t.color }]} />
                    <Text style={[
                      styles.typeOptionText,
                      selectedType?.id === t.id && styles.typeOptionTextSelected,
                    ]}>
                      {t.name}
                    </Text>
                    {balance && (
                      <Text style={styles.typeBalance}>
                        {balances.find((b) => b.absence_type_id === t.id)
                          ? `${(balances.find((b) => b.absence_type_id === t.id)!.total_days - balances.find((b) => b.absence_type_id === t.id)!.used_days)}d left`
                          : ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {remaining !== null && (
              <Text style={styles.balanceHint}>
                {remaining} days remaining this year
              </Text>
            )}
          </View>

          {/* Date range picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select dates</Text>

            {/* Start/End date display */}
            <View style={styles.dateRangeDisplay}>
              <TouchableOpacity
                style={[styles.dateBox, pickingFor === 'start' && styles.dateBoxActive]}
                onPress={() => setPickingFor('start')}
              >
                <Text style={styles.dateBoxLabel}>From</Text>
                <Text style={[styles.dateBoxValue, !startDate && styles.dateBoxPlaceholder]}>
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Select'}
                </Text>
              </TouchableOpacity>
              <View style={styles.dateArrow}>
                <Text style={styles.dateArrowText}>→</Text>
              </View>
              <TouchableOpacity
                style={[styles.dateBox, pickingFor === 'end' && styles.dateBoxActive]}
                onPress={() => setPickingFor('end')}
              >
                <Text style={styles.dateBoxLabel}>To</Text>
                <Text style={[styles.dateBoxValue, !endDate && styles.dateBoxPlaceholder]}>
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              <View style={styles.calMonthNav}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
                  <Text style={styles.monthNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.calMonthTitle}>{calMonthName}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
                  <Text style={styles.monthNavText}>›</Text>
                </TouchableOpacity>
              </View>
              <MiniCalendar
                year={calYear}
                month={calMonth}
                selectedStart={startDate}
                selectedEnd={endDate}
                pickingFor={pickingFor}
                onSelect={handleDateSelect}
              />
            </View>

            {workingDays > 0 && (
              <View style={styles.daysCountBanner}>
                <Text style={styles.daysCountText}>
                  {workingDays} working {workingDays === 1 ? 'day' : 'days'}
                </Text>
              </View>
            )}
          </View>

          {/* Comment */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Note (optional)</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Any additional notes for your manager..."
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.submitSection}>
            <Button
              onPress={handleSubmit}
              loading={loading}
              disabled={!selectedType || !startDate || !endDate || workingDays === 0}
              size="lg"
            >
              Submit request
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTitle: { fontSize: typography.lg, fontFamily: fonts.bold, color: colors.gray[900] },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: { flex: 1 },
  section: { paddingHorizontal: spacing[5], paddingTop: spacing[5] },
  sectionLabel: { fontSize: typography.sm, fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing[2] },

  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    padding: spacing[3],
    backgroundColor: colors.white,
  },
  typeColorDot: { width: 10, height: 10, borderRadius: 5 },
  typeSelectorText: { flex: 1, fontSize: typography.base, fontFamily: fonts.medium, color: colors.gray[800] },
  typePicker: {
    marginTop: spacing[1],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  typeOptionSelected: { backgroundColor: colors.primary[50] },
  typeOptionText: { flex: 1, fontSize: typography.base, fontFamily: fonts.regular, color: colors.gray[800] },
  typeOptionTextSelected: { fontFamily: fonts.semiBold, color: colors.primary[700] },
  typeBalance: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.gray[400] },
  balanceHint: { fontSize: typography.xs, fontFamily: fonts.regular, color: colors.gray[400], marginTop: spacing[1] },

  dateRangeDisplay: { flexDirection: 'row', gap: spacing[3], alignItems: 'center', marginBottom: spacing[3] },
  dateBox: {
    flex: 1,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
  },
  dateBoxActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  dateBoxLabel: { fontSize: typography.xs, fontFamily: fonts.medium, color: colors.gray[400], marginBottom: 2 },
  dateBoxValue: { fontSize: typography.sm, fontFamily: fonts.semiBold, color: colors.gray[900] },
  dateBoxPlaceholder: { color: colors.gray[300] },
  dateArrow: { alignItems: 'center' },
  dateArrowText: { fontSize: typography.lg, color: colors.gray[300] },

  calendarContainer: {
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.xl,
    padding: spacing[3],
  },
  calMonthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] },
  calMonthTitle: { fontSize: typography.base, fontFamily: fonts.semiBold, color: colors.gray[900] },
  monthNavBtn: { padding: spacing[2] },
  monthNavText: { fontSize: typography.xl, color: colors.gray[600], fontFamily: fonts.bold },

  daysCountBanner: {
    marginTop: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: radius.lg,
    padding: spacing[3],
    alignItems: 'center',
  },
  daysCountText: { fontSize: typography.sm, fontFamily: fonts.semiBold, color: colors.primary[700] },

  commentInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    padding: spacing[3],
    fontSize: typography.base,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    minHeight: 80,
  },

  submitSection: { padding: spacing[5], paddingBottom: spacing[8] },
})

const calStyles = StyleSheet.create({
  weekRow: { flexDirection: 'row' },
  hCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  hText: { fontSize: 10, fontFamily: fonts.medium, color: colors.gray[400] },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 36 },
  cellInRange: { backgroundColor: colors.primary[50] },
  cellEndpoint: { backgroundColor: colors.primary[600], borderRadius: 8 },
  cellWeekend: { opacity: 0.3 },
  cellText: { fontSize: typography.sm, fontFamily: fonts.regular, color: colors.gray[800] },
  cellEndpointText: { color: colors.white, fontFamily: fonts.bold },
  cellWeekendText: { color: colors.gray[400] },
})
