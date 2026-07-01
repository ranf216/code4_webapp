<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

type TemplateStatus = 'draft' | 'active' | 'archived'
type ReportCategory = 'incident' | 'daily_activity' | 'custom'
type CustomFieldType = 'text' | 'date' | 'location' | 'dropdown' | 'file_upload'

interface CustomField {
  id: string
  label: string
  description: string
  type: CustomFieldType
  maxChars?: number
  dropdownValues?: string
  dropdownMulti?: boolean
  maxFiles?: number
}

interface SectionField {
  id: string
  isCustom: boolean
  incidentFieldId?: string
  custom?: CustomField
}

interface TemplateSection {
  id: string
  title: string
  enabled: boolean
  required: boolean
  clientVisible: boolean
  fields: SectionField[]
}

interface TemplateRecord {
  id?: string
  name: string
  category: ReportCategory
  communities: string[]
  reportTitleFormat: string
  status: TemplateStatus
  reviewBeforeClient: boolean
  allowOfficerEditing: boolean
}

const props = defineProps<{
  mode: 'create' | 'edit'
  template?: TemplateRecord
}>()

const { t } = useTranslation()
const router = useRouter()

const isEdit = computed(() => props.mode === 'edit')
const pageTitle = computed(() =>
  isEdit.value ? t('tpl.editor_title_edit') : t('tpl.editor_title_create'),
)

const DEMO_COMMUNITIES = [
  'Global',
  'Sunset Heights',
  'Central Hub',
  'Green Valley',
  'Riverside',
  'North Gate',
]

const PLACEHOLDER_TOKENS = ['{date}', '{community}', '{officer}', '{template_name}', '{incident_type}']

function buildInitialForm(): TemplateRecord {
  if (props.template) {
    return {
      id: props.template.id,
      name: props.template.name,
      category: props.template.category,
      communities: [...props.template.communities],
      reportTitleFormat: props.template.reportTitleFormat,
      status: props.template.status,
      reviewBeforeClient: props.template.reviewBeforeClient,
      allowOfficerEditing: props.template.allowOfficerEditing,
    }
  }
  return {
    name: '',
    category: 'incident',
    communities: [],
    reportTitleFormat: '',
    status: 'draft',
    reviewBeforeClient: false,
    allowOfficerEditing: false,
  }
}

const form = reactive<TemplateRecord>(buildInitialForm())
const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)
const activePane = ref<'header' | 'sections'>('header')

// Community multi-select
const communityDropdownOpen = ref(false)

function toggleCommunity(c: string) {
  if (c === 'Global') {
    form.communities = form.communities.includes('Global') ? [] : ['Global']
    return
  }
  const idx = form.communities.indexOf(c)
  if (idx !== -1) {
    form.communities.splice(idx, 1)
  } else {
    form.communities = form.communities.filter((x: string) => x !== 'Global')
    form.communities.push(c)
  }
}

function isCommunitySelected(c: string) {
  return form.communities.includes(c)
}

const communityDisplayText = computed(() => {
  if (!form.communities.length) return t('tpl.communities_placeholder')
  if (form.communities.includes('Global')) return t('tpl.community_global')
  return form.communities.join(', ')
})

function insertToken(token: string) {
  form.reportTitleFormat += (form.reportTitleFormat ? ' ' : '') + token
}

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = t('validation.required')
  else if (form.name.length > 80) errors.name = t('validation.max_80')
  if (!form.communities.length) errors.communities = t('validation.required')
  if (!form.reportTitleFormat.trim()) errors.reportTitleFormat = t('validation.required')
  return Object.keys(errors).length === 0
}

function handleSaveDraft() {
  form.status = 'draft'
  submitForm()
}

function handlePublish() {
  form.status = 'active'
  if (validate()) submitForm()
}

function submitForm() {
  isSubmitting.value = true
  const action = isEdit.value ? 'update' : 'create'
  console.log(`[TemplateEditor] ${action}`, form)
  setTimeout(() => {
    isSubmitting.value = false
    router.push('/reports')
  }, 800)
}

function handleCancel() {
  router.push('/reports')
}

// ── Archive / Restore ─────────────────────────────────────────
const isArchived = computed(() => form.status === 'archived')
const showArchiveModal = ref(false)
const isArchiving = ref(false)

function handleArchive() {
  showArchiveModal.value = true
}

function confirmArchive() {
  isArchiving.value = true
  form.status = 'archived'
  console.log('[TemplateEditor] archive', form.id)
  setTimeout(() => {
    isArchiving.value = false
    showArchiveModal.value = false
    router.push('/reports')
  }, 600)
}

function handleRestore() {
  form.status = 'active'
  console.log('[TemplateEditor] restore', form.id)
  router.push('/reports')
}

const categoryOptions: { value: ReportCategory; label: string }[] = [
  { value: 'incident', label: 'Incident' },
  { value: 'daily_activity', label: 'Daily Activity' },
  { value: 'custom', label: 'Custom' },
]

// ── Sections ──────────────────────────────────────────────────
const INCIDENT_FIELDS = [
  { id: 'incident_type',   label: 'Incident Type' },
  { id: 'incident_date',   label: 'Incident Date & Time' },
  { id: 'location',        label: 'Location' },
  { id: 'description',     label: 'Description' },
  { id: 'persons_involved',label: 'Persons Involved' },
  { id: 'vehicles',        label: 'Vehicles' },
  { id: 'actions_taken',   label: 'Actions Taken' },
  { id: 'photos',          label: 'Photos / Media' },
  { id: 'police_report',   label: 'Police Report #' },
  { id: 'follow_up',       label: 'Follow-up Required' },
  { id: 'witness',         label: 'Witness Details' },
  { id: 'property_damage', label: 'Property Damage' },
]

