<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AppButton from '~/components/AppButton.vue'
import AppDialogModal from '~/components/AppDialogModal.vue'
import { reportTemplateApi } from '~/api/reportTemplate'
import { communityApi } from '~/api/community'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import type { Community } from '~/api/community'
import type {
  ReportTemplateListItem,
  ReportTemplateCategory,
  ReportTemplateStatus,
} from '~/api/types/reportTemplate'

type SortBy = 'name' | 'category' | 'status' | 'last_modified'
type StatusTab = 'all' | ReportTemplateStatus

const { t } = useTranslation()
const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

const templates = ref<ReportTemplateListItem[]>([])
const numOfItems = ref(0)
const numOfPages = ref(0)
const loading = ref(false)
const error = ref('')

const searchQuery = ref('')
const filterCommunity = ref<number | ''>('')
const filterCategory = ref<ReportTemplateCategory | ''>('')
const sortBy = ref<SortBy>('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(0)

const communities = ref<Community[]>([])
const tabCounts = ref<Record<StatusTab, number>>({ all: 0, draft: 0, active: 0, archived: 0 })

interface TabConfig {
  id: StatusTab
  label: string
  icon: string
}

const tabs: TabConfig[] = [
  { id: 'all', label: t('reports.tab_all'), icon: 'lucide:layers' },
  { id: 'active', label: t('reports.status_active'), icon: 'lucide:check-circle-2' },
  { id: 'draft', label: t('reports.tab_drafts'), icon: 'lucide:file-edit' },
  { id: 'archived', label: t('reports.status_archived'), icon: 'lucide:archive' },
]

const validTabIds = tabs.map(tab => tab.id)

const activeTab = ref<StatusTab>(
  validTabIds.includes(route.query.tab as StatusTab) ? (route.query.tab as StatusTab) : 'active'
)

watch(() => route.query.tab, (tab: unknown) => {
  const next = validTabIds.includes(tab as StatusTab) ? (tab as StatusTab) : 'active'
  if (next === activeTab.value) return
  activeTab.value = next
  page.value = 0
  fetchTemplates()
})

function setTab(tab: StatusTab) {
  if (tab === activeTab.value) return
  activeTab.value = tab
  page.value = 0
  fetchTemplates()
  router.replace({ query: { ...route.query, tab } })
}

const communityOptions = computed(() => [
  { value: '' as const, label: t('reports.filter_all_communities') },
  ...communities.value.map((c: Community) => ({ value: c.community_id as number, label: c.name })),
])

const categoryOptions = computed<{ value: ReportTemplateCategory | ''; label: string }[]>(() => [
  { value: '', label: t('reports.filter_all_categories') },
  { value: 'incident', label: t('reports.category_incident') },
  { value: 'daily_activity', label: t('reports.category_daily') },
  { value: 'custom', label: t('reports.category_custom') },
])

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 0
    fetchTemplates()
  }, 300)
})

watch([filterCommunity, filterCategory], () => {
  page.value = 0
  fetchTemplates()
})

watch(page, () => fetchTemplates())

async function fetchTabCounts() {
  try {
    const results = await Promise.all([
      reportTemplateApi.getTemplatesList({ status: undefined, page: 0 }, { showLoading: false }),
      reportTemplateApi.getTemplatesList({ status: 'draft', page: 0 }, { showLoading: false }),
      reportTemplateApi.getTemplatesList({ status: 'active', page: 0 }, { showLoading: false }),
      reportTemplateApi.getTemplatesList({ status: 'archived', page: 0 }, { showLoading: false }),
    ])
    tabCounts.value = {
      all: results[0].num_of_items ?? 0,
      draft: results[1].num_of_items ?? 0,
      active: results[2].num_of_items ?? 0,
      archived: results[3].num_of_items ?? 0,
    }
  } catch {
    // counts are best-effort
  }
}

