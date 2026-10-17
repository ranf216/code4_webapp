<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { reportApi } from '~/api/report'
import { communityApi } from '~/api/community'
import { officerApi } from '~/api/officer'
import { utcToLocal, localToUtc } from '~/utils/dateTime'
import type { ReportListItem, ReportStatus, ReportCategory } from '~/api/types/report'
import type { Community } from '~/api/community'
import type { Officer } from '~/api/types/officer'

type TabKey = 'all' | 'pending-review' | 'changes-requested' | 'approved' | 'delivered'
type SortBy = 'submitted_on' | 'created_on' | 'status' | 'title' | 'report_id'

const { t } = useTranslation()
const router = useRouter()
const route = useRoute()

const reports = ref<ReportListItem[]>([])
const totalItems = ref(0)
const totalPages = ref(0)
const page = ref(0)
const loading = ref(false)
const error = ref('')

const activeTab = ref<TabKey>('pending-review')
const searchQuery = ref('')
const selectedCommunity = ref<string>('')
const selectedOfficer = ref<string>('')
const filterCategory = ref<ReportCategory | ''>('')
const filterReviewRequired = ref<string>('')
const filterFromDate = ref('')
const filterToDate = ref('')
const sortBy = ref<SortBy>('submitted_on')
const sortDir = ref<'asc' | 'desc'>('desc')

const communities = ref<Community[]>([])
const officers = ref<Officer[]>([])

const currentUserId = ref<string>('')

const tabs = computed(() => [
  { id: 'all' as TabKey, label: t('reports.queue_tab_all'), icon: 'lucide:layout-grid' },
  { id: 'pending-review' as TabKey, label: t('reports.queue_tab_pending_review'), icon: 'lucide:clock' },
  { id: 'changes-requested' as TabKey, label: t('reports.queue_tab_changes_requested'), icon: 'lucide:rotate-ccw' },
  { id: 'approved' as TabKey, label: t('reports.queue_tab_approved'), icon: 'lucide:check-circle' },
  { id: 'delivered' as TabKey, label: t('reports.queue_tab_delivered'), icon: 'lucide:send' },
])

const statusMapByTab: Record<TabKey, ReportStatus[] | undefined> = {
  all: undefined,
  'pending-review': ['submitted', 'under_review'],
  'changes-requested': ['changes_requested'],
  approved: ['approved'],
  delivered: ['delivered'],
}

const categoryOptions = computed(() => [
  { value: '', label: t('reports.filters.all_categories') },
  { value: 'incident', label: t('reports.category_incident') },
  { value: 'daily_activity', label: t('reports.category_daily') },
  { value: 'custom', label: t('reports.category_custom') },
])

const reviewRequiredOptions = computed(() => [
  { value: '', label: t('calls.filters.all') },
  { value: 'yes', label: t('common.yes') },
  { value: 'no', label: t('common.no') },
])

const currentPageDisplay = computed(() => page.value + 1)
const hasPrev = computed(() => page.value > 0)
const hasNext = computed(() => page.value + 1 < totalPages.value)

const hasActiveFilters = computed(() =>
  searchQuery.value ||
  selectedCommunity.value ||
  selectedOfficer.value ||
  filterCategory.value ||
  filterReviewRequired.value ||
  filterFromDate.value ||
  filterToDate.value
)

