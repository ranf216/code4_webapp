<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import AppButton from '~/components/AppButton.vue'
import { poiApi } from '~/api/poi'
import { communityApi } from '~/api/community'
import { useFileApi } from '~/composables/useFileApi'
import { useToastStore } from '~/stores/toast'
import type { PoiGender, PoiRecord, PoiRecordType, PoiThreatLevel, PoiMetadataResponse } from '~/api/types/poi'
import type { Community } from '~/api/community'

interface PhotoItem {
  key: string
  fileId: number | string | null
  url: string
  file?: File
}

interface POIFormData {
  recordType: PoiRecordType | ''
  status: string
  firstName: string
  lastName: string
  aliases: string
  dateOfBirth: string
  gender: PoiGender | ''
  physicalDescription: string
  summary: string
  internalNotes: string
  sites: number[]
  threatLevel: PoiThreatLevel | ''
  relatedIncidentIds: string
  incidentHistorySummary: string
  watchLevelReviewDate: string
  associatedIndividuals: string
  trespassNoticeNumber: string
  trespassIssuingAuthority: string
  propertyAreaCovered: string
  trespassIssueDate: string
  trespassExpiryDate: string
  trespassRenewalReminder: number | null
  lawEnforcementContact: string
  conditions: string
  redCardNumber: string
  metroIssuingAuthority: string
  metroIssueDate: string
  metroExpiryDate: string
  metroLines: string
  metroRenewalReminder: number | null
}

const props = defineProps<{
  mode: 'create' | 'edit'
  record?: PoiRecord
}>()

const { t } = useTranslation()
const router = useRouter()
const toastStore = useToastStore()
const { uploadFile } = useFileApi()

const isSubmitting = ref(false)
const isLoading = ref(false)
const loadError = ref('')
const metadata = ref<Partial<PoiMetadataResponse>>({})
const communities = ref<Community[]>([])
const photos = ref<PhotoItem[]>([])
const photosDirty = ref(false)
const trespassDocFile = ref<File | null>(null)
const metroCardFile = ref<File | null>(null)
const replaceTrespassDoc = ref(false)
const replaceMetroCard = ref(false)

const isEdit = computed(() => props.mode === 'edit')
const pageTitle = computed(() => isEdit.value ? t('poi.form_title_edit') : t('poi.form_title_create'))
const isEditable = computed(() => !props.record || props.record.status === 'draft' || props.record.status === 'active')

function capitalizeFirst(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const genderOptions = computed<{ value: PoiGender | ''; label: string }[]>(() => {
  const genders = metadata.value.genders
  if (genders && typeof genders === 'object') {
    return Object.entries(genders).map(([key, val]) => ({
      value: key as PoiGender,
      label: capitalizeFirst((val as any).name?.en ?? key),
    }))
  }
  return [
    { value: 'male', label: capitalizeFirst(t('poi.gender_male')) },
    { value: 'female', label: capitalizeFirst(t('poi.gender_female')) },
    { value: 'unknown', label: capitalizeFirst(t('poi.gender_unknown')) },
  ]
})

function formatDateInput(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const year = d.getFullYear()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildInitialForm(): POIFormData {
  const r = props.record
  return {
    recordType: r?.record_type ?? '',
    status: r?.status ?? 'draft',
    firstName: r?.first_name ?? '',
    lastName: r?.last_name ?? '',
    aliases: r?.known_aliases ?? '',
    dateOfBirth: formatDateInput(r?.date_of_birth),
    gender: r?.gender ?? '',
    physicalDescription: r?.physical_description ?? '',
    summary: r?.summary ?? '',
    internalNotes: r?.internal_notes ?? '',
    sites: r?.sites ? r.sites.map(s => s.community_id) : [],
    threatLevel: r?.threat_level ?? '',
    relatedIncidentIds: r?.related_incidents ? r.related_incidents.map(i => i.call_id).join(', ') : '',
    incidentHistorySummary: r?.incident_history_summary ?? '',
    watchLevelReviewDate: formatDateInput(r?.watch_level_review_date),
    associatedIndividuals: r?.associated_individuals ?? '',
    trespassNoticeNumber: r?.trespass_notice_number ?? '',
    trespassIssuingAuthority: r?.record_type === 'trespass' ? (r?.issuing_authority ?? '') : '',
    propertyAreaCovered: r?.property_area_covered ?? '',
    trespassIssueDate: formatDateInput(r?.issue_date),
    trespassExpiryDate: formatDateInput(r?.expiry_date),
    trespassRenewalReminder: r?.renewal_reminder_days ?? 14,
    lawEnforcementContact: r?.law_enforcement_contact ?? '',
    conditions: r?.conditions ?? '',
    redCardNumber: r?.red_card_number ?? '',
    metroIssuingAuthority: r?.record_type === 'metro_red_card' ? (r?.issuing_authority ?? '') : '',
    metroIssueDate: formatDateInput(r?.issue_date),
    metroExpiryDate: formatDateInput(r?.expiry_date),
    metroLines: r?.lines ?? '',
    metroRenewalReminder: r?.renewal_reminder_days ?? 14,
  }
}

const form = reactive<POIFormData>(buildInitialForm())

const errors = reactive<Partial<Record<keyof POIFormData, string>>>({})
const photoError = ref('')
const trespassDocError = ref('')

const isPOI = computed(() => form.recordType === 'poi')
const isTrespass = computed(() => form.recordType === 'trespass')
const isMetro = computed(() => form.recordType === 'metro_red_card')
const hasType = computed(() => form.recordType !== '')

const existingTrespassDocUrl = computed(() => props.record?.notice_document ?? '')
const existingMetroCardUrl = computed(() => props.record?.card_document ?? '')

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    const [metaRes, commRes] = await Promise.all([
      poiApi.getPoiMetadata({ showLoading: false }),
      communityApi.getCommunities({ include_inactive: false }, { showLoading: false }),
    ])
    metadata.value = (metaRes as any) ?? {}
    communities.value = commRes.communities ?? []
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Failed to load form data'
    toastStore.error(loadError.value)
  } finally {
    isLoading.value = false
  }

  if (props.record?.photos?.length) {
    const sorted = [...props.record.photos].sort((a, b) => a.sort_order - b.sort_order)
    photos.value = sorted.map((p, idx) => ({
      key: `existing-${p.photo_id}-${idx}`,
      fileId: p.photo_id,
      url: p.url,
    }))
  }
})