async function fetchTemplates() {
  loading.value = true
  error.value = ''
  try {
    const response = await reportTemplateApi.getTemplatesList(
      {
        status: activeTab.value === 'all' ? undefined : activeTab.value,
        community_id: filterCommunity.value === '' ? undefined : filterCommunity.value,
        category: filterCategory.value || undefined,
        search_text: searchQuery.value.trim() || undefined,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
        page: page.value,
      },
      { showLoading: false }
    )
    templates.value = response.templates ?? []
    numOfItems.value = response.num_of_items ?? 0
    numOfPages.value = response.num_of_pages ?? 0
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load templates'
    toastStore.error(error.value)
  } finally {
    loading.value = false
  }
}

function refresh() {
  fetchTemplates()
  fetchTabCounts()
}

function toggleSort(col: SortBy) {
  if (sortBy.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDir.value = 'asc'
  }
  page.value = 0
  fetchTemplates()
}

function formatLastModified(dateStr: string | null): string {
  if (!dateStr) return '—'
  return utcToLocal(dateStr).fromNow()
}

function communitiesLabel(tpl: ReportTemplateListItem): string {
  return (tpl.communities ?? []).map(c => c.community_name).join(', ')
}

// ── Navigation ──
function navigateToNew() {
  router.push('/report-templates/new')
}

function navigateToEdit(tpl: ReportTemplateListItem) {
  router.push(`/report-templates/${tpl.template_id}/edit`)
}

// ── Actions ──
const canEdit = (tpl: ReportTemplateListItem) => tpl.status !== 'archived'
const canActivate = (tpl: ReportTemplateListItem) => tpl.status === 'draft' || tpl.status === 'archived'
const canArchive = (tpl: ReportTemplateListItem) => tpl.status === 'draft' || tpl.status === 'active'
const canDelete = (tpl: ReportTemplateListItem) => tpl.status === 'draft'

const duplicatingId = ref<number | null>(null)
const actionLoadingId = ref<number | null>(null)

async function duplicateTemplate(tpl: ReportTemplateListItem) {
  duplicatingId.value = tpl.template_id
  try {
    const response = await reportTemplateApi.duplicateTemplate(tpl.template_id)
    toastStore.success(t('reports.duplicate_success'))
    const newId = response.template_id
    if (newId) {
      router.push(`/report-templates/${newId}/edit`)
    } else {
      refresh()
    }
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to duplicate template')
  } finally {
    duplicatingId.value = null
  }
}

// ── Activate modal ──
const showActivateModal = ref(false)
const activateTarget = ref<ReportTemplateListItem | null>(null)

function openActivateModal(tpl: ReportTemplateListItem) {
  activateTarget.value = tpl
  showActivateModal.value = true
}

function closeActivateModal() {
  showActivateModal.value = false
  activateTarget.value = null
}

async function confirmActivate() {
  if (!activateTarget.value) return
  actionLoadingId.value = activateTarget.value.template_id
  try {
    await reportTemplateApi.activateTemplate(activateTarget.value.template_id)
    toastStore.success(t('reports.activate_success'))
    closeActivateModal()
    refresh()
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to activate template')
  } finally {
    actionLoadingId.value = null
  }
}

// ── Archive modal ──
const showArchiveModal = ref(false)
const archiveTarget = ref<ReportTemplateListItem | null>(null)

function openArchiveModal(tpl: ReportTemplateListItem) {
  archiveTarget.value = tpl
  showArchiveModal.value = true
}

function closeArchiveModal() {
  showArchiveModal.value = false
  archiveTarget.value = null
}

async function confirmArchive() {
  if (!archiveTarget.value) return
  actionLoadingId.value = archiveTarget.value.template_id
  try {
    await reportTemplateApi.archiveTemplate(archiveTarget.value.template_id)
    toastStore.success(t('reports.archive_success'))
    closeArchiveModal()
    refresh()
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to archive template')
  } finally {
    actionLoadingId.value = null
  }
}

// ── Delete modal ──
const showDeleteModal = ref(false)
const deleteTarget = ref<ReportTemplateListItem | null>(null)

function openDeleteModal(tpl: ReportTemplateListItem) {
  deleteTarget.value = tpl
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTarget.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  actionLoadingId.value = deleteTarget.value.template_id
  try {
    await reportTemplateApi.deleteTemplate(deleteTarget.value.template_id)
    toastStore.success(t('reports.delete_success'))
    closeDeleteModal()
    refresh()
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to delete template')
  } finally {
    actionLoadingId.value = null
  }
}

