<script setup lang="ts">
import { callApi } from '~/api/call'
import { communityApi } from '~/api/community'
import type { Call as ApiCall, GetCallsRequest, CallCategory as ApiCallCategory, CallStatus } from '~/api/types/call'
import type { Community } from '~/api/community'
import CallDetailsModal from '../calls/CallDetailsModal.vue'
import { useNotificationSocket } from '~/composables/useNotificationSocket'

const { t } = useTranslation()
const { latestNotification } = useNotificationSocket()

interface CallCategory {
  type: 'medical' | 'security' | 'panic' | 'concierge' | 'test'
  label: string
  icon: string
  color: string
}

interface ServiceType {
  name: string
  icon: string
}

interface ActiveCall {
  id: string
  displayId: string
  callId: number
  category: CallCategory
  serviceType: ServiceType
  residentName: string
  communityName: string
  communityId: number
  address: string
  officerName: string | null
  status: CallStatus
  priority: string
  note: string
  time: string
  elapsed: string
  isEmergency: boolean
  // For CallDetailsModal
  callDateTime?: string
  currentAddress?: string
  description?: string
  media?: string[]
  audioUrl?: string
  videoUrl?: string
  confirmationImages?: string[]
  officerComments?: string
  residentComments?: string
}

interface Filters {
  status: '' | CallStatus
  category: '' | ApiCallCategory
  community: string
  search: string
}

const filters = reactive<Filters>({
  status: '',
  category: '',
  community: '',
  search: '',
})

const calls = ref<ActiveCall[]>([])
const loading = ref(false)
const error = ref('')
const communities = ref<Community[]>([])

const urgentCount = computed(() => calls.value.filter((c: ActiveCall) => c.isEmergency && c.status === 'new').length)

const selectedCall = ref<ActiveCall | null>(null)
const detailsCall = computed(() => selectedCall.value as any)
const showDetailsModal = ref(false)

const statusOptions: { value: CallStatus | ''; label: string }[] = [
  { value: '', label: t('calls.filters.all') },
  { value: 'new', label: t('calls.status.new') },
  { value: 'accepted', label: t('calls.status.accepted') },
  { value: 'resolved', label: t('calls.status.done') },
  { value: 'canceled', label: t('calls.status.canceled') },
]

const categoryOptions: { value: ApiCallCategory | ''; label: string; icon: string }[] = [
  { value: '', label: t('calls.filters.all'), icon: 'lucide:filter' },
  { value: 'medical_emergency', label: 'Medical Emergency', icon: 'lucide:heart-pulse' },
  { value: 'security_emergency', label: 'Security Emergency', icon: 'lucide:shield-alert' },
  { value: 'panic', label: 'Panic Button', icon: 'lucide:siren' },
  { value: 'concierge_service', label: 'Concierge Service', icon: 'lucide:bell-concierge' },
  { value: 'test', label: 'Test Call', icon: 'lucide:test-tube' },
]

const statusColor: Record<string, string> = {
  new: 'pill--critical',
  accepted: 'pill--info',
  resolved: 'pill--success',
  canceled: 'pill--ghost',
}

const priorityColor: Record<string, string> = {
  urgent: 'pill--critical',
  important: 'pill--warn',
  normal: 'pill--info',
  low: 'pill--ghost',
}

function getCategoryInfo(category: ApiCallCategory): CallCategory {
  const map: Record<ApiCallCategory, CallCategory> = {
    medical_emergency: { type: 'medical', label: 'Medical Emergency', icon: 'lucide:heart-pulse', color: '#ef4444' },
    security_emergency: { type: 'security', label: 'Security Emergency', icon: 'lucide:shield-alert', color: '#f97316' },
    panic: { type: 'panic', label: 'Panic Button', icon: 'lucide:siren', color: '#ef4444' },
    concierge_service: { type: 'concierge', label: 'Concierge Service', icon: 'lucide:bell-concierge', color: '#3b82f6' },
    test: { type: 'test', label: 'Test Call', icon: 'lucide:test-tube', color: '#8b5cf6' },
  }
  return map[category]
}

