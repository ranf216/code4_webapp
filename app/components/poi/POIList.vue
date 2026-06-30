<script setup lang="ts">
import { ref, computed } from 'vue'

type RecordType = 'poi' | 'trespass' | 'metro_red_card'
type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'
type RecordStatus = 'draft' | 'active' | 'expired' | 'inactive' | 'archived'

interface POIRecord {
  id: string
  type: RecordType
  firstName: string
  lastName: string
  threatLevel: ThreatLevel
  status: RecordStatus
  sites: string[]
  expiryDate?: string
  lastUpdated: string
  photoUrl?: string
}

const { t } = useTranslation()
const router = useRouter()

const loading = ref(false)
const inactiveTargetId = ref<string | null>(null)
const inactiveReason = ref('')
const inactiveReasonError = ref('')
const isInactivating = ref(false)

function openInactiveModal(id: string) {
  inactiveTargetId.value = id
  inactiveReason.value = ''
  inactiveReasonError.value = ''
}

function closeInactiveModal() {
  inactiveTargetId.value = null
}

function confirmInactive() {
  if (!inactiveReason.value.trim()) {
    inactiveReasonError.value = t('validation.required')
    return
  }
  isInactivating.value = true
  setTimeout(() => {
    const idx = records.value.findIndex(r => r.id === inactiveTargetId.value)
    if (idx !== -1) {
      const existing = records.value[idx]
      if (existing) records.value[idx] = { ...existing, status: 'inactive' }
    }
    isInactivating.value = false
    inactiveTargetId.value = null
  }, 600)
}
const searchQuery = ref('')
const filterType = ref<RecordType | 'all'>('all')
const filterStatus = ref<RecordStatus | 'all'>('all')
const filterThreat = ref<ThreatLevel | 'all'>('all')

const DEMO_RECORDS: POIRecord[] = [
  {
    id: 'POI-001',
    type: 'poi',
    firstName: 'John',
    lastName: 'Doe',
    threatLevel: 'high',
    status: 'active',
    sites: ['Central Hub', 'North Gate'],
    photoUrl: 'https://picsum.photos/seed/poi001/60/60',
    lastUpdated: '2026-06-20T10:30:00Z',
  },
  {
    id: 'TI-002',
    type: 'trespass',
    firstName: 'Jane',
    lastName: 'Smith',
    threatLevel: 'medium',
    status: 'active',
    sites: ['South Plaza'],
    photoUrl: 'https://picsum.photos/seed/ti002/60/60',
    expiryDate: '2026-07-15T00:00:00Z',
    lastUpdated: '2026-06-18T08:15:00Z',
  },
  {
    id: 'MRC-003',
    type: 'metro_red_card',
    firstName: 'Michael',
    lastName: 'Brown',
    threatLevel: 'critical',
    status: 'active',
    sites: ['Metro Station A', 'Metro Station B'],
    photoUrl: 'https://picsum.photos/seed/mrc003/60/60',
    expiryDate: '2026-06-30T00:00:00Z',
    lastUpdated: '2026-06-10T14:00:00Z',
  },
  {
    id: 'POI-004',
    type: 'poi',
    firstName: 'Sarah',
    lastName: 'Connor',
    threatLevel: 'low',
    status: 'draft',
    sites: ['West Wing'],
    lastUpdated: '2026-06-25T09:00:00Z',
  },
  {
    id: 'TI-005',
    type: 'trespass',
    firstName: 'Robert',
    lastName: 'Chen',
    threatLevel: 'high',
    status: 'expired',
    sites: ['East Block'],
    expiryDate: '2026-06-01T00:00:00Z',
    lastUpdated: '2026-05-28T11:00:00Z',
  },
]

const records = ref<POIRecord[]>(DEMO_RECORDS)

const filteredRecords = computed(() => {
  return records.value.filter((r) => {
    const q = searchQuery.value.toLowerCase()
    if (q && !`${r.firstName} ${r.lastName} ${r.id}`.toLowerCase().includes(q)) return false
    if (filterType.value !== 'all' && r.type !== filterType.value) return false
    if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false
    if (filterThreat.value !== 'all' && r.threatLevel !== filterThreat.value) return false
    return true
  })
})

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isExpiringSoon(iso?: string): boolean {
  if (!iso) return false
  const diff = new Date(iso).getTime() - Date.now()
  return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000
}

function isExpired(iso?: string): boolean {
  if (!iso) return false
  return new Date(iso).getTime() < Date.now()
}

function getInitials(r: POIRecord) {
  return ((r.firstName[0] ?? '') + (r.lastName[0] ?? '')).toUpperCase()
}

