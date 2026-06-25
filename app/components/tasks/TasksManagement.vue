<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'

const { t } = useTranslation()

// Types
interface Task {
  id: string
  task_type: string
  description: string
  priority: 'urgent' | 'important' | 'normal' | 'low'
  created_at: string
  created_by: string
  status: 'new' | 'accepted' | 'approved' | 'rejected' | 'completed' | 'canceled'
  assigned_to: string
  address?: string
  eta?: string
  comments: TaskComment[]
  updated_at: string
}

interface TaskComment {
  id: string
  text: string
  created_at: string
  user: string
}

// Mock data
const tasks = ref<Task[]>([
  {
    id: 'TSK-001',
    task_type: 'Maintenance',
    description: 'Repair broken gate at North entrance',
    priority: 'urgent',
    created_at: '2026-06-18T14:30:00Z',
    created_by: 'John Manager',
    status: 'new',
    assigned_to: 'Officer Smith',
    comments: [],
    updated_at: '2026-06-18T14:30:00Z',
  },
  {
    id: 'TSK-002',
    task_type: 'Inspection',
    description: 'Weekly security equipment inspection',
    priority: 'normal',
    created_at: '2026-06-18T10:00:00Z',
    created_by: 'Sarah Admin',
    status: 'accepted',
    assigned_to: 'Officer Johnson',
    comments: [{ id: '1', text: 'Will start at 2 PM', created_at: '2026-06-18T11:00:00Z', user: 'Officer Johnson' }],
    updated_at: '2026-06-18T11:00:00Z',
  },
  {
    id: 'TSK-003',
    task_type: 'Damaged Equipment',
    description: 'Replace faulty CCTV camera at parking lot',
    priority: 'important',
    created_at: '2026-06-17T09:15:00Z',
    created_by: 'Mike Supervisor',
    status: 'completed',
    assigned_to: 'Technician Lee',
    comments: [{ id: '2', text: 'Camera replaced successfully', created_at: '2026-06-17T15:30:00Z', user: 'Technician Lee' }],
    updated_at: '2026-06-17T15:30:00Z',
  },
  {
    id: 'TSK-004',
    task_type: 'Operational Report',
    description: 'Submit daily patrol report for Sector 7',
    priority: 'low',
    created_at: '2026-06-16T08:00:00Z',
    created_by: 'Officer Davis',
    status: 'rejected',
    assigned_to: 'Officer Davis',
    comments: [{ id: '3', text: 'Missing incident details', created_at: '2026-06-16T18:00:00Z', user: 'John Manager' }],
    updated_at: '2026-06-16T18:00:00Z',
  },
  {
    id: 'TSK-005',
    task_type: 'Supply Request',
    description: 'Request new flashlights and batteries',
    priority: 'normal',
    created_at: '2026-06-15T11:20:00Z',
    created_by: 'Officer Wilson',
    status: 'approved',
    assigned_to: 'Logistics Team',
    comments: [],
    updated_at: '2026-06-15T14:00:00Z',
  },
])

// Filter state
const searchQuery = ref('')
const selectedTaskType = ref('')
const selectedStatus = ref('open')
const selectedPriority = ref('')
const assignToMeOnly = ref(false)
const dateFrom = ref('')
const dateTo = ref('')
const sortOrder = ref<'desc' | 'asc'>('desc')

// Options
const taskTypes = [
  { value: '', label: t('tasks.all_types') },
  { value: 'Maintenance', label: t('tasks.type_maintenance') },
  { value: 'Inspection', label: t('tasks.type_inspection') },
  { value: 'Damaged Equipment', label: t('tasks.type_damaged_equipment') },
  { value: 'Operational Report', label: t('tasks.type_operational_report') },
  { value: 'Supply Request', label: t('tasks.type_supply_request') },
]

const priorities = [
  { value: '', label: t('tasks.all_priorities') },
  { value: 'urgent', label: t('tasks.priority_urgent') },
  { value: 'important', label: t('tasks.priority_important') },
  { value: 'normal', label: t('tasks.priority_normal') },
  { value: 'low', label: t('tasks.priority_low') },
]