function communityName(id: number): string {
  return communities.value.find(c => c.community_id === id)?.name ?? String(id)
}

function toggleSite(id: number) {
  const idx = form.sites.indexOf(id)
  if (idx === -1) form.sites.push(id)
  else form.sites.splice(idx, 1)
}

// ── Photos ──
function handlePhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const newFiles = Array.from(input.files)
  for (const file of newFiles) {
    if (photos.value.length >= 10) break
    if (file.size > 5 * 1024 * 1024) continue
    photos.value.push({
      key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fileId: null,
      url: URL.createObjectURL(file),
      file,
    })
    photosDirty.value = true
  }
  input.value = ''
}

function removePhoto(index: number) {
  const item = photos.value[index]
  if (!item) return
  if (item.file) URL.revokeObjectURL(item.url)
  photos.value.splice(index, 1)
  photosDirty.value = true
}

let dragIndex = -1
function onPhotoDragStart(index: number) {
  dragIndex = index
}
function onPhotoDragOver(index: number) {
  if (dragIndex === -1 || dragIndex === index) return
  const moved = photos.value.splice(dragIndex, 1)[0]
  if (moved) {
    photos.value.splice(index, 0, moved)
    dragIndex = index
    photosDirty.value = true
  }
}
function onPhotoDragEnd() {
  dragIndex = -1
}

function handleTrespassDoc(event: Event) {
  const input = event.target as HTMLInputElement
  trespassDocFile.value = input.files?.[0] ?? null
}

function handleMetroCard(event: Event) {
  const input = event.target as HTMLInputElement
  metroCardFile.value = input.files?.[0] ?? null
}

// ── Validation ──
function validate(): boolean {
  const e = errors as Record<string, string>
  Object.keys(e).forEach(k => delete e[k])

  if (!isEdit.value && !form.recordType) e.recordType = t('validation.required')
  if (!form.firstName.trim()) e.firstName = t('validation.required')
  if (!form.lastName.trim()) e.lastName = t('validation.required')
  if (!form.threatLevel) e.threatLevel = t('validation.required')
  if (!form.summary.trim()) e.summary = t('validation.required')
  if (form.sites.length === 0) e.sites = t('validation.required')
  if (photos.value.length === 0) photoError.value = t('validation.required')
  else photoError.value = ''

  if (isTrespass.value) {
    if (!form.trespassNoticeNumber.trim()) e.trespassNoticeNumber = t('validation.required')
    if (!form.trespassIssuingAuthority.trim()) e.trespassIssuingAuthority = t('validation.required')
    if (!form.propertyAreaCovered.trim()) e.propertyAreaCovered = t('validation.required')
    if (!form.trespassIssueDate) e.trespassIssueDate = t('validation.required')
    if (!form.trespassExpiryDate) e.trespassExpiryDate = t('validation.required')
    const hasExistingDoc = isEdit.value && props.record?.notice_document && !replaceTrespassDoc.value
    if (!hasExistingDoc && !trespassDocFile.value) trespassDocError.value = t('validation.required')
    else trespassDocError.value = ''
  }

  if (isMetro.value) {
    if (!form.redCardNumber.trim()) e.redCardNumber = t('validation.required')
    if (!form.metroIssuingAuthority.trim()) e.metroIssuingAuthority = t('validation.required')
    if (!form.metroIssueDate) e.metroIssueDate = t('validation.required')
    if (!form.metroExpiryDate) e.metroExpiryDate = t('validation.required')
  }

  return Object.keys(errors).length === 0 && !photoError.value && !trespassDocError.value
}

