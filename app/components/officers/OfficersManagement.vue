<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import ImageUpload from '~/components/ImageUpload.vue'

const props = defineProps<{
  communityId?: string
  communityName?: string
}>()

const { t } = useTranslation()

// Types
interface OfficerEvaluation {
  text: string
  date: string
  evaluatorName: string
}

interface Officer {
  id: string
  fullName: string
  community: string
  mobile: string
  email: string
  address: string
  title: string
  picture: string
  description: string
  registrationDate: string
  roles: string[]
  certifications: string[]
  evaluations: OfficerEvaluation[]
  active: boolean
}

// Constants
const COMMUNITIES = ['Sunset Heights', 'Green Valley', 'Riverside', 'Central Park', 'Northgate']
const ROLES = ['Patrol', 'Supervisor', 'K9 Handler', 'Traffic Control', 'Dispatcher', 'CCTV Operator']
const CERTIFICATIONS = ['First Aid', 'Firearms', 'Defensive Driving', 'Crisis Management', 'CPR']

// Mock data
const officers = ref<Officer[]>([
  { id: 'OFF-001', fullName: 'James Carter', community: 'Sunset Heights', mobile: '+1 555-0101', email: 'j.carter@axis.com', address: '12 Oak St, Springfield', title: 'Senior Officer', picture: '', description: 'Experienced patrol officer with 8 years on the field.', registrationDate: '2022-03-15', roles: ['Patrol', 'Supervisor'], certifications: ['First Aid', 'Firearms'], evaluations: [{ text: 'Excellent performance in Q1', date: '2024-01-10', evaluatorName: 'Admin' }], active: true },
  { id: 'OFF-002', fullName: 'Maria Santos', community: 'Green Valley', mobile: '+1 555-0102', email: 'm.santos@axis.com', address: '44 Maple Ave, Springfield', title: 'Officer', picture: '', description: '', registrationDate: '2023-06-01', roles: ['CCTV Operator'], certifications: ['CPR'], evaluations: [], active: true },
  { id: 'OFF-003', fullName: 'Kevin Brown', community: 'Riverside', mobile: '+1 555-0103', email: 'k.brown@axis.com', address: '8 River Rd, Springfield', title: 'K9 Officer', picture: '', description: 'Specialised in K9 handling and narcotics detection.', registrationDate: '2021-11-20', roles: ['K9 Handler', 'Patrol'], certifications: ['K9 Certification', 'Firearms'], evaluations: [], active: true },
  { id: 'OFF-004', fullName: 'Rachel Lee', community: 'Central Park', mobile: '+1 555-0104', email: 'r.lee@axis.com', address: '77 Central Blvd, Springfield', title: 'Dispatcher', picture: '', description: '', registrationDate: '2023-01-05', roles: ['Dispatcher'], certifications: ['Crisis Management'], evaluations: [], active: false },
  { id: 'OFF-005', fullName: 'Tom Wilson', community: 'Northgate', mobile: '+1 555-0105', email: 't.wilson@axis.com', address: '3 North Gate Way', title: 'Officer', picture: '', description: '', registrationDate: '2024-02-10', roles: ['Traffic Control'], certifications: ['Defensive Driving'], evaluations: [], active: true },
])

// Filters
const searchQuery = ref('')
const filterCommunity = ref('all')
const filterActive = ref<'all' | 'active' | 'inactive'>('active')

const filteredOfficers = computed((): Officer[] => {
  let list = officers.value
  // Always filter by communityId prop if provided (community-specific view)
  if (props.communityName) list = list.filter((o: Officer) => o.community === props.communityName)
  if (filterActive.value === 'active') list = list.filter((o: Officer) => o.active)
  if (filterActive.value === 'inactive') list = list.filter((o: Officer) => !o.active)
  if (!props.communityName && filterCommunity.value !== 'all') list = list.filter((o: Officer) => o.community === filterCommunity.value)
  const q = searchQuery.value.toLowerCase()
  if (q) list = list.filter((o: Officer) =>
    o.fullName.toLowerCase().includes(q) ||
    o.mobile.includes(q) ||
    o.email.toLowerCase().includes(q) ||
    o.address.toLowerCase().includes(q) ||
    o.title.toLowerCase().includes(q) ||
    o.community.toLowerCase().includes(q)
  )
  return [...list].sort((a: Officer, b: Officer) => a.fullName.localeCompare(b.fullName))
})

