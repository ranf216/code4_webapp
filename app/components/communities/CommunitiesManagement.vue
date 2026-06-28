<script setup lang="ts">
import { communityApi } from '~/api/community'
import type { Community as ApiCommunity } from '~/api/community'
import type { Community } from '~/types/community'

const { t } = useTranslation()

// Extended Community type with names for search
interface CommunityWithNames extends Community {
  officerNames: string[]
  residentNames: string[]
}

const communities = ref<CommunityWithNames[]>([])
const loading = ref(false)
const isSearching = ref(false)
const fetchError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

function mapCommunity(c: ApiCommunity): CommunityWithNames {
  return {
    id: String(c.community_id),
    name: c.name,
    area: c.area,
    status: c.is_active ? 'active' : 'inactive',
    posts: 0,
    officers: 0,
    residents: null,
    calls24h: 0,
    featuredOfficer: false,
    officerNames: [],
    residentNames: [],
  }
}

async function fetchCommunities(searchText?: string, includeInactive?: boolean, isSearch = false) {
  if (isSearch) isSearching.value = true
  else loading.value = true
  fetchError.value = null
  try {
    const response = await communityApi.getCommunities({
      include_inactive: includeInactive ?? true,
      search_text: searchText?.trim() || undefined,
    }, { showLoading: !isSearch })
    if (response.rc === 0 && response.communities) {
      communities.value = response.communities.map(mapCommunity)
    } else {
      fetchError.value = response.message || 'Failed to load communities'
    }
  } catch (err) {
    console.error('Error fetching communities:', err)
    fetchError.value = 'Failed to load communities'
  } finally {
    if (isSearch) isSearching.value = false
    else loading.value = false
  }
}

onMounted(() => {
  // Check if we need to refresh (coming back from featured officer save)
  const route = useRoute()
  const router = useRouter()
  if (route.query.refresh === 'true') {
    // Clear the refresh parameter
    router.replace({ query: { ...route.query, refresh: undefined } })
  }
  fetchCommunities()
})

const statusFilter = ref('all')
const searchQuery = ref('')

// Debounced server-side search (400ms)
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch([searchQuery, statusFilter], ([query, status]: [string, string]) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    const includeInactive = status !== 'active'
    fetchCommunities(query, includeInactive, true)
  }, 400)
})
const currentPage = ref(1)
const totalPages = ref(6)
const totalEntries = computed(() => filteredCommunities.value.length)

// Delete modal state
const showDeleteModal = ref(false)
const communityToDelete = ref<Community | null>(null)

function openDeleteModal(community: Community) {
  communityToDelete.value = community
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  communityToDelete.value = null
}

// Deactivation prompt state (shown when delete fails with RC 502/503/504)
const showDeactivateModal = ref(false)
const deactivateConstraintMessage = ref('')
const isDeactivating = ref(false)

async function handleDeleteConfirm() {
  if (!communityToDelete.value) return
  try {
    const response = await communityApi.deleteCommunity(Number(communityToDelete.value.id))
    if (response.rc === 0) {
      closeDeleteModal()
      successMessage.value = t('communities.delete_success')
      await fetchCommunities(searchQuery.value, statusFilter.value !== 'active', true)
    } else if (response.rc === 500) {
      fetchError.value = t('communities.not_found_error')
      closeDeleteModal()
      await fetchCommunities(searchQuery.value, statusFilter.value !== 'active', true)
    } else if (response.rc === 502 || response.rc === 503 || response.rc === 504) {
      // Has active officers / residents / calls → offer deactivation instead
      const constraintMap: Record<number, string> = {
        502: t('communities.constraint_officers'),
        503: t('communities.constraint_residents'),
        504: t('communities.constraint_calls'),
      }
      deactivateConstraintMessage.value = constraintMap[response.rc] ?? (response.message || '')
      closeDeleteModal()
      showDeactivateModal.value = true
    } else {
      fetchError.value = response.message || 'Failed to delete community'
      closeDeleteModal()
    }
  } catch (err) {
    console.error('Error deleting community:', err)
    fetchError.value = 'Failed to delete community'
    closeDeleteModal()
  }
}

function closeDeactivateModal() {
  showDeactivateModal.value = false
  deactivateConstraintMessage.value = ''
  communityToDelete.value = null
}

