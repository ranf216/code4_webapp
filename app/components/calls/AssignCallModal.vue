<script setup lang="ts">
import { officerApi } from '~/api/officer'
import type { Officer } from '~/api/types/officer'

interface CallCategory {
  type: 'medical' | 'security' | 'panic' | 'concierge' | 'test'
  label: string
  icon: string
  color: string
}

interface ServiceType {
  name: string
  icon: string
}

interface Call {
  id: string
  communityId: number
  category: CallCategory
  serviceType: ServiceType
  residentName: string
  communityName: string
  address: string
  scheduledDateTime?: string | null
  officerName?: string | null
  status: 'new' | 'accepted' | 'done' | 'canceled'
}

const props = defineProps<{
  show: boolean
  call: Call | null
}>()

const emit = defineEmits<{
  close: []
  assign: [data: { officerId: string; officerName: string }]
}>()

const { t } = useTranslation()

const officers = ref<Officer[]>([])
const officersLoading = ref(false)
const officersError = ref('')

// Form state
const selectedOfficer = ref<string>('')

// Fetch officers when modal opens
watch(() => props.show, async (show) => {
  if (show && props.call) {
    selectedOfficer.value = ''
    officersLoading.value = true
    officersError.value = ''
    try {
      const res = await officerApi.getOfficers({
        community_id: props.call.communityId,
        include_inactive: false,
      })
      officers.value = res.officers
    } catch (err: any) {
      officersError.value = err.message || 'Failed to load officers'
    } finally {
      officersLoading.value = false
    }
  }
})

const selectedOfficerName = computed(() => {
  const officer = officers.value.find(o => o.user_id === selectedOfficer.value)
  return officer ? `${officer.first_name} ${officer.last_name}`.trim() : ''
})

const canSubmit = computed(() => {
  return !!selectedOfficer.value
})

function handleClose() {
  emit('close')
}

function handleAssign() {
  if (!canSubmit.value) return

  emit('assign', {
    officerId: selectedOfficer.value,
    officerName: selectedOfficerName.value,
  })
}
</script>

<template>
  <AppModal
    :show="show"
    :title="t('calls.assign_title')"
    :cancel-text="t('common.cancel')"
    :ok-text="t('calls.assign_button')"
    max-width="400px"
    @close="handleClose"
    @cancel="handleClose"
    @ok="handleAssign"
  >
    <template #default>
      <div v-if="call" class="assign-call-modal">
        <!-- Call Summary -->
        <div class="call-summary">
          <div class="category-badge" :style="{ backgroundColor: call.category.color + '20', color: call.category.color }">
            <Icon :name="call.category.icon" :size="18" />
            <span>{{ call.category.label }}</span>
          </div>
          <div class="service-type">
            <Icon :name="call.serviceType.icon" :size="14" />
            <span>{{ call.serviceType.name }}</span>
          </div>
        </div>

        <!-- Resident Info -->
        <div class="info-section">
          <div class="info-row">
            <label>{{ t('calls.resident') }}:</label>
            <span>{{ call.residentName }}</span>
          </div>
          <div class="info-row">
            <label>{{ t('calls.community') }}:</label>
            <span>{{ call.communityName }}</span>
          </div>
          <div class="info-row">
            <label>{{ t('calls.address') }}:</label>
            <span>{{ call.address }}</span>
          </div>
        </div>

        <!-- Assignment Form -->
        <div class="form-section">
          <h4 class="form-title">{{ t('calls.assign_form_title') }}</h4>

          <!-- Officer Selection -->
          <div class="form-field">
            <label class="field-label">{{ t('calls.officer') }} <span class="required">*</span></label>
            <div v-if="officersLoading" class="field-loading">Loading officers...</div>
            <div v-else-if="officersError" class="field-error">{{ officersError }}</div>
            <select v-else v-model="selectedOfficer" class="field-select">
              <option value="">{{ t('calls.select_officer') }}</option>
              <option v-for="officer in officers" :key="officer.user_id" :value="officer.user_id">
                {{ officer.first_name }} {{ officer.last_name }}
              </option>
            </select>
            <p v-if="selectedOfficerName" class="selected-officer">
              {{ t('calls.selected') }}: <strong>{{ selectedOfficerName }}</strong>
            </p>
          </div>
        </div>

        <!-- Note -->
        <div class="note-section">
          <Icon name="lucide:info" :size="14" />
          <span>{{ t('calls.assign_note') }}</span>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.assign-call-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Call Summary */
.call-summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.category-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.service-type {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  background: var(--color-surface);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.info-row {
  display: flex;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.info-row label {
  color: var(--color-text-secondary);
  min-width: 80px;
}

.info-row span {
  color: var(--color-text-primary);
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.required {
  color: #ef4444;
}

.field-select,
.field-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.field-select:focus,
.field-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.field-loading,
.field-error {
  padding: var(--space-2) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.field-error {
  color: #ef4444;
}

.selected-officer {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
}

.selected-officer strong {
  color: var(--color-text-primary);
}

/* Note Section */
.note-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.note-section :deep(svg) {
  color: var(--color-accent);
  flex-shrink: 0;
}
</style>
