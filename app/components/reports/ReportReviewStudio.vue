<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { reportApi } from '~/api/report'
import { useToastStore } from '~/stores/toast'
import { useFileApi } from '~/composables/useFileApi'
import { utcToLocal } from '~/utils/dateTime'
import { renderMarkdown } from '~/utils/markdown'
import type {
  Report,
  ReportSection,
  ReportField,
  ReportFieldValue,
  ReportFileValue,
  ReportAttachment,
  ReportHistoryEntry,
  ReportStatus,
} from '~/api/types/report'

const props = defineProps<{
  reportId: number
}>()

type SectionUpdatePayload = {
  report_section_id: number
  values?: Record<string, ReportFieldValue>
  manager_notes?: string
  client_included?: boolean
}

const { t } = useTranslation()
const router = useRouter()
const toastStore = useToastStore()

const report = ref<Report | null>(null)
const history = ref<ReportHistoryEntry[]>([])
const loading = ref(false)
const error = ref('')

const editedValues = ref<Record<number, ReportFieldValue>>({})
const editedManagerNotes = ref<Record<number, string>>({})
const editedClientIncluded = ref<Record<number, boolean>>({})
interface PendingFile {
  file: File
  objectUrl: string
}

const editedFileUploads = ref<Record<number, { attachments: ReportAttachment[]; pending: PendingFile[] }>>({})

const { uploadFile } = useFileApi()

const showRequestChangesModal = ref(false)
const changeRequestComments = ref('')
const requestingChanges = ref(false)

const showApproveModal = ref(false)
const approving = ref(false)

const showDeliverModal = ref(false)
const delivering = ref(false)

const pdfLoading = ref(false)
const isSaving = ref(false)
const activePanel = ref<'preview' | 'pdf' | null>('preview')

const expandedHistory = ref<Set<number>>(new Set())

function fieldUploadState(field: ReportField) {
  return editedFileUploads.value[field.field_id] ?? { attachments: field.attachments ?? [], pending: [] }
}

function fieldAttachments(field: ReportField): ReportAttachment[] {
  const state = editedFileUploads.value[field.field_id]
  return state?.attachments ?? field.attachments ?? []
}

function pendingImageFiles(field: ReportField): PendingFile[] {
  return fieldUploadState(field).pending.filter((p: PendingFile) => isImageFile(p.file))
}