const statusOptions = [
  { value: 'open', label: t('tasks.status_open') },
  { value: 'closed', label: t('tasks.status_closed') },
  { value: 'all', label: t('tasks.status_all') },
]

const openStatuses = ['new', 'accepted', 'approved']
const closedStatuses = ['completed', 'rejected', 'canceled']

// Priority badge type
const priorityBadge: Record<string, 'taskPriority'> = {
  urgent: 'taskPriority',
  important: 'taskPriority',
  normal: 'taskPriority',
  low: 'taskPriority',
}

// Status badge type
const statusBadge: Record<string, 'taskStatus'> = {
  new: 'taskStatus',
  accepted: 'taskStatus',
  approved: 'taskStatus',
  completed: 'taskStatus',
  rejected: 'taskStatus',
  canceled: 'taskStatus',
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Computed filtered tasks
const filteredTasks = computed(() => {
  let result = tasks.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((task: Task) =>
      task.description.toLowerCase().includes(query) ||
      task.id.toLowerCase().includes(query) ||
      task.created_by.toLowerCase().includes(query) ||
      task.assigned_to.toLowerCase().includes(query)
    )
  }

  if (selectedTaskType.value) {
    result = result.filter((task: Task) => task.task_type === selectedTaskType.value)
  }

  if (selectedStatus.value === 'open') {
    result = result.filter((task: Task) => openStatuses.includes(task.status))
  } else if (selectedStatus.value === 'closed') {
    result = result.filter((task: Task) => closedStatuses.includes(task.status))
  }

  if (selectedPriority.value) {
    result = result.filter((task: Task) => task.priority === selectedPriority.value)
  }

  if (assignToMeOnly.value) {
    result = result.filter((task: Task) => task.assigned_to === 'Manager' || task.created_by === 'Manager')
  }

  if (dateFrom.value) {
    result = result.filter((task: Task) => new Date(task.created_at) >= new Date(dateFrom.value))
  }
  if (dateTo.value) {
    const toDate = new Date(dateTo.value)
    toDate.setHours(23, 59, 59)
    result = result.filter((task: Task) => new Date(task.created_at) <= toDate)
  }

  result.sort((a: Task, b: Task) => {
    const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return sortOrder.value === 'desc' ? diff : -diff
  })

  return result
})

// Actions
const selectedTask = ref<Task | null>(null)
const showTaskModal = ref(false)
const showAddModal = ref(false)
const showRejectModal = ref(false)
const showCompleteModal = ref(false)
const isProcessing = ref(false)
const rejectComment = ref('')
const completeComment = ref('')

const newTaskForm = ref({
  task_type: 'Maintenance',
  description: '',
  priority: 'normal' as Task['priority'],
  assigned_to: '',
  address: '',
  eta: '',
  media: [] as string[],
  video: '',
})

function clearFilters() {
  searchQuery.value = ''
  selectedTaskType.value = ''
  selectedStatus.value = 'open'
  selectedPriority.value = ''
  assignToMeOnly.value = false
  dateFrom.value = ''
  dateTo.value = ''
  sortOrder.value = 'desc'
}

function toggleSort() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

function viewTask(task: Task) {
  selectedTask.value = { ...task }
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
  selectedTask.value = null
}

function canAccept(task: Task): boolean {
  return task.status === 'new'
}

function canReject(task: Task): boolean {
  return ['new', 'accepted', 'approved'].includes(task.status)
}

function canComplete(task: Task): boolean {
  return ['new', 'accepted', 'approved'].includes(task.status)
}

async function acceptTask(task: Task) {
  isProcessing.value = true
  const t = tasks.value.find((ta: Task) => ta.id === task.id)
  if (t) {
    t.status = 'accepted'
    t.assigned_to = 'Manager'
    t.updated_at = new Date().toISOString()
    t.comments.push({
      id: Date.now().toString(),
      text: 'Task accepted by Manager',
      created_at: new Date().toISOString(),
      user: 'Manager',
    })
  }
  isProcessing.value = false
}

function openRejectModal(task: Task) {
  closeTaskModal()
  selectedTask.value = { ...task }
  showRejectModal.value = true
  rejectComment.value = ''
}

