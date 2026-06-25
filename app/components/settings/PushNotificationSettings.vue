<script setup lang="ts">
import { settingsApi } from '~/api/settings'

const { t } = useTranslation()

// Channels — parsed from comma-separated notification_methods
const channelInApp = ref(true)
const channelEmail = ref(true)
const channelMobile = ref(true)

// Sender name
const senderName = ref('')

// Notification title
const notificationTitle = ref('')

// Trigger enabled states — keyed by API field name
const triggerStates = ref({
  new_call_enabled: true,
  call_accepted_enabled: true,
  call_edited_enabled: true,
  call_resolved_enabled: true,
  post_order_published_enabled: true,
  post_order_updated_enabled: true,
  poi_active_enabled: true,
  poi_updated_enabled: true,
  poi_inactivated_enabled: true,
  poi_expiring_enabled: true,
  poi_expired_enabled: true,
  report_submitted_enabled: true,
  report_approved_enabled: true,
  report_changes_enabled: true,
  report_delivered_enabled: true,
})

const loading = ref(false)
const saving = ref(false)
const isDirty = ref(false)

function markDirty() {
  isDirty.value = true
}

// Parse notification_methods string into channel booleans
function parseChannels(methods: string) {
  const parts = methods.split(',').map((s) => s.trim())
  channelInApp.value = parts.includes('in_app')
  channelEmail.value = parts.includes('email')
  channelMobile.value = parts.includes('mobile')
}

// Build notification_methods string from channel booleans
function buildChannelsString(): string {
  const parts: string[] = []
  if (channelInApp.value) parts.push('in_app')
  if (channelEmail.value) parts.push('email')
  if (channelMobile.value) parts.push('mobile')
  return parts.join(',')
}

// Fetch settings from API
async function fetchSettings() {
  try {
    loading.value = true
    const response = await settingsApi.getNotificationSettings()
    if (response.rc === 0) {
      parseChannels(response.notification_methods || 'in_app,email,mobile')
      senderName.value = response.sender_name || ''
      notificationTitle.value = response.notification_title || ''
      triggerStates.value = {
        new_call_enabled: response.new_call_enabled,
        call_accepted_enabled: response.call_accepted_enabled,
        call_edited_enabled: response.call_edited_enabled,
        call_resolved_enabled: response.call_resolved_enabled,
        post_order_published_enabled: response.post_order_published_enabled,
        post_order_updated_enabled: response.post_order_updated_enabled,
        poi_active_enabled: response.poi_active_enabled,
        poi_updated_enabled: response.poi_updated_enabled,
        poi_inactivated_enabled: response.poi_inactivated_enabled,
        poi_expiring_enabled: response.poi_expiring_enabled,
        poi_expired_enabled: response.poi_expired_enabled,
        report_submitted_enabled: response.report_submitted_enabled,
        report_approved_enabled: response.report_approved_enabled,
        report_changes_enabled: response.report_changes_enabled,
        report_delivered_enabled: response.report_delivered_enabled,
      }
    }
  } catch (err) {
    console.error('Error fetching notification settings:', err)
  } finally {
    loading.value = false
    isDirty.value = false
  }
}

onMounted(() => {
  fetchSettings()
})

// Triggers list for rendering — maps UI key to API field
interface TriggerEntry {
  key: keyof typeof triggerStates.value
  label: string
  defaultTitle: string
  receivers: string
  notifText: string
}

