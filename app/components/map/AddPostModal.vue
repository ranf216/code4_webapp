<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  show: boolean
  location?: { x: number; y: number } | null
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
}

const { t } = useTranslation()

const PRIORITIES = ['Urgent', 'Important', 'Normal', 'Low']

const form = reactive<PostFormData>({
  id: `PST-${Math.floor(Math.random() * 9000 + 1000)}`,
  name: '',
  description: '',
  priority: 'Normal',
  equipment: '',
  active: true,
  location: props.location ?? null,
})

const errors = reactive<Record<string, string>>({})

function validate(): boolean {
  errors.name = !form.name.trim() ? t('validation.required') : ''
  if (form.name.length > 60) errors.name = t('map.post_name_max')
  return !errors.name
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
    :title="t('map.add_post_title')"
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
              <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
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

        <div class="form-field">
          <label class="field-label">{{ t('map.equipment') }}</label>
          <input v-model="form.equipment" type="text" class="field-input" :placeholder="t('map.equipment_placeholder')" />
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

.form-field.error .field-input {
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
</style>
