<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Resident } from '~/types/resident'

const props = defineProps<{
  resident: Resident
  communityId: string
  communityName: string
}>()

const { t } = useTranslation()
const router = useRouter()

// Clone resident data for editing
const form = reactive({
  fullName: props.resident.fullName,
  mobile: props.resident.mobile,
  email: props.resident.email,
  address: props.resident.address,
  communicationTest: props.resident.communicationTest,
  active: props.resident.active,
})

const isSubmitting = ref(false)
const errors = reactive<Record<string, string>>({})

function validate(): boolean {
  errors.fullName = !form.fullName.trim() ? t('validation.required') : ''
  errors.mobile = !form.mobile.trim() ? t('validation.required') : ''
  errors.email = !form.email.trim() ? t('validation.required') : ''
  errors.address = !form.address.trim() ? t('validation.required') : ''

  return !errors.fullName && !errors.mobile && !errors.email && !errors.address
}

function handleCancel() {
  router.push(`/communities/${props.communityId}/residents`)
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  // Simulate API call
  await new Promise(r => setTimeout(r, 500))
  isSubmitting.value = false

  // Navigate back to residents list
  router.push(`/communities/${props.communityId}/residents`)
}
</script>

<template>
  <div class="edit-resident-form">
    <!-- Header -->
    <div class="form-header">
      <h2 class="form-title">{{ t('residents.edit_title') }}</h2>
      <div class="form-actions">
        <AppButton :text="t('common.cancel')" type="secondary" @click="handleCancel" />
        <AppButton
          :text="t('common.save')"
          type="primary"
          icon="lucide:save"
          :disabled="isSubmitting"
          @click="handleSubmit"
        />
      </div>
    </div>

    <!-- Form -->
    <div class="form-body">
      <!-- Left Column: Basic Information -->
      <div class="form-column form-column--left">
        <div class="form-section">
          <h3 class="section-title">{{ t('residents.basic_info') }}</h3>

          <div class="form-field">
            <label class="field-label">
              {{ t('residents.full_name') }}
              <span class="required">*</span>
            </label>
            <input
              v-model="form.fullName"
              type="text"
              class="field-input"
              :placeholder="t('residents.full_name_placeholder')"
              :class="{ error: errors.fullName }"
            />
            <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">
              {{ t('residents.mobile') }}
              <span class="required">*</span>
            </label>
            <input
              v-model="form.mobile"
              type="tel"
              class="field-input"
              :placeholder="t('residents.mobile_placeholder')"
              :class="{ error: errors.mobile }"
            />
            <span v-if="errors.mobile" class="error-message">{{ errors.mobile }}</span>
            <span class="field-hint warning">{{ t('residents.mobile_change_warning') }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">
              {{ t('residents.email') }}
              <span class="required">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              class="field-input"
              :placeholder="t('residents.email_placeholder')"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">
              {{ t('residents.address') }}
              <span class="required">*</span>
            </label>
            <input
              v-model="form.address"
              type="text"
              class="field-input"
              :placeholder="t('residents.address_placeholder')"
              :class="{ error: errors.address }"
            />
            <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Settings, Vehicle Numbers (readonly), Info -->
      <div class="form-column form-column--right">
        <div class="form-section">
          <h3 class="section-title">{{ t('residents.settings') }}</h3>

          <div class="form-field">
            <label class="checkbox-label">
              <input v-model="form.communicationTest" type="checkbox" />
              <span>{{ t('residents.enable_communication_test') }}</span>
            </label>
            <span class="field-hint">{{ t('residents.communication_test_hint') }}</span>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">{{ t('residents.vehicle_numbers') }}</h3>

          <div class="form-field">
            <div v-if="resident.vehicleNumbers.length" class="vehicle-tags readonly">
              <span v-for="(vehicle, index) in resident.vehicleNumbers" :key="index" class="vehicle-tag">
                {{ vehicle }}
              </span>
            </div>
            <p v-else class="no-vehicles">{{ t('residents.no_vehicles') }}</p>
            <span class="field-hint">{{ t('residents.vehicle_readonly_hint') }}</span>
          </div>
        </div>

        <div class="form-section form-section--info">
          <div class="info-row">
            <span class="info-label">{{ t('residents.community') }}:</span>
            <span class="info-value">{{ communityName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('residents.status') }}:</span>
            <label class="status-toggle">
              <input v-model="form.active" type="checkbox" />
              <Badge type="status" :value="form.active ? 'active' : 'inactive'" />
            </label>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('residents.registration_date') }}:</span>
            <span class="info-value readonly">{{ resident.registrationDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-resident-form {
  width: 100%;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.form-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
}

.form-body {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: var(--space-6);
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .form-body {
    grid-template-columns: 1fr;
  }
}

.form-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.form-section--info {
  background: var(--color-bg-elevated);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4) 0;
}

.form-field {
  margin-bottom: var(--space-4);
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.required {
  color: var(--color-critical);
  margin-left: var(--space-1);
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}

.field-input:focus {
  border-color: var(--color-accent);
}

.field-input.error {
  border-color: var(--color-critical);
}

.error-message {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-critical);
  margin-top: var(--space-1);
}

.field-hint {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.field-hint.warning {
  color: var(--color-warning, #f59e0b);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}

.vehicle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.vehicle-tags.readonly {
  opacity: 0.8;
}

.vehicle-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.no-vehicles {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  min-width: 140px;
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
}

.info-value.readonly {
  color: var(--color-text-muted);
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.status-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}
</style>
