<script setup lang="ts">
import { reactive, computed } from 'vue'

const props = defineProps<{
  show: boolean
  location?: { x: number; y: number } | null
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
  location: { x: number; y: number } | null
}

const { t } = useTranslation()

const ASSET_TYPES = ['Door', 'Window', 'Camera', 'Gate', 'Sensor', 'Light', 'Other']

const form = reactive<AssetFormData>({
  id: `AST-${Math.floor(Math.random() * 9000 + 1000)}`,
  type: '',
  installationDate: '',
  replacementDate: '',
  description: '',
  location: props.location ?? null,
})

const errors = reactive<Record<string, string>>({})

function validate(): boolean {
  errors.type = !form.type ? t('validation.required') : ''
  return !errors.type
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
    :title="t('map.add_asset_title')"
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

        <div class="form-field" :class="{ error: errors.type }">
          <label class="field-label">{{ t('map.asset_type') }} <span class="required">*</span></label>
          <select v-model="form.type" class="field-select">
            <option value="" disabled>{{ t('map.select_type') }}</option>
            <option v-for="type in ASSET_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
          <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
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
          <textarea v-model="form.description" class="field-textarea" rows="3" :placeholder="t('map.asset_description_placeholder')" />
        </div>

        <div class="form-field form-field--readonly">
          <label class="field-label">{{ t('map.location') }}</label>
          <div class="readonly-value location-value">
            <Icon name="lucide:map-pin" :size="14" />
            <span v-if="form.location">x: {{ form.location.x }}, y: {{ form.location.y }}</span>
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
</style>
