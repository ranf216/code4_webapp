<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { residentApi } from '~/api/resident'
import { ApiError } from '~/api/base'
import LoadingModal from '~/components/LoadingModal.vue'
import { useToastStore } from '~/stores/toast'

const props = defineProps<{
  show: boolean
  communityId: string
  communityName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted'): void
}>()

const { t } = useTranslation()
const toastStore = useToastStore()

const form = reactive({
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  address: '',
  instructions: '',
  communicationTest: false,
  vehicleNumbers: [] as string[],
  communityId: Number(props.communityId) || 0,
})

const isSubmitting = ref(false)
const submitError = ref('')
const errors = reactive<Record<string, string>>({})

const isFormValid = computed(() =>
  !!form.firstName.trim() && !!form.mobile.trim() && form.communityId > 0
)

const newVehicle = ref('')

function addVehicle() {
  if (newVehicle.value.trim()) {
    form.vehicleNumbers.push(newVehicle.value.trim())
    newVehicle.value = ''
  }
}

function removeVehicle(index: number) {
  form.vehicleNumbers.splice(index, 1)
}

function validate(): boolean {
  const phonePattern = /^\+?[\d\s().-]{7,}$/
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  errors.firstName = !form.firstName.trim() ? t('validation.required') : ''
  errors.mobile = !form.mobile.trim()
    ? t('validation.required')
    : !phonePattern.test(form.mobile.trim()) ? t('residents.invalid_mobile') : ''
  errors.email = form.email.trim() && !emailPattern.test(form.email.trim())
    ? t('residents.invalid_email')
    : ''
  errors.communityId = form.communityId <= 0 ? t('validation.required') : ''

  return !errors.firstName && !errors.mobile && !errors.email && !errors.communityId
}

function handleSubmitError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.rc === 224 || error.rc === 241) errors.mobile = t(error.rc === 224 ? 'residents.invalid_mobile' : 'residents.mobile_exists')
    else if (error.rc === 235 || error.rc === 240) errors.email = t(error.rc === 235 ? 'residents.invalid_email' : 'residents.email_exists')
    else if (error.rc === 500 || error.rc === 505) errors.communityId = t(error.rc === 500 ? 'residents.community_not_found' : 'residents.community_inactive')
    else submitError.value = error.message
    return
  }
  submitError.value = t('residents.create_failed')
}

function resetForm() {
  form.firstName = ''
  form.lastName = ''
  form.mobile = ''
  form.email = ''
  form.address = ''
  form.instructions = ''
  form.communicationTest = false
  form.vehicleNumbers = []
  form.communityId = Number(props.communityId) || 0
  newVehicle.value = ''
  submitError.value = ''
  Object.keys(errors).forEach((key) => { errors[key] = '' })
}

function handleCancel() {
  emit('close')
}

