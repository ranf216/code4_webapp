<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import AppButton from '~/components/AppButton.vue'
import AppDialogModal from '~/components/AppDialogModal.vue'
import { reportTemplateApi } from '~/api/reportTemplate'
import { communityApi } from '~/api/community'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import type { Community } from '~/api/community'
import type {
  ReportTemplate,
  ReportTemplateCategory,
  ReportTemplateStatus,
  ReportFieldType,
  ReportFieldPayload,
  ReportSectionPayload,
} from '~/api/types/reportTemplate'

interface SectionField {
  /** Internal UI id (drag keys, expansion) */
  id: string
  /** 'system' | 'custom' — maps to is_system_field */
  source: 'system' | 'custom'
  /** Selected system field key (source === 'system') */
  systemKey?: string
  /** API field_key — read-only for system, editable for custom */
  fieldKey: string
  label: string
  description: string
  fieldType: ReportFieldType
  isRequired: boolean
  // type-specific config
  maxChars?: number
  dropdownValues?: string
  dropdownMulti?: boolean
  maxFiles?: number
}

interface TemplateSection {
  id: string
  title: string
  enabled: boolean
  required: boolean
  clientVisible: boolean
  fields: SectionField[]
}

interface HeaderForm {
  name: string
  category: ReportTemplateCategory
  communityIds: number[]
  isGlobal: boolean
  titleFormat: string
  status: ReportTemplateStatus
  reviewBeforeClient: boolean
  allowOfficerEditing: boolean
}

const props = defineProps<{
  mode: 'create' | 'edit'
  template?: ReportTemplate
}>()

const { t } = useTranslation()
const router = useRouter()
const toastStore = useToastStore()

const isEdit = computed(() => props.mode === 'edit')
const pageTitle = computed(() =>
  isEdit.value ? t('tpl.editor_title_edit') : t('tpl.editor_title_create'),
)

const PLACEHOLDER_TOKENS = ['{date}', '{community}', '{officer}', '{template_name}', '{incident_type}']

function buildInitialForm(): HeaderForm {
  const tpl = props.template
  if (tpl) {
    return {
      name: tpl.name,
      category: tpl.category,
      communityIds: (tpl.communities ?? []).map(c => c.community_id),
      isGlobal: tpl.is_global,
      titleFormat: tpl.title_format,
      status: tpl.status,
      reviewBeforeClient: tpl.review_before_client,
      allowOfficerEditing: tpl.allow_officer_editing,
    }
  }
  return {
    name: '',
    category: 'incident',
    communityIds: [],
    isGlobal: false,
    titleFormat: '',
    status: 'draft',
    reviewBeforeClient: false,
    allowOfficerEditing: false,
  }
}

const form = reactive<HeaderForm>(buildInitialForm())
const original = ref<HeaderForm>({ ...form, communityIds: [...form.communityIds] })
const errors = reactive<Record<string, string>>({})
const sectionErrors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)
const activePane = ref<'header' | 'sections'>('header')

// ── Communities (real API) ──
const communities = ref<Community[]>([])

onMounted(() => {
  communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    .then(res => { communities.value = res.communities ?? [] })
    .catch(() => {})
})

const communityDropdownOpen = ref(false)
const communitySearch = ref('')

const filteredCommunities = computed(() => {
  const q = communitySearch.value.trim().toLowerCase()
  if (!q) return communities.value
  return communities.value.filter(c => c.name.toLowerCase().includes(q))
})

watch(communityDropdownOpen, open => { if (!open) communitySearch.value = '' })

function toggleCommunity(id: number) {
  const idx = form.communityIds.indexOf(id)
  if (idx !== -1) {
    form.communityIds.splice(idx, 1)
  } else {
    form.isGlobal = false
    form.communityIds.push(id)
  }
}

function isCommunitySelected(id: number) {
  return form.communityIds.includes(id)
}

function toggleGlobal() {
  form.isGlobal = !form.isGlobal
  if (form.isGlobal) form.communityIds = []
}

const communityDisplayText = computed(() => {
  if (form.isGlobal) return t('tpl.community_global')
  if (!form.communityIds.length) return t('tpl.communities_placeholder')
  return form.communityIds
    .map(id => communities.value.find(c => c.community_id === id)?.name ?? `#${id}`)
    .join(', ')
})

const selectedCommunityChips = computed(() =>
  form.communityIds.map(id => ({
    id,
    name: communities.value.find(c => c.community_id === id)?.name ?? `#${id}`,
  }))
)

function insertToken(token: string) {
  form.titleFormat += (form.titleFormat ? ' ' : '') + token
}

