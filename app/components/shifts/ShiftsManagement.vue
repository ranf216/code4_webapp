<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { shifts, generateRoute, saveRoute, type Shift, type Waypoint } from '~/composables/useShifts'

const { t } = useTranslation()

const viewMode = ref<'day' | 'week' | 'month'>('week')
const currentDate = ref(new Date('2026-06-21'))
const selectedShift = ref<Shift | null>(null)
const showDetailsPanel = ref(false)
const showAllocationBoard = ref(false)
const showRoutePanel = ref(false)

interface ShiftForm {
  id: string
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
  repeat_on: string[]
  end_condition: 'end_date' | 'occurrences' | 'no_end'
  end_date: string
  occurrences: number
}

const emptyShiftForm = (): ShiftForm => ({
  id: '',
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
  end_condition: 'no_end',
  end_date: '',
  occurrences: 1,
})

const shiftForm = ref<ShiftForm>(emptyShiftForm())

const postsInput = computed({
  get: () => shiftForm.value.posts.join(', '),
  set: (value: string) => {
    shiftForm.value.posts = value.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
  },
})

const selectedCommunity = ref('')
const selectedOfficer = ref('')
const selectedStatus = ref<string[]>([])
const dateFrom = ref('')
const dateTo = ref('')

const communities = ['Sunset Gardens', 'Oakwood Residences', 'Marina Towers', 'Downtown Plaza']
const officers = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Davis', 'Robert Wilson']
const allStatuses = ['draft', 'published', 'active', 'completed', 'cancelled'] as const

const filteredShifts = computed((): Shift[] => {
  return shifts.value.filter((shift: Shift) => {
    if (selectedCommunity.value && shift.community !== selectedCommunity.value) return false
    if (selectedOfficer.value && !shift.officers.some((o) => o.toLowerCase().includes(selectedOfficer.value.toLowerCase()))) return false
    if (selectedStatus.value.length > 0 && !selectedStatus.value.includes(shift.status)) return false
    if (dateFrom.value && shift.date < dateFrom.value) return false
    if (dateTo.value && shift.date > dateTo.value) return false
    return true
  })
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
      dateStr: d.toISOString().split('T')[0] || '',
    })
  }
  return days
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
    const dateStr = d.toISOString().split('T')[0] || ''
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
  const dateStr = currentDate.value.toISOString().split('T')[0] || ''
  return filteredShifts.value.filter((shift: Shift) => shift.date === dateStr)
}

function getShiftsForOfficerDay(officer: string, dateStr: string): Shift[] {
  return filteredShifts.value.filter((shift: Shift) => shift.date === dateStr && shift.officers.includes(officer))
}

function getDayViewColumns(): { officer: string; shifts: Shift[] }[] {
  const dateStr = currentDate.value.toISOString().split('T')[0] || ''
  const usedOfficers = Array.from(new Set(filteredShifts.value.filter((shift: Shift) => shift.date === dateStr).flatMap((shift: Shift) => shift.officers))) as string[]
  if (usedOfficers.length === 0) {
    return (officers as string[]).map((officer: string) => ({ officer, shifts: [] }))
  }
  return usedOfficers.map((officer: string) => ({ officer, shifts: getShiftsForOfficerDay(officer, dateStr) }))
}

function openShiftDetails(shift: Shift) {
  selectedShift.value = { ...shift }
  shiftForm.value = {
    id: shift.id,
    community: shift.community,
    site: shift.site,
    date: shift.date,
    start_time: shift.start_time,
    end_time: shift.end_time,
    officers: [...shift.officers],
    posts: [...shift.posts],
    notes: shift.notes,
    status: shift.status,
    recurring: false,
    recurrence_pattern: 'daily',
    repeat_on: [],
    end_condition: 'no_end',
    end_date: '',
    occurrences: 1,
  }
  showDetailsPanel.value = true
}