function buildRequestParams() {
  const reviewRequired =
    filterReviewRequired.value === '' ? undefined : filterReviewRequired.value === 'yes'

  return {
    statuses: statusMapByTab[activeTab.value],
    community_ids: selectedCommunity.value ? [Number(selectedCommunity.value)] : undefined,
    officer_user_ids: selectedOfficer.value ? [selectedOfficer.value] : undefined,
    category: (filterCategory.value || undefined) as ReportCategory | undefined,
    review_required: reviewRequired,
    search_text: searchQuery.value.trim() || undefined,
    from_date: filterFromDate.value ? localToUtc(filterFromDate.value + ' 00:00').format('YYYY-MM-DD') : undefined,
    to_date: filterToDate.value ? localToUtc(filterToDate.value + ' 23:59').format('YYYY-MM-DD') : undefined,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
    page: page.value,
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedCommunity.value = ''
  selectedOfficer.value = ''
  filterCategory.value = ''
  filterReviewRequired.value = ''
  filterFromDate.value = ''
  filterToDate.value = ''
}

async function fetchReports() {
  loading.value = true
  error.value = ''
  try {
    const response = await reportApi.getReportsList(buildRequestParams(), { showLoading: false })
    if (response.rc === 0) {
      reports.value = response.reports ?? []
      totalItems.value = response.num_of_items ?? 0
      totalPages.value = response.num_of_pages ?? 0
    }
  } catch (err) {
    console.error('Failed to load reports:', err)
    reports.value = []
    totalItems.value = 0
    totalPages.value = 0
    error.value = err instanceof Error ? err.message : 'Failed to load reports'
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

async function fetchOfficers() {
  try {
    const response = await officerApi.getOfficers({}, { showLoading: false })
    officers.value = response.officers || []
  } catch (err) {
    console.error('Failed to load officers:', err)
  }
}

function setTab(key: TabKey) {
  if (activeTab.value === key) return
  activeTab.value = key
  page.value = 0
  fetchReports()
}

function toggleSort(key: SortBy) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortDir.value = 'asc'
  }
}

function prevPage() {
  if (hasPrev.value) {
    page.value--
  }
}

function nextPage() {
  if (hasNext.value) {
    page.value++
  }
}

function goToPage(p: number) {
  page.value = p - 1
}

function openReport(report: ReportListItem) {
  router.push(`/incident-reports/${report.report_id}`)
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPageDisplay.value
  const pages: number[] = []
  const start = Math.max(1, Math.min(current - 2, total - 4))
  for (let i = start; i <= Math.min(total, start + 4); i++) pages.push(i)
  return pages
})

function formatDateTime(utcDateStr: string | null): string {
  if (!utcDateStr) return '—'
  return utcToLocal(utcDateStr).format('YYYY-MM-DD HH:mm')
}

function formatDate(utcDateStr: string | null): string {
  if (!utcDateStr) return '—'
  return utcToLocal(utcDateStr).format('YYYY-MM-DD')
}

function getLockDisplay(report: ReportListItem) {
  const lock = report.review_lock
  if (!lock || !lock.is_locked) {
    if (report.status === 'under_review' && report.reviewer_name) {
      return { icon: 'lucide:pause-circle', text: t('reports.lock_paused', { name: report.reviewer_name }) }
    }
    return null
  }
  if (lock.locked_by === currentUserId.value) {
    return { icon: 'lucide:user-check', text: t('reports.lock_reviewing_you') }
  }
  return { icon: 'lucide:lock', text: t('reports.lock_by', { name: lock.locked_by_name || report.reviewer_name || '' }) }
}

function getLockCountdown(report: ReportListItem): string {
  const lock = report.review_lock
  if (!lock?.expires_on) return ''
  const expires = utcToLocal(lock.expires_on)
  const now = utcToLocal(new Date().toISOString())
  const diff = expires.diff(now)
  if (diff <= 0) return '00:00'
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

let countdownTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

function startTimers() {
  stopTimers()
  countdownTimer = setInterval(() => {
    // force re-render of countdown cells
    reports.value = [...reports.value]
  }, 1000)
  refreshTimer = setInterval(() => {
    fetchReports()
  }, 60000)
}

function stopTimers() {
  if (countdownTimer) clearInterval(countdownTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  countdownTimer = null
  refreshTimer = null
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    page.value = 0
    fetchReports()
  }, 300)
})

watch(
  [selectedCommunity, selectedOfficer, filterCategory, filterReviewRequired, filterFromDate, filterToDate, sortBy, sortDir],
  () => {
    page.value = 0
    fetchReports()
  }
)

watch(page, fetchReports)
watch(
  () => route.path,
  (path) => {
    if (path === '/incident-reports') {
      fetchReports()
    }
  }
)

onMounted(() => {
  fetchCommunities()
  fetchOfficers()
  fetchReports()
  startTimers()

  const authUser = sessionStorage.getItem('auth_user')
  if (authUser) {
    try {
      const parsed = JSON.parse(authUser)
      currentUserId.value = parsed.user_id || ''
    } catch {
      currentUserId.value = ''
    }
  }
})

