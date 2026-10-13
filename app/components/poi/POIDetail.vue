<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppButton from '~/components/AppButton.vue'
import AppDialogModal from '~/components/AppDialogModal.vue'
import Badge from '~/components/Badge.vue'
import CallDetailsModal from '~/components/calls/CallDetailsModal.vue'
import { poiApi } from '~/api/poi'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import type { PoiRecord } from '~/api/types/poi'

const { t } = useTranslation()
const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

const recordId = computed(() => {
  const id = Number(route.params.id)
  return Number.isNaN(id) ? 0 : id
})

const loading = ref(true)
const loadError = ref('')
const record = ref<PoiRecord | null>(null)

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const showInactiveModal = ref(false)
const inactiveReason = ref('')
const inactiveReasonError = ref('')
const isInactivating = ref(false)

const showArchiveModal = ref(false)
const isArchiving = ref(false)

const isPublishing = ref(false)
const isExporting = ref(false)

const showCallModal = ref(false)
const selectedCall = ref<any | null>(null)

const canEdit = computed(() => record.value?.status === 'draft' || record.value?.status === 'active')
const canPublish = computed(() => record.value?.status === 'draft')
const canInactivate = computed(() => record.value?.status === 'active')
const canArchive = computed(() => record.value?.status === 'expired' || record.value?.status === 'inactive')

const photoUrls = computed(() => record.value?.photos?.map(p => p.url) ?? [])

