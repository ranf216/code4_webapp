<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { taskApi } from '~/api/task'
import { officerApi } from '~/api/officer'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import FileUpload from '~/components/FileUpload.vue'
import MImagePreview from '~/components/MImagePreview.vue'
import type { Officer } from '~/api/types/officer'
import type { Task as ApiTask, TaskMedia } from '~/api/types/task'

const { t } = useTranslation()

// Types
interface Task {
  id: string
  task_id: number
  task_type: string
  task_type_name?: string
  description: string
  priority: 'urgent' | 'important' | 'normal' | 'low'
  created_at: string
  created_by: string
  created_by_name?: string | null
  status: 'new' | 'accepted' | 'approved' | 'rejected' | 'completed' | 'canceled'
  assigned_to: string
  assigned_to_name?: string | null
  address?: string
  community_name?: string | null
  last_update?: string | null
  eta?: string | null
  media?: TaskMedia[]
  comments: TaskComment[]
  updated_at: string
}

interface TaskComment {
  id: string
  text: string
  created_at: string
  user: string
}

// Task list data
const tasks = ref<Task[]>([])
const totalCount = ref(0)
const offset = ref(0)
const limit = ref(20)
const pageSizeOptions = [20, 50, 100]
const autoRefreshInterval = ref<ReturnType<typeof setInterval> | null>(null)

function mapApiTask(task: ApiTask): Task {
  return {
    id: `TSK-${String(task.task_id).padStart(3, '0')}`,
    task_id: task.task_id,
    task_type: task.task_type,
    task_type_name: task.task_type_name,
    description: task.description,
    priority: task.priority,
    status: task.status,
    created_at: task.created_on,
    created_by: task.created_by,
    created_by_name: task.created_by_name,
    assigned_to: task.assigned_to,
    assigned_to_name: task.assigned_to_name,
    address: task.address || undefined,
    community_name: task.community_name || undefined,
    last_update: task.last_update || undefined,
    eta: task.eta || undefined,
    comments: (task.comments || []).map((c) => ({
      id: String(c.comment_id),
      text: c.text,
      created_at: c.created_on,
      user: c.user_name,
    })),
    media: task.media || [],
    updated_at: task.last_update || task.created_on,
  }
}

async function fetchTasks() {
  try {
    const isOpen = selectedStatus.value === 'open' ? true : selectedStatus.value === 'closed' ? false : null
    const res = await taskApi.getTasksList({
      search_text: searchQuery.value || undefined,
      task_type: selectedTaskType.value || undefined,
      priority: (selectedPriority.value as any) || undefined,
      is_open: isOpen,
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
      sort_by: 'created_on',
      sort_dir: sortOrder.value,
      offset: offset.value,
      limit: limit.value,
    }, { showLoading: false })
    if (res.rc === 0) {
      tasks.value = (res.tasks || []).map(mapApiTask)
      totalCount.value = res.total_count || 0
    }
  } catch (err) {
    console.error('Failed to fetch tasks:', err)
  }
}

// Filter state
const searchQuery = ref('')
const selectedTaskType = ref('')
const selectedStatus = ref('open')
const selectedPriority = ref('')
const assignToMeOnly = ref(false)
const dateFrom = ref('')
const dateTo = ref('')
const sortOrder = ref<'desc' | 'asc'>('desc')

// Metadata options
const taskTypeMap = ref<Record<string, string>>({})
const priorityMap = ref<Record<string, string>>({})

const taskTypes = computed(() => [
  { value: '', label: t('tasks.all_types') },
  ...Object.entries(taskTypeMap.value).map(([value, label]) => ({ value, label })),
])

const priorities = computed(() => [
  { value: '', label: t('tasks.all_priorities') },
  ...Object.entries(priorityMap.value).map(([value, label]) => ({ value, label })),
])

const availableTaskTypes = computed(() =>
  Object.entries(taskTypeMap.value).map(([value, label]) => ({ value, label }))
)

const availablePriorities = computed(() =>
  Object.entries(priorityMap.value).map(([value, label]) => ({ value, label }))
)

