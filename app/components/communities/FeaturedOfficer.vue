<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = defineProps<{
  communityId: string
  communityName: string
}>()

const { t } = useTranslation()
const router = useRouter()

// Mock current banner data - in real app fetch from API
const hasBanner = ref(true)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)

const form = reactive({
  description: 'Officer John Martinez has been protecting our community for over 8 years. His dedication and commitment to safety make him a cornerstone of our security team.',
  imageUrl: '',
  imageFile: null as File | null,
  imagePreview: 'https://placehold.co/600x300/1e2a3a/6ee7b7?text=Featured+Officer',
})

const errors = reactive<Record<string, string>>({})

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errors.image = t('featured_officer.error_image_type')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.image = t('featured_officer.error_image_size')
    return
  }

  errors.image = ''
  form.imageFile = file
  form.imagePreview = URL.createObjectURL(file)
}

function removeImage() {
  form.imageFile = null
  form.imagePreview = ''
  form.imageUrl = ''
  if (fileInput.value) fileInput.value.value = ''
}

function validate(): boolean {
  errors.description = !form.description.trim() ? t('validation.required') : ''
  errors.image = !form.imagePreview ? t('validation.required') : ''
  return !errors.description && !errors.image
}

function handleCancel() {
  router.push(`/communities/edit/${props.communityId}`)
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 500))
  isSubmitting.value = false
  hasBanner.value = true
}

function openDeleteModal() {
  showDeleteModal.value = true
}

async function handleDelete() {
  isDeleting.value = true
  await new Promise(r => setTimeout(r, 400))
  isDeleting.value = false
  showDeleteModal.value = false

  // Reset to empty/default
  hasBanner.value = false
  form.description = ''
  form.imagePreview = ''
  form.imageFile = null
  form.imageUrl = ''
}
</script>

<template>
  <div class="featured-officer">
    <!-- Header -->
    <div class="form-header">
      <h2 class="form-title">{{ t('featured_officer.title') }}</h2>
      <div class="form-actions">
        <AppButton :text="t('common.cancel')" type="secondary" @click="handleCancel" />
        <AppButton
          v-if="hasBanner"
          :text="t('common.delete')"
          type="danger"
          icon="lucide:trash-2"
          :disabled="isDeleting"
          @click="openDeleteModal"
        />
        <AppButton
          :text="t('common.save')"
          type="primary"
          icon="lucide:save"
          :disabled="isSubmitting"
          @click="handleSubmit"
        />
      </div>
    </div>

    <!-- Description -->
    <p class="form-description">{{ t('featured_officer.description') }}</p>

    <!-- Form Body -->
    <div class="form-body">
      <!-- Left: Image Upload -->
      <div class="form-column">
        <div class="form-section">
          <h3 class="section-title">{{ t('featured_officer.image') }} <span class="required">*</span></h3>

          <div class="image-upload-area" :class="{ 'image-upload-area--error': errors.image, 'image-upload-area--has-image': form.imagePreview }">
            <!-- Preview -->
            <div v-if="form.imagePreview" class="image-preview">
              <img :src="form.imagePreview" alt="Banner preview" class="preview-img" />
              <button type="button" class="image-remove-btn" @click="removeImage">
                <Icon name="lucide:x" :size="16" />
              </button>
            </div>

            <!-- Upload placeholder -->
            <div v-else class="upload-placeholder" @click="triggerFileInput">
              <Icon name="lucide:image-plus" :size="40" class="upload-icon" />
              <p class="upload-text">{{ t('featured_officer.upload_hint') }}</p>
              <p class="upload-subtext">{{ t('featured_officer.upload_formats') }}</p>
            </div>
          </div>

          <button v-if="!form.imagePreview" type="button" class="upload-btn" @click="triggerFileInput">
            <Icon name="lucide:upload" :size="16" />
            <span>{{ t('featured_officer.choose_image') }}</span>
          </button>
          <button v-else type="button" class="upload-btn upload-btn--secondary" @click="triggerFileInput">
            <Icon name="lucide:refresh-cw" :size="16" />
            <span>{{ t('featured_officer.change_image') }}</span>
          </button>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden-input"
            @change="handleFileChange"
          />
          <span v-if="errors.image" class="error-message">{{ errors.image }}</span>
          <span class="field-hint">{{ t('featured_officer.image_hint') }}</span>
        </div>
      </div>

      <!-- Right: Description + Info -->
      <div class="form-column">
        <div class="form-section">
          <h3 class="section-title">{{ t('featured_officer.description_label') }} <span class="required">*</span></h3>

          <div class="form-field">
            <textarea
              v-model="form.description"
              class="field-textarea"
              :class="{ error: errors.description }"
              rows="6"
              :placeholder="t('featured_officer.description_placeholder')"
            />
            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
            <span class="field-hint">{{ t('featured_officer.description_hint') }}</span>
          </div>
        </div>

        <!-- Info Section -->
        <div class="form-section form-section--info">
          <div class="info-row">
            <span class="info-label">{{ t('featured_officer.community') }}:</span>
            <span class="info-value">{{ communityName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('featured_officer.banner_status') }}:</span>
            <Badge type="status" :value="hasBanner ? 'active' : 'inactive'" />
          </div>
          <div class="info-note">
            <Icon name="lucide:info" :size="14" class="info-note__icon" />
            <span>{{ t('featured_officer.default_note') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <AppModal
      :show="showDeleteModal"
      :title="t('featured_officer.delete_title')"
      :message="t('featured_officer.delete_message')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @ok="handleDelete"
    />
  </div>
</template>

<style scoped>
.featured-officer {
  width: 100%;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.form-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
}

.form-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6) 0;
}

.form-body {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: var(--space-6);
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .form-body {
    grid-template-columns: 1fr;
  }
}

.form-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.form-section--info {
  background: var(--color-bg-elevated);
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4) 0;
}

.required {
  color: var(--color-critical);
}

/* Image upload */
.image-upload-area {
  width: 100%;
  min-height: 200px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-3);
  transition: border-color var(--transition-base);
}

.image-upload-area--error {
  border-color: var(--color-critical);
}

.image-upload-area--has-image {
  border-style: solid;
}

.image-preview {
  position: relative;
  width: 100%;
}

.preview-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.image-remove-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: var(--radius-full);
  color: white;
  cursor: pointer;
  transition: background var(--transition-base);
}

.image-remove-btn:hover {
  background: rgba(0, 0, 0, 0.85);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--space-6);
  cursor: pointer;
  gap: var(--space-2);
}

.upload-icon {
  color: var(--color-text-muted);
}

.upload-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0;
}

.upload-subtext {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-bg-base);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity var(--transition-base);
  margin-bottom: var(--space-2);
}

.upload-btn:hover {
  opacity: 0.85;
}

.upload-btn--secondary {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.hidden-input {
  display: none;
}

/* Description */
.form-field {
  margin-bottom: 0;
}

.field-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-base);
  box-sizing: border-box;
}

.field-textarea:focus {
  border-color: var(--color-accent);
}

.field-textarea.error {
  border-color: var(--color-critical);
}

.error-message {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-critical);
  margin-top: var(--space-1);
}

.field-hint {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

/* Info section */
.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  min-width: 120px;
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
}

.info-note {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.info-note__icon {
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 1px;
}

.info-note span {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
