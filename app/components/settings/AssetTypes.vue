<script setup lang="ts">
import { settingsApi } from '~/api/settings'
import type { AssetTypeItem } from '~/api/settings'
import { useFileApi } from '~/composables/useFileApi'

const { t } = useTranslation()
const { uploadFile, isLoading: isUploading } = useFileApi()

// Type for UI
interface AssetType {
  id: string
  name: string
  icon: string | null  // URL from API (null if not set)
  color: string | null  // null if not set
}

// Data from API
const assetTypes = ref<AssetType[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Search query
const searchQuery = ref('')

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

// Delete confirmation modal state
const showDeleteModal = ref(false)
const deletingId = ref<string | null>(null)

// Form fields
const formName = ref('')
const formIcon = ref('')  // file_id when uploading, URL from API when editing
const formColor = ref('#22c55e')
const iconPreviewUrl = ref('')  // URL for preview (blob URL for new upload, API URL for edit)

// Form errors
const formErrors = ref<{ icon?: string; color?: string; name?: string }>({})

// Hex color validation
function isValidHex(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())
}

// Native color picker ref
const colorPickerRef = ref<HTMLInputElement | null>(null)

function openColorPicker() {
  colorPickerRef.value?.click()
}

function onNativeColorPick(e: Event) {
  const input = e.target as HTMLInputElement
  formColor.value = input.value.toUpperCase()
  formErrors.value.color = undefined
}

function onColorInput() {
  if (formColor.value && !isValidHex(formColor.value)) {
    formErrors.value.color = 'Please enter a valid hex color (e.g. #FF5733)'
  } else {
    formErrors.value.color = undefined
  }
}

const DEFAULT_COLOR = '#22c55e'

// Fetch data from API
async function fetchAssetTypes() {
  try {
    loading.value = true
    const response = await settingsApi.getAssetTypes()
    if (response.rc === 0 && response.items) {
      assetTypes.value = response.items.map((item: AssetTypeItem) => ({
        id: item.type_id,
        name: item.name,
        icon: item.icon ?? null,
        color: item.color ?? null,
      }))
    }
  } catch (err) {
    error.value = 'Failed to load asset types'
    console.error('Error fetching asset types:', err)
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchAssetTypes()
})