onUnmounted(() => {
  stopTimers()
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>

<template>
  <div class="reports-list">
    <!-- Tabs like Calls page -->
    <div class="reports-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="reports-tabs__btn"
        :class="{ 'reports-tabs__btn--active': activeTab === tab.id }"
        @click="setTab(tab.id)"
      >
        <Icon :name="tab.icon" :size="16" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Filters like CallsFilters -->
    <div class="reports-filters">
      <div class="filter-row">
        <div class="filter-field search-field">
          <label class="filter-label">{{ t('calls.filters.search') }}</label>
          <div class="search-input-wrapper">
            <Icon name="lucide:search" :size="16" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="t('reports.filters.search_placeholder')"
            />
          </div>
        </div>

        <div class="filter-field">
          <label class="filter-label">{{ t('reports.filters.community') }}</label>
          <select v-model="selectedCommunity" class="filter-select">
            <option value="">{{ t('reports.filters.all_communities') }}</option>
            <option v-for="c in communities" :key="c.community_id" :value="String(c.community_id)">{{ c.name }}</option>
          </select>
        </div>

        <div class="filter-field">
          <label class="filter-label">{{ t('reports.officer') }}</label>
          <select v-model="selectedOfficer" class="filter-select">
            <option value="">{{ t('reports.filters.all_officers') }}</option>
            <option v-for="o in officers" :key="o.user_id" :value="o.user_id">{{ `${o.first_name} ${o.last_name}`.trim() || o.user_id }}</option>
          </select>
        </div>

        <div v-if="hasActiveFilters" class="filter-field clear-field">
          <label class="filter-label">&nbsp;</label>
          <button class="clear-btn" @click="clearFilters">
            <Icon name="lucide:x" :size="14" />
            {{ t('calls.filters.clear') }}
          </button>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-field">
          <label class="filter-label">{{ t('reports.filters.category') }}</label>
          <select v-model="filterCategory" class="filter-select">
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="filter-field">
          <label class="filter-label">{{ t('reports.filters.review_required') }}</label>
          <select v-model="filterReviewRequired" class="filter-select">
            <option v-for="opt in reviewRequiredOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="filter-field date-range-field">
          <label class="filter-label">{{ t('reports.filters.date_range') }}</label>
          <div class="date-inputs">
            <input v-model="filterFromDate" type="date" class="filter-date" />
            <span class="range-separator">—</span>
            <input v-model="filterToDate" type="date" class="filter-date" />
          </div>
        </div>
      </div>
    </div>

    <!-- Table like CallsList -->
    <div class="table-wrapper">
      <div v-if="loading" class="empty-state">
        <Icon name="lucide:loader-2" :size="24" class="spinner" />
        <span>Loading reports...</span>
      </div>
      <div v-else-if="error" class="empty-state">
        <Icon name="lucide:alert-circle" :size="24" />
        <span>{{ error }}</span>
      </div>
      <div v-else-if="reports.length === 0" class="empty-state">
        <Icon name="lucide:file-x" :size="24" />
        <span>{{ activeTab === 'pending-review' ? t('reports.empty_pending_review') : t('reports.empty_filtered') }}</span>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th class="col-id sortable" :class="{ sorted: sortBy === 'report_id' }" @click="toggleSort('report_id')">
              <span class="sortable-content">
                {{ t('reports.col_report_id') }}
                <Icon v-if="sortBy === 'report_id'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-title">{{ t('reports.col_title') }}</th>
            <th class="col-community">{{ t('reports.community') }}</th>
            <th class="col-category">{{ t('reports.col_queue_category') }}</th>
            <th class="col-officer">{{ t('reports.officer') }}</th>
            <th class="col-status">{{ t('reports.status') }}</th>
            <th class="col-submitted sortable" :class="{ sorted: sortBy === 'submitted_on' }" @click="toggleSort('submitted_on')">
              <span class="sortable-content">
                {{ t('reports.col_submitted') }}
                <Icon v-if="sortBy === 'submitted_on'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="13" />
              </span>
            </th>
            <th class="col-review">{{ t('reports.col_review') }}</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="report in reports"
            :key="report.report_id"
            class="report-row"
            @click="openReport(report)"
          >
            <td class="col-id report-id">#{{ report.report_id }}</td>
            <td class="col-title report-title">{{ report.title }}</td>
            <td class="col-community community-name">{{ report.community_name }}</td>
            <td class="col-category">
              <Badge type="templateCategory" :value="report.category" />
            </td>
            <td class="col-officer officer-name">{{ report.officer_name }}</td>
            <td class="col-status">
              <Badge type="report" :value="report.status" />
            </td>
            <td class="col-submitted">{{ formatDateTime(report.submitted_on) }}</td>
            <td class="col-review">
              <div v-if="getLockDisplay(report)" class="lock-indicator">
                <Icon :name="getLockDisplay(report)!.icon" :size="14" />
                <span>{{ getLockDisplay(report)!.text }}</span>
                <span v-if="report.review_lock?.expires_on" class="lock-countdown">{{ getLockCountdown(report) }}</span>
              </div>
              <span v-else-if="report.review_required" class="text-muted">
                {{ t('reports.review_required') }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="col-actions">
              <NuxtLink :to="`/incident-reports/${report.report_id}`" class="action-btn action-btn--icon" :title="t('reports.open')" @click.stop>
                <Icon name="lucide:eye" :size="14" />
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalItems > 0" class="reports-list__pagination">
      <span class="pagination-info">
        {{ currentPageDisplay }} / {{ totalPages }} — {{ totalItems }} items
      </span>
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="!hasPrev" @click="prevPage">
          <Icon name="lucide:chevron-left" :size="16" />
        </button>
        <button
          v-for="p in pageNumbers"
          :key="p"
          class="pagination-btn"
          :class="{ 'pagination-btn--active': p === currentPageDisplay }"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>
        <button class="pagination-btn" :disabled="!hasNext" @click="nextPage">
          <Icon name="lucide:chevron-right" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Tabs like Calls page */
.reports-tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-1);
}

.reports-tabs__btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reports-tabs__btn:hover {
  color: var(--color-text-primary);
  background: var(--color-surface);
}

.reports-tabs__btn--active {
  color: var(--color-accent);
  background: rgba(229, 255, 68, 0.1);
}

.reports-tabs__btn--active:hover {
  background: rgba(229, 255, 68, 0.15);
}

/* Filters like CallsFilters */
.reports-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}

