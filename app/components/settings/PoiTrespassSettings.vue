<script setup lang="ts">
import { settingsApi } from '~/api/settings'

const { t } = useTranslation()

const renewalReminderDays = ref(14)
const archiveThresholdMonths = ref(24)
const pdfExportEnabled = ref(true)
const defaultPoiGuidance = ref('')
const defaultTrespassGuidance = ref('')
const defaultRedCardGuidance = ref('')

const saving = ref(false)
const isDirty = ref(false)

function markDirty() {
  isDirty.value = true
}

async function fetchSettings() {
  try {
    const response = await settingsApi.getPoiSettings()
    if (response.rc === 0) {
      renewalReminderDays.value = response.renewal_reminder_days
      archiveThresholdMonths.value = response.archive_threshold_months
      pdfExportEnabled.value = response.pdf_export_enabled
      defaultPoiGuidance.value = response.default_poi_guidance
      defaultTrespassGuidance.value = response.default_trespass_guidance
      defaultRedCardGuidance.value = response.default_red_card_guidance
    }
  } catch (err) {
    console.error('Error fetching POI settings:', err)
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
    const response = await settingsApi.updatePoiSettings({
      renewal_reminder_days: renewalReminderDays.value,
      archive_threshold_months: archiveThresholdMonths.value,
      pdf_export_enabled: pdfExportEnabled.value,
      default_poi_guidance: defaultPoiGuidance.value,
      default_trespass_guidance: defaultTrespassGuidance.value,
      default_red_card_guidance: defaultRedCardGuidance.value,
    })
    if (response.rc === 0) {
      isDirty.value = false
    } else {
      alert(response.message || 'Failed to save POI settings')
    }
  } catch (err) {
    console.error('Error saving POI settings:', err)
    alert('Failed to save POI settings')
  } finally {
    saving.value = false
  }
}

async function handleReset() {
  await fetchSettings()
}
</script>

<template>
  <div class="poi-settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ t('settings.poi.page_title') }}</h2>
        <p class="page-subtitle">{{ t('settings.poi.page_subtitle') }}</p>
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

    <div class="settings-columns">
      <!-- Left column: Parameters -->
      <div class="col-left">
        <!-- Section: General Parameters -->
        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon">
              <Icon name="lucide:sliders-horizontal" :size="18" />
            </div>
            <div>
              <h3 class="card-title">{{ t('settings.poi.parameters_title') }}</h3>
              <p class="card-desc">{{ t('settings.poi.parameters_desc') }}</p>
            </div>
          </div>
          <div class="card-body">
            <!-- Renewal Reminder Lead Time -->
            <div class="form-field">
              <label class="form-label">{{ t('settings.poi.renewal_reminder_label') }}</label>
              <div class="input-with-unit">
                <input
                  v-model.number="renewalReminderDays"
                  type="number"
                  min="1"
                  max="365"
                  class="form-input"
                  @input="markDirty()"
                />
                <span class="input-unit">{{ t('settings.poi.days') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.poi.renewal_reminder_hint') }}</p>
            </div>

            <!-- Archive Threshold -->
            <div class="form-field">
              <label class="form-label">{{ t('settings.poi.archive_threshold_label') }}</label>
              <div class="input-with-unit">
                <input
                  v-model.number="archiveThresholdMonths"
                  type="number"
                  min="1"
                  max="120"
                  class="form-input"
                  @input="markDirty()"
                />
                <span class="input-unit">{{ t('settings.poi.months') }}</span>
              </div>
              <p class="form-hint">{{ t('settings.poi.archive_threshold_hint') }}</p>
            </div>

            <!-- PDF Export -->
            <div class="form-field">
              <label class="form-label">{{ t('settings.poi.pdf_export_label') }}</label>
              <div
                class="toggle-row"
                :class="{ 'toggle-row--on': pdfExportEnabled }"
                @click="pdfExportEnabled = !pdfExportEnabled; markDirty()"
              >
                <div class="toggle-row-info">
                  <span class="toggle-row-name">{{ pdfExportEnabled ? t('common.active') : t('common.inactive') }}</span>
                  <span class="toggle-row-desc">{{ t('settings.poi.pdf_export_hint') }}</span>
                </div>
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--on': pdfExportEnabled }"
                  @click.stop="pdfExportEnabled = !pdfExportEnabled; markDirty()"
                >
                  <span class="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Guidance Texts -->
      <div class="col-right">
        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon">
              <Icon name="lucide:file-text" :size="18" />
            </div>
            <div>
              <h3 class="card-title">{{ t('settings.poi.guidance_title') }}</h3>
              <p class="card-desc">{{ t('settings.poi.guidance_desc') }}</p>
            </div>
          </div>
          <div class="card-body">
            <!-- POI Guidance -->
            <div class="form-field">
              <label class="form-label">{{ t('settings.poi.poi_guidance_label') }}</label>
              <textarea
                v-model="defaultPoiGuidance"
                class="form-textarea"
                :placeholder="t('settings.poi.poi_guidance_placeholder')"
                rows="5"
                @input="markDirty()"
              />
            </div>

            <!-- Trespass Guidance -->
            <div class="form-field">
              <label class="form-label">{{ t('settings.poi.trespass_guidance_label') }}</label>
              <textarea
                v-model="defaultTrespassGuidance"
                class="form-textarea"
                :placeholder="t('settings.poi.trespass_guidance_placeholder')"
                rows="5"
                @input="markDirty()"
              />
            </div>

            <!-- Red Card Guidance -->
            <div class="form-field">
              <label class="form-label">{{ t('settings.poi.red_card_guidance_label') }}</label>
              <textarea
                v-model="defaultRedCardGuidance"
                class="form-textarea"
                :placeholder="t('settings.poi.red_card_guidance_placeholder')"
                rows="5"
                @input="markDirty()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.poi-settings-page { width: 100%; }

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

.col-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.col-right {
  display: flex;
  flex-direction: column;
}

.settings-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
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
  width: 120px;
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

.form-textarea {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  width: 100%;
  resize: vertical;
  line-height: 1.6;
  font-family: inherit;
}

.form-textarea:focus { outline: none; border-color: var(--color-accent); }
.form-textarea::placeholder { color: var(--color-text-muted); }

/* Toggle Row */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.toggle-row--on {
  border-color: rgba(229, 255, 68, 0.2);
  background: rgba(229, 255, 68, 0.03);
}

.toggle-row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-row-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.toggle-row-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Toggle button */
.toggle-btn {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn--on { background: var(--color-accent, #e5ff44); }

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  display: block;
}

.toggle-btn--on .toggle-knob { transform: translateX(20px); }
</style>
