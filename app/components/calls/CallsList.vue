<script setup lang="ts">
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

// Assign call functions
function openAssignModal(call: Call) {
  callToAssign.value = call
  showAssignModal.value = true
}

function closeAssignModal() {
  showAssignModal.value = false
  callToAssign.value = null
}

function handleAssign(data: { officerId: string; officerName: string; scheduleDate: string; scheduleTime: string }) {
  if (callToAssign.value) {
    // Update the call with assigned officer and schedule
    const call = calls.value.find(c => c.id === callToAssign.value!.id)
    if (call) {
      call.officerName = data.officerName
      call.scheduledDateTime = `${data.scheduleDate} ${data.scheduleTime}`
      call.status = 'accepted'
    }
  }
  closeAssignModal()
}

// Types for Call Category
interface CallCategory {
  type: 'medical' | 'security' | 'concierge' | 'test'
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
}

// Mock data for calls
const calls = ref<Call[]>([
  {
    id: 'CALL-001',
    category: { type: 'medical', label: 'Medical Emergency', icon: 'lucide:heart-pulse', color: '#ef4444' },
    serviceType: { name: 'Medical Assistance', icon: 'lucide:ambulance' },
    residentName: 'John Smith',
    communityName: 'Sunset Valley',
    address: '123 Main St, Apt 4B',
    scheduledDateTime: '2024-06-16 14:30',
    officerName: 'Officer Mike Johnson',
    status: 'accepted',
  },
  {
    id: 'CALL-002',
    category: { type: 'security', label: 'Security Emergency', icon: 'lucide:shield-alert', color: '#f97316' },
    serviceType: { name: 'Security Patrol', icon: 'lucide:shield' },
    residentName: 'Sarah Williams',
    communityName: 'Greenwood Heights',
    address: '456 Oak Ave, Unit 12',
    scheduledDateTime: null,
    officerName: null,
    status: 'new',
  },
  {
    id: 'CALL-003',
    category: { type: 'concierge', label: 'Concierge Service', icon: 'lucide:bell-concierge', color: '#3b82f6' },
    serviceType: { name: 'Package Delivery', icon: 'lucide:package' },
    residentName: 'Robert Brown',
    communityName: 'Sunset Valley',
    address: '789 Pine Rd, House 7',
    scheduledDateTime: '2024-06-16 16:00',
    officerName: null,
    status: 'new',
  },
  {
    id: 'CALL-004',
    category: { type: 'test', label: 'Test Emergency', icon: 'lucide:test-tube', color: '#8b5cf6' },
    serviceType: { name: 'Communication Test', icon: 'lucide:radio' },
    residentName: 'Emily Davis',
    communityName: 'Riverside Commons',
    address: '321 Elm St, Apt 8C',
    scheduledDateTime: '2024-06-16 10:15',
    officerName: null,
    status: 'new',
  },
])

// Filtered calls (AND relation between all filters)
const filteredCalls = computed(() => {
  return calls.value.filter((call) => {
    // Community filter
    if (activeFilters.value.community && call.communityName !== activeFilters.value.community) {
      return false
    }

    // Service type filter
    if (activeFilters.value.serviceType && call.serviceType.name !== activeFilters.value.serviceType) {
      return false
    }

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

    // Status filter
    if (activeFilters.value.status && call.status !== activeFilters.value.status) {
      return false
    }

    // Free search across all columns
    if (activeFilters.value.search) {
      const search = activeFilters.value.search.toLowerCase()
      const searchable = [
        call.id,
        call.category.label,
        call.serviceType.name,
        call.residentName,
        call.communityName,
        call.address,
        call.officerName || '',
        call.status,
      ].join(' ').toLowerCase()

      if (!searchable.includes(search)) {
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

    <!-- Table -->
    <div class="table-wrapper">
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