async function handleDeactivateConfirm() {
  if (!communityToDelete.value) return
  isDeactivating.value = true
  try {
    const response = await communityApi.updateCommunity({
      community_id: Number(communityToDelete.value.id),
      is_active: false,
    })
    if (response.rc === 0) {
      closeDeactivateModal()
      successMessage.value = t('communities.deactivate_success')
      await fetchCommunities(searchQuery.value, statusFilter.value !== 'active', true)
    } else {
      fetchError.value = response.message || 'Failed to deactivate community'
      closeDeactivateModal()
    }
  } catch (err) {
    console.error('Error deactivating community:', err)
    fetchError.value = 'Failed to deactivate community'
    closeDeactivateModal()
  } finally {
    isDeactivating.value = false
  }
}

// Sorting state
const sortKey = ref<'name' | 'area' | 'status' | 'posts' | 'officers' | 'residents' | 'calls24h'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

function toggleSort(key: 'name' | 'area' | 'status' | 'posts' | 'officers' | 'residents' | 'calls24h') {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Filter by status only (search is handled server-side)
const filteredCommunities = computed(() => {
  let result = communities.value

  if (statusFilter.value !== 'all') {
    result = result.filter((c: CommunityWithNames) => c.status === statusFilter.value)
  }

  return result
})

const sortedCommunities = computed(() => {
  const result = [...filteredCommunities.value].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    switch (sortKey.value) {
      case 'name':
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        break
      case 'area':
        aVal = a.area.toLowerCase()
        bVal = b.area.toLowerCase()
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      case 'posts':
        aVal = a.posts
        bVal = b.posts
        break
      case 'officers':
        aVal = a.officers
        bVal = b.officers
        break
      case 'residents':
        aVal = a.residents ?? 0
        bVal = b.residents ?? 0
        break
      case 'calls24h':
        aVal = a.calls24h
        bVal = b.calls24h
        break
      default:
        return 0
    }

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Maintenance' },
]

</script>

<template>
  <div class="communities-management">
    <!-- Title Section -->
    <div class="communities-management__header">
      <div>
        <h2 class="communities-management__title">{{ t('communities.management_title') }}</h2>
        <p class="communities-management__subtitle">
          Total: {{ totalEntries }} Communities active in your jurisdiction.
        </p>
      </div>

      <div class="communities-management__actions">
        <div class="communities-management__search">
          <Icon name="lucide:search" :size="16" class="communities-management__search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search communities..."
            class="communities-management__search-input"
          />
          <Icon
            v-if="isSearching"
            name="lucide:loader-2"
            :size="16"
            class="communities-management__search-loading spin"
          />
        </div>

        <select v-model="statusFilter" class="communities-management__filter">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <NuxtLink to="/communities/new" class="communities-management__add-link">
          <AppButton :text="t('communities.add_community')" icon="lucide:plus" type="primary" />
        </NuxtLink>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-banner">
      <Icon name="lucide:check-circle" :size="16" />
      <span>{{ successMessage }}</span>
      <button class="success-banner__close" @click="successMessage = null">
        <Icon name="lucide:x" :size="14" />
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="fetchError" class="error-banner">
      <Icon name="lucide:alert-circle" :size="16" />
      <span>{{ fetchError }}</span>
      <button class="error-banner__close" @click="fetchError = null">
        <Icon name="lucide:x" :size="14" />
      </button>
    </div>

    <!-- Table -->
    <div class="communities-management__table-container">
      <div v-if="loading && !isSearching" class="communities-management__table-loading">
        <Icon name="lucide:loader-2" :size="24" class="spin" />
        <span>Loading communities...</span>
      </div>
      <table class="communities-management__table">
        <thead>
          <tr>
            <th class="col-name sortable" :class="{ 'sorted': sortKey === 'name', 'asc': sortKey === 'name' && sortOrder === 'asc', 'desc': sortKey === 'name' && sortOrder === 'desc' }" @click="toggleSort('name')">
              <span class="sortable-content">
                <span>Community Name</span>
                <Icon v-if="sortKey === 'name'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14"/>
              </span>
            </th>
            <th class="col-area sortable" :class="{ 'sorted': sortKey === 'area', 'asc': sortKey === 'area' && sortOrder === 'asc', 'desc': sortKey === 'area' && sortOrder === 'desc' }" @click="toggleSort('area')">
              <span class="sortable-content">
                <span>Area</span>
                <Icon v-if="sortKey === 'area'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14"/>
              </span>
            </th>
            <th class="col-status sortable" :class="{ 'sorted': sortKey === 'status', 'asc': sortKey === 'status' && sortOrder === 'asc', 'desc': sortKey === 'status' && sortOrder === 'desc' }" @click="toggleSort('status')">
              <span class="sortable-content">
                <span>Status</span>
                <Icon v-if="sortKey === 'status'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14"/>
              </span>
            </th>
            <th class="col-posts sortable" :class="{ 'sorted': sortKey === 'posts', 'asc': sortKey === 'posts' && sortOrder === 'asc', 'desc': sortKey === 'posts' && sortOrder === 'desc' }" @click="toggleSort('posts')">
              <span class="sortable-content">
                <span>Posts</span>
                <Icon v-if="sortKey === 'posts'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14"/>
              </span>
            </th>
            <th class="col-officers sortable" :class="{ 'sorted': sortKey === 'officers', 'asc': sortKey === 'officers' && sortOrder === 'asc', 'desc': sortKey === 'officers' && sortOrder === 'desc' }" @click="toggleSort('officers')">
              <span class="sortable-content">
                <span>Officers</span>
                <Icon v-if="sortKey === 'officers'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14"/>
              </span>
            </th>
            <th class="col-residents sortable" :class="{ 'sorted': sortKey === 'residents', 'asc': sortKey === 'residents' && sortOrder === 'asc', 'desc': sortKey === 'residents' && sortOrder === 'desc' }" @click="toggleSort('residents')">
              <span class="sortable-content">
                <span>Residents</span>
                <Icon v-if="sortKey === 'residents'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14"/>
              </span>
            </th>
            <th class="col-calls sortable" :class="{ 'sorted': sortKey === 'calls24h', 'asc': sortKey === 'calls24h' && sortOrder === 'asc', 'desc': sortKey === 'calls24h' && sortOrder === 'desc' }" @click="toggleSort('calls24h')">
              <span class="sortable-content">
                <span>Calls (24h)</span>
                <Icon v-if="sortKey === 'calls24h'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14"/>
              </span>
            </th>
            <th class="col-featured">Featured Officer</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="community in sortedCommunities" :key="community.id">
            <td class="col-name">
              <div class="community-name">
                <span class="community-name__text">{{ community.name }}</span>
                <span class="community-name__id">ID: {{ community.id }}</span>
              </div>
            </td>
            <td class="col-area">
              <span class="area-text">{{ community.area }}</span>
            </td>
            <td class="col-status">
              <Badge type="status" :value="community.status" />
            </td>
            <td class="col-posts">{{ community.posts }}</td>
            <td class="col-officers">
              <NuxtLink :to="`/communities/${community.id}/officers`" class="action-btn action-btn--show">
                Show ({{ community.officers }})
              </NuxtLink>
            </td>
            <td class="col-residents">
              <NuxtLink :to="`/communities/${community.id}/residents`" class="action-btn action-btn--show">
                Show ({{ community.residents ?? 0 }})
              </NuxtLink>
            </td>
            <td class="col-calls">
              <span :class="{ 'calls-high': community.calls24h >= 10 }">
                {{ community.calls24h }}
              </span>
            </td>
            <td class="col-featured">
              <NuxtLink :to="`/communities/${community.id}/featured-officer?from=list`" class="action-btn action-btn--show">
                Manage
              </NuxtLink>
            </td>
            <td class="col-actions">
              <div class="action-group">
                <NuxtLink :to="`/communities/edit/${community.id}`" class="action-btn action-btn--icon">
                  <Icon name="lucide:pencil" :size="14" />
                </NuxtLink>
                <button class="action-btn action-btn--icon" @click="openDeleteModal(community)">
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="communities-management__pagination">
      <span class="pagination-info">
        Showing 1 to {{ communities.length }} of {{ totalEntries }} entries
      </span>
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="currentPage === 1">
          <Icon name="lucide:chevron-left" :size="16" />
        </button>
        <button
          v-for="page in [1, 2, 3]"
          :key="page"
          class="pagination-btn"
          :class="{ 'pagination-btn--active': currentPage === page }"
        >
          {{ page }}
        </button>
        <span class="pagination-ellipsis">...</span>
        <button class="pagination-btn">
          <Icon name="lucide:chevron-right" :size="16" />
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <AppModal
      :show="showDeleteModal"
      :title="t('communities.delete_title')"
      :message="t('communities.delete_message', { name: communityToDelete?.name || '' })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="closeDeleteModal"
      @cancel="closeDeleteModal"
      @ok="handleDeleteConfirm"
    />

    <!-- Deactivation Constraint Modal (RC 502/503/504) -->
    <AppDialogModal
      :show="showDeactivateModal"
      :title="t('communities.cannot_delete_title')"
      max-width="480px"
      @close="closeDeactivateModal"
    >
      <div class="deactivate-modal-body">
        <Icon name="lucide:alert-triangle" :size="20" class="deactivate-modal-body__icon" />
        <div>
          <p class="deactivate-modal-body__constraint">{{ deactivateConstraintMessage }}</p>
          <p class="deactivate-modal-body__suggestion">{{ t('communities.deactivate_suggestion') }}</p>
        </div>
      </div>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="ghost" @click="closeDeactivateModal" />
        <AppButton
          :text="isDeactivating ? t('common.saving') : t('communities.deactivate_action')"
          type="danger"
          :disabled="isDeactivating"
          @click="handleDeactivateConfirm"
        />
      </template>
    </AppDialogModal>
  </div>
</template>

<style scoped>
.communities-management {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Status banners */
.success-banner,
.error-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.success-banner {
  background: color-mix(in srgb, var(--color-success, #22c55e) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 30%, transparent);
  color: var(--color-success, #22c55e);
}

.error-banner {
  background: color-mix(in srgb, var(--color-critical) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-critical) 30%, transparent);
  color: var(--color-critical);
}

.success-banner__close,
.error-banner__close {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-base);
}

.success-banner__close:hover,
.error-banner__close:hover {
  opacity: 1;
}

/* Header */
.communities-management__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.communities-management__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-1);
}

.communities-management__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.communities-management__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.communities-management__search {
  position: relative;
  display: flex;
  align-items: center;
}

.communities-management__search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.communities-management__search-loading {
  position: absolute;
  right: var(--space-3);
  color: var(--color-accent);
}

.communities-management__search-input {
  width: 240px;
  height: 40px;
  padding: 0 var(--space-3) 0 36px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}

.communities-management__search-input::placeholder {
  color: var(--color-text-muted);
}

.communities-management__search-input:focus {
  border-color: var(--color-accent);
}

.communities-management__filter {
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

.communities-management__filter:focus {
  border-color: var(--color-accent);
}

.communities-management__add-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-4);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #0a0c10;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.communities-management__add-btn:hover {
  opacity: 0.9;
}

/* Table Container */
.communities-management__table-container {
  position: relative;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.communities-management__table-loading {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: color-mix(in srgb, var(--color-bg-surface) 80%, transparent);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.communities-management__table.loading {
  opacity: 0.5;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Table */
.communities-management__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.communities-management__table thead {
  background: var(--color-bg-elevated);
}

.communities-management__table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.communities-management__table th.sortable {
  cursor: pointer;
  user-select: none;
}

.communities-management__table th.sortable .sortable-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.communities-management__table th.sortable .sortable-content :deep(svg) {
  flex-shrink: 0;
  display: block;
}

.communities-management__table th.sortable:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-overlay);
}

.communities-management__table th.sorted {
  color: var(--color-accent);
}

.communities-management__table td {
  padding: var(--space-4);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.communities-management__table tbody tr:hover {
  background: var(--color-bg-overlay);
}

.communities-management__table tbody tr:last-child td {
  border-bottom: none;
}

/* Column widths */
.col-name { width: 18%; }
.col-area { width: 16%; }
.col-status { width: 10%; }
.col-posts { width: 8%; text-align: center; }
.col-officers { width: 10%; text-align: center; }
.col-residents { width: 10%; text-align: center; }
.col-calls { width: 10%; text-align: center; }
.col-featured { width: 12%; text-align: center; }
.col-actions { width: 6%; text-align: center; }

/* Community name cell */
.community-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.community-name__text {
  font-weight: 500;
  color: var(--color-text-primary);
}

.community-name__id {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* Area cell */
.area-text {
  white-space: pre-line;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* Status badge */
/* Calls high indicator */
.calls-high {
  color: var(--color-critical);
  font-weight: 600;
}

/* Action buttons */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  flex-wrap: nowrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  height: 28px;
  padding: 0 12px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.action-btn :deep(svg) {
  display: block;
}

.action-btn:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.action-btn--show {
  background: var(--color-bg-elevated);
  border-color: var(--color-border);
  padding: 0 16px;
}

.action-btn--icon {
  width: 28px;
  padding: 0;
}

.text-muted {
  color: var(--color-text-muted);
}

/* Pagination */
.communities-management__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0c10;
}

.pagination-ellipsis {
  padding: 0 var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.deactivate-modal-body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
}

.deactivate-modal-body__icon {
  color: var(--color-warn, #f59e0b);
  flex-shrink: 0;
  margin-top: 2px;
}

.deactivate-modal-body__constraint {
  margin: 0 0 var(--space-2);
  color: var(--color-text-primary);
  line-height: 1.6;
}

.deactivate-modal-body__suggestion {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
