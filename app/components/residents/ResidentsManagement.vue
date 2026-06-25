<script setup lang="ts">
import type { Resident } from '~/types/resident'

const props = defineProps<{
  communityId: string
  communityName: string
}>()

const { t } = useTranslation()

// Sample data
const residents = ref<Resident[]>([
  {
    id: 'RS-0001',
    fullName: 'Alice Brown',
    mobile: '+1 (555) 123-4567',
    email: 'alice.brown@email.com',
    address: '123 Main St, Apt 4B',
    registrationDate: '2024-01-15',
    active: true,
    communicationTest: false,
    vehicleNumbers: ['ABC-1234', 'XYZ-5678'],
  },
  {
    id: 'RS-0002',
    fullName: 'Bob Wilson',
    mobile: '+1 (555) 234-5678',
    email: 'bob.wilson@email.com',
    address: '456 Oak Ave, Unit 12',
    registrationDate: '2024-02-20',
    active: true,
    communicationTest: true,
    vehicleNumbers: ['DEF-9012'],
  },
  {
    id: 'RS-0003',
    fullName: 'Carol Davis',
    mobile: '+1 (555) 345-6789',
    email: 'carol.davis@email.com',
    address: '789 Pine Rd, Suite 3',
    registrationDate: '2024-03-10',
    active: false,
    communicationTest: false,
    vehicleNumbers: [],
  },
  {
    id: 'RS-0004',
    fullName: 'David Miller',
    mobile: '+1 (555) 456-7890',
    email: 'david.miller@email.com',
    address: '321 Elm St, House 5',
    registrationDate: '2024-04-05',
    active: true,
    communicationTest: false,
    vehicleNumbers: ['GHI-3456', 'JKL-7890'],
  },
])

// Filters
const statusFilter = ref('all')
const searchQuery = ref('')

// Sorting
const sortKey = ref<'fullName' | 'mobile' | 'email' | 'address' | 'registrationDate' | 'active' | 'communicationTest'>('fullName')
const sortOrder = ref<'asc' | 'desc'>('asc')

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Filtered and sorted residents
const filteredResidents = computed(() => {
  let result = residents.value

  // Filter by status
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    result = result.filter((r: Resident) => r.active === isActive)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter((r: Resident) =>
      r.fullName.toLowerCase().includes(query) ||
      r.mobile.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.address.toLowerCase().includes(query) ||
      r.vehicleNumbers.some((v: string) => v.toLowerCase().includes(query))
    )
  }

  return result
})

