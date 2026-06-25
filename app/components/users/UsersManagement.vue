<script setup lang="ts">
import { UserType, UserTypeLabels } from '~/constants/userTypes'
import { usersApi, type UserItem } from '~/api/users'

const { t } = useTranslation()

// User interface matching API response
interface User {
  id: string
  first_name: string
  last_name: string
  mobile: string
  email: string
  password: string
  type: UserType
  registration_date: string
  active: boolean
}

// Users data from API
const users = ref<User[]>([])
const loading = ref(false)

const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')

// Sorting state - default by first name as per SDS
const sortKey = ref<'first_name' | 'last_name' | 'mobile' | 'email' | 'type' | 'registration_date' | 'active'>('first_name')
const sortOrder = ref<'asc' | 'desc'>('asc')

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Filter options
const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: String(UserType.ADMIN), label: UserTypeLabels[UserType.ADMIN] },
  { value: String(UserType.MANAGER), label: UserTypeLabels[UserType.MANAGER] },
  { value: String(UserType.PLANNING), label: UserTypeLabels[UserType.PLANNING] },
  { value: String(UserType.LOGISTICS), label: UserTypeLabels[UserType.LOGISTICS] },
  { value: String(UserType.FINANCE), label: UserTypeLabels[UserType.FINANCE] },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

