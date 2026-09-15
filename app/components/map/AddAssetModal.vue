<script setup lang="ts">
import { reactive, computed } from 'vue'

interface FormLocation {
  x: number
  y: number
  lat?: number
  lng?: number
}

const props = defineProps<{
  show: boolean
  location?: FormLocation | null
  assetTypes?: string[]
  initialData?: AssetFormData | null
  communities?: { community_id: number; name: string }[]
  communityId?: string
  shape?: 'place' | 'circle' | 'line'
}>()

const emit = defineEmits<{
  close: []
  save: [asset: AssetFormData]
}>()

export interface AssetFormData {
  id: string
  type: string
  installationDate: string
  replacementDate: string
  description: string
  location: FormLocation | null
  shape?: 'place' | 'circle' | 'line'
  acres?: number
  communityId?: string
}

const { t } = useTranslation()

const assetTypeOptions = computed(() => props.assetTypes?.length ? props.assetTypes : ['Door', 'Window', 'Camera', 'Gate', 'Sensor', 'Light', 'Other'])

const form = reactive<AssetFormData>({
  id: `AST-${Math.floor(Math.random() * 9000 + 1000)}`,
  type: '',
  installationDate: '',
  replacementDate: '',
  description: '',
  location: props.location ?? null,
  shape: props.shape,
  communityId: props.communityId ?? '',
})

watch(() => props.show, (show: boolean) => {
  if (!show) return
  const initial = props.initialData
  form.id = initial?.id || `AST-${Math.floor(Math.random() * 9000 + 1000)}`
  form.type = initial?.type || ''
  form.installationDate = initial?.installationDate || ''
  form.replacementDate = initial?.replacementDate || ''
  form.description = initial?.description || ''
  form.location = props.location ?? initial?.location ?? null
  form.shape = initial?.shape ?? props.shape
  form.acres = initial?.acres
  form.communityId = initial?.communityId ?? props.communityId ?? ''
})

const isEditing = computed(() => !!props.initialData?.id)
const showAcreage = computed(() => isEditing.value && form.shape === 'circle' && form.acres != null && form.acres > 0)
const communityName = computed(() => props.communities?.find(c => String(c.community_id) === String(form.communityId))?.name || '')
const shapeOptions = computed(() => [
  { value: 'place', label: t('map.shape_dot') },
  { value: 'circle', label: t('map.shape_circle') },
  { value: 'line', label: t('map.shape_line') },
] as const)
const locationLabel = computed(() => {
  const location = form.location
  if (!location) return ''
  if (location.lat != null && location.lng != null) return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
  return `x: ${location.x}, y: ${location.y}`
})

const errors = reactive<Record<string, string>>({})

function validate(): boolean {
  errors.community = !isEditing.value && !form.communityId ? t('validation.required') : ''
  errors.type = !form.type ? t('validation.required') : ''
  return !errors.community && !errors.type
}

function handleSave() {
  if (!validate()) return
  emit('save', { ...form })
  emit('close')
}
</script>

<template>
  <AppModal
    :show="show"
    :title="props.initialData?.id ? t('map.edit_asset_title') : t('map.add_asset_title')"
    :cancel-text="t('common.cancel')"
    :ok-text="t('common.save')"
    @close="emit('close')"
    @cancel="emit('close')"
    @ok="handleSave"
  >
    <template #default>
      <div class="modal-form">
        <div class="form-field form-field--readonly">
          <label class="field-label">{{ t('map.asset_id') }}</label>
          <div class="readonly-value">{{ form.id }}</div>
        </div>

        <div class="form-field" :class="{ error: errors.community }">
          <label class="field-label">{{ t('communities.community') }} <span v-if="!isEditing" class="required">*</span></label>
          <select v-if="!isEditing" v-model="form.communityId" class="field-select">
            <option value="" disabled>{{ t('officers.select_community') }}</option>
            <option v-for="c in communities || []" :key="c.community_id" :value="String(c.community_id)">{{ c.name }}</option>
          </select>
          <div v-else class="readonly-value">{{ communityName || '—' }}</div>
          <span v-if="errors.community" class="error-message">{{ errors.community }}</span>
        </div>

        <div class="form-field" :class="{ error: errors.type }">
          <label class="field-label">{{ t('map.asset_type') }} <span class="required">*</span></label>
          <select v-model="form.type" class="field-select">
            <option value="" disabled>{{ t('map.select_type') }}</option>
            <option v-for="type in assetTypeOptions" :key="type" :value="type">{{ type }}</option>
          </select>
          <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
        </div>

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

        <div class="form-row-2col">
          <div class="form-field">
            <label class="field-label">{{ t('map.installation_date') }}</label>
            <input v-model="form.installationDate" type="date" class="field-input" />
          </div>
          <div class="form-field">
            <label class="field-label">{{ t('map.replacement_date') }}</label>
            <input v-model="form.replacementDate" type="date" class="field-input" />
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">{{ t('map.description') }}</label>
          <textarea v-model="form.description" class="field-textarea" rows="3" maxlength="500" :placeholder="t('map.asset_description_placeholder')" />
          <span class="char-counter">{{ form.description.length }} / 500</span>
        </div>

        <div v-if="showAcreage" class="form-field form-field--readonly">
          <label class="field-label">Acreage</label>
          <div class="readonly-value">Area: {{ form.acres!.toFixed(4) }} Acres</div>
        </div>

        <div class="form-field form-field--readonly">
          <label class="field-label">{{ t('map.location') }}</label>
          <div class="readonly-value location-value">
            <Icon name="lucide:map-pin" :size="14" />
            <span v-if="form.location">{{ locationLabel }}</span>
            <span v-else class="muted">{{ t('map.location_auto') }}</span>
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

.char-counter {
  align-self: flex-end;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