// ── Pagination ──
const hasPrev = computed(() => page.value > 0)
const hasNext = computed(() => page.value + 1 < numOfPages.value)

function prevPage() {
  if (hasPrev.value) page.value -= 1
}

function nextPage() {
  if (hasNext.value) page.value += 1
}

onMounted(() => {
  fetchTemplates()
  fetchTabCounts()
  communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    .then(res => { communities.value = res.communities ?? [] })
    .catch(() => {})
})
</script>

<template>
  <div class="tpl-list">
    <!-- Header -->
    <div class="tpl-list__header">
      <div class="tpl-list__title-area">
        <h1 class="tpl-list__title">{{ t('reports.title') }}</h1>
        <p class="tpl-list__subtitle">{{ t('reports.subtitle') }}</p>
      </div>
      <AppButton
        :text="t('reports.add_new')"
        icon="lucide:plus"
        type="primary"
        size="md"
        @click="navigateToNew"
      />
    </div>

    <!-- Status tabs -->
    <div class="tpl-list__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tpl-tab"
        :class="{ 'tpl-tab--active': activeTab === tab.id }"
        @click="setTab(tab.id)"
      >
        <Icon :name="tab.icon" :size="15" />
        <span>{{ tab.label }}</span>
        <span v-if="tabCounts[tab.id] > 0" class="tpl-tab__count">{{ tabCounts[tab.id] }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="tpl-list__filters">
      <div class="search-box">
        <Icon name="lucide:search" :size="14" class="search-box__icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="search-box__input"
          :placeholder="t('reports.search_placeholder')"
        />
      </div>
      <select v-model="filterCommunity" class="filter-select">
        <option v-for="opt in communityOptions" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select v-model="filterCategory" class="filter-select">
        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <span class="total-count">{{ numOfItems }} {{ t('reports.count') }}</span>
    </div>

    <!-- Table -->
    <div class="tpl-list__table-wrap">
      <table class="tpl-table">
        <thead>
          <tr>
            <th class="col-name sortable" @click="toggleSort('name')">
              {{ t('reports.col_name') }}
              <Icon
                v-if="sortBy === 'name'"
                :name="sortDir === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
                :size="12"
                class="sort-icon"
              />
            </th>
            <th class="col-community">{{ t('reports.col_community') }}</th>
            <th class="col-category sortable" @click="toggleSort('category')">
              {{ t('reports.col_category') }}
              <Icon
                v-if="sortBy === 'category'"
                :name="sortDir === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
                :size="12"
                class="sort-icon"
              />
            </th>
            <th class="col-sections">{{ t('reports.col_sections') }}</th>
            <th class="col-status sortable" @click="toggleSort('status')">
              {{ t('reports.col_status') }}
              <Icon
                v-if="sortBy === 'status'"
                :name="sortDir === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
                :size="12"
                class="sort-icon"
              />
            </th>
            <th class="col-modified sortable" @click="toggleSort('last_modified')">
              {{ t('reports.col_modified') }}
              <Icon
                v-if="sortBy === 'last_modified'"
                :name="sortDir === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
                :size="12"
                class="sort-icon"
              />
            </th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="empty-row">
              <div class="empty-state">
                <Icon name="lucide:loader-2" :size="28" class="spin" />
              </div>
            </td>
          </tr>
          <tr v-else-if="error">
            <td colspan="7" class="empty-row">
              <div class="empty-state">
                <Icon name="lucide:alert-circle" :size="32" class="empty-state__icon" />
                <p>{{ error }}</p>
              </div>
            </td>
          </tr>
          <tr v-else-if="templates.length === 0">
            <td colspan="7" class="empty-row">
              <div class="empty-state">
                <Icon name="lucide:file-x" :size="32" class="empty-state__icon" />
                <p>{{ t('reports.empty') }}</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="tpl in templates"
            :key="tpl.template_id"
            class="tpl-row"
            :class="{ 'tpl-row--archived': tpl.status === 'archived' }"
            @click="canEdit(tpl) && navigateToEdit(tpl)"
          >
            <td class="col-name">
              <div class="tpl-name">
                <Icon name="lucide:file-text" :size="15" class="tpl-name__icon" />
                <span class="tpl-name__text">{{ tpl.name }}</span>
              </div>
              <span class="tpl-id">TPL-{{ tpl.template_id }}</span>
            </td>
            <td class="col-community">
              <span v-if="tpl.is_global" class="community-global">
                <Icon name="lucide:globe" :size="12" />
                Global
              </span>
              <span v-else class="community-name">{{ communitiesLabel(tpl) || '—' }}</span>
            </td>
            <td class="col-category">
              <Badge type="templateCategory" :value="tpl.category" />
            </td>
            <td class="col-sections">
              <span class="sections-count">
                <Icon name="lucide:layers" :size="12" />
                {{ tpl.section_count }}
              </span>
            </td>
            <td class="col-status">
              <Badge type="templateStatus" :value="tpl.status" />
            </td>
            <td class="col-modified">
              <span class="modified-date">{{ formatLastModified(tpl.last_modified) }}</span>
            </td>
            <td class="col-actions" @click.stop>
              <div class="action-group">
                <AppButton
                  v-if="canEdit(tpl)"
                  type="ghost"
                  size="sm"
                  icon="lucide:pencil"
                  text=""
                  :icon-only="true"
                  :title="t('common.edit')"
                  @click="navigateToEdit(tpl)"
                />
                <AppButton
                  type="ghost"
                  size="sm"
                  icon="lucide:copy"
                  text=""
                  :icon-only="true"
                  :title="t('reports.action_duplicate')"
                  :loading="duplicatingId === tpl.template_id"
                  @click="duplicateTemplate(tpl)"
                />
                <AppButton
                  v-if="canActivate(tpl)"
                  type="ghost"
                  size="sm"
                  icon="lucide:check-circle-2"
                  text=""
                  :icon-only="true"
                  :title="t('reports.action_activate')"
                  @click="openActivateModal(tpl)"
                />
                <AppButton
                  v-if="canArchive(tpl)"
                  type="ghost"
                  size="sm"
                  icon="lucide:archive"
                  text=""
                  :icon-only="true"
                  :title="t('reports.action_archive')"
                  @click="openArchiveModal(tpl)"
                />
                <AppButton
                  v-if="canDelete(tpl)"
                  type="ghost"
                  size="sm"
                  icon="lucide:trash-2"
                  text=""
                  :icon-only="true"
                  :title="t('reports.action_delete')"
                  @click="openDeleteModal(tpl)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="numOfPages > 1 || numOfItems > 0" class="tpl-list__pagination">
      <span class="pagination-info">
        {{ t('reports.page_info', { page: String(page + 1), pages: String(numOfPages) }) }}
      </span>
      <div class="pagination-controls">
        <AppButton
          type="secondary"
          size="sm"
          icon="lucide:chevron-left"
          text=""
          :icon-only="true"
          :disabled="!hasPrev"
          @click="prevPage"
        />
        <AppButton
          type="secondary"
          size="sm"
          icon="lucide:chevron-right"
          text=""
          :icon-only="true"
          :disabled="!hasNext"
          @click="nextPage"
        />
      </div>
    </div>

    <!-- Activate Modal -->
    <AppDialogModal
      :show="showActivateModal"
      :title="t('reports.modal_activate_title')"
      max-width="480px"
      @close="closeActivateModal"
    >
      <p class="modal__desc">{{ t('reports.modal_activate_desc') }}</p>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="closeActivateModal" />
        <AppButton
          :text="t('reports.modal_activate_confirm')"
          icon="lucide:check-circle-2"
          type="primary"
          size="sm"
          :loading="actionLoadingId === activateTarget?.template_id"
          @click="confirmActivate"
        />
      </template>
    </AppDialogModal>

    <!-- Archive Modal -->
    <AppDialogModal
      :show="showArchiveModal"
      :title="t('reports.modal_archive_title')"
      max-width="480px"
      @close="closeArchiveModal"
    >
      <p class="modal__desc">{{ t('reports.modal_archive_desc') }}</p>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="closeArchiveModal" />
        <AppButton
          :text="t('reports.modal_archive_confirm')"
          icon="lucide:archive"
          type="danger"
          size="sm"
          :loading="actionLoadingId === archiveTarget?.template_id"
          @click="confirmArchive"
        />
      </template>
    </AppDialogModal>

    <!-- Delete Modal -->
    <AppDialogModal
      :show="showDeleteModal"
      :title="t('reports.modal_delete_title')"
      max-width="480px"
      @close="closeDeleteModal"
    >
      <p class="modal__desc">{{ t('reports.modal_delete_desc') }}</p>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="closeDeleteModal" />
        <AppButton
          :text="t('reports.modal_delete_confirm')"
          icon="lucide:trash-2"
          type="danger"
          size="sm"
          :loading="actionLoadingId === deleteTarget?.template_id"
          @click="confirmDelete"
        />
      </template>
    </AppDialogModal>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.tpl-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  height: 100%;
}