// Fetch users from API
async function fetchUsers() {
  try {
    loading.value = true
    const response = await usersApi.getUsers()
    if (response.rc === 0) {
      // API returns { rc, message, users: [...] }
      const userList = (response as any).users || []
      users.value = userList.map((item: any) => ({
        id: item.user_id,
        first_name: item.first_name,
        last_name: item.last_name || '',
        mobile: item.mobile || '',
        email: item.email,
        password: item.password,
        type: item.type as UserType,
        registration_date: item.create || item.registration_date || '',
        active: item.status === 1 || item.active === true,
      }))
    } else {
      alert(response.message || 'Failed to load users')
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    alert('Failed to load users')
  } finally {
    loading.value = false
  }
}

// Load users on mount
onMounted(() => {
  fetchUsers()
})

// Filtered and sorted users
const filteredUsers = computed(() => {
  let result = users.value

  // Filter by role
  if (roleFilter.value !== 'all') {
    result = result.filter((u: User) => u.type === Number(roleFilter.value))
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    result = result.filter((u: User) => u.active === (statusFilter.value === 'active'))
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter((u: User) =>
      u.first_name.toLowerCase().includes(query) ||
      u.last_name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.mobile.toLowerCase().includes(query)
    )
  }

  return result
})

const sortedUsers = computed(() => {
  const result = [...filteredUsers.value].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    switch (sortKey.value) {
      case 'first_name':
        aVal = a.first_name.toLowerCase()
        bVal = b.first_name.toLowerCase()
        break
      case 'last_name':
        aVal = a.last_name.toLowerCase()
        bVal = b.last_name.toLowerCase()
        break
      case 'mobile':
        aVal = a.mobile.toLowerCase()
        bVal = b.mobile.toLowerCase()
        break
      case 'email':
        aVal = a.email.toLowerCase()
        bVal = b.email.toLowerCase()
        break
      case 'type':
        aVal = a.type
        bVal = b.type
        break
      case 'registration_date':
        aVal = new Date(a.registration_date).getTime()
        bVal = new Date(b.registration_date).getTime()
        break
      case 'active':
        aVal = a.active ? 1 : 0
        bVal = b.active ? 1 : 0
        break
      default:
        return 0
    }

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return result
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
    const response = await usersApi.deleteUser(userToDelete.value.id)
    if (response.rc === 0) {
      await fetchUsers()
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
    const response = await usersApi.resetUserPassword(userToReset.value.id)
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
const addForm = reactive({
  first_name: '',
  last_name: '',
  mobile: '',
  email: '',
  password: '',
  role: UserType.ADMIN,
})
const addErrors = reactive<Record<string, string>>({})
const isAdding = ref(false)

// Edit user modal
const showEditModal = ref(false)
const editingId = ref<string | null>(null)
const editForm = reactive({
  first_name: '',
  last_name: '',
  mobile: '',
  email: '',
  role: UserType.ADMIN,
  active: true,
})
const editErrors = reactive<Record<string, string>>({})
const isEditing = ref(false)

const addRoleOptions = [
  { value: UserType.ADMIN, label: UserTypeLabels[UserType.ADMIN] },
  { value: UserType.MANAGER, label: UserTypeLabels[UserType.MANAGER] },
  { value: UserType.PLANNING, label: UserTypeLabels[UserType.PLANNING] },
  { value: UserType.LOGISTICS, label: UserTypeLabels[UserType.LOGISTICS] },
  { value: UserType.FINANCE, label: UserTypeLabels[UserType.FINANCE] },
]

function openAddModal() {
  addForm.first_name = ''
  addForm.last_name = ''
  addForm.mobile = ''
  addForm.email = ''
  addForm.password = ''
  addForm.role = UserType.ADMIN
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
  }
  if (!addForm.password.trim()) {
    addErrors.password = t('validation.required')
  }
  return Object.keys(addErrors).length === 0
}

async function handleAddSubmit() {
  if (!validateAddForm()) return
  isAdding.value = true
  try {
    const response = await usersApi.addUser(
      addForm.first_name,
      addForm.last_name,
      addForm.email,
      addForm.mobile,
      addForm.role,
      addForm.password
    )
    if (response.rc === 0) {
      await fetchUsers()
      closeAddModal()
    } else {
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
function openEditModal(user: User) {
  editingId.value = user.id
  editForm.first_name = user.first_name
  editForm.last_name = user.last_name
  editForm.mobile = user.mobile
  editForm.email = user.email
  editForm.role = user.type
  editForm.active = user.active
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingId.value = null
}

function validateEditForm(): boolean {
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  if (!editForm.first_name.trim()) {
    editErrors.first_name = t('validation.required')
  }
  if (!editForm.email.trim()) {
    editErrors.email = t('validation.required')
  }
  return Object.keys(editErrors).length === 0
}

async function handleEditSubmit() {
  if (!validateEditForm()) return
  isEditing.value = true
  try {
    const response = await usersApi.updateUser(
      editingId.value!,
      editForm.first_name,
      editForm.last_name,
      editForm.email,
      editForm.mobile,
      editForm.role,
      editForm.active
    )
    if (response.rc === 0) {
      await fetchUsers()
      closeEditModal()
    } else {
      alert(response.message || 'Failed to update user')
    }
  } catch (err) {
    console.error('Error updating user:', err)
    alert('Failed to update user')
  } finally {
    isEditing.value = false
  }
}

const totalUsers = computed(() => users.value.length)
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
          />
        </div>

        <select v-model="roleFilter" class="users-management__filter">
          <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select v-model="statusFilter" class="users-management__filter">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <AppButton :text="t('users.add_user')" icon="lucide:plus" type="primary" @click="openAddModal" />
      </div>
    </div>

    <!-- Table -->
    <div class="users-management__table-container">
      <div v-if="loading" class="loading-overlay">
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
            <th class="col-mobile sortable" :class="{ 'sorted': sortKey === 'mobile', 'asc': sortKey === 'mobile' && sortOrder === 'asc', 'desc': sortKey === 'mobile' && sortOrder === 'desc' }" @click="toggleSort('mobile')">
              <span class="sortable-content">
                <span>{{ t('users.mobile') }}</span>
                <Icon v-if="sortKey === 'mobile'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-email sortable" :class="{ 'sorted': sortKey === 'email', 'asc': sortKey === 'email' && sortOrder === 'asc', 'desc': sortKey === 'email' && sortOrder === 'desc' }" @click="toggleSort('email')">
              <span class="sortable-content">
                <span>{{ t('users.email') }}</span>
                <Icon v-if="sortKey === 'email'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-password">{{ t('users.password') }}</th>
            <th class="col-role sortable" :class="{ 'sorted': sortKey === 'type', 'asc': sortKey === 'type' && sortOrder === 'asc', 'desc': sortKey === 'type' && sortOrder === 'desc' }" @click="toggleSort('type')">
              <span class="sortable-content">
                <span>{{ t('users.role') }}</span>
                <Icon v-if="sortKey === 'type'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-date sortable" :class="{ 'sorted': sortKey === 'registration_date', 'asc': sortKey === 'registration_date' && sortOrder === 'asc', 'desc': sortKey === 'registration_date' && sortOrder === 'desc' }" @click="toggleSort('registration_date')">
              <span class="sortable-content">
                <span>{{ t('users.registration_date') }}</span>
                <Icon v-if="sortKey === 'registration_date'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-active sortable" :class="{ 'sorted': sortKey === 'active', 'asc': sortKey === 'active' && sortOrder === 'asc', 'desc': sortKey === 'active' && sortOrder === 'desc' }" @click="toggleSort('active')">
              <span class="sortable-content">
                <span>{{ t('users.active') }}</span>
                <Icon v-if="sortKey === 'active'" :name="sortOrder === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
              </span>
            </th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sortedUsers" :key="user.id">
            <td class="col-first-name">
              <span class="user-name">{{ user.first_name }}</span>
            </td>
            <td class="col-last-name">{{ user.last_name }}</td>
            <td class="col-mobile">{{ user.mobile }}</td>
            <td class="col-email">{{ user.email }}</td>
            <td class="col-password">{{ user.password }}</td>
            <td class="col-role">
              <Badge type="userType" :value="user.type" />
            </td>
            <td class="col-date">{{ user.registration_date }}</td>
            <td class="col-active">
              <Badge type="status" :value="user.active ? 'active' : 'inactive'" />
            </td>
            <td class="col-actions">
              <div class="action-group">
                <button class="action-btn action-btn--icon" :title="t('users.reset_password')" @click="openResetPasswordModal(user)">
                  <Icon name="lucide:key" :size="14" />
                </button>
                <button class="action-btn action-btn--icon" :title="t('common.edit')" @click="openEditModal(user)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button class="action-btn action-btn--icon" :title="t('common.delete')" @click="openDeleteModal(user)">
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
                v-model="addForm.mobile"
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
              <input
                v-model="addForm.password"
                type="password"
                class="form-input"
                :placeholder="t('auth.password_placeholder') || 'Enter password'"
              />
              <span v-if="addErrors.password" class="error-message">{{ addErrors.password }}</span>
              <span class="hint">{{ t('users.password_hint') || 'Initial password. User must change on first login.' }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('users.role') }}</label>
              <select v-model="addForm.role" class="form-select">
                <option v-for="opt in addRoleOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
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
          :disabled="isAdding"
          @click="handleAddSubmit"
        />
      </template>
    </AppDialogModal>

    <!-- Edit User Modal -->
    <AppDialogModal :show="showEditModal" :title="t('users.edit_title')" @close="closeEditModal">
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
                v-model="editForm.mobile"
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

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ t('users.role') }}</label>
              <select v-model="editForm.role" class="form-select">
                <option v-for="opt in addRoleOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('users.status') }}</label>
              <select v-model="editForm.active" class="form-select">
                <option :value="true">{{ t('users.status_active') }}</option>
                <option :value="false">{{ t('users.status_inactive') }}</option>
              </select>
            </div>
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
          :disabled="isEditing"
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

/* Table Container */
.users-management__table-container {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
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

.error-message {
  font-size: 12px;
  color: var(--color-error);
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
</style>
