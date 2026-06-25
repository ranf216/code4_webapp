<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'

interface PostOrder {
  id: string
  community: string
  site: string
  post_name: string
  status: 'draft' | 'published' | 'archived'
  current_version: string
  last_published_date: string | null
  last_published_by: string | null
  review_due_date: string | null
  acknowledged_pct: number | null
}

const { t } = useTranslation()

const postOrders = ref<PostOrder[]>([
  {
    id: 'PO-001',
    community: 'Sunset Gardens',
    site: 'Gate A',
    post_name: 'Main Entrance Post',
    status: 'published',
    current_version: '2.1',
    last_published_date: '2026-06-10',
    last_published_by: 'Alice Manager',
    review_due_date: '2026-09-10',
    acknowledged_pct: 87,
  },
  {
    id: 'PO-002',
    community: 'Sunset Gardens',
    site: 'Perimeter',
    post_name: 'North Perimeter Patrol',
    status: 'draft',
    current_version: '1.0',
    last_published_date: null,
    last_published_by: null,
    review_due_date: null,
    acknowledged_pct: null,
  },
  {
    id: 'PO-003',
    community: 'Downtown Plaza',
    site: 'Parking',
    post_name: 'Parking Level 1 Patrol',
    status: 'published',
    current_version: '1.3',
    last_published_date: '2026-05-20',
    last_published_by: 'Bob Supervisor',
    review_due_date: '2026-06-20',
    acknowledged_pct: 100,
  },
  {
    id: 'PO-004',
    community: 'Oakwood Residences',
    site: 'Lobby',
    post_name: 'Front Desk Procedure',
    status: 'archived',
    current_version: '3.0',
    last_published_date: '2026-01-15',
    last_published_by: 'Alice Manager',
    review_due_date: null,
    acknowledged_pct: 72,
  },
  {
    id: 'PO-005',
    community: 'Marina Towers',
    site: 'Main Entrance',
    post_name: 'Marina Entry Control',
    status: 'published',
    current_version: '1.0',
    last_published_date: '2026-06-01',
    last_published_by: 'Carol Admin',
    review_due_date: '2026-07-01',
    acknowledged_pct: 60,
  },
  {
    id: 'PO-006',
    community: 'Oakwood Residences',
    site: 'Perimeter',
    post_name: 'Perimeter Night Patrol',
    status: 'draft',
    current_version: '1.0',
    last_published_date: null,
    last_published_by: null,
    review_due_date: '2026-07-15',
    acknowledged_pct: null,
  },
])

const searchQuery = ref('')
const filterCommunity = ref<string[]>([])
const filterStatus = ref('')
const filterReviewDue = ref('')

const sortKey = ref<keyof PostOrder>('community')
const sortOrder = ref<'asc' | 'desc'>('asc')

const communities = ['Sunset Gardens', 'Oakwood Residences', 'Marina Towers', 'Downtown Plaza']
const statusOptions = [
  { value: '', label: t('post_orders.filter_all_statuses') },
  { value: 'draft', label: t('post_orders.status_draft') },
  { value: 'published', label: t('post_orders.status_published') },
  { value: 'archived', label: t('post_orders.status_archived') },
]
const reviewDueOptions = [
  { value: '', label: t('post_orders.filter_any_due') },
  { value: 'overdue', label: t('post_orders.filter_overdue') },
  { value: 'this_week', label: t('post_orders.filter_this_week') },
  { value: 'this_month', label: t('post_orders.filter_this_month') },
]

function toggleSortKey(key: keyof PostOrder) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function toggleCommunityFilter(community: string) {
  const idx = filterCommunity.value.indexOf(community)
  if (idx > -1) {
    filterCommunity.value.splice(idx, 1)
  } else {
    filterCommunity.value.push(community)
  }
}

const today = new Date().toISOString().slice(0, 10)