function parseIncidentIds(): number[] {
  return form.relatedIncidentIds
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter(n => !Number.isNaN(n))
}

async function uploadDoc(file: File | null): Promise<number | string | null> {
  if (!file) return null
  return uploadFile(file)
}

async function resolvePhotoFileIds(): Promise<(number | string)[]> {
  const ids: (number | string)[] = []
  for (const photo of photos.value) {
    if (photo.file) {
      const id = await uploadFile(photo.file)
      if (id) ids.push(id)
    } else if (photo.fileId) {
      ids.push(photo.fileId)
    }
  }
  return ids
}

async function submitForm(publish: boolean) {
  if (!validate()) return
  if (!isEditable.value) {
    toastStore.error('This record cannot be edited in its current status.')
    return
  }

  isSubmitting.value = true
  try {
    const photoFileIds = await resolvePhotoFileIds()
    if (photos.value.length > 0 && photoFileIds.length === 0) {
      photoError.value = t('poi.photo_upload_failed')
      isSubmitting.value = false
      return
    }

    const relatedIds = parseIncidentIds()
    const basePayload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      known_aliases: form.aliases.trim() || undefined,
      date_of_birth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      physical_description: form.physicalDescription.trim() || undefined,
      threat_level: form.threatLevel as PoiThreatLevel,
      summary: form.summary.trim(),
      internal_notes: form.internalNotes.trim() || undefined,
      community_ids: form.sites,
      photo_file_ids: photoFileIds,
      related_incident_ids: relatedIds.length ? relatedIds : undefined,
    }

    if (!isEdit.value) {
      if (!form.recordType) return
      const createPayload: any = {
        ...basePayload,
        record_type: form.recordType as PoiRecordType,
        publish,
      }
      if (isPOI.value) {
        Object.assign(createPayload, {
          incident_history_summary: form.incidentHistorySummary.trim() || undefined,
          watch_level_review_date: form.watchLevelReviewDate || undefined,
          associated_individuals: form.associatedIndividuals.trim() || undefined,
        })
      }
      if (isTrespass.value) {
        const noticeDocId = await uploadDoc(trespassDocFile.value)
        const payload: any = {
          trespass_notice_number: form.trespassNoticeNumber.trim(),
          issuing_authority: form.trespassIssuingAuthority.trim(),
          property_area_covered: form.propertyAreaCovered.trim(),
          issue_date: form.trespassIssueDate,
          expiry_date: form.trespassExpiryDate,
          renewal_reminder_days: form.trespassRenewalReminder ?? -1,
          law_enforcement_contact: form.lawEnforcementContact.trim() || undefined,
          conditions: form.conditions.trim() || undefined,
        }
        if (noticeDocId) payload.notice_document_file_id = noticeDocId as number
        Object.assign(createPayload, payload)
      }
      if (isMetro.value) {
        const cardDocId = await uploadDoc(metroCardFile.value)
        const payload: any = {
          red_card_number: form.redCardNumber.trim(),
          issuing_authority: form.metroIssuingAuthority.trim(),
          issue_date: form.metroIssueDate,
          expiry_date: form.metroExpiryDate,
          lines: form.metroLines.trim() || undefined,
          renewal_reminder_days: form.metroRenewalReminder ?? -1,
        }
        if (cardDocId) payload.card_document_file_id = cardDocId as number
        Object.assign(createPayload, payload)
      }
      await poiApi.createPoiRecord(createPayload)
      toastStore.success(publish ? t('poi.create_publish_success') : t('poi.create_draft_success'))
    } else {
      if (!props.record) return
      const updatePayload: any = {
        record_id: props.record.record_id,
        ...basePayload,
      }
      if (!photosDirty.value) {
        delete updatePayload.photo_file_ids
      }
      if (isPOI.value) {
        Object.assign(updatePayload, {
          incident_history_summary: form.incidentHistorySummary.trim() || null,
          watch_level_review_date: form.watchLevelReviewDate || null,
          associated_individuals: form.associatedIndividuals.trim() || null,
        })
      }
      if (isTrespass.value) {
        const noticeDocId = await uploadDoc(trespassDocFile.value)
        const payload: any = {
          trespass_notice_number: form.trespassNoticeNumber.trim(),
          issuing_authority: form.trespassIssuingAuthority.trim(),
          property_area_covered: form.propertyAreaCovered.trim(),
          issue_date: form.trespassIssueDate,
          expiry_date: form.trespassExpiryDate,
          renewal_reminder_days: form.trespassRenewalReminder ?? -1,
          law_enforcement_contact: form.lawEnforcementContact.trim() || null,
          conditions: form.conditions.trim() || null,
        }
        if (replaceTrespassDoc.value || trespassDocFile.value) {
          if (noticeDocId) payload.notice_document_file_id = noticeDocId as number
        }
        Object.assign(updatePayload, payload)
      }
      if (isMetro.value) {
        const cardDocId = await uploadDoc(metroCardFile.value)
        const payload: any = {
          red_card_number: form.redCardNumber.trim(),
          issuing_authority: form.metroIssuingAuthority.trim(),
          issue_date: form.metroIssueDate,
          expiry_date: form.metroExpiryDate,
          lines: form.metroLines.trim() || null,
          renewal_reminder_days: form.metroRenewalReminder ?? -1,
        }
        if (replaceMetroCard.value || metroCardFile.value) {
          if (cardDocId) payload.card_document_file_id = cardDocId as number
        }
        Object.assign(updatePayload, payload)
      }
      await poiApi.updatePoiRecord(updatePayload)
      toastStore.success(t('poi.update_success'))
    }

    router.push('/poi')
  } catch (err) {
    console.error('Failed to save POI record:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to save record')
  } finally {
    isSubmitting.value = false
  }
}