const taskMetadataLoading = ref(false)

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
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const filteredTasks = computed(() => tasks.value)

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit.value)))
const showingRange = computed(() => {
  const end = Math.min(offset.value + tasks.value.length, totalCount.value)
  return `Showing ${offset.value + 1}–${end} of ${totalCount.value} tasks`
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
const newComment = ref('')
const editEtaMode = ref(false)
const editableEta = ref('')
const showImagePreview = ref(false)
const previewImages = ref<string[]>([])
const previewInitialIndex = ref(0)

const isOpenTask = computed(() => ['new', 'accepted', 'approved'].includes(selectedTask.value?.status || ''))
const taskDetailTitle = computed(() => {
  if (!selectedTask.value) return t('tasks.task_details')
  const typeName = selectedTask.value.task_type_name || taskTypeMap.value[selectedTask.value.task_type] || selectedTask.value.task_type
  return `Task #${selectedTask.value.task_id} — ${typeName}`
})

const newTaskForm = ref({
  task_type: '',
  description: '',
  priority: 'normal' as Task['priority'],
  assigned_to: '',
  address: '',
  media: [] as string[],
})

const newTaskVideoFileIds = ref<string[]>([])
const newTaskDocumentFileIds = ref<string[]>([])
const addTaskError = ref('')
const mediaUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)
const videoUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)
const documentUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)

const authStore = useAuthStore()
const toastStore = useToastStore()

const officers = ref<Officer[]>([])
const assignToSearch = ref('')
const showAssignDropdown = ref(false)

function onAssignSearchInput() {
  newTaskForm.value.assigned_to = ''
  showAssignDropdown.value = true
}

function handleAssignBlur() {
  setTimeout(() => { showAssignDropdown.value = false }, 150)
}

function selectAutoAssign() {
  newTaskForm.value.assigned_to = ''
  assignToSearch.value = ''
  showAssignDropdown.value = false
}

function selectAssignee(officer: Officer) {
  newTaskForm.value.assigned_to = officer.user_id
  assignToSearch.value = `${officer.first_name} ${officer.last_name}`
  showAssignDropdown.value = false
}

const filteredOfficers = computed(() => {
  if (!assignToSearch.value.trim()) return officers.value
  const query = assignToSearch.value.toLowerCase()
  return officers.value.filter(
    (o: Officer) =>
      o.first_name.toLowerCase().includes(query) ||
      o.last_name.toLowerCase().includes(query) ||
      (o.community_name && o.community_name.toLowerCase().includes(query))
  )
})

const selectedOfficer = computed(() =>
  officers.value.find((o: Officer) => o.user_id === newTaskForm.value.assigned_to)
)

async function fetchTaskMetadata() {
  taskMetadataLoading.value = true
  try {
    const res = await taskApi.getTaskMetadata({ showLoading: false })
    if (res.rc === 0) {
      taskTypeMap.value = res.task_types
      priorityMap.value = res.task_priorities
    }
  } catch (err) {
    console.error('Failed to load task metadata:', err)
  } finally {
    taskMetadataLoading.value = false
  }
}

async function fetchOfficers() {
  try {
    const res = await officerApi.getOfficers({ include_inactive: false })
    if (res.rc === 0) {
      officers.value = res.officers
    }
  } catch (err) {
    console.error('Failed to load officers:', err)
  }
}

onMounted(() => {
  fetchTaskMetadata()
  fetchOfficers()
  fetchTasks()
  autoRefreshInterval.value = setInterval(() => {
    if (!showTaskModal.value && !showAddModal.value && !showRejectModal.value && !showCompleteModal.value) {
      fetchTasks()
    }
  }, 60000)
})

onUnmounted(() => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
})

watch([selectedTaskType, selectedPriority, selectedStatus, dateFrom, dateTo, sortOrder, limit], () => {
  offset.value = 0
  fetchTasks()
})

let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    offset.value = 0
    fetchTasks()
  }, 300)
})

watch(offset, fetchTasks)

function clearFilters() {
  searchQuery.value = ''
  selectedTaskType.value = ''
  selectedStatus.value = 'open'
  selectedPriority.value = ''
  assignToMeOnly.value = false
  dateFrom.value = ''
  dateTo.value = ''
  sortOrder.value = 'desc'
  offset.value = 0
  limit.value = 20
  fetchTasks()
}

function toggleSort() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

async function viewTask(task: Task) {
  selectedTask.value = { ...task }
  showTaskModal.value = true
  await fetchTaskDetail(task.task_id)
}