// Add/Edit modal
const showFormModal = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleteTarget = ref<Officer | null>(null)

// Detail view modal
const showDetailModal = ref(false)
const detailOfficer = ref<Officer | null>(null)

// Add evaluation
const showEvalModal = ref(false)
const evalForm = reactive({ text: '', date: '', evaluatorName: '' })
const evalError = ref('')

const blankForm = (): Omit<Officer, 'id' | 'registrationDate' | 'evaluations'> => ({
  fullName: '', community: '', mobile: '', email: '', address: '',
  title: '', picture: '', description: '', roles: [], certifications: [], active: true,
})

const form = reactive<ReturnType<typeof blankForm> & { roles: string[]; certifications: string[] }>(blankForm())
const formErrors = reactive<Record<string, string>>({})

function openAdd() {
  formMode.value = 'add'
  editingId.value = null
  Object.assign(form, blankForm())
  formErrors.fullName = ''
  formErrors.community = ''
  formErrors.mobile = ''
  formErrors.title = ''
  showFormModal.value = true
}

function openEdit(officer: Officer) {
  formMode.value = 'edit'
  editingId.value = officer.id
  Object.assign(form, {
    fullName: officer.fullName, community: officer.community, mobile: officer.mobile,
    email: officer.email, address: officer.address, title: officer.title,
    picture: officer.picture, description: officer.description,
    roles: [...officer.roles], certifications: [...officer.certifications], active: officer.active,
  })
  formErrors.fullName = ''
  formErrors.community = ''
  formErrors.mobile = ''
  formErrors.title = ''
  showFormModal.value = true
}

function validateForm(): boolean {
  formErrors.fullName = !form.fullName.trim() ? t('validation.required') : ''
  formErrors.community = !form.community ? t('validation.required') : ''
  formErrors.mobile = !form.mobile.trim() ? t('validation.required') : ''
  formErrors.title = !form.title.trim() ? t('validation.required') : ''
  return !formErrors.fullName && !formErrors.community && !formErrors.mobile && !formErrors.title
}

function handleSave() {
  if (!validateForm()) return
  if (formMode.value === 'add') {
    const newOfficer: Officer = {
      id: `OFF-${String(officers.value.length + 1).padStart(3, '0')}`,
      fullName: form.fullName, community: form.community, mobile: form.mobile,
      email: form.email, address: form.address, title: form.title,
      picture: form.picture, description: form.description,
      roles: [...form.roles], certifications: [...form.certifications],
      evaluations: [], registrationDate: new Date().toISOString().split('T')[0]!, active: true,
    }
    officers.value.push(newOfficer)
  } else {
    const idx = officers.value.findIndex((o: Officer) => o.id === editingId.value)
    const orig = officers.value[idx]
    if (idx > -1 && orig) {
      const updated: Officer = {
        ...orig,
        fullName: form.fullName, community: form.community, mobile: form.mobile,
        email: form.email, address: form.address, title: form.title,
        picture: form.picture, description: form.description,
        roles: [...form.roles], certifications: [...form.certifications], active: form.active,
      }
      officers.value.splice(idx, 1, updated)
    }
  }
  showFormModal.value = false
}

function confirmDelete(officer: Officer) {
  deleteTarget.value = officer
  showDeleteModal.value = true
}

function handleDelete() {
  if (!deleteTarget.value) return
  const idx = officers.value.findIndex((o: Officer) => o.id === deleteTarget.value!.id)
  if (idx > -1) officers.value.splice(idx, 1)
  showDeleteModal.value = false
  deleteTarget.value = null
}

function openDetail(officer: Officer) {
  detailOfficer.value = officer
  showDetailModal.value = true
}

function toggleRole(role: string) {
  const idx = form.roles.indexOf(role)
  if (idx > -1) form.roles.splice(idx, 1)
  else form.roles.push(role)
}