function closeDetailsPanel() {
  showDetailsPanel.value = false
  selectedShift.value = null
  shiftForm.value = emptyShiftForm()
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

function saveShift() {
  const form = shiftForm.value
  const shiftData: Shift = {
    id: selectedShift.value?.id || `SHF-${String(shifts.value.length + 1).padStart(3, '0')}`,
    community: form.community,
    site: form.site,
    date: form.date,
    start_time: form.start_time,
    end_time: form.end_time,
    officers: [...form.officers],
    posts: [...form.posts],
    notes: form.notes,
    status: selectedShift.value ? selectedShift.value.status : 'draft',
  }

  if (selectedShift.value) {
    const index = shifts.value.findIndex((s: Shift) => s.id === selectedShift.value?.id)
    if (index !== -1) {
      shifts.value[index] = shiftData
    }
  } else {
    shifts.value.push(shiftData)
  }
  closeDetailsPanel()
}

function publishShift() {
  if (selectedShift.value) {
    const shift = shifts.value.find((s: Shift) => s.id === selectedShift.value?.id)
    if (shift) {
      shift.status = 'published'
      if (!shift.route) {
        generateRoute(shift.id)
      }
    }
  }
  closeDetailsPanel()
}

function cancelShift() {
  if (selectedShift.value) {
    const shift = shifts.value.find((s: Shift) => s.id === selectedShift.value?.id)
    if (shift) {
      shift.status = 'cancelled'
    }
  }
  closeDetailsPanel()
}

function completeShift() {
  if (selectedShift.value) {
    const shift = shifts.value.find((s: Shift) => s.id === selectedShift.value?.id)
    if (shift) {
      shift.status = 'completed'
    }
  }
  closeDetailsPanel()
}

function toggleOfficer(officer: string) {
  const officers = shiftForm.value.officers
  if (officers.includes(officer)) {
    shiftForm.value.officers = officers.filter((o: string) => o !== officer)
  } else {
    shiftForm.value.officers.push(officer)
  }
}

function toggleDay(day: string) {
  const days = shiftForm.value.repeat_on
  if (days.includes(day)) {
    shiftForm.value.repeat_on = days.filter((d: string) => d !== day)
  } else {
    shiftForm.value.repeat_on.push(day)
  }
}

function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end}`
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
  currentDate.value = new Date()
}

function toggleStatus(status: string) {
  if (selectedStatus.value.includes(status)) {
    selectedStatus.value = selectedStatus.value.filter((s: string) => s !== status)
  } else {
    selectedStatus.value = [...selectedStatus.value, status]
  }
}
</script>

<template>
  <div class="shifts-management">
    <div class="shifts-filters">
      <div class="filter-row">
        <select v-model="selectedCommunity" class="filter-select">
          <option value="">{{ t('shifts.all_communities') }}</option>
          <option v-for="community in communities" :key="community" :value="community">{{ community }}</option>
        </select>
        <input v-model="selectedOfficer" type="text" class="filter-input" :placeholder="t('shifts.officer_placeholder')" />
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
        <button class="btn btn--primary add-shift-btn" @click="selectedShift = null; showDetailsPanel = true">
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
      </div>
      <div class="calendar-range">{{ currentRangeLabel }}</div>
      <div class="view-tabs">
        <button
          class="view-tab"
          :class="{ 'view-tab--active': viewMode === 'day' }"
          @click="viewMode = 'day'"
        >
          {{ t('shifts.day_view') }}
        </button>
        <button
          class="view-tab"
          :class="{ 'view-tab--active': viewMode === 'week' }"
          @click="viewMode = 'week'"
        >
          {{ t('shifts.week_view') }}
        </button>
        <button
          class="view-tab"
          :class="{ 'view-tab--active': viewMode === 'month' }"
          @click="viewMode = 'month'"
        >
          {{ t('shifts.month_view') }}
        </button>
      </div>
      <button class="btn btn--secondary allocation-board-btn" @click="openAllocationBoard">
        <Icon name="lucide:users" :size="16" />
        {{ t('shifts.allocation_board') }}
      </button>
    </div>

    <div class="calendar-container">
      <!-- Week View -->
      <div v-if="viewMode === 'week'" class="week-view">
        <div class="week-header">
          <div class="week-header-cell time-column">{{ t('shifts.time') }}</div>
          <div v-for="day in weekDays" :key="day.dateStr" class="week-header-cell" :class="{ 'week-header-cell--today': day.dateStr === new Date().toISOString().split('T')[0] }">
            <div class="day-label">{{ day.label }}</div>
            <div class="day-number">{{ day.date.getDate() }}</div>
          </div>
        </div>
        <div class="week-body">
          <div v-for="day in weekDays" :key="day.dateStr" class="week-day-column">
            <div
              v-for="shift in getShiftsForDate(day.dateStr)"
              :key="shift.id"
              class="shift-block"
              :class="`shift-block--${shift.status}`"
              @click="openShiftDetails(shift)"
            >
              <div class="shift-time">{{ formatTimeRange(shift.start_time, shift.end_time) }}</div>
              <div class="shift-officers">{{ shift.officers.join(', ') }}</div>
              <div class="shift-site">{{ shift.community }} - {{ shift.site }}</div>
              <div class="shift-meta">
                <Badge type="shiftStatus" :value="shift.status" />
                <span v-if="shift.posts.length" class="shift-posts">{{ shift.posts.join(', ') }}</span>
              </div>
            </div>
            <div v-if="getShiftsForDate(day.dateStr).length === 0" class="no-shifts-day">{{ t('shifts.no_shifts') }}</div>
          </div>
        </div>
      </div>

      <!-- Day View -->
      <div v-if="viewMode === 'day'" class="day-view">
        <div class="day-view-header">{{ dayLabel }}</div>
        <div class="day-view-columns">
          <div v-for="col in getDayViewColumns()" :key="col.officer" class="day-officer-column">
            <div class="day-officer-name">{{ col.officer }}</div>
            <div
              v-for="shift in col.shifts"
              :key="shift.id"
              class="shift-block"
              :class="`shift-block--${shift.status}`"
              @click="openShiftDetails(shift)"
            >
              <div class="shift-time">{{ formatTimeRange(shift.start_time, shift.end_time) }}</div>
              <div class="shift-site">{{ shift.community }} - {{ shift.site }}</div>
              <div class="shift-meta">
                <Badge type="shiftStatus" :value="shift.status" />
                <span v-if="shift.posts.length" class="shift-posts">{{ shift.posts.join(', ') }}</span>
              </div>
            </div>
            <div v-if="col.shifts.length === 0" class="no-shifts-day">{{ t('shifts.no_shifts') }}</div>
          </div>
        </div>
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
          <div class="shift-form">
            <!-- Shift ID -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.shift_id') }}</label>
              <input v-model="shiftForm.id" type="text" class="form-input" :disabled="true" :placeholder="t('shifts.auto_generated')" />
            </div>

            <!-- Community / Site -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.community') }} *</label>
              <select v-model="shiftForm.community" class="form-input">
                <option value="">{{ t('shifts.select_community') }}</option>
                <option v-for="community in communities" :key="community" :value="community">{{ community }}</option>
              </select>
            </div>

            <!-- Shift Date -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.shift_date') }} *</label>
              <input v-model="shiftForm.date" type="date" class="form-input" />
            </div>

            <!-- Time Range -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('shifts.start_time') }} *</label>
                <input v-model="shiftForm.start_time" type="time" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('shifts.end_time') }} *</label>
                <input v-model="shiftForm.end_time" type="time" class="form-input" />
              </div>
            </div>

            <!-- Recurring Toggle -->
            <div class="form-group form-group--inline">
              <label class="form-label">{{ t('shifts.recurring') }}</label>
              <label class="toggle">
                <input v-model="shiftForm.recurring" type="checkbox" />
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
                    v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
                    :key="day"
                    type="button"
                    class="day-chip"
                    :class="{ 'day-chip--active': shiftForm.repeat_on.includes(day) }"
                    @click="toggleDay(day)"
                  >
                    {{ day }}
                  </button>
                </div>
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
            </div>

            <!-- Officers -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.officers') }} *</label>
              <div class="officer-selector">
                <button
                  v-for="officer in officers"
                  :key="officer"
                  type="button"
                  class="officer-chip"
                  :class="{ 'officer-chip--active': shiftForm.officers.includes(officer) }"
                  @click="toggleOfficer(officer)"
                >
                  {{ officer }}
                </button>
              </div>
            </div>

            <!-- Posts -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.posts') }}</label>
              <input v-model="postsInput" type="text" class="form-input" :placeholder="t('shifts.posts_placeholder')" />
              <span class="form-hint">{{ t('shifts.posts_hint') }}</span>
            </div>

            <!-- Patrol Route -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.patrol_route') }}</label>
              <button type="button" class="btn btn--secondary" @click="openRoutePanel">
                <Icon name="lucide:map" :size="16" />
                {{ selectedShift?.route ? t('shifts.view_route') : t('shifts.generate_route') }}
              </button>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.notes') }}</label>
              <textarea v-model="shiftForm.notes" class="form-textarea" rows="3" maxlength="500" :placeholder="t('shifts.notes_placeholder')"></textarea>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label class="form-label">{{ t('shifts.status') }}</label>
              <Badge type="shiftStatus" :value="shiftForm.status" />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="slide-over__footer">
          <div class="footer-actions">
            <button type="button" class="btn btn--secondary" @click="closeDetailsPanel">
              {{ t('common.cancel') }}
            </button>
            <button type="button" class="btn btn--primary" @click="saveShift">
              {{ t('common.save') }}
            </button>
          </div>
          <div v-if="selectedShift" class="footer-actions footer-actions--status">
            <button
              v-if="shiftForm.status === 'draft'"
              type="button"
              class="btn btn--success"
              @click="publishShift"
            >
              {{ t('shifts.publish') }}
            </button>
            <button
              v-if="shiftForm.status === 'draft' || shiftForm.status === 'published'"
              type="button"
              class="btn btn--danger"
              @click="cancelShift"
            >
              {{ t('shifts.cancel_shift') }}
            </button>
            <button
              v-if="shiftForm.status === 'active'"
              type="button"
              class="btn btn--success"
              @click="completeShift"
            >
              {{ t('shifts.complete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <AllocationBoard
      v-if="showAllocationBoard"
      :shifts="filteredShifts"
      :current-date="currentDate"
      :selected-community="selectedCommunity"
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
.shifts-management { padding: var(--space-4); }
.add-shift-btn { margin-left: auto; white-space: nowrap; }

.shifts-filters { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); margin-bottom: var(--space-4); }
.filter-row { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center; justify-content: flex-start; }
.filter-select, .filter-input { height: 38px; padding: 0 var(--space-3); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); outline: none; min-width: 160px; }
.filter-input { min-width: 200px; }
.filter-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.status-filter { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.status-chip { padding: 2px 6px; border-radius: var(--radius-md); border: 1px solid transparent; background: transparent; cursor: pointer; opacity: 0.6; }
.status-chip:hover { opacity: 0.8; }
.status-chip--active { opacity: 1; border-color: transparent; background: transparent; }
.status-chip--active .badge { color: white !important; border: none !important; }
.status-chip--active .badge--shift-draft { background: #9ca3af; }
.status-chip--active .badge--shift-published { background: #60a5fa; }
.status-chip--active .badge--shift-active { background: #22c55e; }
.status-chip--active .badge--shift-completed { background: #10b981; }
.status-chip--active .badge--shift-cancelled { background: #ef4444; }
.date-range { display: flex; align-items: center; gap: var(--space-2); }
.date-input { height: 38px; padding: 0 var(--space-2); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }

.calendar-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-3); }
.allocation-board-btn { margin-left: auto; }
.calendar-nav { display: flex; align-items: center; gap: var(--space-2); }
.nav-btn { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); color: var(--color-text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.nav-btn:hover { background: var(--color-bg-base); }
.today-btn { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); color: var(--color-text-primary); cursor: pointer; font-size: var(--font-size-sm); font-weight: 500; }
.calendar-range { font-size: var(--font-size-lg); font-weight: 600; }
.view-tabs { display: flex; gap: var(--space-1); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 2px; }
.view-tab { padding: var(--space-2) var(--space-3); border: none; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-secondary); cursor: pointer; font-size: var(--font-size-sm); font-weight: 500; }
.view-tab--active { background: var(--color-accent); color: white; }

.calendar-container { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; min-height: 500px; }

.week-view { display: flex; flex-direction: column; height: 100%; }
.week-header { display: grid; grid-template-columns: 80px repeat(7, 1fr); border-bottom: 1px solid var(--color-border); background: var(--color-bg-base); }
.week-header-cell { padding: var(--space-3); text-align: center; border-right: 1px solid var(--color-border); }
.week-header-cell--today { background: rgba(59, 130, 246, 0.1); }
.week-header-cell:last-child { border-right: none; }
.time-column { display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--color-text-secondary); }
.day-label { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; }
.day-number { font-size: var(--font-size-xl); font-weight: 700; margin-top: var(--space-1); }
.week-body { display: grid; grid-template-columns: 80px repeat(7, 1fr); min-height: 400px; }
.week-day-column { padding: var(--space-2); border-right: 1px solid var(--color-border); min-height: 400px; }
.week-day-column:last-child { border-right: none; }

.shift-block { padding: var(--space-2); border-radius: var(--radius-md); border-left: 4px solid; cursor: pointer; margin-bottom: var(--space-2); font-size: var(--font-size-sm); transition: transform 0.1s, box-shadow 0.1s; }
.shift-block:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.shift-block--draft { background: rgba(156, 163, 175, 0.15); border-color: #9ca3af; }
.shift-block--published { background: rgba(59, 130, 246, 0.15); border-color: #60a5fa; }
.shift-block--active { background: rgba(34, 197, 94, 0.15); border-color: #22c55e; }
.shift-block--completed { background: rgba(16, 185, 129, 0.15); border-color: #10b981; }
.shift-block--cancelled { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }
.shift-time { font-weight: 600; color: var(--color-text-primary); }
.shift-officers { font-weight: 500; margin-top: var(--space-1); color: var(--color-text-secondary); }
.shift-site { color: var(--color-text-muted); font-size: 11px; margin-top: 2px; }
.shift-meta { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-2); flex-wrap: wrap; }
.shift-posts { font-size: 11px; color: var(--color-text-muted); }
.no-shifts-day { text-align: center; color: var(--color-text-muted); font-size: var(--font-size-sm); padding: var(--space-4); }

.day-view { padding: var(--space-4); }
.day-view-header { font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--space-4); text-align: center; }
.day-view-columns { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-3); }
.day-officer-column { background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); min-height: 200px; }
.day-officer-name { font-weight: 600; color: var(--color-text-primary); padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-border); margin-bottom: var(--space-2); }

.month-view { padding: var(--space-4); }
.month-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-2); }
.month-weekday { text-align: center; font-weight: 600; color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); }
.month-cell { min-height: 90px; padding: var(--space-2); border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
.month-cell:nth-child(7n) { border-right: none; }
.month-cell--today { background: rgba(59, 130, 246, 0.1); }
.month-cell--other { color: var(--color-text-muted); background: var(--color-bg-base); }
.month-cell-date { font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--space-2); }
.month-shift-count { margin-top: auto; }
.month-empty { color: var(--color-text-muted); font-size: var(--font-size-sm); margin-top: auto; }

.slide-over-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 100; display: flex; justify-content: flex-end; }
.slide-over { width: 420px; max-width: 100%; height: 100%; background: var(--color-bg-elevated); border-left: 1px solid var(--color-border); display: flex; flex-direction: column; animation: slideIn 0.2s ease-out; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.slide-over__header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); border-bottom: 1px solid var(--color-border); }
.slide-over__header h3 { font-size: var(--font-size-lg); font-weight: 600; }
.close-btn { padding: var(--space-1); border: none; background: transparent; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.close-btn:hover { color: var(--color-text-primary); }
.slide-over__body { padding: var(--space-4); overflow-y: auto; flex: 1; }
.slide-over__footer { padding: var(--space-4); border-top: 1px solid var(--color-border); background: var(--color-bg-base); }
.footer-actions { display: flex; gap: var(--space-3); justify-content: flex-end; }
.footer-actions--status { margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--color-border); }

.shift-form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-group--inline { flex-direction: row; align-items: center; justify-content: space-between; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.form-label { font-weight: 500; color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.form-input, .form-textarea { height: 38px; padding: 0 var(--space-3); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); outline: none; width: 100%; }
.form-input:disabled { background: var(--color-bg-elevated); color: var(--color-text-muted); cursor: not-allowed; }
.form-textarea { height: auto; padding: var(--space-2) var(--space-3); resize: vertical; }
.form-hint { font-size: var(--font-size-xs); color: var(--color-text-muted); }

.toggle { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--color-border); border-radius: 24px; transition: 0.2s; }
.toggle-slider::before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
.toggle input:checked + .toggle-slider { background: var(--color-accent); }
.toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

.recurring-section { background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); display: flex; flex-direction: column; gap: var(--space-3); }
.day-selector, .officer-selector { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.day-chip, .officer-chip { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); color: var(--color-text-secondary); font-size: var(--font-size-sm); cursor: pointer; transition: all 0.2s; }
.day-chip:hover, .officer-chip:hover { background: var(--color-surface); }
.day-chip--active, .officer-chip--active { background: var(--color-accent); color: var(--color-bg-base); border-color: var(--color-accent); }

.radio-group { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.radio-label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-sm); color: var(--color-text-primary); cursor: pointer; }
.radio-label input { accent-color: var(--color-accent); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); font-size: var(--font-size-sm); font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
.btn--primary { background: var(--color-accent); color: var(--color-bg-base); }
.btn--secondary { background: var(--color-bg-base); color: var(--color-text-primary); border: 1px solid var(--color-border); }
.btn--success { background: #22c55e; color: white; }
.btn--danger { background: #ef4444; color: white; }
.btn:hover { opacity: 0.9; }

.shift-details .detail-row { display: flex; gap: var(--space-3); margin-bottom: var(--space-4); }
.detail-label { font-weight: 500; color: var(--color-text-secondary); min-width: 120px; font-size: var(--font-size-sm); }
.detail-value { color: var(--color-text-primary); font-size: var(--font-size-sm); flex: 1; }
.shift-form-placeholder { text-align: center; color: var(--color-text-muted); padding: var(--space-8); }

@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
  .slide-over { width: 100%; }
}
</style>
