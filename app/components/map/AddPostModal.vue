<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import type { PostPermissions } from '~/api/types/asset'

const props = defineProps<{
  show: boolean
  location?: { x: number; y: number; lat?: number; lng?: number } | null
  priorities?: string[]
  initialData?: PostFormData | null
  communities?: { community_id: number; name: string }[]
  communityId?: string
  shape?: 'place' | 'circle' | 'line'
  serverError?: string
}>()

const emit = defineEmits<{
  close: []
  save: [post: PostFormData]
}>()

export interface PostFormData {
  id: string
  name: string
  description: string
  priority: string
  equipment: string
  active: boolean
  location: { x: number; y: number } | null
  permissions?: PostPermissions
  communityId?: string
  shape?: 'place' | 'circle' | 'line'
}

const { t } = useTranslation()

const priorityOptions = computed(() => props.priorities?.length ? props.priorities : ['Urgent', 'Important', 'Normal', 'Low'])

const roleOptions = ref(['Supervisor', 'Patrol', 'Dispatcher', 'Sergeant'])
const badgeOptions = ref(['Armed', 'First Aid', 'CPR', 'K9', 'Taser'])

const newEquipment = ref('')

const emptyPermissions = (): PostPermissions => ({
  required_roles: [],
  required_badges: [],
  required_equipment: [],
})

const form = reactive<PostFormData>({
  id: `PST-${Math.floor(Math.random() * 9000 + 1000)}`,
  name: '',
  description: '',
  priority: 'Normal',
  equipment: '',
  active: true,
  location: props.location ?? null,
  permissions: emptyPermissions(),
  communityId: props.communityId ?? '',
  shape: props.shape,
})

const errors = reactive<Record<string, string>>({})

watch(() => props.show, (show: boolean) => {
  if (!show) return
  const initial = props.initialData
  form.id = initial?.id || `PST-${Math.floor(Math.random() * 9000 + 1000)}`
  form.name = initial?.name || ''
  form.description = initial?.description || ''
  form.priority = initial?.priority || 'Normal'
  form.equipment = initial?.equipment || ''
  form.active = initial?.active ?? true
  form.location = props.location ? { x: props.location.x, y: props.location.y } : (initial?.location ?? null)
  form.communityId = initial?.communityId ?? props.communityId ?? ''
  form.shape = initial?.shape ?? props.shape
  form.permissions = {
    required_roles: [...(initial?.permissions?.required_roles || [])],
    required_badges: [...(initial?.permissions?.required_badges || [])],
    required_equipment: [...(initial?.permissions?.required_equipment || [])],
  }
  newEquipment.value = ''
  for (const key of Object.keys(errors)) errors[key] = ''
})

watch(() => props.serverError, (message) => {
  if (message) errors.name = message
})

const isEditing = computed(() => !!props.initialData?.id)

const shapeOptions = computed(() => [
  { value: 'place', label: t('map.shape_dot') },
  { value: 'circle', label: t('map.shape_circle') },
  { value: 'line', label: t('map.shape_line') },
] as const)

const communityName = computed(() => {
  const communityId = Number(form.communityId)
  if (!communityId) return '—'
  return props.communities?.find(c => c.community_id === communityId)?.name || '—'
})

function validate(): boolean {
  errors.name = !form.name.trim() ? t('validation.required') : ''
  if (form.name.length > 60) errors.name = t('map.post_name_max')
  if (!isEditing.value) {
    errors.communityId = !form.communityId ? t('validation.required') : ''
  }
  return !errors.name && !errors.communityId
}

function handleSave() {
  if (!validate()) return
  const payload: PostFormData = { ...form }
  const p = form.permissions
  const hasPermissions = p && (p.required_roles?.length || p.required_badges?.length || p.required_equipment?.length)
  if (!hasPermissions) delete payload.permissions
  emit('save', payload)
}

function isRoleSelected(role: string) {
  return form.permissions?.required_roles?.includes(role) ?? false
}

