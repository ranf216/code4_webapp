<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

type RecordType = 'poi' | 'trespass' | 'metro_red_card'
type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'
type RecordStatus = 'draft' | 'active' | 'expired' | 'inactive' | 'archived'

interface VersionEntry {
  version: number
  changedBy: string
  changedAt: string
  summary: string
}

interface POIRecord {
  id: string
  type: RecordType
  firstName: string
  lastName: string
  aliases?: string
  dateOfBirth?: string
  gender?: string
  physicalDescription?: string
  summary: string
  internalNotes?: string
  photos: string[]
  sites: string[]
  threatLevel: ThreatLevel
  status: RecordStatus
  relatedIncidentIds?: string
  expiryDate?: string
  issueDate?: string
  lastUpdated: string
  createdAt: string
  createdBy: string
  // POI only
  incidentHistorySummary?: string
  watchLevelReviewDate?: string
  associatedIndividuals?: string
  // Trespass only
  trespassNoticeNumber?: string
  trespassIssuingAuthority?: string
  propertyAreaCovered?: string
  trespassRenewalReminder?: number
  lawEnforcementContact?: string
  conditions?: string
  // Metro only
  redCardNumber?: string
  metroIssuingAuthority?: string
  metroLines?: string
  metroRenewalReminder?: number
}

const { t } = useTranslation()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)

const loading = ref(true)
const record = ref<POIRecord | null>(null)
const showVersionHistory = ref(false)
const showInactiveModal = ref(false)
const inactiveReason = ref('')
const inactiveReasonError = ref('')
const isInactivating = ref(false)
const inactiveSuccess = ref(false)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const showExportModal = ref(false)
const isExporting = ref(false)
const exportSuccess = ref(false)
const exportLog = ref<{ exportedBy: string; exportedAt: string }[]>([])

const DEMO_RECORD: POIRecord = {
  id: String(route.params.id),
  type: 'trespass',
  firstName: 'Jane',
  lastName: 'Smith',
  aliases: 'Jenny S, J. Smith',
  dateOfBirth: '1988-04-15',
  gender: 'female',
  physicalDescription: 'Approximately 165cm, medium build, dark brown hair, usually wears glasses.',
  summary: 'Subject issued formal trespass notice following repeated unauthorised access to South Plaza. Officers should detain and contact law enforcement if found on property.',
  internalNotes: 'Second offence. Previously warned in Jan 2026. Law enforcement case reference: CASE-2026-0491.',
  photos: [
    'https://picsum.photos/seed/ti002a/400/400',
    'https://picsum.photos/seed/ti002b/400/400',
    'https://picsum.photos/seed/ti002c/400/400',
  ],
  sites: ['South Plaza', 'Central Hub'],
  threatLevel: 'medium',
  status: 'active',
  relatedIncidentIds: 'INC-2026-041, INC-2026-088',
  issueDate: '2026-04-01',
  expiryDate: '2026-07-15',
  trespassNoticeNumber: 'TN-2026-0192',
  trespassIssuingAuthority: 'City Security Authority',
  propertyAreaCovered: 'South Plaza levels G-3, Central Hub main entrance',
  trespassRenewalReminder: 14,
  lawEnforcementContact: 'Sgt. R. Thompson — City Police, ph: 0400 000 111',
  conditions: 'Subject is not to enter or remain on property. Officers have authority to detain pending police arrival.',
  lastUpdated: '2026-06-18T08:15:00Z',
  createdAt: '2026-04-01T10:00:00Z',
  createdBy: 'Manager A. Johnson',
}

const DEMO_VERSIONS: VersionEntry[] = [
  { version: 3, changedBy: 'A. Johnson', changedAt: '2026-06-18T08:15:00Z', summary: 'Updated summary and conditions text.' },
  { version: 2, changedBy: 'A. Johnson', changedAt: '2026-05-10T14:30:00Z', summary: 'Added related incident INC-2026-088.' },
  { version: 1, changedBy: 'A. Johnson', changedAt: '2026-04-01T10:00:00Z', summary: 'Record created and published.' },
]

onMounted(() => {
  setTimeout(() => {
    record.value = DEMO_RECORD
    loading.value = false
  }, 300)
})

function goBack() {
  router.push('/poi')
}