function newSectionId() {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
function newFieldId() {
  return `fld-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const sections = ref<TemplateSection[]>([
  {
    id: newSectionId(),
    title: 'Incident Details',
    enabled: true,
    required: true,
    clientVisible: true,
    fields: [
      { id: newFieldId(), isCustom: false, incidentFieldId: 'incident_type' },
      { id: newFieldId(), isCustom: false, incidentFieldId: 'incident_date' },
      { id: newFieldId(), isCustom: false, incidentFieldId: 'location' },
    ],
  },
  {
    id: newSectionId(),
    title: 'Narrative',
    enabled: true,
    required: true,
    clientVisible: true,
    fields: [
      { id: newFieldId(), isCustom: false, incidentFieldId: 'description' },
    ],
  },
])

// Expanded/collapsed state per section
const expandedSections = ref<Record<string, boolean>>({})

function toggleSectionExpand(id: string) {
  expandedSections.value[id] = !expandedSections.value[id]
}

function isSectionExpanded(id: string) {
  return expandedSections.value[id] !== false // default expanded
}

// Add / remove sections
function addSection() {
  const sec: TemplateSection = {
    id: newSectionId(),
    title: '',
    enabled: true,
    required: true,
    clientVisible: true,
    fields: [],
  }
  sections.value.push(sec)
  expandedSections.value[sec.id] = true
}

function removeSection(sectionId: string) {
  sections.value = sections.value.filter((s: TemplateSection) => s.id !== sectionId)
}

// Drag reorder sections (simple up/down)
function moveSectionUp(index: number) {
  if (index === 0) return
  const arr = sections.value
  const a = arr[index - 1]
  const b = arr[index]
  if (!a || !b) return
  arr[index - 1] = b
  arr[index] = a
}
function moveSectionDown(index: number) {
  if (index >= sections.value.length - 1) return
  const arr = sections.value
  const a = arr[index]
  const b = arr[index + 1]
  if (!a || !b) return
  arr[index] = b
  arr[index + 1] = a
}

// ── Drag-and-drop state ──
const dragSectionId = ref<string | null>(null)
const dragOverSectionId = ref<string | null>(null)
const dragFieldKey = ref<string | null>(null) // "sectionId|fieldId"
const dragOverFieldKey = ref<string | null>(null)

function makeFieldKey(sectionId: string, fieldId: string) {
  return `${sectionId}|${fieldId}`
}

// ── Drag-and-drop: sections ──
function onSectionDragStart(e: DragEvent, sectionId: string) {
  dragSectionId.value = sectionId
  e.dataTransfer?.setData('text/plain', sectionId)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onSectionDragOver(e: DragEvent, sectionId: string) {
  e.preventDefault()
  if (dragSectionId.value && dragSectionId.value !== sectionId) {
    dragOverSectionId.value = sectionId
  }
}

function onSectionDragLeave() {
  dragOverSectionId.value = null
}

function onSectionDrop(e: DragEvent, targetSectionId: string) {
  e.preventDefault()
  dragOverSectionId.value = null
  const sourceId = e.dataTransfer?.getData('text/plain') || dragSectionId.value
  if (!sourceId || sourceId === targetSectionId) {
    dragSectionId.value = null
    return
  }
  const sourceIndex = sections.value.findIndex((s: TemplateSection) => s.id === sourceId)
  const targetIndex = sections.value.findIndex((s: TemplateSection) => s.id === targetSectionId)
  if (sourceIndex === -1 || targetIndex === -1) {
    dragSectionId.value = null
    return
  }
  const moved = sections.value[sourceIndex]
  if (!moved) {
    dragSectionId.value = null
    return
  }
  sections.value.splice(sourceIndex, 1)
  sections.value.splice(targetIndex, 0, moved)
  dragSectionId.value = null
}

function onSectionDragEnd() {
  dragSectionId.value = null
  dragOverSectionId.value = null
}

// ── Drag-and-drop: fields ──
function onFieldDragStart(e: DragEvent, sectionId: string, fieldId: string) {
  const key = makeFieldKey(sectionId, fieldId)
  dragFieldKey.value = key
  e.dataTransfer?.setData('text/plain', JSON.stringify({ sectionId, fieldId }))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onFieldDragOver(e: DragEvent, sectionId: string, fieldId: string) {
  e.preventDefault()
  const key = makeFieldKey(sectionId, fieldId)
  if (dragFieldKey.value && dragFieldKey.value !== key) {
    dragOverFieldKey.value = key
  }
}

function onFieldDragLeave() {
  dragOverFieldKey.value = null
}

function onFieldDrop(e: DragEvent, targetSectionId: string, targetFieldId: string) {
  e.preventDefault()
  dragOverFieldKey.value = null
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw || !dragFieldKey.value) {
    dragFieldKey.value = null
    return
  }
  let source: { sectionId: string; fieldId: string }
  try {
    source = JSON.parse(raw)
  } catch {
    dragFieldKey.value = null
    return
  }
  const sourceSection = sections.value.find((s: TemplateSection) => s.id === source.sectionId)
  const targetSection = sections.value.find((s: TemplateSection) => s.id === targetSectionId)
  if (!sourceSection || !targetSection) {
    dragFieldKey.value = null
    return
  }
  const sourceIndex = sourceSection.fields.findIndex((f: SectionField) => f.id === source.fieldId)
  const targetIndex = targetSection.fields.findIndex((f: SectionField) => f.id === targetFieldId)
  if (sourceIndex === -1 || targetIndex === -1) {
    dragFieldKey.value = null
    return
  }
  const moved = sourceSection.fields[sourceIndex]
  if (!moved) {
    dragFieldKey.value = null
    return
  }
  sourceSection.fields.splice(sourceIndex, 1)
  targetSection.fields.splice(targetIndex, 0, moved)
  dragFieldKey.value = null
}

function onFieldListDrop(e: DragEvent, sectionId: string) {
  e.preventDefault()
  dragOverFieldKey.value = null
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw || !dragFieldKey.value) {
    dragFieldKey.value = null
    return
  }
  let source: { sectionId: string; fieldId: string }
  try {
    source = JSON.parse(raw)
  } catch {
    dragFieldKey.value = null
    return
  }
  const sourceSection = sections.value.find((s: TemplateSection) => s.id === source.sectionId)
  const targetSection = sections.value.find((s: TemplateSection) => s.id === sectionId)
  if (!sourceSection || !targetSection || sourceSection.id === targetSection.id) {
    dragFieldKey.value = null
    return
  }
  const sourceIndex = sourceSection.fields.findIndex((f: SectionField) => f.id === source.fieldId)
  if (sourceIndex === -1) {
    dragFieldKey.value = null
    return
  }
  const moved = sourceSection.fields[sourceIndex]
  if (!moved) {
    dragFieldKey.value = null
    return
  }
  sourceSection.fields.splice(sourceIndex, 1)
  targetSection.fields.push(moved)
  dragFieldKey.value = null
}

function onFieldDragEnd() {
  dragFieldKey.value = null
  dragOverFieldKey.value = null
}

// Field picker per section
const fieldPickerOpen = ref<Record<string, boolean>>({})

function toggleFieldPicker(sectionId: string) {
  fieldPickerOpen.value[sectionId] = !fieldPickerOpen.value[sectionId]
}

function isFieldSelected(section: TemplateSection, fieldId: string) {
  return section.fields.some(f => f.incidentFieldId === fieldId)
}

function toggleIncidentField(section: TemplateSection, fieldId: string) {
  const idx = section.fields.findIndex(f => f.incidentFieldId === fieldId)
  if (idx !== -1) {
    section.fields.splice(idx, 1)
  } else {
    section.fields.push({ id: newFieldId(), isCustom: false, incidentFieldId: fieldId })
  }
}

function removeField(section: TemplateSection, fieldId: string) {
  section.fields = section.fields.filter(f => f.id !== fieldId)
}

function getFieldLabel(fieldId: string): string {
  return INCIDENT_FIELDS.find(f => f.id === fieldId)?.label ?? fieldId
}

function moveFieldUp(section: TemplateSection, index: number) {
  if (index === 0) return
  const a = section.fields[index - 1]
  const b = section.fields[index]
  if (!a || !b) return
  section.fields[index - 1] = b
  section.fields[index] = a
}
function moveFieldDown(section: TemplateSection, index: number) {
  if (index >= section.fields.length - 1) return
  const a = section.fields[index]
  const b = section.fields[index + 1]
  if (!a || !b) return
  section.fields[index] = b
  section.fields[index + 1] = a
}

// Custom field modal
const showCustomFieldModal = ref(false)
const customFieldTargetSectionId = ref<string | null>(null)
const customFieldForm = reactive<CustomField>({
  id: '',
  label: '',
  description: '',
  type: 'text',
  maxChars: 500,
  dropdownValues: '',
  dropdownMulti: false,
  maxFiles: 5,
})
const customFieldErrors = reactive<Record<string, string>>({})

function openCustomFieldModal(sectionId: string) {
  customFieldTargetSectionId.value = sectionId
  Object.assign(customFieldForm, {
    id: newFieldId(),
    label: '',
    description: '',
    type: 'text',
    maxChars: 500,
    dropdownValues: '',
    dropdownMulti: false,
    maxFiles: 5,
  })
  Object.keys(customFieldErrors).forEach(k => delete customFieldErrors[k])
  showCustomFieldModal.value = true
}

function confirmCustomField() {
  Object.keys(customFieldErrors).forEach(k => delete customFieldErrors[k])
  if (!customFieldForm.label.trim()) customFieldErrors.label = t('validation.required')
  if (customFieldForm.type === 'dropdown' && !customFieldForm.dropdownValues?.trim()) {
    customFieldErrors.dropdownValues = t('validation.required')
  }
  if (Object.keys(customFieldErrors).length) return

  const sec = sections.value.find((s: TemplateSection) => s.id === customFieldTargetSectionId.value)
  if (sec) {
    sec.fields.push({
      id: customFieldForm.id,
      isCustom: true,
      custom: { ...customFieldForm },
    })
  }
  showCustomFieldModal.value = false
}

const customFieldTypeOptions: { value: CustomFieldType; label: string; icon: string }[] = [
  { value: 'text',        label: 'Text',        icon: 'lucide:type' },
  { value: 'date',        label: 'Date',         icon: 'lucide:calendar' },
  { value: 'location',    label: 'Location',     icon: 'lucide:map-pin' },
  { value: 'dropdown',    label: 'Dropdown',     icon: 'lucide:list' },
  { value: 'file_upload', label: 'File Upload',  icon: 'lucide:paperclip' },
]
</script>

<template>
  <div class="tpl-editor">
    <!-- ── Page Header ── -->
    <div class="tpl-editor__page-header">
      <button class="back-btn" @click="handleCancel">
        <Icon name="lucide:arrow-left" :size="16" />
      </button>
      <div class="tpl-editor__page-title-area">
        <h1 class="tpl-editor__page-title">{{ pageTitle }}</h1>
        <p class="tpl-editor__page-sub">{{ t('tpl.editor_subtitle') }}</p>
      </div>
      <div class="tpl-editor__header-actions">
        <button class="btn-cancel" @click="handleCancel">{{ t('common.cancel') }}</button>

        <!-- Restore (archived templates only) -->
        <button v-if="isEdit && isArchived" class="btn-restore" @click="handleRestore">
          <Icon name="lucide:rotate-ccw" :size="14" />
          {{ t('tpl.restore') }}
        </button>

        <!-- Archive (edit mode, not yet archived) -->
        <button v-if="isEdit && !isArchived" class="btn-archive" @click="handleArchive">
          <Icon name="lucide:archive" :size="14" />
          {{ t('tpl.archive') }}
        </button>

        <button v-if="!isArchived" class="btn-draft" :disabled="isSubmitting" @click="handleSaveDraft">
          <Icon name="lucide:save" :size="14" />
          {{ t('tpl.save_draft') }}
        </button>
        <button v-if="!isArchived" class="btn-publish" :disabled="isSubmitting" @click="handlePublish">
          <Icon v-if="isSubmitting" name="lucide:loader-2" :size="14" class="spin" />
          <Icon v-else name="lucide:send" :size="14" />
          {{ isEdit ? t('tpl.save_changes') : t('tpl.publish') }}
        </button>
      </div>
    </div>

    <!-- ── Archived banner ── -->
    <div v-if="isEdit && isArchived" class="archived-banner">
      <Icon name="lucide:archive" :size="15" />
      {{ t('tpl.archived_banner') }}
    </div>

    <!-- ── Two-pane Editor ── -->
    <div class="tpl-editor__body">
      <!-- Left pane: navigation -->
      <aside class="tpl-editor__left-pane">
        <div class="left-pane__section-label">{{ t('tpl.pane_settings') }}</div>
        <button
          class="left-pane__nav-item"
          :class="{ 'left-pane__nav-item--active': activePane === 'header' }"
          @click="activePane = 'header'"
        >
          <Icon name="lucide:settings-2" :size="15" />
          {{ t('tpl.pane_header') }}
        </button>
        <button
          class="left-pane__nav-item"
          :class="{ 'left-pane__nav-item--active': activePane === 'sections' }"
          @click="activePane = 'sections'"
        >
          <Icon name="lucide:layers" :size="15" />
          {{ t('tpl.pane_sections') }}
        </button>
      </aside>

      <!-- Right pane: content -->
      <main class="tpl-editor__right-pane">

        <!-- ── Header Settings ── -->
        <div v-if="activePane === 'header'" class="editor-panel">
          <div class="editor-panel__header">
            <Icon name="lucide:settings-2" :size="16" />
            <h2 class="editor-panel__title">{{ t('tpl.pane_header') }}</h2>
          </div>

          <div class="editor-panel__body">

            <!-- Template Name -->
            <div class="form-field" :class="{ 'form-field--error': errors.name }">
              <label class="form-field__label">
                {{ t('tpl.field_name') }} <span class="req">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                class="form-field__input"
                maxlength="80"
                :placeholder="t('tpl.field_name_placeholder')"
              />
              <div class="form-field__footer">
                <span class="field-error">{{ errors.name }}</span>
                <span class="char-count">{{ form.name.length }}/80</span>
              </div>
            </div>

            <!-- Row: Category + Status -->
            <div class="form-row">
              <div class="form-field" :class="{ 'form-field--error': errors.category }">
                <label class="form-field__label">
                  {{ t('tpl.field_category') }} <span class="req">*</span>
                </label>
                <select v-model="form.category" class="form-field__select">
                  <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-field__label">{{ t('tpl.field_status') }}</label>
                <div class="status-toggle-group">
                  <button
                    class="status-toggle-btn"
                    :class="{ 'status-toggle-btn--active': form.status === 'draft' }"
                    @click="form.status = 'draft'"
                  >
                    <Icon name="lucide:file-edit" :size="13" />
                    {{ t('tpl.status_draft') }}
                  </button>
                  <button
                    class="status-toggle-btn"
                    :class="{ 'status-toggle-btn--active-ok': form.status === 'active' }"
                    @click="form.status = 'active'"
                  >
                    <Icon name="lucide:check-circle" :size="13" />
                    {{ t('tpl.status_active') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Community / Site multi-select -->
            <div class="form-field" :class="{ 'form-field--error': errors.communities }">
              <label class="form-field__label">
                {{ t('tpl.field_communities') }} <span class="req">*</span>
              </label>
              <div class="multiselect" :class="{ 'multiselect--open': communityDropdownOpen }">
                <button
                  type="button"
                  class="multiselect__trigger"
                  @click="communityDropdownOpen = !communityDropdownOpen"
                >
                  <span class="multiselect__display" :class="{ 'multiselect__display--placeholder': !form.communities.length }">
                    {{ communityDisplayText }}
                  </span>
                  <Icon name="lucide:chevron-down" :size="14" class="multiselect__chevron" />
                </button>
                <div v-if="communityDropdownOpen" class="multiselect__dropdown">
                  <label
                    v-for="c in DEMO_COMMUNITIES"
                    :key="c"
                    class="multiselect__option"
                    :class="{ 'multiselect__option--selected': isCommunitySelected(c) }"
                    @click.prevent="toggleCommunity(c)"
                  >
                    <span class="multiselect__checkbox">
                      <Icon v-if="isCommunitySelected(c)" name="lucide:check" :size="11" />
                    </span>
                    <span>{{ c === 'Global' ? `🌐 ${t('tpl.community_global')}` : c }}</span>
                  </label>
                </div>
              </div>
              <span v-if="errors.communities" class="field-error">{{ errors.communities }}</span>
              <!-- Selected chips -->
              <div v-if="form.communities.length" class="community-chips">
                <span v-for="c in form.communities" :key="c" class="community-chip">
                  {{ c }}
                  <button class="chip-remove" @click="toggleCommunity(c)">
                    <Icon name="lucide:x" :size="10" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Report Title Format -->
            <div class="form-field" :class="{ 'form-field--error': errors.reportTitleFormat }">
              <label class="form-field__label">
                {{ t('tpl.field_title_format') }} <span class="req">*</span>
              </label>
              <input
                v-model="form.reportTitleFormat"
                type="text"
                class="form-field__input"
                :placeholder="t('tpl.field_title_format_placeholder')"
              />
              <span v-if="errors.reportTitleFormat" class="field-error">{{ errors.reportTitleFormat }}</span>
              <div class="token-row">
                <span class="token-label">{{ t('tpl.insert_placeholder') }}</span>
                <button
                  v-for="token in PLACEHOLDER_TOKENS"
                  :key="token"
                  type="button"
                  class="token-btn"
                  @click="insertToken(token)"
                >
                  {{ token }}
                </button>
              </div>
            </div>

            <!-- Toggles -->
            <div class="toggles-section">
              <div class="toggle-row">
                <div class="toggle-row__info">
                  <span class="toggle-row__label">{{ t('tpl.field_review_before_client') }}</span>
                  <span class="toggle-row__desc">{{ t('tpl.field_review_before_client_desc') }}</span>
                </div>
                <button
                  type="button"
                  class="toggle-switch"
                  :class="{ 'toggle-switch--on': form.reviewBeforeClient }"
                  @click="form.reviewBeforeClient = !form.reviewBeforeClient"
                >
                  <span class="toggle-switch__thumb" />
                </button>
              </div>

              <div class="toggle-row">
                <div class="toggle-row__info">
                  <span class="toggle-row__label">{{ t('tpl.field_allow_officer_editing') }}</span>
                  <span class="toggle-row__desc">{{ t('tpl.field_allow_officer_editing_desc') }}</span>
                </div>
                <button
                  type="button"
                  class="toggle-switch"
                  :class="{ 'toggle-switch--on': form.allowOfficerEditing }"
                  @click="form.allowOfficerEditing = !form.allowOfficerEditing"
                >
                  <span class="toggle-switch__thumb" />
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- ── Sections Settings ── -->
        <div v-else class="editor-panel">
          <div class="editor-panel__header">
            <Icon name="lucide:layers" :size="16" />
            <h2 class="editor-panel__title">{{ t('tpl.pane_sections') }}</h2>
            <button class="btn-add-section" @click="addSection">
              <Icon name="lucide:plus" :size="14" />
              {{ t('tpl.add_section') }}
            </button>
          </div>

          <div class="editor-panel__body editor-panel__body--sections">

            <!-- Empty state -->
            <div v-if="sections.length === 0" class="sections-empty">
              <Icon name="lucide:layers" :size="28" class="empty-icon" />
              <p>{{ t('tpl.sections_empty') }}</p>
              <button class="btn-add-section-inline" @click="addSection">
                <Icon name="lucide:plus" :size="14" />
                {{ t('tpl.add_section') }}
              </button>
            </div>

            <!-- Section cards -->
            <div
              v-for="(sec, secIdx) in sections"
              :key="sec.id"
              class="section-card"
              :class="{
                'section-card--disabled': !sec.enabled,
                'section-card--dragging': dragSectionId === sec.id,
                'section-card--drag-over': dragOverSectionId === sec.id,
              }"
              draggable="true"
              @dragstart="onSectionDragStart($event, sec.id)"
              @dragover="onSectionDragOver($event, sec.id)"
              @dragleave="onSectionDragLeave"
              @drop="onSectionDrop($event, sec.id)"
              @dragend="onSectionDragEnd"
            >
              <!-- Section header row -->
              <div class="section-card__header">
                <!-- Reorder controls -->
                <div class="section-order-btns">
                  <span class="drag-handle" :title="t('tpl.drag_handle')">
                    <Icon name="lucide:grip-vertical" :size="14" />
                  </span>
                  <button class="order-btn" :disabled="secIdx === 0" :title="t('tpl.move_up')" @click="moveSectionUp(secIdx)">
                    <Icon name="lucide:chevron-up" :size="12" />
                  </button>
                  <span class="order-num">{{ secIdx + 1 }}</span>
                  <button class="order-btn" :disabled="secIdx === sections.length - 1" :title="t('tpl.move_down')" @click="moveSectionDown(secIdx)">
                    <Icon name="lucide:chevron-down" :size="12" />
                  </button>
                </div>

                <!-- Title input -->
                <input
                  v-model="sec.title"
                  type="text"
                  class="section-title-input"
                  maxlength="80"
                  :placeholder="t('tpl.section_title_placeholder')"
                />

                <!-- Toggles row -->
                <div class="section-toggles">
                  <label class="mini-toggle" :title="t('tpl.section_enabled')">
                    <input v-model="sec.enabled" type="checkbox" class="sr-only" />
                    <span class="mini-toggle__track" :class="{ 'mini-toggle__track--on': sec.enabled }">
                      <span class="mini-toggle__thumb" />
                    </span>
                    <span class="mini-toggle__label">{{ t('tpl.section_enabled') }}</span>
                  </label>
                  <label class="mini-toggle" :title="t('tpl.section_required')">
                    <input v-model="sec.required" type="checkbox" class="sr-only" />
                    <span class="mini-toggle__track" :class="{ 'mini-toggle__track--on': sec.required }">
                      <span class="mini-toggle__thumb" />
                    </span>
                    <span class="mini-toggle__label">{{ t('tpl.section_required') }}</span>
                  </label>
                  <label class="mini-toggle" :title="t('tpl.section_client_visible')">
                    <input v-model="sec.clientVisible" type="checkbox" class="sr-only" />
                    <span class="mini-toggle__track" :class="{ 'mini-toggle__track--on': sec.clientVisible }">
                      <span class="mini-toggle__thumb" />
                    </span>
                    <span class="mini-toggle__label">{{ t('tpl.section_client_visible') }}</span>
                  </label>
                </div>

                <!-- Expand / Delete -->
                <div class="section-header-actions">
                  <button class="section-action-btn" :title="t('tpl.section_expand')" @click="toggleSectionExpand(sec.id)">
                    <Icon :name="isSectionExpanded(sec.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
                  </button>
                  <button class="section-action-btn section-action-btn--danger" :title="t('tpl.section_delete')" @click="removeSection(sec.id)">
                    <Icon name="lucide:trash-2" :size="14" />
                  </button>
                </div>
              </div>

              <!-- Fields area (expanded) -->
              <div v-if="isSectionExpanded(sec.id)" class="section-card__fields">

                <!-- Field list -->
                <div
                  v-if="sec.fields.length"
                  class="fields-list"
                  @dragover.prevent
                  @drop="onFieldListDrop($event, sec.id)"
                >
                  <div
                    v-for="(field, fIdx) in sec.fields"
                    :key="field.id"
                    class="field-row"
                    :class="{
                      'field-row--dragging': dragFieldKey === makeFieldKey(sec.id, field.id),
                      'field-row--drag-over': dragOverFieldKey === makeFieldKey(sec.id, field.id),
                    }"
                    draggable="true"
                    @dragstart="onFieldDragStart($event, sec.id, field.id)"
                    @dragover="onFieldDragOver($event, sec.id, field.id)"
                    @dragleave="onFieldDragLeave"
                    @drop="onFieldDrop($event, sec.id, field.id)"
                    @dragend="onFieldDragEnd"
                  >
                    <span class="field-row__drag" :title="t('tpl.drag_handle')">
                      <Icon name="lucide:grip-vertical" :size="12" />
                    </span>
                    <div class="field-row__order">
                      <button class="order-btn order-btn--sm" :disabled="fIdx === 0" @click="moveFieldUp(sec, fIdx)">
                        <Icon name="lucide:chevron-up" :size="11" />
                      </button>
                      <button class="order-btn order-btn--sm" :disabled="fIdx === sec.fields.length - 1" @click="moveFieldDown(sec, fIdx)">
                        <Icon name="lucide:chevron-down" :size="11" />
                      </button>
                    </div>
                    <Icon
                      :name="field.isCustom ? 'lucide:sparkles' : 'lucide:form-input'"
                      :size="13"
                      class="field-row__icon"
                      :class="{ 'field-row__icon--custom': field.isCustom }"
                    />
                    <span class="field-row__label">
                      {{ field.isCustom ? field.custom?.label : getFieldLabel(field.incidentFieldId ?? '') }}
                    </span>
                    <span v-if="field.isCustom" class="field-row__type-badge">
                      {{ field.custom?.type?.replace('_', ' ') }}
                    </span>
                    <button class="field-row__remove" :title="t('tpl.field_remove')" @click="removeField(sec, field.id)">
                      <Icon name="lucide:x" :size="12" />
                    </button>
                  </div>
                </div>

                <!-- Add fields row -->
                <div class="fields-add-row">
                  <!-- Field picker dropdown -->
                  <div class="field-picker-wrap">
                    <button class="btn-add-field" @click="toggleFieldPicker(sec.id)">
                      <Icon name="lucide:plus" :size="13" />
                      {{ t('tpl.add_incident_field') }}
                    </button>
                    <div v-if="fieldPickerOpen[sec.id]" class="field-picker-dropdown">
                      <div class="field-picker__title">{{ t('tpl.picker_title') }}</div>
                      <label
                        v-for="iField in INCIDENT_FIELDS"
                        :key="iField.id"
                        class="field-picker__option"
                        :class="{ 'field-picker__option--selected': isFieldSelected(sec, iField.id) }"
                        @click.prevent="toggleIncidentField(sec, iField.id)"
                      >
                        <span class="field-picker__checkbox">
                          <Icon v-if="isFieldSelected(sec, iField.id)" name="lucide:check" :size="10" />
                        </span>
                        {{ iField.label }}
                      </label>
                    </div>
                  </div>

                  <button class="btn-add-custom" @click="openCustomFieldModal(sec.id)">
                    <Icon name="lucide:sparkles" :size="13" />
                    {{ t('tpl.add_custom_field') }}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  </div>

  <!-- ── Archived banner ── -->
  <Teleport to="body">
    <div v-if="showArchiveModal" class="modal-overlay" @click.self="showArchiveModal = false">
      <div class="modal">
        <div class="modal__header">
          <Icon name="lucide:archive" :size="17" class="modal__icon--warn" />
          <h3 class="modal__title">{{ t('tpl.archive_confirm_title') }}</h3>
        </div>
        <div class="modal__body">
          <p class="modal__text">{{ t('tpl.archive_confirm_body') }}</p>
          <p class="modal__text modal__text--muted">{{ t('tpl.archive_confirm_note') }}</p>
        </div>
        <div class="modal__footer">
          <button class="btn-cancel" @click="showArchiveModal = false">{{ t('common.cancel') }}</button>
          <button class="btn-archive-confirm" :disabled="isArchiving" @click="confirmArchive">
            <Icon v-if="isArchiving" name="lucide:loader-2" :size="14" class="spin" />
            <Icon v-else name="lucide:archive" :size="14" />
            {{ t('tpl.archive_confirm_action') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Dismiss field picker dropdowns -->
  <div
    v-if="Object.values(fieldPickerOpen).some(Boolean)"
    class="overlay-dismiss"
    @click="Object.keys(fieldPickerOpen).forEach(k => { fieldPickerOpen[k] = false })"
  />

  <!-- Close community dropdown on outside click -->
  <div
    v-if="communityDropdownOpen"
    class="overlay-dismiss"
    @click="communityDropdownOpen = false"
  />

  <!-- ── Custom Field Modal ── -->
  <Teleport to="body">
    <div v-if="showCustomFieldModal" class="modal-overlay" @click.self="showCustomFieldModal = false">
      <div class="modal modal--lg">
        <div class="modal__header">
          <Icon name="lucide:sparkles" :size="17" class="modal__icon--accent" />
          <h3 class="modal__title">{{ t('tpl.custom_field_title') }}</h3>
        </div>
        <div class="modal__body">

          <!-- Label -->
          <div class="form-field" :class="{ 'form-field--error': customFieldErrors.label }">
            <label class="form-field__label">{{ t('tpl.custom_field_label') }} <span class="req">*</span></label>
            <input v-model="customFieldForm.label" type="text" class="form-field__input" :placeholder="t('tpl.custom_field_label_placeholder')" />
            <span v-if="customFieldErrors.label" class="field-error">{{ customFieldErrors.label }}</span>
          </div>

          <!-- Description -->
          <div class="form-field">
            <label class="form-field__label">{{ t('tpl.custom_field_description') }}</label>
            <input v-model="customFieldForm.description" type="text" class="form-field__input" :placeholder="t('tpl.custom_field_description_placeholder')" />
          </div>

          <!-- Field Type -->
          <div class="form-field">
            <label class="form-field__label">{{ t('tpl.custom_field_type') }} <span class="req">*</span></label>
            <div class="field-type-grid">
              <button
                v-for="opt in customFieldTypeOptions"
                :key="opt.value"
                class="field-type-btn"
                :class="{ 'field-type-btn--active': customFieldForm.type === opt.value }"
                @click="customFieldForm.type = opt.value"
              >
                <Icon :name="opt.icon" :size="16" />
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Text: max chars -->
          <div v-if="customFieldForm.type === 'text'" class="form-field">
            <label class="form-field__label">{{ t('tpl.custom_field_max_chars') }}</label>
            <input v-model.number="customFieldForm.maxChars" type="number" min="10" max="5000" class="form-field__input form-field__input--short" />
          </div>

          <!-- Dropdown: values + multi -->
          <div v-if="customFieldForm.type === 'dropdown'" class="form-field" :class="{ 'form-field--error': customFieldErrors.dropdownValues }">
            <label class="form-field__label">{{ t('tpl.custom_field_dropdown_values') }} <span class="req">*</span></label>
            <textarea
              v-model="customFieldForm.dropdownValues"
              class="form-field__textarea"
              rows="4"
              :placeholder="t('tpl.custom_field_dropdown_values_placeholder')"
            />
            <span v-if="customFieldErrors.dropdownValues" class="field-error">{{ customFieldErrors.dropdownValues }}</span>
            <label class="checkbox-row">
              <input v-model="customFieldForm.dropdownMulti" type="checkbox" />
              {{ t('tpl.custom_field_multi_select') }}
            </label>
          </div>

          <!-- File upload: max files -->
          <div v-if="customFieldForm.type === 'file_upload'" class="form-field">
            <label class="form-field__label">{{ t('tpl.custom_field_max_files') }}</label>
            <input v-model.number="customFieldForm.maxFiles" type="number" min="1" max="20" class="form-field__input form-field__input--short" />
          </div>

        </div>
        <div class="modal__footer">
          <button class="btn-cancel" @click="showCustomFieldModal = false">{{ t('common.cancel') }}</button>
          <button class="btn-publish" @click="confirmCustomField">
            <Icon name="lucide:plus" :size="14" />
            {{ t('tpl.custom_field_add') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Layout ── */
.tpl-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── Page Header ── */
.tpl-editor__page-header {
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-base);
}
.back-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

.tpl-editor__page-title-area { flex: 1; }
.tpl-editor__page-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.tpl-editor__page-sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.tpl-editor__header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── Two-pane body ── */
.tpl-editor__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Left pane ── */
.tpl-editor__left-pane {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  display: flex;
  flex-direction: column;
  padding: var(--space-4) 0;
  gap: var(--space-1);
}

.left-pane__section-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 var(--space-4) var(--space-2);
}

.left-pane__nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-align: left;
  width: 100%;
  border-radius: 0;
  transition: background var(--transition-base), color var(--transition-base);
}
.left-pane__nav-item:hover { background: var(--color-bg-surface); color: var(--color-text-primary); }
.left-pane__nav-item--active {
  background: var(--color-bg-surface);
  color: var(--color-accent);
  font-weight: 500;
  border-right: 2px solid var(--color-accent);
}

.left-pane__nav-badge {
  margin-left: auto;
  font-size: var(--font-size-xs);
  background: var(--color-bg-base);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
}

/* ── Right pane ── */
.tpl-editor__right-pane {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  background: var(--color-bg-base);
}

/* ── Editor panel ── */
.editor-panel {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  max-width: 720px;
}

.editor-panel__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.editor-panel__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.editor-panel__body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.editor-panel__body--empty {
  align-items: center;
  justify-content: center;
  padding: var(--space-10) var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  gap: var(--space-3);
}
.empty-icon { opacity: 0.3; }

/* ── Form fields ── */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-field__input,
.form-field__select {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
  font-family: var(--font-family);
}
.form-field__input:focus,
.form-field__select:focus { border-color: var(--color-accent); }
.form-field__input::placeholder { color: var(--color-text-muted); }
.form-field--error .form-field__input,
.form-field--error .form-field__select { border-color: var(--color-critical); }

.form-field__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-left: auto;
}

.field-error { font-size: var(--font-size-xs); color: var(--color-critical); }
.req { color: var(--color-critical); }

/* ── Status toggle group ── */
.status-toggle-group {
  display: flex;
  gap: var(--space-2);
}

.status-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}
.status-toggle-btn--active {
  border-color: #ca8a04;
  background: rgba(234, 179, 8, 0.12);
  color: #ca8a04;
  font-weight: 500;
}
.status-toggle-btn--active-ok {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  font-weight: 500;
}

/* ── Multiselect ── */
.multiselect {
  position: relative;
}

.multiselect__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition-base);
}
.multiselect__trigger:focus,
.multiselect--open .multiselect__trigger { border-color: var(--color-accent); }

.multiselect__display { flex: 1; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
.multiselect__display--placeholder { color: var(--color-text-muted); }

.multiselect__chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-base);
}
.multiselect--open .multiselect__chevron { transform: rotate(180deg); }

.multiselect__dropdown {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  right: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  z-index: 50;
  max-height: 220px;
  overflow-y: auto;
}

.multiselect__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-base);
}
.multiselect__option:hover { background: var(--color-bg-elevated); }
.multiselect__option--selected { color: var(--color-accent); }

.multiselect__checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-accent);
  transition: all var(--transition-base);
}
.multiselect__option--selected .multiselect__checkbox {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

/* ── Community chips ── */
.community-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.community-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  background: rgba(var(--color-accent-rgb, 59, 130, 246), 0.12);
  border: 1px solid rgba(var(--color-accent-rgb, 59, 130, 246), 0.3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
}

.chip-remove {
  display: inline-flex;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-accent);
  opacity: 0.7;
  transition: opacity var(--transition-base);
}
.chip-remove:hover { opacity: 1; }

/* ── Token insert row ── */
.token-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.token-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.token-btn {
  padding: 2px var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: monospace;
  transition: all var(--transition-base);
}
.token-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

/* ── Toggles section ── */
.toggles-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4);
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border);
}
.toggle-row:last-child { border-bottom: none; }

.toggle-row__info { display: flex; flex-direction: column; gap: var(--space-1); flex: 1; }
.toggle-row__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
.toggle-row__desc { font-size: var(--font-size-xs); color: var(--color-text-muted); }

.toggle-switch {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background var(--transition-base);
  padding: 0;
}
.toggle-switch--on { background: var(--color-accent); }

.toggle-switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-base);
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.toggle-switch--on .toggle-switch__thumb { transform: translateX(18px); }

/* ── Action buttons ── */
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

.btn-draft {
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
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}
.btn-draft:hover { border-color: var(--color-accent); color: var(--color-accent); }
.btn-draft:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-publish {
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
.btn-publish:hover { opacity: 0.88; }
.btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Overlay dismiss ── */
.overlay-dismiss {
  position: fixed;
  inset: 0;
  z-index: 49;
}

/* ── Sections panel ── */
.editor-panel__body--sections {
  padding: var(--space-4);
  gap: var(--space-3);
}

.btn-add-section {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-accent);
  border: none;
  color: white;
  transition: opacity var(--transition-base);
}
.btn-add-section:hover { opacity: 0.88; }

/* ── Sections empty ── */
.sections-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
.btn-add-section-inline {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}
.btn-add-section-inline:hover { border-color: var(--color-accent); color: var(--color-accent); }

/* ── Section card ── */
.section-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  transition: opacity 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.section-card--disabled { opacity: 0.55; }
.section-card--dragging {
  opacity: 0.4;
}
.section-card--drag-over {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb, 59,130,246), 0.2);
}

.section-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  flex-wrap: wrap;
}

/* ── Order buttons ── */
.section-order-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: grab;
  padding: 1px 0;
  border-radius: var(--radius-sm);
  transition: color var(--transition-base);
}
.drag-handle:hover { color: var(--color-accent); }

.order-num {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: 600;
  width: 16px;
  text-align: center;
}
.order-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-base);
}
.order-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
.order-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.order-btn--sm { width: 18px; height: 18px; }

/* ── Section title input ── */
.section-title-input {
  flex: 1;
  min-width: 160px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  outline: none;
  transition: border-color var(--transition-base);
}
.section-title-input:focus { border-color: var(--color-accent); }
.section-title-input::placeholder { color: var(--color-text-muted); font-weight: 400; }

/* ── Mini toggles ── */
.section-toggles {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.mini-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  user-select: none;
}
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

.mini-toggle__track {
  position: relative;
  width: 30px;
  height: 16px;
  border-radius: 8px;
  background: var(--color-border);
  transition: background var(--transition-base);
  flex-shrink: 0;
}
.mini-toggle__track--on { background: var(--color-accent); }

.mini-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-base);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.mini-toggle__track--on .mini-toggle__thumb { transform: translateX(14px); }

.mini-toggle__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ── Section header actions ── */
.section-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: auto;
  flex-shrink: 0;
}
.section-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-base);
}
.section-action-btn:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-bg-surface); }
.section-action-btn--danger:hover { border-color: var(--color-critical); color: var(--color-critical); background: rgba(239,68,68,0.08); }

/* ── Fields area ── */
.section-card__fields {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: grab;
  transition: opacity 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.field-row--dragging {
  opacity: 0.4;
  cursor: grabbing;
}
.field-row--drag-over {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb, 59,130,246), 0.2);
}

.field-row__drag {
  color: var(--color-text-muted);
  cursor: grab;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  transition: color var(--transition-base);
}
.field-row__drag:hover { color: var(--color-accent); }

.field-row__order {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;
}

.field-row__icon { color: var(--color-text-muted); flex-shrink: 0; }
.field-row__icon--custom { color: var(--color-accent); }

.field-row__label { flex: 1; color: var(--color-text-primary); }

.field-row__type-badge {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
  background: rgba(var(--color-accent-rgb, 59,130,246), 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(var(--color-accent-rgb, 59,130,246), 0.2);
  text-transform: capitalize;
}

.field-row__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  padding: 0;
  flex-shrink: 0;
  transition: all var(--transition-base);
}
.field-row__remove:hover { color: var(--color-critical); background: rgba(239,68,68,0.08); }

/* ── Add fields row ── */
.fields-add-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.field-picker-wrap { position: relative; }

.btn-add-field {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}
.btn-add-field:hover { border-color: var(--color-accent); color: var(--color-accent); }

.btn-add-custom {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--color-accent);
  color: var(--color-accent);
  opacity: 0.8;
  transition: all var(--transition-base);
}
.btn-add-custom:hover { opacity: 1; background: rgba(var(--color-accent-rgb, 59,130,246), 0.08); }

/* ── Field picker dropdown ── */
.field-picker-dropdown {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  width: 240px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  z-index: 60;
  max-height: 260px;
  overflow-y: auto;
}

.field-picker__title {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.field-picker__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-base);
}
.field-picker__option:hover { background: var(--color-bg-elevated); }
.field-picker__option--selected { color: var(--color-accent); }

.field-picker__checkbox {
  width: 15px;
  height: 15px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-accent);
}
.field-picker__option--selected .field-picker__checkbox {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

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
  width: 480px;
  max-width: calc(100vw - var(--space-8));
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.modal--lg { width: 560px; }
.modal__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.modal__icon--accent { color: var(--color-accent); }
.modal__title { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text-primary); margin: 0; }
.modal__body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow-y: auto;
}
.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* ── Field type grid ── */
.field-type-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}
.field-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: center;
}
.field-type-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
.field-type-btn--active {
  border-color: var(--color-accent);
  background: rgba(var(--color-accent-rgb, 59,130,246), 0.1);
  color: var(--color-accent);
  font-weight: 500;
}

/* ── Form additions for modal ── */
.form-field__textarea {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-base);
}
.form-field__textarea:focus { border-color: var(--color-accent); }
.form-field--error .form-field__textarea { border-color: var(--color-critical); }
.form-field__input--short { max-width: 120px; }

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  margin-top: var(--space-1);
}

/* ── Archive / Restore buttons ── */
.btn-archive {
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
.btn-archive:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background: rgba(245,158,11,0.08);
}

.btn-restore {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px solid #22c55e;
  color: #22c55e;
  transition: all var(--transition-base);
}
.btn-restore:hover { background: rgba(34,197,94,0.1); }

.btn-archive-confirm {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: #f59e0b;
  border: none;
  color: white;
  transition: opacity var(--transition-base);
}
.btn-archive-confirm:hover { opacity: 0.88; }
.btn-archive-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Archived banner ── */
.archived-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-6);
  background: rgba(245,158,11,0.12);
  border-bottom: 1px solid rgba(245,158,11,0.3);
  color: #b45309;
  font-size: var(--font-size-sm);
  font-weight: 500;
  flex-shrink: 0;
}

/* ── Modal additions ── */
.modal__icon--warn { color: #f59e0b; }
.modal__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.5;
}
.modal__text--muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-top: var(--space-2);
}

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