const sortedResidents = computed(() => {
  return [...filteredResidents.value].sort((a, b) => {
    let aVal: string | boolean
    let bVal: string | boolean

    switch (sortKey.value) {
      case 'fullName':
        aVal = a.fullName.toLowerCase()
        bVal = b.fullName.toLowerCase()
        break
      case 'mobile':
        aVal = a.mobile.toLowerCase()
        bVal = b.mobile.toLowerCase()
        break
      case 'email':
        aVal = a.email.toLowerCase()
        bVal = b.email.toLowerCase()
        break
      case 'address':
        aVal = a.address.toLowerCase()
        bVal = b.address.toLowerCase()
        break
      case 'registrationDate':
        aVal = a.registrationDate
        bVal = b.registrationDate
        break
      case 'active':
        aVal = a.active
        bVal = b.active
        break
      case 'communicationTest':
        aVal = a.communicationTest
        bVal = b.communicationTest
        break
      default:
        return 0
    }

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalEntries = computed(() => filteredResidents.value.length)

// Modals
const showDeleteModal = ref(false)
const selectedResident = ref<Resident | null>(null)

function openDeleteModal(resident: Resident) {
  selectedResident.value = resident
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedResident.value = null
}

function handleDeleteResident() {
  if (selectedResident.value) {
    const index = residents.value.findIndex((r: Resident) => r.id === selectedResident.value?.id)
    if (index > -1) {
      residents.value.splice(index, 1)
    }
  }
  closeDeleteModal()
}

function toggleActive(resident: Resident) {
  resident.active = !resident.active
}

function toggleCommunicationTest(resident: Resident) {
  resident.communicationTest = !resident.communicationTest
}
</script>

<template>
  <div class="residents-management">
    <!-- Header -->
    <div class="residents-management__header">
      <div class="residents-management__header-left">
        <h2 class="residents-management__title">{{ t('residents.management_title') }}</h2>
        <p class="residents-management__subtitle">
          {{ communityName }} • {{ t('residents.total', { count: String(totalEntries) }) }}
        </p>
      </div>
      <NuxtLink :to="`/communities/${communityId}/residents/new`">
        <AppButton :text="t('residents.add_resident')" icon="lucide:plus" type="primary" />
      </NuxtLink>
    </div>

    <!-- Toolbar -->
    <div class="residents-management__toolbar">
      <div class="residents-management__search">
        <Icon name="lucide:search" :size="16" class="residents-management__search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="residents-management__search-input"
          :placeholder="t('residents.search_placeholder')"
        />
      </div>
      <select v-model="statusFilter" class="residents-management__filter">
        <option value="all">{{ t('residents.filter_all') }}</option>
        <option value="active">{{ t('residents.filter_active') }}</option>
        <option value="inactive">{{ t('residents.filter_inactive') }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="residents-management__table-container">
      <table class="residents-management__table">
        <thead>
          <tr>
            <th class="sortable" :class="{ sorted: sortKey === 'fullName' }" @click="toggleSort('fullName')">
              <span class="sortable-content">
                <span>{{ t('residents.full_name') }}</span>
                <Icon v-if="sortKey === 'fullName'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="sortable" :class="{ sorted: sortKey === 'mobile' }" @click="toggleSort('mobile')">
              <span class="sortable-content">
                <span>{{ t('residents.mobile') }}</span>
                <Icon v-if="sortKey === 'mobile'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="sortable" :class="{ sorted: sortKey === 'email' }" @click="toggleSort('email')">
              <span class="sortable-content">
                <span>{{ t('residents.email') }}</span>
                <Icon v-if="sortKey === 'email'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="sortable" :class="{ sorted: sortKey === 'address' }" @click="toggleSort('address')">
              <span class="sortable-content">
                <span>{{ t('residents.address') }}</span>
                <Icon v-if="sortKey === 'address'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="sortable" :class="{ sorted: sortKey === 'registrationDate' }" @click="toggleSort('registrationDate')">
              <span class="sortable-content">
                <span>{{ t('residents.registration_date') }}</span>
                <Icon v-if="sortKey === 'registrationDate'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="sortable" :class="{ sorted: sortKey === 'active' }" @click="toggleSort('active')">
              <span class="sortable-content">
                <span>{{ t('residents.active') }}</span>
                <Icon v-if="sortKey === 'active'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="sortable" :class="{ sorted: sortKey === 'communicationTest' }" @click="toggleSort('communicationTest')">
              <span class="sortable-content">
                <span>{{ t('residents.communication_test') }}</span>
                <Icon v-if="sortKey === 'communicationTest'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th>{{ t('residents.vehicle_numbers') }}</th>
            <th>{{ t('residents.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resident in sortedResidents" :key="resident.id">
            <td>
              <div class="resident-name">
                <span class="resident-name__text">{{ resident.fullName }}</span>
                <span class="resident-name__id">ID: {{ resident.id }}</span>
              </div>
            </td>
            <td>{{ resident.mobile }}</td>
            <td>{{ resident.email }}</td>
            <td>{{ resident.address }}</td>
            <td>{{ resident.registrationDate }}</td>
            <td>
              <Badge type="status" :value="resident.active ? 'active' : 'inactive'" />
            </td>
            <td>
              <button
                class="comm-test-toggle"
                :class="{ enabled: resident.communicationTest }"
                @click="toggleCommunicationTest(resident)"
              >
                <Icon :name="resident.communicationTest ? 'lucide:check' : 'lucide:x'" :size="14" />
                <span>{{ resident.communicationTest ? t('common.yes') : t('common.no') }}</span>
              </button>
            </td>
            <td>
              <div v-if="resident.vehicleNumbers.length" class="vehicle-tags">
                <span v-for="(vehicle, index) in resident.vehicleNumbers" :key="index" class="vehicle-tag">
                  {{ vehicle }}
                </span>
              </div>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <div class="action-group">
                <NuxtLink :to="`/communities/${communityId}/residents/edit/${resident.id}`" class="action-btn action-btn--icon">
                  <Icon name="lucide:pencil" :size="14" />
                </NuxtLink>
                <button class="action-btn action-btn--icon" @click="openDeleteModal(resident)">
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <AppModal
      :show="showDeleteModal"
      :title="t('residents.delete_title')"
      :message="t('residents.delete_message', { name: selectedResident?.fullName || '' })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="closeDeleteModal"
      @cancel="closeDeleteModal"
      @ok="handleDeleteResident"
    />
  </div>
</template>

<style scoped>
.residents-management {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.residents-management__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.residents-management__header-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.residents-management__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.residents-management__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}


.residents-management__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.residents-management__search {
  position: relative;
  flex: 1;
  max-width: 320px;
}

.residents-management__search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.residents-management__search-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3) 0 calc(var(--space-3) + 24px);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}

.residents-management__search-input:focus {
  border-color: var(--color-accent);
}

.residents-management__filter {
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  outline: none;
}

.residents-management__filter:focus {
  border-color: var(--color-accent);
}

.residents-management__table-container {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.residents-management__table {
  width: 100%;
  border-collapse: collapse;
}

.residents-management__table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.residents-management__table th.sortable {
  cursor: pointer;
  user-select: none;
}

.residents-management__table th.sortable .sortable-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.residents-management__table th.sortable .sortable-content :deep(svg) {
  flex-shrink: 0;
  display: block;
}

.residents-management__table th.sortable:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-overlay);
}

.residents-management__table th.sorted {
  color: var(--color-accent);
}

.residents-management__table td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.residents-management__table tbody tr:hover {
  background: var(--color-bg-overlay);
}

.resident-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.resident-name__text {
  font-weight: 600;
  color: var(--color-text-primary);
}

.resident-name__id {
  font-size: 11px;
  color: var(--color-text-muted);
}

.status-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.status-toggle.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--color-ok);
}

.status-toggle__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-critical);
}

.status-toggle.active .status-toggle__dot {
  background: var(--color-ok);
}

.status-toggle__text {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.comm-test-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 11px;
  color: var(--color-text-muted);
}

.comm-test-toggle.enabled {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--color-ok);
  color: var(--color-ok);
}

.vehicle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.vehicle-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 11px;
  color: var(--color-text-secondary);
}

.action-group {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.text-muted {
  color: var(--color-text-muted);
}

/* Modal Form Styles */
.form-field {
  margin-bottom: var(--space-4);
}

.form-field label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.form-field input[type="text"],
.form-field input[type="email"] {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}

.form-field input:focus {
  border-color: var(--color-accent);
}

.form-field--readonly {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.form-field--readonly label {
  margin: 0;
}

.form-field--readonly span {
  color: var(--color-text-primary);
  font-weight: 500;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}

.vehicle-input {
  display: flex;
  gap: var(--space-2);
}

.vehicle-input input {
  flex: 1;
}

.vehicle-input button {
  width: 44px;
  height: 44px;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #0a0c10;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicle-input button:hover {
  opacity: 0.9;
}

.vehicle-tag button {
  display: inline-flex;
  align-items: center;
  margin-left: var(--space-1);
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.vehicle-tag button:hover {
  color: var(--color-critical);
}
</style>
