<script setup lang="ts">
import { computed } from 'vue'
import type {
  GetOfficerLocationResponse,
  LiveTrackingOfficer,
  OfficerTrackingStatus,
} from '~/api/types/tracking'
import { useTranslation } from '~/composables/useI18n'
import { utcToLocal } from '~/utils/dateTime'
import { fileUrl } from '~/utils/fileUrl'

const props = defineProps<{
  officer: LiveTrackingOfficer
  detail: GetOfficerLocationResponse | null
  detailLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close' | 'view-profile' | 'view-history' | 'view-route'): void
  (e: 'view-call', callId: number): void
}>()

const { t } = useTranslation()

const statusMeta: Record<OfficerTrackingStatus, { label: string; color: string }> = {
  green: { label: 'On Patrol', color: '#198754' },
  amber: { label: 'Signal Stale', color: '#FFC107' },
  blue: { label: 'Responding to Call', color: '#0D6EFD' },
  red: { label: 'Waypoint Overdue', color: '#DC3545' },
  grey: { label: 'Off Duty', color: '#6C757D' },
}

const status = computed(() => statusMeta[props.officer.status])
const fullName = computed(() =>
  [props.officer.first_name, props.officer.last_name].filter(Boolean).join(' ') || props.officer.officer_id)
const initials = computed(() => [props.officer.first_name, props.officer.last_name]
  .filter(Boolean)
  .map(name => name.charAt(0).toUpperCase())
  .join('')
  .slice(0, 2) || '—')

const location = computed(() => props.detail?.location ?? null)
const latitude = computed(() => location.value?.latitude ?? props.officer.latitude)
const longitude = computed(() => location.value?.longitude ?? props.officer.longitude)
const accuracy = computed(() => location.value?.accuracy ?? props.officer.accuracy)
const speed = computed(() => location.value?.speed ?? props.officer.speed)
const heading = computed(() => location.value?.heading ?? props.officer.heading)
const recordedOn = computed(() => location.value?.recorded_on ?? props.officer.last_update)

function formatSpeed(value: number | null) {
  if (value == null) return '—'
  if (value < 0.5) return 'Stationary'
  return `${(value * 3.6).toFixed(1)} km/h`
}

const compassDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
function formatHeading(value: number | null) {
  if (value == null) return '—'
  const index = Math.round(value / 45) % 8
  return `${compassDirections[index]} ${Math.round(value)}°`
}

function formatAccuracy(value: number | null) {
  return value == null ? '—' : `±${Math.round(value)} m`
}

function formatRelative(value: string) {
  const local = utcToLocal(value)
  return local.isValid() ? local.fromNow() : '—'
}

const shiftLabel = computed(() => {
  if (!props.officer.shift_id) return 'Not on shift'
  const time = [props.officer.shift_start_time, props.officer.shift_end_time].filter(Boolean).join(' – ')
  return [props.officer.shift_date, time].filter(Boolean).join(' · ')
})

const sourceLabels: Record<string, string> = { gps: 'GPS', network: 'Network', manual: 'Manual' }
</script>