function goEdit() {
  router.push(`/poi/${route.params.id}/edit`)
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

function openInactiveModal() {
  inactiveReason.value = ''
  inactiveReasonError.value = ''
  showInactiveModal.value = true
}

function confirmInactive() {
  if (!inactiveReason.value.trim()) {
    inactiveReasonError.value = t('validation.required')
    return
  }
  isInactivating.value = true
  console.log('[POIDetail] Inactive record', route.params.id, 'reason:', inactiveReason.value)
  setTimeout(() => {
    if (record.value) {
      record.value = { ...record.value, status: 'inactive' }
    }
    isInactivating.value = false
    inactiveSuccess.value = true
    showInactiveModal.value = false
    setTimeout(() => { inactiveSuccess.value = false }, 4000)
  }, 600)
}

function handleExport() {
  showExportModal.value = true
}

function confirmExport() {
  isExporting.value = true
  const adminName = authStore.user ? `${authStore.user.first_name} ${authStore.user.last_name}`.trim() : 'Admin'
  const exportedAt = new Date().toISOString()
  console.log('[POIDetail] Export PDF', route.params.id, { exportedBy: adminName, exportedAt })
  setTimeout(() => {
    exportLog.value.unshift({ exportedBy: adminName, exportedAt })
    isExporting.value = false
    showExportModal.value = false
    exportSuccess.value = true
    setTimeout(() => { exportSuccess.value = false }, 4000)
  }, 800)
}
</script>

<template>
  <div class="poi-detail">
    <!-- Loading -->
    <div v-if="loading" class="poi-detail__loading">
      <Icon name="lucide:loader-2" :size="28" class="spin" />
    </div>

    <template v-else-if="record">
      <!-- ── Page Header ── -->
      <div class="poi-detail__page-header">
        <button class="back-btn" @click="goBack">
          <Icon name="lucide:arrow-left" :size="16" />
        </button>
        <div class="poi-detail__breadcrumb">
          <span class="breadcrumb-link" @click="goBack">{{ t('poi.title') }}</span>
          <Icon name="lucide:chevron-right" :size="14" class="breadcrumb-sep" />
          <span>{{ record.firstName }} {{ record.lastName }}</span>
        </div>
        <div class="poi-detail__header-actions">
          <button
            v-if="record.status === 'active'"
            class="btn-secondary btn-danger"
            @click="openInactiveModal"
          >
            <Icon name="lucide:ban" :size="15" />
            {{ t('poi.action_inactive') }}
          </button>
          <button v-if="isAdmin" class="btn-secondary" @click="handleExport">
            <Icon name="lucide:download" :size="15" />
            {{ t('poi.action_export') }}
          </button>
          <button class="btn-primary" @click="goEdit">
            <Icon name="lucide:pencil" :size="15" />
            {{ t('common.edit') }}
          </button>
        </div>
      </div>

      <!-- ── Banners ── -->
      <div v-if="inactiveSuccess" class="status-banner status-banner--ok">
        <Icon name="lucide:check-circle-2" :size="16" />
        {{ t('poi.modal_inactive_success') }}
      </div>
      <div v-if="exportSuccess" class="status-banner status-banner--info">
        <Icon name="lucide:file-check" :size="16" />
        {{ t('poi.export_success') }}
      </div>

      <!-- ── Hero card ── -->
      <div class="poi-detail__body">
        <div class="hero-card">
          <div class="hero-card__left">
            <div v-if="record.photos.length" class="hero-avatar hero-avatar--photo">
              <img :src="record.photos[0]" :alt="record.firstName" />
            </div>
            <div v-else class="hero-avatar hero-avatar--initials">
              {{ getInitials(record) }}
            </div>
          </div>
          <div class="hero-card__info">
            <div class="hero-card__name">{{ record.firstName }} {{ record.lastName }}</div>
            <div v-if="record.aliases" class="hero-card__aliases">aka {{ record.aliases }}</div>
            <div class="hero-card__badges">
              <span class="type-badge" :class="`type-badge--${record.type}`">
                {{ record.type === 'poi' ? t('poi.type_poi') : record.type === 'trespass' ? t('poi.type_trespass') : t('poi.type_metro') }}
              </span>
              <span class="threat-badge" :class="`threat-badge--${record.threatLevel}`">
                {{ t(`poi.threat_${record.threatLevel}`) }}
              </span>
              <span class="status-badge" :class="`status-badge--${record.status}`">
                {{ t(`poi.status_${record.status}`) }}
              </span>
            </div>
            <div class="hero-card__meta">
              <span><strong>{{ t('poi.col_id') }}:</strong> {{ record.id }}</span>
              <span><strong>{{ t('poi.col_updated') }}:</strong> {{ formatDateTime(record.lastUpdated) }}</span>
              <span><strong>{{ t('poi.detail_created_by') }}:</strong> {{ record.createdBy }}, {{ formatDate(record.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- ── Photos strip ── -->
        <div v-if="record.photos.length" class="section-card">
          <div class="section-card__header">
            <Icon name="lucide:image" :size="15" />
            <h3 class="section-card__title">{{ t('poi.section_photos') }}</h3>
          </div>
          <div class="photo-strip">
            <button
              v-for="(url, idx) in record.photos"
              :key="idx"
              class="photo-thumb"
              @click="lightboxIndex = idx; lightboxOpen = true"
            >
              <img :src="url" :alt="`Photo ${idx + 1}`" />
            </button>
          </div>
        </div>

        <!-- ── 2-column detail layout ── -->
        <div class="detail-columns">
          <!-- Left column -->
          <div class="detail-col">
            <!-- Basic Info -->
            <div class="section-card">
              <div class="section-card__header">
                <Icon name="lucide:user" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_basic_info') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_dob') }}</span>
                  <span class="kv-value">{{ formatDate(record.dateOfBirth) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_gender') }}</span>
                  <span class="kv-value">{{ record.gender ? t(`poi.gender_${record.gender}`) : '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_aliases') }}</span>
                  <span class="kv-value">{{ record.aliases || '—' }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_physical_desc') }}</span>
                  <span class="kv-value">{{ record.physicalDescription || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="section-card">
              <div class="section-card__header">
                <Icon name="lucide:file-text" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_summary') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_summary') }}</span>
                  <span class="kv-value kv-value--paragraph">{{ record.summary }}</span>
                </div>
                <div v-if="record.internalNotes" class="kv-row kv-row--full">
                  <span class="kv-label kv-label--internal">
                    <Icon name="lucide:lock" :size="11" />
                    {{ t('poi.field_internal_notes') }}
                  </span>
                  <span class="kv-value kv-value--paragraph kv-value--internal">{{ record.internalNotes }}</span>
                </div>
                <div v-if="record.relatedIncidentIds" class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_related_incidents') }}</span>
                  <span class="kv-value">{{ record.relatedIncidentIds }}</span>
                </div>
              </div>
            </div>

            <!-- Trespass Details -->
            <div v-if="record.type === 'trespass'" class="section-card section-card--trespass">
              <div class="section-card__header">
                <Icon name="lucide:ban" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_trespass_details') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_notice_number') }}</span>
                  <span class="kv-value kv-value--mono">{{ record.trespassNoticeNumber || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issuing_authority') }}</span>
                  <span class="kv-value">{{ record.trespassIssuingAuthority || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issue_date') }}</span>
                  <span class="kv-value">{{ formatDate(record.issueDate) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_expiry_date') }}</span>
                  <span
                    class="kv-value"
                    :class="{
                      'kv-value--warning': isExpiringSoon(record.expiryDate),
                      'kv-value--danger': isExpired(record.expiryDate),
                    }"
                  >
                    {{ formatDate(record.expiryDate) }}
                    <span v-if="isExpiringSoon(record.expiryDate)" class="expiry-pill expiry-pill--warning">Expiring soon</span>
                    <span v-if="isExpired(record.expiryDate)" class="expiry-pill expiry-pill--danger">Expired</span>
                  </span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_property_area') }}</span>
                  <span class="kv-value">{{ record.propertyAreaCovered || '—' }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_conditions') }}</span>
                  <span class="kv-value kv-value--paragraph">{{ record.conditions || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_law_enforcement') }}</span>
                  <span class="kv-value">{{ record.lawEnforcementContact || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_renewal_reminder') }}</span>
                  <span class="kv-value">{{ record.trespassRenewalReminder }} {{ t('poi.days_before_expiry') }}</span>
                </div>
              </div>
            </div>

            <!-- POI Details -->
            <div v-if="record.type === 'poi'" class="section-card section-card--poi">
              <div class="section-card__header">
                <Icon name="lucide:user-search" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_poi_details') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_watch_review_date') }}</span>
                  <span class="kv-value">{{ formatDate(record.watchLevelReviewDate) }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_associated_individuals') }}</span>
                  <span class="kv-value">{{ record.associatedIndividuals || '—' }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_incident_history') }}</span>
                  <span class="kv-value kv-value--paragraph">{{ record.incidentHistorySummary || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Metro Details -->
            <div v-if="record.type === 'metro_red_card'" class="section-card section-card--metro">
              <div class="section-card__header">
                <Icon name="lucide:train-front" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_metro_details') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_red_card_number') }}</span>
                  <span class="kv-value kv-value--mono">{{ record.redCardNumber || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issuing_authority') }}</span>
                  <span class="kv-value">{{ record.metroIssuingAuthority || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issue_date') }}</span>
                  <span class="kv-value">{{ formatDate(record.issueDate) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_expiry_date') }}</span>
                  <span
                    class="kv-value"
                    :class="{
                      'kv-value--warning': isExpiringSoon(record.expiryDate),
                      'kv-value--danger': isExpired(record.expiryDate),
                    }"
                  >
                    {{ formatDate(record.expiryDate) }}
                  </span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_metro_lines') }}</span>
                  <span class="kv-value">{{ record.metroLines || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_renewal_reminder') }}</span>
                  <span class="kv-value">{{ record.metroRenewalReminder }} {{ t('poi.days_before_expiry') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right column -->
          <div class="detail-col detail-col--sidebar">
            <!-- Threat & Sites -->
            <div class="section-card">
              <div class="section-card__header">
                <Icon name="lucide:shield-alert" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_threat_sites') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_threat_level') }}</span>
                  <span class="threat-badge" :class="`threat-badge--${record.threatLevel}`">
                    {{ t(`poi.threat_${record.threatLevel}`) }}
                  </span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_sites') }}</span>
                  <div class="site-tags">
                    <span v-for="site in record.sites" :key="site" class="site-tag">{{ site }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Log (admin only) -->
              <div v-if="isAdmin && exportLog.length" class="section-card">
                <div class="section-card__header">
                  <Icon name="lucide:clipboard-list" :size="15" />
                  <h3 class="section-card__title">{{ t('poi.export_log') }}</h3>
                </div>
                <div class="version-list">
                  <div v-for="(entry, i) in exportLog" :key="i" class="version-row">
                    <div class="version-row__top">
                      <Icon name="lucide:download" :size="12" class="export-log-icon" />
                      <span class="version-by">{{ entry.exportedBy }}</span>
                      <span class="version-at">{{ formatDateTime(entry.exportedAt) }}</span>
                    </div>
                    <p class="version-summary">PDF exported — CONFIDENTIAL</p>
                  </div>
                </div>
              </div>

            <!-- Version History -->
            <div class="section-card">
              <div class="section-card__header section-card__header--clickable" @click="showVersionHistory = !showVersionHistory">
                <Icon name="lucide:history" :size="15" />
                <h3 class="section-card__title">{{ t('poi.version_history') }}</h3>
                <Icon :name="showVersionHistory ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="15" class="collapse-icon" />
              </div>
              <div v-if="showVersionHistory" class="version-list">
                <div v-for="entry in DEMO_VERSIONS" :key="entry.version" class="version-row">
                  <div class="version-row__top">
                    <span class="version-badge">v{{ entry.version }}</span>
                    <span class="version-by">{{ entry.changedBy }}</span>
                    <span class="version-at">{{ formatDateTime(entry.changedAt) }}</span>
                  </div>
                  <p class="version-summary">{{ entry.summary }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="poi-detail__not-found">
      <Icon name="lucide:shield-off" :size="36" class="not-found-icon" />
      <p>Record not found.</p>
      <button class="btn-secondary" @click="goBack">{{ t('common.back') }}</button>
    </div>

    <!-- ── Export Confirmation Modal ── -->
    <Teleport to="body">
      <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
        <div class="modal">
          <div class="modal__header">
            <Icon name="lucide:file-down" :size="18" class="modal__header-icon modal__header-icon--info" />
            <h3 class="modal__title">{{ t('poi.modal_export_title') }}</h3>
          </div>
          <div class="modal__body">
            <div class="export-info-block">
              <div class="export-info-row">
                <Icon name="lucide:shield-alert" :size="14" />
                <span>{{ t('poi.modal_export_watermark') }}</span>
              </div>
              <div class="export-info-row">
                <Icon name="lucide:image" :size="14" />
                <span>{{ t('poi.modal_export_includes') }}</span>
              </div>
              <div class="export-info-row export-info-row--warn">
                <Icon name="lucide:lock" :size="14" />
                <span>{{ t('poi.modal_export_excludes') }}</span>
              </div>
              <div class="export-info-row">
                <Icon name="lucide:clipboard-list" :size="14" />
                <span>{{ t('poi.modal_export_logged') }}</span>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn-cancel" @click="showExportModal = false">{{ t('common.cancel') }}</button>
            <button class="btn-export" :disabled="isExporting" @click="confirmExport">
              <Icon v-if="isExporting" name="lucide:loader-2" :size="14" class="spin" />
              <Icon v-else name="lucide:download" :size="14" />
              {{ t('poi.modal_export_confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Inactive Confirmation Modal ── -->
    <Teleport to="body">
      <div v-if="showInactiveModal" class="modal-overlay" @click.self="showInactiveModal = false">
        <div class="modal">
          <div class="modal__header">
            <Icon name="lucide:ban" :size="18" class="modal__header-icon modal__header-icon--danger" />
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
            <button class="btn-cancel" @click="showInactiveModal = false">{{ t('common.cancel') }}</button>
            <button class="btn-danger-solid" :disabled="isInactivating" @click="confirmInactive">
              <Icon v-if="isInactivating" name="lucide:loader-2" :size="14" class="spin" />
              {{ t('poi.modal_inactive_confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Lightbox ── -->
    <PhotoLightbox
      v-if="lightboxOpen && record"
      :photos="record.photos"
      :start-index="lightboxIndex"
      @close="lightboxOpen = false"
    />
  </div>
</template>

<style scoped>
/* ── Layout ── */
.poi-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.poi-detail__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
}

/* ── Page header ── */
.poi-detail__page-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  flex-shrink: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-base);
}
.back-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

.poi-detail__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  flex: 1;
}
.breadcrumb-link { cursor: pointer; }
.breadcrumb-link:hover { color: var(--color-accent); text-decoration: underline; }
.breadcrumb-sep { opacity: 0.5; }

.poi-detail__header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── Buttons ── */
.btn-primary, .btn-secondary, .btn-cancel, .btn-danger-solid {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}
.btn-primary {
  background: var(--color-accent);
  border: none;
  color: white;
}
.btn-primary:hover { opacity: 0.88; }

.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.btn-secondary:hover { border-color: var(--color-accent); color: var(--color-accent); }

.btn-danger {
  border-color: var(--color-critical) !important;
  color: var(--color-critical) !important;
}
.btn-danger:hover { background: rgba(239, 68, 68, 0.08) !important; }

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.btn-cancel:hover { border-color: var(--color-text-secondary); color: var(--color-text-primary); }

.btn-danger-solid {
  background: var(--color-critical, #ef4444);
  border: none;
  color: white;
}
.btn-danger-solid:hover { opacity: 0.88; }

/* ── Body ── */
.poi-detail__body {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ── Hero card ── */
.hero-card {
  display: flex;
  gap: var(--space-5);
  align-items: flex-start;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.hero-avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  overflow: hidden;
}

.hero-avatar--photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-avatar--initials {
  background: linear-gradient(135deg, #1196ad 0%, #576bcf 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: white;
}

.hero-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-card__name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.hero-card__aliases {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.hero-card__badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.hero-card__meta {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

/* ── Columns ── */
.detail-columns {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-5);
  align-items: start;
}

.detail-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ── Section cards ── */
.section-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-card--poi     { border-color: rgba(139, 92, 246, 0.35); }
.section-card--trespass { border-color: rgba(249, 115, 22, 0.35); }
.section-card--metro   { border-color: rgba(239, 68, 68, 0.35); }

.section-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.section-card__header--clickable {
  cursor: pointer;
  user-select: none;
}
.section-card__header--clickable:hover { background: var(--color-bg-overlay); }

.section-card__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.collapse-icon { color: var(--color-text-muted); margin-left: auto; }

/* ── KV Grid ── */
.kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: var(--space-4);
  gap: var(--space-3) var(--space-4);
}

.kv-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.kv-row--full { grid-column: 1 / -1; }

.kv-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.kv-label--internal { color: var(--color-text-muted); }

.kv-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.kv-value--paragraph {
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.kv-value--internal {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
}

.kv-value--mono { font-family: monospace; }

.kv-value--warning { color: #ca8a04; font-weight: 600; }
.kv-value--danger  { color: #ef4444; font-weight: 600; }

/* ── Expiry pill ── */
.expiry-pill {
  display: inline-block;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  margin-left: var(--space-2);
}
.expiry-pill--warning { background: rgba(234,179,8,0.15); color: #ca8a04; }
.expiry-pill--danger  { background: rgba(239,68,68,0.15); color: #ef4444; }

/* ── Photo strip ── */
.photo-strip {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  flex-wrap: wrap;
}

.photo-thumb {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  cursor: pointer;
  background: none;
  padding: 0;
  transition: opacity var(--transition-base);
}
.photo-thumb:hover { opacity: 0.85; }
.photo-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* ── Site tags ── */
.site-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: 2px; }
.site-tag {
  padding: 3px var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* ── Version History ── */
.version-list {
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.version-row {
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.version-row__top {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.version-badge {
  font-size: var(--font-size-sm);
  font-weight: 700;
  background: var(--color-accent);
  color: white;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.version-by {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.version-at {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-left: auto;
}

.version-summary {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Not found ── */
.poi-detail__not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  height: 100%;
  color: var(--color-text-muted);
}
.not-found-icon { opacity: 0.3; }

/* ── Badges ── */
.type-badge {
  display: inline-block;
  padding: 3px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: 600;
}
.type-badge--poi         { background: rgba(139,92,246,0.15); color: #8b5cf6; }
.type-badge--trespass    { background: rgba(249,115,22,0.15); color: #f97316; }
.type-badge--metro_red_card { background: rgba(239,68,68,0.15); color: #ef4444; }

.threat-badge {
  display: inline-block;
  padding: 3px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: 600;
}
.threat-badge--low      { background: var(--color-bg-overlay); color: var(--color-text-muted); }
.threat-badge--medium   { background: rgba(234,179,8,0.15); color: #ca8a04; }
.threat-badge--high     { background: rgba(249,115,22,0.15); color: #ea580c; }
.threat-badge--critical { background: rgba(239,68,68,0.15); color: #ef4444; }

.status-badge {
  display: inline-block;
  padding: 3px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: 600;
}
.status-badge--draft    { background: var(--color-bg-overlay); color: var(--color-text-muted); }
.status-badge--active   { background: rgba(34,197,94,0.15); color: #22c55e; }
.status-badge--expired  { background: rgba(239,68,68,0.15); color: #ef4444; }
.status-badge--inactive { background: rgba(139,92,246,0.12); color: #a78bfa; }
.status-badge--archived { background: var(--color-bg-elevated); color: var(--color-text-muted); }

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

.modal__header-icon--danger { color: var(--color-critical, #ef4444); }

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

/* ── Form fields in modal ── */
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
}
.form-field__textarea:focus { border-color: var(--color-accent); }
.form-field--error .form-field__textarea { border-color: var(--color-critical); }
.field-error { font-size: var(--font-size-xs); color: var(--color-critical); }
.req { color: var(--color-critical); }


/* ── Status banners ── */
.status-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid transparent;
  font-size: var(--font-size-sm);
  font-weight: 500;
  flex-shrink: 0;
}
.status-banner--ok {
  background: var(--color-ok-bg);
  border-color: rgba(34, 197, 94, 0.25);
  color: var(--color-ok);
}
.status-banner--info {
  background: var(--color-info-bg);
  border-color: rgba(50, 179, 230, 0.25);
  color: var(--color-info);
}

/* ── Export info block ── */
.export-info-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.export-info-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.export-info-row--warn { color: var(--color-warn); }

/* ── Export button ── */
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-accent);
  border: none;
  color: white;
  transition: opacity var(--transition-base);
}
.btn-export:hover { opacity: 0.88; }
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Export log icon ── */
.export-log-icon { color: var(--color-info); }

/* ── Modal header info icon ── */
.modal__header-icon--info { color: var(--color-info); }

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
