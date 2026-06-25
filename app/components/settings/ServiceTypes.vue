<script setup lang="ts">
import { settingsApi } from '~/api/settings'
import type { ServiceTypeItem, TaskTypeItem } from '~/api/settings'

const { t } = useTranslation()

// Type for UI (using type_id from API)
interface TypeItem {
  id: string
  name: string
}

// Data from APIs
const serviceTypes = ref<TypeItem[]>([])
const maintenanceTypes = ref<TypeItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Search queries
const serviceSearchQuery = ref('')
const maintenanceSearchQuery = ref('')

// Form states
const showServiceAddForm = ref(false)
const showMaintenanceAddForm = ref(false)
const newServiceTypeName = ref('')
const newMaintenanceTypeName = ref('')

// Editing states
const editingServiceType = ref<TypeItem | null>(null)
const editingMaintenanceType = ref<TypeItem | null>(null)

// Fetch data from APIs
async function fetchServiceTypes() {
  try {
    loading.value = true
    const response = await settingsApi.getServiceTypes()
    if (response.rc === 0 && response.items) {
      serviceTypes.value = response.items.map((item: ServiceTypeItem) => ({
        id: item.type_id,
        name: item.name,
      }))
    }
  } catch (err) {
    error.value = 'Failed to load service types'
    console.error('Error fetching service types:', err)
  } finally {
    loading.value = false
  }
}

async function fetchMaintenanceTypes() {
  try {
    loading.value = true
    const response = await settingsApi.getTaskTypes()
    if (response.rc === 0 && response.items) {
      maintenanceTypes.value = response.items.map((item: TaskTypeItem) => ({
        id: item.type_id,
        name: item.name,
      }))
    }
  } catch (err) {
    error.value = 'Failed to load maintenance types'
    console.error('Error fetching task types:', err)
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchServiceTypes()
  fetchMaintenanceTypes()
})

// Filtered lists
const filteredServiceTypes = computed(() => {
  if (!serviceSearchQuery.value.trim()) return serviceTypes.value
  return serviceTypes.value.filter((item: TypeItem) =>
    item.name.toLowerCase().includes(serviceSearchQuery.value.toLowerCase())
  )
})

const filteredMaintenanceTypes = computed(() => {
  if (!maintenanceSearchQuery.value.trim()) return maintenanceTypes.value
  return maintenanceTypes.value.filter((item: TypeItem) =>
    item.name.toLowerCase().includes(maintenanceSearchQuery.value.toLowerCase())
  )
})

// Service Type handlers
async function handleAddServiceType() {
  if (!newServiceTypeName.value.trim()) return
  try {
    const response = await settingsApi.addServiceType(newServiceTypeName.value.trim())
    if (response.rc === 0) {
      await fetchServiceTypes()
      newServiceTypeName.value = ''
      showServiceAddForm.value = false
    } else {
      alert(response.message || 'Failed to add service type')
    }
  } catch (err) {
    console.error('Error adding service type:', err)
    alert('Failed to add service type')
  }
}

function handleCancelServiceTypeAdd() {
  showServiceAddForm.value = false
  newServiceTypeName.value = ''
}

function handleEditServiceType(type: TypeItem) {
  editingServiceType.value = { ...type }
}

async function handleSaveServiceTypeEdit() {
  if (!editingServiceType.value) return
  try {
    const response = await settingsApi.updateServiceType(
      editingServiceType.value.id,
      editingServiceType.value.name.trim()
    )
    if (response.rc === 0) {
      await fetchServiceTypes()
      editingServiceType.value = null
    } else {
      alert(response.message || 'Failed to update service type')
    }
  } catch (err) {
    console.error('Error updating service type:', err)
    alert('Failed to update service type')
  }
}

function handleCancelServiceTypeEdit() {
  editingServiceType.value = null
}

async function handleDeleteServiceType(typeId: string) {
  if (!confirm(t('settings.types.delete_confirm'))) return
  try {
    const response = await settingsApi.deleteServiceType(typeId)
    if (response.rc === 0) {
      await fetchServiceTypes()
    } else {
      alert(response.message || 'Failed to delete service type')
    }
  } catch (err) {
    console.error('Error deleting service type:', err)
    alert('Failed to delete service type')
  }
}

// Maintenance Type handlers
async function handleAddMaintenanceType() {
  if (!newMaintenanceTypeName.value.trim()) return
  try {
    const response = await settingsApi.addTaskType(newMaintenanceTypeName.value.trim())
    if (response.rc === 0) {
      await fetchMaintenanceTypes()
      newMaintenanceTypeName.value = ''
      showMaintenanceAddForm.value = false
    } else {
      alert(response.message || 'Failed to add maintenance type')
    }
  } catch (err) {
    console.error('Error adding maintenance type:', err)
    alert('Failed to add maintenance type')
  }
}

function handleEditMaintenanceType(type: TypeItem) {
  editingMaintenanceType.value = { ...type }
}