function formatTime(createdOn: string): string {
  const d = new Date(createdOn)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function timeSince(createdOn: string): string {
  const seconds = Math.floor((Date.now() - new Date(createdOn).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}

function mapCall(apiCall: ApiCall): ActiveCall {
  const category = getCategoryInfo(apiCall.category)
  const serviceName = apiCall.service_type || category.label
  return {
    id: apiCall.call_id.toString(),
    displayId: `CL-${apiCall.call_id}`,
    callId: apiCall.call_id,
    category,
    serviceType: { name: serviceName, icon: category.icon },
    residentName: apiCall.resident_name || '',
    communityName: apiCall.community_name || '',
    communityId: apiCall.community_id,
    address: apiCall.address || '',
    officerName: apiCall.officer_name,
    status: apiCall.status,
    priority: apiCall.priority,
    note: apiCall.description || '',
    time: formatTime(apiCall.created_on),
    elapsed: timeSince(apiCall.created_on),
    isEmergency: ['medical_emergency', 'security_emergency', 'panic'].includes(apiCall.category),
    callDateTime: apiCall.created_on,
    currentAddress: apiCall.current_address || undefined,
    description: apiCall.description || undefined,
    media: apiCall.media,
    audioUrl: apiCall.audio_url || undefined,
    videoUrl: apiCall.video_url || undefined,
    confirmationImages: apiCall.confirmation_media,
    officerComments: apiCall.officer_comments || undefined,
    residentComments: apiCall.resident_comment || undefined,
  }
}

function buildParams(filters: Filters): Omit<GetCallsRequest, '#request'> {
  const params: Omit<GetCallsRequest, '#request'> = {
    is_open: true,
    sort_by: 'created_on',
    sort_dir: 'desc',
    limit: 50,
  }
  if (filters.status) params.status = filters.status
  if (filters.category) params.category = filters.category
  if (filters.community) params.community_id = Number(filters.community)
  if (filters.search) params.search_text = filters.search
  return params
}

async function fetchActiveCalls() {
  loading.value = true
  error.value = ''
  try {
    const res = await callApi.getCalls(buildParams(filters), { showLoading: false })
    calls.value = res.calls.map(mapCall)
  } catch (err: any) {
    error.value = err.message || 'Failed to load active calls'
  } finally {
    loading.value = false
  }
}

async function fetchCommunities() {
  try {
    const res = await communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    communities.value = res.communities
  } catch (err: any) {
    console.error('Failed to load communities:', err)
  }
}

function openCallDetails(call: ActiveCall) {
  selectedCall.value = call
  showDetailsModal.value = true
}

function closeCallDetails() {
  showDetailsModal.value = false
  selectedCall.value = null
}

function handleResolved() {
  closeCallDetails()
  fetchActiveCalls()
}

function handleCanceled() {
  closeCallDetails()
  fetchActiveCalls()
}

function handleDeleted() {
  closeCallDetails()
  fetchActiveCalls()
}

onMounted(() => {
  fetchCommunities()
  fetchActiveCalls()
})

watch(
  filters,
  () => {
    fetchActiveCalls()
  },
  { deep: true }
)

watch(
  () => latestNotification.value,
  (n: any) => {
    if (n && ['new_service_call', 'new_emergency', 'panic_button', 'call_status_changed'].includes(n.type)) {
      fetchActiveCalls()
    }
  }
)
</script>

<template>
  <div class="active-calls card">
    <div class="active-calls__header">
      <span class="active-calls__title">ACTIVE CALLS</span>
      <div class="active-calls__actions">
        <span class="pill pill--critical">
          <Icon name="lucide:triangle-alert" :size="12" />
          {{ urgentCount }} urgent
        </span>
        <button class="btn btn--ghost active-calls__view-all" @click="$router.push('/calls')">View all</button>
      </div>
    </div>

    <div class="active-calls__filters">
      <select v-model="filters.status" class="filter-select">
        <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <select v-model="filters.category" class="filter-select">
        <option v-for="o in categoryOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <select v-model="filters.community" class="filter-select">
        <option value="">{{ t('calls.filters.all') }}</option>
        <option v-for="c in communities" :key="c.community_id" :value="String(c.community_id)">{{ c.name }}</option>
      </select>
      <div class="filter-search">
        <Icon name="lucide:search" :size="14" />
        <input v-model="filters.search" type="text" :placeholder="t('calls.filters.search')" class="filter-input" />
      </div>
    </div>

    <div v-if="loading" class="active-calls__state active-calls__state--loading">Loading active calls...</div>
    <div v-else-if="error" class="active-calls__state active-calls__state--error">{{ error }}</div>
    <div v-else class="active-calls__list">
      <div v-if="calls.length === 0" class="active-calls__state active-calls__state--empty">No active calls</div>
      <div
        v-for="call in calls"
        :key="call.id"
        class="call-row"
        :class="[`call-row--${call.status}`, { 'call-row--emergency': call.isEmergency && call.status === 'new' }]"
        @click="openCallDetails(call)"
      >
        <div class="call-row__indicator" :class="`call-row__indicator--${call.status}`" />
        <div class="call-row__body">
          <div class="call-row__top">
            <div class="call-row__left">
              <Icon :name="call.category.icon" :size="16" class="call-row__type-icon" :style="{ color: call.category.color }" />
              <span class="call-row__name">{{ call.residentName }}</span>
              <span class="call-row__id text-muted text-xs">{{ call.displayId }}</span>
              <span :class="['pill', statusColor[call.status] ?? 'pill--ghost']">{{ call.status }}</span>
              <span :class="['pill', priorityColor[call.priority] ?? 'pill--ghost']">{{ call.priority }}</span>
            </div>
            <div class="call-row__right">
              <span class="call-row__time">{{ call.time }}</span>
              <span class="call-row__elapsed">{{ call.elapsed }}</span>
            </div>
          </div>
          <div class="call-row__mid text-xs">
            <span class="text-secondary text-sm">{{ call.communityName }}</span>
            <span class="text-white text-sm">·</span>
            <span class="text-white text-sm">{{ call.address }}</span>
            <template v-if="call.officerName">
              <span class="text-muted text-sm">→</span>
              <span class="text-muted text-sm">{{ call.officerName }}</span>
            </template>
          </div>
          <div class="call-row__note text-sm text-white">{{ call.note }}</div>
        </div>
      </div>
    </div>

    <CallDetailsModal
      :show="showDetailsModal"
      :call="detailsCall"
      @close="closeCallDetails"
      @resolved="handleResolved"
      @canceled="handleCanceled"
      @deleted="handleDeleted"
    />
  </div>
</template>

<style scoped>
.active-calls {
  display: flex;
  flex-direction: column;
}
.active-calls__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.active-calls__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.active-calls__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.active-calls__view-all {
  font-size: var(--font-size-sm);
  padding: 4px var(--space-2);
  font-weight: 500;
  color: white
}

.active-calls__list {
  display: flex;
  flex-direction: column;
}

.call-row {
  display: flex;
  position: relative;
  margin: var(--space-4);
}
.call-row + .call-row {
  border-top: 1px solid var(--color-border-subtle);
}
.call-row__indicator {
  width: 3px;
  flex-shrink: 0;
  border-radius: 0;
}
.call-row__indicator--new      { background: var(--color-critical); }
.call-row__indicator--accepted { background: var(--color-info); }
.call-row__indicator--pending  { background: var(--color-warn); }

.call-row__body {
  flex: 1;
  padding: 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.call-row__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.call-row__left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.call-row__type-icon {
  color: var(--color-text-muted);
}
.call-row__name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}
.call-row__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  min-width: 64px;
}
.call-row__time {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}
.call-row__eta-right {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: #119ca6;
}
.call-row__elapsed {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
}
.call-row__mid {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
}
.call-row__note {
  font-style: normal;
}

.active-calls__filters {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-sm);
  height: 32px;
}

.filter-select {
  min-width: 120px;
}

.filter-search {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  min-width: 180px;
}

.filter-search .filter-input {
  flex: 1;
}

.active-calls__state {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.active-calls__state--error {
  color: #ef4444;
}

.call-row {
  cursor: pointer;
}

.call-row:hover {
  background: var(--color-bg-elevated);
}

@keyframes emergency-flash {
  0%, 100% { background: rgba(239, 68, 68, 0.08); }
  50% { background: rgba(239, 68, 68, 0.25); }
}

.call-row--emergency .call-row__body {
  animation: emergency-flash 1.2s infinite;
}

.call-row--emergency .call-row__name {
  color: #ef4444;
  font-weight: 600;
}
</style>
