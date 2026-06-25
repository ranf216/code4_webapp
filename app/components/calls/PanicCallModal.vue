<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  assign: []
}>()

const { t } = useTranslation()

// Mock panic call data
const panicCall = ref({
  id: 'panic-001',
  callType: 'Panic Call',
  userName: 'Sarah Johnson',
  callDateTime: '2024-06-17 21:35:00',
  location: '123 Maple Drive, Apt 4B, Sunset Valley',
  liveLocation: '123 Maple Drive, Apt 4B',
  status: 'Active',
})

function handleClose() {
  emit('close')
}

function handleAssign() {
  emit('assign')
  handleClose()
}

function handleCloseCall() {
  // Close the panic call
  panicCall.value.status = 'Close'
  handleClose()
}
</script>

<template>
  <AppModal
    :show="show"
    :title="t('calls.panic_call_title')"
    cancel-text=""
    ok-text=""
    max-width="540px"
    @close="handleClose"
  >
    <template #default>
      <div class="panic-call-modal">
        <!-- Panic Alert Header -->
        <div class="panic-alert">
          <div class="alert-icon-wrapper">
            <Icon name="lucide:alert-triangle" :size="28" class="alert-icon" />
          </div>
          <div class="alert-text">
            <h3 class="panic-title">{{ t('calls.panic_alert_title') }}</h3>
            <p class="panic-subtitle">{{ t('calls.panic_subtitle') }}</p>
          </div>
        </div>

        <!-- Call Info -->
        <div class="info-section panic-section">
          <div class="info-grid">
            <div class="info-item">
              <label>{{ t('calls.call_type') }}</label>
              <span class="panic-type">{{ panicCall.callType }}</span>
            </div>
            <div class="info-item">
              <label>{{ t('calls.user_name') }}</label>
              <span class="user-name">{{ panicCall.userName }}</span>
            </div>
            <div class="info-item">
              <label>{{ t('calls.call_datetime') }}</label>
              <span>{{ panicCall.callDateTime }}</span>
            </div>
            <div class="info-item">
              <label>{{ t('calls.status') }}</label>
              <span :class="['status-badge', panicCall.status === 'Active' ? 'status-active' : 'status-closed']">
                {{ panicCall.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Location Info -->
        <div class="location-section panic-section">
          <h4 class="section-title">
            <Icon name="lucide:map-pin" :size="18" />
            {{ t('calls.location_info') }}
          </h4>
          <div class="info-grid">
            <div class="info-item full-width">
              <label>{{ t('calls.location_when_pressed') }}</label>
              <span>{{ panicCall.location }}</span>
            </div>
            <div class="info-item full-width">
              <label>{{ t('calls.live_location') }}</label>
              <span class="live-location">
                <Icon name="lucide:radio" :size="14" class="live-icon" />
                {{ panicCall.liveLocation }}
              </span>
            </div>
          </div>
        </div>

        <!-- Communication Log -->
        <div class="communication-section panic-section">
          <h4 class="section-title">
            <Icon name="lucide:message-square" :size="18" />
            {{ t('calls.communication') }}
          </h4>
          <div class="communication-log">
            <div class="log-entry">
              <span class="log-time">21:35:00</span>
              <span class="log-user">System</span>
              <span class="log-message">{{ t('calls.panic_initiated') }}</span>
            </div>
            <div class="log-entry">
              <span class="log-time">21:35:05</span>
              <span class="log-user">{{ panicCall.userName }}</span>
              <span class="log-message">{{ t('calls.user_location_shared') }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="panic-actions">
          <button class="action-btn assign-btn" @click="handleAssign">
            <Icon name="lucide:user-plus" :size="18" />
            {{ t('calls.assign_to_officer') }}
          </button>
          <button class="action-btn communicate-btn">
            <Icon name="lucide:phone" :size="18" />
            {{ t('calls.correspond_user') }}
          </button>
          <button class="action-btn live-location-btn">
            <Icon name="lucide:navigation" :size="18" />
            {{ t('calls.view_live_location') }}
          </button>
          <button class="action-btn close-btn" @click="handleCloseCall">
            <Icon name="lucide:check-circle" :size="18" />
            {{ t('calls.close_call') }}
          </button>
        </div>

        <!-- Note -->
        <div class="panic-note">
          <Icon name="lucide:info" :size="14" />
          <span>{{ t('calls.panic_note') }}</span>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.panic-call-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Panic Alert Header */
.panic-alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: var(--radius-md);
  color: white;
  min-height: 60px;
}

.alert-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.alert-icon {
  color: white;
}

.alert-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.panic-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  margin: 0;
  color: white;
  line-height: 1.2;
}

.panic-subtitle {
  font-size: var(--font-size-xs);
  margin: 2px 0 0;
  opacity: 0.9;
  color: white;
  font-weight: 500;
}

/* Section Styles */
.panic-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.info-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.panic-type {
  font-weight: 600;
  color: #ef4444;
}

.user-name {
  font-weight: 500;
  color: var(--color-accent);
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.status-active {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-closed {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

/* Live Location */
.live-location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: #22c55e;
  font-weight: 500;
}

.live-icon {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Communication Log */
.communication-log {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.log-entry {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.log-time {
  font-family: monospace;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.log-user {
  font-weight: 500;
  color: var(--color-accent);
}

.log-message {
  flex: 1;
  color: var(--color-text-primary);
}

/* Actions */
.panic-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.assign-btn {
  background: #3b82f6;
  color: white;
}

.assign-btn:hover {
  background: #2563eb;
}

.communicate-btn {
  background: #22c55e;
  color: white;
}

.communicate-btn:hover {
  background: #16a34a;
}

.live-location-btn {
  background: #f59e0b;
  color: white;
}

.live-location-btn:hover {
  background: #d97706;
}

.close-btn {
  background: #6b7280;
  color: white;
}

.close-btn:hover {
  background: #4b5563;
}

/* Note */
.panic-note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.panic-note :deep(svg) {
  color: #ef4444;
  flex-shrink: 0;
}
</style>