async function handleSaveMaintenanceTypeEdit() {
  if (!editingMaintenanceType.value) return
  try {
    const response = await settingsApi.updateTaskType(
      editingMaintenanceType.value.id,
      editingMaintenanceType.value.name.trim()
    )
    if (response.rc === 0) {
      await fetchMaintenanceTypes()
      editingMaintenanceType.value = null
    } else {
      alert(response.message || 'Failed to update maintenance type')
    }
  } catch (err) {
    console.error('Error updating maintenance type:', err)
    alert('Failed to update maintenance type')
  }
}

function handleCancelMaintenanceTypeEdit() {
  editingMaintenanceType.value = null
}

async function handleDeleteMaintenanceType(typeId: string) {
  if (!confirm(t('settings.types.delete_confirm'))) return
  try {
    const response = await settingsApi.deleteTaskType(typeId)
    if (response.rc === 0) {
      await fetchMaintenanceTypes()
    } else {
      alert(response.message || 'Failed to delete maintenance type')
    }
  } catch (err) {
    console.error('Error deleting maintenance type:', err)
    alert('Failed to delete maintenance type')
  }
}

function handleCancelMaintenanceTypeAdd() {
  showMaintenanceAddForm.value = false
  newMaintenanceTypeName.value = ''
}
</script>

<template>
  <div class="service-types-page">
    <div class="service-types-columns">
      <!-- Service Types Column -->
      <div class="types-column">
        <div class="types-column__header">
          <div>
            <h2 class="types-column__title">{{ t('settings.service_types.list_title') }}</h2>
            <p class="types-column__subtitle">{{ filteredServiceTypes.length }} {{ t('settings.types.types_count') }}</p>
          </div>
        </div>

        <div class="types-column__actions">
          <div class="types-column__search">
            <Icon name="lucide:search" :size="16" class="types-column__search-icon" />
            <input v-model="serviceSearchQuery" type="text" :placeholder="t('settings.types.search_placeholder')" class="types-column__search-input" />
          </div>
          <AppButton :text="t('settings.types.add_new')" icon="lucide:plus" type="primary" size="sm" @click="showServiceAddForm = true" />
        </div>

        <div class="types-column__table-container">
          <table class="types-column__table">
            <thead><tr><th>{{ t('settings.types.type_name') }}</th><th class="col-actions">{{ t('common.actions') }}</th></tr></thead>
            <tbody>
              <tr v-for="type in filteredServiceTypes" :key="type.id" class="types-column__row">
                <template v-if="editingServiceType?.id !== type.id">
                  <td><span class="type-name">{{ type.name }}</span></td>
                  <td class="col-actions">
                    <div class="types-column__actions-cell">
                      <button class="btn-icon" @click="handleEditServiceType(type)"><Icon name="lucide:pencil" :size="14" /></button>
                      <button class="btn-icon btn-icon--danger" @click="handleDeleteServiceType(type.id)"><Icon name="lucide:trash-2" :size="14" /></button>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td><input v-model="editingServiceType.name" type="text" class="input input--sm" @keyup.enter="handleSaveServiceTypeEdit" @keyup.escape="handleCancelServiceTypeEdit" /></td>
                  <td class="col-actions">
                    <div class="types-column__actions-cell">
                      <button class="btn-icon btn-icon--success" :disabled="!editingServiceType.name.trim()" @click="handleSaveServiceTypeEdit"><Icon name="lucide:check" :size="14" /></button>
                      <button class="btn-icon" @click="handleCancelServiceTypeEdit"><Icon name="lucide:x" :size="14" /></button>
                    </div>
                  </td>
                </template>
              </tr>
              <tr v-if="filteredServiceTypes.length === 0"><td colspan="2" class="types-column__empty"><Icon name="lucide:inbox" :size="24" /><p>{{ t('settings.types.empty') }}</p></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style="width: var(--space-6);"></div>

      <!-- Maintenance Types Column -->
      <div class="types-column">
        <div class="types-column__header">
          <div>
            <h2 class="types-column__title">{{ t('settings.maintenance_types.list_title') }}</h2>
            <p class="types-column__subtitle">{{ filteredMaintenanceTypes.length }} {{ t('settings.types.types_count') }}</p>
          </div>
        </div>

        <div class="types-column__actions">
          <div class="types-column__search">
            <Icon name="lucide:search" :size="16" class="types-column__search-icon" />
            <input v-model="maintenanceSearchQuery" type="text" :placeholder="t('settings.types.search_placeholder')" class="types-column__search-input" />
          </div>
          <AppButton :text="t('settings.types.add_new')" icon="lucide:plus" type="primary" size="sm" @click="showMaintenanceAddForm = true" />
        </div>

        <div class="types-column__table-container">
          <table class="types-column__table">
            <thead><tr><th>{{ t('settings.types.type_name') }}</th><th class="col-actions">{{ t('common.actions') }}</th></tr></thead>
            <tbody>
              <tr v-for="type in filteredMaintenanceTypes" :key="type.id" class="types-column__row">
                <template v-if="editingMaintenanceType?.id !== type.id">
                  <td><span class="type-name">{{ type.name }}</span></td>
                  <td class="col-actions">
                    <div class="types-column__actions-cell">
                      <button class="btn-icon" @click="handleEditMaintenanceType(type)"><Icon name="lucide:pencil" :size="14" /></button>
                      <button class="btn-icon btn-icon--danger" @click="handleDeleteMaintenanceType(type.id)"><Icon name="lucide:trash-2" :size="14" /></button>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td><input v-model="editingMaintenanceType.name" type="text" class="input input--sm" @keyup.enter="handleSaveMaintenanceTypeEdit" @keyup.escape="handleCancelMaintenanceTypeEdit" /></td>
                  <td class="col-actions">
                    <div class="types-column__actions-cell">
                      <button class="btn-icon btn-icon--success" :disabled="!editingMaintenanceType.name.trim()" @click="handleSaveMaintenanceTypeEdit"><Icon name="lucide:check" :size="14" /></button>
                      <button class="btn-icon" @click="handleCancelMaintenanceTypeEdit"><Icon name="lucide:x" :size="14" /></button>
                    </div>
                  </td>
                </template>
              </tr>
              <tr v-if="filteredMaintenanceTypes.length === 0"><td colspan="2" class="types-column__empty"><Icon name="lucide:inbox" :size="24" /><p>{{ t('settings.types.empty') }}</p></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Service Type Modal -->
    <AppDialogModal
      :show="showServiceAddForm"
      :title="t('settings.types.add_service_title')"
      max-width="480px"
      @close="handleCancelServiceTypeAdd"
    >
      <div class="modal-form">
        <div class="modal-form__field">
          <label class="modal-form__label">{{ t('settings.types.type_name') }}</label>
          <input
            v-model="newServiceTypeName"
            type="text"
            class="modal-form__input"
            :placeholder="t('settings.types.add_placeholder')"
            @keyup.enter="handleAddServiceType"
          />
        </div>
      </div>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="ghost" @click="handleCancelServiceTypeAdd" />
        <AppButton :text="t('common.add')" type="primary" :disabled="!newServiceTypeName.trim()" @click="handleAddServiceType" />
      </template>
    </AppDialogModal>

    <!-- Add Maintenance Type Modal -->
    <AppDialogModal
      :show="showMaintenanceAddForm"
      :title="t('settings.types.add_maintenance_title')"
      max-width="480px"
      @close="handleCancelMaintenanceTypeAdd"
    >
      <div class="modal-form">
        <div class="modal-form__field">
          <label class="modal-form__label">{{ t('settings.types.type_name') }}</label>
          <input
            v-model="newMaintenanceTypeName"
            type="text"
            class="modal-form__input"
            :placeholder="t('settings.types.add_placeholder')"
            @keyup.enter="handleAddMaintenanceType"
          />
        </div>
      </div>
      <template #footer>
        <AppButton :text="t('common.cancel')" type="ghost" @click="handleCancelMaintenanceTypeAdd" />
        <AppButton :text="t('common.add')" type="primary" :disabled="!newMaintenanceTypeName.trim()" @click="handleAddMaintenanceType" />
      </template>
    </AppDialogModal>
  </div>
