<script setup lang="ts">
import { settingsApi } from '~/api/settings'
import type { PostOrderSectionTypeItem } from '~/api/settings'

const { t } = useTranslation()

interface SectionType {
  id: string
  name: string
  clientVisible: boolean
  description: string
  active: boolean
}

const sectionTypes = ref<SectionType[]>([])
const loading = ref(false)
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
const formClientVisible = ref(false)
const formDescription = ref('')
const formActive = ref(true)

// Fetch data
async function fetchSectionTypes() {
  try {
    loading.value = true
    const response = await settingsApi.getPostOrderSectionTypes()
    if (response.rc === 0 && response.items) {
      sectionTypes.value = response.items.map((item: PostOrderSectionTypeItem) => ({
        id: item.type_id,
        name: item.name,
        clientVisible: item.client_visible,
        description: item.short_description,
        active: item.active,
      }))
    }
  } catch (err) {
    console.error('Error fetching section types:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSectionTypes()
})

const filteredSectionTypes = computed(() => {
  if (!searchQuery.value.trim()) return sectionTypes.value
  const q = searchQuery.value.toLowerCase()
  return sectionTypes.value.filter((item: SectionType) =>
    item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
  )
})

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  formName.value = ''
  formClientVisible.value = false
  formDescription.value = ''
  formActive.value = true
  showModal.value = true
}

function openEditModal(section: SectionType) {
  isEditing.value = true
  editingId.value = section.id
  formName.value = section.name
  formClientVisible.value = section.clientVisible
  formDescription.value = section.description
  formActive.value = section.active
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  if (!formName.value.trim() || !formDescription.value.trim()) return
  try {
    if (isEditing.value && editingId.value) {
      const response = await settingsApi.updatePostOrderSectionType(
        editingId.value,
        formName.value,
        formClientVisible.value,
        formDescription.value,
        formActive.value
      )
      if (response.rc === 0) {
        await fetchSectionTypes()
        closeModal()
      } else {
        alert(response.message || 'Failed to update section type')
      }
    } else {
      const response = await settingsApi.addPostOrderSectionType(
        formName.value,
        formClientVisible.value,
        formDescription.value,
        formActive.value
      )
      if (response.rc === 0) {
        await fetchSectionTypes()
        closeModal()
      } else {
        alert(response.message || 'Failed to add section type')
      }
    }
  } catch (err) {
    console.error('Error saving section type:', err)
    alert('Failed to save section type')
  }
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
    const response = await settingsApi.deletePostOrderSectionType(deletingId.value)
    if (response.rc === 0) {
      await fetchSectionTypes()
    } else {
      alert(response.message || 'Failed to delete section type')
    }
  } catch (err) {
    console.error('Error deleting section type:', err)
    alert('Failed to delete section type')
  } finally {
    closeDeleteModal()
  }
}

// Close delete modal
function closeDeleteModal() {
  showDeleteModal.value = false
  deletingId.value = null
}
</script>

