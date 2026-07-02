<script setup lang="ts">
import { AdminUserRole, type AdminUserRoleValue, type UpdateAdminUserParams } from '~/api/types/adminUser'
import { adminUserApi } from '~/api/adminUser'
import { useAuthStore } from '~/stores/auth'

const { t } = useTranslation()
const authStore = useAuthStore()

// User interface matching AdminUser API response
interface User {
  user_id: string
  first_name: string
  last_name: string
  phone_num: string
  email: string
  role: AdminUserRoleValue
  created_on: string
  last_login: string | null
  is_active: boolean
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// Users data from API
const users = ref<User[]>([])
const totalCount = ref(0)
const loading = ref(false)
const isSearching = ref(false)

const searchQuery = ref('')
const includeInactive = ref(false)

// Sorting state - default by first name as per SDS
// Only sortable columns per UI guide: first_name, last_name, email, role, created_on
const sortKey = ref<'first_name' | 'last_name' | 'email' | 'role' | 'created_on'>('first_name')
const sortOrder = ref<'asc' | 'desc'>('asc')

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  fetchUsers(true)
}

// Debounce timer for search
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    fetchUsers(true)
  }, 400)
}

function onIncludeInactiveChange() {
  fetchUsers(true)
}

// Fetch users from API
async function fetchUsers(isSearch = false) {
  if (isSearch) isSearching.value = true
  else loading.value = true
  try {
    const response = await adminUserApi.getAdminUsers({
      include_inactive: includeInactive.value,
      search_text: searchQuery.value.trim(),
      sort_by: sortKey.value,
      sort_dir: sortOrder.value,
    }, { showLoading: !isSearch })
    if (response.rc === 0) {
      users.value = response.users || []
      totalCount.value = response.total_count || users.value.length
    } else {
      alert(response.message || 'Failed to load users')
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    alert('Failed to load users')
  } finally {
    if (isSearch) isSearching.value = false
    else loading.value = false
  }
}

// Load users on mount
onMounted(() => {
  fetchUsers(false)
})

// Delete modal state
const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

function openDeleteModal(user: User) {
  userToDelete.value = user
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}

async function handleDeleteConfirm() {
  if (!userToDelete.value) return

  try {
    const response = await adminUserApi.deleteAdminUser(userToDelete.value.user_id)
    if (response.rc === 0) {
      await fetchUsers(true)
    } else {
      alert(response.message || 'Failed to delete user')
    }
  } catch (err) {
    console.error('Error deleting user:', err)
    alert('Failed to delete user')
  } finally {
    closeDeleteModal()
  }
}

// Reset password modal
const showResetPasswordModal = ref(false)
const userToReset = ref<User | null>(null)
const isResettingPassword = ref(false)

function openResetPasswordModal(user: User) {
  userToReset.value = user
  showResetPasswordModal.value = true
}

function closeResetPasswordModal() {
  showResetPasswordModal.value = false
  userToReset.value = null
  isResettingPassword.value = false
}

async function handleResetPasswordConfirm() {
  if (!userToReset.value) return

  isResettingPassword.value = true
  try {
    const response = await adminUserApi.resetAdminUserPassword({
      user_id: userToReset.value.user_id,
      password: '', // TODO: collect password from reset dialog (Section 5)
    })
    if (response.rc === 0) {
      alert(t('users.reset_password_success'))
      closeResetPasswordModal()
    } else {
      alert(response.message || t('users.reset_password_failed'))
    }
  } catch (err) {
    console.error('Error resetting password:', err)
    alert(t('users.reset_password_failed'))
  } finally {
    isResettingPassword.value = false
  }
}

// Add user modal
const showAddModal = ref(false)
const addForm = reactive<{
  first_name: string
  last_name: string
  phone_num: string
  email: string
  password: string
  role: AdminUserRoleValue
}>({
  first_name: '',
  last_name: '',
  phone_num: '',
  email: '',
  password: '',
  role: AdminUserRole.MANAGER,
})
const addErrors = reactive<Record<string, string>>({})
const isAdding = ref(false)
const showAddPassword = ref(false)

const addPasswordCriteria = computed(() => {
  const pwd = addForm.password
  return [
    { key: 'length', label: t('auth.password_min_length'), met: pwd.length >= 8 },
    { key: 'lowercase', label: t('auth.password_lowercase'), met: /[a-z]/.test(pwd) },
    { key: 'uppercase', label: t('auth.password_uppercase'), met: /[A-Z]/.test(pwd) },
    { key: 'digit', label: t('auth.password_digit'), met: /\d/.test(pwd) },
    { key: 'special', label: t('auth.password_special'), met: /[^A-Za-z0-9]/.test(pwd) },
  ] as { key: string; label: string; met: boolean }[]
})

const isAddPasswordValid = computed(() => addPasswordCriteria.value.every((c: { met: boolean }) => c.met))
const isAddFormValid = computed(() => {
  return (
    addForm.first_name.trim().length > 0 &&
    isValidEmail(addForm.email) &&
    isAddPasswordValid.value &&
    addForm.role !== undefined
  )
})

// Edit user modal
const showEditModal = ref(false)
const editingId = ref<string | null>(null)
const originalEditUser = ref<User | null>(null)
const showEditPassword = ref(false)
const editForm = reactive<{
  first_name: string
  last_name: string
  phone_num: string
  email: string
  role: AdminUserRoleValue
  is_active: boolean
  initial_password: string
}>({
  first_name: '',
  last_name: '',
  phone_num: '',
  email: '',
  role: AdminUserRole.MANAGER,
  is_active: true,
  initial_password: '',
})
const editErrors = reactive<Record<string, string>>({})
const isEditing = ref(false)
const isLoadingEditUser = ref(false)

const editPasswordCriteria = computed(() => {
  const pwd = editForm.initial_password
  return [
    { key: 'length', label: t('auth.password_min_length'), met: pwd.length >= 8 },
    { key: 'lowercase', label: t('auth.password_lowercase'), met: /[a-z]/.test(pwd) },
    { key: 'uppercase', label: t('auth.password_uppercase'), met: /[A-Z]/.test(pwd) },
    { key: 'digit', label: t('auth.password_digit'), met: /\d/.test(pwd) },
    { key: 'special', label: t('auth.password_special'), met: /[^A-Za-z0-9]/.test(pwd) },
  ] as { key: string; label: string; met: boolean }[]
})

const isEditPasswordValid = computed(() => editPasswordCriteria.value.every((c: { met: boolean }) => c.met))
const isEditEmailChanged = computed(() => originalEditUser.value !== null && editForm.email.trim() !== originalEditUser.value.email)
const isEditOwnAccount = computed(() => {
  if (!originalEditUser.value || !authStore.user?.email) return false
  return originalEditUser.value.email === authStore.user.email
})
const isCurrentUserSuperAdmin = computed(() => {
  if (!authStore.user?.email) return false
  const currentUser = users.value.find((u: User) => u.email === authStore.user!.email)
  return currentUser?.role === AdminUserRole.SUPER_ADMIN
})
const isEditRoleDisabled = computed(() => !isCurrentUserSuperAdmin.value)
const isEditFormValid = computed(() => {
  if (!originalEditUser.value) return false
  const baseValid =
    editForm.first_name.trim().length > 0 &&
    isValidEmail(editForm.email) &&
    editForm.role !== undefined
  const emailPasswordValid = !isEditEmailChanged.value || isEditPasswordValid.value
  return baseValid && emailPasswordValid
})

const showEditDeactivateWarning = computed(() => {
  return originalEditUser.value !== null && originalEditUser.value.is_active && !editForm.is_active
})

const addRoleOptions = [
  { value: AdminUserRole.SUPER_ADMIN, label: 'Super Admin' },
  { value: AdminUserRole.MANAGER, label: 'Manager' },
  { value: AdminUserRole.PLANNING, label: 'Planning' },
  { value: AdminUserRole.LOGISTICS, label: 'Logistics' },
  { value: AdminUserRole.FINANCE, label: 'Finance' },
]

function openAddModal() {
  addForm.first_name = ''
  addForm.last_name = ''
  addForm.phone_num = ''
  addForm.email = ''
  addForm.password = ''
  addForm.role = AdminUserRole.MANAGER
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

function validateAddForm(): boolean {
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  if (!addForm.first_name.trim()) {
    addErrors.first_name = t('validation.required')
  }
  if (!addForm.email.trim()) {
    addErrors.email = t('validation.required')
  } else if (!isValidEmail(addForm.email)) {
    addErrors.email = t('auth.error_invalid_email')
  }
  if (!addForm.password) {
    addErrors.password = t('validation.required')
  } else if (!isAddPasswordValid.value) {
    addErrors.password = t('auth.password_requirements')
  }
  if (!addForm.role) {
    addErrors.role = t('validation.required')
  }
  return Object.keys(addErrors).length === 0
}

async function handleAddSubmit() {
  if (!validateAddForm()) return
  isAdding.value = true
  try {
    const response = await adminUserApi.addAdminUser({
      first_name: addForm.first_name,
      last_name: addForm.last_name,
      email: addForm.email,
      phone_num: addForm.phone_num,
      role: addForm.role,
      password: addForm.password,
    })
    if (response.rc === 0) {
      await fetchUsers(true)
      closeAddModal()
      return
    }

    Object.keys(addErrors).forEach(k => delete addErrors[k])
    switch (response.rc) {
      case 102:
        addErrors.first_name = t('validation.required')
        addErrors.email = t('validation.required')
        addErrors.password = t('validation.required')
        addErrors.role = t('validation.required')
        break
      case 106:
        addErrors.role = t('users.invalid_role')
        break
      case 213:
        addErrors.first_name = t('users.first_name_required')
        break
      case 235:
        addErrors.email = t('auth.error_invalid_email')
        break
      case 240:
        addErrors.email = t('users.email_exists')
        break
      case 242:
        addErrors.password = response.message || t('auth.password_requirements')
        break
      default:
        alert(response.message || 'Failed to add user')
    }
  } catch (err) {
    console.error('Error adding user:', err)
    alert('Failed to add user')
  } finally {
    isAdding.value = false
  }
}

// Edit user functions
async function openEditModal(user: User) {
  editingId.value = user.user_id
  originalEditUser.value = null
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  isLoadingEditUser.value = true
  showEditModal.value = true

  try {
    const response = await adminUserApi.getAdminUser(user.user_id)
    if (response.rc === 0 && response.user) {
      const data = response.user
      originalEditUser.value = data
      editForm.first_name = data.first_name
      editForm.last_name = data.last_name
      editForm.phone_num = data.phone_num
      editForm.email = data.email
      editForm.role = data.role
      editForm.is_active = data.is_active
      editForm.initial_password = ''
      showEditPassword.value = false
    } else {
      alert(response.message || 'Failed to load user details')
      closeEditModal()
    }
  } catch (err) {
    console.error('Error loading user details:', err)
    alert('Failed to load user details')
    closeEditModal()
  } finally {
    isLoadingEditUser.value = false
  }
}

function closeEditModal() {
  showEditModal.value = false
  editingId.value = null
  originalEditUser.value = null
  editForm.initial_password = ''
  showEditPassword.value = false
  Object.keys(editErrors).forEach(k => delete editErrors[k])
}

function validateEditForm(): boolean {
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  if (!editForm.first_name.trim()) {
    editErrors.first_name = t('validation.required')
  }
  if (!editForm.email.trim()) {
    editErrors.email = t('validation.required')
  } else if (!isValidEmail(editForm.email)) {
    editErrors.email = t('auth.error_invalid_email')
  }
  if (isEditEmailChanged.value && !isEditPasswordValid.value) {
    editErrors.initial_password = t('auth.password_requirements')
  }
  return Object.keys(editErrors).length === 0
}

async function handleEditSubmit() {
  if (!validateEditForm()) return
  if (!originalEditUser.value) return

  isEditing.value = true
  try {
    const original = originalEditUser.value
    const payload: UpdateAdminUserParams = { user_id: editingId.value! }

    if (editForm.first_name.trim() !== original.first_name) {
      payload.first_name = editForm.first_name.trim()
    }
    if (editForm.last_name.trim() !== original.last_name) {
      payload.last_name = editForm.last_name.trim()
    }
    if (editForm.phone_num.trim() !== original.phone_num) {
      payload.phone_num = editForm.phone_num.trim()
    }
    if (editForm.email.trim() !== original.email) {
      payload.email = editForm.email.trim()
      payload.initial_password = editForm.initial_password
    }
    if (editForm.is_active !== original.is_active) {
      payload.is_active = editForm.is_active
    }

    const hasUserChanges = Object.keys(payload).length > 1
    let userResponse = null
    if (hasUserChanges) {
      userResponse = await adminUserApi.updateAdminUser(payload)
    }

    let roleResponse = null
    if (editForm.role !== original.role) {
      roleResponse = await adminUserApi.changeAdminUserRole({
        user_id: editingId.value!,
        role: editForm.role,
      })
    }

    if ((!userResponse || userResponse.rc === 0) && (!roleResponse || roleResponse.rc === 0)) {
      await fetchUsers(true)
      closeEditModal()
      return
    }

    Object.keys(editErrors).forEach(k => delete editErrors[k])
    const response = userResponse && userResponse.rc !== 0 ? userResponse : roleResponse
    switch (response?.rc) {
      case 770:
        alert(t('users.user_not_found'))
        closeEditModal()
        await fetchUsers(true)
        break
      case 771:
        editErrors.is_active = t('users.last_admin_deactivate')
        break
      case 772:
        editErrors.role = t('users.cannot_change_own_role')
        break
      case 102:
        editErrors.initial_password = t('users.initial_password_required')
        break
      case 106:
        editErrors.role = t('users.invalid_role')
        break
      case 235:
        editErrors.email = t('auth.error_invalid_email')
        break
      case 240:
        editErrors.email = t('users.email_exists')
        break
      case 242:
        editErrors.initial_password = response?.message || t('auth.password_requirements')
        break
      default:
        alert(response?.message || 'Failed to update user')
    }
  } catch (err) {
    console.error('Error updating user:', err)
    alert('Failed to update user')
  } finally {
    isEditing.value = false
  }
}

const totalUsers = computed(() => totalCount.value)
</script>

<template>
  <div class="users-management">
    <!-- Header -->
    <div class="users-management__header">
      <div>
        <h2 class="users-management__title">{{ t('users.management_title') }}</h2>
        <p class="users-management__subtitle">
          Total: {{ totalUsers }} users in the system
        </p>
      </div>

      <div class="users-management__actions">
        <div class="users-management__search">
          <Icon name="lucide:search" :size="16" class="users-management__search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('users.search_placeholder')"
            class="users-management__search-input"
            @input="onSearchInput"
          />
          <Icon
            v-if="isSearching"
            name="lucide:loader-2"
            :size="16"
            class="users-management__search-loading spin"
          />
        </div>

        <label class="users-management__filter users-management__filter--checkbox">
          <input
            v-model="includeInactive"
            type="checkbox"
            @change="onIncludeInactiveChange"
          />
          <span>{{ t('users.include_inactive') }}</span>
        </label>

        <AppButton :text="t('users.add_user')" icon="lucide:plus" type="primary" @click="openAddModal" />
      </div>
    </div>

    <!-- Table -->
    <div class="users-management__table-container">
      <div v-if="loading && !isSearching" class="loading-overlay">
        <Icon name="lucide:loader-2" :size="32" class="animate-spin" />
        <span>{{ t('common.loading') }}</span>
      </div>
      <table v-else class="users-management__table">
        <thead>
          <tr>
            <th class="col-first-name sortable" :class="{ 'sorted': sortKey === 'first_name', 'asc': sortKey === 'first_name' && sortOrder === 'asc', 'desc': sortKey === 'first_name' && sortOrder === 'desc' }" @click="toggleSort('first_name')">
              <span class="sortable-content">
                <span>{{ t('users.first_name') }}</span>
                <Icon v-if="sortKey === 'first_name'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-last-name sortable" :class="{ 'sorted': sortKey === 'last_name', 'asc': sortKey === 'last_name' && sortOrder === 'asc', 'desc': sortKey === 'last_name' && sortOrder === 'desc' }" @click="toggleSort('last_name')">
              <span class="sortable-content">
                <span>{{ t('users.last_name') }}</span>
                <Icon v-if="sortKey === 'last_name'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-mobile">{{ t('users.mobile') }}</th>
            <th class="col-email sortable" :class="{ 'sorted': sortKey === 'email', 'asc': sortKey === 'email' && sortOrder === 'asc', 'desc': sortKey === 'email' && sortOrder === 'desc' }" @click="toggleSort('email')">
              <span class="sortable-content">
                <span>{{ t('users.email') }}</span>
                <Icon v-if="sortKey === 'email'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-password">{{ t('users.password') }}</th>
            <th class="col-role sortable" :class="{ 'sorted': sortKey === 'role', 'asc': sortKey === 'role' && sortOrder === 'asc', 'desc': sortKey === 'role' && sortOrder === 'desc' }" @click="toggleSort('role')">
              <span class="sortable-content">
                <span>{{ t('users.role') }}</span>
                <Icon v-if="sortKey === 'role'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-date sortable" :class="{ 'sorted': sortKey === 'created_on', 'asc': sortKey === 'created_on' && sortOrder === 'asc', 'desc': sortKey === 'created_on' && sortOrder === 'desc' }" @click="toggleSort('created_on')">
              <span class="sortable-content">
                <span>{{ t('users.registration_date') }}</span>
                <Icon v-if="sortKey === 'created_on'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-active">{{ t('users.active') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.user_id">
            <td class="col-first-name">
              <span class="user-name">{{ user.first_name }}</span>
            </td>
            <td class="col-last-name">{{ user.last_name }}</td>
            <td class="col-mobile">{{ user.phone_num }}</td>
            <td class="col-email">{{ user.email }}</td>
            <td class="col-password">
              <span class="password-mask">•••••••</span>
              <span v-if="!user.last_login" class="password-initial">Initial</span>
            </td>
            <td class="col-role">
              <Badge type="adminRole" :value="user.role" />
            </td>
            <td class="col-date">{{ user.created_on }}</td>
            <td class="col-active">
              <Badge type="active" :value="user.is_active" />
            </td>
            <td class="col-actions">
              <div class="action-group">
                <button class="action-btn action-btn--icon" :title="t('common.edit')" @click="openEditModal(user)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button class="action-btn action-btn--icon" :title="t('users.reset_password')" @click="openResetPasswordModal(user)">
                  <Icon name="lucide:key" :size="14" />
                </button>
                <button
                  v-if="user.email !== authStore.user?.email"
                  class="action-btn action-btn--icon"
                  :title="t('common.delete')"
                  @click="openDeleteModal(user)"
                >
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Modal -->
    <AppModal
      :show="showDeleteModal"
      :title="t('users.delete_title')"
      :message="t('users.delete_message', { name: `${userToDelete?.first_name} ${userToDelete?.last_name}` })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="closeDeleteModal"
      @cancel="closeDeleteModal"
      @ok="handleDeleteConfirm"
    />

    <!-- Reset Password Modal -->
    <AppModal
      :show="showResetPasswordModal"
      :title="t('users.reset_password_title')"
      :message="t('users.reset_password_message', { name: `${userToReset?.first_name} ${userToReset?.last_name}` })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('users.reset_password')"
      @close="closeResetPasswordModal"
      @cancel="closeResetPasswordModal"
      @ok="handleResetPasswordConfirm"
    />

    <!-- Add User Modal -->
    <AppDialogModal :show="showAddModal" :title="t('users.add_title')" @close="closeAddModal">
      <div class="add-user-form">
        <div class="form-section">
          <h4 class="section-title">{{ t('users.basic_info') }}</h4>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                {{ t('users.first_name') }}
                <span class="required">*</span>
              </label>
              <input
                v-model="addForm.first_name"
                type="text"
                class="form-input"
                :placeholder="t('users.first_name')"
              />
              <span v-if="addErrors.first_name" class="error-message">{{ addErrors.first_name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('users.last_name') }}</label>
              <input
                v-model="addForm.last_name"
                type="text"
                class="form-input"
                :placeholder="t('users.last_name')"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ t('users.mobile') }}</label>
              <input
                v-model="addForm.phone_num"
                type="tel"
                class="form-input"
                :placeholder="t('users.mobile')"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ t('users.email') }}
                <span class="required">*</span>
              </label>
              <input
                v-model="addForm.email"
                type="email"
                class="form-input"
                :placeholder="t('users.email_placeholder') || 'email@example.com'"
              />
              <span v-if="addErrors.email" class="error-message">{{ addErrors.email }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                {{ t('users.password') }}
                <span class="required">*</span>
              </label>
              <div class="password-input-wrapper">
                <input
                  v-model="addForm.password"
                  :type="showAddPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  :placeholder="t('auth.password_placeholder') || 'Enter password'"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  @click="showAddPassword = !showAddPassword"
                >
                  <Icon :name="showAddPassword ? 'lucide:eye-off' : 'lucide:eye'" :size="16" />
                </button>
              </div>
              <span v-if="addErrors.password" class="error-message">{{ addErrors.password }}</span>
              <span class="hint">{{ t('users.password_hint') || 'Initial password. User must change on first login.' }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ t('users.role') }}
                <span class="required">*</span>
              </label>
              <select v-model="addForm.role" class="form-select">
                <option v-for="opt in addRoleOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <span v-if="addErrors.role" class="error-message">{{ addErrors.role }}</span>
            </div>
          </div>

          <div v-if="addForm.password.length > 0" class="form-row">
            <div class="form-group form-group--full">
              <div class="password-criteria">
                <div
                  v-for="criterion in addPasswordCriteria"
                  :key="criterion.key"
                  class="password-criteria__item"
                  :class="{ 'password-criteria__item--met': criterion.met }"
                >
                  <Icon
                    :name="criterion.met ? 'lucide:check' : 'lucide:x'"
                    :size="12"
                    class="password-criteria__icon"
                  />
                  <span>{{ criterion.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section form-section--info">
          <div class="info-row">
            <span class="info-label">{{ t('users.registration_date') }}:</span>
            <span class="info-value">{{ new Date().toISOString().slice(0, 10) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('users.status') }}:</span>
            <Badge type="status" value="active" />
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton
          :text="t('common.cancel')"
          type="secondary"
          @click="closeAddModal"
        />
        <AppButton
          :text="isAdding ? t('common.saving') : t('common.save')"
          type="primary"
          icon="lucide:save"
          :disabled="isAdding || !isAddFormValid"
          @click="handleAddSubmit"
        />
      </template>
    </AppDialogModal>

    <!-- Edit User Modal -->
    <AppDialogModal :show="showEditModal" :title="t('users.edit_title')" @close="closeEditModal">
      <div v-if="isLoadingEditUser" class="modal-loading">
        <Icon name="lucide:loader-2" :size="32" class="spin" />
        <span>{{ t('common.loading') }}</span>
      </div>
      <div v-else class="add-user-form">
        <div class="form-section">
          <h4 class="section-title">{{ t('users.basic_info') }}</h4>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                {{ t('users.first_name') }}
                <span class="required">*</span>
              </label>
              <input
                v-model="editForm.first_name"
                type="text"
                class="form-input"
                :placeholder="t('users.first_name')"
              />
              <span v-if="editErrors.first_name" class="error-message">{{ editErrors.first_name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('users.last_name') }}</label>
              <input
                v-model="editForm.last_name"
                type="text"
                class="form-input"
                :placeholder="t('users.last_name')"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ t('users.mobile') }}</label>
              <input
                v-model="editForm.phone_num"
                type="tel"
                class="form-input"
                :placeholder="t('users.mobile')"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ t('users.email') }}
                <span class="required">*</span>
              </label>
              <input
                v-model="editForm.email"
                type="email"
                class="form-input"
                :placeholder="t('users.email_placeholder') || 'email@example.com'"
              />
              <span v-if="editErrors.email" class="error-message">{{ editErrors.email }}</span>
            </div>
          </div>

          <div v-if="isEditEmailChanged" class="form-row">
            <div class="form-group form-group--full">
              <div class="warning-banner">
                <Icon name="lucide:alert-triangle" :size="16" />
                <span>{{ t('users.email_change_warning') }}</span>
              </div>
            </div>
          </div>

          <div v-if="isEditEmailChanged" class="form-row">
            <div class="form-group form-group--full">
              <label class="form-label">
                {{ t('users.initial_password') }}
                <span class="required">*</span>
              </label>
              <div class="password-input-wrapper">
                <input
                  v-model="editForm.initial_password"
                  :type="showEditPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  :placeholder="t('auth.password_placeholder') || 'Enter password'"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  @click="showEditPassword = !showEditPassword"
                >
                  <Icon :name="showEditPassword ? 'lucide:eye-off' : 'lucide:eye'" :size="16" />
                </button>
              </div>
              <span v-if="editErrors.initial_password" class="error-message">{{ editErrors.initial_password }}</span>

              <div class="password-criteria">
                <div
                  v-for="criterion in editPasswordCriteria"
                  :key="criterion.key"
                  class="password-criteria__item"
                  :class="{ 'password-criteria__item--met': criterion.met }"
                >
                  <Icon
                    :name="criterion.met ? 'lucide:check' : 'lucide:x'"
                    :size="12"
                    class="password-criteria__icon"
                  />
                  <span>{{ criterion.label }}</span>
                </div>
              </div>

              <span class="hint">{{ t('users.initial_password_hint') || 'Required when changing email. The user will be logged out and must change this password on their next login.' }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                {{ t('users.role') }}
                <span class="required">*</span>
              </label>
              <div class="role-select-wrapper">
                <select
                  v-model="editForm.role"
                  class="form-select"
                  :disabled="isEditRoleDisabled"
                  :title="isEditRoleDisabled ? (isEditOwnAccount ? t('users.cannot_change_own_role') : t('users.role_super_admin_only')) : ''"
                >
                  <option v-for="opt in addRoleOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <span v-if="isEditRoleDisabled" class="role-disabled-hint">
                  {{ isEditOwnAccount ? t('users.cannot_change_own_role') : t('users.role_super_admin_only') }}
                </span>
              </div>
              <span v-if="editErrors.role" class="error-message">{{ editErrors.role }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('users.status') }}</label>
              <label class="toggle-switch">
                <input v-model="editForm.is_active" type="checkbox" />
                <span class="toggle-switch__track"></span>
                <span class="toggle-switch__label">{{ editForm.is_active ? t('users.status_active') : t('users.status_inactive') }}</span>
              </label>
            </div>
          </div>

          <div v-if="showEditDeactivateWarning" class="form-row">
            <div class="form-group form-group--full">
              <div class="warning-banner warning-banner--critical">
                <Icon name="lucide:alert-triangle" :size="16" />
                <span>{{ t('users.deactivate_warning') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section form-section--info">
          <div class="info-row">
            <span class="info-label">{{ t('users.registration_date') }}:</span>
            <span class="info-value">{{ originalEditUser?.created_on ?? '' }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton
          :text="t('common.cancel')"
          type="secondary"
          @click="closeEditModal"
        />
        <AppButton
          :text="isEditing ? t('common.saving') : t('common.save')"
          type="primary"
          icon="lucide:save"
          :disabled="isEditing || isLoadingEditUser || !isEditFormValid"
          @click="handleEditSubmit"
        />
      </template>
    </AppDialogModal>
  </div>
</template>

<style scoped>
.users-management {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Header */
.users-management__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.users-management__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-1);
}

.users-management__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.users-management__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.users-management__search {
  position: relative;
  display: flex;
  align-items: center;
}

.users-management__search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.users-management__search-loading {
  position: absolute;
  right: var(--space-3);
  color: var(--color-accent);
}

.users-management__search-input {
  width: 240px;
  height: 40px;
  padding: 0 var(--space-3) 0 36px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}

.users-management__search-input::placeholder {
  color: var(--color-text-muted);
}

.users-management__search-input:focus {
  border-color: var(--color-accent);
}

.users-management__filter {
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  outline: none;
}

.users-management__filter:focus {
  border-color: var(--color-accent);
}

.users-management__filter--checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  width: auto;
  cursor: pointer;
  user-select: none;
}

.users-management__filter--checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
  cursor: pointer;
}

