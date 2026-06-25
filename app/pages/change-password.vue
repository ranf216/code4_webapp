<script setup lang="ts">
import { twoFactorAuthApi } from '~/api/twoFactor'

definePageMeta({
  layout: 'auth',
})

const { t } = useTranslation()
const authStore = useAuthStore()
const router = useRouter()

// Redirect if not authenticated or doesn't need password change
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.needChangePassword) {
    router.push('/login')
  }
})

// Form state
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Show/hide password toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Error states
const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')
const globalError = ref('')

// Loading state
const isLoading = ref(false)

// Validation functions
function validateCurrentPassword(value: string): string {
  if (!value) return t('auth.password_required')
  return ''
}

function validateNewPassword(value: string): string {
  if (!value) return t('auth.password_required')
  if (value.length < 8) return t('auth.password_min_length')
  if (!/[A-Z]/.test(value)) return t('auth.password_uppercase')
  if (!/[a-z]/.test(value)) return t('auth.password_lowercase')
  if (!/[0-9]/.test(value)) return t('auth.password_digit')
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return t('auth.password_special')
  return ''
}

function validateConfirmPassword(value: string): string {
  if (!value) return t('auth.password_required')
  if (value !== newPassword.value) return t('auth.password_mismatch')
  return ''
}

// Handle form submission
async function handleSubmit() {
  // Reset errors
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
  globalError.value = ''

  // Validate
  currentPasswordError.value = validateCurrentPassword(currentPassword.value)
  newPasswordError.value = validateNewPassword(newPassword.value)
  confirmPasswordError.value = validateConfirmPassword(confirmPassword.value)

  if (currentPasswordError.value || newPasswordError.value || confirmPasswordError.value) {
    return
  }

  try {
    isLoading.value = true

    // Call change password API with restricted token
    const response = await twoFactorAuthApi.changePassword(
      authStore.token!,
      currentPassword.value,
      newPassword.value
    )

    if (response.rc === 0) {
      // Update auth store with new token
      authStore.setAuth(
        response.token,
        {
          type: response.type,
          first_name: response.first_name,
          last_name: response.last_name,
        },
        false
      )

      // Redirect to dashboard
      await router.push('/dashboard')
    } else {
      globalError.value = response.message || t('auth.change_password_error')
    }
  } catch (err: any) {
    globalError.value = err.message || t('auth.change_password_error')
  } finally {
    isLoading.value = false
  }
}

// Clear errors on input
watch(currentPassword, () => { currentPasswordError.value = '' })
watch(newPassword, () => { newPasswordError.value = '' })
watch(confirmPassword, () => { confirmPasswordError.value = '' })
</script>

<template>
  <div class="change-password-container">
    <!-- Brand -->
    <div class="login-brand">
      <div class="brand-logo">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="#E5FF44" />
          <path d="M24 12L32 24H16L24 12Z" fill="#0A0C10" />
          <rect x="16" y="24" width="16" height="12" fill="#0A0C10" />
        </svg>
      </div>
      <h1 class="brand-title">AXIS</h1>
      <p class="brand-tagline">{{ t('app.tagline') }}</p>
    </div>

    <!-- Card -->
    <div class="card card--pad change-password-card">
      <h1 class="change-password-card__title">{{ t('auth.change_password_title') }}</h1>
      <p class="change-password-card__subtitle text-secondary text-sm">
        {{ t('auth.change_password_subtitle') }}
      </p>

      <form class="change-password-form" @submit.prevent="handleSubmit" novalidate>
        <!-- Current Password -->
        <div class="form-field">
          <div style="display: flex; flex-direction: row;">
            <Icon name="lucide:lock" :size="16" class="input-icon" style="margin-right: 10px;" />
            <label class="label" for="current-password">{{ t('auth.current_password') }}</label>
          </div>
          <div class="input-wrap">
            <input
              id="current-password"
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="input input--with-icon input--with-suffix"
              :class="{ 'input--error': currentPasswordError }"
              :placeholder="t('auth.current_password_placeholder')"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="input-suffix-btn"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <Icon
                :name="showCurrentPassword ? 'lucide:eye-off' : 'lucide:eye'"
                :size="16"
              />
            </button>
          </div>
          <span v-if="currentPasswordError" class="input-error">{{ currentPasswordError }}</span>
        </div>

        <!-- New Password -->
        <div class="form-field">
          <div style="display: flex; flex-direction: row;">
            <Icon name="lucide:key" :size="16" class="input-icon" style="margin-right: 10px;" />
            <label class="label" for="new-password">{{ t('auth.new_password') }}</label>
          </div>
          <div class="input-wrap">
            <input
              id="new-password"
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="input input--with-icon input--with-suffix"
              :class="{ 'input--error': newPasswordError }"
              :placeholder="t('auth.new_password_placeholder')"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="input-suffix-btn"
              @click="showNewPassword = !showNewPassword"
            >
              <Icon
                :name="showNewPassword ? 'lucide:eye-off' : 'lucide:eye'"
                :size="16"
              />
            </button>
          </div>
          <span v-if="newPasswordError" class="input-error">{{ newPasswordError }}</span>
          <p class="text-xs text-muted mt-2">
            {{ t('auth.password_requirements') }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="form-field">
          <div style="display: flex; flex-direction: row;">
            <Icon name="lucide:check-circle" :size="16" class="input-icon" style="margin-right: 10px;" />
            <label class="label" for="confirm-password">{{ t('auth.confirm_password') }}</label>
          </div>
          <div class="input-wrap">
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="input input--with-icon input--with-suffix"
              :class="{ 'input--error': confirmPasswordError }"
              :placeholder="t('auth.confirm_password_placeholder')"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="input-suffix-btn"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'"
                :size="16"
              />
            </button>
          </div>
          <span v-if="confirmPasswordError" class="input-error">{{ confirmPasswordError }}</span>
        </div>

        <!-- Global Error -->
        <div v-if="globalError" class="login-error">
          <Icon name="lucide:triangle-alert" :size="14" />
          {{ globalError }}
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn btn--primary change-password-submit"
          :disabled="isLoading"
        >
          <Icon v-if="isLoading" name="lucide:loader-circle" :size="16" class="spin" />
          <Icon v-else name="lucide:check" :size="16" />
          {{ isLoading ? t('auth.changing_password') : t('auth.change_password_button') }}
        </button>
      </form>
    </div>

    <!-- Footer -->
    <p class="login-footer text-muted text-xs">
      {{ t('app.name') }} · {{ t('app.tagline') }}
    </p>
  </div>
</template>

<style scoped>
.change-password-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-6);
  background: var(--color-bg-base);
}

.change-password-card {
  width: 100%;
  max-width: 400px;
  margin-top: var(--space-6);
}

.change-password-card__title {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.change-password-card__subtitle {
  margin-bottom: var(--space-6);
}

.change-password-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-suffix-btn {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.input-suffix-btn:hover {
  color: var(--color-text-primary);
}

.change-password-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Brand styles */
.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.brand-logo {
  width: 48px;
  height: 48px;
}

.brand-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-text-primary);
  margin: 0;
}

.brand-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.login-footer {
  margin-top: var(--space-8);
  text-align: center;
}

/* Error styles */
.login-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: var(--font-size-sm);
}
</style>