function closeRejectModal() {
  showRejectModal.value = false
  rejectComment.value = ''
}

async function confirmReject() {
  if (!selectedTask.value || !rejectComment.value.trim()) return
  isProcessing.value = true
  const t = tasks.value.find((ta: Task) => ta.id === selectedTask.value!.id)
  if (t) {
    t.status = 'rejected'
    t.updated_at = new Date().toISOString()
    t.comments.push({
      id: Date.now().toString(),
      text: `Rejected: ${rejectComment.value}`,
      created_at: new Date().toISOString(),
      user: 'Manager',
    })
  }
  closeRejectModal()
  closeTaskModal()
  isProcessing.value = false
}

function openCompleteModal(task: Task) {
  closeTaskModal()
  selectedTask.value = { ...task }
  showCompleteModal.value = true
  completeComment.value = ''
}

function closeCompleteModal() {
  showCompleteModal.value = false
  completeComment.value = ''
}

async function confirmComplete() {
  if (!selectedTask.value) return
  isProcessing.value = true
  const t = tasks.value.find((ta: Task) => ta.id === selectedTask.value!.id)
  if (t) {
    t.status = 'completed'
    t.updated_at = new Date().toISOString()
    if (completeComment.value.trim()) {
      t.comments.push({
        id: Date.now().toString(),
        text: `Completed: ${completeComment.value}`,
        created_at: new Date().toISOString(),
        user: 'Manager',
      })
    }
  }
  closeCompleteModal()
  closeTaskModal()
  isProcessing.value = false
}

