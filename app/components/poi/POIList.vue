<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import AppButton from '~/components/AppButton.vue'
import AppDialogModal from '~/components/AppDialogModal.vue'
import { poiApi } from '~/api/poi'
import { communityApi } from '~/api/community'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import type { Community } from '~/api/community'
import type {
  PoiListRecord,
  PoiMetadataResponse,
  PoiRecordType,
  PoiStatus,
  PoiThreatLevel,
} from '~/api/types/poi'
import moment from 'moment'

type SortBy = 'created_on' | 'threat_level' | 'name' | 'last_update'
type ActiveTab = 'all' | PoiRecordType

const { t } = useTranslation()
const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const records = ref<PoiListRecord[]>([])
const totalCount = ref(0)
const loading = ref(false)
const error = ref('')

const searchQuery = ref('')
const filterStatus = ref<PoiStatus | ''>('')
const filterCommunity = ref<string | ''>('')
const filterThreat = ref<PoiThreatLevel | ''>('')
const expiringSoon = ref(false)

const sortBy = ref<SortBy>('created_on')
const sortDir = ref<'asc' | 'desc'>('desc')
const offset = ref(0)
const limit = ref(20)

const metadata = ref<Partial<PoiMetadataResponse>>({})
const communities = ref<Community[]>([])
const tabCounts = ref<Record<ActiveTab, number>>({ all: 0, poi: 0, trespass: 0, metro_red_card: 0 })

interface TabConfig {
  id: ActiveTab
  label: string
  icon: string
}

const tabs: TabConfig[] = [
  { id: 'all', label: t('poi.tab_all'), icon: 'lucide:layers' },
  { id: 'poi', label: t('poi.tab_poi'), icon: 'lucide:user' },
  { id: 'trespass', label: t('poi.tab_trespass'), icon: 'lucide:ban' },
  { id: 'metro_red_card', label: t('poi.tab_metro'), icon: 'lucide:train-front' },
]

const validTabIds = tabs.map(tab => tab.id)

const activeTab = ref<ActiveTab>(
  validTabIds.includes(route.query.tab as ActiveTab) ? (route.query.tab as ActiveTab) : 'all'
)

watch(() => route.query.tab, (tab: unknown) => {
  if (validTabIds.includes(tab as ActiveTab)) {
    activeTab.value = tab as ActiveTab
  } else {
    activeTab.value = 'all'
  }
})

interface MetadataItem {
  id?: string | number
  key?: string | number
  name?: string | { en?: string }
  label?: string
}

function normalizeMetadataItems(input: unknown): { value: string; label: string }[] {
  const resolveLabel = (name?: MetadataItem['name'], label?: string, fallback = ''): string => {
    if (label) return label
    if (typeof name === 'string') return name
    if (name && typeof name === 'object') return name.en ?? ''
    return fallback
  }

  if (Array.isArray(input)) {
    return input.map((item: unknown) => {
      const m = item as MetadataItem
      return {
        value: String(m.id ?? m.key ?? ''),
        label: resolveLabel(m.name, m.label),
      }
    })
  }
  if (input && typeof input === 'object') {
    return Object.entries(input as Record<string, unknown>).map(([key, value]) => {
      const m = value as MetadataItem
      return {
        value: key,
        label: resolveLabel(m.name, m.label, key),
      }
    })
  }
  return []
}

const statusOptions = computed(() => [
  { value: '', label: t('poi.filter_all_statuses') },
  ...normalizeMetadataItems(metadata.value.statuses),
])

const threatOptions = computed(() => [
  { value: '', label: t('poi.filter_all_threats') },
  ...normalizeMetadataItems(metadata.value.threat_levels),
])

const communityOptions = computed(() => [
  { value: '', label: t('poi.filter_all_communities') },
  ...communities.value.map((c: Community) => ({ value: String(c.community_id), label: c.name })),
])

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit.value)))
const hasPrev = computed(() => offset.value > 0)
const hasNext = computed(() => offset.value + records.value.length < totalCount.value)

function buildListParams(recordType?: ActiveTab) {
  const typeFilter = recordType && recordType !== 'all' ? recordType : undefined
  const communityId = filterCommunity.value ? Number(filterCommunity.value) : undefined
  return {
    community_id: communityId,
    record_type: typeFilter,
    status: filterStatus.value || undefined,
    threat_level: filterThreat.value || undefined,
    expiring_within_days: expiringSoon.value ? 14 : undefined,
    search_text: searchQuery.value.trim() || undefined,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
    offset: offset.value,
    limit: limit.value,
  }
}