async function handleSubmit() {
  if (!validate()) return

  addVehicle()
  isSubmitting.value = true
  submitError.value = ''
  try {
    await residentApi.addResident({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim() || undefined,
      phone_num: form.mobile.trim(),
      email: form.email.trim() || undefined,
      community_id: form.communityId,
      address: form.address.trim() || undefined,
      vehicles: form.vehicleNumbers,
      instructions: form.instructions.trim() || undefined,
      communication_test: form.communicationTest,
    }, { showLoading: false })
    toastStore.success(t('residents.create_success'))
    emit('submitted')
    emit('close')
  } catch (error) {
    handleSubmitError(error)
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.show, (show: boolean) => {
  if (show) resetForm()
})
</script>

<template>
  <AppDialogModal :show="show" :title="t('residents.add_title')" max-width="900px" @close="handleCancel">
    <div class="add-resident-form">
      <LoadingModal :show="isSubmitting" :message="t('common.loading')" />

      <div class="form-body">
      <!-- Left Column: Basic Information -->
      <div class="form-column form-column--left">
        <div class="form-section">
          <h3 class="section-title">{{ t('residents.basic_info') }}</h3>

          <div class="form-field">
            <span class="field-label">{{ t('residents.community') }}</span>
            <span class="field-value">{{ communityName }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">
              {{ t('residents.first_name') }}
              <span class="required">*</span>
            </label>
            <input
              v-model="form.firstName"
              type="text"
              class="field-input input-standard"
              :placeholder="t('residents.first_name_placeholder')"
              :class="{ error: errors.firstName }"
            />
            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">{{ t('residents.last_name') }}</label>
            <input
              v-model="form.lastName"
              type="text"
              class="field-input input-standard"
              :placeholder="t('residents.last_name_placeholder')"
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              {{ t('residents.mobile') }}
              <span class="required">*</span>
            </label>
            <input
              v-model="form.mobile"
              type="tel"
              class="field-input input-standard"
              :placeholder="t('residents.mobile_placeholder')"
              :class="{ error: errors.mobile }"
            />
            <span v-if="errors.mobile" class="error-message">{{ errors.mobile }}</span>
            <span class="field-hint">{{ t('residents.mobile_hint') }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">{{ t('residents.email') }}</label>
            <input
              v-model="form.email"
              type="email"
              class="field-input input-standard"
              :placeholder="t('residents.email_placeholder')"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">{{ t('residents.address') }}</label>
            <input
              v-model="form.address"
              type="text"
              class="field-input input-standard"
              :placeholder="t('residents.address_placeholder')"
              :class="{ error: errors.address }"
            />
            <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Settings, Vehicle Numbers, Info -->
      <div class="form-column form-column--right">
        <div class="form-section">
          <h3 class="section-title">{{ t('residents.settings') }}</h3>

          <div class="form-field">
            <label class="field-label">{{ t('residents.instructions') }}</label>
            <textarea
              v-model="form.instructions"
              class="field-input field-input--textarea input-standard"
              :placeholder="t('residents.instructions_placeholder')"
            />
          </div>

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
            <div class="vehicle-input">
              <input
                v-model="newVehicle"
                type="text"
                class="field-input input-standard"
                :placeholder="t('residents.vehicle_placeholder')"
                @keyup.enter="addVehicle"
              />
              <AppButton
                :text="t('common.add')"
                type="secondary"
                icon="lucide:plus"
                @click="addVehicle"
              />
            </div>
            <span class="field-hint">{{ t('residents.vehicle_hint') }}</span>

            <div v-if="form.vehicleNumbers.length" class="vehicle-tags">
              <span v-for="(vehicle, index) in form.vehicleNumbers" :key="index" class="vehicle-tag">
                {{ vehicle }}
                <button type="button" class="remove-btn" @click="removeVehicle(index)">
                  <Icon name="lucide:x" :size="12" />
                </button>
              </span>
            </div>
          </div>
        </div>

        <div class="form-section form-section--info">
          <div class="info-row">
            <span class="info-label">{{ t('residents.community') }}:</span>
            <span class="info-value">{{ communityName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('residents.status') }}:</span>
            <Badge type="status" value="active" />
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('residents.registration_date') }}:</span>
            <span class="info-value">{{ new Date().toISOString().split('T')[0] }}</span>
          </div>
        </div>
      </div>
      </div>
      <p v-if="submitError" class="submit-error">{{ submitError }}</p>
    </div>

    <template #footer>
      <AppButton :text="t('common.cancel')" type="secondary" :disabled="isSubmitting" @click="handleCancel" />
      <AppButton
        :text="isSubmitting ? t('common.saving') : t('common.save')"
        type="primary"
        icon="lucide:save"
        :disabled="isSubmitting || !isFormValid"
        @click="handleSubmit"
      />
    </template>
  </AppDialogModal>
</template>

<style scoped>
.add-resident-form {
  width: 100%;
}

.field-value {
  display: block;
  min-height: 44px;
  padding: 12px var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
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
  padding: 0 var(--space-4);
}

.field-input--textarea {
  height: auto;
  min-height: 100px;
  padding: var(--space-3) var(--space-4);
  resize: vertical;
}

.submit-error {
  margin: 0;
  color: var(--color-critical);
  font-size: var(--font-size-sm);
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

.vehicle-input {
  display: flex;
  gap: var(--space-2);
}

.vehicle-input .field-input {
  flex: 1;
}

.vehicle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.vehicle-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-base);
}

.remove-btn:hover {
  color: var(--color-critical);
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
</style>