const TOKEN_SAMPLE_VALUES: Record<string, string> = {
  '{date}': '15/03/2026',
  '{community}': 'Riverside Community',
  '{officer}': 'Officer Nguyen',
  '{template_name}': 'Standard Incident Report',
  '{incident_type}': 'Theft',
}

const titleFormatExample = computed(() =>
  form.titleFormat.replace(/\{[a-z_]+\}/gi, m => TOKEN_SAMPLE_VALUES[m.toLowerCase()] ?? m)
)

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return utcToLocal(dateStr).format('MMM D, YYYY h:mm A')
}

// ── Section payload serialization ──
const sectionsDirty = ref(false)

function buildSectionsPayload(): ReportSectionPayload[] {
  return sections.value.map(sec => ({
    title: sec.title,
    is_enabled: sec.enabled,
    is_required: sec.required,
    client_visible: sec.clientVisible,
    fields: sec.fields.map((f): ReportFieldPayload => {
      const cfg: Record<string, unknown> = {}
      if (f.fieldType === 'text' && f.maxChars) cfg.max_chars = f.maxChars
      if (f.fieldType === 'dropdown' && f.source === 'custom') {
        cfg.dropdown_values = (f.dropdownValues ?? '')
          .split('\n')
          .map(v => v.trim())
          .filter(Boolean)
        cfg.is_multi_select = !!f.dropdownMulti
      }
      if (f.fieldType === 'file_upload' && f.maxFiles) cfg.max_files = f.maxFiles
      return {
        field_key: f.fieldKey,
        label: f.label,
        description: f.description || undefined,
        field_type: f.fieldType,
        config: Object.keys(cfg).length ? cfg : undefined,
        is_system_field: f.source === 'system',
        is_required: f.isRequired,
      }
    }),
  }))
}

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  Object.keys(sectionErrors).forEach(k => delete sectionErrors[k])
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  if (!form.name.trim()) errors.name = t('validation.required')
  else if (form.name.length > 80) errors.name = t('validation.max_80')
  if (!form.category) errors.category = t('validation.required')
  if (!form.isGlobal && !form.communityIds.length) errors.communities = t('validation.community_or_global')
  if (!form.titleFormat.trim()) errors.titleFormat = t('validation.required')
  else if (form.titleFormat.length > 500) errors.titleFormat = t('validation.max_500')

  if (!sections.value.length) {
    errors.sections = t('tpl.validation_section_required')
  } else {
    for (const sec of sections.value) {
      if (!sec.title.trim()) {
        sectionErrors[sec.id] = t('validation.required')
      } else if (!sec.fields.length) {
        sectionErrors[sec.id] = t('tpl.validation_field_required')
      }
      for (const f of sec.fields) {
        if (f.source === 'system' && !f.systemKey) {
          fieldErrors[f.id] = t('tpl.validation_field_incomplete')
        } else if (!f.fieldKey.trim() || f.fieldKey.length > 50) {
          fieldErrors[f.id] = t('tpl.validation_field_key')
        } else if (!f.label.trim() || f.label.length > 80) {
          fieldErrors[f.id] = t('tpl.validation_field_incomplete')
        } else if (f.fieldType === 'dropdown' && f.source === 'custom' && !(f.dropdownValues ?? '').trim()) {
          fieldErrors[f.id] = t('tpl.validation_dropdown_values')
        } else {
          delete fieldErrors[f.id]
        }
        const fErr = fieldErrors[f.id]
        if (fErr && !sectionErrors[sec.id]) {
          sectionErrors[sec.id] = fErr
        }
      }
    }
  }
  return Object.keys(errors).length === 0
    && Object.keys(sectionErrors).length === 0
    && Object.keys(fieldErrors).length === 0
}

function idsEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)
  return sa.every((v, i) => v === sb[i])
}