</template>

<style scoped>
.service-types-page { width: 100%; }
.service-types-columns {
  display: flex;
  flex-direction: row;
  gap: var(--space-6);
}
.types-column {
  flex: 1;  
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}
.types-column__header { display: flex; align-items: flex-start; justify-content: space-between; }
.types-column__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}
.types-column__subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; }
.types-column__actions { display: flex; align-items: center; gap: var(--space-2); }
.types-column__search { position: relative; display: flex; align-items: center; flex: 1; }
.types-column__search-icon { position: absolute; left: var(--space-2); color: var(--color-text-muted); pointer-events: none; }
.types-column__search-input {
  width: 100%;
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-7);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}
.types-column__search-input:focus { outline: none; border-color: var(--color-accent); }
.types-column__search-input::placeholder { color: var(--color-text-muted); }
.types-column__add-form {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.types-column__add-form .input { flex: 1; }
.types-column__add-actions { display: flex; gap: var(--space-1); }
.types-column__table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.types-column__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.types-column__table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.02);
}
.types-column__table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.types-column__row:hover { background: rgba(255, 255, 255, 0.02); }
.types-column__row:last-child td { border-bottom: none; }
.col-actions { width: 80px; text-align: right; }
.type-name { color: var(--color-text-primary); font-weight: 500; }
.types-column__actions-cell { display: flex; gap: var(--space-1); justify-content: flex-end; }
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-icon:hover { background: var(--color-surface); color: var(--color-text-primary); }
.btn-icon--danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.btn-icon--success:hover { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
.types-column__empty { text-align: center; padding: var(--space-8); color: var(--color-text-muted); }
.types-column__empty p { margin: var(--space-2) 0 0; font-size: var(--font-size-sm); }

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.modal-form__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.modal-form__input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  width: 100%;
  transition: border-color 0.2s ease;
}

.modal-form__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.modal-form__input::placeholder {
  color: var(--color-text-muted);
}
</style>