<template>
  <div class="section-types-page">
    <!-- Header -->
    <div class="section-types-header">
      <div>
        <h2 class="section-types-title">{{ t('settings.post_order_sections.list_title') }}</h2>
        <p class="section-types-subtitle">{{ t('settings.types.total') }}: {{ filteredSectionTypes.length }} {{ t('settings.post_order_sections.sections_count') }}</p>
      </div>
      <div class="section-types-actions">
        <div class="search-wrapper">
          <Icon name="lucide:search" :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('settings.post_order_sections.search_placeholder')"
            class="search-input"
          />
        </div>
        <AppButton :text="t('settings.types.add_new')" icon="lucide:plus" type="primary" size="sm" @click="openAddModal" />
      </div>
    </div>

    <!-- Table -->
    <div class="section-types-table-container">
      <table class="section-types-table">
        <thead>
          <tr>
            <th class="col-name">{{ t('settings.post_order_sections.section_name') }}</th>
            <th class="col-visible">{{ t('settings.post_order_sections.client_visible') }}</th>
            <th class="col-description">{{ t('settings.post_order_sections.short_description') }}</th>
            <th class="col-status">{{ t('common.status') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in filteredSectionTypes" :key="section.id" class="section-type-row">
            <td class="col-name">
              <span class="type-name">{{ section.name }}</span>
            </td>
            <td class="col-visible">
              <span class="pill" :class="section.clientVisible ? 'pill--ok' : 'pill--ghost'">
                <Icon :name="section.clientVisible ? 'lucide:eye' : 'lucide:eye-off'" :size="12" />
                {{ section.clientVisible ? t('common.yes') : t('common.no') }}
              </span>
            </td>
            <td class="col-description">
              <span class="type-description">{{ section.description || '—' }}</span>
            </td>
            <td class="col-status">
              <span class="pill" :class="section.active ? 'pill--ok' : 'pill--ghost'">
                {{ section.active ? t('common.active') : t('common.inactive') }}
              </span>
            </td>
            <td class="col-actions">
              <div class="row-actions">
                <button class="btn-icon" :title="t('common.edit')" @click="openEditModal(section)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button class="btn-icon btn-icon--danger" :title="t('common.delete')" @click="handleDelete(section.id)">
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredSectionTypes.length === 0 && !loading">
            <td colspan="5" class="empty-state">
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
      :title="isEditing ? t('settings.post_order_sections.edit_title') : t('settings.post_order_sections.add_title')"
      max-width="560px"
      @close="closeModal"
    >
      <div class="modal-form">
        <!-- Section Name -->
        <div class="form-field">
          <label class="form-label">{{ t('settings.post_order_sections.section_name') }} *</label>
          <input
            v-model="formName"
            type="text"
            class="form-input"
            :placeholder="t('settings.post_order_sections.name_placeholder')"
          />
        </div>

        <!-- Short Description -->
        <div class="form-field">
          <label class="form-label">{{ t('settings.post_order_sections.short_description') }} *</label>
          <textarea
            v-model="formDescription"
            class="form-textarea"
            :placeholder="t('settings.post_order_sections.description_placeholder')"
            rows="3"
          />
        </div>

        <!-- Toggles Row -->
        <div class="form-toggles">
          <!-- Client Visible -->
          <div class="form-toggle">
            <div class="form-toggle-info">
              <label class="form-label">{{ t('settings.post_order_sections.client_visible') }}</label>
              <p class="form-hint">{{ t('settings.post_order_sections.client_visible_hint') }}</p>
            </div>
            <button
              class="toggle-btn"
              :class="{ 'toggle-btn--on': formClientVisible }"
              type="button"
              @click="formClientVisible = !formClientVisible"
            >
              <span class="toggle-knob" />
            </button>
          </div>

          <!-- Active -->
          <div class="form-toggle">
            <div class="form-toggle-info">
              <label class="form-label">{{ t('common.active') }}</label>
              <p class="form-hint">{{ t('settings.post_order_sections.active_hint') }}</p>
            </div>
            <button
              class="toggle-btn"
              :class="{ 'toggle-btn--on': formActive }"
              type="button"
              @click="formActive = !formActive"
            >
              <span class="toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton :text="t('common.cancel')" type="ghost" @click="closeModal" />
        <AppButton
          :text="isEditing ? t('common.save') : t('common.add')"
          type="primary"
          :disabled="!formName.trim() || !formDescription.trim()"
          @click="handleSubmit"
        />
      </template>
    </AppDialogModal>

    <!-- Delete Confirmation Modal -->
    <AppDialogModal
      :show="showDeleteModal"
      :title="t('settings.post_order_sections.delete_title')"
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
.section-types-page { width: 100%; }

.section-types-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.section-types-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}

.section-types-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.section-types-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.search-wrapper {
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

.search-input:focus { outline: none; border-color: var(--color-accent); }
.search-input::placeholder { color: var(--color-text-muted); }

.section-types-table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-types-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.section-types-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.02);
}

.section-types-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.section-type-row:hover { background: rgba(255, 255, 255, 0.02); }
.section-type-row:last-child td { border-bottom: none; }

.col-name { min-width: 180px; }
.col-visible { width: 110px; }
.col-description { width: auto; }
.col-status { width: 100px; }
.col-actions { width: 90px; text-align: right; }

.type-name {
  color: var(--color-text-primary);
  font-weight: 500;
}

.type-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
}

.row-actions { display: flex; gap: var(--space-1); justify-content: flex-end; }

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

.btn-icon:hover { background: rgba(255,255,255,0.05); color: var(--color-text-primary); }
.btn-icon--danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-text-muted);
}

.empty-state p { margin: var(--space-3) 0 0; font-size: var(--font-size-sm); }

/* Modal form content */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-field { display: flex; flex-direction: column; gap: var(--space-2); }

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: var(--space-1) 0 0;
}

.form-input,
.form-textarea {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  width: 100%;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus { outline: none; border-color: var(--color-accent); }

.form-textarea { resize: vertical; }

/* Toggles */
.form-toggles {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.form-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.form-toggle-info { flex: 1; }

.toggle-btn {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn--on {
  background: var(--color-accent, #e5ff44);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  display: block;
}

.toggle-btn--on .toggle-knob {
  transform: translateX(20px);
}

</style>