const triggerList: TriggerEntry[] = [
  { key: 'new_call_enabled', label: 'New emergency call', defaultTitle: 'A new call', receivers: 'settings.notifications.receivers.assigned_officer', notifText: '#service_category was opened by #call_creator' },
  { key: 'call_accepted_enabled', label: 'Call status change to Accepted', defaultTitle: 'Call accepted', receivers: 'settings.notifications.receivers.call_creator_manager', notifText: 'Your call was accepted by the #officer_name' },
  { key: 'call_edited_enabled', label: 'Call was edited', defaultTitle: 'Call edit', receivers: 'settings.notifications.receivers.assigned_officer', notifText: '#call_number was edited' },
  { key: 'call_resolved_enabled', label: 'Call status change to Resolved', defaultTitle: 'Call resolved', receivers: 'settings.notifications.receivers.call_creator_manager', notifText: '#call_number was resolved' },
  { key: 'post_order_published_enabled', label: 'Post Order Published', defaultTitle: 'A new Post Order is published for a post (version 1.0).', receivers: 'settings.notifications.receivers.allocated_officers', notifText: 'A new Post Order is available' },
  { key: 'post_order_updated_enabled', label: 'Post Order Updated', defaultTitle: 'A version update is published to a post order', receivers: 'settings.notifications.receivers.allocated_officers', notifText: 'Post Order was updated' },
  { key: 'poi_active_enabled', label: 'New POI Record – Active', defaultTitle: 'A record is approved and published to one or more communities.', receivers: 'settings.notifications.receivers.all_checked_in', notifText: 'New POI was created: #name, #record_type, #threat level' },
  { key: 'poi_updated_enabled', label: 'POI Record Updated', defaultTitle: 'An edited record, a new version is published.', receivers: 'settings.notifications.receivers.officers_affected_communities', notifText: '#name, #record_type has been updated' },
  { key: 'poi_inactivated_enabled', label: 'POI Record Inactivated', defaultTitle: 'A manager inactivated an Active record.', receivers: 'settings.notifications.receivers.all_officers', notifText: '#name, #record_type has been inactivated' },
  { key: 'poi_expiring_enabled', label: 'Record Expiring Soon', defaultTitle: 'A Trespass Order or Metro Red Card is within the configured renewal reminder window (default: 14 days).', receivers: 'settings.notifications.receivers.creating_manager', notifText: '#name, #record_type expired soon' },
  { key: 'poi_expired_enabled', label: 'Record Expired', defaultTitle: 'A Trespass Order or Metro Red Card reaches its expiry date.', receivers: 'settings.notifications.receivers.manager_officers', notifText: '#name, #record_type expired' },
  { key: 'report_submitted_enabled', label: 'Incident Report submitted', defaultTitle: '', receivers: 'settings.notifications.receivers.responsible_manager', notifText: '' },
  { key: 'report_approved_enabled', label: 'Incident Report Approved', defaultTitle: '', receivers: 'settings.notifications.receivers.report_officer', notifText: '' },
  { key: 'report_changes_enabled', label: 'Incident Report required changes', defaultTitle: '', receivers: 'settings.notifications.receivers.report_officer', notifText: '' },
  { key: 'report_delivered_enabled', label: 'Incident Report Delivered', defaultTitle: '', receivers: 'settings.notifications.receivers.call_client', notifText: '' },
]

const allTriggersEnabled = computed(() => Object.values(triggerStates.value).every(Boolean))
const someTriggersEnabled = computed(() => Object.values(triggerStates.value).some(Boolean) && !allTriggersEnabled.value)

function toggleAllTriggers() {
  const next = !allTriggersEnabled.value
  const keys = Object.keys(triggerStates.value) as Array<keyof typeof triggerStates.value>
  keys.forEach((k) => (triggerStates.value[k] = next))
  markDirty()
}

const enabledCount = computed(() => Object.values(triggerStates.value).filter(Boolean).length)

// Save
async function handleSave() {
  try {
    saving.value = true
    const response = await settingsApi.saveNotificationSettings({
      notification_methods: buildChannelsString(),
      notification_title: notificationTitle.value,
      sender_name: senderName.value,
      ...triggerStates.value,
    })
    if (response.rc === 0) {
      isDirty.value = false
    } else {
      alert(response.message || 'Failed to save notification settings')
    }
  } catch (err) {
    console.error('Error saving notification settings:', err)
    alert('Failed to save notification settings')
  } finally {
    saving.value = false
  }
}

// Reset to last saved
async function handleReset() {
  await fetchSettings()
}

</script>