async function fetchRecords() {
  loading.value = true
  error.value = ''
  try {
    const response = await poiApi.getPoiList(buildListParams(activeTab.value), { showLoading: false })
    records.value = response.records ?? []
    totalCount.value = response.total_count ?? 0
  } catch (err) {
    console.error('Failed to load POI records:', err)
    records.value = []
    totalCount.value = 0
    error.value = err instanceof Error ? err.message : 'Failed to load records'
    toastStore.error(error.value)
  } finally {
    loading.value = false
  }
}

async function fetchTabCounts() {
  try {
    const responses = await Promise.all(
      tabs.map(tab =>
        poiApi.getPoiList({ ...buildListParams(tab.id), limit: 1, offset: 0 }, { showLoading: false })
      )
    )
    tabs.forEach((tab, index) => {
      tabCounts.value[tab.id] = responses[index]?.total_count ?? 0
    })
  } catch (err) {
    console.error('Failed to load POI tab counts:', err)
  }
}

async function fetchMetadata() {
  try {
    const response = await poiApi.getPoiMetadata({ showLoading: false })
    metadata.value = (response as any) ?? {}
  } catch (err) {
    console.error('Failed to load POI metadata:', err)
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

async function refresh() {
  await Promise.all([fetchRecords(), fetchTabCounts()])
}

function setTab(tab: ActiveTab) {
  activeTab.value = tab
  offset.value = 0
  router.replace({ query: { ...route.query, tab } })
  refresh()
}

function toggleSort(key: SortBy) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortDir.value = 'desc'
  }
  offset.value = 0
  fetchRecords()
}

function prevPage() {
  if (hasPrev.value) {
    offset.value = Math.max(0, offset.value - limit.value)
  }
}

