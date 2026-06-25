<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useTranslation()
const auth = useAuth()

// Form states
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const otpCode = ref('')

// Validation errors
const emailError = ref('')
const passwordError = ref('')
const otpError = ref('')

function validateEmail(value: string): string {
  if (!value) return t('auth.error_required_email')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('auth.error_invalid_email')
  return ''
}

function validatePassword(value: string): string {
  if (!value) return t('auth.error_required_password')
  return ''
}

function validateOtp(value: string): string {
  if (!value) return 'Verification code is required'
  if (!/^\d{6}$/.test(value)) return 'Please enter a 6-digit code'
  return ''
}

function onEmailBlur() {
  emailError.value = validateEmail(email.value)
}

function onPasswordBlur() {
  passwordError.value = validatePassword(password.value)
}

function onOtpBlur() {
  otpError.value = validateOtp(otpCode.value)
}

// Handle login with email/password
async function handleLogin() {
  emailError.value = validateEmail(email.value)
  passwordError.value = validatePassword(password.value)
  if (emailError.value || passwordError.value) return

  const result = await auth.login(email.value, password.value)
  if (!result.success) {
    emailError.value = result.error || t('auth.login_error')
  }
}

// Handle OTP verification
async function handleVerifyOtp() {
  otpError.value = validateOtp(otpCode.value)
  if (otpError.value) return

  const result = await auth.verifyOtpCode(otpCode.value)
  if (!result.success) {
    otpError.value = result.error || t('auth.verify_otp_error')
  }
}

// Handle resend OTP
async function handleResendOtp() {
  const result = await auth.resendOtpCode()
  // Show success message (could add a toast notification)
}

// Back to login
function handleBackToLogin() {
  auth.resetLoginState()
  otpCode.value = ''
  otpError.value = ''
}

// Clear errors when user types
watch(email, () => { emailError.value = '' })
watch(password, () => { passwordError.value = '' })
watch(otpCode, () => { otpError.value = '' })
watch(() => auth.error.value, (newError: string | null) => {
  if (newError) {
    if (auth.currentStep.value === 'credentials') {
      emailError.value = newError
    } else if (auth.currentStep.value === 'otp') {
      otpError.value = newError
    }
  }
})
</script>

