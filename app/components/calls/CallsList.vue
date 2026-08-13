<script setup lang="ts">
import { callApi } from '~/api/call'
import type { Call as ApiCall, GetCallsRequest } from '~/api/types/call'
import CallsFilters from './CallsFilters.vue'
import CallDetailsModal from './CallDetailsModal.vue'
import AssignCallModal from './AssignCallModal.vue'

const { t } = useTranslation()

// Selected call for details modal
const selectedCall = ref<Call | null>(null)
const showDetailsModal = ref(false)

// Assign call modal
const callToAssign = ref<Call | null>(null)
const showAssignModal = ref(false)

function openCallDetails(call: Call) {
  // Enhance call data with additional fields for the modal
  selectedCall.value = {
    ...call,
    callDateTime: '2024-06-16 10:30:00', // Mock data
    currentAddress: call.category.type === 'medical' || call.category.type === 'security' 
      ? 'Current GPS Location (34.0522° N, 118.2437° W)' 
      : undefined,
    description: 'Resident reported feeling unwell and requested medical assistance. Urgent response needed.',
    media: [
      'https://picsum.photos/seed/call1/150/150',
      'https://picsum.photos/seed/call2/150/150',
    ],
    audioUrl: call.category.type === 'medical' || call.category.type === 'security' 
      ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
      : undefined,
  }
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

// Assign call functions
function openAssignModal(call: Call) {
  callToAssign.value = call
  showAssignModal.value = true
}

function closeAssignModal() {
  showAssignModal.value = false
  callToAssign.value = null
}

async function handleAssign(data: { officerId: string; officerName: string }) {
  if (!callToAssign.value) return

  try {
    await callApi.assignCall({
      call_id: Number(callToAssign.value.id),
      officer_user_id: data.officerId,
    })
    await fetchCalls()
    closeAssignModal()
  } catch (err: any) {
    console.error('Assign call failed:', err)
  }
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
  communityId: number
  category: CallCategory
  serviceType: ServiceType
  residentName: string
  communityName: string
  address: string
  scheduledDateTime: string | null
  officerName: string | null
  status: 'new' | 'accepted'
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
  const serviceIcon = apiCall.category === 'concierge_service' ? 'lucide:bell-concierge' : category.icon
  const scheduledDateTime = apiCall.scheduled_date
    ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? ' ' + apiCall.scheduled_time_from : ''}`
    : null

  return {
    id: apiCall.call_id.toString(),
    category,
    serviceType: { name: serviceName, icon: serviceIcon },
    residentName: apiCall.resident_name || '',
    communityName: apiCall.community_name || '',
    communityId: apiCall.community_id,
    address: apiCall.address || '',
    scheduledDateTime,
    officerName: apiCall.officer_name,
    status: apiCall.status as 'new' | 'accepted',
  }
}

function buildGetCallsRequest(filters: Record<string, string>): Omit<GetCallsRequest, '#request'> {
  const categoryMap: Record<string, ApiCall['category'] | undefined> = {
    'Medical Assistance': 'medical_emergency',
    'Security Patrol': 'security_emergency',
    'Package Delivery': 'concierge_service',
    'Communication Test': 'test',
  }

  const params: Omit<GetCallsRequest, '#request'> = {
    is_open: true,
    limit: 100,
  }

  if (filters.status) {
    params.status = filters.status as ApiCall['status']
  }

  const category = filters.serviceType ? categoryMap[filters.serviceType] : undefined
  if (category) {
    params.category = category
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

// Local filters for fields not supported by get_calls API
const filteredCalls = computed(() => {
  return calls.value.filter((call) => {
    // Resident name filter
    if (activeFilters.value.residentName &&
        !call.residentName.toLowerCase().includes(activeFilters.value.residentName.toLowerCase())) {
      return false
    }

    // Officer name filter
    if (activeFilters.value.officerName) {
      if (!call.officerName) return false
      if (!call.officerName.toLowerCase().includes(activeFilters.value.officerName.toLowerCase())) {
        return false
      }
    }

    return true
  })
})

// Status display
function getStatusClass(status: string): string {
  return status === 'new' ? 'status-new' : 'status-accepted'
}

function getStatusLabel(status: string): string {
  return status === 'new' ? t('calls.status.new') : t('calls.status.accepted')
}
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
            <th class="col-category">{{ t('calls.category') }}</th>
            <th class="col-service">{{ t('calls.service_type') }}</th>
            <th class="col-resident">{{ t('calls.resident') }}</th>
            <th class="col-community">{{ t('calls.community') }}</th>
            <th class="col-address">{{ t('calls.address') }}</th>
            <th class="col-scheduled">{{ t('calls.scheduled_datetime') }}</th>
            <th class="col-officer">{{ t('calls.officer') }}</th>
            <th class="col-status">{{ t('calls.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="call in filteredCalls" :key="call.id" class="call-row" @click="openCallDetails(call)">
            <!-- Call Category -->
            <td class="col-category">
              <div class="category-cell">
                <Icon :name="call.category.icon" :size="20" :style="{ color: call.category.color }" />
                <span class="category-label">{{ call.category.label }}</span>
              </div>
            </td>

            <!-- Service Type -->
            <td class="col-service">
              <div class="service-cell">
                <Icon :name="call.serviceType.icon" :size="16" />
                <span>{{ call.serviceType.name }}</span>
              </div>
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

            <!-- Scheduled Date/Time -->
            <td class="col-scheduled">
              <span v-if="call.scheduledDateTime" class="scheduled-time">
                {{ call.scheduledDateTime }}
              </span>
              <span v-else class="not-scheduled">—</span>
            </td>

            <!-- Officer -->
            <td class="col-officer">
              <div v-if="call.status === 'new'" class="assign-btn-wrapper">
                <button class="assign-btn" @click.stop="openAssignModal(call)">
                  <Icon name="lucide:user-plus" :size="14" />
                  {{ t('calls.assign') }}
                </button>
              </div>
              <span v-else class="officer-name">{{ call.officerName || '—' }}</span>
            </td>

            <!-- Status -->
            <td class="col-status">
              <span :class="['status-badge', getStatusClass(call.status)]">
                {{ getStatusLabel(call.status) }}
              </span>
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
    />

    <!-- Assign Call Modal -->
    <AssignCallModal
      :show="showAssignModal"
      :call="callToAssign"
      @close="closeAssignModal"
      @assign="handleAssign"
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
.col-category { width: 140px; }
.col-service { width: 160px; }
.col-resident { width: 140px; }
.col-community { width: 160px; }
.col-address { min-width: 180px; }
.col-scheduled { width: 140px; }
.col-officer { width: 160px; }
.col-status { width: 100px; }

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
.no-officer {
  color: var(--color-text-muted);
}

/* Officer name */
.officer-name {
  color: var(--color-text-primary);
}

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

.status-new {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.status-accepted {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
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