function nextPage() {
  if (hasNext.value) {
    offset.value += limit.value
  }
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

function parseLocalDate(dateStr: string) {
  const parts = dateStr.split('-').map(Number)
  const year = parts[0] ?? 0
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1
  return new Date(year, month - 1, day)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = parseLocalDate(dateStr)
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isExpired(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const d = parseLocalDate(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d < now
}

function isExpiringSoon(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const d = parseLocalDate(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = d.getTime() - now.getTime()
  return diff >= 0 && diff <= 14 * 24 * 60 * 60 * 1000
}

function formatLastUpdated(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const local = utcToLocal(dateStr)
  return local.isValid() ? local.fromNow() : '—'
}

function formatCommunities(sites: { community_name: string }[], max = 2): string {
  if (!sites.length) return '—'
  const names = sites.map(s => s.community_name)
  const visible = names.slice(0, max)
  const extra = names.length - max
  return extra > 0 ? `${visible.join(', ')} +${extra}` : visible.join(', ')
}

function getInitials(record: PoiListRecord): string {
  const first = record.first_name?.[0] ?? ''
  const last = record.last_name?.[0] ?? ''
  return `${first}${last}`.toUpperCase()
}

function navigateToNew() {
  router.push('/poi/new')
}

function navigateToDetail(id: number) {
  router.push(`/poi/${id}`)
}

function navigateToEdit(id: number) {
  router.push(`/poi/${id}/edit`)
}

// Inactivate modal
const inactiveTarget = ref<PoiListRecord | null>(null)
const inactiveReason = ref('')
const inactiveReasonError = ref('')
const isInactivating = ref(false)

function openInactiveModal(record: PoiListRecord) {
  inactiveTarget.value = record
  inactiveReason.value = ''
  inactiveReasonError.value = ''
}

function closeInactiveModal() {
  inactiveTarget.value = null
  inactiveReason.value = ''
  inactiveReasonError.value = ''
}

async function confirmInactive() {
  if (!inactiveTarget.value) return
  if (!inactiveReason.value.trim()) {
    inactiveReasonError.value = t('validation.required')
    return
  }
  isInactivating.value = true
  try {
    await poiApi.inactivatePoiRecord(inactiveTarget.value.record_id, inactiveReason.value.trim())
    toastStore.success(t('poi.modal_inactive_success'))
    closeInactiveModal()
    await refresh()
  } catch (err) {
    console.error('Failed to inactivate record:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to inactivate record')
  } finally {
    isInactivating.value = false
  }
}

// Archive modal
const archiveTarget = ref<PoiListRecord | null>(null)
const isArchiving = ref(false)

function openArchiveModal(record: PoiListRecord) {
  archiveTarget.value = record
}

function closeArchiveModal() {
  archiveTarget.value = null
}

async function confirmArchive() {
  if (!archiveTarget.value) return
  isArchiving.value = true
  try {
    await poiApi.archivePoiRecord(archiveTarget.value.record_id)
    toastStore.success(t('poi.archive_success'))
    closeArchiveModal()
    await refresh()
  } catch (err) {
    console.error('Failed to archive record:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to archive record')
  } finally {
    isArchiving.value = false
  }
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    offset.value = 0
    refresh()
  }, 400)
})

watch(
  [filterStatus, filterCommunity, filterThreat, expiringSoon, sortBy, sortDir],
  () => {
    offset.value = 0
    refresh()
  }
)

watch(offset, fetchRecords)

onMounted(async () => {
  await Promise.all([fetchMetadata(), fetchCommunities()])
  await refresh()
})
</script>

<template>
  <div class="poi-list">
    <!-- Header -->
    <div class="poi-list__header">
      <div class="poi-list__title-area">
        <h1 class="poi-list__title">{{ t('poi.title') }}</h1>
        <p class="poi-list__subtitle">{{ t('poi.subtitle') }}</p>
      </div>
      <AppButton
        :text="t('poi.create')"
        icon="lucide:plus"
        type="primary"
        size="sm"
        @click="navigateToNew"
      />
    </div>

    <!-- Tabs -->
    <div class="poi-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="poi-tab-btn"
        :class="{ 'poi-tab-btn--active': activeTab === tab.id }"
        @click="setTab(tab.id)"
      >
        <Icon :name="tab.icon" :size="16" />
        <span>{{ tab.label }}</span>
        <span class="poi-tab-count">{{ tabCounts[tab.id] ?? 0 }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="poi-list__filters">
      <div class="search-wrapper">
        <Icon name="lucide:search" :size="15" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="t('poi.search_placeholder')"
        />
      </div>

      <select v-model="filterStatus" class="filter-select">
        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <select v-model="filterCommunity" class="filter-select">
        <option v-for="option in communityOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <select v-model="filterThreat" class="filter-select">
        <option v-for="option in threatOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <button
        class="expiring-toggle"
        :class="{ 'expiring-toggle--active': expiringSoon }"
        @click="expiringSoon = !expiringSoon"
      >
        <Icon name="lucide:clock" :size="14" />
        <span>{{ t('poi.expiring_soon') }}</span>
      </button>
    </div>

    <!-- Pagination info -->
    <div class="poi-list__meta">
      <span class="showing-text">
        {{ t('poi.showing', {
          from: totalCount === 0 ? '0' : String(offset + 1),
          to: String(Math.min(offset + records.length, totalCount)),
          total: String(totalCount),
        }) }}
      </span>
    </div>

    <!-- Table -->
    <div class="poi-list__table-container">
      <div v-if="loading" class="poi-list__loading">
        <Icon name="lucide:loader-2" :size="24" class="spin" />
        <span>Loading...</span>
      </div>

      <table v-else class="poi-table">
        <thead>
          <tr>
            <th class="col-photo" />
            <th class="col-name sortable" @click="toggleSort('name')">
              {{ t('poi.col_name') }}
              <Icon
                :name="sortBy === 'name' ? (sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down') : 'lucide:chevrons-up-down'"
                :size="12"
                class="sort-icon"
              />
            </th>
            <th class="col-type">{{ t('poi.col_type') }}</th>
            <th class="col-threat sortable" @click="toggleSort('threat_level')">
              {{ t('poi.col_threat') }}
              <Icon
                :name="sortBy === 'threat_level' ? (sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down') : 'lucide:chevrons-up-down'"
                :size="12"
                class="sort-icon"
              />
            </th>
            <th class="col-status">{{ t('poi.col_status') }}</th>
            <th class="col-sites">{{ t('poi.col_communities') }}</th>
            <th class="col-expiry">{{ t('poi.col_expiry') }}</th>
            <th class="col-updated sortable" @click="toggleSort('last_update')">
              {{ t('poi.col_updated') }}
              <Icon
                :name="sortBy === 'last_update' ? (sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down') : 'lucide:chevrons-up-down'"
                :size="12"
                class="sort-icon"
              />
            </th>
            <th class="col-actions">{{ t('poi.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="records.length === 0">
            <td colspan="9" class="empty-row">
              <div class="empty-state">
                <Icon name="lucide:shield-off" :size="32" class="empty-state__icon" />
                <p>{{ t('poi.empty') }}</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="record in records"
            :key="record.record_id"
            class="poi-row"
            @click="navigateToDetail(record.record_id)"
          >
            <td class="col-photo">
              <div v-if="record.photo_url" class="photo-thumb">
                <img :src="record.photo_url" :alt="record.full_name" />
              </div>
              <div v-else class="photo-placeholder">
                {{ getInitials(record) }}
              </div>
            </td>
            <td class="col-name">
              <span class="record-name">{{ record.full_name }}</span>
              <span v-if="record.known_aliases" class="record-aliases">{{ record.known_aliases }}</span>
            </td>
            <td class="col-type">
              <Badge type="poiType" :value="record.record_type" />
            </td>
            <td class="col-threat">
              <Badge type="poiThreat" :value="record.threat_level" />
            </td>
            <td class="col-status">
              <Badge type="poiStatus" :value="record.status" />
            </td>
            <td class="col-sites">
              <span class="sites-list">{{ formatCommunities(record.sites) }}</span>
            </td>
            <td class="col-expiry">
              <span
                v-if="record.expiry_date"
                class="expiry-date"
                :class="{
                  'expiry-date--warning': isExpiringSoon(record.expiry_date),
                  'expiry-date--expired': isExpired(record.expiry_date),
                }"
              >
                {{ formatDate(record.expiry_date) }}
              </span>
              <span v-else class="expiry-na">—</span>
            </td>
            <td class="col-updated">
              <span class="updated-date">{{ formatLastUpdated(record.last_update) }}</span>
            </td>
            <td class="col-actions" @click.stop>
              <div class="action-group">
                <AppButton
                  type="ghost"
                  size="sm"
                  icon="lucide:eye"
                  text=""
                  :icon-only="true"
                  :title="t('common.view')"
                  @click="navigateToDetail(record.record_id)"
                />
                <AppButton
                  v-if="record.status === 'draft' || record.status === 'active'"
                  type="ghost"
                  size="sm"
                  icon="lucide:pencil"
                  text=""
                  :icon-only="true"
                  :title="t('common.edit')"
                  @click="navigateToEdit(record.record_id)"
                />
                <AppButton
                  v-if="record.status === 'active'"
                  type="ghost"
                  size="sm"
                  icon="lucide:ban"
                  text=""
                  :icon-only="true"
                  class="action-warning"
                  :title="t('poi.action_inactive')"
                  @click="openInactiveModal(record)"
                />
                <AppButton
                  v-if="record.status === 'expired' || record.status === 'inactive'"
                  type="ghost"
                  size="sm"
                  icon="lucide:archive"
                  text=""
                  :icon-only="true"
                  class="action-danger"
                  :title="t('poi.action_archive')"
                  @click="openArchiveModal(record)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="poi-list__pagination">
      <button class="page-btn" :disabled="!hasPrev" @click="prevPage">
        <Icon name="lucide:chevron-left" :size="16" />
      </button>
      <button
        v-for="page in pageNumbers"
        :key="page"
        class="page-btn"
        :class="{ 'page-btn--active': page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button class="page-btn" :disabled="!hasNext" @click="nextPage">
        <Icon name="lucide:chevron-right" :size="16" />
      </button>
    </div>
  </div>

  <!-- Inactivate Modal -->
  <AppDialogModal
    :show="!!inactiveTarget"
    :title="t('poi.modal_inactive_title')"
    max-width="480px"
    @close="closeInactiveModal"
  >
    <p class="modal__desc">{{ t('poi.modal_inactive_desc') }}</p>
    <div class="form-field" :class="{ 'form-field--error': inactiveReasonError }">
      <label class="form-field__label">
        {{ t('poi.modal_inactive_reason') }} <span class="req">*</span>
      </label>
      <textarea
        v-model="inactiveReason"
        class="form-field__textarea"
        rows="3"
        :placeholder="t('poi.modal_inactive_reason_placeholder')"
      />
      <span v-if="inactiveReasonError" class="field-error">{{ inactiveReasonError }}</span>
    </div>
    <template #footer>
      <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="closeInactiveModal" />
      <AppButton
        :text="t('poi.modal_inactive_confirm')"
        type="danger"
        size="sm"
        :loading="isInactivating"
        @click="confirmInactive"
      />
    </template>
  </AppDialogModal>

  <!-- Archive Modal -->
  <AppDialogModal
    :show="!!archiveTarget"
    :title="t('poi.modal_archive_title')"
    max-width="480px"
    @close="closeArchiveModal"
  >
    <p class="modal__desc">{{ t('poi.modal_archive_desc') }}</p>
    <template #footer>
      <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="closeArchiveModal" />
      <AppButton
        :text="t('poi.modal_archive_confirm')"
        type="danger"
        size="sm"
        :loading="isArchiving"
        @click="confirmArchive"
      />
    </template>
  </AppDialogModal>
</template>

<style scoped>
/* ── Layout ── */
.poi-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  height: 100%;
}

/* ── Header ── */
.poi-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.poi-list__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}

.poi-list__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Tabs ── */
.poi-tabs {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-1);
}

.poi-tab-btn {
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

.poi-tab-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-surface);
}