.filter-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-field {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.search-field { min-width: 200px; }

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  height: 35px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.filter-select,
.filter-date {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  height: 35px;
  outline: none;
}

.filter-select:focus,
.filter-date:focus {
  border-color: var(--color-accent);
}

.date-range-field { flex: 2; min-width: 280px; }

.date-inputs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-inputs .filter-date { flex: 1; }

.range-separator {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.clear-field { flex: 0 0 auto; }

.clear-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  height: 35px;
}

.clear-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

/* Table like CallsList */
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

.data-table tr:last-child td { border-bottom: none; }

.report-row {
  cursor: pointer;
  transition: background var(--transition-base);
}

.report-row:hover { background: var(--color-surface); }

.report-id {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.report-title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.community-name,
.officer-name {
  color: var(--color-text-secondary);
}

.col-id { width: 80px; white-space: nowrap; }
.col-title { min-width: 220px; }
.col-community { min-width: 140px; }
.col-category { width: 120px; }
.col-officer { min-width: 140px; }
.col-status { width: 130px; }
.col-submitted { width: 150px; white-space: nowrap; }
.col-review { min-width: 200px; }
.col-actions { width: 60px; text-align: center; }

.lock-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.lock-countdown {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.sortable { cursor: pointer; user-select: none; }
.sortable-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
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
  animation: reports-spin 1s linear infinite;
}

@keyframes reports-spin {
  to { transform: rotate(360deg); }
}

.reports-list__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.pagination-info {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--space-2);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-base);
  font-weight: 500;
}

.text-muted { color: var(--color-text-muted); }
.text-critical { color: var(--color-critical, #ef4444); }

@media (max-width: 768px) {
  .reports-tabs { flex-wrap: wrap; gap: var(--space-2); }
  .reports-tabs__btn {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
  }
  .reports-tabs__btn span { display: none; }

  .filter-field,
  .filter-field.date-range-field { min-width: 100%; }
  .date-inputs { flex-direction: column; align-items: stretch; }
  .range-separator { text-align: center; }
  .clear-field { align-self: flex-end; }
}
</style>
