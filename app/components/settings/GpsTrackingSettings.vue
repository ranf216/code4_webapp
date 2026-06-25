<script setup lang="ts">
import { settingsApi } from '~/api/settings'

const { t } = useTranslation()

const gpsIntervalNormal = ref(30)
const gpsIntervalEmergency = ref(10)
const gpsStaleThreshold = ref(2)
const locationHistoryRetention = ref(90)
const mapRefreshInterval = ref(30)
const patrolComplianceThreshold = ref(15)
const emergencyEtaInterval = ref(60)
const mapProvider = ref('google_maps')

const saving = ref(false)
const isDirty = ref(false)
const showRestoreModal = ref(false)

const GPS_DEFAULTS = {
  gps_interval_normal: 30,
  gps_interval_emergency: 10,
  gps_stale_threshold: 2,
  location_history_retention: 90,
  map_refresh_interval: 30,
  patrol_compliance_threshold: 15,
  emergency_eta_interval: 60,
  map_provider: 'google_maps',
}

const mapProviderOptions = [
  { value: 'google_maps', label: 'Google Maps' },
]

function markDirty() {
  isDirty.value = true
}

async function fetchSettings() {
  try {
    const response = await settingsApi.getGpsSettings()
    if (response.rc === 0) {
      gpsIntervalNormal.value = response.gps_interval_normal
      gpsIntervalEmergency.value = response.gps_interval_emergency
      gpsStaleThreshold.value = response.gps_stale_threshold
      locationHistoryRetention.value = response.location_history_retention
      mapRefreshInterval.value = response.map_refresh_interval
      patrolComplianceThreshold.value = response.patrol_compliance_threshold
      emergencyEtaInterval.value = response.emergency_eta_interval
      mapProvider.value = response.map_provider
    }
  } catch (err) {
    console.error('Error fetching GPS settings:', err)
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
    const response = await settingsApi.updateGpsSettings({
      gps_interval_normal: gpsIntervalNormal.value,
      gps_interval_emergency: gpsIntervalEmergency.value,
      gps_stale_threshold: gpsStaleThreshold.value,
      location_history_retention: locationHistoryRetention.value,
      map_refresh_interval: mapRefreshInterval.value,
      patrol_compliance_threshold: patrolComplianceThreshold.value,
      emergency_eta_interval: emergencyEtaInterval.value,
      map_provider: mapProvider.value,
    })
    if (response.rc === 0) {
      isDirty.value = false
    } else {
      alert(response.message || 'Failed to save GPS settings')
    }
  } catch (err) {
    console.error('Error saving GPS settings:', err)
    alert('Failed to save GPS settings')
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
    const response = await settingsApi.updateGpsSettings(GPS_DEFAULTS)
    if (response.rc === 0) {
      gpsIntervalNormal.value = GPS_DEFAULTS.gps_interval_normal
      gpsIntervalEmergency.value = GPS_DEFAULTS.gps_interval_emergency
      gpsStaleThreshold.value = GPS_DEFAULTS.gps_stale_threshold
      locationHistoryRetention.value = GPS_DEFAULTS.location_history_retention
      mapRefreshInterval.value = GPS_DEFAULTS.map_refresh_interval
      patrolComplianceThreshold.value = GPS_DEFAULTS.patrol_compliance_threshold
      emergencyEtaInterval.value = GPS_DEFAULTS.emergency_eta_interval
      mapProvider.value = GPS_DEFAULTS.map_provider
      isDirty.value = false
    } else {
      alert(response.message || 'Failed to restore defaults')
    }
  } catch (err) {
    console.error('Error restoring GPS defaults:', err)
    alert('Failed to restore defaults')
  } finally {
    saving.value = false
    showRestoreModal.value = false
  }
}
</script>

<template>
  <div class="gps-settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ t('settings.gps.page_title') }}</h2>
        <p class="page-subtitle">{{ t('settings.gps.page_subtitle') }}</p>
      </div>
      <div class="header-actions">
        <AppButton
          :text="t('settings.gps.restore_defaults')"
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
      <!-- Left column: GPS fields -->
      <div class="col-left">
        <div class="settings-card">
          <div class="card-body">
            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.interval_normal_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="gpsIntervalNormal" type="number" min="10" max="120" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.seconds') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.gps.interval_normal_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.interval_emergency_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="gpsIntervalEmergency" type="number" min="5" max="30" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.seconds') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.gps.interval_emergency_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.stale_threshold_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="gpsStaleThreshold" type="number" min="1" max="60" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.minutes') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.gps.stale_threshold_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.history_retention_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="locationHistoryRetention" type="number" min="1" max="365" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.days') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.gps.history_retention_hint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: remaining fields -->
      <div class="col-right">
        <div class="settings-card">
          <div class="card-body">
            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.map_refresh_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="mapRefreshInterval" type="number" min="5" max="300" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.seconds') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.gps.map_refresh_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.compliance_threshold_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="patrolComplianceThreshold" type="number" min="1" max="120" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.minutes') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.gps.compliance_threshold_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.eta_interval_label') }}</label>
              <div class="input-with-unit">
                <input v-model.number="emergencyEtaInterval" type="number" min="10" max="300" class="form-input" @input="markDirty()" />
                <span class="input-unit">{{ t('settings.gps.seconds') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.gps.eta_interval_hint') }}</p>
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('settings.gps.map_provider_label') }}</label>
              <select v-model="mapProvider" class="form-select" @change="markDirty()">
                <option v-for="opt in mapProviderOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Restore Defaults Modal -->
  <AppDialogModal
    :show="showRestoreModal"
    :title="t('settings.gps.restore_defaults_title')"
    max-width="420px"
    @close="showRestoreModal = false"
  >
    <div class="restore-modal-body">
      <Icon name="lucide:rotate-ccw" :size="20" class="restore-modal-icon" />
      <p>{{ t('settings.gps.restore_defaults_confirm') }}</p>
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
        :text="saving ? t('common.saving') : t('settings.gps.restore_defaults')"
        type="danger"
        size="sm"
        :disabled="saving"
        @click="handleRestoreDefaults"
      />
    </template>
  </AppDialogModal>
</template>

<style scoped>
.gps-settings-page { width: 100%; }

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

.form-select {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  width: 100%;
  cursor: pointer;
}

.form-select:focus { outline: none; border-color: var(--color-accent); }

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
