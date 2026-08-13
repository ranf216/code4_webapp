<script setup lang="ts">
import { callApi } from '~/api/call'
import type { Call as ApiCall, GetCallsRequest } from '~/api/types/call'
import CallsFilters from './CallsFilters.vue'
import CallDetailsModal from './CallDetailsModal.vue'

const { t } = useTranslation()

// Selected call for details modal
const selectedCall = ref<HistoryCall | null>(null)
const showDetailsModal = ref(false)

function openCallDetails(call: HistoryCall) {
  selectedCall.value = call
  showDetailsModal.value = true
}

function closeCallDetails() {
  showDetailsModal.value = false
  selectedCall.value = null
}

async function handleResolved() {
  await fetchHistoryCalls()
  closeCallDetails()
}

async function handleCanceled() {
  await fetchHistoryCalls()
  closeCallDetails()
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

// History Call interface
interface HistoryCall {
  id: string
  category: CallCategory
  serviceType: ServiceType
  residentName: string
  communityName: string
  address: string
  scheduledDateTime: string | null
  closedDateTime?: string
  officerName: string | null
  status: 'done' | 'canceled'
  // Optional fields for Call Details
  callDateTime?: string
  currentAddress?: string
  description?: string
  media?: string[]
  confirmationImages?: string[]
  audioUrl?: string
  videoUrl?: string
  officerComments?: string
  likeReaction?: boolean
  residentComments?: string
}

// Helper functions for history columns
function hasConfirmationImages(call: HistoryCall): boolean {
  return !!(call.confirmationImages && call.confirmationImages.length > 0)
}

function hasOfficerComments(call: HistoryCall): boolean {
  return !!(call.officerComments && call.officerComments.trim().length > 0)
}

function hasLikeReaction(call: HistoryCall): boolean {
  return !!call.likeReaction
}

function hasResidentComments(call: HistoryCall): boolean {
  return !!(call.residentComments && call.residentComments.trim().length > 0)
}

function getResidentCommentPreview(call: HistoryCall): string {
  if (!call.residentComments) return ''
  if (call.residentComments.length > 30) {
    return call.residentComments.substring(0, 30) + '...'
  }
  return call.residentComments
}

// Filter state
const activeFilters = ref<Record<string, string>>({})

function handleFilterChange(filters: Record<string, string>) {
  activeFilters.value = filters
  fetchHistoryCalls()
}

const historyCalls = ref<HistoryCall[]>([])
const loading = ref(false)
const error = ref('')

function getCategoryInfo(category: ApiCall['category']): CallCategory {
  const map: Record<ApiCall['category'], CallCategory> = {
    medical_emergency: { type: 'medical', label: 'Medical', icon: 'lucide:heart-pulse', color: '#ef4444' },
    security_emergency: { type: 'security', label: 'Security', icon: 'lucide:shield', color: '#f97316' },
    panic: { type: 'panic', label: 'Panic', icon: 'lucide:siren', color: '#ef4444' },
    concierge_service: { type: 'concierge', label: 'Concierge', icon: 'lucide:bell', color: '#3b82f6' },
    test: { type: 'test', label: 'Test', icon: 'lucide:activity', color: '#22c55e' },
  }
  return map[category]
}

function getClosedDateTime(apiCall: ApiCall): string | undefined {
  if (apiCall.resolved_on) return apiCall.resolved_on
  if (apiCall.canceled_on) return apiCall.canceled_on
  return undefined
}

function mapHistoryCall(apiCall: ApiCall): HistoryCall {
  const category = getCategoryInfo(apiCall.category)
  const serviceName = apiCall.service_type || category.label
  const serviceIcon = apiCall.category === 'concierge_service' ? 'lucide:bell-concierge' : category.icon
  const scheduledDateTime = apiCall.scheduled_date
    ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? ' ' + apiCall.scheduled_time_from : ''}`
    : null
  const closedDateTime = getClosedDateTime(apiCall)

  return {
    id: apiCall.call_id.toString(),
    category,
    serviceType: { name: serviceName, icon: serviceIcon },
    residentName: apiCall.resident_name || '',
    communityName: apiCall.community_name || '',
    address: apiCall.address || '',
    scheduledDateTime,
    closedDateTime,
    officerName: apiCall.officer_name,
    status: apiCall.status === 'resolved' ? 'done' : 'canceled',
    callDateTime: apiCall.created_on,
    currentAddress: apiCall.current_address || undefined,
    description: apiCall.description || undefined,
    media: apiCall.media,
    confirmationImages: apiCall.confirmation_media,
    audioUrl: apiCall.audio_url || undefined,
    videoUrl: apiCall.video_url || undefined,
    officerComments: apiCall.officer_comments || undefined,
    likeReaction: apiCall.reaction === 1,
    residentComments: apiCall.resident_comment || undefined,
  }
}

function buildGetHistoryRequest(filters: Record<string, string>): Omit<GetCallsRequest, '#request'> {
  const categoryMap: Record<string, ApiCall['category'] | undefined> = {
    'Medical Assistance': 'medical_emergency',
    'Security Patrol': 'security_emergency',
    'Package Delivery': 'concierge_service',
    'Communication Test': 'test',
  }

  const statusMap: Record<string, ApiCall['status'] | undefined> = {
    new: 'new',
    accepted: 'accepted',
    done: 'resolved',
    canceled: 'canceled',
  }

  const params: Omit<GetCallsRequest, '#request'> = {
    is_open: false,
    limit: 100,
  }

  if (filters.status) {
    const status = statusMap[filters.status]
    if (status) {
      params.status = status
    }
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

async function fetchHistoryCalls() {
  loading.value = true
  error.value = ''
  try {
    const res = await callApi.getCalls(buildGetHistoryRequest(activeFilters.value), { showLoading: false })
    historyCalls.value = res.calls.map(mapHistoryCall)
  } catch (err: any) {
    error.value = err.message || 'Failed to load call history'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHistoryCalls()
})

// Local filters for fields not supported by get_calls API
const filteredHistoryCalls = computed(() => {
  return historyCalls.value.filter((call) => {
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

// Status display functions
function getStatusClass(status: string): string {
  return status === 'done' ? 'status-done' : 'status-canceled'
}

function getStatusLabel(status: string): string {
  return status === 'done' ? t('calls.status.done') : t('calls.status.canceled')
}
</script>

<template>
  <div class="calls-history">
    <!-- Filters -->
    <CallsFilters @filter-change="handleFilterChange" />

    <div v-if="loading" class="empty-state">
      <Icon name="lucide:loader-2" :size="24" class="spinner" />
      <span>Loading history...</span>
    </div>
    <div v-else-if="error" class="empty-state">
      <Icon name="lucide:alert-circle" :size="24" />
      <span>{{ error }}</span>
    </div>
    <div v-else-if="historyCalls.length === 0" class="empty-state">
      <Icon name="lucide:phone-off" :size="24" />
      <span>No history found</span>
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
            <th class="col-closed">{{ t('calls.closed_datetime') }}</th>
            <th class="col-officer">{{ t('calls.officer') }}</th>
            <th class="col-confirmation">{{ t('calls.confirmation_short') }}</th>
            <th class="col-comments">{{ t('calls.officer_comments_short') }}</th>
            <th class="col-feedback">{{ t('calls.resident_feedback_short') }}</th>
            <th class="col-status">{{ t('calls.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="call in filteredHistoryCalls" :key="call.id" class="call-row" @click="openCallDetails(call)">
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
                <Icon :name="call.serviceType.icon" :size="16" class="text-secondary" />
                <span>{{ call.serviceType.name }}</span>
              </div>
            </td>

            <!-- Resident -->
            <td class="col-resident">
              {{ call.residentName }}
            </td>

            <!-- Community -->
            <td class="col-community">
              {{ call.communityName }}
            </td>

            <!-- Address -->
            <td class="col-address">
              <span class="address-text">{{ call.address }}</span>
            </td>

            <!-- Scheduled Date/Time -->
            <td class="col-scheduled">
              {{ call.scheduledDateTime || '—' }}
            </td>

            <!-- Closed Date/Time -->
            <td class="col-closed">
              {{ call.closedDateTime || '—' }}
            </td>

            <!-- Officer -->
            <td class="col-officer">
              {{ call.officerName || '—' }}
            </td>

            <!-- Confirmation Images -->
            <td class="col-confirmation">
              <Icon
                v-if="hasConfirmationImages(call)"
                name="lucide:image"
                :size="18"
                class="has-content-icon"
              />
              <span v-else class="no-content">—</span>
            </td>

            <!-- Officer Comments -->
            <td class="col-comments">
              <Icon
                v-if="hasOfficerComments(call)"
                name="lucide:message-square"
                :size="18"
                class="has-content-icon"
              />
              <span v-else class="no-content">—</span>
            </td>

            <!-- Resident Feedback -->
            <td class="col-feedback">
              <div v-if="hasLikeReaction(call) || hasResidentComments(call)" class="feedback-cell">
                <Icon
                  v-if="hasLikeReaction(call)"
                  name="lucide:thumbs-up"
                  :size="16"
                  class="like-icon-small"
                />
                <span v-if="hasResidentComments(call)" class="comment-preview">
                  {{ getResidentCommentPreview(call) }}
                </span>
              </div>
              <span v-else class="no-content">—</span>
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
  </div>
</template>

<style scoped>
.calls-history {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-wrapper::-webkit-scrollbar {
  display: none;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface);
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
.col-category { width: 140px; min-width: 140px; }
.col-service { width: 160px; min-width: 160px; }
.col-resident { width: 140px; min-width: 140px; }
.col-community { width: 160px; min-width: 160px; }
.col-address { min-width: 180px; width: 180px; }
.col-scheduled { width: 140px; min-width: 140px; }
.col-closed { width: 140px; min-width: 140px; }
.col-officer { width: 160px; min-width: 160px; }
.col-confirmation { width: 80px; min-width: 80px; text-align: center; }
.col-comments { width: 80px; min-width: 80px; text-align: center; }
.col-feedback { width: 140px; min-width: 140px; }
.col-status { width: 100px; min-width: 100px; }

/* Category cell */
.category-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.category-label {
  font-weight: 500;
}

/* Service cell */
.service-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-primary);
}

/* Address */
.address-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 200px;
}

/* Status badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: capitalize;
}

.status-done {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-canceled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* History-specific column styles */
.has-content-icon {
  color: var(--color-accent);
}

.no-content {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.feedback-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.like-icon-small {
  color: #22c55e;
  flex-shrink: 0;
}

.comment-preview {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-clamp: 1;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Empty state */
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

/* Responsive */
@media (max-width: 1200px) {
  .data-table {
    font-size: var(--font-size-xs);
  }

  .data-table th,
  .data-table td {
    padding: var(--space-2) var(--space-3);
  }
}
</style>