<template>
  <div class="login-wrap">
    <!-- Brand -->
    <div class="login-brand">
      <div class="login-brand__badge">C4</div>
      <span class="login-brand__name">AXIS</span>
    </div>

    <!-- Card -->
    <div class="card card--pad login-card">
      <h1 class="login-card__title">{{ t('auth.sign_in') }}</h1>
      <p class="login-card__subtitle text-secondary text-sm">
        {{ t('auth.sign_in_subtitle') }}
      </p>

      <!-- Login Form -->
      <form v-if="auth.currentStep.value === 'credentials'" class="login-form" @submit.prevent="handleLogin" novalidate>
        <!-- Email -->
        <div class="form-field">
          <label class="label" for="email">{{ t('auth.email') }}</label>
          <div class="input-wrap">
            <Icon name="lucide:mail" :size="16" class="input-icon" />
            <input
              id="email"
              v-model="email"
              class="input input--with-icon"
              :class="{ 'input--error': emailError }"
              type="email"
              :placeholder="t('auth.email_placeholder')"
              autocomplete="email"
              @blur="onEmailBlur"
            />
          </div>
          <p v-if="emailError" class="field-error">
            <Icon name="lucide:alert-circle" :size="12" />
            {{ emailError }}
          </p>
        </div>

        <!-- Password -->
        <div class="form-field">
          <div class="label-row">
            <label class="label" for="password">{{ t('auth.password') }}</label>
            <a href="#" class="text-accent text-sm">{{ t('auth.forgot_password') }}</a>
          </div>
          <div class="input-wrap">
            <Icon name="lucide:lock" :size="16" class="input-icon" />
            <input
              id="password"
              v-model="password"
              class="input input--with-icon input--with-icon-right"
              :class="{ 'input--error': passwordError }"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('auth.password_placeholder')"
              autocomplete="current-password"
              @blur="onPasswordBlur"
            />
            <button
              type="button"
              class="input-icon-right"
              :aria-label="showPassword ? t('auth.hide_password') : t('auth.show_password')"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" :size="16" />
            </button>
          </div>
          <p v-if="passwordError" class="field-error">
            <Icon name="lucide:alert-circle" :size="12" />
            {{ passwordError }}
          </p>
        </div>

        <!-- Global error -->
        <div v-if="emailError && !emailError.includes('required')" class="login-error">
          <Icon name="lucide:triangle-alert" :size="14" />
          {{ emailError }}
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn btn--primary login-submit"
          :disabled="auth.isLoading.value"
        >
          <Icon v-if="auth.isLoading.value" name="lucide:loader-circle" :size="16" class="spin" />
          <Icon v-else name="lucide:log-in" :size="16" />
          {{ auth.isLoading.value ? t('auth.signing_in') : t('auth.sign_in') }}
        </button>
      </form>

      <!-- OTP Form -->
      <div v-else-if="auth.currentStep.value === 'otp'" class="otp-form">
        <h2 class="otp-form__title">{{ t('auth.otp_verification') }}</h2>
        <p class="otp-form__subtitle text-secondary text-sm">
          {{ t('auth.otp_subtitle') }}
        </p>

        <form @submit.prevent="handleVerifyOtp" novalidate>
          <!-- OTP Input -->
          <div class="form-field">
            <label class="label" for="otp">Verification Code</label>
            <div class="input-wrap">
              <Icon name="lucide:shield-check" :size="16" class="input-icon" />
              <input
                id="otp"
                v-model="otpCode"
                class="input input--with-icon"
                :class="{ 'input--error': otpError }"
                type="text"
                maxlength="6"
                :placeholder="t('auth.otp_placeholder')"
                autocomplete="one-time-code"
                @blur="onOtpBlur"
              />
            </div>
            <p v-if="otpError" class="field-error">
              <Icon name="lucide:alert-circle" :size="12" />
              {{ otpError }}
            </p>
          </div>

          <!-- Global error -->
          <div v-if="otpError && !otpError.includes('required')" class="login-error">
            <Icon name="lucide:triangle-alert" :size="14" />
            {{ otpError }}
          </div>

          <!-- Actions -->
          <div class="otp-actions">
            <button
              type="button"
              class="btn btn--secondary"
              @click="handleBackToLogin"
            >
              <Icon name="lucide:arrow-left" :size="16" />
              {{ t('auth.otp_back_to_login') }}
            </button>
            
            <button
              type="button"
              class="btn btn--ghost"
              :disabled="auth.isLoading.value || auth.resendCooldown.value > 0"
              @click="handleResendOtp"
            >
              <span v-if="auth.resendCooldown.value > 0">
                {{ t('auth.otp_resend_wait', { seconds: auth.resendCooldown.value.toString() }) }}
              </span>
              <span v-else-if="auth.isLoading.value">
                {{ t('auth.otp_resending') }}
              </span>
              <span v-else>
                {{ t('auth.otp_resend') }}
              </span>
            </button>
            
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="auth.isLoading.value || !otpCode"
            >
              <Icon v-if="auth.isLoading.value" name="lucide:loader-circle" :size="16" class="spin" />
              <Icon v-else name="lucide:check" :size="16" />
              {{ auth.isLoading.value ? t('auth.otp_verifying') : t('auth.otp_verify') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Footer -->
    <p class="login-footer text-muted text-xs">
      {{ t('app.name') }} · {{ t('app.tagline') }}
    </p>
  </div>
</template>

<style scoped>
.login-wrap {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-6);
}

/* Brand */
.login-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.login-brand__badge {
  width: 36px;
  height: 36px;
  background: var(--color-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.login-brand__name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-text-primary);
  text-transform: uppercase;
}

/* Card */
.login-card {
  width: 100%;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.login-card__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.login-card__subtitle {
  margin-top: calc(var(--space-1) * -1);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Input with icon */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
  flex-shrink: 0;
}
.input-icon-right {
  position: absolute;
  right: var(--space-3);
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color var(--transition-base);
}
.input-icon-right:hover {
  color: var(--color-text-primary);
}
.input--with-icon {
  padding-left: calc(var(--space-3) + 16px + var(--space-2));
}
.input--with-icon-right {
  padding-right: calc(var(--space-3) + 16px + var(--space-2));
}

/* Field error */
.field-error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

/* Global error banner */
.login-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-critical-bg);
  border: 1px solid var(--color-critical);
  border-radius: var(--radius-md);
  color: var(--color-critical);
  font-size: var(--font-size-sm);
}

/* Submit button */
.login-submit {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-2);
}

/* OTP Form */
.otp-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.otp-form__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.otp-form__subtitle {
  margin-top: calc(var(--space-1) * -1);
}

/* OTP Actions */
.otp-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.otp-actions .btn {
  width: 100%;
  justify-content: center;
  color: white
}

@media (min-width: 480px) {
  .otp-actions {
    flex-direction: column;
    gap: var(--space-2);
  }
  .otp-actions .btn:first-child {
    order: 2;
  }
  .otp-actions .btn:nth-child(2) {
    order: 3;
  }
  .otp-actions .btn:last-child {
    order: 1;
    margin-left: auto;
  }
}

/* Footer */
.login-footer {
  text-align: center;
}

/* Spinner animation */
.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
