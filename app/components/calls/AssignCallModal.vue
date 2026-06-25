<script setup lang="ts">
interface CallCategory {
  type: 'medical' | 'security' | 'concierge' | 'test'
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
  category: CallCategory
  serviceType: ServiceType
  residentName: string
  communityName: string
  address: string
  scheduledDateTime?: string | null
  officerName?: string | null
  status: 'new' | 'accepted' | 'done' | 'canceled'
}

interface Officer {
  id: string
  name: string
}

const props = defineProps<{
  show: boolean
  call: Call | null
}>()

const emit = defineEmits<{
  close: []
  assign: [data: { officerId: string; officerName: string; scheduleDate: string; scheduleTime: string }]
}>()

const { t } = useTranslation()

// Mock officers for the community
const officers = ref<Officer[]>([
  { id: 'off-001', name: 'Dr. Michael Chen' },
  { id: 'off-002', name: 'Officer James Martinez' },
  { id: 'off-003', name: 'Technician Lisa Park' },
  { id: 'off-004', name: 'Security Guard Tom Wilson' },
])

// Form state
const selectedOfficer = ref<string>('')
const scheduleDate = ref<string>('')
const scheduleTime = ref<string>('')

// Reset form when modal opens
watch(() => props.show, (show) => {
  if (show) {
    selectedOfficer.value = ''
    scheduleDate.value = ''
    scheduleTime.value = ''
  }
})

const selectedOfficerName = computed(() => {
  const officer = officers.value.find(o => o.id === selectedOfficer.value)
  return officer?.name || ''
})

const canSubmit = computed(() => {
  return selectedOfficer.value && scheduleDate.value && scheduleTime.value
})

function handleClose() {
  emit('close')
}

function handleAssign() {
  if (!canSubmit.value) return

  emit('assign', {
    officerId: selectedOfficer.value,
    officerName: selectedOfficerName.value,
    scheduleDate: scheduleDate.value,
    scheduleTime: scheduleTime.value,
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
            <select v-model="selectedOfficer" class="field-select">
              <option value="">{{ t('calls.select_officer') }}</option>
              <option v-for="officer in officers" :key="officer.id" :value="officer.id">
                {{ officer.name }}
              </option>
            </select>
            <p v-if="selectedOfficerName" class="selected-officer">
              {{ t('calls.selected') }}: <strong>{{ selectedOfficerName }}</strong>
            </p>
          </div>

          <!-- Schedule Date -->
          <div class="form-field">
            <label class="field-label">{{ t('calls.schedule_date') }} <span class="required">*</span></label>
            <input v-model="scheduleDate" type="date" class="field-input" />
          </div>

          <!-- Schedule Time -->
          <div class="form-field">
            <label class="field-label">{{ t('calls.schedule_time') }} <span class="required">*</span></label>
            <input v-model="scheduleTime" type="time" class="field-input" />
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
