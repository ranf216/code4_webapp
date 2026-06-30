<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

type RecordType = 'poi' | 'trespass' | 'metro_red_card'

interface POIRecord {
  id?: string
  recordType: RecordType | ''
  status: string
  firstName: string
  lastName: string
  aliases: string
  dateOfBirth: string
  gender: string
  physicalDescription: string
  summary: string
  internalNotes: string
  sites: string[]
  threatLevel: string
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
  existingPhotos?: string[]
}

interface POIFormData {
  // Common
  recordType: RecordType | ''
  status: string
  firstName: string
  lastName: string
  aliases: string
  dateOfBirth: string
  gender: string
  physicalDescription: string
  summary: string
  internalNotes: string
  sites: string[]
  threatLevel: string
  relatedIncidentIds: string
  // POI only
  incidentHistorySummary: string
  watchLevelReviewDate: string
  associatedIndividuals: string
  // Trespass only
  trespassNoticeNumber: string
  trespassIssuingAuthority: string
  propertyAreaCovered: string
  trespassIssueDate: string
  trespassExpiryDate: string
  trespassRenewalReminder: number | null
  lawEnforcementContact: string
  conditions: string
  // Metro Red Card only
  redCardNumber: string
  metroIssuingAuthority: string
  metroIssueDate: string
  metroExpiryDate: string
  metroLines: string
  metroRenewalReminder: number | null
}

const props = defineProps<{
  mode: 'create' | 'edit'
  record?: POIRecord
}>()

const { t } = useTranslation()
const router = useRouter()

const isSubmitting = ref(false)
const photoFiles = ref<File[]>([])
const photoPreviewUrls = ref<string[]>([...(props.record?.existingPhotos ?? [])])
const trespassDocFile = ref<File | null>(null)
const metroCardFile = ref<File | null>(null)
const exportFiles = ref<File[]>([])

const isEdit = computed(() => props.mode === 'edit')
const pageTitle = computed(() => isEdit.value ? t('poi.form_title_edit') : t('poi.form_title_create'))

function buildInitialForm(): POIFormData {
  const r = props.record
  return {
    recordType: r?.recordType ?? '',
    status: r?.status ?? 'draft',
    firstName: r?.firstName ?? '',
    lastName: r?.lastName ?? '',
    aliases: r?.aliases ?? '',
    dateOfBirth: r?.dateOfBirth ?? '',
    gender: r?.gender ?? '',
    physicalDescription: r?.physicalDescription ?? '',
    summary: r?.summary ?? '',
    internalNotes: r?.internalNotes ?? '',
    sites: r?.sites ? [...r.sites] : [],
    threatLevel: r?.threatLevel ?? '',
    relatedIncidentIds: r?.relatedIncidentIds ?? '',
    incidentHistorySummary: r?.incidentHistorySummary ?? '',
    watchLevelReviewDate: r?.watchLevelReviewDate ?? '',
    associatedIndividuals: r?.associatedIndividuals ?? '',
    trespassNoticeNumber: r?.trespassNoticeNumber ?? '',
    trespassIssuingAuthority: r?.trespassIssuingAuthority ?? '',
    propertyAreaCovered: r?.propertyAreaCovered ?? '',
    trespassIssueDate: r?.trespassIssueDate ?? '',
    trespassExpiryDate: r?.trespassExpiryDate ?? '',
    trespassRenewalReminder: r?.trespassRenewalReminder ?? 14,
    lawEnforcementContact: r?.lawEnforcementContact ?? '',
    conditions: r?.conditions ?? '',
    redCardNumber: r?.redCardNumber ?? '',
    metroIssuingAuthority: r?.metroIssuingAuthority ?? '',
    metroIssueDate: r?.metroIssueDate ?? '',
    metroExpiryDate: r?.metroExpiryDate ?? '',
    metroLines: r?.metroLines ?? '',
    metroRenewalReminder: r?.metroRenewalReminder ?? 14,
  }
}

const form = reactive<POIFormData>(buildInitialForm())

const errors = reactive<Partial<Record<keyof POIFormData, string>>>({})
const photoError = ref('')

const isPOI = computed(() => form.recordType === 'poi')
const isTrespass = computed(() => form.recordType === 'trespass')
const isMetro = computed(() => form.recordType === 'metro_red_card')
const hasType = computed(() => form.recordType !== '')

// ── Photo upload ──
function handlePhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const newFiles = Array.from(input.files)
  for (const file of newFiles) {
    if (photoFiles.value.length >= 10) break
    if (file.size > 5 * 1024 * 1024) continue
    photoFiles.value.push(file)
    photoPreviewUrls.value.push(URL.createObjectURL(file))
  }
  input.value = ''
}

function removePhoto(index: number) {
  URL.revokeObjectURL(photoPreviewUrls.value[index] ?? '')
  photoFiles.value.splice(index, 1)
  photoPreviewUrls.value.splice(index, 1)
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

  if (!form.recordType) e.recordType = t('validation.required')
  if (!form.firstName.trim()) e.firstName = t('validation.required')
  if (!form.lastName.trim()) e.lastName = t('validation.required')
  if (!form.threatLevel) e.threatLevel = t('validation.required')
  if (!form.summary.trim()) e.summary = t('validation.required')
  if (form.sites.length === 0) e.sites = t('validation.required')
  if (photoFiles.value.length === 0) photoError.value = t('validation.required')
  else photoError.value = ''

  if (isTrespass.value) {
    if (!form.trespassNoticeNumber.trim()) e.trespassNoticeNumber = t('validation.required')
    if (!form.trespassIssuingAuthority.trim()) e.trespassIssuingAuthority = t('validation.required')
    if (!form.propertyAreaCovered.trim()) e.propertyAreaCovered = t('validation.required')
    if (!form.trespassIssueDate) e.trespassIssueDate = t('validation.required')
    if (!form.trespassExpiryDate) e.trespassExpiryDate = t('validation.required')
  }

  if (isMetro.value) {
    if (!form.redCardNumber.trim()) e.redCardNumber = t('validation.required')
    if (!form.metroIssuingAuthority.trim()) e.metroIssuingAuthority = t('validation.required')
    if (!form.metroIssueDate) e.metroIssueDate = t('validation.required')
    if (!form.metroExpiryDate) e.metroExpiryDate = t('validation.required')
  }

  return Object.keys(errors).length === 0 && !photoError.value
}