function openAddModal() {
  newTaskForm.value = {
    task_type: 'Maintenance',
    description: '',
    priority: 'normal',
    assigned_to: '',
    address: '',
    eta: '',
    media: [],
    video: '',
  }
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

function handleAddTask() {
  if (!newTaskForm.value.description.trim() || !newTaskForm.value.assigned_to.trim()) return

  const newTask: Task = {
    id: `TSK-${String(tasks.value.length + 1).padStart(3, '0')}`,
    task_type: newTaskForm.value.task_type,
    description: newTaskForm.value.description,
    priority: newTaskForm.value.priority,
    created_at: new Date().toISOString(),
    created_by: 'Manager',
    status: 'new',
    assigned_to: newTaskForm.value.assigned_to,
    address: newTaskForm.value.address || undefined,
    eta: newTaskForm.value.eta || undefined,
    comments: [],
    updated_at: new Date().toISOString(),
  }

  tasks.value.unshift(newTask)
  closeAddModal()
}
</script>

<template>
  <div class="tasks-management">
    <!-- Header -->
    <div class="tasks-management__header">
      <h2 class="tasks-management__title">{{ t('tasks.title') }}</h2>
      <button class="btn btn--primary" @click="openAddModal">
        <Icon name="lucide:plus" :size="16" />
        {{ t('tasks.add_new') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="tasks-filters">
      <div class="filter-row">
        <div class="search-box">
          <Icon name="lucide:search" :size="16" />
          <input v-model="searchQuery" type="text" :placeholder="t('tasks.search_placeholder')" />
        </div>
        <select v-model="selectedTaskType" class="filter-select">
          <option v-for="type in taskTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
        </select>
        <select v-model="selectedStatus" class="filter-select">
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="selectedPriority" class="filter-select">
          <option v-for="p in priorities" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
        <div class="date-range">
          <input v-model="dateFrom" type="date" class="date-input" />
          <span>-</span>
          <input v-model="dateTo" type="date" class="date-input" />
        </div>
        <label class="filter-toggle">
          <input v-model="assignToMeOnly" type="checkbox" />
          <span>{{ t('tasks.assign_to_me') }}</span>
        </label>
      </div>
      <div class="filter-actions">
        <button class="btn btn--ghost" @click="clearFilters">
          <Icon name="lucide:x" :size="14" /> {{ t('tasks.clear_filters') }}
        </button>
        <button class="btn btn--ghost" @click="toggleSort">
          <Icon :name="sortOrder === 'desc' ? 'lucide:arrow-down' : 'lucide:arrow-up'" :size="14" />
          {{ sortOrder === 'desc' ? t('tasks.newest_first') : t('tasks.oldest_first') }}
        </button>
      </div>
    </div>

    <!-- Task Table -->
    <div class="tasks-list-container">
      <table class="tasks-table">
        <thead>
          <tr>
            <th>{{ t('tasks.id') }}</th>
            <th>{{ t('tasks.type') }}</th>
            <th>{{ t('tasks.description') }}</th>
            <th>{{ t('tasks.priority') }}</th>
            <th>{{ t('tasks.created') }}</th>
            <th>{{ t('tasks.created_by') }}</th>
            <th>{{ t('tasks.status') }}</th>
            <th>{{ t('tasks.assigned_to') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id" class="task-row">
            <td class="col-id">{{ task.id }}</td>
            <td class="col-type">{{ task.task_type }}</td>
            <td class="col-desc">{{ task.description }}</td>
            <td class="col-priority">
              <Badge :type="priorityBadge[task.priority] ?? 'taskPriority'" :value="task.priority" />
            </td>
            <td class="col-date">{{ formatDate(task.created_at) }}</td>
            <td class="col-creator">{{ task.created_by }}</td>
            <td class="col-status">
              <Badge :type="statusBadge[task.status] ?? 'taskStatus'" :value="task.status" />
            </td>
            <td class="col-assignee">{{ task.assigned_to }}</td>
            <td class="col-actions">
              <div class="action-badges">
                <!-- Row 1: View & Complete -->
                <div class="action-row">
                  <button class="action-badge action-badge--view" @click="viewTask(task)">
                    {{ t('tasks.view') }}
                  </button>
                  <button v-if="canComplete(task)" class="action-badge action-badge--complete" @click="openCompleteModal(task)">
                    {{ t('tasks.complete') }}
                  </button>
                </div>
                <!-- Row 2: Accept & Reject -->
                <div class="action-row">
                  <button v-if="canAccept(task)" class="action-badge action-badge--accept" @click="acceptTask(task)">
                    {{ t('tasks.accept') }}
                  </button>
                  <button v-if="canReject(task)" class="action-badge action-badge--reject" @click="openRejectModal(task)">
                    {{ t('tasks.reject') }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredTasks.length === 0" class="no-tasks">
        <Icon name="lucide:inbox" :size="48" />
        <p>{{ t('tasks.no_tasks') }}</p>
      </div>
    </div>

    <!-- Task Details Modal -->
    <AppModal v-if="selectedTask" :show="showTaskModal" :title="t('tasks.task_details')" :cancel-text="t('common.close')" :ok-text="undefined" @close="closeTaskModal" @cancel="closeTaskModal">
      <div class="task-details">
        <div class="detail-row"><span class="detail-label">{{ t('tasks.id') }}:</span><span>{{ selectedTask.id }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('tasks.type') }}:</span><span>{{ selectedTask.task_type }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('tasks.description') }}:</span><span>{{ selectedTask.description }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('tasks.priority') }}:</span><Badge :type="priorityBadge[selectedTask.priority] ?? 'taskPriority'" :value="selectedTask.priority" /></div>
        <div class="detail-row"><span class="detail-label">{{ t('tasks.status') }}:</span><Badge :type="statusBadge[selectedTask.status] ?? 'taskStatus'" :value="selectedTask.status" /></div>
        <div class="detail-row"><span class="detail-label">{{ t('tasks.created_by') }}:</span><span>{{ selectedTask.created_by }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('tasks.assigned_to') }}:</span><span>{{ selectedTask.assigned_to }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('tasks.created') }}:</span><span>{{ formatDate(selectedTask.created_at) }}</span></div>

        <div v-if="selectedTask.comments.length > 0" class="comments-section">
          <h4>{{ t('tasks.comments') }}</h4>
          <div v-for="c in selectedTask.comments" :key="c.id" class="comment-item">
            <div class="comment-header"><span>{{ c.user }}</span><span>{{ formatDate(c.created_at) }}</span></div>
            <p>{{ c.text }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button v-if="canAccept(selectedTask)" class="btn btn--success" :disabled="isProcessing" @click="acceptTask(selectedTask)">
            <Icon name="lucide:check" :size="16" /> {{ t('tasks.accept') }}
          </button>
          <button v-if="canReject(selectedTask)" class="btn btn--danger" :disabled="isProcessing" @click="openRejectModal(selectedTask)">
            <Icon name="lucide:x" :size="16" /> {{ t('tasks.reject') }}
          </button>
          <button v-if="canComplete(selectedTask)" class="btn btn--primary" :disabled="isProcessing" @click="openCompleteModal(selectedTask)">
            <Icon name="lucide:check-circle" :size="16" /> {{ t('tasks.complete') }}
          </button>
        </div>
      </div>
    </AppModal>

    <!-- Reject Modal -->
    <AppModal :show="showRejectModal" :title="t('tasks.reject_task')" :cancel-text="t('common.cancel')" :ok-text="t('tasks.confirm_reject')" @close="closeRejectModal" @cancel="closeRejectModal" @ok="confirmReject">
      <p>{{ t('tasks.reject_description') }}</p>
      <textarea v-model="rejectComment" class="form-textarea" rows="4" :placeholder="t('tasks.reject_placeholder')"></textarea>
    </AppModal>

    <!-- Complete Modal -->
    <AppModal :show="showCompleteModal" :title="t('tasks.complete_task')" :cancel-text="t('common.cancel')" :ok-text="t('tasks.confirm_complete')" @close="closeCompleteModal" @cancel="closeCompleteModal" @ok="confirmComplete">
      <p>{{ t('tasks.complete_description') }}</p>
      <textarea v-model="completeComment" class="form-textarea" rows="4" :placeholder="t('tasks.complete_placeholder')"></textarea>
    </AppModal>

    <!-- Add Task Modal -->
    <AppDialogModal :show="showAddModal" :title="t('tasks.add_new_task')" @close="closeAddModal">
      <div class="add-task-form">
        <div class="form-group">
          <label>{{ t('tasks.task_type') }} <span class="required">*</span></label>
          <select v-model="newTaskForm.task_type" class="form-input">
            <option value="Maintenance">{{ t('tasks.type_maintenance') }}</option>
            <option value="Inspection">{{ t('tasks.type_inspection') }}</option>
            <option value="Damaged Equipment">{{ t('tasks.type_damaged_equipment') }}</option>
            <option value="Operational Report">{{ t('tasks.type_operational_report') }}</option>
            <option value="Supply Request">{{ t('tasks.type_supply_request') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('tasks.description') }} <span class="required">*</span></label>
          <textarea v-model="newTaskForm.description" class="form-input" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>{{ t('tasks.priority') }} <span class="required">*</span></label>
          <select v-model="newTaskForm.priority" class="form-input">
            <option value="urgent">{{ t('tasks.priority_urgent') }}</option>
            <option value="important">{{ t('tasks.priority_important') }}</option>
            <option value="normal">{{ t('tasks.priority_normal') }}</option>
            <option value="low">{{ t('tasks.priority_low') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('tasks.assigned_to') }} <span class="required">*</span></label>
          <input v-model="newTaskForm.assigned_to" type="text" class="form-input" :placeholder="t('tasks.assigned_to_placeholder')" />
        </div>
        <div class="form-group">
          <label>{{ t('tasks.address') }}</label>
          <input v-model="newTaskForm.address" type="text" class="form-input" :placeholder="t('tasks.address_placeholder')" />
        </div>
        <div class="form-group">
          <label>{{ t('tasks.eta') }}</label>
          <input v-model="newTaskForm.eta" type="datetime-local" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('tasks.media') }} ({{ newTaskForm.media.length }}/5)</label>
          <div class="media-upload">
            <button class="btn btn--ghost btn--sm" @click="newTaskForm.media.push('image_' + Date.now())">
              <Icon name="lucide:image-plus" :size="14" />
              {{ t('tasks.add_image') }}
            </button>
            <div v-if="newTaskForm.media.length > 0" class="media-preview">
              <span v-for="(img, i) in newTaskForm.media" :key="i" class="media-item">
                <Icon name="lucide:image" :size="16" />
                <button class="remove-btn" @click="newTaskForm.media.splice(i, 1)"><Icon name="lucide:x" :size="12" /></button>
              </span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('tasks.video') }}</label>
          <div class="video-upload">
            <button v-if="!newTaskForm.video" class="btn btn--ghost btn--sm" @click="newTaskForm.video = 'video_' + Date.now()">
              <Icon name="lucide:video-plus" :size="14" />
              {{ t('tasks.add_video') }}
            </button>
            <span v-else class="video-item">
              <Icon name="lucide:video" :size="16" />
              <span class="video-name">{{ t('tasks.video_added') }}</span>
              <button class="remove-btn" @click="newTaskForm.video = ''"><Icon name="lucide:x" :size="12" /></button>
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn--ghost" @click="closeAddModal">{{ t('common.cancel') }}</button>
        <button class="btn btn--primary" @click="handleAddTask">{{ t('tasks.create_task') }}</button>
      </template>
    </AppDialogModal>
  </div>
