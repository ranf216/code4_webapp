<script setup lang="ts">
import { reactive, watch, computed } from 'vue'

interface ModalLocation { x: number; y: number; lat?: number; lng?: number }

const props = defineProps<{
  show: boolean
  location?: ModalLocation | null
  points?: ModalLocation[]
  initialData?: ZoneFormData | null
  communities?: { community_id: number; name: string }[]
  communityId?: string
}>()

const emit = defineEmits<{
  close: []
  save: [zone: ZoneFormData]
}>()

export interface ZoneFormData {
  id: string
  name: string
  zoneType: 'entry_exit' | 'high_priority'
  communityId?: string
}

const { t } = useTranslation()

const form = reactive<ZoneFormData>({
  id: `ZN-${Math.floor(Math.random() * 9000 + 1000)}`,
  name: '',
  zoneType: 'entry_exit',
  communityId: props.communityId ?? '',
})

const errors = reactive<Record<string, string>>({})

watch(() => props.show, (show: boolean) => {
  if (!show) return
  const initial = props.initialData
  form.id = initial?.id || `ZN-${Math.floor(Math.random() * 9000 + 1000)}`
  form.name = initial?.name || ''
  form.zoneType = initial?.zoneType || 'entry_exit'
  form.communityId = initial?.communityId ?? props.communityId ?? ''
  for (const key of Object.keys(errors)) errors[key] = ''
})

const isEditing = computed(() => !!props.initialData?.id)

const zoneTypeOptions = computed(() => [
  { value: 'entry_exit', label: t('map.entry_exit') },
  { value: 'high_priority', label: t('map.zone') },
] as const)

const communityName = computed(() => {
  const communityId = Number(form.communityId)
  if (!communityId) return '—'
  return props.communities?.find(c => c.community_id === communityId)?.name || '—'
})

const locationLabel = computed(() => {
  const points = props.points || []
  if (points.length > 1) {
    const first = points[0]
    const coords = first?.lat != null && first?.lng != null ? ` ${first.lat.toFixed(6)}, ${first.lng.toFixed(6)}` : ''
    return `${t('map.polygon')} (${points.length} ${t('map.points')})${coords ? ` —${coords}…` : ''}`
  }
  const location = props.location
  if (!location) return ''
  if (location.lat != null && location.lng != null) {
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
  }
  return `x: ${location.x}, y: ${location.y}`
})

function validate(): boolean {
  errors.name = !form.name.trim() ? t('validation.required') : ''
  if (form.name.length > 100) errors.name = t('map.zone_name_max')
  if (!isEditing.value) {
    errors.communityId = !form.communityId ? t('validation.required') : ''
  }
  return !errors.name && !errors.communityId
}

function handleSave() {
  if (!validate()) return
  emit('save', { ...form, name: form.name.trim() })
}
</script>

<template>
  <AppModal
    :show="show"
    :title="isEditing ? t('map.edit_zone_title') : t('map.add_zone_title')"
    :cancel-text="t('common.cancel')"
    :ok-text="t('common.save')"
    @close="emit('close')"
    @cancel="emit('close')"
    @ok="handleSave"
  >
    <template #default>
      <div class="modal-form">
        <!-- Community (Section 1.9) -->
        <div class="form-field" :class="{ 'form-field--readonly': isEditing, error: errors.communityId }">
          <label class="field-label">{{ t('communities.community') }} <span v-if="!isEditing" class="required">*</span></label>
          <select v-if="!isEditing" v-model="form.communityId" class="field-select">
            <option value="" disabled>{{ t('officers.select_community') }}</option>
            <option v-for="community in communities" :key="community.community_id" :value="String(community.community_id)">{{ community.name }}</option>
          </select>
          <div v-else class="readonly-value">{{ communityName }}</div>
          <span v-if="errors.communityId" class="error-message">{{ errors.communityId }}</span>
        </div>

        <div class="form-field">
          <label class="field-label">{{ t('map.zone_type') }} <span class="required">*</span></label>
          <select v-model="form.zoneType" class="field-select">
            <option v-for="option in zoneTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div class="form-field" :class="{ error: errors.name }">
          <label class="field-label">{{ t('map.zone_name') }} <span class="required">*</span></label>
          <input v-model="form.name" type="text" class="field-input" :placeholder="t('map.zone_placeholder')" maxlength="100" />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          <span class="field-hint">{{ form.name.length }}/100 {{ t('map.chars') }}</span>
        </div>

        <div class="form-field form-field--readonly">
          <label class="field-label">{{ t('map.location') }}</label>
          <div class="readonly-value location-value">
            <Icon name="lucide:map-pin" :size="14" />
            <span v-if="locationLabel">{{ locationLabel }}</span>
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

.field-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-critical);
}

.field-input,
.field-select {
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
.field-select:focus {
  border-color: var(--color-accent);
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
  align-self: flex-end;
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