async function fetchTaskDetail(taskId: number) {
  try {
    const res = await taskApi.getTask(taskId)
    if (res.rc === 0 && res.task) {
      selectedTask.value = mapApiTask(res.task)
    }
  } catch (err) {
    console.error('Failed to fetch task detail:', err)
  }
}

function closeTaskModal() {
  showTaskModal.value = false
  selectedTask.value = null
}

function canAccept(task: Task): boolean {
  return task.status === 'new'
}

function canReject(task: Task): boolean {
  return ['new', 'accepted'].includes(task.status)
}

function canComplete(task: Task): boolean {
  return ['accepted', 'approved'].includes(task.status)
}

function canCancel(task: Task): boolean {
  return ['new', 'accepted', 'approved'].includes(task.status)
}

function canApprove(task: Task): boolean {
  return task.status === 'accepted' && ['supply_request', 'damaged_equipment'].includes(task.task_type) && authStore.isAdmin
}

async function acceptTask(task: Task) {
  if (!task.task_id) return
  isProcessing.value = true
  try {
    await taskApi.acceptTask(task.task_id)
    await fetchTaskDetail(task.task_id)
    await fetchTasks()
  } catch (err: any) {
    console.error('Accept task failed:', err)
  } finally {
    isProcessing.value = false
  }
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
  try {
    await taskApi.rejectTask({
      task_id: selectedTask.value.task_id,
      comment: rejectComment.value,
    })
    closeRejectModal()
    closeTaskModal()
    await fetchTasks()
  } catch (err: any) {
    console.error('Reject task failed:', err)
  } finally {
    isProcessing.value = false
  }
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
  try {
    await taskApi.completeTask({
      task_id: selectedTask.value.task_id,
      comment: completeComment.value.trim() || undefined,
    })
    closeCompleteModal()
    closeTaskModal()
    await fetchTasks()
  } catch (err: any) {
    console.error('Complete task failed:', err)
  } finally {
    isProcessing.value = false
  }
}

async function addComment() {
  if (!selectedTask.value || !newComment.value.trim()) return
  isProcessing.value = true
  try {
    await taskApi.addTaskComment({
      task_id: selectedTask.value.task_id,
      comment: newComment.value.trim(),
    })
    newComment.value = ''
    await fetchTaskDetail(selectedTask.value.task_id)
  } catch (err: any) {
    console.error('Add comment failed:', err)
  } finally {
    isProcessing.value = false
  }
}

async function cancelTask() {
  if (!selectedTask.value) return
  isProcessing.value = true
  try {
    await taskApi.cancelTask(selectedTask.value.task_id)
    await fetchTaskDetail(selectedTask.value.task_id)
    await fetchTasks()
  } catch (err: any) {
    console.error('Cancel task failed:', err)
  } finally {
    isProcessing.value = false
  }
}

async function approveTask() {
  if (!selectedTask.value) return
  isProcessing.value = true
  try {
    await taskApi.approveTask({
      task_id: selectedTask.value.task_id,
    })
    await fetchTaskDetail(selectedTask.value.task_id)
    await fetchTasks()
  } catch (err: any) {
    console.error('Approve task failed:', err)
  } finally {
    isProcessing.value = false
  }
}

function startEditEta() {
  if (!selectedTask.value) return
  editEtaMode.value = true
  editableEta.value = selectedTask.value.eta ? new Date(selectedTask.value.eta).toISOString().slice(0, 16) : ''
}

async function saveEta() {
  if (!selectedTask.value) return
  try {
    await taskApi.updateTask({
      task_id: selectedTask.value.task_id,
      eta: editableEta.value ? new Date(editableEta.value).toISOString() : undefined,
    })
    editEtaMode.value = false
    await fetchTaskDetail(selectedTask.value.task_id)
  } catch (err: any) {
    console.error('Update ETA failed:', err)
  }
}

function isImageMedia(media: TaskMedia) {
  return media.media_type === 'image' && media.url
}

function openImagePreview(media: TaskMedia) {
  const images = (selectedTask.value?.media || []).filter(isImageMedia)
  const index = images.findIndex((m: TaskMedia) => m.media_id === media.media_id)
  if (index >= 0) {
    previewImages.value = images.map((m: TaskMedia) => m.url)
    previewInitialIndex.value = index
    showImagePreview.value = true
  }
}

