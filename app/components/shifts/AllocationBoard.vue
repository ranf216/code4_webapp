<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'

interface Shift {
  id: string
  community: string
  site: string
  officers: string[]
  start_time: string
  end_time: string
  date: string
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  posts: string[]
  notes: string
}

interface OfficerInfo {
  name: string
  role: string
  weekly_hours: number
}

const props = defineProps<{
  shifts: Shift[]
  currentDate: Date
  selectedCommunity: string
  officers: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'allocate', shiftId: string, officer: string, post: string): void
}>()

const { t } = useTranslation()

const MAX_WEEKLY_HOURS = 40
const MIN_REST_GAP_HOURS = 8

const draggedOfficer = ref<string | null>(null)
const hoveredShiftId = ref<string | null>(null)
const targetOfficer = ref<string | null>(null)
const showPostModal = ref(false)
const targetShift = ref<Shift | null>(null)
const selectedPost = ref('')

const showConflictModal = ref(false)
const conflicts = ref<string[]>([])
const conflictAcknowledged = ref(false)
const pendingAllocation = ref<{ shift: Shift; officer: string; post: string } | null>(null)

const officerRoles: Record<string, string> = {
  'John Smith': 'Security Supervisor',
  'Sarah Johnson': 'Patrol Officer',
  'Mike Chen': 'Gate Officer',
  'Emma Davis': 'Patrol Officer',
  'Robert Wilson': 'Night Supervisor',
}

const officerList = computed((): OfficerInfo[] => {
  return props.officers.map((officer: string) => ({
    name: officer,
    role: officerRoles[officer] || 'Security Officer',
    weekly_hours: Math.floor(Math.random() * 20) + 10,
  }))
})

const dateStr = computed((): string => {
  return props.currentDate.toISOString().split('T')[0] || ''
})

const dayShifts = computed((): Shift[] => {
  return props.shifts.filter((shift: Shift) => shift.date === dateStr.value)
})

function onDragStart(officer: string) {
  draggedOfficer.value = officer
}

function onDragEnd() {
  draggedOfficer.value = null
  hoveredShiftId.value = null
}

function onDragEnter(shiftId: string) {
  hoveredShiftId.value = shiftId
}