/* ── Header ── */
.tpl-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.tpl-list__title-area { display: flex; flex-direction: column; gap: var(--space-1); }

.tpl-list__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.tpl-list__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Tabs ── */
.tpl-list__tabs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
}

.tpl-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.tpl-tab:hover {
  color: var(--color-text-primary);
}

.tpl-tab--active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  background: rgba(229, 255, 68, 0.1);
}

.tpl-tab__count {
  padding: 0 var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full, 999px);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.tpl-tab--active .tpl-tab__count {
  background: rgba(229, 255, 68, 0.15);
  border-color: transparent;
  color: var(--color-accent);
}

/* ── Filters ── */
.tpl-list__filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 320px;
}

.search-box__icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-box__input {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-2) var(--space-3) var(--space-2) calc(var(--space-3) * 2 + 14px);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}
.search-box__input:focus { border-color: var(--color-accent); }
.search-box__input::placeholder { color: var(--color-text-muted); }

.filter-select {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  cursor: pointer;
}

.total-count {
  margin-left: auto;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* ── Table ── */
.tpl-list__table-wrap {
  flex: 1;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
}

.tpl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.tpl-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.tpl-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.tpl-table th.sortable:hover {
  color: var(--color-text-primary);
}

.sort-icon {
  vertical-align: middle;
  margin-left: var(--space-1);
}

.tpl-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
  color: var(--color-text-primary);
}

