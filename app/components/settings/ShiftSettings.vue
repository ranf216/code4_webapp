<script setup lang="ts">
import { shiftApi } from '~/api/shift'

const { t } = useTranslation()

const maxWeeklyHours = ref(48)
const minRestGapHours = ref(8)
const autoCheckoutGraceMins = ref(60)
const shiftStartingSoonLeadMins = ref(30)
const earlyCheckinWindowMins = ref(30)

const saving = ref(false)
const isDirty = ref(false)
const showRestoreModal = ref(false)

const SHIFT_DEFAULTS = {
  max_weekly_hours: 48,
  min_rest_gap_hours: 8,
  auto_checkout_grace_mins: 60,
  shift_starting_soon_lead_mins: 30,
  early_checkin_window_mins: 30,
}

function markDirty() {
  isDirty.value = true
}

function applySettings(s: typeof SHIFT_DEFAULTS) {
  maxWeeklyHours.value = s.max_weekly_hours
  minRestGapHours.value = s.min_rest_gap_hours
  autoCheckoutGraceMins.value = s.auto_checkout_grace_mins
  shiftStartingSoonLeadMins.value = s.shift_starting_soon_lead_mins
  earlyCheckinWindowMins.value = s.early_checkin_window_mins
}

async function fetchSettings() {
  try {
    const response = await shiftApi.getShiftSettings()
    if (response.rc === 0) {
      applySettings(response.settings ?? response)
    }
  } catch (err) {
    console.error('Error fetching shift settings:', err)
  } finally {
    isDirty.value = false
  }
}

onMounted(() => {
  fetchSettings()
})

async function handleSave() {
  try {
    saving.value = true
    const response = await shiftApi.updateShiftSettings({
      max_weekly_hours: maxWeeklyHours.value,
      min_rest_gap_hours: minRestGapHours.value,
      auto_checkout_grace_mins: autoCheckoutGraceMins.value,
      shift_starting_soon_lead_mins: shiftStartingSoonLeadMins.value,
      early_checkin_window_mins: earlyCheckinWindowMins.value,
    })
    if (response.rc === 0) {
      isDirty.value = false
    } else {
      alert(response.message || 'Failed to save shift settings')
    }
  } catch (err) {
    console.error('Error saving shift settings:', err)
    alert('Failed to save shift settings')
  } finally {
    saving.value = false
  }
}

async function handleReset() {
  await fetchSettings()
}

async function handleRestoreDefaults() {
  try {
    saving.value = true
    const response = await shiftApi.updateShiftSettings(SHIFT_DEFAULTS)
    if (response.rc === 0) {
      applySettings(SHIFT_DEFAULTS)
      isDirty.value = false
    } else {
      alert(response.message || 'Failed to restore defaults')
    }
  } catch (err) {
    console.error('Error restoring shift defaults:', err)
    alert('Failed to restore defaults')
  } finally {
    saving.value = false
    showRestoreModal.value = false
  }
}
</script>

<template>
  <div class="shift-settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ t('settings.shift.page_title') }}</h2>
        <p class="page-subtitle">{{ t('settings.shift.page_subtitle') }}</p>
      </div>
      <div class="header-actions">
        <AppButton
          :text="t('settings.shift.restore_defaults')"
          type="ghost"
          size="sm"
          :disabled="saving"
          @click="showRestoreModal = true"
        />
        <AppButton
          v-if="isDirty"
          :text="t('common.reset')"
          type="ghost"
          size="sm"
          :disabled="saving"
          @click="handleReset"
        />
        <AppButton
          :text="saving ? t('common.saving') : t('common.save_changes')"
          type="primary"
          size="sm"
          :disabled="saving || !isDirty"
          @click="handleSave"
        />
      </div>
    </div>

    <div class="settings-columns">
      <!-- Left column: allocation limits -->
      <div class="col-left">
        <div class="settings-card">
          <div class="card-body">
            <div class="form-field">
              <label class="form-label">{{ t('settings.shift.max_weekly_hours_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="maxWeeklyHours" type="number" min="1" max="168" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.shift.hours') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.shift.max_weekly_hours_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.shift.min_rest_gap_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="minRestGapHours" type="number" min="0" max="72" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.shift.hours') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.shift.min_rest_gap_hint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: check-in & reminders -->
      <div class="col-right">
        <div class="settings-card">
          <div class="card-body">
            <div class="form-field">
              <label class="form-label">{{ t('settings.shift.early_checkin_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="earlyCheckinWindowMins" type="number" min="0" max="240" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.minutes') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.shift.early_checkin_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.shift.starting_soon_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="shiftStartingSoonLeadMins" type="number" min="0" max="240" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.minutes') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.shift.starting_soon_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.shift.auto_checkout_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="autoCheckoutGraceMins" type="number" min="0" max="480" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.minutes') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.shift.auto_checkout_hint') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Restore Defaults Modal -->
  <AppDialogModal
    :show="showRestoreModal"
    :title="t('settings.shift.restore_defaults_title')"
    max-width="420px"
    @close="showRestoreModal = false"
  >
    <div class="restore-modal-body">
      <Icon name="lucide:rotate-ccw" :size="20" class="restore-modal-icon" />
      <p>{{ t('settings.shift.restore_defaults_confirm') }}</p>
    </div>
    <template #footer>
      <AppButton
        :text="t('common.cancel')"
        type="ghost"
        size="sm"
        :disabled="saving"
        @click="showRestoreModal = false"
      />
      <AppButton
        :text="saving ? t('common.saving') : t('settings.shift.restore_defaults')"
        type="danger"
        size="sm"
        :disabled="saving"
        @click="handleRestoreDefaults"
      />
    </template>
  </AppDialogModal>
</template>

<style scoped>
.shift-settings-page { width: 100%; }

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

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.settings-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  align-items: start;
}

.col-left,
.col-right {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.settings-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
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

.input-with-unit {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  width: 100px;
}

.form-input:focus { outline: none; border-color: var(--color-accent); }

.input-unit {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.restore-modal-body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.restore-modal-body p {
  margin: 0;
}

.restore-modal-icon {
  color: var(--color-warn, #f59e0b);
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