function handleSaveDraft() {
  submitForm(false)
}

function handlePublish() {
  submitForm(true)
}

function handleCancel() {
  router.push('/poi')
}
</script>

<template>
  <div class="poi-form">
    <!-- Page header -->
    <div class="poi-form__page-header">
      <button class="back-btn" @click="handleCancel">
        <Icon name="lucide:arrow-left" :size="16" />
      </button>
      <div>
        <h1 class="poi-form__page-title">{{ pageTitle }}</h1>
        <p class="poi-form__page-sub">{{ t('poi.form_subtitle') }}</p>
      </div>
    </div>

    <div class="poi-form__body">
      <!-- ── SECTION: Record Type ── -->
      <div class="form-section">
        <div class="form-section__header">
          <Icon name="lucide:tag" :size="16" />
          <h2 class="form-section__title">{{ t('poi.section_record_type') }}</h2>
        </div>
        <div class="form-section__body">
          <div class="type-selector">
            <button
              class="type-option"
              :class="{ 'type-option--active': form.recordType === 'poi', 'type-option--disabled': isEdit }"
              :disabled="isEdit"
              @click="form.recordType = 'poi'"
            >
              <Icon name="lucide:user-search" :size="20" />
              <span class="type-option__label">{{ t('poi.type_poi') }}</span>
              <span class="type-option__desc">{{ t('poi.type_poi_desc') }}</span>
            </button>
            <button
              class="type-option"
              :class="{ 'type-option--active': form.recordType === 'trespass', 'type-option--disabled': isEdit }"
              :disabled="isEdit"
              @click="form.recordType = 'trespass'"
            >
              <Icon name="lucide:ban" :size="20" />
              <span class="type-option__label">{{ t('poi.type_trespass') }}</span>
              <span class="type-option__desc">{{ t('poi.type_trespass_desc') }}</span>
            </button>
            <button
              class="type-option"
              :class="{ 'type-option--active': form.recordType === 'metro_red_card', 'type-option--disabled': isEdit }"
              :disabled="isEdit"
              @click="form.recordType = 'metro_red_card'"
            >
              <Icon name="lucide:train-front" :size="20" />
              <span class="type-option__label">{{ t('poi.type_metro') }}</span>
              <span class="type-option__desc">{{ t('poi.type_metro_desc') }}</span>
            </button>
          </div>
          <span v-if="errors.recordType" class="field-error">{{ errors.recordType }}</span>
        </div>
      </div>

      <template v-if="hasType">
        <!-- ── SECTION: Basic Info ── -->
        <div class="form-section">
          <div class="form-section__header">
            <Icon name="lucide:user" :size="16" />
            <h2 class="form-section__title">{{ t('poi.section_basic_info') }}</h2>
          </div>
          <div class="form-section__body">
            <div class="form-grid form-grid--2">
              <div class="form-field" :class="{ 'form-field--error': errors.firstName }">
                <label class="form-field__label">{{ t('poi.field_first_name') }} <span class="req">*</span></label>
                <input v-model="form.firstName" type="text" class="form-field__input" maxlength="60" />
                <span v-if="errors.firstName" class="field-error">{{ errors.firstName }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.lastName }">
                <label class="form-field__label">{{ t('poi.field_last_name') }} <span class="req">*</span></label>
                <input v-model="form.lastName" type="text" class="form-field__input" maxlength="60" />
                <span v-if="errors.lastName" class="field-error">{{ errors.lastName }}</span>
              </div>
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_dob') }}</label>
                <input v-model="form.dateOfBirth" type="date" class="form-field__input" />
              </div>
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_gender') }}</label>
                <select v-model="form.gender" class="form-field__select">
                  <option value="">{{ t('common.select') }}</option>
                  <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
              <div class="form-field form-field--full">
                <label class="form-field__label">{{ t('poi.field_aliases') }}</label>
                <input v-model="form.aliases" type="text" class="form-field__input" maxlength="200" :placeholder="t('poi.field_aliases_placeholder')" />
              </div>
              <div class="form-field form-field--full">
                <label class="form-field__label">{{ t('poi.field_physical_desc') }}</label>
                <textarea v-model="form.physicalDescription" class="form-field__textarea" rows="3" maxlength="500" />
              </div>
            </div>
          </div>
        </div>

        <!-- ── SECTION: Threat & Sites ── -->
        <div class="form-section">
          <div class="form-section__header">
            <Icon name="lucide:shield-alert" :size="16" />
            <h2 class="form-section__title">{{ t('poi.section_threat_sites') }}</h2>
          </div>
          <div class="form-section__body">
            <div class="form-grid form-grid--2">
              <div class="form-field" :class="{ 'form-field--error': errors.threatLevel }">
                <label class="form-field__label">{{ t('poi.field_threat_level') }} <span class="req">*</span></label>
                <div class="threat-selector">
                  <button
                    v-for="lvl in ['low', 'medium', 'high', 'critical']"
                    :key="lvl"
                    class="threat-btn"
                    :class="[`threat-btn--${lvl}`, { 'threat-btn--active': form.threatLevel === lvl }]"
                    type="button"
                    @click="form.threatLevel = lvl as PoiThreatLevel"
                  >
                    {{ t(`poi.threat_${lvl}`) }}
                  </button>
                </div>
                <span v-if="errors.threatLevel" class="field-error">{{ errors.threatLevel }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.sites }">
                <label class="form-field__label">{{ t('poi.field_sites') }} <span class="req">*</span></label>
                <div class="sites-selector">
                  <button
                    v-for="community in communities"
                    :key="community.community_id"
                    type="button"
                    class="site-chip"
                    :class="{ 'site-chip--active': form.sites.includes(community.community_id) }"
                    @click="toggleSite(community.community_id)"
                  >
                    {{ community.name }}
                  </button>
                </div>
                <span v-if="form.sites.length" class="field-hint">{{ form.sites.length }} selected</span>
                <span v-if="errors.sites" class="field-error">{{ errors.sites }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── SECTION: Photos ── -->
        <div class="form-section">
          <div class="form-section__header">
            <Icon name="lucide:image" :size="16" />
            <h2 class="form-section__title">{{ t('poi.section_photos') }}</h2>
            <span class="section-badge">{{ photos.length }}/10</span>
          </div>
          <div class="form-section__body">
            <div class="photo-grid">
              <div
                v-for="(photo, idx) in photos"
                :key="photo.key"
                class="photo-item"
                draggable="true"
                :class="{ 'photo-item--primary': idx === 0 }"
                @dragstart="onPhotoDragStart(idx)"
                @dragover.prevent="onPhotoDragOver(idx)"
                @dragend="onPhotoDragEnd"
              >
                <img :src="photo.url" :alt="`Photo ${idx + 1}`" class="photo-item__img" />
                <span v-if="idx === 0" class="photo-item__primary-badge">{{ t('poi.photo_primary') }}</span>
                <button class="photo-item__remove" type="button" @click="removePhoto(idx)">
                  <Icon name="lucide:x" :size="12" />
                </button>
              </div>
              <label v-if="photos.length < 10" class="photo-add">
                <Icon name="lucide:plus" :size="20" />
                <span>{{ t('poi.add_photo') }}</span>
                <input type="file" accept="image/*" multiple class="hidden-input" @change="handlePhotoUpload" />
              </label>
            </div>
            <p class="field-hint">{{ t('poi.photo_hint') }}</p>
            <p class="field-hint">{{ t('poi.photo_drag_hint') }}</p>
            <span v-if="photoError" class="field-error">{{ photoError }}</span>
          </div>
        </div>

        <!-- ── SECTION: Summary & Notes ── -->
        <div class="form-section">
          <div class="form-section__header">
            <Icon name="lucide:file-text" :size="16" />
            <h2 class="form-section__title">{{ t('poi.section_summary') }}</h2>
          </div>
          <div class="form-section__body">
            <div class="form-grid form-grid--1">
              <div class="form-field" :class="{ 'form-field--error': errors.summary }">
                <label class="form-field__label">{{ t('poi.field_summary') }} <span class="req">*</span></label>
                <textarea v-model="form.summary" class="form-field__textarea" rows="3" maxlength="300" :placeholder="t('poi.field_summary_placeholder')" />
                <span class="char-count">{{ form.summary.length }}/300</span>
                <span v-if="errors.summary" class="field-error">{{ errors.summary }}</span>
              </div>
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_internal_notes') }}</label>
                <p class="field-hint field-hint--inline">{{ t('poi.field_internal_notes_hint') }}</p>
                <textarea v-model="form.internalNotes" class="form-field__textarea" rows="4" maxlength="2000" />
                <span class="char-count">{{ form.internalNotes.length }}/2000</span>
              </div>
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_related_incidents') }}</label>
                <input v-model="form.relatedIncidentIds" type="text" class="form-field__input" :placeholder="t('poi.field_related_incidents_placeholder')" />
              </div>
            </div>
          </div>
        </div>

        <!-- ── SECTION: POI Details (POI only) ── -->
        <div v-if="isPOI" class="form-section form-section--conditional form-section--poi">
          <div class="form-section__header">
            <Icon name="lucide:user-search" :size="16" />
            <h2 class="form-section__title">{{ t('poi.section_poi_details') }}</h2>
            <span class="section-type-badge section-type-badge--poi">{{ t('poi.type_poi') }}</span>
          </div>
          <div class="form-section__body">
            <div class="form-grid form-grid--1">
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_incident_history') }}</label>
                <textarea v-model="form.incidentHistorySummary" class="form-field__textarea" rows="4" maxlength="1000" />
                <span class="char-count">{{ form.incidentHistorySummary.length }}/1000</span>
              </div>
              <div class="form-grid form-grid--2">
                <div class="form-field">
                  <label class="form-field__label">{{ t('poi.field_watch_review_date') }}</label>
                  <input v-model="form.watchLevelReviewDate" type="date" class="form-field__input" />
                  <p class="field-hint">{{ t('poi.field_watch_review_date_hint') }}</p>
                </div>
                <div class="form-field">
                  <label class="form-field__label">{{ t('poi.field_associated_individuals') }}</label>
                  <textarea v-model="form.associatedIndividuals" class="form-field__textarea" rows="3" maxlength="500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── SECTION: Trespass Details (Trespass only) ── -->
        <div v-if="isTrespass" class="form-section form-section--conditional form-section--trespass">
          <div class="form-section__header">
            <Icon name="lucide:ban" :size="16" />
            <h2 class="form-section__title">{{ t('poi.section_trespass_details') }}</h2>
            <span class="section-type-badge section-type-badge--trespass">{{ t('poi.type_trespass') }}</span>
          </div>
          <div class="form-section__body">
            <div class="form-grid form-grid--2">
              <div class="form-field" :class="{ 'form-field--error': errors.trespassNoticeNumber }">
                <label class="form-field__label">{{ t('poi.field_notice_number') }} <span class="req">*</span></label>
                <input v-model="form.trespassNoticeNumber" type="text" class="form-field__input" />
                <span v-if="errors.trespassNoticeNumber" class="field-error">{{ errors.trespassNoticeNumber }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.trespassIssuingAuthority }">
                <label class="form-field__label">{{ t('poi.field_issuing_authority') }} <span class="req">*</span></label>
                <input v-model="form.trespassIssuingAuthority" type="text" class="form-field__input" />
                <span v-if="errors.trespassIssuingAuthority" class="field-error">{{ errors.trespassIssuingAuthority }}</span>
              </div>
              <div class="form-field form-field--full" :class="{ 'form-field--error': errors.propertyAreaCovered }">
                <label class="form-field__label">{{ t('poi.field_property_area') }} <span class="req">*</span></label>
                <textarea v-model="form.propertyAreaCovered" class="form-field__textarea" rows="2" />
                <span v-if="errors.propertyAreaCovered" class="field-error">{{ errors.propertyAreaCovered }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.trespassIssueDate }">
                <label class="form-field__label">{{ t('poi.field_issue_date') }} <span class="req">*</span></label>
                <input v-model="form.trespassIssueDate" type="date" class="form-field__input" />
                <span v-if="errors.trespassIssueDate" class="field-error">{{ errors.trespassIssueDate }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.trespassExpiryDate }">
                <label class="form-field__label">{{ t('poi.field_expiry_date') }} <span class="req">*</span></label>
                <input v-model="form.trespassExpiryDate" type="date" class="form-field__input" />
                <span v-if="errors.trespassExpiryDate" class="field-error">{{ errors.trespassExpiryDate }}</span>
              </div>
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_renewal_reminder') }}</label>
                <div class="input-with-suffix">
                  <input v-model.number="form.trespassRenewalReminder" type="number" min="1" max="365" class="form-field__input" />
                  <span class="input-suffix">{{ t('poi.days_before_expiry') }}</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_law_enforcement') }}</label>
                <input v-model="form.lawEnforcementContact" type="text" class="form-field__input" />
              </div>
              <div class="form-field form-field--full">
                <label class="form-field__label">{{ t('poi.field_conditions') }}</label>
                <textarea v-model="form.conditions" class="form-field__textarea" rows="3" />
              </div>
              <div class="form-field form-field--full">
                <label class="form-field__label">{{ t('poi.field_notice_document') }} <span class="req">*</span></label>
                <div v-if="props.record?.notice_document && !replaceTrespassDoc && !trespassDocFile" class="file-preview">
                  <a :href="props.record.notice_document" target="_blank" class="file-preview__link">{{ t('poi.current_document') }}</a>
                  <button type="button" class="file-preview__replace" @click="replaceTrespassDoc = true">
                    <Icon name="lucide:rotate-ccw" :size="14" />
                    {{ t('poi.replace_document') }}
                  </button>
                </div>
                <div v-else class="file-upload-area">
                  <label class="file-upload-btn">
                    <Icon name="lucide:upload" :size="16" />
                    <span>{{ trespassDocFile ? trespassDocFile.name : t('poi.upload_pdf') }}</span>
                    <input type="file" accept=".pdf,image/*" class="hidden-input" @change="handleTrespassDoc" />
                  </label>
                </div>
                <p class="field-hint">{{ t('poi.notice_doc_hint') }}</p>
                <span v-if="trespassDocError" class="field-error">{{ trespassDocError }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── SECTION: Metro Red Card Details (Metro only) ── -->
        <div v-if="isMetro" class="form-section form-section--conditional form-section--metro">
          <div class="form-section__header">
            <Icon name="lucide:train-front" :size="16" />
            <h2 class="form-section__title">{{ t('poi.section_metro_details') }}</h2>
            <span class="section-type-badge section-type-badge--metro">{{ t('poi.type_metro') }}</span>
          </div>
          <div class="form-section__body">
            <div class="form-grid form-grid--2">
              <div class="form-field" :class="{ 'form-field--error': errors.redCardNumber }">
                <label class="form-field__label">{{ t('poi.field_red_card_number') }} <span class="req">*</span></label>
                <input v-model="form.redCardNumber" type="text" class="form-field__input" />
                <span v-if="errors.redCardNumber" class="field-error">{{ errors.redCardNumber }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.metroIssuingAuthority }">
                <label class="form-field__label">{{ t('poi.field_issuing_authority') }} <span class="req">*</span></label>
                <input v-model="form.metroIssuingAuthority" type="text" class="form-field__input" />
                <span v-if="errors.metroIssuingAuthority" class="field-error">{{ errors.metroIssuingAuthority }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.metroIssueDate }">
                <label class="form-field__label">{{ t('poi.field_issue_date') }} <span class="req">*</span></label>
                <input v-model="form.metroIssueDate" type="date" class="form-field__input" />
                <span v-if="errors.metroIssueDate" class="field-error">{{ errors.metroIssueDate }}</span>
              </div>
              <div class="form-field" :class="{ 'form-field--error': errors.metroExpiryDate }">
                <label class="form-field__label">{{ t('poi.field_expiry_date') }} <span class="req">*</span></label>
                <input v-model="form.metroExpiryDate" type="date" class="form-field__input" />
                <span v-if="errors.metroExpiryDate" class="field-error">{{ errors.metroExpiryDate }}</span>
              </div>
              <div class="form-field form-field--full">
                <label class="form-field__label">{{ t('poi.field_metro_lines') }}</label>
                <input v-model="form.metroLines" type="text" class="form-field__input" :placeholder="t('poi.field_metro_lines_placeholder')" />
              </div>
              <div class="form-field">
                <label class="form-field__label">{{ t('poi.field_renewal_reminder') }}</label>
                <div class="input-with-suffix">
                  <input v-model.number="form.metroRenewalReminder" type="number" min="1" max="365" class="form-field__input" />
                  <span class="input-suffix">{{ t('poi.days_before_expiry') }}</span>
                </div>
              </div>
              <div class="form-field form-field--full">
                <label class="form-field__label">{{ t('poi.field_card_document') }}</label>
                <div v-if="props.record?.card_document && !replaceMetroCard && !metroCardFile" class="file-preview">
                  <a :href="props.record.card_document" target="_blank" class="file-preview__link">{{ t('poi.current_document') }}</a>
                  <button type="button" class="file-preview__replace" @click="replaceMetroCard = true">
                    <Icon name="lucide:rotate-ccw" :size="14" />
                    {{ t('poi.replace_document') }}
                  </button>
                </div>
                <div v-else class="file-upload-area">
                  <label class="file-upload-btn">
                    <Icon name="lucide:upload" :size="16" />
                    <span>{{ metroCardFile ? metroCardFile.name : t('poi.upload_card_doc') }}</span>
                    <input type="file" accept=".pdf,image/*" class="hidden-input" @change="handleMetroCard" />
                  </label>
                </div>
                <p class="field-hint">{{ t('poi.card_doc_hint') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Footer Actions ── -->
        <div class="poi-form__footer">
          <AppButton :text="t('common.cancel')" type="secondary" size="sm" :disabled="isSubmitting" @click="handleCancel" />
          <div class="footer-actions-right">
            <AppButton
              v-if="!isEdit"
              :text="t('poi.save_draft')"
              icon="lucide:save"
              type="secondary"
              size="sm"
              :loading="isSubmitting"
              @click="handleSaveDraft"
            />
            <AppButton
              :text="isEdit ? t('poi.save_changes') : t('poi.publish')"
              :icon="isEdit ? 'lucide:save' : 'lucide:send'"
              type="primary"
              size="sm"
              :loading="isSubmitting"
              @click="handlePublish"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Page layout ── */
.poi-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.poi-form__page-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
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

.poi-form__page-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 2px;
}
.poi-form__page-sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.poi-form__body {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 960px;
  width: 100%;
}

/* ── Section card ── */
.form-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-section--conditional {
  border-style: dashed;
}

.form-section--poi    { border-color: rgba(139, 92, 246, 0.4); }
.form-section--trespass { border-color: rgba(249, 115, 22, 0.4); }
.form-section--metro  { border-color: rgba(239, 68, 68, 0.4); }

.form-section__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.form-section__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.section-badge {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 1px var(--space-2);
}

.section-type-badge {
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}
.section-type-badge--poi     { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.section-type-badge--trespass { background: rgba(249, 115, 22, 0.15); color: #f97316; }
.section-type-badge--metro   { background: rgba(239, 68, 68, 0.15);  color: #ef4444; }

.form-section__body {
  padding: var(--space-5);
}

/* ── Grid ── */
.form-grid {
  display: grid;
  gap: var(--space-4);
}
.form-grid--1 { grid-template-columns: 1fr; }
.form-grid--2 { grid-template-columns: 1fr 1fr; }

.form-field--full { grid-column: 1 / -1; }

/* ── Form fields ── */
.form-field { display: flex; flex-direction: column; gap: var(--space-1); }

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.req { color: var(--color-critical); }

.form-field__input,
.form-field__select,
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
  transition: border-color var(--transition-base);
}

.form-field__input:focus,
.form-field__select:focus,
.form-field__textarea:focus { border-color: var(--color-accent); }

.form-field__textarea { resize: vertical; min-height: 72px; }

.form-field--error .form-field__input,
.form-field--error .form-field__select,
.form-field--error .form-field__textarea { border-color: var(--color-critical); }

.field-error {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.field-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}
.field-hint--inline { margin-bottom: var(--space-1); }

.char-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
}

/* ── Type selector ── */
.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  background: var(--color-bg-base);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  text-align: center;
  transition: all var(--transition-base);
}
.type-option:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-text-primary); }
.type-option--active { border-color: var(--color-accent); background: rgba(var(--color-accent-rgb, 17 150 173), 0.08); color: var(--color-text-primary); }
.type-option:disabled,
.type-option--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.type-option:disabled:hover,
.type-option--disabled:hover {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.type-option__label { font-size: var(--font-size-sm); font-weight: 600; }
.type-option__desc  { font-size: var(--font-size-xs); color: var(--color-text-muted); line-height: 1.4; }

/* ── Threat selector ── */
.threat-selector {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.threat-btn {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-muted);
}
.threat-btn--low.threat-btn--active     { background: var(--color-bg-overlay); color: var(--color-text-secondary); border-color: var(--color-border); }
.threat-btn--medium.threat-btn--active  { background: rgba(234,179,8,0.15); color: #ca8a04; border-color: #ca8a04; }
.threat-btn--high.threat-btn--active    { background: rgba(249,115,22,0.15); color: #ea580c; border-color: #ea580c; }
.threat-btn--critical.threat-btn--active { background: rgba(239,68,68,0.15); color: #ef4444; border-color: #ef4444; }

/* ── Sites selector ── */
.sites-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.site-chip {
  padding: 4px var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}
.site-chip--active {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

/* ── Photo grid ── */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.photo-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  cursor: grab;
}
.photo-item--primary {
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb, 17 150 173), 0.15);
}

.photo-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-item__primary-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  padding: 1px 4px;
  background: var(--color-accent);
  color: #000;
  font-size: 9px;
  font-weight: 700;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.photo-item__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: var(--radius-full);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.photo-add {
  width: 80px;
  height: 80px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: border-color var(--transition-base);
}
.photo-add:hover { border-color: var(--color-accent); color: var(--color-accent); }

/* ── File upload ── */
.file-preview {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.file-preview__link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
}
.file-preview__link:hover { text-decoration: underline; }

.file-preview__replace {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}
.file-preview__replace:hover { border-color: var(--color-accent); color: var(--color-accent); }

.file-upload-area {
  display: inline-flex;
}

.file-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}
.file-upload-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

/* ── Input with suffix ── */
.input-with-suffix {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.input-with-suffix .form-field__input { flex: 1; }
.input-suffix {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* ── Hidden input ── */
.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* ── Footer ── */
.poi-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.footer-actions-right {
  display: flex;
  gap: var(--space-3);
}

</style>