.tpl-row {
  cursor: pointer;
  transition: background var(--transition-base);
}
.tpl-row:hover { background: var(--color-bg-elevated); }
.tpl-row:last-child td { border-bottom: none; }
.tpl-row--archived { opacity: 0.65; }

/* ── Column widths ── */
.col-name     { width: 28%; }
.col-community { width: 16%; }
.col-category { width: 12%; }
.col-sections { width: 9%; text-align: center; }
.col-status   { width: 10%; }
.col-modified { width: 13%; }
.col-actions  { width: 12%; }

/* ── Template name cell ── */
.tpl-name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.tpl-name__icon { color: var(--color-text-muted); flex-shrink: 0; }
.tpl-name__text { font-weight: 500; color: var(--color-text-primary); }
.tpl-id { font-size: var(--font-size-xs); color: var(--color-text-muted); padding-left: calc(15px + var(--space-2)); }

/* ── Community ── */
.community-global {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.25);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}
.community-name { color: var(--color-text-secondary); }

/* ── Sections count ── */
.sections-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ── Modified date ── */
.modified-date { font-size: var(--font-size-xs); color: var(--color-text-muted); }

/* ── Action buttons ── */
.action-group {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* ── Empty state ── */
.empty-row { padding: 0 !important; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
.empty-state__icon { opacity: 0.3; }

/* ── Pagination ── */
.tpl-list__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.pagination-controls {
  display: flex;
  gap: var(--space-2);
}

/* ── Modal body ── */
.modal__desc {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