<template>
  <div class="notif-settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ t('settings.notifications.page_title') }}</h2>
        <p class="page-subtitle">{{ t('settings.notifications.page_subtitle') }}</p>
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
      <!-- Left column: Channels + Sender -->
      <div class="col-left">
        <!-- Section 1: Channels -->
        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon">
              <Icon name="lucide:send" :size="18" />
            </div>
            <div>
              <h3 class="card-title">{{ t('settings.notifications.channels_title') }}</h3>
              <p class="card-desc">{{ t('settings.notifications.channels_desc') }}</p>
            </div>
          </div>
          <div class="card-body">
            <div class="channel-grid">
              <!-- In-App -->
              <div class="channel-item" :class="{ 'channel-item--on': channelInApp }">
                <div class="channel-icon">
                  <Icon name="lucide:bell" :size="22" />
                </div>
                <div class="channel-info">
                  <span class="channel-name">{{ t('settings.notifications.channel_in_app') }}</span>
                  <span class="channel-desc">{{ t('settings.notifications.channel_in_app_desc') }}</span>
                </div>
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--on': channelInApp }"
                  @click="channelInApp = !channelInApp; markDirty()"
                >
                  <span class="toggle-knob" />
                </button>
              </div>
              <!-- Email -->
              <div class="channel-item" :class="{ 'channel-item--on': channelEmail }">
                <div class="channel-icon">
                  <Icon name="lucide:mail" :size="22" />
                </div>
                <div class="channel-info">
                  <span class="channel-name">{{ t('settings.notifications.channel_email') }}</span>
                  <span class="channel-desc">{{ t('settings.notifications.channel_email_desc') }}</span>
                </div>
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--on': channelEmail }"
                  @click="channelEmail = !channelEmail; markDirty()"
                >
                  <span class="toggle-knob" />
                </button>
              </div>
              <!-- Mobile -->
              <div class="channel-item" :class="{ 'channel-item--on': channelMobile }">
                <div class="channel-icon">
                  <Icon name="lucide:smartphone" :size="22" />
                </div>
                <div class="channel-info">
                  <span class="channel-name">{{ t('settings.notifications.channel_mobile') }}</span>
                  <span class="channel-desc">{{ t('settings.notifications.channel_mobile_desc') }}</span>
                </div>
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--on': channelMobile }"
                  @click="channelMobile = !channelMobile; markDirty()"
                >
                  <span class="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Sender Name -->
        <div class="settings-card">
          <div class="card-body">
            <div class="form-field">
              <label class="form-label">{{ t('settings.notifications.sender_name_label') }}</label>
              <input
                v-model="senderName"
                type="text"
                class="form-input"
                :placeholder="t('settings.notifications.sender_name_placeholder')"
                @input="markDirty()"
              />
              <p class="form-hint">{{ t('settings.notifications.sender_name_hint') }}</p>
            </div>
          </div>
        </div>

        <!-- Section 3: Notification Title -->
        <div class="settings-card">
          <div class="card-body">
            <div class="form-field">
              <label class="form-label">{{ t('settings.notifications.notification_title_label') }}</label>
              <input
                v-model="notificationTitle"
                type="text"
                class="form-input"
                :placeholder="t('settings.notifications.notification_title_placeholder')"
                @input="markDirty()"
              />
              <p class="form-hint">{{ t('settings.notifications.notification_title_hint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Trigger Events -->
      <div class="col-right">
        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon">
              <Icon name="lucide:zap" :size="18" />
            </div>
            <div>
              <h3 class="card-title">{{ t('settings.notifications.triggers_title') }}</h3>
              <p class="card-desc">{{ t('settings.notifications.triggers_desc') }}</p>
            </div>
          </div>
          <div class="card-body">
            <!-- Select All -->
            <div class="triggers-header">
              <label class="select-all-check" @click.prevent="toggleAllTriggers">
                <input
                  type="checkbox"
                  :checked="allTriggersEnabled"
                  :indeterminate="someTriggersEnabled"
                  @change.stop
                />
                <span>{{ t('settings.notifications.select_all') }}</span>
              </label>
              <span class="triggers-count">
                {{ enabledCount }} / {{ triggerList.length }} {{ t('settings.notifications.triggers_enabled') }}
              </span>
            </div>

            <!-- Trigger List -->
            <div class="trigger-list">
              <div
                v-for="entry in triggerList"
                :key="entry.key"
                class="trigger-row"
                :class="{ 'trigger-row--disabled': !triggerStates[entry.key] }"
                @click="triggerStates[entry.key] = !triggerStates[entry.key]; markDirty()"
              >
                <div class="trigger-main">
                  <input
                    :checked="triggerStates[entry.key]"
                    type="checkbox"
                    class="trigger-checkbox"
                    @click.stop
                    @change="triggerStates[entry.key] = !triggerStates[entry.key]; markDirty()"
                  />
                  <div class="trigger-info">
                    <span class="trigger-name">{{ entry.label }}</span>
                    <span v-if="entry.defaultTitle" class="trigger-title">
                      <Icon name="lucide:bell" :size="11" />
                      {{ entry.defaultTitle }}
                    </span>
                    <span class="trigger-receivers">
                      <Icon name="lucide:users" :size="11" />
                      {{ t(entry.receivers) }}
                    </span>
                  </div>
                </div>
                <div v-if="entry.notifText" class="trigger-text">
                  "{{ entry.notifText }}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-settings-page { width: 100%; }

/* Page Header */
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

/* Settings Columns */
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

/* Card */
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
}

/* Channels */
.channel-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.channel-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.channel-item--on {
  border-color: rgba(229, 255, 68, 0.2);
  background: rgba(229, 255, 68, 0.03);
}

.channel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.channel-item--on .channel-icon {
  background: rgba(229, 255, 68, 0.08);
  color: var(--color-accent, #e5ff44);
}

.channel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.channel-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.channel-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Form */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 480px;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  width: 100%;
}

.form-input:focus { outline: none; border-color: var(--color-accent); }
.form-input::placeholder { color: var(--color-text-muted); }

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

/* Triggers */
.triggers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
}

.select-all-check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.select-all-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent, #e5ff44);
  cursor: pointer;
}

.triggers-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.trigger-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trigger-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
  cursor: pointer;
  user-select: none;
}

.trigger-row:hover { background: rgba(255, 255, 255, 0.05); }

.trigger-row--disabled { opacity: 0.45; }

.trigger-main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.trigger-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent, #e5ff44);
  cursor: pointer;
  flex-shrink: 0;
}

.trigger-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trigger-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.trigger-title {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-style: italic;
}

.trigger-receivers {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.trigger-text {
  margin-left: calc(16px + var(--space-3));
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
  line-height: 1.4;
}

/* Toggle */
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