function pendingNonImageFiles(field: ReportField): PendingFile[] {
  return fieldUploadState(field).pending.filter((p: PendingFile) => !isImageFile(p.file))
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function isImageAttachment(att: ReportAttachment): boolean {
  const url = att.url?.toLowerCase() ?? ''
  return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.webp')
}

function imageAttachments(field: ReportField): ReportAttachment[] {
  return fieldAttachments(field).filter(isImageAttachment)
}

function nonImageAttachments(field: ReportField): ReportAttachment[] {
  return fieldAttachments(field).filter(a => !isImageAttachment(a))
}

function fieldImages(field: ReportField): string[] {
  return imageAttachments(field).map((a: ReportAttachment) => a.url).filter((url: string): url is string => !!url)
}

const isReviewer = computed(() => {
  if (!report.value) return false
  return report.value.status === 'under_review' && report.value.can_edit
})

const canEdit = computed(() => report.value?.can_edit ?? false)

const isReviewing = computed(() => {
  if (!report.value) return false
  const lock = report.value.review_lock
  return report.value.status === 'under_review' && !!lock?.is_locked && !!report.value.can_edit
})

function revokePendingObjectUrls() {
  Object.values(editedFileUploads.value).forEach((state) => {
    state.pending.forEach((p: PendingFile) => URL.revokeObjectURL(p.objectUrl))
  })
}

function loadReportFromResponse(r: Report) {
  revokePendingObjectUrls()
  report.value = r
  editedValues.value = {}
  editedManagerNotes.value = {}
  editedClientIncluded.value = {}
  editedFileUploads.value = {}
  r.sections.forEach((section) => {
    editedClientIncluded.value[section.report_section_id] = section.client_included
    section.fields.forEach((field) => {
      editedValues.value[field.field_id] = field.value
      if (field.field_type === 'file_upload' || field.field_type === 'digital_signature') {
        editedFileUploads.value[field.field_id] = {
          attachments: field.attachments ? [...field.attachments] : [],
          pending: [],
        }
      }
    })
  })
}

async function fetchReport() {
  loading.value = true
  error.value = ''
  try {
    const response = await reportApi.getReport(props.reportId, { showLoading: false })
    if (response.rc === 0 && response.report) {
      loadReportFromResponse(response.report)
    }
  } catch (err) {
    console.error('Failed to load report:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load report'
  } finally {
    loading.value = false
  }
}

async function fetchHistory() {
  try {
    const response = await reportApi.getReportHistory(props.reportId, { showLoading: false })
    if (response.rc === 0) {
      history.value = response.history ?? []
    }
  } catch (err) {
    console.error('Failed to load history:', err)
  }
}

async function startReview() {
  if (!report.value) return
  try {
    const response = await reportApi.startReview(props.reportId)
    if (response.rc === 0) {
      toastStore.success(t('reports.review_started'))
      await fetchReport()
    }
  } catch (err) {
    console.error('Failed to start review:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to start review')
  }
}

async function releaseReview() {
  if (!report.value) return
  try {
    await reportApi.releaseReview(props.reportId)
    await fetchReport()
  } catch (err) {
    console.error('Failed to release review:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to release review')
  }
}

async function saveChanges() {
  if (!report.value) return
  isSaving.value = true
  try {
    const uploadErrors: string[] = []
    const uploadedFileIds = await uploadPendingFiles(uploadErrors)
    if (uploadErrors.length) {
      toastStore.error(uploadErrors.join('\n'))
      return
    }

    const sectionsPayload = buildSectionsPayload(uploadedFileIds)
    if (sectionsPayload.length === 0) {
      toastStore.info('No changes to save')
      return
    }
    await reportApi.updateReport({
      report_id: props.reportId,
      sections: sectionsPayload,
    })
    toastStore.success(t('reports.save_changes'))
    await fetchReport()
    await fetchHistory()
  } catch (err) {
    console.error('Failed to save changes:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to save changes')
  } finally {
    isSaving.value = false
  }
}

async function uploadPendingFiles(errors: string[]): Promise<Record<number, string[]>> {
  const result: Record<number, string[]> = {}
  for (const fieldId in editedFileUploads.value) {
    const state = editedFileUploads.value[Number(fieldId)]
    if (!state?.pending.length) continue
    const ids: string[] = []
    for (const pending of state.pending) {
      const fileId = await uploadFile(pending.file)
      if (fileId) {
        ids.push(fileId)
      } else {
        errors.push(`${pending.file.name}: ${t('reports.upload_failed')}`)
      }
    }
    if (errors.length) return {}
    result[Number(fieldId)] = ids
  }
  return result
}

function buildSectionsPayload(uploadedFileIds: Record<number, string[]> = {}) {
  if (!report.value) return []
  return report.value.sections
    .map((section: ReportSection) => {
      const sectionId = section.report_section_id
      const values: Record<string, ReportFieldValue> = {}
      let hasValueChanges = false
      section.fields.forEach((field: ReportField) => {
        if (field.field_type === 'file_upload' || field.field_type === 'digital_signature') {
          const fileState = editedFileUploads.value[field.field_id]
          if (fileState) {
            const fileValue: ReportFileValue = {
              attachment_ids: fileState.attachments.map((att: ReportAttachment) => att.attachment_id),
              file_ids: uploadedFileIds[field.field_id] ?? [],
            }
            const originalAttachmentIds = (field.value && typeof field.value === 'object' && 'attachment_ids' in field.value
              ? field.value.attachment_ids
              : (field.attachments?.map((att: ReportAttachment) => att.attachment_id) ?? [])) as number[]
            const originalFileIds = (field.value && typeof field.value === 'object' && 'file_ids' in field.value
              ? field.value.file_ids
              : []) as string[]
            if (
              !arraysEqual(fileValue.attachment_ids ?? [], originalAttachmentIds) ||
              !arraysEqual(fileValue.file_ids ?? [], originalFileIds)
            ) {
              values[String(field.field_id)] = fileValue
              hasValueChanges = true
            }
          }
          return
        }
        const current = editedValues.value[field.field_id]
        if (!isEqualValue(current, field.value)) {
          values[String(field.field_id)] = current ?? null
          hasValueChanges = true
        }
      })

      const managerNotes = editedManagerNotes.value[sectionId]
      const notesChanged = managerNotes !== undefined && managerNotes !== (section.manager_notes ?? '')
      const clientIncluded = editedClientIncluded.value[sectionId]
      const inclusionChanged = clientIncluded !== section.client_included

      if (!hasValueChanges && !notesChanged && !inclusionChanged) return null

      const payload: SectionUpdatePayload = {
        report_section_id: sectionId,
      }
      if (hasValueChanges) payload.values = values
      if (notesChanged) payload.manager_notes = managerNotes
      if (inclusionChanged) payload.client_included = clientIncluded
      return payload
    })
    .filter((s: SectionUpdatePayload | null): s is SectionUpdatePayload => s !== null)
}

function arraysEqual(a: unknown[] | undefined, b: unknown[] | undefined): boolean {
  const aa = a ?? []
  const bb = b ?? []
  if (aa.length !== bb.length) return false
  return aa.every((v, i) => v === bb[i])
}

function isEqualValue(a: ReportFieldValue | undefined, b: ReportFieldValue | undefined): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return false
}

async function submitRequestChanges() {
  if (!changeRequestComments.value.trim()) {
    toastStore.error(t('reports.comments_required'))
    return
  }
  requestingChanges.value = true
  try {
    await reportApi.requestChanges({
      report_id: props.reportId,
      comments: changeRequestComments.value.trim(),
    })
    toastStore.success(t('reports.request_changes'))
    showRequestChangesModal.value = false
    changeRequestComments.value = ''
    await fetchReport()
    await fetchHistory()
  } catch (err) {
    console.error('Failed to request changes:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to request changes')
  } finally {
    requestingChanges.value = false
  }
}

async function submitApprove() {
  if (!report.value) return
  approving.value = true
  try {
    const includedSectionIds = report.value.sections
      .filter((s: ReportSection) => editedClientIncluded.value[s.report_section_id] ?? s.client_included)
      .map((s: ReportSection) => s.report_section_id)

    await reportApi.approveReport({
      report_id: props.reportId,
      included_section_ids: includedSectionIds,
      management_summary: managementSummary.value.trim() || undefined,
    })
    toastStore.success(t('reports.approve_report'))
    showApproveModal.value = false
    managementSummary.value = ''
    await fetchReport()
    await fetchHistory()
  } catch (err) {
    console.error('Failed to approve report:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to approve report')
  } finally {
    approving.value = false
  }
}

async function submitDeliver() {
  if (!report.value) return
  delivering.value = true
  try {
    const response = await reportApi.deliverReport(props.reportId)
    if (response.rc === 0 && response.pdf_url) {
      openPdfUrl(response.pdf_url)
    }
    toastStore.success(t('reports.deliver_report'))
    showDeliverModal.value = false
    await fetchReport()
    await fetchHistory()
  } catch (err) {
    console.error('Failed to deliver report:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to deliver report')
  } finally {
    delivering.value = false
  }
}

async function downloadPdf(regenerate = false) {
  pdfLoading.value = true
  try {
    const response = await reportApi.exportReportPdf(props.reportId, regenerate)
    if (response.rc === 0 && response.pdf_url) {
      openPdfUrl(response.pdf_url)
    }
  } catch (err) {
    console.error('Failed to get PDF:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to get PDF')
  } finally {
    pdfLoading.value = false
  }
}

function openPdfUrl(url: string) {
  window.open(url, '_blank')
}

function goBack() {
  router.push('/incident-reports')
}

function formatDateTime(utcDateStr: string | null): string {
  if (!utcDateStr) return '—'
  return utcToLocal(utcDateStr).format('YYYY-MM-DD HH:mm')
}

function getLockCountdown(): string {
  const expires = report.value?.review_lock?.expires_on
  if (!expires) return ''
  const expiresLocal = utcToLocal(expires)
  const now = utcToLocal(new Date().toISOString())
  const diff = expiresLocal.diff(now)
  if (diff <= 0) return '00:00'
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

let countdownTimer: ReturnType<typeof setInterval> | null = null
let keepAliveTimer: ReturnType<typeof setInterval> | null = null

function startTimers() {
  stopTimers()
  countdownTimer = setInterval(() => {
    // trigger re-render of lock countdown
    report.value = report.value ? { ...report.value } : null
  }, 1000)
  keepAliveTimer = setInterval(() => {
    if (isReviewing.value) {
      startReview().catch(() => {})
    }
  }, 600000)
}

function stopTimers() {
  if (countdownTimer) clearInterval(countdownTimer)
  if (keepAliveTimer) clearInterval(keepAliveTimer)
  countdownTimer = null
  keepAliveTimer = null
}

onMounted(() => {
  fetchReport()
  fetchHistory()
  startTimers()
})

onBeforeUnmount(async () => {
  revokePendingObjectUrls()
  stopTimers()
  if (isReviewing.value) {
    await releaseReview()
  }
})

watch(() => props.reportId, () => {
  fetchReport()
  fetchHistory()
})

function toggleHistory(historyId: number) {
  if (expandedHistory.value.has(historyId)) {
    expandedHistory.value.delete(historyId)
  } else {
    expandedHistory.value.add(historyId)
  }
}

function getStatusLabel(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    draft: t('reports.status_draft'),
    submitted: t('reports.status_submitted'),
    under_review: t('reports.status_under_review'),
    changes_requested: t('reports.status_changes_requested'),
    approved: t('reports.status_approved'),
    delivered: t('reports.status_delivered'),
  }
  return map[status] || status
}

function getHistoryActionLabel(action: string): string {
  const map: Record<string, string> = {
    created: t('reports.history_action_created'),
    updated: t('reports.history_action_updated'),
    submitted: t('reports.history_action_submitted'),
    auto_approved: t('reports.history_action_auto_approved'),
    review_started: t('reports.history_action_review_started'),
    review_released: t('reports.history_action_review_released'),
    changes_requested: t('reports.history_action_changes_requested'),
    approved: t('reports.history_action_approved'),
    delivered: t('reports.history_action_delivered'),
    pdf_regenerated: t('reports.history_action_pdf_regenerated'),
  }
  return map[action] || action
}

function renderFieldValue(field: ReportField): string {
  return formatValue(field.value)
}

function renderSubmittedValue(field: ReportField): string {
  return formatValue(field.submitted_value)
}

function formatValue(value: ReportFieldValue | undefined): string {
  if (value == null) return '—'
  if (typeof value === 'string') return value || '—'
  if (Array.isArray(value)) return value.join(', ') || '—'
  if (typeof value === 'object') {
    if ('address' in value) return value.address || '—'
    return JSON.stringify(value)
  }
  return '—'
}

function historyIcon(action: string): string {
  const map: Record<string, string> = {
    created: 'lucide:plus',
    updated: 'lucide:edit',
    submitted: 'lucide:send',
    auto_approved: 'lucide:check-circle',
    review_started: 'lucide:eye',
    review_released: 'lucide:eye-off',
    changes_requested: 'lucide:rotate-ccw',
    approved: 'lucide:check-circle',
    delivered: 'lucide:send',
    pdf_regenerated: 'lucide:file-text',
  }
  return map[action] || 'lucide:activity'
}

function isFieldDirty(field: ReportField): boolean {
  return !isEqualValue(editedValues.value[field.field_id], field.value)
}

function hasManagerNotesChanged(section: ReportSection): boolean {
  return editedManagerNotes.value[section.report_section_id] !== undefined &&
    editedManagerNotes.value[section.report_section_id] !== (section.manager_notes ?? '')
}

function onTextInput(field: ReportField, event: Event) {
  const target = event.target as HTMLTextAreaElement
  editedValues.value[field.field_id] = target.value
}

function onDateInput(field: ReportField, event: Event) {
  const target = event.target as HTMLInputElement
  editedValues.value[field.field_id] = target.value
}

function canUploadMore(field: ReportField): boolean {
  const state = fieldUploadState(field)
  const maxFiles = field.config?.max_files ?? (field.field_type === 'digital_signature' ? 1 : 5)
  return state.attachments.length + state.pending.length < maxFiles
}

async function onFieldFileInput(field: ReportField, event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const files = Array.from(input.files)
  const maxFiles = field.config?.max_files ?? (field.field_type === 'digital_signature' ? 1 : 5)
  const state = fieldUploadState(field)
  const remaining = maxFiles - state.attachments.length - state.pending.length
  const toAdd = files.slice(0, Math.max(0, remaining))

  for (const file of toAdd) {
    state.pending.push({ file, objectUrl: URL.createObjectURL(file) })
  }
  input.value = ''
}

function removeFieldAttachment(field: ReportField, attachmentId: number) {
  const state = fieldUploadState(field)
  state.attachments = state.attachments.filter(a => a.attachment_id !== attachmentId)
}

function removePendingFile(field: ReportField, filteredIndex: number, filterFn?: (p: PendingFile) => boolean) {
  const state = fieldUploadState(field)
  const list = filterFn ? state.pending.filter(filterFn) : state.pending
  const target = list[filteredIndex]
  if (!target) return
  const index = state.pending.indexOf(target)
  if (index >= 0) {
    const removed = state.pending.splice(index, 1)[0]
    if (removed) URL.revokeObjectURL(removed.objectUrl)
  }
}

function dropdownDisplayValue(field: ReportField): string | string[] {
  const value = editedValues.value[field.field_id] ?? field.value
  if (field.config?.is_multi_select) {
    return Array.isArray(value) ? (value as string[]) : []
  }
  return String(value ?? '')
}

function onDropdownInput(field: ReportField, event: Event) {
  const target = event.target as HTMLSelectElement
  const config = field.config
  if (config?.is_multi_select) {
    const selected = Array.from(target.selectedOptions).map(o => o.value)
    editedValues.value[field.field_id] = selected
  } else {
    editedValues.value[field.field_id] = target.value
  }
}

const managementSummary = ref('')

function includedSectionNames(): string[] {
  if (!report.value) return []
  return report.value.sections
    .filter((s: ReportSection) => editedClientIncluded.value[s.report_section_id] ?? s.client_included)
    .map((s: ReportSection) => s.title)
}

function excludedSectionNames(): string[] {
  if (!report.value) return []
  return report.value.sections
    .filter((s: ReportSection) => !(editedClientIncluded.value[s.report_section_id] ?? s.client_included))
    .map((s: ReportSection) => s.title)
}

function clientPreviewSections(): ReportSection[] {
  if (!report.value) return []
  return report.value.sections
    .filter((s: ReportSection) => editedClientIncluded.value[s.report_section_id] ?? s.client_included)
}
</script>

<template>
  <div class="review-studio">
    <div v-if="loading" class="empty-state">
      <Icon name="lucide:loader-2" :size="32" class="spinner" />
      <span>{{ t('common.loading') }}</span>
    </div>
    <div v-else-if="error || !report" class="empty-state">
      <Icon name="lucide:alert-circle" :size="32" />
      <span>{{ error || t('reports.no_reports') }}</span>
      <button class="back-btn" @click="goBack">
        <Icon name="lucide:arrow-left" :size="16" />
        {{ t('reports.back_to_list') }}
      </button>
    </div>
    <template v-else>
      <!-- Header info card -->
      <div class="review-header">
        <div class="review-header__main">
          <h1 class="review-header__title">
            {{ t('reports.report_id') }} #{{ report.report_id }}
            <span class="review-header__divider">·</span>
            {{ report.title }}
          </h1>
          <div class="review-header__meta">
            <Badge type="report" :value="report.status" :text="getStatusLabel(report.status)" />
            <span>{{ report.community_name }}</span>
            <span>{{ report.officer_name }}</span>
            <span v-if="report.call_id">{{ t('reports.source_call') }} #{{ report.call_id }}</span>
          </div>
        </div>
        <div class="review-header__dates">
          <div><strong>{{ t('reports.submitted_at') }}:</strong> {{ formatDateTime(report.submitted_on) }}</div>
          <div><strong>{{ t('reports.col_submitted') }}:</strong> {{ formatDateTime(report.created_on) }}</div>
          <div v-if="report.approved_on"><strong>{{ t('reports.approve') }}:</strong> {{ formatDateTime(report.approved_on) }}</div>
          <div v-if="report.delivered_on"><strong>{{ t('reports.deliver') }}:</strong> {{ formatDateTime(report.delivered_on) }}</div>
        </div>
      </div>

      <!-- Split panes -->
      <div class="review-panes">
        <!-- LEFT: report content -->
        <div class="review-left">
          <div v-for="section in report.sections" :key="section.report_section_id" class="section-card">
            <div class="section-card__header">
              <h3 class="section-card__title">{{ section.title }}</h3>
              <div class="section-card__badges">
                <Badge v-if="section.is_required" type="status" value="required" :text="t('reports.field_required')" />
                <Badge v-if="section.client_included" type="review" value="true" :text="t('reports.review_required')" />
              </div>
            </div>

            <div class="section-fields">
              <div v-for="field in section.fields" :key="field.field_id" class="field-row" :class="{ 'field-row--dirty': isFieldDirty(field) }">
                <label class="field-label">
                  {{ field.label }}
                  <Icon v-if="field.is_locked" name="lucide:lock" :size="12" :title="t('reports.field_locked')" />
                  <span v-if="field.is_required" class="required-mark">*</span>
                </label>

                <div class="field-value">
                  <!-- Text -->
                  <textarea
                    v-if="field.field_type === 'text'"
                    :value="String(editedValues[field.field_id] ?? field.value ?? '')"
                    :disabled="!canEdit || field.is_locked"
                    :maxlength="field.config?.max_chars"
                    rows="4"
                    class="field-input field-textarea"
                    @input="onTextInput(field, $event)"
                  />
                  <!-- Date -->
                  <input
                    v-else-if="field.field_type === 'date'"
                    :value="String(editedValues[field.field_id] ?? field.value ?? '')"
                    type="date"
                    :disabled="!canEdit || field.is_locked"
                    class="field-input"
                    @input="onDateInput(field, $event)"
                  >
                  <!-- Location -->
                  <div v-else-if="field.field_type === 'location'" class="location-value">
                    <Icon name="lucide:map-pin" :size="14" />
                    <span>{{ renderFieldValue(field) }}</span>
                  </div>
                  <!-- Dropdown -->
                  <select
                    v-else-if="field.field_type === 'dropdown'"
                    :value="dropdownDisplayValue(field)"
                    :disabled="!canEdit || field.is_locked"
                    :multiple="field.config?.is_multi_select"
                    class="field-input"
                    @change="onDropdownInput(field, $event)"
                  >
                    <option v-for="opt in field.config?.dropdown_values" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <!-- File / Signature -->
                  <div v-else-if="field.field_type === 'file_upload' || field.field_type === 'digital_signature'" class="attachments-list">
                    <template v-if="imageAttachments(field).length">
                      <MImagePreview
                        v-for="(att, idx) in imageAttachments(field)"
                        :key="att.attachment_id"
                        :show="false"
                        :thumbnail-url="att.url"
                        :images="imageAttachments(field).map(a => a.url)"
                        :initial-index="idx"
                        :show-thumbnail-close="canEdit && !field.is_locked"
                        @remove="removeFieldAttachment(field, att.attachment_id)"
                      />
                    </template>
                    <template v-if="pendingImageFiles(field).length">
                      <MImagePreview
                        v-for="(pending, pidx) in pendingImageFiles(field)"
                        :key="pending.objectUrl"
                        :show="false"
                        :thumbnail-url="pending.objectUrl"
                        :images="pendingImageFiles(field).map(p => p.objectUrl)"
                        :initial-index="pidx"
                        :show-thumbnail-close="canEdit && !field.is_locked"
                        @remove="removePendingFile(field, pidx, (p: PendingFile) => isImageFile(p.file))"
                      />
                    </template>
                    <template v-if="nonImageAttachments(field).length">
                      <div
                        v-for="att in nonImageAttachments(field)"
                        :key="att.attachment_id"
                        class="attachment-chip-wrap"
                      >
                        <a
                          :href="att.url"
                          target="_blank"
                          class="attachment-chip"
                        >
                          <Icon name="lucide:paperclip" :size="14" />
                          {{ att.file_name || att.url.split('/').pop() || `Attachment ${att.attachment_id}` }}
                        </a>
                        <button
                          v-if="canEdit && !field.is_locked"
                          type="button"
                          class="attachment-remove"
                          :title="t('reports.remove_attachment')"
                          @click="removeFieldAttachment(field, att.attachment_id)"
                        >
                          <Icon name="lucide:x" :size="12" />
                        </button>
                      </div>
                    </template>
                    <template v-if="pendingNonImageFiles(field).length">
                      <div
                        v-for="(pending, pidx) in pendingNonImageFiles(field)"
                        :key="pending.objectUrl"
                        class="new-file-chip"
                      >
                        <Icon name="lucide:clock" :size="12" />
                        <span>{{ pending.file.name }}</span>
                        <button
                          v-if="canEdit && !field.is_locked"
                          type="button"
                          class="attachment-remove"
                          :title="t('reports.remove_attachment')"
                          @click="removePendingFile(field, pidx, (p: PendingFile) => !isImageFile(p.file))"
                        >
                          <Icon name="lucide:x" :size="12" />
                        </button>
                      </div>
                    </template>
                    <span v-if="!imageAttachments(field).length && !pendingImageFiles(field).length && !nonImageAttachments(field).length && !pendingNonImageFiles(field).length" class="text-muted">—</span>

                    <label v-if="canEdit && !field.is_locked && canUploadMore(field)" class="upload-add-btn">
                      <Icon name="lucide:upload" :size="14" />
                      <span>{{ field.field_type === 'digital_signature' ? (fieldAttachments(field).length || fieldUploadState(field).pending.length ? t('reports.replace_signature') : t('reports.upload_signature')) : t('reports.add_file') }}</span>
                      <input
                        type="file"
                        class="upload-input"
                        :accept="field.field_type === 'digital_signature' ? '.png,.jpg,.jpeg' : '.pdf,.jpg,.jpeg,.png,.mp4,.doc,.docx'"
                        :multiple="field.field_type !== 'digital_signature'"
                        @change="onFieldFileInput(field, $event)"
                      >
                    </label>
                  </div>
                  <!-- Fallback -->
                  <div v-else class="field-readonly">{{ renderFieldValue(field) }}</div>
                </div>

                <!-- Audit comparison -->
                <div v-if="field.submitted_value !== undefined && !isEqualValue(field.submitted_value, field.value)" class="audit-comparison">
                  <span class="audit-label">{{ t('reports.edited_by_manager') }}</span>
                  <span class="audit-original">{{ t('reports.original_value') }}: {{ renderSubmittedValue(field) }}</span>
                </div>
              </div>
            </div>

            <!-- Manager notes -->
            <div class="manager-notes">
              <label class="field-label">{{ t('reports.manager_notes') }}</label>
              <span class="internal-badge">{{ t('reports.internal_only') }}</span>
              <textarea
                v-model="editedManagerNotes[section.report_section_id]"
                :disabled="!canEdit"
                rows="3"
                class="field-input field-textarea"
                :class="{ 'field-input--changed': hasManagerNotesChanged(section) }"
                :placeholder="t('reports.notes_placeholder')"
                @focus="editedManagerNotes[section.report_section_id] = editedManagerNotes[section.report_section_id] ?? section.manager_notes ?? ''"
              />
            </div>
          </div>

          <div v-if="canEdit" class="action-bar">
            <AppButton :text="t('reports.save_changes')" type="primary" :loading="isSaving" @click="saveChanges" />
          </div>
        </div>

        <!-- RIGHT: manager panel -->
        <div class="review-right">
          <!-- Review status card -->
          <div class="panel-card">
            <div class="panel-card__header">
              <h3 class="panel-card__title">{{ t('reports.status') }}</h3>
            </div>
            <div class="panel-card__body">
              <div class="status-row">
                <Badge type="report" :value="report.status" :text="getStatusLabel(report.status)" />
                <span v-if="isReviewing" class="lock-countdown">{{ getLockCountdown() }}</span>
              </div>
              <div v-if="report.reviewer_name" class="reviewer-info">
                <span v-if="isReviewer">{{ t('reports.reviewing_you') }}</span>
                <span v-else>{{ t('reports.lock_by', { name: report.reviewer_name }) }}</span>
              </div>
              <div v-if="report.changes_comment" class="changes-comment">
                <strong>{{ t('reports.request_changes') }}:</strong>
                <p>{{ report.changes_comment }}</p>
              </div>

              <div class="panel-actions">
                <AppButton
                  v-if="report.status === 'submitted' || (report.status === 'under_review' && !isReviewing)"
                  :text="t('reports.start_review')"
                  type="primary"
                  @click="startReview"
                />
                <AppButton
                  v-if="isReviewing"
                  :text="t('reports.release_review')"
                  type="secondary"
                  @click="releaseReview"
                />
                <AppButton
                  v-if="isReviewing"
                  :text="t('reports.request_changes')"
                  type="secondary"
                  @click="showRequestChangesModal = true"
                />
                <AppButton
                  v-if="isReviewing"
                  :text="t('reports.approve_report')"
                  type="primary"
                  @click="showApproveModal = true"
                />
                <AppButton
                  v-if="report.status === 'approved'"
                  :text="t('reports.deliver_report')"
                  type="primary"
                  :loading="delivering"
                  @click="showDeliverModal = true"
                />
                <AppButton
                  v-if="report.status === 'delivered'"
                  :text="t('reports.download_pdf')"
                  type="secondary"
                  :loading="pdfLoading"
                  @click="downloadPdf(false)"
                />
                <AppButton
                  v-if="report.status === 'delivered'"
                  :text="t('reports.regenerate_pdf')"
                  type="secondary"
                  :loading="pdfLoading"
                  @click="downloadPdf(true)"
                />
              </div>
            </div>
          </div>

          <!-- Section inclusion checklist -->
          <div v-if="isReviewing || report.status === 'approved'" class="panel-card">
            <div class="panel-card__header">
              <h3 class="panel-card__title">{{ t('reports.section_inclusion') }}</h3>
            </div>
            <div class="panel-card__body">
              <label
                v-for="section in report.sections"
                :key="section.report_section_id"
                class="check-row"
              >
                <input
                  v-model="editedClientIncluded[section.report_section_id]"
                  type="checkbox"
                  :disabled="!isReviewing"
                >
                <span>{{ section.title }}</span>
              </label>

              <div class="management-summary">
                <label class="field-label">{{ t('reports.management_summary') }}</label>
                <textarea
                  v-model="managementSummary"
                  rows="3"
                  class="field-input field-textarea"
                  :placeholder="t('reports.summary_placeholder')"
                  :disabled="!isReviewing"
                />
              </div>
            </div>
          </div>

          <!-- Client preview / PDF panel -->
          <div class="panel-card">
            <div class="panel-card__header preview-tabs">
              <button
                class="preview-tab"
                :class="{ 'preview-tab--active': activePanel === 'preview' }"
                :disabled="report.status === 'delivered'"
                @click="activePanel = 'preview'"
              >
                {{ t('reports.preview_label') }}
              </button>
              <button
                v-if="report.status === 'delivered'"
                class="preview-tab"
                :class="{ 'preview-tab--active': activePanel === 'pdf' }"
                @click="activePanel = 'pdf'"
              >
                PDF
              </button>
            </div>

            <div v-if="activePanel === 'preview'" class="client-preview">
              <div class="preview-watermark">CONFIDENTIAL – AUTHORISED USE ONLY</div>
              <div class="preview-header">
                <div class="preview-community">{{ report.community_name }}</div>
                <div class="preview-title">{{ report.title }}</div>
                <div class="preview-id">#{{ report.report_id }}</div>
              </div>
              <div v-if="managementSummary.trim()" class="preview-summary">
                <strong>{{ t('reports.management_summary') }}</strong>
                <p>{{ managementSummary }}</p>
              </div>
              <div
                v-for="section in clientPreviewSections()"
                :key="section.report_section_id"
                class="preview-section"
              >
                <h4>{{ section.title }}</h4>
                <div v-for="field in section.fields" :key="field.field_id" class="preview-field">
                  <label>{{ field.label }}</label>
                  <div>{{ renderFieldValue(field) }}</div>
                </div>
              </div>
              <div class="preview-footer">
                Generated by Code4 Axis Security Operations · {{ formatDateTime(new Date().toISOString()) }}
              </div>
            </div>

            <div v-else-if="activePanel === 'pdf'" class="pdf-panel">
              <AppButton :text="t('reports.download_pdf')" type="primary" :loading="pdfLoading" @click="downloadPdf(false)" />
            </div>
          </div>

          <!-- History timeline -->
          <div class="panel-card">
            <div class="panel-card__header">
              <h3 class="panel-card__title">{{ t('reports.history') }}</h3>
            </div>
            <div class="panel-card__body history-list">
              <div
                v-for="entry in history"
                :key="entry.history_id"
                class="history-entry"
                @click="toggleHistory(entry.history_id)"
              >
                <div class="history-entry__header">
                  <Icon :name="historyIcon(entry.action)" :size="14" />
                  <span class="history-action">{{ getHistoryActionLabel(entry.action) }}</span>
                  <span class="history-user">{{ entry.user_name || 'System' }}</span>
                  <span class="history-time">{{ formatDateTime(entry.created_on) }}</span>
                </div>
                <div v-if="entry.comment" class="history-comment">{{ entry.comment }}</div>
                <div v-if="expandedHistory.has(entry.history_id) && entry.changes && Array.isArray(entry.changes)" class="history-changes">
                  <div v-for="(change, idx) in entry.changes" :key="idx" class="history-change">
                    <span v-if="change.label" class="change-label">{{ change.label }}:</span>
                    <template v-if="change.old_value != null && String(change.old_value) !== ''">
                      <span class="change-old">{{ change.old_value }}</span>
                      <Icon name="lucide:arrow-right" :size="12" />
                    </template>
                    <span class="change-new">{{ change.new_value }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!history.length" class="text-muted">—</div>
            </div>
          </div>

        </div>
      </div>

      <!-- Request Changes Modal -->
      <AppDialogModal
        :show="showRequestChangesModal"
        :title="t('reports.confirm_request_changes_title')"
        @close="showRequestChangesModal = false"
      >
        <div class="modal-body">
          <label class="field-label">{{ t('reports.changes_description') }}</label>
          <textarea
            v-model="changeRequestComments"
            rows="4"
            class="field-input field-textarea"
            :placeholder="t('reports.comments_placeholder')"
          />
        </div>
        <template #footer>
          <AppButton :text="t('common.cancel')" type="secondary" @click="showRequestChangesModal = false" />
          <AppButton :text="t('reports.send_request')" type="primary" :loading="requestingChanges" @click="submitRequestChanges" />
        </template>
      </AppDialogModal>

      <!-- Approve Modal -->
      <AppDialogModal
        :show="showApproveModal"
        :title="t('reports.confirm_approve_title')"
        @close="showApproveModal = false"
      >
        <div class="modal-body">
          <p>{{ t('reports.confirm_approve_message') }}</p>
          <div class="section-list">
            <strong>{{ t('reports.approval_included') }}:</strong>
            <ul>
              <li v-for="name in includedSectionNames()" :key="name">{{ name }}</li>
            </ul>
          </div>
          <div v-if="excludedSectionNames().length" class="section-list section-list--excluded">
            <strong>{{ t('reports.approval_excluded') }}:</strong>
            <ul>
              <li v-for="name in excludedSectionNames()" :key="name">{{ name }}</li>
            </ul>
          </div>
          <div class="management-summary">
            <label class="field-label">{{ t('reports.management_summary') }}</label>
            <p v-if="managementSummary.trim()" class="summary-text">{{ managementSummary }}</p>
            <p v-else class="text-muted">{{ t('reports.no_summary') }}</p>
          </div>
        </div>
        <template #footer>
          <AppButton :text="t('common.cancel')" type="secondary" @click="showApproveModal = false" />
          <AppButton :text="t('common.confirm')" type="primary" :loading="approving" @click="submitApprove" />
        </template>
      </AppDialogModal>

      <!-- Deliver Modal -->
      <AppDialogModal
        :show="showDeliverModal"
        :title="t('reports.confirm_deliver_title')"
        @close="showDeliverModal = false"
      >
        <div class="modal-body">
          <p>{{ t('reports.confirm_deliver_message') }}</p>
          <div v-if="delivering" class="pdf-generating">
            <Icon name="lucide:loader-2" :size="20" class="spinner" />
            <span>{{ t('reports.pdf_generating') }}</span>
          </div>
        </div>
        <template #footer>
          <AppButton :text="t('common.cancel')" type="secondary" :disabled="delivering" @click="showDeliverModal = false" />
          <AppButton :text="t('reports.deliver_report')" type="primary" :loading="delivering" @click="submitDeliver" />
        </template>
      </AppDialogModal>
    </template>
  </div>
</template>

<style scoped>
.review-studio {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-12);
  color: var(--color-text-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.back-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.review-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding: var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.review-header__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.review-header__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.review-header__divider {
  color: var(--color-text-muted);
  margin: 0 var(--space-1);
}

.review-header__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  flex-wrap: wrap;
}

.review-header__dates {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-align: right;
}

.review-panes {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--space-5);
  align-items: start;
}

.review-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.review-right {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: var(--space-4);
}

.section-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  overflow: hidden;
}