function onPanelDragLeave(event: DragEvent) {
  const panel = event.currentTarget as HTMLElement
  const related = event.relatedTarget as Node | null
  if (!panel.contains(related)) {
    hoveredShiftId.value = null
  }
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function shiftDurationMinutes(shift: Shift): number {
  let start = toMinutes(shift.start_time)
  let end = toMinutes(shift.end_time)
  if (end <= start) {
    end += 24 * 60
  }
  return end - start
}

function shiftsOverlap(a: Shift, b: Shift): boolean {
  const aStart = toMinutes(a.start_time)
  let aEnd = toMinutes(a.end_time)
  if (aEnd <= aStart) aEnd += 24 * 60
  const bStart = toMinutes(b.start_time)
  let bEnd = toMinutes(b.end_time)
  if (bEnd <= bStart) bEnd += 24 * 60
  return aStart < bEnd && bStart < aEnd
}

function weeklyHours(officer: string): number {
  return props.shifts
    .filter((shift: Shift) => shift.officers.includes(officer))
    .reduce((sum: number, shift: Shift) => sum + shiftDurationMinutes(shift) / 60, 0)
}

function checkConflicts(officer: string, shift: Shift): string[] {
  const list: string[] = []

  const otherShifts = props.shifts.filter((s: Shift) => s.id !== shift.id && s.officers.includes(officer))
  const sameDayShifts = otherShifts.filter((s: Shift) => s.date === shift.date)
  if (sameDayShifts.some((s: Shift) => shiftsOverlap(s, shift))) {
    list.push(t('shifts.conflict_double_booking'))
  }

  const projectedHours = weeklyHours(officer) + shiftDurationMinutes(shift) / 60
  if (projectedHours > MAX_WEEKLY_HOURS) {
    list.push(t('shifts.conflict_overtime', { hours: String(projectedHours.toFixed(1)), max: String(MAX_WEEKLY_HOURS) }))
  }

  const shiftStart = toMinutes(shift.start_time)
  const shiftEnd = toMinutes(shift.end_time) + (toMinutes(shift.end_time) <= shiftStart ? 24 * 60 : 0)
  const adjacentShift = otherShifts.find((s: Shift) => {
    const sStart = toMinutes(s.start_time)
    const sEnd = toMinutes(s.end_time) + (toMinutes(s.end_time) <= sStart ? 24 * 60 : 0)
    const gapBefore = shiftStart - sEnd
    const gapAfter = sStart - shiftEnd
    return (gapBefore >= 0 && gapBefore < MIN_REST_GAP_HOURS * 60) || (gapAfter >= 0 && gapAfter < MIN_REST_GAP_HOURS * 60)
  })
  if (adjacentShift) {
    list.push(t('shifts.conflict_rest_gap', { hours: String(MIN_REST_GAP_HOURS) }))
  }

  return list
}

function proceedAllocation(shift: Shift, officer: string, post: string) {
  if (shift.officers.length > 0) {
    targetShift.value = shift
    targetOfficer.value = officer
    selectedPost.value = post || shift.posts[0] || ''
    showPostModal.value = true
  } else {
    emit('allocate', shift.id, officer, post)
  }
}

function onDrop(shift: Shift) {
  if (!draggedOfficer.value) return
  const officer = draggedOfficer.value
  draggedOfficer.value = null
  hoveredShiftId.value = null

  conflicts.value = checkConflicts(officer, shift)
  if (conflicts.value.length > 0) {
    conflictAcknowledged.value = false
    pendingAllocation.value = { shift, officer, post: '' }
    showConflictModal.value = true
    return
  }

  proceedAllocation(shift, officer, '')
}

function confirmConflictAllocation() {
  if (pendingAllocation.value && conflictAcknowledged.value) {
    proceedAllocation(pendingAllocation.value.shift, pendingAllocation.value.officer, pendingAllocation.value.post)
  }
  showConflictModal.value = false
  conflicts.value = []
  conflictAcknowledged.value = false
  pendingAllocation.value = null
}

function closeConflictModal() {
  showConflictModal.value = false
  conflicts.value = []
  conflictAcknowledged.value = false
  pendingAllocation.value = null
}

function confirmPostAllocation() {
  if (targetShift.value && targetOfficer.value) {
    emit('allocate', targetShift.value.id, targetOfficer.value, selectedPost.value)
  }
  showPostModal.value = false
  targetShift.value = null
  targetOfficer.value = null
  selectedPost.value = ''
}

function closePostModal() {
  showPostModal.value = false
  targetShift.value = null
  targetOfficer.value = null
  selectedPost.value = ''
}

function formatShiftTime(shift: Shift): string {
  return `${shift.start_time} - ${shift.end_time}`
}
</script>

<template>
  <div class="allocation-overlay" @click="$emit('close')">
    <div class="allocation-board" @click.stop>
      <div class="allocation-header">
        <h3>{{ t('shifts.allocation_board') }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <Icon name="lucide:x" :size="20" />
        </button>
      </div>

      <div class="allocation-body">
        <!-- Left Panel - Available Officers -->
        <div class="officers-panel">
          <div class="panel-title">
            {{ t('shifts.available_officers') }}
            <span class="panel-subtitle">{{ dateStr }}</span>
          </div>
          <div class="officers-list">
            <div
              v-for="officer in officerList"
              :key="officer.name"
              class="officer-card"
              draggable="true"
              @dragstart="onDragStart(officer.name)"
              @dragend="onDragEnd"
            >
              <Icon name="lucide:grip-vertical" :size="16" class="drag-handle" />
              <div class="officer-info">
                <div class="officer-name">{{ officer.name }}</div>
                <div class="officer-role">{{ officer.role }}</div>
              </div>
              <div class="officer-hours">
                <span class="hours-value">{{ officer.weekly_hours }}h</span>
                <span class="hours-label">{{ t('shifts.weekly_hours') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Shift Timeline -->
        <div class="shifts-panel">
          <div class="panel-title">
            {{ t('shifts.shift_timeline') }}
            <span class="panel-subtitle">{{ selectedCommunity || t('shifts.all_communities') }}</span>
          </div>
          <div class="shifts-list" @dragleave="onPanelDragLeave">
            <div
              v-for="shift in dayShifts"
              :key="shift.id"
              class="allocation-shift"
              :class="{ 'allocation-shift--droppable': hoveredShiftId === shift.id }"
              @dragover.prevent
              @dragenter="onDragEnter(shift.id)"
              @drop="onDrop(shift)"
            >
              <div class="shift-main">
                <div class="shift-time">{{ formatShiftTime(shift) }}</div>
                <div class="shift-community">{{ shift.community }}</div>
              </div>
              <div class="shift-allocations">
                <div v-if="shift.officers.length === 0" class="empty-allocation">
                  {{ t('shifts.drop_officer_here') }}
                </div>
                <div
                  v-for="officer in shift.officers"
                  :key="officer"
                  class="allocated-officer"
                >
                  {{ officer }}
                </div>
              </div>
            </div>
            <div v-if="dayShifts.length === 0" class="no-shifts">
              {{ t('shifts.no_shifts_for_day') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Assignment Modal -->
    <div v-if="showPostModal" class="post-modal-overlay" @click="closePostModal">
      <div class="post-modal" @click.stop>
        <div class="post-modal-header">
          <h4>{{ t('shifts.post_assignment') }}</h4>
          <button class="close-btn" @click="closePostModal">
            <Icon name="lucide:x" :size="18" />
          </button>
        </div>
        <div class="post-modal-body">
          <p class="post-modal-text">
            {{ targetOfficer && targetShift ? t('shifts.assign_officer_to_post', { officer: targetOfficer, shift: targetShift.id }) : '' }}
          </p>
          <div class="form-group">
            <label class="form-label">{{ t('shifts.select_post') }}</label>
            <select v-model="selectedPost" class="form-input">
              <option value="">{{ t('shifts.no_specific_post') }}</option>
              <option v-for="post in targetShift?.posts" :key="post" :value="post">{{ post }}</option>
            </select>
          </div>
        </div>
        <div class="post-modal-footer">
          <button class="btn btn--secondary" @click="closePostModal">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn--primary" @click="confirmPostAllocation">
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Conflict Warning Modal -->
    <div v-if="showConflictModal" class="post-modal-overlay" @click="closeConflictModal">
      <div class="post-modal" @click.stop>
        <div class="post-modal-header">
          <h4>{{ t('shifts.allocation_conflicts') }}</h4>
          <button class="close-btn" @click="closeConflictModal">
            <Icon name="lucide:x" :size="18" />
          </button>
        </div>
        <div class="post-modal-body">
          <div class="conflict-warning">
            <Icon name="lucide:alert-triangle" :size="20" />
            <span>{{ t('shifts.conflict_warning_text') }}</span>
          </div>
          <ul class="conflict-list">
            <li v-for="(conflict, index) in conflicts" :key="index" class="conflict-item">
              <Icon name="lucide:alert-circle" :size="16" />
              {{ conflict }}
            </li>
          </ul>
          <label class="checkbox-label">
            <input v-model="conflictAcknowledged" type="checkbox" />
            {{ t('shifts.conflict_acknowledge') }}
          </label>
        </div>
        <div class="post-modal-footer">
          <button class="btn btn--secondary" @click="closeConflictModal">
            {{ t('common.cancel') }}
          </button>
          <button
            class="btn btn--danger"
            :disabled="!conflictAcknowledged"
            @click="confirmConflictAllocation"
          >
            {{ t('shifts.proceed_with_conflict') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.allocation-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.allocation-board {
  width: 900px;
  max-width: 100%;
  height: 80vh;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.allocation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.allocation-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.allocation-body {
  display: grid;
  grid-template-columns: 320px 1fr;
  flex: 1;
  overflow: hidden;
}

.officers-panel,
.shifts-panel {
  padding: var(--space-4);
  overflow-y: auto;
}

.officers-panel {
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-base);
}

.panel-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.panel-subtitle {
  font-size: var(--font-size-xs);
  font-weight: 400;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.officers-list,
.shifts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.officer-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: grab;
  transition: all 0.2s;
}

.officer-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.officer-card:active {
  cursor: grabbing;
}

.drag-handle {
  color: var(--color-text-muted);
}

.officer-info {
  flex: 1;
}

.officer-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.officer-role {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.officer-hours {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.hours-value {
  font-weight: 700;
  color: var(--color-accent);
  font-size: var(--font-size-sm);
}

.hours-label {
  font-size: 10px;
  color: var(--color-text-muted);
}

.allocation-shift {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
}

.allocation-shift--droppable {
  border-style: dashed;
  border-color: var(--color-accent);
  background: rgba(229, 255, 68, 0.05);
}

.shift-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shift-time {
  font-weight: 600;
  color: var(--color-text-primary);
}

.shift-community {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.shift-allocations {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  min-height: 32px;
  padding: var(--space-2);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
}

.empty-allocation {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  width: 100%;
  text-align: center;
}

.allocated-officer {
  padding: var(--space-1) var(--space-2);
  background: var(--color-accent);
  color: var(--color-bg-base);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.no-shifts {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-8);
}

/* Conflict Modal */
.conflict-warning {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--space-4);
}

.conflict-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-4) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.conflict-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.conflict-item svg {
  color: #ef4444;
  flex-shrink: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.checkbox-label input {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Post Modal */
.post-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.post-modal {
  width: 420px;
  max-width: 100%;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
}

.post-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.post-modal-header h4 {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.post-modal-body {
  padding: var(--space-4);
}

.post-modal-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.form-input {
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

.post-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
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

@media (max-width: 768px) {
  .allocation-body {
    grid-template-columns: 1fr;
  }

  .officers-panel {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    max-height: 40vh;
  }

  .shifts-panel {
    max-height: 40vh;
  }
}
</style>
