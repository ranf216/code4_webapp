<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { postOrderApi } from '~/api/postOrder'
import { communityApi } from '~/api/community'
import type { Community } from '~/api/community'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import type { PostOrder, PostOrderStatus } from '~/api/types/postOrder'

type SortBy = 'community_name' | 'post_name' | 'status' | 'last_published_on'

const { t } = useTranslation()
const router = useRouter()
const toastStore = useToastStore()

const postOrders = ref<PostOrder[]>([])
const totalCount = ref(0)
const offset = ref(0)
const limit = ref(20)
const loading = ref(false)
const error = ref('')

const searchQuery = ref('')
const filterCommunity = ref<number | ''>('')
const filterStatus = ref<PostOrderStatus | ''>('')
const filterReviewDueBefore = ref('')

const sortBy = ref<SortBy>('community_name')
const sortDir = ref<'asc' | 'desc'>('asc')

const communities = ref<Community[]>([])

const statusOptions = computed(() => [
  { value: '', label: t('post_orders.filter_all_statuses') },
  { value: 'draft', label: t('post_orders.status_draft') },
  { value: 'published', label: t('post_orders.status_published') },
  { value: 'archived', label: t('post_orders.status_archived') },
])

const todayLocal = new Date()
const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit.value)))
const hasPrev = computed(() => offset.value > 0)
const hasNext = computed(() => offset.value + postOrders.value.length < totalCount.value)

async function fetchPostOrders() {
  loading.value = true
  error.value = ''
  try {
    const response = await postOrderApi.getPostOrdersList({
      community_id: filterCommunity.value === '' ? undefined : filterCommunity.value,
      status: filterStatus.value || undefined,
      search_text: searchQuery.value.trim() || undefined,
      review_due_before: filterReviewDueBefore.value || undefined,
      sort_by: sortBy.value,
      sort_dir: sortDir.value,
      offset: offset.value,
      limit: limit.value,
    }, { showLoading: false })
    if (response.rc === 0) {
      postOrders.value = response.post_orders ?? []
      totalCount.value = response.total_count ?? 0
    }
  } catch (err) {
    console.error('Failed to load post orders:', err)
    postOrders.value = []
    totalCount.value = 0
    error.value = err instanceof Error ? err.message : 'Failed to load post orders'
  } finally {
    loading.value = false
  }
}

async function fetchCommunities() {
  try {
    const response = await communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    communities.value = response.communities || []
  } catch (err) {
    console.error('Failed to load communities:', err)
  }
}

function toggleSort(key: SortBy) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortDir.value = 'asc'
  }
}

function setReviewOverdue() {
  filterReviewDueBefore.value = todayStr
}

function clearReviewDue() {
  filterReviewDueBefore.value = ''
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    offset.value = 0
    fetchPostOrders()
  }, 300)
})

watch([filterCommunity, filterStatus, filterReviewDueBefore, sortBy, sortDir], () => {
  offset.value = 0
  fetchPostOrders()
})
watch(offset, fetchPostOrders)

function prevPage() {
  if (hasPrev.value) offset.value = Math.max(0, offset.value - limit.value)
}

function nextPage() {
  if (hasNext.value) offset.value += limit.value
}

function goToPage(page: number) {
  offset.value = (page - 1) * limit.value
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []
  const start = Math.max(1, Math.min(current - 2, total - 4))
  for (let i = start; i <= Math.min(total, start + 4); i++) pages.push(i)
  return pages
})

function isOverdue(date: string | null): boolean {
  return !!date && date < todayStr
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return date.slice(0, 10)
}

// API timestamps are UTC — convert to local before display (AGENTS.md)
function formatDateTime(utcDateStr: string | null): string {
  if (!utcDateStr) return '—'
  return utcToLocal(utcDateStr).format('YYYY-MM-DD HH:mm')
}

function openPostOrder(po: PostOrder) {
  router.push(`/post-orders/${po.post_order_id}`)
}

const showDeleteModal = ref(false)
const orderToDelete = ref<PostOrder | null>(null)
const deleting = ref(false)

function canDeletePo(po: PostOrder): boolean {
  // Spec: draft status, no published history.
  // Only truly-new drafts (never published) can be deleted.
  return po.status === 'draft' && !po.last_published_on
}

function canArchivePo(po: PostOrder): boolean {
  // Published POs can be archived. Draft POs that have been published
  // before (i.e. edited after publish but not yet re-published) also
  // have published history so they must be archived, not deleted.
  return po.status === 'published' || (po.status === 'draft' && !!po.last_published_on)
}

