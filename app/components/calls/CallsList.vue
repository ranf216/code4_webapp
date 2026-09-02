<script setup lang="ts">
import { callApi } from '~/api/call'
import type { Call as ApiCall, GetCallsRequest, CallStatus, CallPriority } from '~/api/types/call'
import CallsFilters from './CallsFilters.vue'
import CallDetailsModal from './CallDetailsModal.vue'
import AssignCallModal from './AssignCallModal.vue'
import { useNotificationSocket } from '~/composables/useNotificationSocket'

const { t } = useTranslation()
const { latestNotification } = useNotificationSocket()

// Selected call for details modal
const selectedCall = ref<Call | null>(null)
const showDetailsModal = ref(false)

// Assign call modal
const callToAssign = ref<Call | null>(null)
const showAssignModal = ref(false)

function openCallDetails(call: Call) {
  selectedCall.value = call
  showDetailsModal.value = true
}

function closeCallDetails() {
  showDetailsModal.value = false
  selectedCall.value = null
}

async function handleResolved() {
  await fetchCalls()
  closeCallDetails()
}

async function handleCanceled() {
  await fetchCalls()
  closeCallDetails()
}

async function handleDeleted() {
  await fetchCalls()
  closeCallDetails()
}

// Assign call functions
function openAssignModal(call: Call) {
  callToAssign.value = call
  showAssignModal.value = true
}

function closeAssignModal() {
  showAssignModal.value = false
  callToAssign.value = null
}

async function handleAssigned() {
  await fetchCalls()
  closeAssignModal()
}

// Types for Call Category
interface CallCategory {
  type: 'medical' | 'security' | 'panic' | 'concierge' | 'test'
  label: string
  icon: string
  color: string
}

// Types for Service Type
interface ServiceType {
  name: string
  icon: string
}

// Call interface based on 4.4.1 spec
interface Call {
  id: string
  displayId: string
  communityId: number
  category: CallCategory
  serviceType: ServiceType
  residentName: string
  communityName: string
  address: string
  scheduledDateTime: string | null
  officerName: string | null
  status: 'new' | 'accepted' | 'done' | 'canceled'
  priority: CallPriority | null
  createdOn: string
  // Optional fields for Call Details
  callDateTime?: string
  currentAddress?: string
  description?: string
  media?: string[]
  audioUrl?: string
  videoUrl?: string
}

// Filter state
const activeFilters = ref<Record<string, string>>({})

function handleFilterChange(filters: Record<string, string>) {
  activeFilters.value = filters
  fetchCalls()
}

const calls = ref<Call[]>([])
const loading = ref(false)
const error = ref('')

function getCategoryInfo(category: ApiCall['category']): CallCategory {
  const map: Record<ApiCall['category'], CallCategory> = {
    medical_emergency: { type: 'medical', label: 'Medical Emergency', icon: 'lucide:heart-pulse', color: '#ef4444' },
    security_emergency: { type: 'security', label: 'Security Emergency', icon: 'lucide:shield-alert', color: '#f97316' },
    panic: { type: 'panic', label: 'Panic Button', icon: 'lucide:siren', color: '#ef4444' },
    concierge_service: { type: 'concierge', label: 'Concierge Service', icon: 'lucide:bell-concierge', color: '#3b82f6' },
    test: { type: 'test', label: 'Test Call', icon: 'lucide:test-tube', color: '#8b5cf6' },
  }
  return map[category]
}

