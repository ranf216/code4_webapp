<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ApiError } from '~/api/base'
import { shiftApi } from '~/api/shift'
import { ShiftErrorCodes } from '~/api/types/shift'
import type { AllocationBoardOfficer, AllocationBoardShift, ShiftConflictWarning } from '~/api/types/shift'
import { useTranslation } from '~/composables/useI18n'

interface BoardCommunity {
  community_id: number
  name: string
}

const props = defineProps<{
  show?: boolean
  communityId: number | ''
  communities: BoardCommunity[]
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
const { t } = useTranslation()

const selectedCommunityId = ref<number | ''>(props.communityId || props.communities[0]?.community_id || '')
const boardDate = ref(new Date().toISOString().slice(0, 10))
const officers = ref<AllocationBoardOfficer[]>([])
const shifts = ref<AllocationBoardShift[]>([])
const draggedOfficerId = ref<string | null>(null)
const hoveredShiftId = ref<number | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const isAllocating = ref(false)
const showConflictModal = ref(false)
const conflictWarnings = ref<ShiftConflictWarning[]>([])
const pendingAllocation = ref<{ shiftId: number; officerId: string } | null>(null)

const selectedCommunityName = computed(() => props.communities.find((community: BoardCommunity) => community.community_id === selectedCommunityId.value)?.name || t('shifts.all_communities'))
const selectedOfficer = computed(() => officers.value.find((officer: AllocationBoardOfficer) => officer.officer_id === draggedOfficerId.value))

function officerName(officerId: string): string {
  return officers.value.find((officer: AllocationBoardOfficer) => officer.officer_id === officerId)?.name || officerId
}

function shiftTime(shift: AllocationBoardShift): string {
  return `${shift.start_time} - ${shift.end_time}${shift.is_overnight ? ' (+1)' : ''}`
}

async function loadBoard() {
  if (!selectedCommunityId.value || isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await shiftApi.getAllocationBoard({
      community_id: selectedCommunityId.value,
      board_date: boardDate.value,
    }, { showLoading: false })
    officers.value = response.officers || []
    shifts.value = response.shifts || []
  } catch (error) {
    console.error('Failed to load allocation board:', error)
    errorMessage.value = error instanceof Error ? error.message : t('shifts.allocation_board_load_failed')
    officers.value = []
    shifts.value = []
  } finally {
    isLoading.value = false
  }
}

function onDragStart(officerId: string) {
  draggedOfficerId.value = officerId
}

function onDragEnd() {
  draggedOfficerId.value = null
  hoveredShiftId.value = null
}

function onDrop(shift: AllocationBoardShift) {
  const officerId = draggedOfficerId.value
  onDragEnd()
  if (!officerId || shift.allocated_officer_ids.includes(officerId)) return
  validateAndAllocate(shift.shift_id, officerId)
}

async function validateAndAllocate(shiftId: number, officerId: string, acknowledgeConflicts = false) {
  if (isAllocating.value) return
  isAllocating.value = true
  try {
    const validation = await shiftApi.validateAllocation({ shift_id: shiftId, officer_id: officerId }, { showLoading: false })
    if (validation.has_conflicts && !acknowledgeConflicts) {
      conflictWarnings.value = validation.warnings || []
      pendingAllocation.value = { shiftId, officerId }
      showConflictModal.value = true
      return
    }
    await allocateOfficer(shiftId, officerId, acknowledgeConflicts)
  } catch (error) {
    if (error instanceof ApiError && error.rc === ShiftErrorCodes.OFFICER_CONFLICT) {
      conflictWarnings.value = (error.data?.warnings || []) as ShiftConflictWarning[]
      pendingAllocation.value = { shiftId, officerId }
      showConflictModal.value = true
    } else {
      errorMessage.value = error instanceof Error ? error.message : t('shifts.allocate_failed')
    }
  } finally {
    isAllocating.value = false
  }
}

async function allocateOfficer(shiftId: number, officerId: string, acknowledgeConflicts: boolean) {
  await shiftApi.allocateOfficer({
    shift_id: shiftId,
    officer_id: officerId,
    acknowledge_conflicts: acknowledgeConflicts,
  }, { showLoading: false })
  showConflictModal.value = false
  pendingAllocation.value = null
  await loadBoard()
}

async function confirmConflictAllocation() {
  if (!pendingAllocation.value) return
  const pending = pendingAllocation.value
  showConflictModal.value = false
  await validateAndAllocate(pending.shiftId, pending.officerId, true)
}

function closeConflictModal() {
  showConflictModal.value = false
  pendingAllocation.value = null
  conflictWarnings.value = []
}

watch(() => props.communityId, (value: number | '') => {
  if (value) selectedCommunityId.value = value
})
watch([selectedCommunityId, boardDate], loadBoard)
loadBoard()
</script>

<template>
  <div class="allocation-overlay" @click="emit('close')">
    <div class="allocation-board" @click.stop>
      <div class="allocation-header">
        <div>
          <h3>{{ t('shifts.allocation_board') }}</h3>
          <div class="board-controls">
            <select v-model="selectedCommunityId" class="board-select">
              <option v-for="community in communities" :key="community.community_id" :value="community.community_id">{{ community.name }}</option>
            </select>
            <input v-model="boardDate" type="date" class="board-date" />
          </div>
        </div>
        <button class="close-btn" @click="emit('close')"><Icon name="lucide:x" :size="20" /></button>
      </div>

      <div v-if="isLoading" class="board-state"><Icon name="lucide:loader-2" :size="20" class="spin" /> {{ t('common.loading') }}</div>
      <div v-else-if="errorMessage" class="board-state board-state--error">{{ errorMessage }}<button class="btn btn--secondary" @click="loadBoard">{{ t('common.retry') }}</button></div>
      <div v-else class="allocation-body">
        <div class="officers-panel">
          <div class="panel-title">{{ t('shifts.available_officers') }}<span class="panel-subtitle">{{ selectedCommunityName }} · {{ boardDate }}</span></div>
          <div class="officers-list">
            <div v-for="officer in officers" :key="officer.officer_id" class="officer-card" draggable="true" @dragstart="onDragStart(officer.officer_id)" @dragend="onDragEnd">
              <Icon name="lucide:grip-vertical" :size="16" class="drag-handle" />
              <div class="officer-info"><div class="officer-name">{{ officer.name }}</div><div class="officer-role">{{ officer.roles?.join(', ') || t('shifts.officer') }}</div><div class="officer-badges">{{ officer.certification_badges?.join(', ') }}</div></div>
              <div class="officer-hours"><span class="hours-value">{{ officer.weekly_hours }}h</span><span class="hours-label">{{ t('shifts.weekly_hours') }}</span></div>
            </div>
            <div v-if="!officers.length" class="board-empty">{{ t('shifts.no_officers') }}</div>
          </div>
        </div>

        <div class="shifts-panel">
          <div class="panel-title">{{ t('shifts.shift_timeline') }}<span class="panel-subtitle">{{ selectedCommunityName }}</span></div>
          <div class="shifts-list">
            <div v-for="shift in shifts" :key="shift.shift_id" class="allocation-shift" :class="{ 'allocation-shift--droppable': hoveredShiftId === shift.shift_id }" @dragover.prevent="hoveredShiftId = shift.shift_id" @dragleave="hoveredShiftId = null" @drop.prevent="onDrop(shift)">
              <div class="shift-main"><div class="shift-time">{{ shiftTime(shift) }}</div><div class="shift-community">{{ shift.community_name }}</div><Badge type="shiftStatus" :value="shift.status" /></div>
              <div class="shift-allocations"><div v-if="!shift.allocated_officer_ids.length" class="empty-allocation">{{ t('shifts.drop_officer_here') }}</div><span v-for="officerId in shift.allocated_officer_ids" :key="officerId" class="allocated-officer">{{ officerName(officerId) }}</span></div>
            </div>
            <div v-if="!shifts.length" class="no-shifts">{{ t('shifts.no_shifts_for_day') }}</div>
          </div>
        </div>
      </div>
    </div>

    <ConflictWarningModal
      :show="showConflictModal"
      :warnings="conflictWarnings"
      :confirm-text="t('shifts.proceed_with_conflict')"
      :confirming="isAllocating"
      @close="closeConflictModal"
      @confirm="confirmConflictAllocation"
    />
  </div>
</template>

<style scoped>
.allocation-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; padding: var(--space-4); background: rgba(0, 0, 0, .6); }
.allocation-board { display: flex; flex-direction: column; width: 1000px; max-width: 100%; height: 80vh; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-elevated); }
.allocation-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: var(--space-4); border-bottom: 1px solid var(--color-border); }
.allocation-header h3 { font-size: var(--font-size-lg); font-weight: 600; }
.board-controls { display: flex; gap: var(--space-2); margin-top: var(--space-2); }
.board-select, .board-date { height: 36px; padding: 0 var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-base); color: var(--color-text-primary); }
.allocation-body { display: grid; grid-template-columns: 340px 1fr; flex: 1; min-height: 0; }
.officers-panel, .shifts-panel { padding: var(--space-4); overflow-y: auto; }
.officers-panel { border-right: 1px solid var(--color-border); background: var(--color-bg-base); }
.panel-title { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-4); color: var(--color-text-primary); font-weight: 600; }
.panel-subtitle { color: var(--color-text-muted); font-size: var(--font-size-xs); font-weight: 400; }
.officers-list, .shifts-list { display: flex; flex-direction: column; gap: var(--space-2); }
.officer-card { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); cursor: grab; }
.officer-card:active { cursor: grabbing; }
.drag-handle { color: var(--color-text-muted); }
.officer-info { flex: 1; min-width: 0; }
.officer-name { color: var(--color-text-primary); font-size: var(--font-size-sm); font-weight: 600; }
.officer-role, .officer-badges { overflow: hidden; color: var(--color-text-muted); font-size: var(--font-size-xs); text-overflow: ellipsis; white-space: nowrap; }
.officer-hours { display: flex; flex-direction: column; align-items: flex-end; }
.hours-value { color: var(--color-accent); font-weight: 700; }
.hours-label { color: var(--color-text-muted); font-size: 9px; }
.allocation-shift { display: grid; grid-template-columns: 170px 1fr; gap: var(--space-3); min-height: 76px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-base); transition: border-color .15s, background .15s; }
.allocation-shift--droppable { border-color: var(--color-accent); background: var(--color-accent-subtle); }
.shift-main { display: flex; flex-direction: column; gap: var(--space-1); }
.shift-time { color: var(--color-text-primary); font-weight: 600; }
.shift-community { color: var(--color-text-muted); font-size: var(--font-size-xs); }
.shift-allocations { display: flex; flex-wrap: wrap; align-content: flex-start; gap: var(--space-2); }
.allocated-officer, .empty-allocation { display: inline-flex; align-items: center; min-height: 28px; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); background: var(--color-accent-subtle); color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.empty-allocation, .board-empty, .no-shifts, .board-state { color: var(--color-text-muted); }
.board-state { display: flex; flex: 1; align-items: center; justify-content: center; gap: var(--space-2); }
.board-state--error { flex-direction: column; color: var(--color-critical); }
.post-modal-overlay { position: fixed; inset: 0; z-index: 210; display: flex; align-items: center; justify-content: center; padding: var(--space-4); background: rgba(0, 0, 0, .65); }
.post-modal { width: 480px; max-width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-elevated); }
.post-modal-header, .post-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-4); border-bottom: 1px solid var(--color-border); }
.post-modal-footer { justify-content: flex-end; border-top: 1px solid var(--color-border); border-bottom: 0; }
.post-modal-body { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4); }
.conflict-item { display: flex; gap: var(--space-2); padding: var(--space-2); color: var(--color-warn); }
.checkbox-label { display: flex; gap: var(--space-2); align-items: flex-start; color: var(--color-text-primary); }
@media (max-width: 720px) { .allocation-body { grid-template-columns: 1fr; overflow-y: auto; } .officers-panel { border-right: 0; border-bottom: 1px solid var(--color-border); } .allocation-shift { grid-template-columns: 1fr; } }
</style>
