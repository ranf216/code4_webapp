<script setup lang="ts">
import { settingsApi } from '~/api/settings'

const { t } = useTranslation()

const maxHoursPerDay = ref(8)
const saving = ref(false)
const isDirty = ref(false)

function markDirty() {
  isDirty.value = true
}

async function fetchSettings() {
  try {
    const response = await settingsApi.getWorkingHoursSettings()
    if (response.rc === 0) {
      maxHoursPerDay.value = response.max_hours_per_day
    }
  } catch (err) {
    console.error('Error fetching working hours settings:', err)
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
    const response = await settingsApi.updateWorkingHoursSettings(maxHoursPerDay.value)
    if (response.rc === 0) {
      isDirty.value = false
    } else {
      alert(response.message || 'Failed to save working hours settings')
    }
  } catch (err) {
    console.error('Error saving working hours settings:', err)
    alert('Failed to save working hours settings')
  } finally {
    saving.value = false
  }
}

async function handleReset() {
  await fetchSettings()
}
</script>

<template>
  <div class="working-hours-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ t('settings.working_hours.page_title') }}</h2>
        <p class="page-subtitle">{{ t('settings.working_hours.page_subtitle') }}</p>
      </div>
      <div class="header-actions">
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

    <div class="settings-card">
      <div class="card-header">
        <div class="card-icon">
          <Icon name="lucide:clock" :size="18" />
        </div>
        <div>
          <h3 class="card-title">{{ t('settings.working_hours.officers_title') }}</h3>
          <p class="card-desc">{{ t('settings.working_hours.officers_desc') }}</p>
        </div>
      </div>
      <div class="card-body">
        <div class="form-field">
          <label class="form-label">{{ t('settings.working_hours.max_hours_label') }}</label>
          <div class="input-row">
            <input
              v-model.number="maxHoursPerDay"
              type="number"
              min="1"
              max="24"
              class="form-input"
              @input="markDirty()"
            />
            <span class="input-unit">{{ t('settings.working_hours.hours_per_day') }}</span>
          </div>
          <p class="form-hint">{{ t('settings.working_hours.max_hours_hint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.working-hours-page { width: 100%; }

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

.input-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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
</style>
