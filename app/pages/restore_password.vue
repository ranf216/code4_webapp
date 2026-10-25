<script setup lang="ts">
import { userApi } from '~/api/user'

definePageMeta({ layout: 'auth' })

const { t, lang } = useTranslation()
const route = useRoute()
const password = ref('')
const confirmation = ref('')
const showPassword = ref(false)
const isSaving = ref(false)
const error = ref('')
const userId = computed(() => typeof route.query.userid === 'string' ? route.query.userid.trim() : '')
const activationCode = computed(() => typeof route.query.activation === 'string' ? route.query.activation.trim() : '')
const validLink = computed(() => !!userId.value && !!activationCode.value)

async function resetPassword() {
  if (isSaving.value || !validLink.value) return
  error.value = ''
  if (!password.value) {
    error.value = t('auth.error_required_password')
    return
  }
  if (password.value !== confirmation.value) {
    error.value = t('auth.reset_password_mismatch')
    return
  }
  isSaving.value = true
  try {
    const response = await userApi.resetPassword({
      user_id: userId.value,
      activation_code: activationCode.value,
      password: password.value,
      language: lang.value,
    }, { showLoading: false })
    if (response.rc === 0) await navigateTo('/login', { replace: true })
    else error.value = response.message || t('auth.reset_password_error')
  } catch (cause: unknown) {
    error.value = cause instanceof Error ? cause.message : t('auth.reset_password_error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="reset-wrap">
    <div class="reset-brand">
      <div class="reset-brand__badge">C4</div>
      <span class="reset-brand__name">AXIS</span>
    </div>
    <div class="card card--pad reset-card">
      <h1 class="reset-title">{{ t('auth.reset_password_title') }}</h1>
      <p class="text-secondary text-sm">{{ t('auth.reset_password_subtitle') }}</p>
      <p v-if="!validLink" class="reset-error" role="alert">{{ t('auth.reset_password_invalid_link') }}</p>
      <form v-else class="reset-form" novalidate @submit.prevent="resetPassword">
        <div class="form-field">
          <label class="label" for="new-password">{{ t('auth.reset_new_password') }}</label>
          <input id="new-password" v-model="password" class="input" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" :disabled="isSaving" required>
        </div>
        <div class="form-field">
          <label class="label" for="confirm-password">{{ t('auth.reset_confirm_password') }}</label>
          <input id="confirm-password" v-model="confirmation" class="input" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" :disabled="isSaving" required>
        </div>
        <label class="password-toggle text-secondary text-sm">
          <input v-model="showPassword" type="checkbox">
          {{ t('auth.reset_show_password') }}
        </label>
        <p v-if="error" class="reset-error" role="alert">{{ error }}</p>
        <button class="btn btn--primary" type="submit" :disabled="isSaving">
          <Icon v-if="isSaving" name="lucide:loader-circle" :size="16" class="spin" />
          {{ t('auth.reset_password_title') }}
        </button>
      </form>
      <NuxtLink to="/login" class="text-accent text-sm">{{ t('auth.reset_back_to_login') }}</NuxtLink>
    </div>
    <p class="text-muted text-xs">{{ t('app.name') }} · {{ t('app.tagline') }}</p>
  </div>
</template>

<style scoped>
.reset-wrap {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-6);
}
.reset-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.reset-brand__badge {
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
}
.reset-brand__name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-text-primary);
}
.reset-card {
  width: 100%;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.reset-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.reset-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.password-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.reset-error {
  color: var(--color-critical);
  font-size: var(--font-size-sm);
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
