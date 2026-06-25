<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'

interface Waypoint {
  number: number
  location_name: string
  lat: number
  lng: number
  eta_minutes: number
  dwell_minutes: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  notes: string
}

interface Shift {
  id: string
  community: string
  site: string
  officers: string[]
  start_time: string
  end_time: string
  date: string
  posts: string[]
  route?: Waypoint[]
}

const props = defineProps<{
  shift: Shift
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'generate', shiftId: string): void
  (e: 'save', shiftId: string, route: Waypoint[]): void
}>()

const { t } = useTranslation()

const localRoute = ref<Waypoint[]>(props.shift.route ? [...props.shift.route] : [])
const draggedIndex = ref<number | null>(null)

const hasRoute = computed((): boolean => localRoute.value.length > 0)

function priorityClass(priority: Waypoint['priority']): string {
  return `badge--priority-${priority}`
}

function onGenerate() {
  emit('generate', props.shift.id)
}

function onDragStart(index: number) {
  draggedIndex.value = index
}

function onDragEnd() {
  draggedIndex.value = null
}

function onDrop(index: number) {
  if (draggedIndex.value === null || draggedIndex.value === index) return
  const item = localRoute.value[draggedIndex.value]
  if (!item) return
  const newRoute = [...localRoute.value]
  newRoute.splice(draggedIndex.value, 1)
  newRoute.splice(index, 0, item)
  localRoute.value = newRoute.map((wp, i) => ({ ...wp, number: i + 1 }))
  draggedIndex.value = null
}

function removeWaypoint(index: number) {
  const newRoute = [...localRoute.value]
  newRoute.splice(index, 1)
  localRoute.value = newRoute.map((wp, i) => ({ ...wp, number: i + 1 }))
}

function saveRoute() {
  emit('save', props.shift.id, localRoute.value)
}
</script>

<template>
  <div class="route-overlay" @click="$emit('close')">
    <div class="route-panel" @click.stop>
      <div class="route-header">
        <div>
          <h3>{{ t('shifts.patrol_route') }}</h3>
          <p class="route-subtitle">{{ shift.community }} — {{ shift.id }}</p>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <Icon name="lucide:x" :size="20" />
        </button>
      </div>

      <div class="route-body">
        <div class="route-actions">
          <button class="btn btn--primary" @click="onGenerate">
            <Icon name="lucide:sparkles" :size="16" />
            {{ t('shifts.regenerate_route') }}
          </button>
          <span v-if="!hasRoute" class="route-hint">
            {{ t('shifts.no_route_hint') }}
          </span>
        </div>

        <div v-if="hasRoute" class="waypoints-list">
          <div
            v-for="(waypoint, index) in localRoute"
            :key="waypoint.number"
            class="waypoint-card"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragend="onDragEnd"
            @dragover.prevent
            @drop="onDrop(index)"
          >
            <div class="waypoint-number">{{ waypoint.number }}</div>
            <div class="waypoint-info">
              <div class="waypoint-name">{{ waypoint.location_name }}</div>
              <div class="waypoint-meta">
                <span>{{ t('shifts.eta') }} {{ waypoint.eta_minutes }}m</span>
                <span>{{ t('shifts.dwell') }} {{ waypoint.dwell_minutes }}m</span>
                <span :class="['badge', priorityClass(waypoint.priority)]">{{ waypoint.priority }}</span>
              </div>
              <div v-if="waypoint.notes" class="waypoint-notes">{{ waypoint.notes }}</div>
            </div>
            <button class="remove-btn" @click="removeWaypoint(index)">
              <Icon name="lucide:x" :size="16" />
            </button>
          </div>
        </div>

        <div v-else class="route-empty">
          <Icon name="lucide:map-pin" :size="48" />
          <p>{{ t('shifts.route_empty') }}</p>
        </div>
      </div>

      <div class="route-footer">
        <button class="btn btn--secondary" @click="$emit('close')">
          {{ t('common.cancel') }}
        </button>
        <button class="btn btn--primary" @click="saveRoute">
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.route-panel {
  width: 560px;
  max-width: 100%;
  max-height: 85vh;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.route-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.route-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.route-body {
  padding: var(--space-4);
  overflow-y: auto;
  flex: 1;
}

.route-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.route-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.waypoints-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.waypoint-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: grab;
  transition: all 0.2s;
}

.waypoint-card:hover {
  border-color: var(--color-accent);
}

.waypoint-card:active {
  cursor: grabbing;
}

.waypoint-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--color-bg-base);
  border-radius: 50%;
  font-weight: 700;
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.waypoint-info {
  flex: 1;
}

.waypoint-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.waypoint-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.waypoint-notes {
  margin-top: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-style: italic;
}

.badge {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--priority-low { background: #e5e7eb; color: #374151; }
.badge--priority-medium { background: #fef3c7; color: #92400e; }
.badge--priority-high { background: #fee2e2; color: #991b1b; }
.badge--priority-critical { background: #fecaca; color: #7f1d1d; }

.remove-btn {
  padding: var(--space-1);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #ef4444;
}

.route-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--color-text-muted);
  text-align: center;
}

.route-empty p {
  margin-top: var(--space-3);
  font-size: var(--font-size-sm);
}

.route-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-base);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
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
</style>
