<script setup lang="ts">
import { useTranslation } from '~/composables/useI18n'
import { shiftApi } from '~/api/shift'
import { ApiError } from '~/api/base'
import { communityApi } from '~/api/community'
import type { Community } from '~/api/community'
import { officerApi } from '~/api/officer'
import { ShiftErrorCodes } from '~/api/types/shift'
import type { Shift as ApiShift, ShiftConflictWarning, ShiftStatus } from '~/api/types/shift'
import type { Officer } from '~/api/types/officer'
import { shifts, generateRoute, saveRoute, type Shift, type Waypoint } from '~/composables/useShifts'

const { t } = useTranslation()

const viewMode = ref<'day' | 'week' | 'month'>('week')
const viewModeModel = computed({
  get: () => viewMode.value,
  set: (value: string) => {
    if (value === 'day' || value === 'week' || value === 'month') viewMode.value = value
  },
})
const viewModeOptions = computed(() => [
  { label: t('shifts.day_view'), value: 'day' },
  { label: t('shifts.week_view'), value: 'week' },
  { label: t('shifts.month_view'), value: 'month' },
])
const getToday = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}
const currentDate = ref(getToday())
const calendarDate = computed({
  get: () => toDateString(currentDate.value),
  set: (value: string) => {
    if (value) currentDate.value = new Date(`${value}T00:00:00`)
  },
})
const selectedShift = ref<Shift | null>(null)
const showDetailsPanel = ref(false)
const showAllocationBoard = ref(false)
const showRoutePanel = ref(false)

interface ShiftForm {
  id: string
  communityId: number | ''
  community: string
  site: string
  date: string
  start_time: string
  end_time: string
  officers: string[]
  posts: string[]
  notes: string
  status: Shift['status']
  recurring: boolean
  recurrence_pattern: 'daily' | 'specific_days' | 'every_x_days'
  repeat_on: number[]
  interval_days: number
  end_condition: 'end_date' | 'occurrences' | 'no_end'
  end_date: string
  occurrences: number
}

const emptyShiftForm = (): ShiftForm => ({
  id: '',
  communityId: '',
  community: '',
  site: '',
  date: new Date().toISOString().split('T')[0] || '',
  start_time: '08:00',
  end_time: '16:00',
  officers: [],
  posts: [],
  notes: '',
  status: 'draft',
  recurring: false,
  recurrence_pattern: 'daily',
  repeat_on: [],
  interval_days: 2,
  end_condition: 'no_end',
  end_date: '',
  occurrences: 1,
})

const shiftForm = ref<ShiftForm>(emptyShiftForm())
const isLoadingShiftDetails = ref(false)
const isSavingShift = ref(false)
const shiftFormError = ref('')
const shiftAction = ref<'publish' | 'delete' | 'cancel' | null>(null)
const showDeleteShiftModal = ref(false)
const showCancelShiftModal = ref(false)
const showConflictModal = ref(false)
const conflictWarnings = ref<ShiftConflictWarning[]>([])
const conflictAcknowledged = ref(false)
const showOfficerPicker = ref(false)
const pendingRemoveOfficer = ref<{ id: string; name: string } | null>(null)
const isOfficerActionRunning = ref(false)
const showAllocationConflictModal = ref(false)
const allocationConflictWarnings = ref<ShiftConflictWarning[]>([])
const pendingAllocationOfficerId = ref<string | null>(null)
const allocationConflictAcknowledged = ref(false)
const canManageOfficers = computed(() => !!selectedShift.value && ['draft', 'published', 'active'].includes(shiftForm.value.status))
const isShiftReadOnly = computed(() => !!selectedShift.value && !['draft', 'published'].includes(shiftForm.value.status))
const isNextDay = computed(() => shiftForm.value.end_time <= shiftForm.value.start_time)

const postsInput = computed({
  get: () => shiftForm.value.posts.join(', '),
  set: (value: string) => {
    shiftForm.value.posts = value.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
  },
})

const selectedCommunity = ref<number | ''>('')
const selectedOfficer = ref('')
const selectedStatus = ref<ShiftStatus[]>([])
const dateFrom = ref('')
const dateTo = ref('')
const searchText = ref('')
const debouncedSearchText = ref('')
const communities = ref<Community[]>([])
const officerRecords = ref<Officer[]>([])
const isLoadingCalendar = ref(false)
const calendarError = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null
let calendarRequestId = 0
let detailsRequestId = 0

const officers = computed(() => officerRecords.value.map(officer => [officer.first_name, officer.last_name].filter(Boolean).join(' ')))
const selectedOfficerRecord = computed(() => officerRecords.value.find(officer => [officer.first_name, officer.last_name].filter(Boolean).join(' ') === selectedOfficer.value))
const selectedCommunityName = computed(() => communities.value.find(community => community.community_id === selectedCommunity.value)?.name || '')
const allocatedOfficerIds = computed(() => selectedShift.value?.officerIds || [])
const allocatedOfficerDetails = computed(() => allocatedOfficerIds.value.map(id => officerRecords.value.find(officer => officer.user_id === id)).filter((officer): officer is Officer => !!officer))
const allStatuses: ShiftStatus[] = ['draft', 'published', 'active', 'completed', 'cancelled']
const recurrenceDays = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]
const filteredShifts = computed((): Shift[] => shifts.value)

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toInputTime(time: string): string {
  return time.split(':').slice(0, 2).join(':')
}