const filteredPostOrders = computed((): PostOrder[] => {
  let result = postOrders.value

  if (filterCommunity.value.length > 0) {
    result = result.filter((po) => filterCommunity.value.includes(po.community))
  }

  if (filterStatus.value) {
    result = result.filter((po) => po.status === filterStatus.value)
  }

  if (filterReviewDue.value === 'overdue') {
    result = result.filter((po) => po.review_due_date && po.review_due_date < today)
  } else if (filterReviewDue.value === 'this_week') {
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() + 7)
    result = result.filter((po) => po.review_due_date && po.review_due_date <= weekEnd.toISOString().slice(0, 10))
  } else if (filterReviewDue.value === 'this_month') {
    const monthEnd = new Date()
    monthEnd.setDate(monthEnd.getDate() + 30)
    result = result.filter((po) => po.review_due_date && po.review_due_date <= monthEnd.toISOString().slice(0, 10))
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (po) =>
        po.id.toLowerCase().includes(q) ||
        po.post_name.toLowerCase().includes(q) ||
        po.community.toLowerCase().includes(q),
    )
  }

  return [...result].sort((a, b) => {
    const aVal = (a[sortKey.value] ?? '') as string
    const bVal = (b[sortKey.value] ?? '') as string
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

function isOverdue(date: string | null): boolean {
  return !!date && date < today
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const showCommunityDropdown = ref(false)

const showDeleteModal = ref(false)
const orderToDelete = ref<PostOrder | null>(null)

function openDeleteModal(po: PostOrder) {
  orderToDelete.value = po
  showDeleteModal.value = true
}

function handleDeleteConfirm() {
  if (orderToDelete.value) {
    const idx = postOrders.value.findIndex((po) => po.id === orderToDelete.value?.id)
    if (idx > -1) postOrders.value.splice(idx, 1)
  }
  showDeleteModal.value = false
  orderToDelete.value = null
}
</script>

<template>
  <div class="po-list">
    <!-- Header -->
    <div class="po-list__header">
      <div>
        <h2 class="po-list__title">{{ t('post_orders.list_title') }}</h2>
        <p class="po-list__subtitle">{{ t('post_orders.list_subtitle', { count: String(filteredPostOrders.length) }) }}</p>
      </div>
      <div class="po-list__actions">
        <!-- Search -->
        <div class="search-box">
          <Icon name="lucide:search" :size="16" class="search-box__icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('post_orders.search_placeholder')"
            class="search-box__input"
          />
        </div>

        <!-- Community multi-select -->
        <div class="dropdown-filter">
          <button class="filter-select" @click="showCommunityDropdown = !showCommunityDropdown">
            <span>
              {{ filterCommunity.length === 0 ? t('post_orders.filter_all_communities') : t('post_orders.filter_communities_selected', { count: String(filterCommunity.length) }) }}
            </span>
            <Icon name="lucide:chevron-down" :size="14" />
          </button>
          <div v-if="showCommunityDropdown" class="dropdown-menu" @blur="showCommunityDropdown = false">
            <label v-for="c in communities" :key="c" class="dropdown-item">
              <input type="checkbox" :checked="filterCommunity.includes(c)" @change="toggleCommunityFilter(c)" />
              <span>{{ c }}</span>
            </label>
          </div>
        </div>

        <!-- Status -->
        <select v-model="filterStatus" class="filter-select">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <!-- Review Due -->
        <select v-model="filterReviewDue" class="filter-select">
          <option v-for="opt in reviewDueOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <NuxtLink to="/post-orders/new" class="btn-primary">
          <Icon name="lucide:plus" :size="16" />
          {{ t('post_orders.create_new') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Table -->
    <div class="po-list__table-container">
      <table class="po-list__table">
        <thead>
          <tr>
            <th class="col-id sortable" :class="{ sorted: sortKey === 'id' }" @click="toggleSortKey('id')">
              <span class="sortable-content">
                {{ t('post_orders.col_id') }}
                <Icon v-if="sortKey === 'id'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-community sortable" :class="{ sorted: sortKey === 'community' }" @click="toggleSortKey('community')">
              <span class="sortable-content">
                {{ t('post_orders.col_community') }}
                <Icon v-if="sortKey === 'community'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-post sortable" :class="{ sorted: sortKey === 'post_name' }" @click="toggleSortKey('post_name')">
              <span class="sortable-content">
                {{ t('post_orders.col_post_name') }}
                <Icon v-if="sortKey === 'post_name'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-status sortable" :class="{ sorted: sortKey === 'status' }" @click="toggleSortKey('status')">
              <span class="sortable-content">
                {{ t('post_orders.col_status') }}
                <Icon v-if="sortKey === 'status'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-version sortable" :class="{ sorted: sortKey === 'current_version' }" @click="toggleSortKey('current_version')">
              <span class="sortable-content">
                {{ t('post_orders.col_version') }}
                <Icon v-if="sortKey === 'current_version'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-published">{{ t('post_orders.col_last_published') }}</th>
            <th class="col-by">{{ t('post_orders.col_published_by') }}</th>
            <th class="col-review sortable" :class="{ sorted: sortKey === 'review_due_date' }" @click="toggleSortKey('review_due_date')">
              <span class="sortable-content">
                {{ t('post_orders.col_review_due') }}
                <Icon v-if="sortKey === 'review_due_date'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-ack">{{ t('post_orders.col_acknowledged') }}</th>
            <th class="col-actions">{{ t('post_orders.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="po in filteredPostOrders" :key="po.id">
            <td class="col-id">
              <span class="id-text">{{ po.id }}</span>
            </td>
            <td class="col-community">{{ po.community }}</td>
            <td class="col-post">
              <NuxtLink :to="`/post-orders/${po.id}`" class="post-link">{{ po.post_name }}</NuxtLink>
            </td>
            <td class="col-status">
              <Badge type="postOrderStatus" :value="po.status" />
            </td>
            <td class="col-version">v{{ po.current_version }}</td>
            <td class="col-published">{{ formatDate(po.last_published_date) }}</td>
            <td class="col-by">{{ po.last_published_by ?? '—' }}</td>
            <td class="col-review">
              <span :class="{ 'overdue-text': isOverdue(po.review_due_date) }">
                {{ formatDate(po.review_due_date) }}
                <span v-if="isOverdue(po.review_due_date)" class="overdue-tag">Overdue</span>
              </span>
            </td>
            <td class="col-ack">
              <span v-if="po.acknowledged_pct !== null" class="ack-cell">
                <span class="ack-bar">
                  <span class="ack-bar__fill" :style="{ width: `${po.acknowledged_pct}%` }" />
                </span>
                <span class="ack-pct">{{ po.acknowledged_pct }}%</span>
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="col-actions">
              <div class="action-group">
                <NuxtLink :to="`/post-orders/${po.id}`" class="action-btn action-btn--icon" :title="t('common.view')">
                  <Icon name="lucide:eye" :size="14" />
                </NuxtLink>
                <NuxtLink
                  v-if="po.status !== 'archived'"
                  :to="`/post-orders/${po.id}`"
                  class="action-btn action-btn--icon"
                  :title="t('common.edit')"
                >
                  <Icon name="lucide:pencil" :size="14" />
                </NuxtLink>
                <button
                  v-if="po.status === 'draft'"
                  class="action-btn action-btn--icon action-btn--danger"
                  :title="t('common.delete')"
                  @click="openDeleteModal(po)"
                >
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredPostOrders.length === 0">
            <td colspan="10" class="empty-state">
              <Icon name="lucide:file-x" :size="32" />
              <span>{{ t('post_orders.no_results') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="po-list__pagination">
      <span class="pagination-info">
        {{ t('post_orders.showing', { count: String(filteredPostOrders.length), total: String(postOrders.length) }) }}
      </span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>
          <Icon name="lucide:chevron-left" :size="16" />
        </button>
        <button class="pagination-btn pagination-btn--active">1</button>
        <button class="pagination-btn" disabled>
          <Icon name="lucide:chevron-right" :size="16" />
        </button>
      </div>
    </div>

    <!-- Delete Modal -->
    <AppModal
      :show="showDeleteModal"
      :title="t('post_orders.delete_title')"
      :message="t('post_orders.delete_message', { name: orderToDelete?.post_name ?? '' })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @ok="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.po-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Header */
.po-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.po-list__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-1);
}

.po-list__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.po-list__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

/* Search */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box__icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-box__input {
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

.search-box__input::placeholder { color: var(--color-text-muted); }
.search-box__input:focus { border-color: var(--color-accent); }

/* Filters */
.filter-select {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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

.filter-select:focus { border-color: var(--color-accent); }

/* Community dropdown */
.dropdown-filter {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  min-width: 200px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.dropdown-item:hover { background: var(--color-bg-overlay); }
.dropdown-item input { accent-color: var(--color-accent); }

/* Add button */
.btn-primary {
  display: inline-flex;
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
  text-decoration: none;
  transition: opacity var(--transition-base);
}

.btn-primary:hover { opacity: 0.9; }

/* Table */
.po-list__table-container {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.po-list__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.po-list__table thead { background: var(--color-bg-elevated); }

.po-list__table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.po-list__table th.sortable { cursor: pointer; user-select: none; }
.po-list__table th.sortable:hover { color: var(--color-text-primary); background: var(--color-bg-overlay); }
.po-list__table th.sorted { color: var(--color-accent); }

.sortable-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.po-list__table td {
  padding: var(--space-4);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.po-list__table tbody tr:hover { background: var(--color-bg-overlay); }
.po-list__table tbody tr:last-child td { border-bottom: none; }

/* Column widths */
.col-id        { width: 7%; }
.col-community { width: 15%; }
.col-post      { width: 18%; }
.col-status    { width: 9%; }
.col-version   { width: 7%; text-align: center; }
.col-published { width: 11%; }
.col-by        { width: 12%; }
.col-review    { width: 10%; }
.col-ack       { width: 9%; }
.col-actions   { width: 8%; text-align: center; }

/* Cells */
.id-text {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.post-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
}

.post-link:hover { text-decoration: underline; }

/* Review due */
.overdue-text { color: var(--color-critical); font-weight: 500; }

.overdue-tag {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 6px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
}

/* Acknowledged bar */
.ack-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ack-bar {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  min-width: 40px;
}

.ack-bar__fill {
  display: block;
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
}

.ack-pct {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.text-muted { color: var(--color-text-muted); }

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

/* Actions */
.action-group {
  display: flex;
  gap: var(--space-1);
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.action-btn:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.action-btn--danger:hover {
  border-color: var(--color-critical);
  color: var(--color-critical);
}

/* Pagination */
.po-list__pagination {
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

.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pagination-btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0c10;
}
</style>