/* Table Container */
.users-management__table-container {
  position: relative;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.loading-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--color-bg-surface);
  opacity: 0.9;
}

/* Table */
.users-management__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.users-management__table thead {
  background: var(--color-bg-elevated);
}

.users-management__table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.users-management__table th.sortable {
  cursor: pointer;
  user-select: none;
}

.users-management__table th.sortable .sortable-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.users-management__table th.sortable .sortable-content :deep(svg) {
  flex-shrink: 0;
  display: block;
}

.users-management__table th.sortable:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-overlay);
}

.users-management__table th.sorted {
  color: var(--color-accent);
}

.users-management__table td {
  padding: var(--space-4);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.users-management__table tbody tr:hover {
  background: var(--color-bg-overlay);
}

.users-management__table tbody tr:last-child td {
  border-bottom: none;
}

/* Column widths */
.col-first-name { width: 12%; }
.col-last-name { width: 12%; }
.col-mobile { width: 14%; }
.col-email { width: 18%; }
.col-password { width: 10%; }
.col-role { width: 10%; }
.col-date { width: 12%; }
.col-active { width: 8%; text-align: center; }
.col-actions { width: 4%; text-align: center; }

/* User name */
.user-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

/* Password column */
.password-mask {
  font-family: monospace;
  letter-spacing: 2px;
  color: var(--color-text-muted);
}

.password-initial {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* Action buttons */
.action-group {
  display: flex;
  gap: var(--space-1);
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.action-btn:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.action-btn--icon {
  padding: 0;
}

/* Add User Form - used inside AppDialogModal */
.add-user-form .form-section {
  margin-bottom: var(--space-6);
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section--info {
  display: flex;
  gap: var(--space-8);
  padding: var(--space-4);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.required {
  color: var(--color-critical);
  margin-left: 2px;
}

.form-input,
.form-select {
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.form-select {
  cursor: pointer;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding-right: 40px;
}

.password-toggle-btn {
  position: absolute;
  right: var(--space-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.password-toggle-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-overlay);
}

.password-criteria {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2) var(--space-4);
  width: 100%;
}

.password-criteria__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-critical);
}

.password-criteria__item--met {
  color: var(--color-ok);
}

.password-criteria__icon {
  flex-shrink: 0;
}

.error-message {
  font-size: 12px;
  color: var(--color-critical);
  margin-top: var(--space-1);
}

.hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.info-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-warn-bg);
  border: 1px solid var(--color-warn);
  border-radius: var(--radius-md);
  color: var(--color-warn);
  font-size: 12px;
  line-height: 1.5;
}

.warning-banner--critical {
  background: var(--color-critical-bg);
  border-color: var(--color-critical);
  color: var(--color-critical);
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.toggle-switch input {
  display: none;
}

.toggle-switch__track {
  position: relative;
  width: 40px;
  height: 22px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  transition: background-color var(--transition-base);
}

.toggle-switch__track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-text-inverse);
  border-radius: var(--radius-full);
  transition: transform var(--transition-base);
}

.toggle-switch input:checked + .toggle-switch__track {
  background: var(--color-ok);
}

.toggle-switch input:checked + .toggle-switch__track::after {
  transform: translateX(18px);
}

.toggle-switch__label {
  font-size: 13px;
  color: var(--color-text-primary);
}

.role-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.role-disabled-hint {
  font-size: 11px;
  color: var(--color-text-muted);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