function toApiTime(time: string): string {
  const [hour = '00', minute = '00'] = time.split(':')
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

function getCalendarRange(): { dateFrom: string; dateTo: string } {
  if (dateFrom.value || dateTo.value) {
    const fallback = toDateString(currentDate.value)
    return { dateFrom: dateFrom.value || fallback, dateTo: dateTo.value || fallback }
  }
  if (viewMode.value === 'day') {
    const date = toDateString(currentDate.value)
    return { dateFrom: date, dateTo: date }
  }
  if (viewMode.value === 'week') {
    const start = new Date(currentDate.value)
    const weekday = start.getDay()
    start.setDate(start.getDate() - weekday + (weekday === 0 ? -6 : 1))
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { dateFrom: toDateString(start), dateTo: toDateString(end) }
  }
  const start = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const end = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
  return { dateFrom: toDateString(start), dateTo: toDateString(end) }
}

function mapApiShift(shift: ApiShift): Shift {
  return {
    id: `SHF-${shift.shift_id}`,
    apiId: shift.shift_id,
    communityId: shift.community_id,
    seriesId: shift.series_id,
    isOvernight: shift.is_overnight,
    community: shift.community_name || '—',
    site: shift.community_name || '—',
    officers: (shift.officers || []).map(officer => officer.name),
    officerIds: (shift.officers || []).map(officer => officer.officer_id),
    start_time: toInputTime(shift.start_time),
    end_time: toInputTime(shift.end_time),
    date: shift.shift_date,
    status: shift.status,
    posts: (shift.posts || []).map(post => post.post_name),
    notes: shift.notes || '',
  }
}

async function loadCalendar() {
  const requestId = ++calendarRequestId
  const range = getCalendarRange()
  isLoadingCalendar.value = true
  calendarError.value = ''
  try {
    const statuses = selectedStatus.value.length ? selectedStatus.value : [undefined]
    const responses = await Promise.all(statuses.map(status => shiftApi.getShiftsCalendar({
      community_id: selectedCommunity.value || 0,
      date_from: range.dateFrom,
      date_to: range.dateTo,
      officer_id: selectedOfficerRecord.value?.user_id,
      status,
      search_text: debouncedSearchText.value.trim() || undefined,
    }, { showLoading: false })))
    if (requestId !== calendarRequestId) return
    const unique = new Map<number, ApiShift>()
    responses.forEach(response => (response.shifts || []).forEach((shift: ApiShift) => unique.set(shift.shift_id, shift)))
    shifts.value = Array.from(unique.values()).map(mapApiShift)
  } catch (error) {
    if (requestId !== calendarRequestId) return
    console.error('Failed to load shift calendar:', error)
    shifts.value = []
    calendarError.value = t('shifts.load_failed')
  } finally {
    if (requestId === calendarRequestId) isLoadingCalendar.value = false
  }
}

async function loadFilterOptions() {
  const [communityResponse, officerResponse] = await Promise.all([
    communityApi.getCommunities({ include_inactive: false }, { showLoading: false }),
    officerApi.getOfficers({ include_inactive: true }, { showLoading: false }),
  ])
  communities.value = communityResponse.communities || []
  if (communities.value.length === 1) selectedCommunity.value = communities.value[0]!.community_id
  officerRecords.value = officerResponse.officers || []
}

watch(searchText, value => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { debouncedSearchText.value = value }, 400)
})
watch([currentDate, viewMode, selectedCommunity, selectedStatus, selectedOfficerRecord, dateFrom, dateTo, debouncedSearchText], loadCalendar, { deep: true })
onMounted(async () => {
  await loadFilterOptions()
  await loadCalendar()
})
onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const weekDays = computed((): { date: Date; label: string; dateStr: string }[] => {
  const start = new Date(currentDate.value)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({
      date: d,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr: toDateString(d),
    })
  }
  return days
})

const weekDayMinWidths = computed(() => weekDays.value.map(day => {
  const laneCount = getWeekDayLayout(day.dateStr).laneCount
  return laneCount === 1 ? 120 : laneCount * 156 + 16
}))
const weekMinWidth = computed(() => 80 + weekDayMinWidths.value.reduce((total, width) => total + width, 0))
const weekGridTemplateColumns = computed(() => {
  const dayColumns = weekDayMinWidths.value.map(width => `minmax(${width}px, 1fr)`)
  return `80px ${dayColumns.join(' ')}`
})

const monthDays = computed((): { date: Date; dateStr: string; count: number }[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const start = new Date(firstDay)
  start.setDate(start.getDate() - firstDay.getDay())

  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = toDateString(d)
    const count = filteredShifts.value.filter((shift: Shift) => shift.date === dateStr).length
    days.push({ date: d, dateStr, count })
  }
  return days
})

const dayLabel = computed((): string => {
  return currentDate.value.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
})