<template>
  <div class="info-panel-overlay" @click="emit('close')">
    <div class="info-panel" @click.stop>
      <div class="info-panel__header">
        <div class="officer-identity">
          <div class="officer-avatar" :style="{ borderColor: status.color }">
            <img v-if="officer.image" :src="fileUrl(officer.image)" :alt="fullName" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="officer-name-block">
            <span class="officer-name">{{ fullName }}</span>
            <span class="officer-community">{{ officer.community_name || '—' }}</span>
            <span class="status-badge" :style="{ background: status.color }">{{ status.label }}</span>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')">
          <Icon name="lucide:x" :size="20" />
        </button>
      </div>

      <div class="info-panel__body">
        <div v-if="detailLoading" class="detail-loading">
          <Icon name="lucide:loader-circle" :size="16" class="spinning" />
          <span>Loading telemetry…</span>
        </div>

        <div class="info-grid">
          <div class="info-section">
            <span class="info-section__title">Location</span>
            <div class="info-row">
              <span class="info-label">Coordinates</span>
              <span class="info-value">{{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Accuracy</span>
              <span class="info-value">{{ formatAccuracy(accuracy) }}</span>
            </div>
          </div>

          <div class="info-section">
            <span class="info-section__title">Movement</span>
            <div class="info-row">
              <span class="info-label">Speed</span>
              <span class="info-value">{{ formatSpeed(speed) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Heading</span>
              <span class="info-value">{{ formatHeading(heading) }}</span>
            </div>
          </div>

          <div class="info-section">
            <span class="info-section__title">Last Update</span>
            <div class="info-row">
              <span class="info-value">{{ formatRelative(recordedOn) }}</span>
              <span class="info-label" :title="utcToLocal(recordedOn).format('YYYY-MM-DD HH:mm:ss')">
                {{ utcToLocal(recordedOn).format('HH:mm:ss DD MMM YYYY') }}
              </span>
            </div>
            <div v-if="detail" class="info-row">
              <span class="info-label">Minutes since update</span>
              <span class="info-value">{{ detail.minutes_since_update }} min</span>
            </div>
          </div>

          <div v-if="detail" class="info-section">
            <span class="info-section__title">Telemetry Detail</span>
            <div class="info-row">
              <span class="info-label">Altitude</span>
              <span class="info-value">{{ detail.location.altitude == null ? '—' : `${Math.round(detail.location.altitude)} m` }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Source</span>
              <span class="info-value">{{ sourceLabels[detail.location.source] ?? detail.location.source }}</span>
            </div>
          </div>

          <div class="info-section">
            <span class="info-section__title">Shift</span>
            <div class="info-row">
              <span class="info-value">{{ shiftLabel }}</span>
            </div>
          </div>

          <div class="info-section">
            <span class="info-section__title">Active Call</span>
            <div class="info-row">
              <button
                v-if="officer.active_call_id"
                type="button"
                class="info-link"
                @click="emit('view-call', officer.active_call_id!)"
              >
                #{{ officer.active_call_id }} — {{ officer.active_call_category || 'Call' }}
              </button>
              <span v-else class="info-value">No active call</span>
            </div>
          </div>
        </div>

        <div class="info-actions">
          <button class="btn btn--secondary" @click="emit('view-history')">
            <Icon name="lucide:history" :size="14" />
            View History
          </button>
          <button
            v-if="officer.shift_id"
            class="btn btn--secondary"
            @click="emit('view-route')"
          >
            <Icon name="lucide:route" :size="14" />
            View Route
          </button>
          <button
            v-if="officer.active_call_id"
            class="btn btn--secondary"
            @click="emit('view-call', officer.active_call_id!)"
          >
            <Icon name="lucide:phone" :size="14" />
            View Call
          </button>
          <button class="btn btn--primary" @click="emit('view-profile')">
            <Icon name="lucide:user-round" :size="14" />
            View Profile
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
  width: 400px;
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
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.officer-identity {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.officer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.officer-avatar img { width: 100%; height: 100%; object-fit: cover; }

.officer-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.officer-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.officer-community {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.status-badge {
  align-self: flex-start;
  margin-top: var(--space-1);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: 600;
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

.close-btn:hover { color: var(--color-text-primary); }

.info-panel__body {
  padding: var(--space-4);
  overflow-y: auto;
  flex: 1;
}

.detail-loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.info-grid { display: flex; flex-direction: column; gap: var(--space-4); }

.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.info-section:last-child { border-bottom: 0; }

.info-section__title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-row { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2); }

.info-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.info-value { font-size: var(--font-size-sm); color: var(--color-text-primary); }

.info-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: none;
}

.info-link:hover { text-decoration: underline; }

.info-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-5);
}

.btn {
  flex: 1;
  min-width: 110px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn--primary { background: var(--color-accent); color: var(--color-bg-base); }
.btn--secondary { background: var(--color-bg-base); color: var(--color-text-primary); border: 1px solid var(--color-border); }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
