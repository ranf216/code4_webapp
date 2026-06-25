<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFileApi } from '~/composables/useFileApi'

interface AttachedFile {
  id: string
  file: File
  fileId: string | null
  status: 'pending' | 'uploading' | 'done' | 'error'
  errorMsg: string | null
  progress: number
}

interface Props {
  modelValue?: string[]
  accept?: string
  maxFiles?: number
  maxSizeMb?: number
  callApi?: boolean

  label?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accept: '.pdf,.jpg,.jpeg,.png,.mp4',
  maxFiles: 5,
  maxSizeMb: 20,
  callApi: false,
  label: '',
  hint: '',
})

const emit = defineEmits<{
  'update:modelValue': [fileIds: string[]]
  'upload-success': [fileIds: string[]]
  'upload-error': [errors: string[]]
}>()

const { uploadFile } = useFileApi()

const attachedFiles = ref<AttachedFile[]>([])
const isUploading = ref(false)

const canAddMore = computed(() => attachedFiles.value.length < props.maxFiles)

function fileIcon(file: File): string {
  if (file.type.startsWith('image/')) return 'lucide:image'
  if (file.type === 'application/pdf') return 'lucide:file-text'
  if (file.type.startsWith('video/')) return 'lucide:video'
  return 'lucide:file'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  for (const file of Array.from(input.files)) {
    if (attachedFiles.value.length >= props.maxFiles) break

    if (file.size > props.maxSizeMb * 1024 * 1024) {
      alert(`"${file.name}" exceeds the ${props.maxSizeMb} MB limit.`)
      continue
    }

    attachedFiles.value.push({
      id: crypto.randomUUID(),
      file,
      fileId: null,
      status: 'pending',
      errorMsg: null,
      progress: 0,
    })
  }

  input.value = ''
}

function removeFile(id: string) {
  attachedFiles.value = attachedFiles.value.filter((f) => f.id !== id)
  emitValue()
}

function emitValue() {
  const ids = attachedFiles.value
    .filter((f) => f.fileId !== null)
    .map((f) => f.fileId as string)
  emit('update:modelValue', ids)
}

/**
 * Upload all pending files.
 * Called externally (e.g. on form submit) or automatically if callApi=true.
 * Returns array of uploaded file_ids.
 */
async function uploadAll(): Promise<string[]> {
  if (!props.callApi) return []

  isUploading.value = true
  const errors: string[] = []

  for (const item of attachedFiles.value) {
    if (item.status === 'done') continue

    item.status = 'uploading'
    item.progress = 0

    const fileId = await uploadFile(
      item.file,
      undefined,
      (uploaded, total) => { item.progress = Math.round((uploaded / total) * 100) }
    )

    if (fileId) {
      item.fileId = fileId
      item.status = 'done'
      item.progress = 100
    } else {
      item.status = 'error'
      item.errorMsg = 'Upload failed'
      errors.push(item.file.name)
    }
  }

  isUploading.value = false
  emitValue()

  const successIds = attachedFiles.value
    .filter((f) => f.fileId !== null)
    .map((f) => f.fileId as string)

  if (errors.length) emit('upload-error', errors)
  else emit('upload-success', successIds)

  return successIds
}

/**
 * Returns the local File objects (for use when callApi=false).
 */
function getFiles(): File[] {
  return attachedFiles.value.map((f) => f.file)
}

defineExpose({ uploadAll, getFiles })
</script>

<template>
  <div class="file-upload">
    <label v-if="label" class="file-upload__label">{{ label }}</label>

    <!-- File list -->
    <div v-if="attachedFiles.length > 0" class="file-upload__list">
      <div
        v-for="item in attachedFiles"
        :key="item.id"
        class="file-item"
        :class="`file-item--${item.status}`"
      >
        <Icon :name="fileIcon(item.file)" :size="16" class="file-item__icon" />

        <div class="file-item__info">
          <span class="file-item__name">{{ item.file.name }}</span>
          <span class="file-item__meta">{{ formatSize(item.file.size) }}</span>
        </div>

        <!-- Progress bar while uploading -->
        <div v-if="item.status === 'uploading'" class="file-item__progress">
          <div class="file-item__progress-bar" :style="{ width: `${item.progress}%` }" />
        </div>

        <!-- Status icons -->
        <Icon v-if="item.status === 'done'" name="lucide:check-circle" :size="15" class="file-item__status file-item__status--done" />
        <Icon v-else-if="item.status === 'error'" name="lucide:alert-circle" :size="15" class="file-item__status file-item__status--error" :title="item.errorMsg ?? ''" />
        <Icon v-else-if="item.status === 'uploading'" name="lucide:loader-2" :size="15" class="file-item__status animate-spin" />

        <button
          v-if="item.status !== 'uploading'"
          class="file-item__remove"
          type="button"
          title="Remove"
          @click="removeFile(item.id)"
        >
          <Icon name="lucide:x" :size="13" />
        </button>
      </div>
    </div>

    <!-- Add button -->
    <label v-if="canAddMore && !isUploading" class="file-upload__add">
      <Icon name="lucide:upload" :size="14" />
      <span>{{ attachedFiles.length === 0 ? 'Add Files' : 'Add More' }}</span>
      <input
        type="file"
        :accept="accept"
        multiple
        class="file-upload__input"
        @change="onFileInputChange"
      />
    </label>

    <p v-if="hint" class="file-upload__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.file-upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.file-upload__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

/* ── File list ── */
.file-upload__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  position: relative;
  overflow: hidden;
}

.file-item--error {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}

.file-item--done {
  border-color: rgba(34, 197, 94, 0.3);
}

.file-item__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.file-item__info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}

.file-item__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
}

.file-item__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Progress bar */
.file-item__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-bg-overlay);
}

.file-item__progress-bar {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.2s ease;
}

/* Status icons */
.file-item__status { flex-shrink: 0; }
.file-item__status--done { color: #22c55e; }
.file-item__status--error { color: #ef4444; }

.file-item__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
}
.file-item__remove:hover { color: var(--color-critical); }

/* ── Add button ── */
.file-upload__add {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.file-upload__add:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.file-upload__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

/* ── Hint ── */
.file-upload__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Spinner ── */
.animate-spin {
  animation: spin 1s linear infinite;
  color: var(--color-accent);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