const currentRangeLabel = computed((): string => {
  if (viewMode.value === 'day') {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
  if (viewMode.value === 'week') {
    const start = weekDays.value[0]?.date ?? new Date()
    const end = weekDays.value[6]?.date ?? new Date()
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

function getShiftsForDate(dateStr: string): Shift[] {
  return filteredShifts.value.filter((shift: Shift) => shift.date === dateStr)
}

function getShiftsForDayView(): Shift[] {
  const dateStr = toDateString(currentDate.value)
  return filteredShifts.value.filter((shift: Shift) => shift.date === dateStr)
}

function openCreateShift() {
  detailsRequestId++
  selectedShift.value = null
  shiftForm.value = emptyShiftForm()
  shiftForm.value.communityId = selectedCommunity.value
  shiftForm.value.community = selectedCommunityName.value
  shiftForm.value.date = toDateString(currentDate.value)
  shiftFormError.value = ''
  showDetailsPanel.value = true
}

function populateShiftForm(shift: Shift) {
  shiftForm.value = {
    id: shift.apiId ? String(shift.apiId) : shift.id,
    communityId: shift.communityId || '',
    community: shift.community,
    site: shift.site,
    date: shift.date,
    start_time: toInputTime(shift.start_time),
    end_time: toInputTime(shift.end_time),
    officers: [...shift.officers],
    posts: [...shift.posts],
    notes: shift.notes,
    status: shift.status,
    recurring: shift.seriesId != null,
    recurrence_pattern: 'daily',
    repeat_on: [],
    interval_days: 2,
    end_condition: 'no_end',
    end_date: '',
    occurrences: 1,
  }
}

async function openShiftDetails(shift: Shift) {
  const requestId = ++detailsRequestId
  selectedShift.value = { ...shift }
  populateShiftForm(shift)
  shiftFormError.value = ''
  showDetailsPanel.value = true
  if (!shift.apiId) return
  isLoadingShiftDetails.value = true
  try {
    const response = await shiftApi.getShift(shift.apiId, { showLoading: false })
    if (requestId !== detailsRequestId) return
    if (response.shift) {
      const fullShift = mapApiShift(response.shift)
      selectedShift.value = fullShift
      populateShiftForm(fullShift)
    }
  } catch (error) {
    if (requestId !== detailsRequestId) return
    console.error('Failed to load shift details:', error)
    shiftFormError.value = t('shifts.details_load_failed')
  } finally {
    if (requestId === detailsRequestId) isLoadingShiftDetails.value = false
  }
}

function closeDetailsPanel() {
  detailsRequestId++
  showDetailsPanel.value = false
  selectedShift.value = null
  shiftForm.value = emptyShiftForm()
  shiftFormError.value = ''
  isLoadingShiftDetails.value = false
  showDeleteShiftModal.value = false
  showCancelShiftModal.value = false
  showConflictModal.value = false
  conflictWarnings.value = []
  conflictAcknowledged.value = false
}

function openAllocationBoard() {
  showAllocationBoard.value = true
}

function closeAllocationBoard() {
  showAllocationBoard.value = false
}

function openRoutePanel() {
  if (selectedShift.value && !selectedShift.value.route) {
    generateRoute(selectedShift.value.id)
  }
  showRoutePanel.value = true
}

function closeRoutePanel() {
  showRoutePanel.value = false
}

function handleSaveRoute(shiftId: string, route: Waypoint[]) {
  saveRoute(shiftId, route)
  closeRoutePanel()
}

function handleAllocate(shiftId: string, officer: string, post: string) {
  const shift = shifts.value.find((s: Shift) => s.id === shiftId)
  if (shift && !shift.officers.includes(officer)) {
    shift.officers.push(officer)
    if (post && !shift.posts.includes(post)) {
      shift.posts.push(post)
    }
  }
}

async function saveShift() {
  if (isSavingShift.value || isShiftReadOnly.value) return
  const form = shiftForm.value
  shiftFormError.value = ''
  if (!form.communityId || !form.date || !form.start_time || !form.end_time) {
    shiftFormError.value = t('shifts.required_fields_error')
    return
  }
  if (form.start_time === form.end_time) {
    shiftFormError.value = t('shifts.same_time_error')
    return
  }
  if (form.notes.length > 500) {
    shiftFormError.value = t('shifts.notes_max_error')
    return
  }
  if (!selectedShift.value && form.recurring) {
    if (form.recurrence_pattern === 'specific_days' && !form.repeat_on.length) {
      shiftFormError.value = t('shifts.repeat_on_required')
      return
    }
    if (form.recurrence_pattern === 'every_x_days' && form.interval_days < 2) {
      shiftFormError.value = t('shifts.interval_days_error')
      return
    }
    if (form.end_condition === 'end_date' && !form.end_date) {
      shiftFormError.value = t('shifts.end_date_required')
      return
    }
    if (form.end_condition === 'occurrences' && (form.occurrences < 1 || form.occurrences > 365)) {
      shiftFormError.value = t('shifts.occurrences_error')
      return
    }
  }

  isSavingShift.value = true
  try {
    if (selectedShift.value?.apiId) {
      await shiftApi.updateShift({
        shift_id: selectedShift.value.apiId,
        shift_date: form.date,
        start_time: toApiTime(form.start_time),
        end_time: toApiTime(form.end_time),
        notes: form.notes,
      }, { showLoading: false })
    } else if (form.recurring) {
      await shiftApi.createRecurringShifts({
        community_id: form.communityId,
        start_date: form.date,
        start_time: toApiTime(form.start_time),
        end_time: toApiTime(form.end_time),
        recurrence_pattern: form.recurrence_pattern,
        repeat_on: form.recurrence_pattern === 'specific_days' ? form.repeat_on : undefined,
        interval_days: form.recurrence_pattern === 'every_x_days' ? form.interval_days : undefined,
        end_type: form.end_condition,
        end_date: form.end_condition === 'end_date' ? form.end_date : undefined,
        occurrences: form.end_condition === 'occurrences' ? form.occurrences : undefined,
        notes: form.notes || undefined,
      }, { showLoading: false })
    } else {
      await shiftApi.createShift({
        community_id: form.communityId,
        shift_date: form.date,
        start_time: toApiTime(form.start_time),
        end_time: toApiTime(form.end_time),
        notes: form.notes || undefined,
      }, { showLoading: false })
    }
    closeDetailsPanel()
    await loadCalendar()
  } catch (error) {
    console.error('Failed to save shift:', error)
    shiftFormError.value = error instanceof Error ? error.message : t('shifts.save_failed')
  } finally {
    isSavingShift.value = false
  }
}

async function reloadSelectedShift() {
  const shiftId = selectedShift.value?.apiId
  if (!shiftId) return
  const response = await shiftApi.getShift(shiftId, { showLoading: false })
  if (response.shift) {
    const fullShift = mapApiShift(response.shift)
    selectedShift.value = fullShift
    populateShiftForm(fullShift)
  }
}

async function allocateOfficer(officerId: string, acknowledgeConflicts = false) {
  const shiftId = selectedShift.value?.apiId
  if (!shiftId || isOfficerActionRunning.value) return false
  isOfficerActionRunning.value = true
  try {
    await shiftApi.allocateOfficer({
      shift_id: shiftId,
      officer_id: officerId,
      acknowledge_conflicts: acknowledgeConflicts,
    }, { showLoading: false })
    await reloadSelectedShift()
    await loadCalendar()
    return true
  } catch (error) {
    if (error instanceof ApiError && error.rc === ShiftErrorCodes.OFFICER_CONFLICT) {
      allocationConflictWarnings.value = (error.data?.warnings || []) as ShiftConflictWarning[]
      pendingAllocationOfficerId.value = officerId
      allocationConflictAcknowledged.value = false
      showAllocationConflictModal.value = true
      return false
    }
    shiftFormError.value = error instanceof Error ? error.message : t('shifts.allocate_failed')
    return false
  } finally {
    isOfficerActionRunning.value = false
  }
}

async function handleOfficerPickerConfirm(selected: Array<{ id: string }>) {
  showOfficerPicker.value = false
  const existingIds = new Set(allocatedOfficerIds.value)
  for (const officer of selected) {
    if (!existingIds.has(officer.id)) {
      const success = await allocateOfficer(officer.id)
      if (!success) break
    }
  }
}

async function confirmAllocationConflict() {
  if (!pendingAllocationOfficerId.value || !allocationConflictAcknowledged.value) return
  const officerId = pendingAllocationOfficerId.value
  showAllocationConflictModal.value = false
  await allocateOfficer(officerId, true)
  pendingAllocationOfficerId.value = null
}

async function removeOfficer() {
  const shiftId = selectedShift.value?.apiId
  const officerId = pendingRemoveOfficer.value?.id
  if (!shiftId || !officerId || isOfficerActionRunning.value) return
  isOfficerActionRunning.value = true
  try {
    await shiftApi.removeOfficer({ shift_id: shiftId, officer_id: officerId }, { showLoading: false })
    pendingRemoveOfficer.value = null
    await reloadSelectedShift()
    await loadCalendar()
  } catch (error) {
    shiftFormError.value = error instanceof Error ? error.message : t('shifts.remove_failed')
  } finally {
    isOfficerActionRunning.value = false
  }
}

async function publishShift(acknowledgeConflicts = false) {
  const shiftId = selectedShift.value?.apiId
  if (!shiftId || shiftAction.value) return
  shiftAction.value = 'publish'
  shiftFormError.value = ''
  try {
    await shiftApi.publishShift({ shift_id: shiftId, acknowledge_conflicts: acknowledgeConflicts }, { showLoading: false })
    showConflictModal.value = false
    closeDetailsPanel()
    await loadCalendar()
  } catch (error) {
    if (error instanceof ApiError && error.rc === ShiftErrorCodes.OFFICER_CONFLICT) {
      conflictWarnings.value = (error.data?.warnings || []) as ShiftConflictWarning[]
      conflictAcknowledged.value = false
      showConflictModal.value = true
    } else {
      console.error('Failed to publish shift:', error)
      shiftFormError.value = error instanceof Error ? error.message : t('shifts.publish_failed')
    }
  } finally {
    shiftAction.value = null
  }
}

async function deleteShift() {
  const shiftId = selectedShift.value?.apiId
  if (!shiftId || shiftAction.value) return
  shiftAction.value = 'delete'
  try {
    await shiftApi.deleteShift(shiftId, { showLoading: false })
    showDeleteShiftModal.value = false
    closeDetailsPanel()
    await loadCalendar()
  } catch (error) {
    console.error('Failed to delete shift:', error)
    shiftFormError.value = error instanceof Error ? error.message : t('shifts.delete_failed')
    showDeleteShiftModal.value = false
  } finally {
    shiftAction.value = null
  }
}

async function cancelShift() {
  const shiftId = selectedShift.value?.apiId
  if (!shiftId || shiftAction.value) return
  shiftAction.value = 'cancel'
  try {
    await shiftApi.cancelShift(shiftId, { showLoading: false })
    showCancelShiftModal.value = false
    closeDetailsPanel()
    await loadCalendar()
  } catch (error) {
    console.error('Failed to cancel shift:', error)
    shiftFormError.value = error instanceof Error ? error.message : t('shifts.cancel_failed')
    showCancelShiftModal.value = false
  } finally {
    shiftAction.value = null
  }
}

function formatConflictWarning(warning: ShiftConflictWarning): string {
  if (warning.message) return warning.message
  return t('shifts.conflict_default')
}

function toggleOfficer(officer: string) {
  const officers = shiftForm.value.officers
  if (officers.includes(officer)) {
    shiftForm.value.officers = officers.filter((o: string) => o !== officer)
  } else {
    shiftForm.value.officers.push(officer)
  }
}

function toggleDay(day: number) {
  const days = shiftForm.value.repeat_on
  if (days.includes(day)) {
    shiftForm.value.repeat_on = days.filter((d: number) => d !== day)
  } else {
    shiftForm.value.repeat_on.push(day)
  }
}

function formatTimeRange(start: string, end: string, overnight = false): string {
  return `${start} - ${end}${overnight ? ' (+1)' : ''}`
}

function formatOfficerNames(officerNames: string[]): string {
  if (!officerNames.length) return t('shifts.no_officers')
  if (officerNames.length <= 3) return officerNames.join(', ')
  return `${officerNames.slice(0, 3).join(', ')} +${officerNames.length - 3} more`
}

function getShiftMinutes(shift: Shift) {
  const [startHour = 0, startMinute = 0] = shift.start_time.split(':').map(Number)
  const [endHour = 0, endMinute = 0] = shift.end_time.split(':').map(Number)
  const start = startHour * 60 + startMinute
  let end = endHour * 60 + endMinute
  if (shift.isOvernight || end <= start) end += 24 * 60
  return { start, end }
}

function getWeekDayLayout(dateStr: string) {
  const dayShifts = [...getShiftsForDate(dateStr)].sort((a, b) => getShiftMinutes(a).start - getShiftMinutes(b).start)
  const laneEnds: number[] = []
  const lanes = new Map<string, number>()
  dayShifts.forEach(shift => {
    const { start, end } = getShiftMinutes(shift)
    let lane = laneEnds.findIndex(laneEnd => laneEnd <= start)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = end
    lanes.set(shift.id, lane)
  })
  return { lanes, laneCount: Math.max(1, laneEnds.length) }
}

function getWeekShiftStyle(shift: Shift, dateStr: string) {
  const { start, end } = getShiftMinutes(shift)
  const layout = getWeekDayLayout(dateStr)
  const lane = layout.lanes.get(shift.id) || 0
  return {
    top: `${(start / 60) * 44 + 8}px`,
    minHeight: `${Math.max(64, ((end - start) / 60) * 44 - 4)}px`,
    left: layout.laneCount === 1 ? '8px' : `${lane * 156 + 8}px`,
    width: layout.laneCount === 1 ? 'calc(100% - 16px)' : '148px',
  }
}

function previous() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'day') d.setDate(d.getDate() - 1)
  if (viewMode.value === 'week') d.setDate(d.getDate() - 7)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

function next() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'day') d.setDate(d.getDate() + 1)
  if (viewMode.value === 'week') d.setDate(d.getDate() + 7)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

function today() {
  currentDate.value = getToday()
}

function toggleStatus(status: ShiftStatus) {
  if (selectedStatus.value.includes(status)) {
    selectedStatus.value = selectedStatus.value.filter((s: ShiftStatus) => s !== status)
  } else {
    selectedStatus.value = [...selectedStatus.value, status]
  }
}
</script>

<template>
  <div class="shifts-management">
    <div class="shifts-filters">
      <div class="filter-row">
        <select v-model="selectedCommunity" class="filter-select" :disabled="communities.length === 1">
          <option value="">{{ t('shifts.all_communities') }}</option>
          <option v-for="community in communities" :key="community.community_id" :value="community.community_id">{{ community.name }}</option>
        </select>
        <input v-model="selectedOfficer" type="text" class="filter-input" list="shift-officer-options" :placeholder="t('shifts.officer_placeholder')" />
        <datalist id="shift-officer-options">
          <option v-for="officer in officers" :key="officer" :value="officer" />
        </datalist>
        <input v-model="searchText" type="search" class="filter-input" :placeholder="t('shifts.search_placeholder')" />
        <div class="status-filter">
          <span class="filter-label">{{ t('shifts.status') }}:</span>
          <button
            v-for="status in allStatuses"
            :key="status"
            class="status-chip"
            :class="{ 'status-chip--active': selectedStatus.includes(status) }"
            @click="toggleStatus(status)"
          >
            <Badge type="shiftStatus" :value="status" />
          </button>
        </div>
        <div class="date-range">
          <input v-model="dateFrom" type="date" class="date-input" />
          <span>-</span>
          <input v-model="dateTo" type="date" class="date-input" />
        </div>
        <button class="btn btn--primary add-shift-btn" @click="openCreateShift">
          <Icon name="lucide:plus" :size="16" />
          {{ t('shifts.add_new') }}
        </button>
      </div>
    </div>

    <div class="calendar-toolbar">
      <div class="calendar-nav">
        <button class="nav-btn" @click="previous">
          <Icon name="lucide:chevron-left" :size="18" />
        </button>
        <button class="today-btn" @click="today">{{ t('shifts.today') }}</button>
        <button class="nav-btn" @click="next">
          <Icon name="lucide:chevron-right" :size="18" />
        </button>
        <input v-model="calendarDate" type="date" class="calendar-date-picker" />
      </div>
      <div class="calendar-range">{{ currentRangeLabel }}</div>
      <AppSegmentedControl
        v-model="viewModeModel"
        :options="viewModeOptions"
        :aria-label="t('shifts.view_mode')"
      />
      <button class="btn btn--secondary allocation-board-btn" @click="openAllocationBoard">
        <Icon name="lucide:users" :size="16" />
        {{ t('shifts.allocation_board') }}
      </button>
    </div>

    <div v-if="isLoadingCalendar" class="calendar-state">
      <Icon name="lucide:loader-2" :size="20" class="animate-spin" />
      {{ t('common.loading') }}
    </div>
    <div v-else-if="calendarError" class="calendar-state calendar-state--error">
      {{ calendarError }}
      <button class="btn btn--secondary" @click="loadCalendar">{{ t('common.retry') }}</button>
    </div>
    <div v-else class="calendar-container">
      <!-- Week View -->
      <div v-if="viewMode === 'week'" class="week-view" :style="{ minWidth: `${weekMinWidth}px` }">
        <div class="week-header" :style="{ gridTemplateColumns: weekGridTemplateColumns }">
          <div class="week-header-cell time-column">{{ t('shifts.time') }}</div>
          <div v-for="day in weekDays" :key="day.dateStr" class="week-header-cell" :class="{ 'week-header-cell--today': day.dateStr === new Date().toISOString().split('T')[0] }">
            <div class="day-label">{{ day.label }}</div>
            <div class="day-number">{{ day.date.getDate() }}</div>
          </div>
        </div>
        <div class="week-body" :style="{ gridTemplateColumns: weekGridTemplateColumns }">
          <div class="week-time-slots">
            <span v-for="hour in 24" :key="hour">{{ String(hour - 1).padStart(2, '0') }}:00</span>
          </div>
          <div v-for="day in weekDays" :key="day.dateStr" class="week-day-column">
            <div
              v-for="shift in getShiftsForDate(day.dateStr)"
              :key="shift.id"
              class="shift-block shift-block--week"
              :class="`shift-block--${shift.status}`"
              :style="getWeekShiftStyle(shift, day.dateStr)"
              @click="openShiftDetails(shift)"
            >
              <div class="shift-id">{{ shift.id }}</div>
              <div class="shift-time shift-time--stacked">
                <span>{{ shift.start_time }}</span>
                <span>– {{ shift.end_time }}{{ shift.isOvernight ? ' (+1)' : '' }}</span>
              </div>
              <div v-if="selectedCommunity === ''" class="shift-site">{{ shift.community }}</div>
              <div class="shift-officers">{{ formatOfficerNames(shift.officers) }}</div>
              <div class="shift-meta">
                <Badge type="shiftStatus" :value="shift.status" />
                <span class="shift-posts-count">
                  <Icon name="lucide:map-pin" :size="12" />
                  {{ shift.posts.length }}
                </span>
              </div>
            </div>
            <div v-if="getShiftsForDate(day.dateStr).length === 0" class="no-shifts-day">{{ t('shifts.no_shifts') }}</div>
          </div>
        </div>
      </div>

      <!-- Day View -->
      <div v-if="viewMode === 'day'" class="day-view">
        <div class="day-view-header">{{ dayLabel }}</div>
        <div v-if="getShiftsForDayView().length" class="day-view-columns">
          <div
            v-for="shift in getShiftsForDayView()"
            :key="shift.id"
            class="day-officer-column shift-block"
            :class="`shift-block--${shift.status}`"
            @click="openShiftDetails(shift)"
          >
            <div class="shift-time">{{ formatTimeRange(shift.start_time, shift.end_time, shift.isOvernight) }}</div>
            <div v-if="selectedCommunity === ''" class="shift-site">{{ shift.community }}</div>
            <div class="shift-officers">{{ formatOfficerNames(shift.officers) }}</div>
            <div class="shift-meta">
              <Badge type="shiftStatus" :value="shift.status" />
              <span class="shift-posts-count">
                <Icon name="lucide:map-pin" :size="12" />
                {{ shift.posts.length }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="no-shifts-day">{{ t('shifts.no_shifts') }}</div>
      </div>

      <!-- Month View -->
      <div v-if="viewMode === 'month'" class="month-view">
        <div class="month-weekdays">
          <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="month-weekday">{{ day }}</div>
        </div>
        <div class="month-grid">
          <div
            v-for="day in monthDays"
            :key="day.dateStr"
            class="month-cell"
            :class="{
              'month-cell--today': day.dateStr === new Date().toISOString().split('T')[0],
              'month-cell--other': day.date.getMonth() !== currentDate.getMonth(),
            }"
            @click="currentDate = day.date; viewMode = 'week'"
          >
            <div class="month-cell-date">{{ day.date.getDate() }}</div>
            <div v-if="day.count > 0" class="month-shift-count">
              <Badge type="shiftCount" :value="day.count" />
            </div>
            <div v-else class="month-empty">-</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shift Details Slide-over -->
    <div v-if="showDetailsPanel" class="slide-over-overlay" @click="closeDetailsPanel">
      <div class="slide-over" @click.stop>
        <div class="slide-over__header">
          <h3>{{ selectedShift ? t('shifts.shift_details') : t('shifts.add_new_shift') }}</h3>
          <button class="close-btn" @click="closeDetailsPanel">
            <Icon name="lucide:x" :size="20" />
          </button>
        </div>
        <div class="slide-over__body">
          <div v-if="isLoadingShiftDetails" class="details-loading">
            <Icon name="lucide:loader-2" :size="20" class="animate-spin" />
            {{ t('common.loading') }}
          </div>
          <div v-else class="shift-form">
            <!-- Shift ID -->
            <div v-if="selectedShift" class="form-group">
              <label class="form-label">{{ t('shifts.shift_id') }}</label>
              <input v-model="shiftForm.id" type="text" class="form-input" disabled />
            </div>

            <!-- Community / Site -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.community') }} *</label>
              <select v-model="shiftForm.communityId" class="form-input" :disabled="!!selectedShift || isShiftReadOnly">
                <option value="">{{ t('shifts.select_community') }}</option>
                <option v-for="community in communities" :key="community.community_id" :value="community.community_id">{{ community.name }}</option>
              </select>
            </div>

            <!-- Shift Date -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.shift_date') }} *</label>
              <input v-model="shiftForm.date" type="date" class="form-input" :disabled="isShiftReadOnly" />
            </div>

            <!-- Time Range -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('shifts.start_time') }} *</label>
                <input v-model="shiftForm.start_time" type="time" class="form-input" :disabled="isShiftReadOnly" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('shifts.end_time') }} *</label>
                <input v-model="shiftForm.end_time" type="time" class="form-input" :disabled="isShiftReadOnly" />
                <span v-if="isNextDay" class="form-hint next-day-indicator">{{ t('shifts.next_day') }}</span>
              </div>
            </div>

            <!-- Officer Allocation -->
            <div v-if="selectedShift" class="officer-allocation-section">
              <div class="section-heading">
                <div>
                  <label class="form-label">{{ t('shifts.allocated_officers') }}</label>
                  <span class="form-hint">{{ allocatedOfficerDetails.length }} {{ t('shifts.officers_assigned') }}</span>
                </div>
                <button v-if="canManageOfficers" type="button" class="btn btn--secondary btn--small" :disabled="isOfficerActionRunning" @click="showOfficerPicker = true">
                  <Icon name="lucide:user-plus" :size="14" />
                  {{ t('shifts.add_officer') }}
                </button>
              </div>
              <div v-if="allocatedOfficerDetails.length" class="allocated-officer-list">
                <div v-for="officer in allocatedOfficerDetails" :key="officer.user_id" class="allocated-officer-row">
                  <img v-if="officer.image_url" :src="officer.image_url" :alt="[officer.first_name, officer.last_name].join(' ')" class="allocated-officer-avatar" />
                  <div v-else class="allocated-officer-avatar allocated-officer-avatar--initials">
                    {{ [officer.first_name, officer.last_name].map(part => part?.[0] || '').join('').toUpperCase() }}
                  </div>
                  <div class="allocated-officer-info">
                    <strong>{{ [officer.first_name, officer.last_name].filter(Boolean).join(' ') }}</strong>
                    <span>{{ officer.title || t('shifts.officer') }}</span>
                    <div class="officer-pills">
                      <span v-for="role in officer.roles" :key="`role-${role}`" class="officer-pill">{{ role }}</span>
                      <span v-for="badge in officer.certification_badges" :key="`badge-${badge}`" class="officer-pill officer-pill--badge">{{ badge }}</span>
                    </div>
                  </div>
                  <button v-if="canManageOfficers" type="button" class="icon-action-btn" :title="t('shifts.remove_officer')" :disabled="isOfficerActionRunning" @click="pendingRemoveOfficer = { id: officer.user_id, name: [officer.first_name, officer.last_name].filter(Boolean).join(' ') }">
                    <Icon name="lucide:trash-2" :size="16" />
                  </button>
                </div>
              </div>
              <div v-else class="empty-officer-state">{{ t('shifts.no_officers_assigned') }}</div>
            </div>

            <!-- Recurring Toggle -->
            <div class="form-group form-group--inline">
              <label class="form-label">{{ t('shifts.recurring') }}</label>
              <label class="toggle">
                <input v-model="shiftForm.recurring" type="checkbox" :disabled="!!selectedShift || isShiftReadOnly" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Recurring Options -->
            <div v-if="shiftForm.recurring" class="recurring-section">
              <div class="form-group">
                <label class="form-label">{{ t('shifts.recurrence_pattern') }}</label>
                <select v-model="shiftForm.recurrence_pattern" class="form-input">
                  <option value="daily">{{ t('shifts.daily') }}</option>
                  <option value="specific_days">{{ t('shifts.specific_days') }}</option>
                  <option value="every_x_days">{{ t('shifts.every_x_days') }}</option>
                </select>
              </div>

              <div v-if="shiftForm.recurrence_pattern === 'specific_days'" class="form-group">
                <label class="form-label">{{ t('shifts.repeat_on') }}</label>
                <div class="day-selector">
                  <button
                    v-for="day in recurrenceDays"
                    :key="day.value"
                    type="button"
                    class="day-chip"
                    :class="{ 'day-chip--active': shiftForm.repeat_on.includes(day.value) }"
                    @click="toggleDay(day.value)"
                  >
                    {{ day.label }}
                  </button>
                </div>
              </div>

              <div v-if="shiftForm.recurrence_pattern === 'every_x_days'" class="form-group">
                <label class="form-label">{{ t('shifts.interval_days') }}</label>
                <input v-model.number="shiftForm.interval_days" type="number" min="2" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('shifts.end_condition') }}</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input v-model="shiftForm.end_condition" type="radio" value="end_date" />
                    {{ t('shifts.end_date_option') }}
                  </label>
                  <label class="radio-label">
                    <input v-model="shiftForm.end_condition" type="radio" value="occurrences" />
                    {{ t('shifts.occurrences_option') }}
                  </label>
                  <label class="radio-label">
                    <input v-model="shiftForm.end_condition" type="radio" value="no_end" />
                    {{ t('shifts.no_end_option') }}
                  </label>
                </div>
              </div>

              <div v-if="shiftForm.end_condition === 'end_date'" class="form-group">
                <label class="form-label">{{ t('shifts.end_date') }}</label>
                <input v-model="shiftForm.end_date" type="date" class="form-input" />
              </div>

              <div v-if="shiftForm.end_condition === 'occurrences'" class="form-group">
                <label class="form-label">{{ t('shifts.occurrences') }}</label>
                <input v-model.number="shiftForm.occurrences" type="number" min="1" max="365" class="form-input" />
              </div>

              <div v-if="shiftForm.end_condition === 'no_end'" class="recurring-notice">
                <Icon name="lucide:info" :size="16" />
                <span>{{ t('shifts.no_end_notice') }}</span>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.notes') }}</label>
              <textarea v-model="shiftForm.notes" class="form-textarea" rows="3" maxlength="500" :placeholder="t('shifts.notes_placeholder')" :disabled="isShiftReadOnly"></textarea>
              <span class="form-counter">{{ shiftForm.notes.length }}/500</span>
            </div>

            <p v-if="shiftFormError" class="form-error">{{ shiftFormError }}</p>

            <!-- Status -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.status') }}</label>
              <Badge type="shiftStatus" :value="shiftForm.status" />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div v-if="!isShiftReadOnly" class="slide-over__footer">
          <div class="footer-actions">
            <button type="button" class="btn btn--primary" :disabled="isSavingShift || !!shiftAction" @click="saveShift">
              {{ isSavingShift ? t('common.saving') : t('common.save') }}
            </button>
            <button
              v-if="selectedShift && shiftForm.status === 'draft'"
              type="button"
              class="btn btn--success"
              :disabled="!!shiftAction || isSavingShift"
              @click="publishShift()"
            >
              {{ shiftAction === 'publish' ? t('shifts.publishing') : t('shifts.publish') }}
            </button>
            <button
              v-if="selectedShift && shiftForm.status === 'draft'"
              type="button"
              class="btn btn--danger"
              :disabled="!!shiftAction || isSavingShift"
              @click="showDeleteShiftModal = true"
            >
              {{ t('common.delete') }}
            </button>
            <button
              v-if="selectedShift && shiftForm.status === 'published'"
              type="button"
              class="btn btn--danger"
              :disabled="!!shiftAction || isSavingShift"
              @click="showCancelShiftModal = true"
            >
              {{ t('shifts.cancel_shift') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppModal
      :show="showDeleteShiftModal"
      :title="t('shifts.delete_title')"
      :message="t('shifts.delete_message', { id: shiftForm.id })"
      :cancel-text="t('common.cancel')"
      :ok-text="shiftAction === 'delete' ? t('common.deleting') : t('common.delete')"
      :ok-disabled="!!shiftAction"
      @close="showDeleteShiftModal = false"
      @cancel="showDeleteShiftModal = false"
      @ok="deleteShift"
    />

    <AppModal
      :show="showCancelShiftModal"
      :title="t('shifts.cancel_title')"
      :message="t('shifts.cancel_message', { id: shiftForm.id })"
      :cancel-text="t('common.close')"
      :ok-text="shiftAction === 'cancel' ? t('shifts.cancelling') : t('shifts.cancel_shift')"
      :ok-disabled="!!shiftAction"
      @close="showCancelShiftModal = false"
      @cancel="showCancelShiftModal = false"
      @ok="cancelShift"
    />

    <AppModal
      :show="showConflictModal"
      :title="t('shifts.conflict_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="shiftAction === 'publish' ? t('shifts.publishing') : t('shifts.acknowledge_publish')"
      :ok-disabled="!conflictAcknowledged || !!shiftAction"
      @close="showConflictModal = false"
      @cancel="showConflictModal = false"
      @ok="publishShift(true)"
    >
      <div class="conflict-modal-content">
        <div v-for="(warning, index) in conflictWarnings" :key="index" class="conflict-warning-card">
          <Icon name="lucide:triangle-alert" :size="18" />
          <div>
            <strong>{{ warning.type.replaceAll('_', ' ') }}</strong>
            <p>{{ formatConflictWarning(warning) }}</p>
          </div>
        </div>
        <label class="conflict-acknowledgment">
          <input v-model="conflictAcknowledged" type="checkbox" />
          <span>{{ t('shifts.conflict_acknowledgment') }}</span>
        </label>
      </div>
    </AppModal>

    <AppModal
      :show="!!pendingRemoveOfficer"
      :title="t('shifts.remove_officer_title')"
      :message="t('shifts.remove_officer_message', { name: pendingRemoveOfficer?.name || '' })"
      :cancel-text="t('common.cancel')"
      :ok-text="isOfficerActionRunning ? t('common.removing') : t('common.remove')"
      :ok-disabled="isOfficerActionRunning"
      @close="pendingRemoveOfficer = null"
      @cancel="pendingRemoveOfficer = null"
      @ok="removeOfficer"
    />

    <AppModal
      :show="showAllocationConflictModal"
      :title="t('shifts.conflict_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('shifts.acknowledge_allocate')"
      :ok-disabled="!allocationConflictAcknowledged || isOfficerActionRunning"
      @close="showAllocationConflictModal = false"
      @cancel="showAllocationConflictModal = false"
      @ok="confirmAllocationConflict"
    >
      <div class="conflict-modal-content">
        <div v-for="(warning, index) in allocationConflictWarnings" :key="index" class="conflict-warning-card">
          <Icon name="lucide:triangle-alert" :size="18" />
          <div>
            <strong>{{ warning.type.replaceAll('_', ' ') }}</strong>
            <p>{{ formatConflictWarning(warning) }}</p>
          </div>
        </div>
        <label class="conflict-acknowledgment">
          <input v-model="allocationConflictAcknowledged" type="checkbox" />
          <span>{{ t('shifts.conflict_acknowledgment') }}</span>
        </label>
      </div>
    </AppModal>

    <OfficerPickerModal
      :show="showOfficerPicker"
      :community-id="selectedShift?.communityId"
      :preselected-ids="allocatedOfficerIds"
      @close="showOfficerPicker = false"
      @confirm="handleOfficerPickerConfirm"
    />

    <AllocationBoard
      v-if="showAllocationBoard"
      :shifts="filteredShifts"
      :current-date="currentDate"
      :selected-community="selectedCommunityName"
      :officers="officers"
      @close="closeAllocationBoard"
      @allocate="handleAllocate"
    />

    <PatrolRoutePanel
      v-if="showRoutePanel && selectedShift"
      :shift="selectedShift"
      @close="closeRoutePanel"
      @generate="generateRoute"
      @save="handleSaveRoute"
    />
  </div>
</template>

<style scoped>
.shifts-management {
  padding: var(--space-4);
}

.add-shift-btn {
  margin-left: auto;
  white-space: nowrap;
}

.shifts-filters {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
}

.filter-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.filter-select,
.filter-input {
  height: 38px;
  padding: 0 var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  min-width: 160px;
}

.filter-input {
  min-width: 200px;
}

.filter-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.status-filter {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.status-chip {
  padding: 2px 6px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
}

.status-chip:hover {
  opacity: 0.8;
}

.status-chip--active {
  opacity: 1;
  border-color: transparent;
  background: transparent;
}

.status-chip--active .badge {
  color: white !important;
  border: none !important;
}

.status-chip--active .badge--shift-draft {
  background: #9ca3af;
}

.status-chip--active .badge--shift-published {
  background: #60a5fa;
}

.status-chip--active .badge--shift-active {
  background: #22c55e;
}

.status-chip--active .badge--shift-completed {
  background: #10b981;
}

.status-chip--active .badge--shift-cancelled {
  background: #ef4444;
}

.date-range {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-input {
  height: 38px;
  padding: 0 var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.allocation-board-btn {
  margin-left: auto;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.calendar-date-picker {
  height: 36px;
  padding: 0 var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
}

.calendar-state {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.calendar-state--error {
  flex-direction: column;
  color: var(--color-critical);
}

.nav-btn {
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: var(--color-bg-base);
}

.today-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.calendar-range {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.calendar-container {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  overflow-y: hidden;
  min-height: 500px;
}

.week-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-bg-elevated);
}

.week-header {
  display: grid;
  width: 100%;
  grid-template-columns: 80px repeat(7, 1fr);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-base);
}

.week-header-cell {
  padding: var(--space-3);
  text-align: center;
  border-right: 1px solid var(--color-border-light);
  background: var(--color-bg-base);
}

.week-header-cell--today {
  background: rgba(59, 130, 246, 0.1);
}

.week-header-cell:last-child {
  border-right: none;
}

.time-column {
  position: sticky;
  left: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-base);
  border-right-color: var(--color-border-light);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.day-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.day-number {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-top: var(--space-1);
}

.week-body {
  display: grid;
  width: 100%;
  grid-template-columns: 80px repeat(7, 1fr);
  min-height: 400px;
  background: var(--color-bg-elevated);
}

.week-time-slots {
  position: sticky;
  left: 0;
  z-index: 5;
  display: grid;
  grid-template-rows: repeat(24, 44px);
  border-right: 1px solid var(--color-border-light);
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.week-time-slots span {
  padding: var(--space-1) var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.week-day-column {
  position: relative;
  padding: var(--space-2);
  border-right: 1px solid var(--color-border-light);
  min-height: 1056px;
  background-color: var(--color-bg-elevated);
  background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 43px, var(--color-border) 44px);
}

.shift-block--week {
  position: absolute;
  z-index: 1;
  overflow: hidden;
}

.week-day-column:last-child {
  border-right: none;
}

.shift-block {
  padding: var(--space-2);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  cursor: pointer;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  transition: transform 0.1s, box-shadow 0.1s;
}

.shift-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.shift-block--draft {
  background: rgba(156, 163, 175, 0.15);
  border-color: #9ca3af;
}

.shift-block--published {
  background: rgba(59, 130, 246, 0.15);
  border-color: #60a5fa;
}

.shift-block--active {
  background: rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
}

.shift-block--completed {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.shift-block--cancelled {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
}

.shift-id {
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.shift-time {
  font-weight: 600;
  color: var(--color-text-primary);
}

.shift-time--stacked {
  display: flex;
  flex-direction: column;
  gap: 1px;
  white-space: nowrap;
}

.shift-officers {
  font-weight: 500;
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
}

.shift-site {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-top: 2px;
}

.shift-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.shift-posts-count {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.no-shifts-day {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-4);
}

.day-view {
  padding: var(--space-4);
}

.day-view-header {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-4);
  text-align: center;
}

.day-view-columns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

.day-officer-column {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  min-height: 200px;
}

.day-officer-name {
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-2);
}

.month-view {
  padding: var(--space-4);
}

.month-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
}

.month-weekday {
  text-align: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
}

.month-cell {
  min-height: 90px;
  padding: var(--space-2);
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.month-cell:nth-child(7n) {
  border-right: none;
}

.month-cell--today {
  background: rgba(59, 130, 246, 0.1);
}

.month-cell--other {
  color: var(--color-text-muted);
  background: var(--color-bg-base);
}

.month-cell-date {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.month-shift-count {
  margin-top: auto;
}

.month-empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-top: auto;
}

.slide-over-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.slide-over {
  width: 420px;
  max-width: 100%;
  height: 100%;
  background: var(--color-bg-elevated);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.slide-over__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.slide-over__header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.close-btn {
  padding: var(--space-1);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.slide-over__body {
  padding: var(--space-4);
  overflow-y: auto;
  flex: 1;
}

.details-loading {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.slide-over__footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-base);
}

.footer-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.footer-actions--status {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.officer-allocation-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-base);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.btn--small {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
}

.allocated-officer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.allocated-officer-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
}

.allocated-officer-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.allocated-officer-avatar--initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-subtle);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.allocated-officer-info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.allocated-officer-info strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.allocated-officer-info > span {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.officer-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

.officer-pill {
  padding: 2px var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--color-accent-subtle);
  color: var(--color-text-secondary);
  font-size: 9px;
}

.officer-pill--badge {
  background: var(--color-ok-bg);
}

.icon-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.icon-action-btn:hover {
  color: var(--color-critical);
}

.empty-officer-state {
  padding: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.conflict-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.conflict-warning-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: var(--radius-md);
  background: var(--color-warn-bg);
  color: var(--color-warn);
}

.conflict-warning-card strong {
  text-transform: capitalize;
}

.conflict-warning-card p {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
}

.conflict-acknowledgment {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--color-text-primary);
  cursor: pointer;
}

.conflict-acknowledgment input {
  margin-top: 2px;
  accent-color: var(--color-accent);
}

.shift-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group--inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.form-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.form-input,
.form-textarea {
  height: 38px;
  padding: 0 var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  width: 100%;
}

.form-input:disabled {
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.form-textarea {
  height: auto;
  padding: var(--space-2) var(--space-3);
  resize: vertical;
}

.form-hint,
.form-counter {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.form-counter {
  align-self: flex-end;
}

.next-day-indicator {
  color: #f59e0b;
}

.form-error {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-critical);
  font-size: var(--font-size-sm);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: 24px;
  transition: 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

.toggle input:checked + .toggle-slider {
  background: var(--color-accent);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.recurring-section {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.recurring-notice {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: var(--radius-md);
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.day-selector,
.officer-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.day-chip,
.officer-chip {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.day-chip:hover,
.officer-chip:hover {
  background: var(--color-surface);
}

.day-chip--active,
.officer-chip--active {
  background: var(--color-accent);
  color: var(--color-bg-base);
  border-color: var(--color-accent);
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.radio-label input {
  accent-color: var(--color-accent);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--color-accent);
  color: var(--color-bg-base);
}

.btn--secondary {
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--success {
  background: #22c55e;
  color: white;
}

.btn--danger {
  background: #ef4444;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.shift-details .detail-row {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.detail-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 120px;
  font-size: var(--font-size-sm);
}

.detail-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  flex: 1;
}

.shift-form-placeholder {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-8);
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .slide-over {
    width: 100%;
  }
}
</style>