onMounted(async () => {
  if (!recordId.value) {
    loadError.value = t('poi.record_not_found')
    loading.value = false
    return
  }
  loading.value = true
  try {
    const response = await poiApi.getPoiRecord(recordId.value)
    record.value = response.record
  } catch (err) {
    console.error('Failed to load POI record:', err)
    loadError.value = err instanceof Error ? err.message : 'Failed to load record'
    toastStore.error(loadError.value)
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.push('/poi')
}

function goEdit() {
  router.push(`/poi/${recordId.value}/edit`)
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const local = utcToLocal(value)
  return local.isValid() ? local.format('DD MMM YYYY') : '—'
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const local = utcToLocal(value)
  return local.isValid() ? local.format('DD MMM YYYY HH:mm') : '—'
}

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`)
}

function isExpired(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return parseLocalDate(dateStr).getTime() < new Date().setHours(0, 0, 0, 0)
}

function isExpiringSoon(dateStr: string | null | undefined): boolean {
  if (!dateStr || isExpired(dateStr)) return false
  const soon = new Date()
  soon.setDate(soon.getDate() + 14)
  soon.setHours(0, 0, 0, 0)
  return parseLocalDate(dateStr).getTime() <= soon.getTime()
}

function getInitials(r: PoiRecord): string {
  return ((r.first_name[0] ?? '') + (r.last_name[0] ?? '')).toUpperCase()
}

const historyEntries = computed(() => {
  const entries: { label: string; value: string }[] = []
  if (!record.value) return entries
  if (record.value.created_by_name && record.value.created_on) {
    entries.push({
      label: t('poi.history_created'),
      value: `${record.value.created_by_name} — ${formatDateTime(record.value.created_on)}`,
    })
  }
  if (record.value.approved_by_name && record.value.approved_on) {
    entries.push({
      label: t('poi.history_approved'),
      value: `${record.value.approved_by_name} — ${formatDateTime(record.value.approved_on)}`,
    })
  }
  if (record.value.last_update) {
    entries.push({
      label: t('poi.history_updated'),
      value: formatDateTime(record.value.last_update),
    })
  }
  return entries
})

async function handlePublish() {
  if (!record.value) return
  isPublishing.value = true
  try {
    await poiApi.publishPoiRecord(record.value.record_id)
    toastStore.success(t('poi.publish_success'))
    const refreshed = await poiApi.getPoiRecord(record.value.record_id)
    record.value = refreshed.record
  } catch (err) {
    console.error('Failed to publish POI record:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to publish record')
  } finally {
    isPublishing.value = false
  }
}

function openInactiveModal() {
  inactiveReason.value = ''
  inactiveReasonError.value = ''
  showInactiveModal.value = true
}

function closeInactiveModal() {
  showInactiveModal.value = false
  inactiveReason.value = ''
  inactiveReasonError.value = ''
}

async function confirmInactive() {
  if (!inactiveReason.value.trim()) {
    inactiveReasonError.value = t('validation.required')
    return
  }
  if (!record.value) return
  isInactivating.value = true
  try {
    await poiApi.inactivatePoiRecord(record.value.record_id, inactiveReason.value.trim())
    toastStore.success(t('poi.modal_inactive_success'))
    closeInactiveModal()
    const refreshed = await poiApi.getPoiRecord(record.value.record_id)
    record.value = refreshed.record
  } catch (err) {
    console.error('Failed to inactivate POI record:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to inactivate record')
  } finally {
    isInactivating.value = false
  }
}

function openArchiveModal() {
  showArchiveModal.value = true
}

function closeArchiveModal() {
  showArchiveModal.value = false
}

async function confirmArchive() {
  if (!record.value) return
  isArchiving.value = true
  try {
    await poiApi.archivePoiRecord(record.value.record_id)
    toastStore.success(t('poi.archive_success'))
    closeArchiveModal()
    const refreshed = await poiApi.getPoiRecord(record.value.record_id)
    record.value = refreshed.record
  } catch (err) {
    console.error('Failed to archive POI record:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to archive record')
  } finally {
    isArchiving.value = false
  }
}

async function handleExport() {
  if (!record.value) return
  isExporting.value = true
  try {
    const response = await poiApi.exportPoiRecord(record.value.record_id)
    if (response.file_url) {
      window.open(response.file_url, '_blank')
    }
    toastStore.success(t('poi.export_success'))
  } catch (err) {
    console.error('Failed to export POI record:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to export record')
  } finally {
    isExporting.value = false
  }
}

function nextLightbox() {
  if (!photoUrls.value.length) return
  lightboxIndex.value = (lightboxIndex.value + 1) % photoUrls.value.length
}

function prevLightbox() {
  if (!photoUrls.value.length) return
  lightboxIndex.value = (lightboxIndex.value - 1 + photoUrls.value.length) % photoUrls.value.length
}

function openCallDetails(callId: number) {
  selectedCall.value = { id: String(callId) }
  showCallModal.value = true
}

function closeCallDetails() {
  showCallModal.value = false
  selectedCall.value = null
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
          <span>{{ record.first_name }} {{ record.last_name }}</span>
        </div>
        <div class="poi-detail__header-actions">
          <AppButton
            v-if="canPublish"
            :text="t('poi.publish')"
            icon="lucide:send"
            type="secondary"
            size="sm"
            :loading="isPublishing"
            @click="handlePublish"
          />
          <AppButton
            v-if="canInactivate"
            :text="t('poi.action_inactive')"
            icon="lucide:ban"
            type="danger"
            size="sm"
            :loading="isInactivating"
            @click="openInactiveModal"
          />
          <AppButton
            v-if="canArchive"
            :text="t('poi.action_archive')"
            icon="lucide:archive"
            type="danger"
            size="sm"
            :loading="isArchiving"
            @click="openArchiveModal"
          />
          <AppButton
            :text="t('poi.action_export')"
            icon="lucide:download"
            type="secondary"
            size="sm"
            :loading="isExporting"
            @click="handleExport"
          />
          <AppButton
            v-if="canEdit"
            :text="t('common.edit')"
            icon="lucide:pencil"
            type="primary"
            size="sm"
            @click="goEdit"
          />
        </div>
      </div>

      <!-- ── Body ── -->
      <div class="poi-detail__body">
        <!-- Hero -->
        <div class="hero-card">
          <div class="hero-card__left">
            <div v-if="photoUrls.length" class="hero-avatar hero-avatar--photo">
              <img :src="photoUrls[0]" :alt="record.first_name" />
            </div>
            <div v-else class="hero-avatar hero-avatar--initials">
              {{ getInitials(record) }}
            </div>
          </div>
          <div class="hero-card__info">
            <div class="hero-card__name">{{ record.first_name }} {{ record.last_name }}</div>
            <div v-if="record.known_aliases" class="hero-card__aliases">aka {{ record.known_aliases }}</div>
            <div class="hero-card__badges">
              <Badge type="poiType" :value="record.record_type" />
              <Badge type="poiThreat" :value="record.threat_level" />
              <Badge type="poiStatus" :value="record.status" />
            </div>
            <div class="hero-card__meta">
              <span><strong>{{ t('poi.col_id') }}:</strong> {{ record.record_id }}</span>
              <span><strong>{{ t('poi.col_updated') }}:</strong> {{ formatDateTime(record.last_update) }}</span>
              <span v-if="record.created_by_name"><strong>{{ t('poi.detail_created_by') }}:</strong> {{ record.created_by_name }}, {{ formatDate(record.created_on) }}</span>
            </div>
          </div>
        </div>

        <!-- Photos strip -->
        <div v-if="photoUrls.length" class="section-card">
          <div class="section-card__header">
            <Icon name="lucide:image" :size="15" />
            <h3 class="section-card__title">{{ t('poi.section_photos') }}</h3>
          </div>
          <div class="photo-strip">
            <button
              v-for="(url, idx) in photoUrls"
              :key="idx"
              class="photo-thumb"
              @click="lightboxIndex = idx; lightboxOpen = true"
            >
              <img :src="url" :alt="`Photo ${idx + 1}`" />
            </button>
          </div>
        </div>

        <!-- Columns -->
        <div class="detail-columns">
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
                  <span class="kv-value">{{ formatDate(record.date_of_birth) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_gender') }}</span>
                  <span class="kv-value">{{ record.gender ? t(`poi.gender_${record.gender}`) : '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_aliases') }}</span>
                  <span class="kv-value">{{ record.known_aliases || '—' }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_physical_desc') }}</span>
                  <span class="kv-value">{{ record.physical_description || '—' }}</span>
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
                  <span class="kv-label">{{ t('poi.field_threat_level') }}</span>
                  <span class="kv-value"><Badge type="poiThreat" :value="record.threat_level" /></span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_summary') }}</span>
                  <span class="kv-value kv-value--paragraph">{{ record.summary }}</span>
                </div>
                <div v-if="record.internal_notes" class="kv-row kv-row--full">
                  <span class="kv-label kv-label--internal">
                    <Icon name="lucide:lock" :size="11" />
                    {{ t('poi.field_internal_notes') }}
                  </span>
                  <span class="kv-value kv-value--paragraph kv-value--internal">{{ record.internal_notes }}</span>
                </div>
                <div v-if="record.related_incidents?.length" class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_related_incidents') }}</span>
                  <div class="kv-value related-incidents">
                    <button
                      v-for="incident in record.related_incidents"
                      :key="incident.incident_link_id"
                      type="button"
                      class="related-incident-link"
                      @click="openCallDetails(incident.call_id)"
                    >
                      #{{ incident.call_id }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trespass Details -->
            <div v-if="record.record_type === 'trespass'" class="section-card section-card--trespass">
              <div class="section-card__header">
                <Icon name="lucide:ban" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_trespass_details') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_notice_number') }}</span>
                  <span class="kv-value kv-value--mono">{{ record.trespass_notice_number || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issuing_authority') }}</span>
                  <span class="kv-value">{{ record.issuing_authority || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issue_date') }}</span>
                  <span class="kv-value">{{ formatDate(record.issue_date) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_expiry_date') }}</span>
                  <span
                    class="kv-value"
                    :class="{
                      'kv-value--warning': isExpiringSoon(record.expiry_date),
                      'kv-value--danger': isExpired(record.expiry_date),
                    }"
                  >
                    {{ formatDate(record.expiry_date) }}
                    <span v-if="isExpiringSoon(record.expiry_date)" class="expiry-pill expiry-pill--warning">Expiring soon</span>
                    <span v-if="isExpired(record.expiry_date)" class="expiry-pill expiry-pill--danger">Expired</span>
                  </span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_property_area') }}</span>
                  <span class="kv-value">{{ record.property_area_covered || '—' }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_conditions') }}</span>
                  <span class="kv-value kv-value--paragraph">{{ record.conditions || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_law_enforcement') }}</span>
                  <span class="kv-value">{{ record.law_enforcement_contact || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_renewal_reminder') }}</span>
                  <span class="kv-value">{{ record.renewal_reminder_days ?? '—' }} {{ t('poi.days_before_expiry') }}</span>
                </div>
                <div v-if="record.notice_document" class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_notice_document') }}</span>
                  <a :href="record.notice_document" target="_blank" class="document-link">{{ t('poi.current_document') }}</a>
                </div>
              </div>
            </div>

            <!-- POI Details -->
            <div v-if="record.record_type === 'poi'" class="section-card section-card--poi">
              <div class="section-card__header">
                <Icon name="lucide:user-search" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_poi_details') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_watch_review_date') }}</span>
                  <span class="kv-value">{{ formatDate(record.watch_level_review_date) }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_associated_individuals') }}</span>
                  <span class="kv-value">{{ record.associated_individuals || '—' }}</span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_incident_history') }}</span>
                  <span class="kv-value kv-value--paragraph">{{ record.incident_history_summary || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Metro Details -->
            <div v-if="record.record_type === 'metro_red_card'" class="section-card section-card--metro">
              <div class="section-card__header">
                <Icon name="lucide:train-front" :size="15" />
                <h3 class="section-card__title">{{ t('poi.section_metro_details') }}</h3>
              </div>
              <div class="kv-grid">
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_red_card_number') }}</span>
                  <span class="kv-value kv-value--mono">{{ record.red_card_number || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issuing_authority') }}</span>
                  <span class="kv-value">{{ record.issuing_authority || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_issue_date') }}</span>
                  <span class="kv-value">{{ formatDate(record.issue_date) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_expiry_date') }}</span>
                  <span
                    class="kv-value"
                    :class="{
                      'kv-value--warning': isExpiringSoon(record.expiry_date),
                      'kv-value--danger': isExpired(record.expiry_date),
                    }"
                  >
                    {{ formatDate(record.expiry_date) }}
                    <span v-if="isExpiringSoon(record.expiry_date)" class="expiry-pill expiry-pill--warning">Expiring soon</span>
                    <span v-if="isExpired(record.expiry_date)" class="expiry-pill expiry-pill--danger">Expired</span>
                  </span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_metro_lines') }}</span>
                  <span class="kv-value">{{ record.lines || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">{{ t('poi.field_renewal_reminder') }}</span>
                  <span class="kv-value">{{ record.renewal_reminder_days ?? '—' }} {{ t('poi.days_before_expiry') }}</span>
                </div>
                <div v-if="record.card_document" class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_card_document') }}</span>
                  <a :href="record.card_document" target="_blank" class="document-link">{{ t('poi.current_document') }}</a>
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
                  <span class="kv-value"><Badge type="poiThreat" :value="record.threat_level" /></span>
                </div>
                <div class="kv-row kv-row--full">
                  <span class="kv-label">{{ t('poi.field_sites') }}</span>
                  <div class="site-tags">
                    <span v-for="site in record.sites" :key="site.site_id" class="site-tag">{{ site.community_name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Record History -->
            <div class="section-card">
              <div class="section-card__header">
                <Icon name="lucide:history" :size="15" />
                <h3 class="section-card__title">{{ t('poi.record_history') }}</h3>
              </div>
              <div class="kv-grid">
                <div v-for="(entry, idx) in historyEntries" :key="idx" class="kv-row kv-row--full">
                  <span class="kv-label">{{ entry.label }}</span>
                  <span class="kv-value">{{ entry.value }}</span>
                </div>
                <div v-if="!historyEntries.length" class="kv-row kv-row--full">
                  <span class="kv-value">—</span>
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
      <p>{{ loadError || t('poi.record_not_found') }}</p>
      <AppButton :text="t('common.back')" type="secondary" size="sm" @click="goBack" />
    </div>

    <!-- Inactivate Modal -->
    <AppDialogModal
      :show="showInactiveModal"
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
          icon="lucide:ban"
          type="danger"
          size="sm"
          :loading="isInactivating"
          @click="confirmInactive"
        />
      </template>
    </AppDialogModal>

    <!-- Archive Modal -->
    <AppDialogModal
      :show="showArchiveModal"
      :title="t('poi.modal_archive_title')"
      max-width="480px"
      @close="closeArchiveModal"
    >
      <p class="modal__desc">{{ t('poi.modal_archive_desc') }}</p>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="closeArchiveModal" />
        <AppButton
          :text="t('poi.modal_archive_confirm')"
          icon="lucide:archive"
          type="danger"
          size="sm"
          :loading="isArchiving"
          @click="confirmArchive"
        />
      </template>
    </AppDialogModal>

    <!-- Call Details Modal -->
    <CallDetailsModal
      :show="showCallModal"
      :call="selectedCall"
      @close="closeCallDetails"
      @resolved="closeCallDetails"
      @canceled="closeCallDetails"
      @deleted="closeCallDetails"
    />

    <!-- Lightbox -->
    <div
      v-if="lightboxOpen && photoUrls.length"
      class="lightbox-overlay"
      @click="lightboxOpen = false"
    >
      <button class="lightbox-close" @click.stop="lightboxOpen = false">
        <Icon name="lucide:x" :size="24" />
      </button>
      <button v-if="photoUrls.length > 1" class="lightbox-nav lightbox-nav--prev" @click.stop="prevLightbox">
        <Icon name="lucide:chevron-left" :size="32" />
      </button>
      <img :src="photoUrls[lightboxIndex]" class="lightbox-image" @click.stop />
      <button v-if="photoUrls.length > 1" class="lightbox-nav lightbox-nav--next" @click.stop="nextLightbox">
        <Icon name="lucide:chevron-right" :size="32" />
      </button>
      <div class="lightbox-counter">{{ lightboxIndex + 1 }} / {{ photoUrls.length }}</div>
    </div>
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

.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  flex-wrap: wrap;
}

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
  font-size: var(--font-size-2xl);
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

.section-card__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

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
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.kv-label--internal {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-critical);
}

.kv-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  word-break: break-word;
}

.kv-value--paragraph {
  line-height: 1.5;
  white-space: pre-wrap;
}

.kv-value--internal {
  background: var(--color-bg-elevated);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.kv-value--mono {
  font-family: var(--font-mono, ui-monospace, monospace);
}

.kv-value--warning { color: #ea580c; }
.kv-value--danger { color: #dc2626; }

.expiry-pill {
  display: inline-flex;
  margin-left: var(--space-2);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}
.expiry-pill--warning { background: rgba(234, 179, 8, 0.15); color: #a16207; }
.expiry-pill--danger { background: rgba(220, 38, 38, 0.15); color: #b91c1c; }

.document-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
}
.document-link:hover { text-decoration: underline; }

.related-incidents {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.related-incident-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
}
.related-incident-link:hover { text-decoration: underline; }

/* ── Photo strip ── */
.photo-strip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-4);
}

.photo-thumb {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: border-color var(--transition-base);
}
.photo-thumb:hover { border-color: var(--color-accent); }
.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Site tags ── */
.site-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.site-tag {
  display: inline-flex;
  padding: 2px var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* ── Not found ── */
.poi-detail__not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--color-text-muted);
}

/* ── Modal body ── */
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

.field-error {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.req { color: var(--color-critical); }

/* ── Lightbox ── */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.lightbox-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.8;
}
.lightbox-close:hover { opacity: 1; }

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
}
.lightbox-nav:hover { opacity: 1; }
.lightbox-nav--prev { left: var(--space-4); }
.lightbox-nav--next { right: var(--space-4); }

.lightbox-counter {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 900px) {
  .detail-columns { grid-template-columns: 1fr; }
  .detail-col--sidebar { order: -1; }
}

@media (max-width: 640px) {
  .poi-detail__page-header {
    flex-wrap: wrap;
  }
  .poi-detail__header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