function toggleRole(role: string) {
  const roles = form.permissions?.required_roles || []
  const index = roles.indexOf(role)
  if (index >= 0) roles.splice(index, 1)
  else roles.push(role)
}

function isBadgeSelected(badge: string) {
  return form.permissions?.required_badges?.includes(badge) ?? false
}

function toggleBadge(badge: string) {
  const badges = form.permissions?.required_badges || []
  const index = badges.indexOf(badge)
  if (index >= 0) badges.splice(index, 1)
  else badges.push(badge)
}

function addEquipmentTag() {
  const value = newEquipment.value.trim()
  if (!value) return
  const equipment = form.permissions?.required_equipment || []
  if (!equipment.includes(value)) equipment.push(value)
  newEquipment.value = ''
}

function removeEquipmentTag(index: number) {
  form.permissions?.required_equipment?.splice(index, 1)
}

function handleEquipmentKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addEquipmentTag()
  }
}

const locationLabel = computed(() => {
  const location = props.location ?? form.location
  if (!location) return ''
  if ('lat' in location && (location as any).lat != null && (location as any).lng != null) {
    return `${Number((location as any).lat).toFixed(6)}, ${Number((location as any).lng).toFixed(6)}`
  }
  return `x: ${location.x}, y: ${location.y}`
})
</script>

<template>
  <AppModal
    :show="show"
    :title="isEditing ? t('map.edit_post_title') : t('map.add_post_title')"
    :cancel-text="t('common.cancel')"
    :ok-text="t('common.save')"
    @close="emit('close')"
    @cancel="emit('close')"
    @ok="handleSave"
  >
    <template #default>
      <div class="modal-form">
        <div class="form-field form-field--readonly">
          <label class="field-label">{{ t('map.post_id') }}</label>
          <div class="readonly-value">{{ form.id }}</div>
        </div>

        <!-- Community (Section 1.8) -->
        <div class="form-field" :class="{ 'form-field--readonly': isEditing, error: errors.communityId }">
          <label class="field-label">{{ t('communities.community') }} <span v-if="!isEditing" class="required">*</span></label>
          <select v-if="!isEditing" v-model="form.communityId" class="field-select">
            <option value="" disabled>{{ t('officers.select_community') }}</option>
            <option v-for="community in communities" :key="community.community_id" :value="String(community.community_id)">{{ community.name }}</option>
          </select>
          <div v-else class="readonly-value">{{ communityName }}</div>
          <span v-if="errors.communityId" class="error-message">{{ errors.communityId }}</span>
        </div>

        <div class="form-field" :class="{ error: errors.name }">
          <label class="field-label">{{ t('map.post_name') }} <span class="required">*</span></label>
          <input v-model="form.name" type="text" class="field-input" :placeholder="t('map.post_name_placeholder')" maxlength="60" />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          <span class="field-hint">{{ form.name.length }}/60 {{ t('map.chars') }}</span>
        </div>

        <div class="form-field">
          <label class="field-label">{{ t('map.description') }}</label>
          <textarea v-model="form.description" class="field-textarea" rows="3" :placeholder="t('map.post_description_placeholder')" maxlength="200" />
          <span class="field-hint">{{ form.description.length }}/200 {{ t('map.chars') }}</span>
        </div>

        <div class="form-row-2col">
          <div class="form-field">
            <label class="field-label">{{ t('map.priority') }}</label>
            <select v-model="form.priority" class="field-select">
              <option v-for="p in priorityOptions" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="form-field">
            <label class="field-label">{{ t('map.active') }}</label>
            <label class="toggle-label">
              <input v-model="form.active" type="checkbox" />
              <span class="toggle-text">{{ form.active ? t('common.active') : t('common.inactive') }}</span>
            </label>
          </div>
        </div>

        <!-- Shape (Section 1.8) -->
        <div class="form-field">
          <label class="field-label">{{ t('map.shape') }}</label>
          <div class="shape-radio-group">
            <label
              v-for="option in shapeOptions"
              :key="option.value"
              class="shape-radio"
              :class="{ 'shape-radio--checked': form.shape === option.value }"
            >
              <input type="radio" :value="option.value" :checked="form.shape === option.value" disabled>
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>

        <div class="form-field form-field--readonly">
          <label class="field-label">{{ t('map.location') }}</label>
          <div class="readonly-value location-value">
            <Icon name="lucide:map-pin" :size="14" />
            <span v-if="locationLabel">{{ locationLabel }}</span>
            <span v-else class="muted">{{ t('map.location_auto') }}</span>
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">{{ t('map.equipment') }}</label>
          <textarea v-model="form.equipment" class="field-textarea" rows="2" :placeholder="t('map.equipment_placeholder')" />
        </div>

        <!-- Eligibility Requirements (Section 1.5) -->
        <div class="eligibility-panel">
          <h4 class="eligibility-title">{{ t('map.eligibility_requirements') }}</h4>

          <div class="eligibility-group">
            <span class="eligibility-label">{{ t('map.required_roles') }}</span>
            <div class="eligibility-options">
              <label v-for="role in roleOptions" :key="role" class="eligibility-option" :class="{ active: isRoleSelected(role) }">
                <input type="checkbox" :checked="isRoleSelected(role)" @change="toggleRole(role)">
                <span>{{ role }}</span>
              </label>
            </div>
          </div>

          <div class="eligibility-group">
            <span class="eligibility-label">{{ t('map.required_badges') }}</span>
            <div class="eligibility-options">
              <label v-for="badge in badgeOptions" :key="badge" class="eligibility-option" :class="{ active: isBadgeSelected(badge) }">
                <input type="checkbox" :checked="isBadgeSelected(badge)" @change="toggleBadge(badge)">
                <span>{{ badge }}</span>
              </label>
            </div>
          </div>

          <div class="eligibility-group">
            <span class="eligibility-label">{{ t('map.required_equipment') }}</span>
            <input
              v-model="newEquipment"
              type="text"
              class="field-input"
              :placeholder="t('map.add_equipment_hint')"
              @keydown="handleEquipmentKeydown"
            >
            <div v-if="form.permissions?.required_equipment?.length" class="equipment-tags">
              <span v-for="(item, index) in form.permissions.required_equipment" :key="item" class="equipment-tag">
                {{ item }}
                <button type="button" class="equipment-tag__remove" @click="removeEquipmentTag(index)">
                  <Icon name="lucide:x" :size="20" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 400px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.field-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-critical);
}

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  box-sizing: border-box;
}