function mapCall(apiCall: ApiCall): Call {
  const category = getCategoryInfo(apiCall.category)
  const serviceName = apiCall.service_type || category.label
  return {
    id: apiCall.call_id.toString(),
    displayId: `CL-${apiCall.call_id}`,
    category,
    serviceType: { name: serviceName, icon: category.icon },
    residentName: apiCall.resident_name || '',
    communityName: apiCall.community_name || '',
    communityId: apiCall.community_id,
    address: apiCall.address || '',
    currentAddress: apiCall.current_address || undefined,
    description: apiCall.description || undefined,
    scheduledDateTime: apiCall.scheduled_date
      ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? ' ' + apiCall.scheduled_time_from : ''}`
      : null,
    officerName: apiCall.officer_name,
    status: apiCall.status === 'resolved' ? 'done' : apiCall.status,
    priority: apiCall.priority,
    createdOn: apiCall.created_on,
    callDateTime: apiCall.created_on,
    media: apiCall.media,
    audioUrl: apiCall.audio_url || undefined,
    videoUrl: apiCall.video_url || undefined,
  }
}

function buildGetCallsRequest(filters: Record<string, string>): Omit<GetCallsRequest, '#request'> {
  const params: Omit<GetCallsRequest, '#request'> = {
    is_open: true,
    limit: 100,
  }

  if (filters.status) {
    params.status = filters.status as CallStatus
  }

  if (filters.serviceType) {
    params.category = filters.serviceType as ApiCall['category']
  }

  if (filters.search) {
    params.search_text = filters.search
  }

  if (filters.community) {
    params.community_id = Number(filters.community)
  }

  return params
}

async function fetchCalls() {
  loading.value = true
  error.value = ''
  try {
    const res = await callApi.getCalls(buildGetCallsRequest(activeFilters.value), { showLoading: false })
    calls.value = res.calls.map(mapCall)
  } catch (err: any) {
    error.value = err.message || 'Failed to load calls'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCalls()
})

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function timeSince(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Local filters for fields not supported by get_calls API, with emergency/panic sticky sorting
const filteredCalls = computed(() => {
  return calls.value
    .filter((call: Call) => {
      if (activeFilters.value.residentName &&
          !call.residentName.toLowerCase().includes(activeFilters.value.residentName.toLowerCase())) {
        return false
      }
      if (activeFilters.value.officerName) {
        if (!call.officerName) return false
        if (!call.officerName.toLowerCase().includes(activeFilters.value.officerName.toLowerCase())) {
          return false
        }
      }
      return true
    })
    .sort((a: Call, b: Call) => {
      const aUrgent = ['medical', 'security', 'panic'].includes(a.category.type) && a.status === 'new' ? 1 : 0
      const bUrgent = ['medical', 'security', 'panic'].includes(b.category.type) && b.status === 'new' ? 1 : 0
      if (aUrgent !== bUrgent) return bUrgent - aUrgent
      return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    })
})

function isNewCall(call: Call): boolean {
  return call.status === 'new'
}

// Status display
function getStatusClass(status: string): string {
  switch (status) {
    case 'new': return 'status-new'
    case 'accepted': return 'status-accepted'
    case 'resolved':
    case 'done': return 'status-done'
    case 'canceled': return 'status-canceled'
    default: return 'status-new'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'new': return t('calls.status.new')
    case 'accepted': return t('calls.status.accepted')
    case 'resolved':
    case 'done': return t('calls.status.done')
    case 'canceled': return t('calls.status.canceled')
    default: return status
  }
}

function getPriorityClass(priority: string | null | undefined): string {
  const p = priority || 'normal'
  switch (p) {
    case 'urgent': return 'priority-urgent'
    case 'important': return 'priority-important'
    case 'normal': return 'priority-normal'
    case 'low': return 'priority-low'
    default: return 'priority-normal'
  }
}

watch(
  () => latestNotification.value,
  (n: any) => {
    if (n && ['new_service_call', 'new_emergency', 'panic_button', 'call_status_changed'].includes(n.type)) {
      fetchCalls()
    }
  }
)
</script>

<template>
  <div class="calls-list">
    <!-- Filters -->
    <CallsFilters @filter-change="handleFilterChange" />

    <div v-if="loading" class="empty-state">
      <Icon name="lucide:loader-2" :size="24" class="spinner" />
      <span>Loading calls...</span>
    </div>
    <div v-else-if="error" class="empty-state">
      <Icon name="lucide:alert-circle" :size="24" />
      <span>{{ error }}</span>
    </div>
    <div v-else-if="calls.length === 0" class="empty-state">
      <Icon name="lucide:phone-off" :size="24" />
      <span>No calls found</span>
    </div>
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-id">Call #</th>
            <th class="col-category">{{ t('calls.category') }}</th>
            <th class="col-status">{{ t('calls.status') }}</th>
            <th class="col-priority">Priority</th>
            <th class="col-resident">{{ t('calls.resident') }}</th>
            <th class="col-community">{{ t('calls.community') }}</th>
            <th class="col-address">{{ t('calls.address') }}</th>
            <th class="col-created">Created</th>
            <th class="col-scheduled">{{ t('calls.scheduled_datetime') }}</th>
            <th class="col-officer">{{ t('calls.officer') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="call in filteredCalls"
            :key="call.id"
            class="call-row"
            :class="{
              'call-row--emergency': ['medical', 'security', 'panic'].includes(call.category.type) && call.status === 'new',
              'call-row--panic': call.category.type === 'panic' && call.status === 'new',
            }"
            @click="openCallDetails(call)"
          >
            <!-- Call # -->
            <td class="col-id">
              <span class="call-id">{{ call.displayId }}</span>
            </td>

            <!-- Call Category -->
            <td class="col-category">
              <div class="category-cell">
                <Icon :name="call.category.icon" :size="20" :style="{ color: call.category.color }" />
                <span class="category-label">{{ call.category.label }}</span>
              </div>
            </td>

            <!-- Status -->
            <td class="col-status">
              <span :class="['status-badge', getStatusClass(call.status)]">
                {{ getStatusLabel(call.status) }}
              </span>
            </td>

            <!-- Priority -->
            <td class="col-priority">
              <span v-if="call.priority" :class="['priority-badge', getPriorityClass(call.priority)]">
                {{ call.priority }}
              </span>
              <span v-else class="no-priority">—</span>
            </td>

            <!-- Resident Name -->
            <td class="col-resident">
              <span class="resident-name">{{ call.residentName }}</span>
            </td>

            <!-- Community Name -->
            <td class="col-community">
              <span class="community-name">{{ call.communityName }}</span>
            </td>

            <!-- Address -->
            <td class="col-address">
              <span class="address-text">{{ call.address }}</span>
            </td>

            <!-- Created -->
            <td class="col-created" :title="formatDateTime(call.createdOn)">
              <span class="elapsed-time">{{ timeSince(call.createdOn) }}</span>
              <span class="created-time">{{ formatTime(call.createdOn) }}</span>
            </td>

            <!-- Scheduled Date/Time -->
            <td class="col-scheduled">
              <span v-if="call.scheduledDateTime" class="scheduled-time">
                {{ call.scheduledDateTime }}
              </span>
              <span v-else class="not-scheduled">—</span>
            </td>

            <!-- Officer / Assign -->
            <td class="col-officer">
              <div v-if="isNewCall(call)" class="assign-btn-wrapper">
                <button class="assign-btn" @click.stop="openAssignModal(call)">
                  <Icon name="lucide:user-plus" :size="14" />
                  {{ t('calls.assign') }}
                </button>
              </div>
              <span v-else class="officer-name">{{ call.officerName || '—' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Call Details Modal -->
    <CallDetailsModal
      :show="showDetailsModal"
      :call="selectedCall"
      @close="closeCallDetails"
      @resolved="handleResolved"
      @canceled="handleCanceled"
      @deleted="handleDeleted"
    />

    <!-- Assign Call Modal -->
    <AssignCallModal
      :show="showAssignModal"
      :call="callToAssign"
      @close="closeAssignModal"
      @assigned="handleAssigned"
    />
  </div>
</template>

<style scoped>
.calls-list {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-12);
  color: var(--color-text-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.data-table th {
  background: var(--color-surface);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: var(--color-surface);
  cursor: pointer;
}

/* Column widths */
.col-id { width: 90px; }
.col-category { width: 160px; }
.col-status { width: 90px; }
.col-priority { width: 90px; }
.col-resident { width: 140px; }
.col-community { width: 160px; }
.col-address { min-width: 180px; }
.col-created { width: 100px; }
.col-scheduled { width: 150px; }
.col-officer { width: 140px; }

.call-id {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Category cell */
.category-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.category-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Service cell */
.service-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-primary);
}

/* Resident name */
.resident-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

/* Community name */
.community-name {
  color: var(--color-text-secondary);
}

/* Address */
.address-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

/* Created time */
.col-created {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.elapsed-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  font-weight: 500;
}
.created-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Assign Button */
.assign-btn-wrapper {
  display: flex;
  align-items: center;
}

.assign-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.assign-btn:hover {
  background: var(--color-accent);
  color: white;
}

.officer-name {
  color: var(--color-text-secondary);
}

/* Scheduled time */
.scheduled-time {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
}

.not-scheduled,
.no-officer,
.no-priority {
  color: var(--color-text-muted);
}

/* Priority badge */
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: capitalize;
}
.priority-urgent { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.priority-important { background: rgba(249, 115, 22, 0.15); color: #f97316; }
.priority-normal { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.priority-low { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: capitalize;
}

.status-new { background: rgba(214, 158, 46, 0.15); color: #d69e2e; }
.status-accepted { background: rgba(49, 130, 206, 0.15); color: #3182ce; }
.status-done { background: rgba(56, 161, 105, 0.15); color: #38a169; }
.status-canceled { background: rgba(160, 174, 192, 0.15); color: #a0aec0; }

/* Emergency / Panic row treatment */
@keyframes emergency-flash {
  0%, 100% { background: rgba(239, 68, 68, 0.08); }
  50% { background: rgba(239, 68, 68, 0.25); }
}

@keyframes panic-pulse {
  0%, 100% { box-shadow: inset 4px 0 0 0 #c53030; background: rgba(197, 48, 48, 0.12); }
  50% { box-shadow: inset 4px 0 0 0 #c53030; background: rgba(197, 48, 48, 0.28); }
}

.call-row--emergency td {
  animation: emergency-flash 1.2s infinite;
}

.call-row--panic td {
  animation: panic-pulse 1s infinite;
}

.call-row--panic .resident-name {
  color: #c53030;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1024px) {
  .table-wrapper {
    overflow-x: scroll;
  }

  .data-table {
    min-width: 1000px;
  }
}
</style>