function toggleCert(cert: string) {
  const idx = form.certifications.indexOf(cert)
  if (idx > -1) form.certifications.splice(idx, 1)
  else form.certifications.push(cert)
}

function handlePhotoChange(event: Event) {
  // This function is no longer used - ImageUpload handles its own events
}

function openAddEval(officer: Officer) {
  detailOfficer.value = officer
  evalForm.text = ''
  evalForm.date = new Date().toISOString().split('T')[0]!
  evalForm.evaluatorName = ''
  evalError.value = ''
  showEvalModal.value = true
}

function handleSaveEval() {
  if (!evalForm.text.trim()) { evalError.value = t('validation.required'); return }
  if (!detailOfficer.value) return
  const idx = officers.value.findIndex((o: Officer) => o.id === detailOfficer.value!.id)
  const target = officers.value[idx]
  if (idx > -1 && target) {
    target.evaluations.push({ text: evalForm.text.trim(), date: evalForm.date, evaluatorName: evalForm.evaluatorName })
    detailOfficer.value = target
  }
  showEvalModal.value = false
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <div class="officers-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="total-count">{{ t('officers.total', { count: String(filteredOfficers.length) }) }}</span>
      </div>
      <div class="header-actions">
        <AppButton :text="t('officers.add_officer')" type="primary" icon="lucide:plus" @click="openAdd" />
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <Icon name="lucide:search" :size="14" />
        <input v-model="searchQuery" type="text" :placeholder="t('officers.search_placeholder')" />
      </div>

      <select v-if="!props.communityName" v-model="filterCommunity" class="filter-select">
        <option value="all">{{ t('officers.all_communities') }}</option>
        <option v-for="c in COMMUNITIES" :key="c" :value="c">{{ c }}</option>
      </select>

      <div class="filter-toggle">
        <button :class="['ftoggle-btn', { active: filterActive === 'active' }]" @click="filterActive = 'active'">{{ t('common.active') }}</button>
        <button :class="['ftoggle-btn', { active: filterActive === 'inactive' }]" @click="filterActive = 'inactive'">{{ t('common.inactive') }}</button>
        <button :class="['ftoggle-btn', { active: filterActive === 'all' }]" @click="filterActive = 'all'">{{ t('officers.all') }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('officers.full_name') }}</th>
            <th v-if="!props.communityName">{{ t('officers.community') }}</th>
            <th>{{ t('officers.mobile') }}</th>
            <th>{{ t('officers.title') }}</th>
            <th>{{ t('officers.roles') }}</th>
            <th>{{ t('officers.certifications') }}</th>
            <th>{{ t('officers.reg_date') }}</th>
            <th>{{ t('officers.active') }}</th>
            <th>{{ t('officers.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="officer in filteredOfficers" :key="officer.id">
            <td>
              <div class="officer-name-cell">
                <div v-if="officer.picture" class="avatar">
                  <img :src="officer.picture" :alt="officer.fullName" />
                </div>
                <div v-else class="avatar avatar--initials">{{ getInitials(officer.fullName) }}</div>
                <div>
                  <div class="name-primary">{{ officer.fullName }}</div>
                  <div class="name-secondary">{{ officer.email || '—' }}</div>
                </div>
              </div>
            </td>
            <td v-if="!props.communityName">{{ officer.community }}</td>
            <td class="mono-cell">{{ officer.mobile }}</td>
            <td>{{ officer.title }}</td>
            <td>
              <div class="tags-cell">
                <span v-for="role in officer.roles" :key="role" class="tag tag--role">{{ role }}</span>
                <span v-if="!officer.roles.length" class="muted">—</span>
              </div>
            </td>
            <td>
              <div class="tags-cell">
                <span v-for="cert in officer.certifications" :key="cert" class="tag tag--cert">{{ cert }}</span>
                <span v-if="!officer.certifications.length" class="muted">—</span>
              </div>
            </td>
            <td class="muted">{{ officer.registrationDate }}</td>
            <td>
              <Badge type="status" :value="officer.active ? 'active' : 'inactive'" />
            </td>
            <td>
              <div class="action-group">
                <button class="action-btn" :title="t('common.view')" @click="openDetail(officer)">
                  <Icon name="lucide:eye" :size="14" />
                </button>
                <button class="action-btn" :title="t('common.edit')" @click="openEdit(officer)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button class="action-btn action-btn--danger" :title="t('common.delete')" @click="confirmDelete(officer)">
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredOfficers.length">
            <td colspan="9" class="empty-row">{{ t('officers.no_officers') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <AppModal
      :show="showFormModal"
      :title="formMode === 'add' ? t('officers.add_title') : t('officers.edit_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.save')"
      max-width="50vw"
      @close="showFormModal = false"
      @cancel="showFormModal = false"
      @ok="handleSave"
    >
      <template #default>
        <div class="officer-form">
          <!-- Row 1: Photo + Name/Community Block -->
          <div class="form-row-photo-name">
            <!-- Photo on left -->
            <div class="photo-col">
              <ImageUpload
                v-model="form.picture"
                :label="t('officers.photo')"
                :auto-upload="false"
                :preview-size="100"
              />
            </div>
            <!-- Name and Community stacked vertically on right -->
            <div class="name-community-col">
              <div class="form-field" :class="{ error: formErrors.fullName }">
                <label class="field-label">{{ t('officers.full_name') }} <span class="required">*</span></label>
                <input v-model="form.fullName" type="text" class="field-input" :placeholder="t('officers.full_name_placeholder')" />
                <span v-if="formErrors.fullName" class="error-msg">{{ formErrors.fullName }}</span>
              </div>
              <div class="form-field" :class="{ error: formErrors.community }">
                <label class="field-label">{{ t('officers.community') }} <span class="required">*</span></label>
                <select v-model="form.community" class="field-select">
                  <option value="" disabled>{{ t('officers.select_community') }}</option>
                  <option v-for="c in COMMUNITIES" :key="c" :value="c">{{ c }}</option>
                </select>
                <span v-if="formErrors.community" class="error-msg">{{ formErrors.community }}</span>
              </div>
            </div>
          </div>

          <!-- Row 2: Mobile + Title -->
          <div class="form-row-2col">
            <div class="form-field" :class="{ error: formErrors.mobile }">
              <label class="field-label">{{ t('officers.mobile') }} <span class="required">*</span></label>
              <input v-model="form.mobile" type="tel" class="field-input" :placeholder="t('officers.mobile_placeholder')" />
              <span v-if="formErrors.mobile" class="error-msg">{{ formErrors.mobile }}</span>
            </div>
            <div class="form-field" :class="{ error: formErrors.title }">
              <label class="field-label">{{ t('officers.title') }} <span class="required">*</span></label>
              <input v-model="form.title" type="text" class="field-input" :placeholder="t('officers.title_placeholder')" />
              <span v-if="formErrors.title" class="error-msg">{{ formErrors.title }}</span>
            </div>
          </div>

          <!-- Row 3: Email + Address -->
          <div class="form-row-2col">
            <div class="form-field">
              <label class="field-label">{{ t('officers.email') }}</label>
              <input v-model="form.email" type="email" class="field-input" :placeholder="t('officers.email_placeholder')" />
            </div>
            <div class="form-field">
              <label class="field-label">{{ t('officers.address') }}</label>
              <input v-model="form.address" type="text" class="field-input" :placeholder="t('officers.address_placeholder')" />
            </div>
          </div>

          <!-- Description -->
          <div class="form-field">
            <label class="field-label">{{ t('officers.description') }}</label>
            <textarea v-model="form.description" class="field-textarea" rows="2" :placeholder="t('officers.description_placeholder')" />
          </div>

          <!-- Roles -->
          <div class="form-field">
            <label class="field-label">{{ t('officers.roles') }}</label>
            <div class="checkbox-group">
              <label v-for="role in ROLES" :key="role" class="checkbox-item">
                <input type="checkbox" :checked="form.roles.includes(role)" @change="toggleRole(role)" />
                <span>{{ role }}</span>
              </label>
            </div>
          </div>

          <!-- Certifications -->
          <div class="form-field">
            <label class="field-label">{{ t('officers.certifications') }}</label>
            <div class="checkbox-group">
              <label v-for="cert in CERTIFICATIONS" :key="cert" class="checkbox-item">
                <input type="checkbox" :checked="form.certifications.includes(cert)" @change="toggleCert(cert)" />
                <span>{{ cert }}</span>
              </label>
            </div>
          </div>

          <!-- Active (edit only) -->
          <div v-if="formMode === 'edit'" class="form-field">
            <label class="field-label">{{ t('officers.active') }}</label>
            <label class="toggle-label">
              <input v-model="form.active" type="checkbox" />
              <span>{{ form.active ? t('common.active') : t('common.inactive') }}</span>
            </label>
          </div>
        </div>
      </template>
    </AppModal>

    <!-- Detail Modal -->
    <AppModal
      v-if="detailOfficer"
      :show="showDetailModal"
      :title="detailOfficer.fullName"
      :cancel-text="t('common.close')"
      :ok-text="''"
      @close="showDetailModal = false"
      @cancel="showDetailModal = false"
    >
      <template #default>
        <div class="detail-view">
          <!-- Avatar + basic -->
          <div class="detail-header">
            <div class="detail-avatar">
              <div v-if="detailOfficer.picture" class="avatar avatar--lg">
                <img :src="detailOfficer.picture" :alt="detailOfficer.fullName" />
              </div>
              <div v-else class="avatar avatar--lg avatar--initials">{{ getInitials(detailOfficer.fullName) }}</div>
            </div>
            <div class="detail-header-info">
              <p class="detail-title-text">{{ detailOfficer.title }}</p>
              <p class="detail-community">{{ detailOfficer.community }}</p>
              <Badge type="status" :value="detailOfficer.active ? 'active' : 'inactive'" />
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.mobile') }}</span>
              <span class="detail-value mono">{{ detailOfficer.mobile }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.email') }}</span>
              <span class="detail-value">{{ detailOfficer.email || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.address') }}</span>
              <span class="detail-value">{{ detailOfficer.address || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.reg_date') }}</span>
              <span class="detail-value mono">{{ detailOfficer.registrationDate }}</span>
            </div>
            <div class="detail-row detail-row--full">
              <span class="detail-label">{{ t('officers.roles') }}</span>
              <div class="tags-cell">
                <span v-for="r in detailOfficer.roles" :key="r" class="tag tag--role">{{ r }}</span>
                <span v-if="!detailOfficer.roles.length" class="muted">—</span>
              </div>
            </div>
            <div class="detail-row detail-row--full">
              <span class="detail-label">{{ t('officers.certifications') }}</span>
              <div class="tags-cell">
                <span v-for="c in detailOfficer.certifications" :key="c" class="tag tag--cert">{{ c }}</span>
                <span v-if="!detailOfficer.certifications.length" class="muted">—</span>
              </div>
            </div>
            <div v-if="detailOfficer.description" class="detail-row detail-row--full">
              <span class="detail-label">{{ t('officers.description') }}</span>
              <span class="detail-value">{{ detailOfficer.description }}</span>
            </div>
          </div>

          <!-- Evaluations -->
          <div class="eval-section">
            <div class="eval-header">
              <span class="eval-title">{{ t('officers.evaluations') }}</span>
              <button class="eval-add-btn" @click="showDetailModal = false; openAddEval(detailOfficer)">
                <Icon name="lucide:plus" :size="12" />
                {{ t('officers.add_evaluation') }}
              </button>
            </div>
            <div v-if="detailOfficer.evaluations.length" class="eval-list">
              <div v-for="(ev, idx) in detailOfficer.evaluations" :key="idx" class="eval-item">
                <div class="eval-meta">
                  <span class="eval-evaluator">{{ ev.evaluatorName || t('officers.unknown') }}</span>
                  <span class="eval-date">{{ ev.date }}</span>
                </div>
                <p class="eval-text">{{ ev.text }}</p>
              </div>
            </div>
            <p v-else class="eval-empty">{{ t('officers.no_evaluations') }}</p>
          </div>
        </div>
      </template>
    </AppModal>

    <!-- Add Evaluation Modal -->
    <AppModal
      :show="showEvalModal"
      :title="t('officers.add_evaluation')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.save')"
      @close="showEvalModal = false"
      @cancel="showEvalModal = false"
      @ok="handleSaveEval"
    >
      <template #default>
        <div class="eval-form">
          <div class="form-field" :class="{ error: evalError }">
            <label class="field-label">{{ t('officers.eval_text') }} <span class="required">*</span></label>
            <textarea v-model="evalForm.text" class="field-textarea" rows="4" :placeholder="t('officers.eval_text_placeholder')" />
            <span v-if="evalError" class="error-msg">{{ evalError }}</span>
          </div>
          <div class="form-row-2col">
            <div class="form-field">
              <label class="field-label">{{ t('officers.eval_date') }}</label>
              <input v-model="evalForm.date" type="date" class="field-input" />
            </div>
            <div class="form-field">
              <label class="field-label">{{ t('officers.eval_evaluator') }}</label>
              <input v-model="evalForm.evaluatorName" type="text" class="field-input" :placeholder="t('officers.eval_evaluator_placeholder')" />
            </div>
          </div>
        </div>
      </template>
    </AppModal>

    <!-- Delete Confirmation -->
    <AppModal
      :show="showDeleteModal"
      :title="t('officers.delete_title')"
      :message="t('officers.delete_message', { name: deleteTarget?.fullName ?? '' })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @ok="handleDelete"
    />
  </div>
</template>

<style scoped>
.officers-management {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

/* Filters */
.filters-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.search-box {
  /* flex: 1; */
  width: 300px;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.filter-select {
  width: 300px;
  height: 38px;
  padding: 0 var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  cursor: pointer;
  margin-left: 10px;
  margin-right: 10px;
}

.filter-toggle {
  display: flex;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ftoggle-btn {
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.ftoggle-btn.active {
  background: var(--color-accent);
  color: var(--color-bg-base);
  font-weight: 500;
}

/* Table */
.table-wrapper {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table th {
  text-align: left;
  padding: var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: var(--space-3);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--color-bg-elevated); }

.empty-row {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-8) !important;
  font-style: italic;
}

/* Officer name cell */
.officer-name-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar--initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-accent);
}

.avatar--lg {
  width: 56px;
  height: 56px;
  font-size: var(--font-size-base);
}

.name-primary {
  font-weight: 500;
  color: var(--color-text-primary);
}

.name-secondary {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.mono-cell {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted) !important;
}

/* Tags */
.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.tag {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
}

.tag--role {
  background: rgba(110, 231, 183, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(110, 231, 183, 0.3);
}

.tag--cert {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

/* Actions */
.action-group {
  display: flex;
  gap: var(--space-1);
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.action-btn--danger:hover {
  color: var(--color-critical) !important;
  border-color: var(--color-critical) !important;
}

/* Form */
.officer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Photo + Name/Community row */
.form-row-photo-name {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}

.photo-col {
  flex-shrink: 0;
}

.name-community-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.name-community-col .form-field {
  margin-bottom: 0;
}

.eval-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 420px;
}

.form-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
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

.required { color: var(--color-critical); }

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

.field-select { height: 40px; cursor: pointer; }
.field-textarea { resize: vertical; line-height: 1.5; }

.field-input:focus,
.field-select:focus,
.field-textarea:focus { border-color: var(--color-accent); }

.form-field.error .field-input,
.form-field.error .field-select,
.form-field.error .field-textarea { border-color: var(--color-critical); }

.error-msg { font-size: var(--font-size-xs); color: var(--color-critical); }

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}

/* Detail view */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 480px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.detail-header-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-title-text {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.detail-community {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row--full {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.detail-row:last-child { border-bottom: none; }

.detail-label {
  min-width: 130px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.detail-value.mono {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Evaluations */
.eval-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
}

.eval-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.eval-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.eval-add-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: none;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.eval-add-btn:hover { background: rgba(110, 231, 183, 0.1); }

.eval-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.eval-item {
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.eval-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-1);
}

.eval-evaluator {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-accent);
}

.eval-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-family: monospace;
}

.eval-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.eval-empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

</style>
