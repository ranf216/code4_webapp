<script setup lang="ts">
import { ref, computed } from 'vue'

type TemplateStatus = 'draft' | 'active' | 'archived'
type ReportCategory = 'incident' | 'daily_activity'

interface ReportTemplate {
  id: string
  name: string
  community: string
  category: ReportCategory
  sectionsCount: number
  status: TemplateStatus
  lastModified: string
}

const { t } = useTranslation()
const router = useRouter()

const searchQuery = ref('')
const filterStatus = ref<TemplateStatus | 'all'>('all')
const filterCategory = ref<ReportCategory | 'all'>('all')

const showArchiveModal = ref(false)
const archiveTargetId = ref<string | null>(null)
const isArchiving = ref(false)

const DEMO_TEMPLATES: ReportTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Standard Incident Report',
    community: 'Global',
    category: 'incident',
    sectionsCount: 6,
    status: 'active',
    lastModified: '2026-06-20T09:14:00Z',
  },
  {
    id: 'TPL-002',
    name: 'Daily Activity Log',
    community: 'Sunset Heights',
    category: 'daily_activity',
    sectionsCount: 4,
    status: 'active',
    lastModified: '2026-06-18T14:30:00Z',
  },
  {
    id: 'TPL-003',
    name: 'Trespass Incident',
    community: 'Central Hub',
    category: 'incident',
    sectionsCount: 5,
    status: 'draft',
    lastModified: '2026-06-25T11:00:00Z',
  },
  {
    id: 'TPL-004',
    name: 'Site Observation Report',
    community: 'Green Valley',
    category: 'daily_activity',
    sectionsCount: 3,
    status: 'archived',
    lastModified: '2026-05-10T08:00:00Z',
  },
  {
    id: 'TPL-005',
    name: 'Vehicle Incident Report',
    community: 'Global',
    category: 'incident',
    sectionsCount: 7,
    status: 'active',
    lastModified: '2026-06-22T16:45:00Z',
  },
]

const templates = ref<ReportTemplate[]>([...DEMO_TEMPLATES])