function openDeleteModal(po: PostOrder, event: MouseEvent) {
  event.stopPropagation()
  orderToDelete.value = po
  showDeleteModal.value = true
}

async function handleDeleteConfirm() {
  if (!orderToDelete.value || deleting.value) return
  deleting.value = true
  try {
    await postOrderApi.deletePostOrder(orderToDelete.value.post_order_id)
    showDeleteModal.value = false
    orderToDelete.value = null
    toastStore.success(t('post_orders.delete_success'))
    await fetchPostOrders()
  } catch (err) {
    console.error('Failed to delete post order:', err)
    toastStore.error(err instanceof Error ? err.message : t('post_orders.delete_failed'))
  } finally {
    deleting.value = false
  }
}

const showArchiveModal = ref(false)
const orderToArchive = ref<PostOrder | null>(null)
const archiving = ref(false)

function openArchiveModal(po: PostOrder, event: MouseEvent) {
  event.stopPropagation()
  orderToArchive.value = po
  showArchiveModal.value = true
}

async function handleArchiveConfirm() {
  if (!orderToArchive.value || archiving.value) return
  archiving.value = true
  try {
    await postOrderApi.archivePostOrder(orderToArchive.value.post_order_id)
    showArchiveModal.value = false
    orderToArchive.value = null
    toastStore.success(t('post_orders.archive_success'))
    await fetchPostOrders()
  } catch (err) {
    console.error('Failed to archive post order:', err)
    toastStore.error(err instanceof Error ? err.message : t('post_orders.archive_failed'))
  } finally {
    archiving.value = false
  }
}

const route = useRoute()

onMounted(() => {
  fetchCommunities()
  fetchPostOrders()
})

// Reload when returning to the list (e.g. after create/edit/publish)
watch(() => route.path, (path) => {
  if (path === '/post-orders') {
    fetchCommunities()
    fetchPostOrders()
  }
})