function navigateToNew() {
  router.push('/poi/new')
}

function navigateToDetail(id: string) {
  router.push(`/poi/${id}`)
}

function navigateToEdit(id: string) {
  router.push(`/poi/${id}/edit`)
}
</script>

<template>
  <div class="poi-list">
    <!-- Header -->
    <div class="poi-list__header">
      <div class="poi-list__title-area">
        <h1 class="poi-list__title">{{ t('poi.title') }}</h1>
        <p class="poi-list__subtitle">{{ t('poi.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="navigateToNew">
        <Icon name="lucide:plus" :size="16" />
        <span>{{ t('poi.create') }}</span>
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

      <select v-model="filterType" class="filter-select">
        <option value="all">{{ t('poi.filter_all_types') }}</option>
        <option value="poi">{{ t('poi.type_poi') }}</option>
        <option value="trespass">{{ t('poi.type_trespass') }}</option>
        <option value="metro_red_card">{{ t('poi.type_metro') }}</option>
      </select>

      <select v-model="filterThreat" class="filter-select">
        <option value="all">{{ t('poi.filter_all_threats') }}</option>
        <option value="low">{{ t('poi.threat_low') }}</option>
        <option value="medium">{{ t('poi.threat_medium') }}</option>
        <option value="high">{{ t('poi.threat_high') }}</option>
        <option value="critical">{{ t('poi.threat_critical') }}</option>
      </select>

      <select v-model="filterStatus" class="filter-select">
        <option value="all">{{ t('poi.filter_all_statuses') }}</option>
        <option value="draft">{{ t('poi.status_draft') }}</option>
        <option value="active">{{ t('poi.status_active') }}</option>
        <option value="expired">{{ t('poi.status_expired') }}</option>
        <option value="inactive">{{ t('poi.status_inactive') }}</option>
        <option value="archived">{{ t('poi.status_archived') }}</option>
      </select>
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
            <th class="col-id">{{ t('poi.col_id') }}</th>
            <th class="col-name">{{ t('poi.col_name') }}</th>
            <th class="col-type">{{ t('poi.col_type') }}</th>
            <th class="col-threat">{{ t('poi.col_threat') }}</th>
            <th class="col-sites">{{ t('poi.col_sites') }}</th>
            <th class="col-status">{{ t('poi.col_status') }}</th>
            <th class="col-expiry">{{ t('poi.col_expiry') }}</th>
            <th class="col-updated">{{ t('poi.col_updated') }}</th>
            <th class="col-actions">{{ t('poi.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRecords.length === 0">
            <td colspan="10" class="empty-row">
              <div class="empty-state">
                <Icon name="lucide:shield-off" :size="32" class="empty-state__icon" />
                <p>{{ t('poi.empty') }}</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="record in filteredRecords"
            :key="record.id"
            class="poi-row"
            @click="navigateToDetail(record.id)"
          >
            <td class="col-photo">
              <div v-if="record.photoUrl" class="photo-thumb">
                <img :src="record.photoUrl" :alt="record.firstName" />
              </div>
              <div v-else class="photo-placeholder">
                <Icon name="lucide:image" :size="25" />
              </div>
            </td>
            <td class="col-id">
              <span class="record-id">{{ record.id }}</span>
            </td>
            <td class="col-name">
              <span class="record-name">{{ record.firstName }} {{ record.lastName }}</span>
            </td>
            <td class="col-type">
              <Badge type="poiType" :value="record.type" />
            </td>
            <td class="col-threat">
              <Badge type="poiThreat" :value="record.threatLevel" />
            </td>
            <td class="col-sites">
              <span class="sites-list">{{ record.sites.join(', ') }}</span>
            </td>
            <td class="col-status">
              <Badge type="poiStatus" :value="record.status" />
            </td>
            <td class="col-expiry">
              <span
                v-if="record.expiryDate"
                class="expiry-date"
                :class="{
                  'expiry-date--warning': isExpiringSoon(record.expiryDate),
                  'expiry-date--expired': isExpired(record.expiryDate),
                }"
              >
                {{ formatDate(record.expiryDate) }}
              </span>
              <span v-else class="expiry-na">—</span>
            </td>
            <td class="col-updated">
              <span class="updated-date">{{ formatDate(record.lastUpdated) }}</span>
            </td>
            <td class="col-actions" @click.stop>
              <div class="action-group">
                <button class="action-btn action-btn--icon" :title="t('common.view')" @click="navigateToDetail(record.id)">
                  <Icon name="lucide:eye" :size="14" />
                </button>
                <button class="action-btn action-btn--icon" :title="t('common.edit')" @click.stop="navigateToEdit(record.id)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button
                  v-if="record.status === 'active'"
                  class="action-btn action-btn--icon action-btn--danger"
                  :title="t('poi.action_inactive')"
                  @click.stop="openInactiveModal(record.id)"
                >
                  <Icon name="lucide:ban" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- ── Inactive Modal ── -->
  <Teleport to="body">
    <div v-if="inactiveTargetId" class="modal-overlay" @click.self="closeInactiveModal">
      <div class="modal">
        <div class="modal__header">
          <Icon name="lucide:ban" :size="18" class="modal__icon--danger" />
          <h3 class="modal__title">{{ t('poi.modal_inactive_title') }}</h3>
        </div>
        <div class="modal__body">
          <p class="modal__desc">{{ t('poi.modal_inactive_desc') }}</p>
          <div class="form-field" :class="{ 'form-field--error': inactiveReasonError }">
            <label class="form-field__label">{{ t('poi.modal_inactive_reason') }} <span class="req">*</span></label>
            <textarea
              v-model="inactiveReason"
              class="form-field__textarea"
              rows="3"
              :placeholder="t('poi.modal_inactive_reason_placeholder')"
            />
            <span v-if="inactiveReasonError" class="field-error">{{ inactiveReasonError }}</span>
          </div>
        </div>
        <div class="modal__footer">
          <button class="btn-cancel" @click="closeInactiveModal">{{ t('common.cancel') }}</button>
          <button class="btn-danger-solid" :disabled="isInactivating" @click="confirmInactive">
            <Icon v-if="isInactivating" name="lucide:loader-2" :size="14" class="spin" />
            {{ t('poi.modal_inactive_confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Layout ── */
.poi-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
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
  flex-shrink: 0;
}

.btn-primary:hover {
  opacity: 0.88;
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
.col-photo  { width: 44px; }
.col-id     { width: 90px; }
.col-type   { width: 140px; }
.col-threat { width: 100px; }
.col-status { width: 100px; }
.col-expiry { width: 120px; }
.col-updated { width: 120px; }
.col-actions { width: 100px; text-align: right; }

/* ── Photo ── */
.photo-thumb {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* ── Text cells ── */
.record-id {
  font-family: monospace;
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
}

.record-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.sites-list {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.updated-date {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

/* ── Type badges ── */
.type-badge {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}

.type-badge--poi {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.type-badge--trespass {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}

.type-badge--metro_red_card {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* ── Threat badges ── */
.threat-badge {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}

.threat-badge--low {
  background: var(--color-bg-overlay);
  color: var(--color-text-muted);
}

.threat-badge--medium {
  background: rgba(234, 179, 8, 0.15);
  color: #ca8a04;
}

.threat-badge--high {
  background: rgba(249, 115, 22, 0.15);
  color: #ea580c;
}

.threat-badge--critical {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* ── Status badges ── */
.status-badge {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}

.status-badge--draft {
  background: var(--color-bg-overlay);
  color: var(--color-text-muted);
}

.status-badge--active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge--expired {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-badge--inactive {
  background: rgba(139, 92, 246, 0.12);
  color: #a78bfa;
}

.status-badge--archived {
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
}

/* ── Expiry ── */
.expiry-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.expiry-date--warning {
  color: #ca8a04;
  font-weight: 600;
}

.expiry-date--expired {
  color: #ef4444;
  font-weight: 600;
}

.expiry-na {
  color: var(--color-text-muted);
}

/* ── Actions ── */
.action-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  text-decoration: none;
}

.action-btn--icon {
  padding: var(--space-1);
  width: 28px;
  height: 28px;
  justify-content: center;
}

.action-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.action-btn--danger:hover {
  border-color: var(--color-critical);
  color: var(--color-critical);
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

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 440px;
  max-width: calc(100vw - var(--space-8));
}

.modal__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.modal__icon--danger { color: var(--color-critical, #ef4444); }

.modal__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal__body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
}

.form-field { display: flex; flex-direction: column; gap: var(--space-1); }
.form-field__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-secondary); }
.form-field__textarea {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-base);
  font-family: var(--font-family);
}
.form-field__textarea:focus { border-color: var(--color-accent); }
.form-field--error .form-field__textarea { border-color: var(--color-critical); }
.field-error { font-size: var(--font-size-xs); color: var(--color-critical); }
.req { color: var(--color-critical); }

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

.btn-danger-solid {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-critical, #ef4444);
  border: none;
  color: white;
  transition: opacity var(--transition-base);
}
.btn-danger-solid:hover { opacity: 0.88; }
.btn-danger-solid:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Spin animation ── */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
