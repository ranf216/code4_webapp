<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFileApi } from '~/composables/useFileApi'

interface Props {
  modelValue?: string
  initialUrl?: string
  label?: string
  required?: boolean
  callApiAfterAttach?: boolean
  previewSize?: number
  autoUpload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  initialUrl: '',
  label: 'Image',
  required: false,
  callApiAfterAttach: true,
  previewSize: 100,
  autoUpload: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'upload-success': [fileId: string]
  'upload-error': [error: Error]
  'file-selected': [file: File]
}>()

const { uploadFile } = useFileApi()

const previewUrl = ref('')
const isUploading = ref(false)
const fileId = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const hasImage = computed(() => !!previewUrl.value || !!props.modelValue || !!props.initialUrl)
const selectedFile = ref<File | null>(null)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file

  // Create preview URL
  previewUrl.value = URL.createObjectURL(file)

  // Emit file selected event for manual upload mode
  emit('file-selected', file)

  if (props.autoUpload) {
    performUpload(file)
  } else {
    // Just show preview, emit data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      fileId.value = dataUrl
      emit('update:modelValue', dataUrl)
    }
    reader.readAsDataURL(file)
  }
}

async function performUpload(file: File): Promise<string | null> {
  isUploading.value = true
  try {
    const id = await uploadFile(file)
    if (id) {
      fileId.value = id
      emit('update:modelValue', id)
      emit('upload-success', id)
      return id
    } else {
      previewUrl.value = ''
      selectedFile.value = null
      emit('upload-error', new Error('Upload failed'))
      return null
    }
  } catch (err) {
    previewUrl.value = ''
    selectedFile.value = null
    emit('upload-error', err as Error)
    return null
  } finally {
    isUploading.value = false
  }
}

// Expose upload method for manual mode
async function upload(): Promise<string | null> {
  if (selectedFile.value) {
    return performUpload(selectedFile.value)
  }
  return null
}

defineExpose({ upload })

function removeImage() {
  previewUrl.value = ''
  fileId.value = ''
  selectedFile.value = null
  emit('update:modelValue', '')
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

// Build image URL from file ID or use preview/data URL
const displayUrl = computed(() => {
  if (previewUrl.value) return previewUrl.value
  if (props.modelValue && props.modelValue.startsWith('data:')) {
    return props.modelValue
  }
  if (props.modelValue && props.modelValue.startsWith('http')) {
    return props.modelValue
  }
  if (props.initialUrl && props.initialUrl.startsWith('http')) {
    return props.initialUrl
  }
  // Assume it's a file ID, build URL
  if (props.modelValue) {
    return `${useRuntimeConfig().public.apiBase}/files/n/${props.modelValue}.png`
  }
  if (props.initialUrl) {
    return `${useRuntimeConfig().public.apiBase}/files/n/${props.initialUrl}.png`
  }
  return ''
})
</script>

<template>
  <div class="form-field">
    <label class="field-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <div class="image-upload">
      <div v-if="hasImage" class="image-preview-actions">
        <div class="image-preview" :style="{ width: `${previewSize}px`, height: `${previewSize}px` }">
          <img :src="displayUrl" alt="Preview" />
          <button class="image-remove" @click.prevent="removeImage">
            <Icon name="lucide:x" :size="14" />
          </button>
        </div>
        <button type="button" class="image-change" @click.prevent="triggerFileInput">
          <Icon name="lucide:upload" :size="14" />
          <span>Change image</span>
        </button>
        <input ref="fileInputRef" type="file" accept="image/*" class="hidden-file-input" @change="handleFileChange" />
      </div>
      <div v-else-if="isUploading" class="upload-placeholder uploading" :style="{ width: `${previewSize}px`, height: `${previewSize}px` }">
        <Icon name="lucide:loader-2" :size="24" class="animate-spin" />
        <span>Uploading...</span>
      </div>
      <label v-else class="upload-placeholder" :style="{ width: `${previewSize}px`, height: `${previewSize}px` }">
        <Icon name="lucide:upload" :size="24" />
        <span>{{ callApiAfterAttach ? 'Upload' : 'Select' }}</span>
        <input type="file" accept="image/*" @change="handleFileChange" />
      </label>
    </div>
  </div>
</template>

<style scoped>
.form-field {
  margin-bottom: var(--space-4);
}

.field-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.required {
  color: var(--color-critical);
  margin-left: var(--space-1);
}

.image-upload {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.image-preview-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.image-preview {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--color-border);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-bg-overlay);
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-base);
}

.image-remove:hover {
  background: var(--color-critical);
  color: white;
}

.image-change {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.image-change:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.upload-placeholder {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color var(--transition-base);
}

.upload-placeholder:hover {
  border-color: var(--color-accent);
}

.upload-placeholder.uploading {
  border-style: solid;
  cursor: default;
}

.upload-placeholder input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder span {
  font-size: var(--font-size-xs);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