onUnmounted(() => {
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>

<template>
  <div class="po-list">
    <!-- Header -->
    <div class="po-list__header">
      <div>
        <h2 class="po-list__title">{{ t('post_orders.list_title') }}</h2>
        <p class="po-list__subtitle">{{ t('post_orders.list_subtitle', { count: String(totalCount) }) }}</p>
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

        <!-- Community -->
        <select v-model="filterCommunity" class="filter-select">
          <option value="">{{ t('post_orders.filter_all_communities') }}</option>
          <option v-for="c in communities" :key="c.community_id" :value="c.community_id">{{ c.name }}</option>
        </select>

        <!-- Status -->
        <select v-model="filterStatus" class="filter-select">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <!-- Review Due Before -->
        <div class="review-due-filter">
          <input v-model="filterReviewDueBefore" type="date" class="filter-select review-due-input" />
          <button
            type="button"
            class="filter-select review-due-shortcut"
            :title="t('post_orders.filter_overdue')"
            @click="setReviewOverdue"
          >
            {{ t('post_orders.filter_overdue') }}
          </button>
          <button
            v-if="filterReviewDueBefore"
            type="button"
            class="filter-select review-due-shortcut"
            @click="clearReviewDue"
          >
            <Icon name="lucide:x" :size="14" />
          </button>
        </div>

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
            <th class="col-id">{{ t('post_orders.col_id') }}</th>
            <th class="col-community sortable" :class="{ sorted: sortBy === 'community_name' }" @click="toggleSort('community_name')">
              <span class="sortable-content">
                {{ t('post_orders.col_community') }}
                <Icon v-if="sortBy === 'community_name'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-post sortable" :class="{ sorted: sortBy === 'post_name' }" @click="toggleSort('post_name')">
              <span class="sortable-content">
                {{ t('post_orders.col_post_name') }}
                <Icon v-if="sortBy === 'post_name'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-status sortable" :class="{ sorted: sortBy === 'status' }" @click="toggleSort('status')">
              <span class="sortable-content">
                {{ t('post_orders.col_status') }}
                <Icon v-if="sortBy === 'status'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-version">{{ t('post_orders.col_version') }}</th>
            <th class="col-published sortable" :class="{ sorted: sortBy === 'last_published_on' }" @click="toggleSort('last_published_on')">
              <span class="sortable-content">
                {{ t('post_orders.col_last_published') }}
                <Icon v-if="sortBy === 'last_published_on'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-by">{{ t('post_orders.col_published_by') }}</th>
            <th class="col-review">{{ t('post_orders.col_review_due') }}</th>
            <th class="col-ack">{{ t('post_orders.col_acknowledged') }}</th>
            <th class="col-actions">{{ t('post_orders.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="empty-state">
              <div class="empty-state-inner">
                <Icon name="lucide:loader-2" :size="24" class="spin-icon" />
              </div>
            </td>
          </tr>
          <tr v-else-if="error">
            <td colspan="10" class="empty-state">
              <div class="empty-state-inner">
                <span>{{ error }}</span>
              </div>
            </td>
          </tr>
          <template v-else>
          <tr v-for="po in postOrders" :key="po.post_order_id" class="po-row" @click="openPostOrder(po)">
            <td class="col-id">
              <span class="id-text">PO-{{ po.post_order_id }}</span>
            </td>
            <td class="col-community">{{ po.community_name }}</td>
            <td class="col-post">
              <NuxtLink :to="`/post-orders/${po.post_order_id}`" class="post-link" @click.stop>{{ po.post_name }}</NuxtLink>
            </td>
            <td class="col-status">
              <Badge type="postOrderStatus" :value="po.status" />
            </td>
            <td class="col-version">v{{ po.version }}</td>
            <td class="col-published">{{ formatDateTime(po.last_published_on) }}</td>
            <td class="col-by">{{ po.last_published_by_name ?? '—' }}</td>
            <td class="col-review">
              <span :class="{ 'overdue-text': isOverdue(po.review_due_date) }">
                {{ formatDate(po.review_due_date) }}
                <span v-if="isOverdue(po.review_due_date)" class="overdue-tag">{{ t('post_orders.filter_overdue') }}</span>
              </span>
            </td>
            <td class="col-ack">
              <span class="text-muted">—</span>
            </td>
            <td class="col-actions">
              <div class="action-group">
                <NuxtLink :to="`/post-orders/${po.post_order_id}`" class="action-btn action-btn--icon" :title="t('common.view')" @click.stop>
                  <Icon name="lucide:eye" :size="14" />
                </NuxtLink>
                <NuxtLink
                  v-if="po.status !== 'archived'"
                  :to="`/post-orders/${po.post_order_id}`"
                  class="action-btn action-btn--icon"
                  :title="t('common.edit')"
                  @click.stop
                >
                  <Icon name="lucide:pencil" :size="14" />
                </NuxtLink>
                <button
                  v-if="canArchivePo(po)"
                  class="action-btn action-btn--icon action-btn--warning"
                  :title="t('post_orders.btn_archive')"
                  @click="openArchiveModal(po, $event)"
                >
                  <Icon name="lucide:archive" :size="14" />
                </button>
                <button
                  v-if="canDeletePo(po)"
                  class="action-btn action-btn--icon action-btn--danger"
                  :title="t('common.delete')"
                  @click="openDeleteModal(po, $event)"
                >
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="postOrders.length === 0">
            <td colspan="10" class="empty-state">
              {{ t('post_orders.no_results') }}
            </td>
          </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalCount > 0" class="po-list__pagination">
      <span class="pagination-info">
        {{ t('post_orders.showing', { count: String(postOrders.length), total: String(totalCount) }) }}
      </span>
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="!hasPrev" @click="prevPage">
          <Icon name="lucide:chevron-left" :size="16" />
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="pagination-btn"
          :class="{ 'pagination-btn--active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button class="pagination-btn" :disabled="!hasNext" @click="nextPage">
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

    <!-- Archive Modal -->
    <AppModal
      :show="showArchiveModal"
      :title="t('post_orders.archive_title')"
      :message="t('post_orders.archive_message')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('post_orders.btn_archive')"
      @close="showArchiveModal = false"
      @cancel="showArchiveModal = false"
      @ok="handleArchiveConfirm"
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

.po-list__actions > * {
  flex-shrink: 0;
  align-self: center;
}

/* Search */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
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
  margin: 0;
  padding: 0 var(--space-3);
  line-height: normal;
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
  height: 40px;
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

/* Review due filter */
.review-due-filter {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  height: 40px;
}

.review-due-input {
  height: 40px;
}

.review-due-shortcut {
  white-space: nowrap;
}

/* Clickable row */
.po-row {
  cursor: pointer;
}

.spin-icon {
  animation: po-spin 0.8s linear infinite;
}

@keyframes po-spin {
  to { transform: rotate(360deg); }
}

/* Add button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: 40px;
  margin: 0;
  padding: 0 var(--space-4);
  line-height: normal;
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
  font-size: var(--font-size-sm);
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
.col-actions   { width: 8%; text-align: left; }

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
  font-size: var(--font-size-xs);
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
  font-size: var(--font-size-xs);
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
}

.empty-state-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

/* Actions */
.action-group {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: nowrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  min-width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  align-self: center;
  appearance: none;
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

.action-btn--warning:hover {
  border-color: #f59e0b;
  color: #f59e0b;
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