function openAddModal() {
  newTaskForm.value = {
    task_type: Object.keys(taskTypeMap.value)[0] || '',
    description: '',
    priority: 'normal' as Task['priority'],
    assigned_to: '',
    address: '',
    media: [],
  }
  newTaskVideoFileIds.value = []
  newTaskDocumentFileIds.value = []
  assignToSearch.value = ''
  showAssignDropdown.value = false
  addTaskError.value = ''
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

async function handleAddTask() {
  if (!newTaskForm.value.description.trim() || !newTaskForm.value.task_type.trim()) return

  isProcessing.value = true
  addTaskError.value = ''

  try {
    await mediaUploadRef.value?.uploadAll()
    await videoUploadRef.value?.uploadAll()
    await documentUploadRef.value?.uploadAll()

    const response = await taskApi.createTask({
      task_type: newTaskForm.value.task_type,
      description: newTaskForm.value.description,
      priority: newTaskForm.value.priority,
      assigned_to: newTaskForm.value.assigned_to || undefined,
      address: newTaskForm.value.address || undefined,
      media_file_ids: newTaskForm.value.media.length ? newTaskForm.value.media : undefined,
      video_file_id: newTaskVideoFileIds.value[0] || undefined,
      document_file_ids: newTaskDocumentFileIds.value.length ? newTaskDocumentFileIds.value : undefined,
    })

    const taskId = response.task_id as number

    toastStore.success(`Task created: TSK-${String(taskId).padStart(3, '0')}`)
    closeAddModal()
    await fetchTasks()
  } catch (err: any) {
    addTaskError.value = err.message || 'Failed to create task'
    console.error('Create task failed:', err)
  } finally {
    isProcessing.value = false
  }
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
          <span class="date-label">From</span>
          <input v-model="dateFrom" type="date" class="date-input" />
          <span class="date-separator">-</span>
          <span class="date-label">To</span>
          <input v-model="dateTo" type="date" class="date-input" />
        </div>
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
            <th class="col-id">{{ t('tasks.id') }}</th>
            <th class="col-type">{{ t('tasks.type') }}</th>
            <th class="col-desc">{{ t('tasks.description') }}</th>
            <th class="col-priority">{{ t('tasks.priority') }}</th>
            <th class="col-status">{{ t('tasks.status') }}</th>
            <th class="col-assignee">{{ t('tasks.assigned_to') }}</th>
            <th class="col-community">{{ t('tasks.community') }}</th>
            <th class="col-date sortable" @click="toggleSort">
              {{ t('tasks.created') }}
              <Icon :name="sortOrder === 'desc' ? 'lucide:arrow-down' : 'lucide:arrow-up'" :size="12" />
            </th>
            <th class="col-date">{{ t('tasks.last_update') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id" class="task-row">
            <td class="col-id">
              <span class="id-link" @click="viewTask(task)">{{ task.id }}</span>
            </td>
            <td class="col-type">{{ taskTypeMap[task.task_type] || task.task_type }}</td>
            <td class="col-desc" :title="task.description">{{ task.description }}</td>
            <td class="col-priority">
              <Badge :type="priorityBadge[task.priority] ?? 'taskPriority'" :value="task.priority" />
            </td>
            <td class="col-status">
              <Badge :type="statusBadge[task.status] ?? 'taskStatus'" :value="task.status" />
            </td>
            <td class="col-assignee">{{ task.assigned_to_name || 'Unassigned' }}</td>
            <td class="col-community">{{ task.community_name || '—' }}</td>
            <td class="col-date">{{ formatDate(task.created_at) }}</td>
            <td class="col-date">{{ formatDate(task.last_update) }}</td>
            <td class="col-actions">
              <div class="action-badges">
                <div class="action-row">
                  <button class="action-badge action-badge--view" @click="viewTask(task)">
                    {{ t('tasks.view') }}
                  </button>
                  <button v-if="canComplete(task)" class="action-badge action-badge--complete" @click="openCompleteModal(task)">
                    {{ t('tasks.complete') }}
                  </button>
                </div>
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
        <button class="btn btn--primary" @click="openAddModal">{{ t('tasks.add_new') }}</button>
      </div>

      <div v-if="totalCount > 0" class="pagination">
        <div class="pagination__info">{{ showingRange }}</div>
        <div class="pagination__controls">
          <button class="btn btn--ghost" :disabled="offset === 0" @click="offset -= limit">{{ t('common.previous') }}</button>
          <span class="pagination__page">{{ currentPage }} / {{ totalPages }}</span>
          <button class="btn btn--ghost" :disabled="currentPage >= totalPages" @click="offset += limit">{{ t('common.next') }}</button>
          <select v-model="limit" class="filter-select">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}/page</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <AppModal v-if="selectedTask" :show="showTaskModal" :title="taskDetailTitle" :cancel-text="t('common.close')" :ok-text="undefined" @close="closeTaskModal" @cancel="closeTaskModal">
      <div class="task-detail">
        <div class="task-detail__header">
          <h3 class="task-detail__title">
            {{ selectedTask.task_type_name || taskTypeMap[selectedTask.task_type] || selectedTask.task_type }}
          </h3>
          <div class="task-detail__badges">
            <Badge :type="statusBadge[selectedTask.status] ?? 'taskStatus'" :value="selectedTask.status" />
            <Badge :type="priorityBadge[selectedTask.priority] ?? 'taskPriority'" :value="selectedTask.priority" />
          </div>
        </div>

        <div class="task-detail__meta">
          <div class="detail-row">
            <span class="detail-label">Community:</span>
            <span>{{ selectedTask.community_name || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Created by:</span>
            <span>{{ selectedTask.created_by_name || selectedTask.created_by }} · {{ formatDate(selectedTask.created_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Assigned to:</span>
            <span>{{ selectedTask.assigned_to_name || 'Unassigned' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ETA:</span>
            <span v-if="!editEtaMode">{{ selectedTask.eta ? formatDate(selectedTask.eta) : 'Not set' }}</span>
            <template v-else>
              <input v-model="editableEta" type="datetime-local" class="form-input" />
              <button class="btn btn--sm btn--primary" @click="saveEta">Save</button>
              <button class="btn btn--sm btn--ghost" @click="editEtaMode = false">Cancel</button>
            </template>
            <button v-if="authStore.isAdmin && isOpenTask && !editEtaMode" class="btn btn--link" @click="startEditEta">Edit</button>
          </div>
          <div class="detail-row detail-row--block">
            <span class="detail-label">Description:</span>
            <p class="task-detail__description">{{ selectedTask.description }}</p>
          </div>
        </div>

        <div class="task-detail__section">
          <h4 class="task-detail__section-title">Comments</h4>
          <div v-for="c in selectedTask.comments" :key="c.id" class="comment-bubble">
            <div class="comment-bubble__header">
              <span class="comment-bubble__user">{{ c.user }}</span>
              <span class="comment-bubble__time">{{ formatDate(c.created_at) }}</span>
            </div>
            <p class="comment-bubble__text">{{ c.text }}</p>
          </div>
          <div v-if="selectedTask.comments.length === 0" class="empty-section">No comments yet.</div>
        </div>

        <div v-if="selectedTask.media && selectedTask.media.length > 0" class="task-detail__section">
          <h4 class="task-detail__section-title">Media</h4>
          <div class="media-thumbnails">
            <template v-for="m in selectedTask.media" :key="m.media_id">
              <div v-if="isImageMedia(m)" class="media-thumb media-thumb--image" @click="openImagePreview(m)">
                <span v-if="m.is_confirmation" class="media-confirmation">Confirmation</span>
                <img :src="m.url" class="media-thumb__img" alt="Task image" />
              </div>
              <a v-else class="media-thumb" :href="m.url" target="_blank">
                <span v-if="m.is_confirmation" class="media-confirmation">Confirmation</span>
                <span class="media-type">{{ m.media_type }}</span>
                <span class="media-name">#{{ m.media_id }}</span>
              </a>
            </template>
          </div>
        </div>

        <div class="task-detail__comment-form">
          <textarea v-model="newComment" class="form-input" rows="2" placeholder="Add a comment..."></textarea>
          <button class="btn btn--primary" :disabled="isProcessing" @click="addComment">Send</button>
        </div>

        <div class="task-detail__actions">
          <button v-if="canAccept(selectedTask)" class="btn btn--success" :disabled="isProcessing" @click="acceptTask(selectedTask)">
            <Icon name="lucide:check" :size="16" /> Accept
          </button>
          <button v-if="canApprove(selectedTask)" class="btn btn--primary" :disabled="isProcessing" @click="approveTask">
            <Icon name="lucide:thumbs-up" :size="16" /> Approve
          </button>
          <button v-if="canComplete(selectedTask)" class="btn btn--primary" :disabled="isProcessing" @click="openCompleteModal(selectedTask)">
            <Icon name="lucide:check-circle" :size="16" /> Complete
          </button>
          <button v-if="canReject(selectedTask)" class="btn btn--danger" :disabled="isProcessing" @click="openRejectModal(selectedTask)">
            <Icon name="lucide:x" :size="16" /> Reject
          </button>
          <button v-if="canCancel(selectedTask)" class="btn btn--ghost" :disabled="isProcessing" @click="cancelTask">
            <Icon name="lucide:ban" :size="16" /> Cancel
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
          <select v-model="newTaskForm.task_type" class="form-input" :disabled="taskMetadataLoading">
            <option v-for="type in availableTaskTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('tasks.description') }} <span class="required">*</span></label>
          <textarea
            v-model="newTaskForm.description"
            class="form-input"
            rows="3"
            maxlength="500"
          ></textarea>
          <p class="field-hint" style="font-size: var(--font-size-xs); color: var(--color-text-muted); text-align: right; margin-top: var(--space-1);">{{ newTaskForm.description.length }}/500</p>
        </div>
        <div class="form-group">
          <label>{{ t('tasks.priority') }}</label>
          <select v-model="newTaskForm.priority" class="form-input" :disabled="taskMetadataLoading">
            <option v-for="p in availablePriorities" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
        <div class="form-group assign-to-group">
          <label>{{ t('tasks.assigned_to') }}</label>
          <div class="assign-to-input">
            <input
              v-model="assignToSearch"
              type="text"
              class="form-input"
              :placeholder="t('tasks.assigned_to_placeholder')"
              @input="onAssignSearchInput"
              @focus="showAssignDropdown = true"
              @blur="handleAssignBlur"
            />
            <div v-if="showAssignDropdown" class="assign-to-dropdown">
              <div
                class="assign-to-option"
                :class="{ 'is-selected': !newTaskForm.assigned_to }"
                @mousedown.prevent
                @click="selectAutoAssign"
              >
                Auto-assign (default manager)
              </div>
              <div
                v-for="o in filteredOfficers"
                :key="o.user_id"
                class="assign-to-option"
                :class="{ 'is-selected': newTaskForm.assigned_to === o.user_id }"
                @mousedown.prevent
                @click="selectAssignee(o)"
              >
                {{ o.first_name }} {{ o.last_name }} — {{ o.community_name || '—' }}
              </div>
              <div v-if="filteredOfficers.length === 0" class="assign-to-option no-results">
                No users found
              </div>
            </div>
          </div>
        </div>
        <div v-if="authStore.isAdmin" class="form-group">
          <label>{{ t('tasks.community') }}</label>
          <input
            :value="selectedOfficer?.community_name || '—'"
            type="text"
            class="form-input"
            disabled
          />
        </div>
        <div class="form-group">
          <label>{{ t('tasks.address') }}</label>
          <input
            v-model="newTaskForm.address"
            type="text"
            class="form-input"
            :placeholder="t('tasks.address_placeholder')"
            maxlength="500"
          />
        </div>
        <div class="form-group">
          <label>{{ t('tasks.media') }}</label>
          <FileUpload
            ref="mediaUploadRef"
            v-model="newTaskForm.media"
            :callApi="true"
            accept="image/*"
            :maxFiles="5"
            :maxSizeMb="5"
            :label="t('tasks.add_image')"
          />
        </div>
        <div class="form-group">
          <label>{{ t('tasks.video') }}</label>
          <FileUpload
            ref="videoUploadRef"
            v-model="newTaskVideoFileIds"
            :callApi="true"
            accept="video/*"
            :maxFiles="1"
            :maxSizeMb="20"
            :label="t('tasks.add_video')"
          />
        </div>
        <div class="form-group">
          <label>{{ t('tasks.documents') }}</label>
          <FileUpload
            ref="documentUploadRef"
            v-model="newTaskDocumentFileIds"
            :callApi="true"
            accept=".pdf,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
            :maxFiles="5"
            :maxSizeMb="10"
            :label="t('tasks.add_document')"
          />
        </div>
        <div v-if="addTaskError" class="form-group">
          <p class="form-error">{{ addTaskError }}</p>
        </div>
      </div>
      <template #footer>
        <button class="btn btn--ghost" @click="closeAddModal">{{ t('common.cancel') }}</button>
        <button class="btn btn--primary" :disabled="isProcessing" @click="handleAddTask">{{ t('tasks.create_task') }}</button>
      </template>
    </AppDialogModal>
    <MImagePreview :show="showImagePreview" :images="previewImages" :initial-index="previewInitialIndex" alt="Task media" @close="showImagePreview = false" />
  </div>
</template>

<style scoped>
.tasks-management {
  padding: var(--space-4);
}

.tasks-management__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.tasks-management__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.tasks-filters {
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
  margin-bottom: var(--space-3);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 180px;
  width: 180px;
}

.search-box input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.filter-select {
  height: 38px;
  padding: 0 var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  cursor: pointer;
  min-width: 180px;
  width: 180px;
  text-overflow: ellipsis;
}

.date-range {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-separator {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.date-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.date-input {
  height: 38px;
  width: 120px;
  max-width: 120px;
  padding: 0 var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.filter-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.tasks-list-container {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
}

.tasks-table th {
  text-align: left;
  padding: var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.tasks-table td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}

.task-row:hover {
  background: var(--color-bg-base);
}

.col-id {
  font-family: monospace;
  color: var(--color-accent);
}

.col-desc {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-actions {
  text-align: center;
  min-width: 140px;
}

.action-badges {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-start;
}

.action-row {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.action-badge:hover {
  opacity: 0.8;
}

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

.no-tasks {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-muted);
}

.task-details {
  padding: var(--space-2);
}

.detail-row {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.detail-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 120px;
}

.comments-section {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.comments-section h4 {
  margin-bottom: var(--space-3);
}

.comment-item {
  background: var(--color-bg-base);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}

.modal-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.form-textarea {
  width: 100%;
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  resize: vertical;
  margin-top: var(--space-2);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.required {
  color: var(--color-critical);
}

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
.media-upload,
.video-upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.media-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.media-item,
.video-item {
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

.assign-to-group {
  position: relative;
}

.assign-to-input {
  position: relative;
  width: 100%;
}

.assign-to-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  margin-top: var(--space-1);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 220px;
  overflow-y: auto;
}

.assign-to-option {
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.assign-to-option.is-selected,
.assign-to-option:hover {
  background: var(--color-bg-base);
  color: var(--color-primary);
}

.assign-to-option.no-results {
  color: var(--color-text-muted);
  cursor: default;
}

.assign-to-option.no-results:hover {
  background: transparent;
}

.id-link {
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 500;
}

.id-link:hover {
  text-decoration: underline;
}

.col-id {
  text-align: right;
}

.col-desc {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  color: var(--color-primary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.pagination__info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pagination__page {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.task-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.task-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.task-detail__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
}

.task-detail__badges {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.task-detail__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.task-detail__meta .detail-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.task-detail__meta .detail-row--block {
  flex-direction: column;
  align-items: flex-start;
}

.task-detail__description {
  margin: 0;
  color: var(--color-text-secondary);
}

.task-detail__section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

.task-detail__section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.comment-bubble {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-2);
}

.comment-bubble__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.comment-bubble__user {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.comment-bubble__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.comment-bubble__text {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.empty-section {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  padding: var(--space-2) 0;
}

.media-thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.media-thumb {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 100px;
  text-decoration: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.media-thumb--image {
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  position: relative;
}

.media-thumb__img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}

.media-thumb--image .media-confirmation {
  position: absolute;
  top: var(--space-1);
  left: var(--space-1);
  z-index: 1;
}

.media-confirmation {
  font-size: var(--font-size-xs);
  background: var(--color-primary);
  color: var(--color-bg-elevated);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  align-self: flex-start;
}

.media-type {
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-text-muted);
}

.media-name {
  color: var(--color-text-secondary);
}

.task-detail__comment-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

.task-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}
</style>