.section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.section-card__title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.section-card__badges {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.section-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-row--dirty {
  padding-left: var(--space-3);
  border-left: 3px solid var(--color-accent);
}

.field-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required-mark {
  color: var(--color-critical);
}

.field-value {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}

.field-input:focus {
  border-color: var(--color-accent);
}

.field-input:disabled {
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.field-input--changed {
  border-color: var(--color-accent);
}

.location-value {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.attachment-chip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  text-decoration: none;
}

.attachment-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  z-index: 1;
  transition: background 0.2s;
}

.attachment-chip-wrap .attachment-remove,
.new-file-chip .attachment-remove {
  position: absolute;
  top: 4px;
  right: 4px;
}

.attachment-remove:hover {
  background: rgba(0, 0, 0, 0.7);
}

.new-files {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.new-file-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.upload-add-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.upload-add-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-surface);
}

.upload-input {
  display: none;
}

.audit-comparison {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background: rgba(229, 255, 68, 0.08);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
}

.audit-label {
  color: var(--color-accent);
  font-weight: 500;
}

.audit-original {
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

.manager-notes {
  padding: var(--space-4);
  border-top: 1px dashed var(--color-border);
  background: var(--color-bg-surface);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.internal-badge {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.panel-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.panel-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.panel-card__body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.panel-card__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.lock-countdown {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.reviewer-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.changes-comment {
  padding: var(--space-3);
  background: rgba(239, 68, 68, 0.08);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.changes-comment p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.check-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.check-row input { accent-color: var(--color-accent); }

.management-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.preview-tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
}

.preview-tab {
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.preview-tab:hover { color: var(--color-text-primary); }
.preview-tab--active { color: var(--color-accent); background: rgba(229, 255, 68, 0.1); }
.preview-tab:disabled { opacity: 0.5; cursor: not-allowed; }

.client-preview {
  position: relative;
  padding: var(--space-6);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-height: 200px;
  overflow: hidden;
}

.preview-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.08);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.preview-header {
  text-align: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 2px solid var(--color-border);
}

.preview-community { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.preview-title { font-size: var(--font-size-lg); font-weight: 600; margin: var(--space-1) 0; }
.preview-id { color: var(--color-text-muted); font-size: var(--font-size-sm); }

.preview-summary {
  margin-bottom: var(--space-5);
  padding: var(--space-3);
  background: rgba(59, 130, 246, 0.08);
  border-radius: var(--radius-md);
}

.preview-section {
  margin-bottom: var(--space-5);
}

.preview-section h4 {
  margin: 0 0 var(--space-3);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.preview-field {
  margin-bottom: var(--space-3);
}

.preview-field label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}

.preview-field div {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.preview-footer {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.pdf-panel {
  display: flex;
  justify-content: center;
  padding: var(--space-4);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.history-entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.history-entry__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.history-action { color: var(--color-text-primary); font-weight: 500; }
.history-user { margin-left: auto; color: var(--color-text-muted); }
.history-time { color: var(--color-text-muted); font-size: var(--font-size-xs); }

.history-comment {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  padding-left: var(--space-5);
}

.history-changes {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-left: var(--space-5);
  font-size: var(--font-size-xs);
}

.history-change {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.change-label { flex-shrink: 0; }
.change-old { text-decoration: line-through; }
.change-new { color: var(--color-text-primary); }

.modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-list {
  font-size: var(--font-size-sm);
}

.section-list ul {
  margin: var(--space-1) 0 0;
  padding-left: var(--space-4);
}

.section-list--excluded { color: var(--color-text-muted); }

.summary-text {
  padding: var(--space-2);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.pdf-generating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.text-muted { color: var(--color-text-muted); }

@media (max-width: 1024px) {
  .review-panes {
    grid-template-columns: 1fr;
  }
  .review-right {
    position: static;
  }
}
</style>
