<script setup lang="ts">
import { adminUserApi } from '~/api/adminUser'

const { t } = useTranslation()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

const isSubmitting = ref(false)

const newPasswordCriteria = computed(() => {
  const pwd = newPassword.value
  return [
    { key: 'length', label: t('auth.password_min_length'), met: pwd.length >= 8 },
    { key: 'lowercase', label: t('auth.password_lowercase'), met: /[a-z]/.test(pwd) },
    { key: 'uppercase', label: t('auth.password_uppercase'), met: /[A-Z]/.test(pwd) },
    { key: 'digit', label: t('auth.password_digit'), met: /\d/.test(pwd) },
    { key: 'special', label: t('auth.password_special'), met: /[^A-Za-z0-9]/.test(pwd) },
  ] as { key: string; label: string; met: boolean }[]
})

const isNewPasswordValid = computed(() => newPasswordCriteria.value.every((c: { met: boolean }) => c.met))

const isNewPasswordSameAsCurrent = computed(() => {
  return newPassword.value && currentPassword.value && newPassword.value === currentPassword.value
})

const isFormValid = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    isNewPasswordValid.value &&
    newPassword.value !== currentPassword.value &&
    confirmPassword.value === newPassword.value
  )
})

function validateForm(): boolean {
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''

  let valid = true

  if (!currentPassword.value) {
    currentPasswordError.value = t('validation.required')
    valid = false
  }

  if (!newPassword.value) {
    newPasswordError.value = t('validation.required')
    valid = false
  } else if (!isNewPasswordValid.value) {
    newPasswordError.value = t('auth.password_requirements')
    valid = false
  } else if (newPassword.value === currentPassword.value) {
    newPasswordError.value = t('auth.password_same_as_current')
    valid = false
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = t('validation.required')
    valid = false
  } else if (confirmPassword.value !== newPassword.value) {
    confirmPasswordError.value = t('auth.password_mismatch')
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const response = await adminUserApi.changeMyPassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })

    if (response.rc === 0) {
      alert(t('auth.change_password_success'))
      resetForm()
    } else if (response.rc === 247) {
      currentPasswordError.value = t('auth.error_wrong_current_password')
    } else if (response.rc === 242) {
      newPasswordError.value = response.message || t('auth.password_requirements')
    } else if (response.rc === 248) {
      newPasswordError.value = t('auth.password_same_as_current')
    } else {
      alert(response.message || t('auth.change_password_error'))
    }
  } catch (err) {
    console.error('Error changing password:', err)
    alert(t('auth.change_password_error'))
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
}

watch(currentPassword, () => { currentPasswordError.value = '' })
watch(newPassword, () => { newPasswordError.value = '' })
watch(confirmPassword, () => { confirmPasswordError.value = '' })
</script>

<template>
  <div class="change-password-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ t('auth.change_password_title') }}</h2>
        <p class="page-subtitle">{{ t('auth.change_password_subtitle') }}</p>
      </div>
    </div>

    <div class="settings-card">
      <div class="card-header">
        <div class="card-icon">
          <Icon name="lucide:lock" :size="18" />
        </div>
        <div>
          <h3 class="card-title">{{ t('auth.change_password_form_title') }}</h3>
          <p class="card-desc">{{ t('auth.change_password_form_desc') }}</p>
        </div>
      </div>

      <div class="card-body">
        <form class="change-password-form" @submit.prevent="handleSubmit" novalidate>
          <!-- Current Password -->
          <div class="form-field">
            <label class="form-label">{{ t('auth.current_password') }}</label>
            <div class="password-input-wrapper">
              <input
                v-model="currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="form-input password-input"
                :placeholder="t('auth.current_password_placeholder')"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <Icon :name="showCurrentPassword ? 'lucide:eye-off' : 'lucide:eye'" :size="16" />
              </button>
            </div>
            <span v-if="currentPasswordError" class="error-message">{{ currentPasswordError }}</span>
          </div>

          <!-- New Password -->
          <div class="form-field">
            <label class="form-label">{{ t('auth.new_password') }}</label>
            <div class="password-input-wrapper">
              <input
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="form-input password-input"
                :class="{ 'input--error': newPasswordError }"
                :placeholder="t('auth.new_password_placeholder')"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showNewPassword = !showNewPassword"
              >
                <Icon :name="showNewPassword ? 'lucide:eye-off' : 'lucide:eye'" :size="16" />
              </button>
            </div>
            <span v-if="newPasswordError" class="error-message">{{ newPasswordError }}</span>

            <div class="password-criteria">
              <div
                v-for="criterion in newPasswordCriteria"
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

          <!-- Confirm New Password -->
          <div class="form-field">
            <label class="form-label">{{ t('auth.confirm_password') }}</label>
            <div class="password-input-wrapper">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input password-input"
                :class="{ 'input--error': confirmPasswordError }"
                :placeholder="t('auth.confirm_password_placeholder')"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" :size="16" />
              </button>
            </div>
            <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <AppButton
              :text="t('common.cancel')"
              type="secondary"
              :disabled="isSubmitting"
              @click="resetForm"
            />
            <AppButton
              :text="isSubmitting ? t('common.saving') : t('auth.change_password_button')"
              type="primary"
              icon="lucide:save"
              :disabled="isSubmitting || !isFormValid"
              @click="handleSubmit"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.change-password-page {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.settings-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-width: 560px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}

.card-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.card-body {
  padding: var(--space-5);
}

.change-password-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

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
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.form-input.input--error {
  border-color: var(--color-critical);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 40px;
}

.password-toggle-btn {
  position: absolute;
  right: var(--space-2);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-base);
}

.password-toggle-btn:hover {
  color: var(--color-text-primary);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
  margin: 0;
}

.password-criteria {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-1) var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
}

.password-criteria__item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  transition: color var(--transition-base);
}

.password-criteria__item--met {
  color: var(--color-ok);
}

.password-criteria__icon {
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