function handleSaveDraft() {
  form.status = 'draft'
  submitForm()
}

function handlePublish() {
  form.status = 'active'
  if (!validate()) return
  submitForm()
}

function submitForm() {
  isSubmitting.value = true
  const action = isEdit.value ? 'update' : 'create'
  console.log(`[POIForm] ${action}`, props.record?.id ?? 'new', form)
  setTimeout(() => {
    isSubmitting.value = false
    router.push('/poi')
  }, 800)
}

function handleCancel() {
  router.push('/poi')
}

// Demo sites list
const availableSites = ['Central Hub', 'North Gate', 'South Plaza', 'Metro Station A', 'Metro Station B', 'West Wing', 'East Block']

function toggleSite(site: string) {
  const idx = form.sites.indexOf(site)
  if (idx === -1) form.sites.push(site)
  else form.sites.splice(idx, 1)
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
              :class="{ 'type-option--active': form.recordType === 'poi' }"
              @click="form.recordType = 'poi'"
            >
              <Icon name="lucide:user-search" :size="20" />
              <span class="type-option__label">{{ t('poi.type_poi') }}</span>
              <span class="type-option__desc">{{ t('poi.type_poi_desc') }}</span>
            </button>
            <button
              class="type-option"
              :class="{ 'type-option--active': form.recordType === 'trespass' }"
              @click="form.recordType = 'trespass'"
            >
              <Icon name="lucide:ban" :size="20" />
              <span class="type-option__label">{{ t('poi.type_trespass') }}</span>
              <span class="type-option__desc">{{ t('poi.type_trespass_desc') }}</span>
            </button>
            <button
              class="type-option"
              :class="{ 'type-option--active': form.recordType === 'metro_red_card' }"
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
                  <option value="male">{{ t('poi.gender_male') }}</option>
                  <option value="female">{{ t('poi.gender_female') }}</option>
                  <option value="unknown">{{ t('poi.gender_unknown') }}</option>
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
                    @click="form.threatLevel = lvl"
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
                    v-for="site in availableSites"
                    :key="site"
                    type="button"
                    class="site-chip"
                    :class="{ 'site-chip--active': form.sites.includes(site) }"
                    @click="toggleSite(site)"
                  >
                    {{ site }}
                  </button>
                </div>
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
            <span class="section-badge">{{ photoFiles.length }}/10</span>
          </div>
          <div class="form-section__body">
            <div class="photo-grid">
              <div
                v-for="(url, idx) in photoPreviewUrls"
                :key="idx"
                class="photo-item"
              >
                <img :src="url" :alt="`Photo ${idx + 1}`" class="photo-item__img" />
                <button class="photo-item__remove" type="button" @click="removePhoto(idx)">
                  <Icon name="lucide:x" :size="12" />
                </button>
              </div>
              <label v-if="photoFiles.length < 10" class="photo-add">
                <Icon name="lucide:plus" :size="20" />
                <span>{{ t('poi.add_photo') }}</span>
                <input type="file" accept="image/*" multiple class="hidden-input" @change="handlePhotoUpload" />
              </label>
            </div>
            <p class="field-hint">{{ t('poi.photo_hint') }}</p>
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
                <div class="file-upload-area">
                  <label class="file-upload-btn">
                    <Icon name="lucide:upload" :size="16" />
                    <span>{{ trespassDocFile ? trespassDocFile.name : t('poi.upload_pdf') }}</span>
                    <input type="file" accept=".pdf" class="hidden-input" @change="handleTrespassDoc" />
                  </label>
                </div>
                <p class="field-hint">{{ t('poi.notice_doc_hint') }}</p>
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
                <div class="file-upload-area">
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
          <button type="button" class="btn-cancel" @click="handleCancel">
            {{ t('common.cancel') }}
          </button>
          <div class="footer-actions-right">
            <button v-if="!isEdit" type="button" class="btn-draft" :disabled="isSubmitting" @click="handleSaveDraft">
              <Icon name="lucide:save" :size="15" />
              {{ t('poi.save_draft') }}
            </button>
            <button type="button" class="btn-publish" :disabled="isSubmitting" @click="handlePublish">
              <Icon v-if="isSubmitting" name="lucide:loader-2" :size="15" class="spin" />
              <Icon v-else :name="isEdit ? 'lucide:save' : 'lucide:send'" :size="15" />
              {{ isEdit ? t('poi.save_changes') : t('poi.publish') }}
            </button>
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
.type-option:hover { border-color: var(--color-accent); color: var(--color-text-primary); }
.type-option--active { border-color: var(--color-accent); background: rgba(var(--color-accent-rgb, 17 150 173), 0.08); color: var(--color-text-primary); }

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
}

.photo-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.btn-cancel {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}
.btn-cancel:hover { border-color: var(--color-text-secondary); color: var(--color-text-primary); }

.btn-draft {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}
.btn-draft:hover { border-color: var(--color-accent); color: var(--color-accent); }
.btn-draft:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-publish {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity var(--transition-base);
}
.btn-publish:hover { opacity: 0.88; }
.btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