</template>

<style scoped>
.tasks-management { padding: var(--space-4); }
.tasks-management__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.tasks-management__title { font-size: var(--font-size-xl); font-weight: 600; }

.tasks-filters { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); margin-bottom: var(--space-4); }
.filter-row { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center; margin-bottom: var(--space-3); }
.search-box { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); min-width: 250px; }
.search-box input { flex: 1; background: none; border: none; outline: none; color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-select { height: 38px; padding: 0 var(--space-3); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); outline: none; cursor: pointer; min-width: 150px; }
.date-range { display: flex; align-items: center; gap: var(--space-2); }
.date-input { height: 38px; padding: 0 var(--space-2); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-toggle { display: flex; align-items: center; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--font-size-sm); cursor: pointer; }
.filter-actions { display: flex; gap: var(--space-2); justify-content: flex-end; }

.tasks-list-container { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.tasks-table { width: 100%; border-collapse: collapse; }
.tasks-table th { text-align: left; padding: var(--space-3); font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.tasks-table td { padding: var(--space-3); border-bottom: 1px solid var(--color-border); font-size: var(--font-size-sm); }
.task-row:hover { background: var(--color-bg-base); }
.col-id { font-family: monospace; color: var(--color-accent); }
.col-desc { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-actions { text-align: center; min-width: 140px; }
.action-badges { display: flex; flex-direction: column; gap: var(--space-2); align-items: flex-start; }
.action-row { display: flex; gap: var(--space-2); justify-content: center; }
.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.action-badge:hover { opacity: 0.8; }
.action-badge--view {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}
.action-badge--complete {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}
.action-badge--accept {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}
.action-badge--reject {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}
.no-tasks { text-align: center; padding: var(--space-8); color: var(--color-text-muted); }

.task-details { padding: var(--space-2); }
.detail-row { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
.detail-label { font-weight: 500; color: var(--color-text-secondary); min-width: 120px; }
.comments-section { margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--color-border); }
.comments-section h4 { margin-bottom: var(--space-3); }
.comment-item { background: var(--color-bg-base); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-2); }
.comment-header { display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-1); }
.modal-actions { display: flex; gap: var(--space-2); margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--color-border); }

.form-textarea { width: 100%; padding: var(--space-3); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); resize: vertical; margin-top: var(--space-2); }
.form-group { margin-bottom: var(--space-4); }
.form-group label { display: block; margin-bottom: var(--space-2); font-size: var(--font-size-sm); font-weight: 500; }
.form-input { width: 100%; padding: var(--space-3); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.required { color: var(--color-critical); }

/* Modal sizing: 70% height, 50% width */
:global(.modal) {
  max-height: 70vh;
  width: 50vw;
  max-width: 600px;
}
:global(.modal__body) {
  max-height: calc(70vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
:global(.modal__body::-webkit-scrollbar) {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

/* Media & Video upload styling */
.media-upload, .video-upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.media-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.media-item, .video-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.remove-btn {
  padding: 2px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-btn:hover {
  color: var(--color-critical);
}
.btn--sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-sm);
}
.video-name {
  color: var(--color-text-secondary);
}
</style>