const filteredTemplates = computed(() => {
  return templates.value.filter((tpl) => {
    const q = searchQuery.value.toLowerCase()
    if (q && !`${tpl.name} ${tpl.community} ${tpl.id}`.toLowerCase().includes(q)) return false
    if (filterStatus.value !== 'all' && tpl.status !== filterStatus.value) return false
    if (filterCategory.value !== 'all' && tpl.category !== filterCategory.value) return false
    return true
  })
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function navigateToNew() {
  router.push('/reports/new')
}

function navigateToEdit(id: string) {
  router.push(`/reports/${id}/edit`)
}

function duplicateTemplate(id: string) {
  const src = templates.value.find(tpl => tpl.id === id)
  if (!src) return
  const newId = `TPL-${String(templates.value.length + 1).padStart(3, '0')}`
  templates.value.unshift({
    ...src,
    id: newId,
    name: `${src.name} (Copy)`,
    status: 'draft',
    lastModified: new Date().toISOString(),
  })
}

function openArchiveModal(id: string) {
  archiveTargetId.value = id
  showArchiveModal.value = true
}

function confirmArchive() {
  isArchiving.value = true
  setTimeout(() => {
    const idx = templates.value.findIndex(tpl => tpl.id === archiveTargetId.value)
    if (idx !== -1) {
      const existing = templates.value[idx]
      if (existing) templates.value[idx] = { ...existing, status: 'archived' }
    }
    isArchiving.value = false
    showArchiveModal.value = false
    archiveTargetId.value = null
  }, 500)
}

function restoreTemplate(id: string) {
  const idx = templates.value.findIndex(tpl => tpl.id === id)
  if (idx !== -1) {
    const existing = templates.value[idx]
    if (existing) templates.value[idx] = { ...existing, status: 'active' }
  }
}

function navigateToFormat(id: string) {
  router.push(`/reports/${id}/format`)
}

const statusOptions: { value: TemplateStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

const categoryOptions: { value: ReportCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'incident', label: 'Incident' },
  { value: 'daily_activity', label: 'Daily Activity' },
]
</script>

<template>
  <div class="tpl-list">
    <!-- Header -->
    <div class="tpl-list__header">
      <div class="tpl-list__title-area">
        <h1 class="tpl-list__title">{{ t('reports.title') }}</h1>
        <p class="tpl-list__subtitle">{{ t('reports.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="navigateToNew">
        <Icon name="lucide:plus" :size="15" />
        {{ t('reports.add_new') }}
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
      <select v-model="filterStatus" class="filter-select">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select v-model="filterCategory" class="filter-select">
        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <span class="total-count">{{ filteredTemplates.length }} {{ t('reports.count') }}</span>
    </div>

    <!-- Table -->
    <div class="tpl-list__table-wrap">
      <table class="tpl-table">
        <thead>
          <tr>
            <th class="col-name">{{ t('reports.col_name') }}</th>
            <th class="col-community">{{ t('reports.col_community') }}</th>
            <th class="col-category">{{ t('reports.col_category') }}</th>
            <th class="col-sections">{{ t('reports.col_sections') }}</th>
            <th class="col-status">{{ t('reports.col_status') }}</th>
            <th class="col-modified">{{ t('reports.col_modified') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredTemplates.length === 0">
            <td colspan="7" class="empty-row">
              <div class="empty-state">
                <Icon name="lucide:file-x" :size="32" class="empty-state__icon" />
                <p>{{ t('reports.empty') }}</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="tpl in filteredTemplates"
            :key="tpl.id"
            class="tpl-row"
            :class="{ 'tpl-row--archived': tpl.status === 'archived' }"
            @click="navigateToEdit(tpl.id)"
          >
            <td class="col-name">
              <div class="tpl-name">
                <Icon name="lucide:file-text" :size="15" class="tpl-name__icon" />
                <span class="tpl-name__text">{{ tpl.name }}</span>
              </div>
              <span class="tpl-id">{{ tpl.id }}</span>
            </td>
            <td class="col-community">
              <span v-if="tpl.community === 'Global'" class="community-global">
                <Icon name="lucide:globe" :size="12" />
                Global
              </span>
              <span v-else class="community-name">{{ tpl.community }}</span>
            </td>
            <td class="col-category">
              <Badge type="templateCategory" :value="tpl.category" />
            </td>
            <td class="col-sections">
              <span class="sections-count">
                <Icon name="lucide:layers" :size="12" />
                {{ tpl.sectionsCount }}
              </span>
            </td>
            <td class="col-status">
              <Badge type="templateStatus" :value="tpl.status" />
            </td>
            <td class="col-modified">
              <span class="modified-date">{{ formatDate(tpl.lastModified) }}</span>
            </td>
            <td class="col-actions" @click.stop>
              <div class="action-group">
                <button class="action-btn" :title="t('common.edit')" @click.stop="navigateToEdit(tpl.id)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button class="action-btn" :title="t('reports.action_duplicate')" @click.stop="duplicateTemplate(tpl.id)">
                  <Icon name="lucide:copy" :size="14" />
                </button>
                <button class="action-btn" :title="t('reports.action_format')" @click.stop="navigateToFormat(tpl.id)">
                  <Icon name="lucide:sliders" :size="14" />
                </button>
                <button
                  v-if="tpl.status !== 'archived'"
                  class="action-btn action-btn--danger"
                  :title="t('reports.action_archive')"
                  @click.stop="openArchiveModal(tpl.id)"
                >
                  <Icon name="lucide:archive" :size="14" />
                </button>
                <button
                  v-else
                  class="action-btn action-btn--ok"
                  :title="t('reports.action_restore')"
                  @click.stop="restoreTemplate(tpl.id)"
                >
                  <Icon name="lucide:archive-restore" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Archive Modal -->
    <Teleport to="body">
      <div v-if="showArchiveModal" class="modal-overlay" @click.self="showArchiveModal = false">
        <div class="modal">
          <div class="modal__header">
            <Icon name="lucide:archive" :size="18" class="modal__icon--warn" />
            <h3 class="modal__title">{{ t('reports.modal_archive_title') }}</h3>
          </div>
          <div class="modal__body">
            <p class="modal__desc">{{ t('reports.modal_archive_desc') }}</p>
          </div>
          <div class="modal__footer">
            <button class="btn-cancel" @click="showArchiveModal = false">{{ t('common.cancel') }}</button>
            <button class="btn-warn" :disabled="isArchiving" @click="confirmArchive">
              <Icon v-if="isArchiving" name="lucide:loader-2" :size="14" class="spin" />
              <Icon v-else name="lucide:archive" :size="14" />
              {{ t('reports.modal_archive_confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

/* ── Primary button ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity var(--transition-base);
}
.btn-primary:hover { opacity: 0.88; }

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
.col-community { width: 14%; }
.col-category { width: 13%; }
.col-sections { width: 8%; text-align: center; }
.col-status   { width: 10%; }
.col-modified { width: 12%; }
.col-actions  { width: 15%; }

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
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  font-weight: 500;
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

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}
.action-btn:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-bg-elevated); }
.action-btn--danger:hover { border-color: var(--color-critical); color: var(--color-critical); background: rgba(239,68,68,0.08); }
.action-btn--ok:hover { border-color: var(--color-ok); color: var(--color-ok); background: rgba(34,197,94,0.08); }

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

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 400px;
  max-width: calc(100vw - var(--space-8));
}
.modal__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.modal__icon--warn { color: var(--color-warn, #f59e0b); }
.modal__title { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text-primary); margin: 0; }
.modal__body { padding: var(--space-5); }
.modal__desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; }
.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}
.btn-cancel:hover { border-color: var(--color-text-secondary); color: var(--color-text-primary); }

.btn-warn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-warn, #f59e0b);
  border: none;
  color: white;
  transition: opacity var(--transition-base);
}
.btn-warn:hover { opacity: 0.88; }
.btn-warn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
