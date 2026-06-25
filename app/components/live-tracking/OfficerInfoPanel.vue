<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'

interface OfficerInfo {
  id: string
  name: string
  photo?: string
  initials: string
  community: string
  site: string
  shiftTime: string
  currentPost: string
  activeCall?: { id: string; type: string }
  nextWaypoint?: { name: string; eta: number }
  lastGpsUpdate: string
  status: string
  statusColor: string
}

const props = defineProps<{
  officer: OfficerInfo
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useTranslation()

const statusClass = computed(() => {
  return `status--${props.officer.status}`
})
</script>

<template>
  <div class="info-panel-overlay" @click="$emit('close')">
    <div class="info-panel" @click.stop>
      <div class="info-panel__header">
        <h3>{{ t('live_tracking.officer_info') }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <Icon name="lucide:x" :size="20" />
        </button>
      </div>

      <div class="info-panel__body">
        <!-- Officer identity -->
        <div class="officer-identity">
          <div class="officer-avatar">
            <img v-if="officer.photo" :src="officer.photo" :alt="officer.name" />
            <span v-else>{{ officer.initials }}</span>
          </div>
          <div class="officer-name-block">
            <a class="officer-name officer-name--link" :href="`/officers?id=${officer.id}`">{{ officer.name }}</a>
            <div class="officer-status" :class="statusClass">
              <span class="status-dot" :style="{ background: officer.statusColor }" />
              {{ officer.status }}
            </div>
          </div>
        </div>

        <!-- Details grid -->
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">{{ t('live_tracking.community_site') }}</span>
            <span class="info-value">{{ officer.community }} / {{ officer.site }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('live_tracking.shift_time') }}</span>
            <span class="info-value">{{ officer.shiftTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('live_tracking.current_post') }}</span>
            <span class="info-value">{{ officer.currentPost || '—' }}</span>
          </div>
          <div v-if="officer.activeCall" class="info-row">
            <span class="info-label">{{ t('live_tracking.active_call') }}</span>
            <a class="info-link" href="#" @click.prevent>{{ officer.activeCall.id }} — {{ officer.activeCall.type }}</a>
          </div>
          <div v-if="officer.nextWaypoint" class="info-row">
            <span class="info-label">{{ t('live_tracking.next_waypoint') }}</span>
            <span class="info-value">{{ officer.nextWaypoint.name }} ({{ officer.nextWaypoint.eta }}m)</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('live_tracking.last_gps_update') }}</span>
            <span class="info-value">{{ officer.lastGpsUpdate }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="info-actions">
          <button class="btn btn--secondary" @click="$emit('close')">
            {{ t('common.close') }}
          </button>
          <button class="btn btn--primary">
            {{ t('live_tracking.view_profile') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
}

.info-panel {
  width: 380px;
  max-width: 100%;
  height: 100%;
  background: var(--color-bg-elevated);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.info-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.info-panel__header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-btn {
  padding: var(--space-1);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.info-panel__body {
  padding: var(--space-4);
  overflow-y: auto;
  flex: 1;
}

.officer-identity {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.officer-name-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.officer-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.officer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.officer-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.officer-name--link {
  color: var(--color-accent);
  text-decoration: none;
}

.officer-name--link:hover {
  text-decoration: underline;
}

.officer-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.info-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.info-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--color-accent);
  color: var(--color-bg-base);
}

.btn--secondary {
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
</style>