async function handleSave(goBack = false) {
  if (!validate()) {
    toastStore.error(t('tpl.validation_fix_errors'))
    if (Object.keys(sectionErrors).length) activePane.value = 'sections'
    else if (Object.keys(errors).length) activePane.value = 'header'
    return
  }
  isSubmitting.value = true
  try {
    if (isEdit.value && props.template) {
      const payload: Record<string, unknown> = { template_id: props.template.template_id }
      if (form.name !== original.value.name) payload.name = form.name
      if (form.category !== original.value.category) payload.category = form.category
      if (form.titleFormat !== original.value.titleFormat) payload.title_format = form.titleFormat
      if (form.reviewBeforeClient !== original.value.reviewBeforeClient) payload.review_before_client = form.reviewBeforeClient
      if (form.allowOfficerEditing !== original.value.allowOfficerEditing) payload.allow_officer_editing = form.allowOfficerEditing
      const newIds = form.isGlobal ? [] : form.communityIds
      const oldIds = original.value.isGlobal ? [] : original.value.communityIds
      if (!idsEqual(newIds, oldIds)) payload.community_ids = newIds
      if (sectionsDirty.value) payload.sections = buildSectionsPayload()
      await reportTemplateApi.updateTemplate(payload as Parameters<typeof reportTemplateApi.updateTemplate>[0])
      toastStore.success(t('tpl.update_success'))
      original.value = { ...form, communityIds: [...form.communityIds] }
      sectionsDirty.value = false
      if (goBack) router.push('/report-templates')
    } else {
      const res = await reportTemplateApi.createTemplate({
        name: form.name,
        category: form.category,
        community_ids: form.isGlobal ? [] : form.communityIds,
        title_format: form.titleFormat,
        review_before_client: form.reviewBeforeClient,
        allow_officer_editing: form.allowOfficerEditing,
        sections: buildSectionsPayload(),
      })
      toastStore.success(t('tpl.create_success'))
      router.push(goBack ? '/report-templates' : `/report-templates/${res.template_id}/edit`)
      return
    }
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to save template')
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.push('/report-templates')
}

// ── Archive / Restore / Activate ──────────────────────────────
const isArchived = computed(() => form.status === 'archived')
const isDraft = computed(() => form.status === 'draft')
const showArchiveModal = ref(false)
const isArchiving = ref(false)
const isActivating = ref(false)

function handleArchive() {
  showArchiveModal.value = true
}

async function confirmArchive() {
  if (!props.template) return
  isArchiving.value = true
  try {
    await reportTemplateApi.archiveTemplate(props.template.template_id)
    form.status = 'archived'
    toastStore.success(t('reports.archive_success'))
    showArchiveModal.value = false
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to archive template')
  } finally {
    isArchiving.value = false
  }
}

async function handleActivate() {
  if (!props.template) return
  isActivating.value = true
  try {
    await reportTemplateApi.activateTemplate(props.template.template_id)
    toastStore.success(t('reports.activate_success'))
    router.push('/report-templates')
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to activate template')
  } finally {
    isActivating.value = false
  }
}

const categoryOptions: { value: ReportTemplateCategory; label: string }[] = [
  { value: 'incident', label: 'Incident' },
  { value: 'daily_activity', label: 'Daily Activity' },
  { value: 'custom', label: 'Custom' },
]

// ── Sections ──────────────────────────────────────────────────
// System fields from report_system_field data item (API doc §1.2.3)
interface SystemFieldDef {
  key: string
  label: string
  type: ReportFieldType
}

const SYSTEM_FIELDS: SystemFieldDef[] = [
  { key: 'incident_date',        label: 'Incident Date',        type: 'date' },
  { key: 'incident_time',        label: 'Incident Time',        type: 'text' },
  { key: 'incident_location',    label: 'Incident Location',    type: 'location' },
  { key: 'incident_type',        label: 'Incident Type',        type: 'dropdown' },
  { key: 'incident_description', label: 'Incident Description', type: 'text' },
  { key: 'officer_name',         label: 'Officer Name',         type: 'text' },
  { key: 'resident_name',        label: 'Resident Name',        type: 'text' },
  { key: 'community_name',       label: 'Community Name',       type: 'text' },
  { key: 'call_reference',       label: 'Call Reference',       type: 'text' },
  { key: 'priority',             label: 'Priority',             type: 'dropdown' },
  { key: 'media',                label: 'Media',                type: 'file_upload' },
  { key: 'officer_comments',     label: 'Officer Comments',     type: 'text' },
]

const FIELD_TYPE_OPTIONS: { value: ReportFieldType; label: string; icon: string }[] = [
  { value: 'text',              label: 'Text',              icon: 'lucide:type' },
  { value: 'date',              label: 'Date',              icon: 'lucide:calendar' },
  { value: 'location',          label: 'Location',          icon: 'lucide:map-pin' },
  { value: 'dropdown',          label: 'Dropdown',          icon: 'lucide:list' },
  { value: 'file_upload',       label: 'File Upload',       icon: 'lucide:paperclip' },
  { value: 'digital_signature', label: 'Digital Signature', icon: 'lucide:pen-tool' },
]

function fieldTypeIcon(type: ReportFieldType): string {
  return FIELD_TYPE_OPTIONS.find(o => o.value === type)?.icon ?? 'lucide:type'
}

function fieldTypeLabel(type: ReportFieldType): string {
  return FIELD_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type
}

function newSectionId() {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
function newFieldId() {
  return `fld-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function buildInitialSections(): TemplateSection[] {
  const tpl = props.template
  if (tpl?.sections?.length) {
    return [...tpl.sections]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(sec => ({
        id: `sec-${sec.section_id}`,
        title: sec.title,
        enabled: sec.is_enabled,
        required: sec.is_required,
        clientVisible: sec.client_visible,
        fields: [...sec.fields]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(f => {
            const cfg = (f.config ?? {}) as Record<string, unknown>
            return {
              id: `fld-${f.field_id}`,
              source: f.is_system_field ? 'system' as const : 'custom' as const,
              systemKey: f.is_system_field ? f.field_key : undefined,
              fieldKey: f.field_key,
              label: f.label,
              description: f.description ?? '',
              fieldType: f.field_type,
              isRequired: f.is_required,
              maxChars: typeof cfg.max_chars === 'number' ? cfg.max_chars : undefined,
              dropdownValues: Array.isArray(cfg.dropdown_values) ? (cfg.dropdown_values as string[]).join('\n') : '',
              dropdownMulti: !!cfg.is_multi_select,
              maxFiles: typeof cfg.max_files === 'number' ? cfg.max_files : undefined,
            }
          }),
      }))
  }
  return []
}

const sections = ref<TemplateSection[]>(buildInitialSections())

watch(sections, () => { sectionsDirty.value = true }, { deep: true })

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

// Remove section requires confirmation (spec §1.2.2)
const showRemoveSectionModal = ref(false)
const removeSectionTarget = ref<TemplateSection | null>(null)

function requestRemoveSection(sectionId: string) {
  removeSectionTarget.value = sections.value.find((s: TemplateSection) => s.id === sectionId) ?? null
  showRemoveSectionModal.value = true
}

function closeRemoveSectionModal() {
  showRemoveSectionModal.value = false
  removeSectionTarget.value = null
}

function confirmRemoveSection() {
  if (!removeSectionTarget.value) return
  const id = removeSectionTarget.value.id
  sections.value = sections.value.filter((s: TemplateSection) => s.id !== id)
  delete expandedSections.value[id]
  delete sectionErrors[id]
  closeRemoveSectionModal()
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

// ── Field editors (spec §1.2.3) ──
const expandedFields = ref<Record<string, boolean>>({})
const fieldErrors = reactive<Record<string, string>>({})

function toggleFieldExpand(fieldId: string) {
  expandedFields.value[fieldId] = !expandedFields.value[fieldId]
}

function isFieldExpanded(fieldId: string) {
  return expandedFields.value[fieldId] !== false // default expanded
}

function addField(section: TemplateSection) {
  const sIdx = sections.value.indexOf(section)
  const fIdx = section.fields.length
  const field: SectionField = {
    id: newFieldId(),
    source: 'system',
    systemKey: undefined,
    fieldKey: `custom_${sIdx}_${fIdx}`,
    label: '',
    description: '',
    fieldType: 'text',
    isRequired: true,
    maxChars: undefined,
    dropdownValues: '',
    dropdownMulti: false,
    maxFiles: undefined,
  }
  section.fields.push(field)
  expandedFields.value[field.id] = true
}

function removeField(section: TemplateSection, fieldId: string) {
  section.fields = section.fields.filter(f => f.id !== fieldId)
  delete expandedFields.value[fieldId]
  delete fieldErrors[fieldId]
}

function setFieldSource(field: SectionField, source: 'system' | 'custom') {
  field.source = source
  if (source === 'system') {
    const sys = field.systemKey ? SYSTEM_FIELDS.find(s => s.key === field.systemKey) : undefined
    if (sys) {
      field.fieldKey = sys.key
      field.label = sys.label
      field.fieldType = sys.type
    }
  } else {
    // keep label/description/type; restore editable custom key if it matched a system key
    if (!field.fieldKey || SYSTEM_FIELDS.some(s => s.key === field.fieldKey)) {
      field.fieldKey = `custom_${newFieldId().slice(4, 10)}`
    }
  }
}

function onSystemFieldSelect(field: SectionField, key: string) {
  const sys = SYSTEM_FIELDS.find(s => s.key === key)
  if (!sys) return
  field.systemKey = sys.key
  field.fieldKey = sys.key
  field.label = sys.label
  field.fieldType = sys.type
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
        <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="handleCancel" />

        <!-- Restore (archived templates only) -->
        <AppButton
          v-if="isEdit && isArchived"
          :text="t('tpl.restore')"
          icon="lucide:rotate-ccw"
          type="primary"
          size="sm"
          :loading="isActivating"
          @click="handleActivate"
        />

        <!-- Format / Style Studio (edit mode) -->
        <AppButton
          v-if="isEdit && template"
          :text="t('tpl.format')"
          icon="lucide:palette"
          type="secondary"
          size="sm"
          @click="router.push(`/report-templates/${template.template_id}/format`)"
        />

        <!-- Archive (edit mode, not yet archived) -->
        <AppButton
          v-if="isEdit && !isArchived"
          :text="t('tpl.archive')"
          icon="lucide:archive"
          type="danger"
          size="sm"
          @click="handleArchive"
        />

        <!-- Activate (edit mode, draft only) -->
        <AppButton
          v-if="isEdit && isDraft"
          :text="t('tpl.activate')"
          icon="lucide:check-circle-2"
          type="primary"
          size="sm"
          :loading="isActivating"
          @click="handleActivate"
        />

        <AppButton
          v-if="!isArchived"
          :text="isEdit ? t('tpl.save_changes') : t('tpl.save')"
          icon="lucide:save"
          type="primary"
          size="sm"
          :loading="isSubmitting"
          @click="handleSave()"
        />

        <AppButton
          v-if="!isArchived"
          :text="t('tpl.save_and_back')"
          icon="lucide:save"
          type="secondary"
          size="sm"
          :loading="isSubmitting"
          @click="handleSave(true)"
        />
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
                <div class="status-display">
                  <Badge type="templateStatus" :value="form.status" />
                </div>
              </div>
            </div>

            <!-- Community / Site multi-select -->
            <div class="form-field" :class="{ 'form-field--error': errors.communities }">
              <label class="form-field__label">
                {{ t('tpl.field_communities') }} <span class="req">*</span>
              </label>

              <!-- Global master checkbox -->
              <label class="global-checkbox" @click.prevent="toggleGlobal">
                <span class="multiselect__checkbox" :class="{ 'multiselect__checkbox--checked': form.isGlobal }">
                  <Icon v-if="form.isGlobal" name="lucide:check" :size="11" />
                </span>
                <div style="display: flex; align-items: center;">
                  <Icon name="lucide:globe" :size="13" class="global-checkbox__icon" />
                  <span style="margin-top: var(--space-1)">{{t('tpl.community_global') }}</span>
                </div>
              </label>

              <div
                class="multiselect"
                :class="{ 'multiselect--open': communityDropdownOpen, 'multiselect--disabled': form.isGlobal }"
              >
                <button
                  type="button"
                  class="multiselect__trigger"
                  :disabled="form.isGlobal"
                  @click="communityDropdownOpen = !communityDropdownOpen"
                >
                  <span
                    class="multiselect__display"
                    :class="{ 'multiselect__display--placeholder': !form.communityIds.length }"
                  >
                    {{ communityDisplayText }}
                  </span>
                  <Icon name="lucide:chevron-down" :size="14" class="multiselect__chevron" />
                </button>
                <div v-if="communityDropdownOpen && !form.isGlobal" class="multiselect__dropdown">
                  <div class="multiselect__search">
                    <Icon name="lucide:search" :size="12" class="multiselect__search-icon" />
                    <input
                      v-model="communitySearch"
                      type="text"
                      class="multiselect__search-input"
                      :placeholder="t('tpl.community_search')"
                      @click.stop
                    />
                  </div>
                  <label
                    v-for="c in filteredCommunities"
                    :key="c.community_id"
                    class="multiselect__option"
                    :class="{ 'multiselect__option--selected': isCommunitySelected(c.community_id) }"
                    @click.prevent="toggleCommunity(c.community_id)"
                  >
                    <span class="multiselect__checkbox">
                      <Icon v-if="isCommunitySelected(c.community_id)" name="lucide:check" :size="11" />
                    </span>
                    <span>{{ c.name }}</span>
                  </label>
                  <p v-if="!filteredCommunities.length" class="multiselect__empty">{{ t('reports.no_communities') }}</p>
                </div>
              </div>
              <span v-if="errors.communities" class="field-error">{{ errors.communities }}</span>
              <!-- Selected chips -->
              <div v-if="!form.isGlobal && form.communityIds.length" class="community-chips">
                <span v-for="chip in selectedCommunityChips" :key="chip.id" class="community-chip">
                  {{ chip.name }}
                  <button class="chip-remove" @click="toggleCommunity(chip.id)">
                    <Icon name="lucide:x" :size="10" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Report Title Format -->
            <div class="form-field" :class="{ 'form-field--error': errors.titleFormat }">
              <label class="form-field__label">
                {{ t('tpl.field_title_format') }} <span class="req">*</span>
              </label>
              <input
                v-model="form.titleFormat"
                type="text"
                class="form-field__input"
                maxlength="500"
                :placeholder="t('tpl.field_title_format_placeholder')"
              />
              <div class="form-field__footer">
                <span class="field-error">{{ errors.titleFormat }}</span>
                <span class="char-count">{{ form.titleFormat.length }}/500</span>
              </div>
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
              <!-- Live example — tokens replaced with sample values -->
              <div v-if="form.titleFormat.trim()" class="title-format-example">
                <span class="title-format-example__label">{{ t('tpl.title_example') }}</span>
                <Icon name="lucide:arrow-right" :size="12" />
                <span class="title-format-example__text">{{ titleFormatExample }}</span>
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

            <!-- Meta (edit mode, read-only) -->
            <div v-if="isEdit && template" class="meta-grid">
              <div class="meta-item">
                <span class="meta-item__label">{{ t('tpl.created_by') }}</span>
                <span class="meta-item__value">{{ template.created_by_name ?? '—' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-item__label">{{ t('tpl.created_on') }}</span>
                <span class="meta-item__value">{{ formatDateTime(template.created_on) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-item__label">{{ t('tpl.last_update') }}</span>
                <span class="meta-item__value">{{ formatDateTime(template.last_update) }}</span>
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

            <p v-if="errors.sections" class="field-error sections-error">{{ errors.sections }}</p>

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
                'section-card--error': sectionErrors[sec.id],
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
                  <button class="section-action-btn section-action-btn--danger" :title="t('tpl.section_delete')" @click="requestRemoveSection(sec.id)">
                    <Icon name="lucide:trash-2" :size="14" />
                  </button>
                </div>
              </div>
              <p v-if="sectionErrors[sec.id]" class="field-error section-card__error">{{ sectionErrors[sec.id] }}</p>

              <!-- Fields area (expanded) -->
              <div v-if="isSectionExpanded(sec.id)" class="section-card__fields">

                <!-- Field editors list -->
                <div
                  v-if="sec.fields.length"
                  class="fields-list"
                  @dragover.prevent
                  @drop="onFieldListDrop($event, sec.id)"
                >
                  <div
                    v-for="(field, fIdx) in sec.fields"
                    :key="field.id"
                    class="field-editor"
                    :class="{
                      'field-editor--dragging': dragFieldKey === makeFieldKey(sec.id, field.id),
                      'field-editor--drag-over': dragOverFieldKey === makeFieldKey(sec.id, field.id),
                      'field-editor--error': fieldErrors[field.id],
                    }"
                    draggable="true"
                    @dragstart="onFieldDragStart($event, sec.id, field.id)"
                    @dragover="onFieldDragOver($event, sec.id, field.id)"
                    @dragleave="onFieldDragLeave"
                    @drop="onFieldDrop($event, sec.id, field.id)"
                    @dragend="onFieldDragEnd"
                  >
                    <!-- Collapsed header row -->
                    <div class="field-editor__header" @click="toggleFieldExpand(field.id)">
                      <span class="field-row__drag" :title="t('tpl.drag_handle')" @click.stop>
                        <Icon name="lucide:grip-vertical" :size="12" />
                      </span>
                      <div class="field-row__order" @click.stop>
                        <button class="order-btn order-btn--sm" :disabled="fIdx === 0" @click="moveFieldUp(sec, fIdx)">
                          <Icon name="lucide:chevron-up" :size="11" />
                        </button>
                        <button class="order-btn order-btn--sm" :disabled="fIdx === sec.fields.length - 1" @click="moveFieldDown(sec, fIdx)">
                          <Icon name="lucide:chevron-down" :size="11" />
                        </button>
                      </div>
                      <Icon
                        :name="fieldTypeIcon(field.fieldType)"
                        :size="13"
                        class="field-row__icon"
                      />
                      <span class="field-row__label">
                        {{ field.label || t('tpl.field_untitled') }}
                      </span>
                      <span class="field-row__src-badge" :class="{ 'field-row__src-badge--custom': field.source === 'custom' }">
                        {{ field.source === 'system' ? t('tpl.field_source_system') : t('tpl.field_source_custom') }}
                      </span>
                      <span v-if="field.isRequired" class="field-row__req-badge">{{ t('tpl.field_required_badge') }}</span>
                      <button
                        class="field-row__remove"
                        :title="t('tpl.field_remove')"
                        @click.stop="removeField(sec, field.id)"
                      >
                        <Icon name="lucide:x" :size="12" />
                      </button>
                      <Icon
                        :name="isFieldExpanded(field.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                        :size="13"
                        class="field-row__chevron"
                      />
                    </div>

                    <!-- Expanded editor body -->
                    <div v-if="isFieldExpanded(field.id)" class="field-editor__body">
                      <!-- Field source -->
                      <div class="fe-source">
                        <label
                          class="fe-source__option"
                          :class="{ 'fe-source__option--active': field.source === 'system' }"
                        >
                          <input
                            type="radio"
                            class="sr-only"
                            :checked="field.source === 'system'"
                            @change="setFieldSource(field, 'system')"
                          />
                          <Icon name="lucide:form-input" :size="13" />
                          {{ t('tpl.field_source_system') }}
                        </label>
                        <label
                          class="fe-source__option"
                          :class="{ 'fe-source__option--active': field.source === 'custom' }"
                        >
                          <input
                            type="radio"
                            class="sr-only"
                            :checked="field.source === 'custom'"
                            @change="setFieldSource(field, 'custom')"
                          />
                          <Icon name="lucide:sparkles" :size="13" />
                          {{ t('tpl.field_source_custom') }}
                        </label>
                      </div>

                      <!-- System field picker -->
                      <div v-if="field.source === 'system'" class="form-field">
                        <label class="form-field__label">{{ t('tpl.field_system_picker') }} <span class="req">*</span></label>
                        <select
                          :value="field.systemKey ?? ''"
                          class="form-field__select"
                          @change="onSystemFieldSelect(field, ($event.target as HTMLSelectElement).value)"
                        >
                          <option value="" disabled>{{ t('tpl.field_system_picker_placeholder') }}</option>
                          <option v-for="sf in SYSTEM_FIELDS" :key="sf.key" :value="sf.key">{{ sf.label }}</option>
                        </select>
                      </div>

                      <!-- Field key (custom only) -->
                      <div v-else class="form-field">
                        <label class="form-field__label">{{ t('tpl.field_key') }} <span class="req">*</span></label>
                        <input
                          v-model="field.fieldKey"
                          type="text"
                          class="form-field__input form-field__input--mono"
                          maxlength="50"
                          :placeholder="t('tpl.field_key_placeholder')"
                        />
                      </div>

                      <div class="fe-grid">
                        <!-- Label -->
                        <div class="form-field">
                          <label class="form-field__label">{{ t('tpl.field_label') }} <span class="req">*</span></label>
                          <input
                            v-model="field.label"
                            type="text"
                            class="form-field__input"
                            maxlength="80"
                            :readonly="field.source === 'system'"
                            :class="{ 'form-field__input--readonly': field.source === 'system' }"
                            :placeholder="t('tpl.field_label_placeholder')"
                          />
                        </div>

                        <!-- Field type -->
                        <div class="form-field">
                          <label class="form-field__label">{{ t('tpl.field_type') }} <span class="req">*</span></label>
                          <select
                            v-if="field.source === 'custom'"
                            v-model="field.fieldType"
                            class="form-field__select"
                          >
                            <option v-for="opt in FIELD_TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                          </select>
                          <div v-else class="fe-readonly-value">
                            <Icon :name="fieldTypeIcon(field.fieldType)" :size="13" />
                            {{ fieldTypeLabel(field.fieldType) }}
                          </div>
                        </div>
                      </div>

                      <!-- Description -->
                      <div class="form-field">
                        <label class="form-field__label">{{ t('tpl.custom_field_description') }}</label>
                        <input
                          v-model="field.description"
                          type="text"
                          class="form-field__input"
                          maxlength="500"
                          :placeholder="t('tpl.custom_field_description_placeholder')"
                        />
                      </div>

                      <!-- Type-specific config -->
                      <div v-if="field.fieldType === 'text'" class="form-field">
                        <label class="form-field__label">{{ t('tpl.custom_field_max_chars') }}</label>
                        <input
                          v-model.number="field.maxChars"
                          type="number"
                          min="10"
                          class="form-field__input form-field__input--short"
                        />
                      </div>

                      <div v-if="field.fieldType === 'dropdown' && field.source === 'custom'" class="form-field">
                        <label class="form-field__label">{{ t('tpl.custom_field_dropdown_values') }} <span class="req">*</span></label>
                        <textarea
                          v-model="field.dropdownValues"
                          class="form-field__textarea"
                          rows="4"
                          :placeholder="t('tpl.custom_field_dropdown_values_placeholder')"
                        />
                        <label class="mini-toggle fe-config-toggle">
                          <input v-model="field.dropdownMulti" type="checkbox" class="sr-only" />
                          <span class="mini-toggle__track" :class="{ 'mini-toggle__track--on': field.dropdownMulti }">
                            <span class="mini-toggle__thumb" />
                          </span>
                          <span class="mini-toggle__label">{{ t('tpl.custom_field_multi_select') }}</span>
                        </label>
                      </div>

                      <div v-if="field.fieldType === 'file_upload'" class="form-field">
                        <label class="form-field__label">{{ t('tpl.custom_field_max_files') }}</label>
                        <input
                          v-model.number="field.maxFiles"
                          type="number"
                          min="1"
                          class="form-field__input form-field__input--short"
                        />
                      </div>

                      <!-- Required toggle -->
                      <div class="fe-footer">
                        <label class="mini-toggle">
                          <input v-model="field.isRequired" type="checkbox" class="sr-only" />
                          <span class="mini-toggle__track" :class="{ 'mini-toggle__track--on': field.isRequired }">
                            <span class="mini-toggle__thumb" />
                          </span>
                          <span class="mini-toggle__label">{{ t('tpl.field_required') }}</span>
                        </label>
                      </div>
                      <p v-if="fieldErrors[field.id]" class="field-error">{{ fieldErrors[field.id] }}</p>
                    </div>
                  </div>
                </div>

                <!-- Add Field button -->
                <button class="btn-add-field-bottom" @click="addField(sec)">
                  <Icon name="lucide:plus" :size="13" />
                  {{ t('tpl.add_field') }}
                </button>

              </div>
            </div>

            <!-- Add Section (below last section card) -->
            <button v-if="sections.length" class="btn-add-section-bottom" @click="addSection">
              <Icon name="lucide:plus" :size="14" />
              {{ t('tpl.add_section') }}
            </button>

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

  <!-- ── Remove Section confirm modal ── -->
  <AppDialogModal
    :show="showRemoveSectionModal"
    :title="t('tpl.remove_section_title')"
    max-width="420px"
    @close="closeRemoveSectionModal"
  >
    <p class="modal__text">{{ t('tpl.remove_section_desc') }}</p>
    <template #footer>
      <AppButton :text="t('common.cancel')" type="secondary" size="sm" @click="closeRemoveSectionModal" />
      <AppButton
        :text="t('tpl.remove_section_confirm')"
        icon="lucide:trash-2"
        type="danger"
        size="sm"
        @click="confirmRemoveSection"
      />
    </template>
  </AppDialogModal>

  <!-- Close community dropdown on outside click -->
  <div
    v-if="communityDropdownOpen"
    class="overlay-dismiss"
    @click="communityDropdownOpen = false"
  />
</template>

<style scoped>
/* ── Layout ── */
.tpl-editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
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
  margin-left: 10px;
  margin-top: 0px;
  margin-right: 0px;  
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
  margin-top: 0px;
}
.token-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

.title-format-example {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.title-format-example__label {
  flex-shrink: 0;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 10px;
}

.title-format-example__text {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  word-break: break-word;
}

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

.btn-add-section-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}
.btn-add-section-bottom:hover { border-color: var(--color-accent); color: var(--color-accent); }

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
  margin-right: 0px;
  margin-top: 10px;
  margin-bottom: 10px;
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
  margin-top: var(--space-4)
}
.section-title-input:focus { border-color: var(--color-accent); }
.section-title-input::placeholder { color: var(--color-text-muted); font-weight: 400; }

/* ── Mini toggles ── */
.section-toggles {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-4)
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
  margin-top: var(--space-4)
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
  margin-top: 0px
}
.section-action-btn:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-bg-surface); }
.section-action-btn--danger:hover { border-color: var(--color-critical); color: var(--color-critical); background: rgba(239,68,68,0.08);}

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
  margin-top: 0px;
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

/* ── Status display (read-only) ── */
.status-display {
  padding: var(--space-1) 0;
}

/* ── Global checkbox ── */
.global-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
}
.global-checkbox__icon { color: #14b8a6; margin-right: var(--space-2) }

.multiselect--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.multiselect__checkbox--checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.multiselect__empty {
  padding: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.multiselect__search {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
}
.multiselect__search-icon { color: var(--color-text-muted); flex-shrink: 0; }
.multiselect__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}
.multiselect__search-input::placeholder { color: var(--color-text-muted); }

/* ── Meta grid (read-only) ── */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.meta-item__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.meta-item__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* ── Section errors ── */
.sections-error { margin: 0 0 var(--space-3); }
.section-card--error { border-color: var(--color-critical, #ef4444); }
.section-card__error { padding: 0 var(--space-4) var(--space-2); margin: 0; }

/* ── Field editor ── */
.field-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.field-editor--dragging { opacity: 0.5; }
.field-editor--drag-over { border-color: var(--color-accent); box-shadow: 0 -2px 0 0 var(--color-accent); }
.field-editor--error { border-color: var(--color-critical, #ef4444); }

.field-editor__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  user-select: none;
}

.field-row__chevron { color: var(--color-text-muted); flex-shrink: 0; }

.field-row__src-badge {
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  flex-shrink: 0;
}
.field-row__src-badge--custom {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}

.field-row__req-badge {
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  flex-shrink: 0;
}

.field-editor__body {
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.fe-source {
  display: flex;
  gap: var(--space-2);
}
.fe-source__option {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}
.fe-source__option--active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(229, 255, 68, 0.08);
}

.fe-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.fe-readonly-value {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.fe-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.fe-config-toggle { margin-top: var(--space-2); }

.btn-add-field-bottom {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}
.btn-add-field-bottom:hover { border-color: var(--color-accent); color: var(--color-accent); }

.form-field__input--mono { font-family: monospace; }
.form-field__input--readonly {
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
}

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