// Filtered list
const filteredAssetTypes = computed(() => {
  if (!searchQuery.value.trim()) return assetTypes.value
  return assetTypes.value.filter((item: AssetType) =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Open modal for add
function openAddModal() {
  isEditing.value = false
  editingId.value = null
  formName.value = ''
  formIcon.value = ''
  iconPreviewUrl.value = ''
  formColor.value = DEFAULT_COLOR
  formErrors.value = {}
  showModal.value = true
}

// Open modal for edit
function openEditModal(type: AssetType) {
  isEditing.value = true
  editingId.value = type.id
  formName.value = type.name
  formIcon.value = type.icon ?? ''  // URL from server (or empty if null)
  iconPreviewUrl.value = type.icon ?? ''  // Use URL for preview
  formColor.value = type.color ?? DEFAULT_COLOR
  formErrors.value = {}
  showModal.value = true
}

// Extract file_id from URL (e.g., https://.../files/n/{file_id}.png)
function extractFileIdFromUrl(url: string): string {
  if (!url) return ''
  // If already a file_id (no http), return as is
  if (!url.startsWith('http')) return url
  // Extract filename without extension from URL path
  const match = url.match(/\/files\/n\/([a-f0-9]+)\.png$/)
  return match?.[1] ?? url
}

// Handle form submit
async function handleSubmit() {
  formErrors.value = {}

  if (!formName.value.trim()) {
    formErrors.value.name = 'Name is required.'
    return
  }
  if (!isValidHex(formColor.value)) {
    formErrors.value.color = 'Please enter a valid hex color (e.g. #FF5733)'
    return
  }

  // Upload file first if there's a pending file
  let fileId: string | null = null
  if (pendingFile.value && imageUploadRef.value) {
    fileId = await imageUploadRef.value.upload()
    if (!fileId) {
      formErrors.value.icon = 'Failed to upload icon. Please try again.'
      return
    }
  } else if (formIcon.value) {
    // Get file_id (extract from URL if needed)
    fileId = extractFileIdFromUrl(formIcon.value)
  }

  if (!fileId) {
    formErrors.value.icon = 'An icon is required.'
    return
  }

  try {
    if (isEditing.value && editingId.value) {
      // Update existing
      const response = await settingsApi.updateAssetType(
        editingId.value,
        formName.value.trim(),
        fileId,  // file_id (extracted from URL if needed)
        formColor.value
      )
      if (response.rc === 0) {
        pendingFile.value = null
        await fetchAssetTypes()
        closeModal()
      } else {
        alert(response.message || 'Failed to update asset type')
      }
    } else {
      // Add new
      const response = await settingsApi.addAssetType(
        formName.value.trim(),
        fileId!,
        formColor.value
      )
      if (response.rc === 0) {
        pendingFile.value = null
        await fetchAssetTypes()
        closeModal()
      } else {
        alert(response.message || 'Failed to add asset type')
      }
    }
  } catch (err) {
    console.error('Error saving asset type:', err)
    alert(isEditing.value ? 'Failed to update asset type' : 'Failed to add asset type')
  }
}

// Close modal
function closeModal() {
  showModal.value = false
  formName.value = ''
  formIcon.value = ''
  iconPreviewUrl.value = ''
  formColor.value = DEFAULT_COLOR
  formErrors.value = {}
}

// Handle delete - open confirm modal
function handleDelete(typeId: string) {
  deletingId.value = typeId
  showDeleteModal.value = true
}

// Confirm delete
async function confirmDelete() {
  if (!deletingId.value) return

  try {
    const response = await settingsApi.deleteAssetType(deletingId.value)
    if (response.rc === 0) {
      await fetchAssetTypes()
    } else {
      alert(response.message || 'Failed to delete asset type')
    }
  } catch (err) {
    console.error('Error deleting asset type:', err)
    alert('Failed to delete asset type')
  } finally {
    closeDeleteModal()
  }
}

// Close delete modal
function closeDeleteModal() {
  showDeleteModal.value = false
  deletingId.value = null
}

// Ref for ImageUpload component
const imageUploadRef = ref<{ upload: () => Promise<string | null> } | null>(null)
const pendingFile = ref<File | null>(null)

// Handle file selected (manual upload mode)
function handleFileSelected(file: File) {
  pendingFile.value = file
}

// Handle icon file upload
async function handleIconUpload(event: Event) {
  // This function is no longer used - ImageUpload handles its own events
}
</script>

<template>
  <div class="asset-types-page">
    <!-- Header -->
    <div class="asset-types-header">
      <div>
        <h2 class="asset-types-title">{{ t('settings.asset_types.list_title') }}</h2>
        <p class="asset-types-subtitle">{{ t('settings.types.total') }}: {{ filteredAssetTypes.length }} {{ t('settings.asset_types.assets_count') }}</p>
      </div>
      <div class="asset-types-actions">
        <div class="asset-types-search">
          <Icon name="lucide:search" :size="16" class="search-icon" />
          <input v-model="searchQuery" type="text" :placeholder="t('settings.types.search_placeholder')" class="search-input" />
        </div>
        <AppButton :text="t('settings.types.add_new')" icon="lucide:plus" type="primary" size="sm" @click="openAddModal" />
      </div>
    </div>

    <!-- Table -->
    <div class="asset-types-table-container">
      <table class="asset-types-table">
        <thead>
          <tr>
            <th class="col-icon">{{ t('settings.asset_types.icon') }}</th>
            <th class="col-name">{{ t('settings.types.type_name') }}</th>
            <th class="col-colour">{{ t('settings.asset_types.colour') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="type in filteredAssetTypes" :key="type.id" class="asset-type-row">
            <td class="col-icon">
              <img v-if="type.icon && type.icon !== 'null'" :src="type.icon" class="type-icon" alt="" />
              <div v-else class="type-icon-placeholder">
                <Icon name="lucide:image" :size="40" />
              </div>
            </td>
            <td class="col-name">
              <span class="type-name">{{ type.name }}</span>
            </td>
            <td class="col-colour">
              <div v-if="type.color" class="colour-preview" :style="{ backgroundColor: type.color }">
                <span class="colour-value">{{ type.color }}</span>
              </div>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="col-actions">
              <div class="row-actions">
                <button class="btn-icon" :title="t('common.edit')" @click="openEditModal(type)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button class="btn-icon btn-icon--danger" :title="t('common.delete')" @click="handleDelete(type.id)">
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredAssetTypes.length === 0">
            <td colspan="4" class="empty-state">
              <Icon name="lucide:inbox" :size="32" />
              <p>{{ t('settings.types.empty') }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <AppDialogModal
      :show="showModal"
      :title="isEditing ? t('settings.asset_types.edit_title') : t('settings.asset_types.add_title')"
      max-width="520px"
      @close="closeModal"
    >
      <div class="modal-form">
        <!-- Name -->
        <div class="form-field">
          <label class="form-label">{{ t('settings.types.type_name') }} *</label>
          <input v-model="formName" type="text" class="form-input" :placeholder="t('settings.types.add_placeholder')" />
        </div>

        <!-- Icon Upload -->
        <ImageUpload
          ref="imageUploadRef"
          v-model="formIcon"
          :label="t('settings.asset_types.icon')"
          :required="true"
          :auto-upload="false"
          :call-api-after-attach="true"
          file-access-level="protected"
          :preview-size="80"
          @file-selected="handleFileSelected"
          @upload-success="iconPreviewUrl = $event"
          @upload-error="iconPreviewUrl = ''"
        />
        <p v-if="formErrors.icon" class="field-error">{{ formErrors.icon }}</p>

        <!-- Colour -->
        <div class="form-field">
          <label class="form-label">{{ t('settings.asset_types.colour') }} *</label>
          <div class="colour-input-row">
            <div
              class="colour-picker-btn"
              :style="{ backgroundColor: isValidHex(formColor) ? formColor : '#888' }"
              :title="'Pick a color'"
              @click="openColorPicker"
            >
              <Icon name="lucide:pipette" :size="15" color="white" />
              <input
                ref="colorPickerRef"
                type="color"
                class="native-color-input"
                :value="isValidHex(formColor) ? formColor : DEFAULT_COLOR"
                tabindex="-1"
                @input="onNativeColorPick"
              />
            </div>
            <input
              v-model="formColor"
              type="text"
              class="form-input colour-input"
              placeholder="#22c55e"
              @input="onColorInput"
            />
          </div>
          <p v-if="formErrors.color" class="field-error">{{ formErrors.color }}</p>
        </div>
      </div>

      <template #footer>
        <AppButton :text="t('common.cancel')" type="ghost" @click="closeModal" />
        <AppButton
          :text="isEditing ? t('common.save') : t('common.add')"
          type="primary"
          :disabled="!formName.trim() || !formIcon || !isValidHex(formColor) || isUploading"
          @click="handleSubmit"
        />
      </template>
    </AppDialogModal>

    <!-- Delete Confirmation Modal -->
    <AppDialogModal
      :show="showDeleteModal"
      :title="t('settings.types.delete_asset_type_title')"
      max-width="400px"
      @close="closeDeleteModal"
    >
      <p>{{ t('settings.types.delete_confirm') }}</p>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="ghost" @click="closeDeleteModal" />
        <AppButton :text="t('common.delete')" type="danger" @click="confirmDelete" />
      </template>
    </AppDialogModal>
  </div>
</template>

<style scoped>
.asset-types-page {
  width: 100%;
}

.asset-types-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.asset-types-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}

.asset-types-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.asset-types-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.asset-types-search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 240px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.asset-types-table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.asset-types-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.asset-types-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.02);
}

.asset-types-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.asset-type-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.asset-type-row:last-child td {
  border-bottom: none;
}

.col-icon { width: 120px; }
.col-name { width: auto; }
.col-colour { width: 150px; }
.col-actions { width: 100px; text-align: right; }

.type-icon {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.type-icon-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}

.type-name {
  color: var(--color-text-primary);
  font-weight: 500;
}

.colour-preview {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.colour-value {
  font-size: var(--font-size-xs);
  color: white;
  font-family: monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.row-actions {
  display: flex;
  gap: var(--space-1);
  justify-content: flex-end;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.btn-icon--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-text-muted);
}

.empty-state p {
  margin: var(--space-3) 0 0;
  font-size: var(--font-size-sm);
}

/* Modal form content */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Form Fields */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.form-input.colour-input {
  font-family: monospace;
  text-transform: lowercase;
}

/* Icon Upload */
.icon-upload {
  display: flex;
  gap: var(--space-3);
}

.icon-preview {
  position: relative;
  width: 80px;
  height: 80px;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.icon-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
}

.icon-upload-btn {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  background: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-upload-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.icon-upload-btn span {
  font-size: var(--font-size-xs);
}

.hidden {
  display: none;
}

/* Colour Picker */
.colour-picker-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.colour-picker-btn:hover {
  transform: scale(1.06);
  border-color: rgba(255, 255, 255, 0.6);
}

.native-color-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding: 0;
  border: none;
}

.colour-input-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}


.field-error {
  font-size: var(--font-size-xs);
  color: #ef4444;
  margin: 0;
}

@media (max-width: 768px) {
  .asset-types-header {
    flex-direction: column;
    align-items: stretch;
  }

  .asset-types-actions {
    width: 100%;
  }

  .search-input {
    width: 100%;
    min-width: unset;
  }
}
</style>