.poi-tab-btn--active {
  color: var(--color-accent);
  background: rgba(229, 255, 68, 0.1);
}

.poi-tab-btn--active:hover {
  background: rgba(229, 255, 68, 0.15);
}

.poi-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 var(--space-1);
  background: var(--color-bg-overlay);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}

.poi-tab-btn--active .poi-tab-count {
  background: rgba(229, 255, 68, 0.2);
  color: var(--color-accent);
}

/* ── Filters ── */
.poi-list__filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-2) var(--space-3) var(--space-2) calc(var(--space-3) + 20px);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}

.search-input:focus {
  border-color: var(--color-accent);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-base);
}

.filter-select:focus {
  border-color: var(--color-accent);
}

.expiring-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.expiring-toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.expiring-toggle--active {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.4);
  color: #b45309;
}

.poi-list__meta {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* ── Table ── */
.poi-list__table-container {
  flex: 1;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
}

.poi-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-10);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.poi-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.poi-table thead tr {
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.poi-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.poi-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.poi-table th.sortable:hover {
  color: var(--color-text-primary);
}

.sort-icon {
  margin-left: var(--space-1);
  vertical-align: middle;
  color: var(--color-text-muted);
}

.poi-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-base);
  cursor: pointer;
}

.poi-table tbody tr:last-child {
  border-bottom: none;
}

