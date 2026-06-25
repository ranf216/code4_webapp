<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { shifts, generateRoute, saveRoute, type Shift, type Waypoint } from '~/composables/useShifts'

const { t } = useTranslation()

const selectedRouteShift = ref<Shift | null>(null)
const showRouteDetail = ref(false)

const shiftsWithRoutes = computed((): Shift[] => {
  return shifts.value.filter((shift: Shift) => shift.route && shift.route.length > 0)
})

const shiftsWithoutRoutes = computed((): Shift[] => {
  return shifts.value.filter((shift: Shift) => !shift.route || shift.route.length === 0)
})

function openRouteDetail(shift: Shift) {
  selectedRouteShift.value = shift
  showRouteDetail.value = true
}

function closeRouteDetail() {
  showRouteDetail.value = false
  selectedRouteShift.value = null
}

function handleGenerateRoute(shiftId: string) {
  generateRoute(shiftId)
  const shift = shifts.value.find((s: Shift) => s.id === shiftId)
  if (shift) {
    selectedRouteShift.value = shift
  }
}

function handleSaveRoute(shiftId: string, route: Waypoint[]) {
  saveRoute(shiftId, route)
  closeRouteDetail()
}

function removeRoute(shift: Shift) {
  shift.route = undefined
}

function priorityClass(priority: Waypoint['priority']): string {
  return `badge--priority-${priority}`
}
</script>

<template>
  <div class="routes-management">
    <div class="routes-header">
      <h2>{{ t('shifts.routes_title') }}</h2>
      <span class="routes-count">{{ shiftsWithRoutes.length }} {{ t('shifts.routes_count') }}</span>
    </div>

    <div class="routes-grid">
      <!-- Shifts with routes -->
      <div
        v-for="shift in shiftsWithRoutes"
        :key="shift.id"
        class="route-card"
        @click="openRouteDetail(shift)"
      >
        <div class="route-card-header">
          <div>
            <div class="route-shift-id">{{ shift.id }}</div>
            <div class="route-shift-meta">{{ shift.date }} · {{ shift.start_time }} - {{ shift.end_time }}</div>
          </div>
          <Badge type="shiftStatus" :value="shift.status" />
        </div>

        <div class="route-location">{{ shift.community }} — {{ shift.site }}</div>
        <div class="route-officers">
          <Icon name="lucide:users" :size="14" />
          {{ shift.officers.length > 0 ? shift.officers.join(', ') : t('shifts.no_officers') }}
        </div>

        <div class="waypoints-list">
          <div
            v-for="waypoint in shift.route?.slice(0, 2)"
            :key="waypoint.number"
            class="waypoint-item"
          >
            <div class="waypoint-number">{{ waypoint.number }}</div>
            <div class="waypoint-info">
              <div class="waypoint-name">{{ waypoint.location_name }}</div>
              <div class="waypoint-meta">
                <span>{{ t('shifts.eta') }} {{ waypoint.eta_minutes }}m</span>
                <span>{{ t('shifts.dwell') }} {{ waypoint.dwell_minutes }}m</span>
                <span :class="['badge', priorityClass(waypoint.priority)]">{{ waypoint.priority }}</span>
              </div>
            </div>
          </div>
          <div v-if="(shift.route?.length || 0) > 2" class="waypoints-more">
            +{{ (shift.route?.length || 0) - 2 }} {{ t('shifts.waypoints') }}
          </div>
        </div>

        <div class="route-card-actions">
          <button class="btn btn--secondary" @click.stop="handleGenerateRoute(shift.id)">
            <Icon name="lucide:sparkles" :size="14" />
            {{ t('shifts.regenerate_route') }}
          </button>
          <button class="btn btn--danger" @click.stop="removeRoute(shift)">
            <Icon name="lucide:trash-2" :size="14" />
            {{ t('shifts.remove_route') }}
          </button>
        </div>
      </div>

      <!-- Shifts without routes -->
      <div
        v-for="shift in shiftsWithoutRoutes"
        :key="shift.id"
        class="route-card route-card--empty"
        @click="openRouteDetail(shift)"
      >
        <div class="route-card-header">
          <div>
            <div class="route-shift-id">{{ shift.id }}</div>
            <div class="route-shift-meta">{{ shift.date }} · {{ shift.start_time }} - {{ shift.end_time }}</div>
          </div>
          <Badge type="shiftStatus" :value="shift.status" />
        </div>
        <div class="route-location">{{ shift.community }} — {{ shift.site }}</div>
        <div class="route-empty-message">
          <Icon name="lucide:map-pin" :size="24" />
          <p>{{ t('shifts.route_empty') }}</p>
        </div>
        <button class="btn btn--primary" @click.stop="handleGenerateRoute(shift.id)">
          <Icon name="lucide:sparkles" :size="14" />
          {{ t('shifts.generate_route') }}
        </button>
      </div>
    </div>

    <div v-if="shiftsWithRoutes.length === 0 && shiftsWithoutRoutes.length === 0" class="routes-placeholder">
      <Icon name="lucide:route" :size="48" />
      <h3>{{ t('shifts.routes_title') }}</h3>
      <p>{{ t('shifts.routes_placeholder') }}</p>
    </div>

    <PatrolRoutePanel
      v-if="showRouteDetail && selectedRouteShift"
      :shift="selectedRouteShift"
      @close="closeRouteDetail"
      @generate="handleGenerateRoute"
      @save="handleSaveRoute"
    />
  </div>
</template>

<style scoped>
.routes-management {
  padding: var(--space-4);
}

.routes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.routes-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.routes-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: var(--space-4);
}

.route-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  cursor: pointer;
  transition: all 0.2s;
}

.route-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.route-card--empty {
  border-style: dashed;
}

.route-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.route-shift-id {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.route-shift-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.route-location {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.route-officers {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.waypoints-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3) 0;
}

.waypoints-more {
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  font-weight: 500;
  text-align: center;
  padding: var(--space-1) 0;
}

.waypoint-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.waypoint-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--color-bg-base);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.waypoint-info {
  flex: 1;
}

.waypoint-name {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-primary);
}

.waypoint-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: 2px;
  font-size: 10px;
  color: var(--color-text-muted);
}

.badge {
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--priority-low { background: #e5e7eb; color: #374151; }
.badge--priority-medium { background: #fef3c7; color: #92400e; }
.badge--priority-high { background: #fee2e2; color: #991b1b; }
.badge--priority-critical { background: #fecaca; color: #7f1d1d; }

.route-card-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
}

.route-empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  color: var(--color-text-muted);
  text-align: center;
}

.route-empty-message p {
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
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

.btn--danger {
  background: var(--color-bg-base);
  color: #ef4444;
  border: 1px solid var(--color-border);
}

.routes-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--color-text-muted);
  text-align: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.routes-placeholder h3 {
  margin-top: var(--space-4);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.routes-placeholder p {
  margin-top: var(--space-2);
  max-width: 400px;
}
</style>
