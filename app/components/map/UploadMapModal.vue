<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  show: boolean
  communities?: { community_id: number; name: string }[]
  communityId?: string
  uploading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: { communityId: string; file: File }]
}>()

const { t } = useTranslation()

const communityId = ref(props.communityId ?? '')
const file = ref<File | null>(null)
const previewUrl = ref('')
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const errors = ref<Record<string, string>>({})

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

watch(() => props.show, (show: boolean) => {
  if (!show) return
  communityId.value = props.communityId ?? ''
  clearFile()
  errors.value = {}
})

watch(() => props.communityId, (id) => {
  if (props.show && id) communityId.value = id
})

function setFile(next: File | null) {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  file.value = null
  errors.value.file = ''
  if (!next) return
  if (!ACCEPTED_TYPES.includes(next.type)) {
    errors.value.file = t('map.invalid_image_type')
    return
  }
  file.value = next
  previewUrl.value = URL.createObjectURL(next)
}

function clearFile() {
  setFile(null)
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  setFile(input.files?.[0] ?? null)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  dragOver.value = false
  setFile(event.dataTransfer?.files?.[0] ?? null)
}

const canUpload = computed(() => !!communityId.value && !!file.value && !props.uploading)

function handleSave() {
  errors.value.communityId = !communityId.value ? t('validation.required') : ''
  if (!file.value) errors.value.file = errors.value.file || t('validation.required')
  if (errors.value.communityId || errors.value.file || !file.value) return
  emit('save', { communityId: communityId.value, file: file.value })
}
</script>

<template>
  <AppModal
    :show="show"
    :title="t('map.upload_map_title')"
    :cancel-text="t('common.cancel')"
    :ok-text="uploading ? t('map.uploading') : t('common.upload')"
    :ok-disabled="!canUpload"
    @close="emit('close')"
    @cancel="emit('close')"
    @ok="handleSave"
  >
    <template #default>
      <div class="modal-form">
        <div class="form-field" :class="{ error: errors.communityId }">
          <label class="field-label">{{ t('communities.community') }} <span class="required">*</span></label>
          <select v-model="communityId" class="field-select">
            <option value="" disabled>{{ t('officers.select_community') }}</option>
            <option v-for="community in communities" :key="community.community_id" :value="String(community.community_id)">{{ community.name }}</option>
          </select>
          <span v-if="errors.communityId" class="error-message">{{ errors.communityId }}</span>
        </div>

        <div class="form-field" :class="{ error: errors.file }">
          <label class="field-label">{{ t('map.map_image') }} <span class="required">*</span></label>
          <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/jpg" class="hidden-file-input" @change="handleFileChange">
          <div
            class="drop-zone"
            :class="{ 'drop-zone--active': dragOver, 'drop-zone--preview': !!previewUrl }"
            @click="fileInput?.click()"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
          >
            <img v-if="previewUrl" :src="previewUrl" class="drop-zone__preview" alt="Map preview">
            <template v-else>
              <Icon name="lucide:image-plus" :size="32" class="drop-zone__icon" />
              <span class="drop-zone__text">{{ t('map.drop_image_here') }}</span>
              <span class="drop-zone__hint">{{ t('map.supported_formats') }}</span>
            </template>
          </div>
          <div v-if="file" class="file-footer">
            <span class="file-name">{{ file.name }}</span>
            <button type="button" class="file-remove" @click="clearFile">
              <Icon name="lucide:x" :size="14" />
            </button>
          </div>
          <span v-if="errors.file" class="error-message">{{ errors.file }}</span>
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
  min-width: 420px;
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

.field-select {
  width: 100%;
  height: 40px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  box-sizing: border-box;
  cursor: pointer;
}

.field-select:focus {
  border-color: var(--color-accent);
}

.form-field.error .field-select {
  border-color: var(--color-critical);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.hidden-file-input {
  display: none;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 180px;
  padding: var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-base), background var(--transition-base);
  overflow: hidden;
}

.drop-zone:hover,
.drop-zone--active {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}

.drop-zone--preview {
  padding: var(--space-2);
  min-height: 0;
}

.drop-zone__icon {
  color: var(--color-text-muted);
}

.drop-zone__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.drop-zone__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.drop-zone__preview {
  width: 100%;
  max-height: 260px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.form-field.error .drop-zone {
  border-color: var(--color-critical);
}

.file-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.file-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  cursor: pointer;
}

.file-remove:hover {
  color: var(--color-critical);
}
</style>