.field-select {
  height: 40px;
  cursor: pointer;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  border-color: var(--color-accent);
}

.field-textarea {
  resize: vertical;
  line-height: 1.5;
}

.form-field.error .field-input,
.form-field.error .field-select {
  border-color: var(--color-critical);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.field-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  height: 40px;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}

.toggle-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.form-field--readonly .field-label {
  color: var(--color-text-muted);
}

.readonly-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.location-value {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.muted {
  color: var(--color-text-muted);
  font-style: italic;
  font-weight: 400;
}

/* Eligibility panel */
.eligibility-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.eligibility-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.eligibility-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.eligibility-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.eligibility-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.eligibility-option {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-base);
}

.eligibility-option.active {
  background: rgba(13, 110, 253, 0.12);
  border-color: rgba(13, 110, 253, 0.5);
  color: var(--color-text-primary);
}

.eligibility-option input[type="checkbox"] {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.equipment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

.equipment-tag {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 2px var(--space-2);
  color: var(--color-text-primary);
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.equipment-tag__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0 0 10px 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 0;
}

.equipment-tag__remove :deep(svg) {
  display: block;
}

.equipment-tag__remove:hover {
  color: var(--color-critical);
}

.shape-radio-group {
  display: flex;
  gap: var(--space-2);
}

.shape-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.shape-radio--checked {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}

.shape-radio input {
  accent-color: var(--color-accent);
  margin: 0;
}
</style>