.poi-table tbody tr:hover {
  background: var(--color-bg-elevated);
}

.poi-table td {
  padding: var(--space-3) var(--space-4);
  vertical-align: middle;
}

/* ── Column widths ── */
.col-photo  { width: 56px; }
.col-name   { min-width: 180px; }
.col-type   { width: 140px; }
.col-threat { width: 110px; }
.col-status { width: 110px; }
.col-sites  { min-width: 160px; }
.col-expiry { width: 120px; }
.col-updated { width: 120px; }
.col-actions { width: 120px; text-align: right; }

/* ── Photo ── */
.photo-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-elevated);
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
  flex-shrink: 0;
}

/* ── Text cells ── */
.record-name {
  display: block;
  font-weight: 600;
  color: var(--color-text-primary);
}

.record-aliases {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.sites-list {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.updated-date {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

/* ── Expiry ── */
.expiry-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.expiry-date--warning {
  color: #b45309;
  font-weight: 600;
}

.expiry-date--expired {
  color: #dc2626;
  font-weight: 600;
}

.expiry-na {
  color: var(--color-text-muted);
}

/* ── Actions ── */
.action-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-1);
}

.action-warning:hover:not(:disabled) {
  border-color: #f59e0b !important;
  color: #f59e0b !important;
}

.action-danger:hover:not(:disabled) {
  border-color: var(--color-critical) !important;
  color: var(--color-critical) !important;
}

/* ── Empty ── */
.empty-row td {
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.empty-state__icon {
  opacity: 0.3;
}

/* ── Pagination ── */
.poi-list__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--space-2);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.modal__desc {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-4);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-field--error .form-field__textarea {
  border-color: var(--color-critical);
}

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-field__textarea {
  padding: var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  resize: vertical;
}

.form-field__textarea:focus {
  border-color: var(--color-accent);
}

.field-error {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.req {
  color: var(--color-critical);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
