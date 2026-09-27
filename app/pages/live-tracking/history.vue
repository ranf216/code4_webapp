<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { trackingApi } from '~/api/tracking'
import { officerApi } from '~/api/officer'
import type { Officer } from '~/api/types/officer'
import type { TrackingLocation } from '~/api/types/tracking'
import { localToUtc, utcToLocal } from '~/utils/dateTime'
import moment from 'moment'

interface GeoPoint { lat: number; lng: number }
interface HistoryRoute {
  id: string
  label: string
  path: GeoPoint[]
  color?: string
}
interface GoogleMapExpose {
  fitToVisibleMarkers: () => void
  focusOn: (point: GeoPoint, zoom?: number) => void
}

definePageMeta({ layout: 'default' })

const route = useRoute()
const officers = ref<Officer[]>([])
const selectedOfficerId = ref('')
const dateFrom = ref(moment().subtract(24, 'hours').format('YYYY-MM-DDTHH:mm'))
const dateTo = ref(moment().format('YYYY-MM-DDTHH:mm'))
const shiftId = ref('')
const points = ref<TrackingLocation[]>([])
const loading = ref(false)
const loaded = ref(false)
const error = ref('')
const googleMapRef = ref<GoogleMapExpose | null>(null)
const selectedPointIndex = ref<number | null>(null)

const selectedPoint = computed(() => {
  const index = selectedPointIndex.value
  return index == null ? null : points.value[index] ?? null
})

function onWaypointClick(index: number) {
  selectedPointIndex.value = index
}

function formatPointSpeed(value: number | null) {
  if (value == null) return '—'
  if (value < 0.5) return 'Stationary'
  return `${(value * 3.6).toFixed(1)} km/h`
}

function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function exportFileName(ext: string) {
  const officer = officers.value.find(o => o.user_id === selectedOfficerId.value)
  const name = officer ? officerName(officer).replace(/\s+/g, '-').toLowerCase() : 'officer'
  return `route-history-${name}-${moment().format('YYYYMMDD-HHmmss')}.${ext}`
}

function csvEscape(value: string | number | null) {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function exportCsv() {
  const header = [
    'point', 'recorded_on_utc', 'recorded_on_local', 'latitude', 'longitude',
    'speed_mps', 'speed_kmh', 'heading_deg', 'accuracy_m', 'altitude_m',
    'source', 'shift_id', 'call_id',
  ]
  const rows = points.value.map((p, index) => [
    index + 1,
    p.recorded_on,
    utcToLocal(p.recorded_on).format('YYYY-MM-DD HH:mm:ss'),
    p.latitude,
    p.longitude,
    p.speed,
    p.speed == null ? null : Number((p.speed * 3.6).toFixed(1)),
    p.heading,
    p.accuracy,
    p.altitude,
    p.source,
    p.shift_id,
    p.call_id,
  ])
  const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n')
  downloadFile(exportFileName('csv'), csv, 'text/csv;charset=utf-8')
}

function exportGpx() {
  const trkpts = points.value.map((p) => {
    const time = moment.utc(p.recorded_on, 'YYYY-MM-DD HH:mm:ss').toISOString()
    const ele = p.altitude == null ? '' : `<ele>${p.altitude}</ele>`
    return `    <trkpt lat="${p.latitude}" lon="${p.longitude}">${ele}<time>${time}</time></trkpt>`
  }).join('\n')
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Code4 Live Tracking" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Route History</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`
  downloadFile(exportFileName('gpx'), gpx, 'application/gpx+xml;charset=utf-8')
}

const SPEED_COLORS = { stationary: '#6C757D', walking: '#0D6EFD', vehicle: '#22c55e', call: '#DC3545' }

function segmentColor(point: TrackingLocation) {
  if (point.call_id != null) return SPEED_COLORS.call
  const speed = point.speed ?? 0
  if (speed < 0.5) return SPEED_COLORS.stationary
  if (speed <= 2.5) return SPEED_COLORS.walking
  return SPEED_COLORS.vehicle
}

const routes = computed<HistoryRoute[]>(() => {
  const result: HistoryRoute[] = []
  const pts = points.value
  for (let i = 0; i < pts.length - 1; i++) {
    const from = pts[i]!
    const to = pts[i + 1]!
    const color = segmentColor(to)
    const last = result[result.length - 1]
    if (last && last.color === color) {
      last.path.push({ lat: to.latitude, lng: to.longitude })
    } else {
      result.push({
        id: `seg-${i}`,
        label: '',
        color,
        path: [{ lat: from.latitude, lng: from.longitude }, { lat: to.latitude, lng: to.longitude }],
      })
    }
  }
  return result
})

const compassDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
function formatHeading(value: number | null) {
  if (value == null) return '—'
  return `${compassDirections[Math.round(value / 45) % 8]} ${Math.round(value)}°`
}

const waypoints = computed(() => points.value.map((p, index) => ({
  number: index + 1,
  lat: p.latitude,
  lng: p.longitude,
  visited: true,
  title: [
    `Point ${index + 1}`,
    utcToLocal(p.recorded_on).format('DD MMM YYYY HH:mm:ss'),
    p.speed == null ? 'Speed: —' : p.speed < 0.5 ? 'Stationary' : `Speed: ${(p.speed * 3.6).toFixed(1)} km/h`,
    `Accuracy: ${p.accuracy == null ? '—' : `±${Math.round(p.accuracy)} m`}`,
    `Source: ${p.source}`,
    p.call_id != null ? `Call #${p.call_id}` : '',
  ].filter(Boolean).join('\n'),
})))

const endpointMarkers = computed(() => {
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  if (!first) return []
  const markers: Array<{
    lat: number
    lng: number
    status: 'green' | 'red'
    label: string
    initials: string
  }> = [{
    lat: first.latitude,
    lng: first.longitude,
    status: 'green',
    label: 'Start',
    initials: 'S',
  }]
  if (last && points.value.length > 1) {
    markers.push({
      lat: last.latitude,
      lng: last.longitude,
      status: 'red',
      label: 'End',
      initials: 'E',
    })
  }
  return markers
})

function haversine(a: GeoPoint, b: GeoPoint) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(h))
}

const totalDistance = computed(() => points.value.reduce((sum, p, i, arr) => {
  if (i === 0) return 0
  return sum + haversine({ lat: arr[i - 1]!.latitude, lng: arr[i - 1]!.longitude }, { lat: p.latitude, lng: p.longitude })
}, 0))

const stats = computed(() => ({
  count: points.value.length,
  distance: totalDistance.value < 1000
    ? `${Math.round(totalDistance.value)} m`
    : `${(totalDistance.value / 1000).toFixed(1)} km`,
  duration: points.value.length > 1
    ? (() => {
        const start = utcToLocal(points.value[0]!.recorded_on)
        const end = utcToLocal(points.value[points.value.length - 1]!.recorded_on)
        return `${Math.max(0, Math.round(end.diff(start, 'minutes', true)))} min`
      })()
    : '—',
}))

async function loadOfficers() {
  try {
    const response = await officerApi.getOfficers({ include_inactive: false, sort_by: 'first_name', sort_dir: 'asc' }, { showLoading: false })
    officers.value = response.officers || []
  } catch {
    officers.value = []
  }
}

async function loadHistory() {
  if (!selectedOfficerId.value) {
    error.value = 'Please select an officer.'
    return
  }
  error.value = ''
  loading.value = true
  loaded.value = false
  selectedPointIndex.value = null
  try {
    const response = await trackingApi.getOfficerRouteHistory({
      officer_id: selectedOfficerId.value,
      date_from: localToUtc(dateFrom.value).format('YYYY-MM-DD HH:mm:ss'),
      date_to: localToUtc(dateTo.value).format('YYYY-MM-DD HH:mm:ss'),
      ...(shiftId.value ? { shift_id: Number(shiftId.value) } : {}),
    })
    points.value = response.points || []
    loaded.value = true
    await nextTick()
    window.setTimeout(() => googleMapRef.value?.fitToVisibleMarkers(), 300)
  } catch (err: any) {
    error.value = err?.message || 'Failed to load route history'
    points.value = []
  } finally {
    loading.value = false
  }
}

const officerName = (o: Officer) => [o.first_name, o.last_name].filter(Boolean).join(' ')

onMounted(async () => {
  await loadOfficers()
  const preselect = typeof route.query.officer_id === 'string' ? route.query.officer_id : ''
  if (preselect && officers.value.some(o => o.user_id === preselect)) {
    selectedOfficerId.value = preselect
    await loadHistory()
  }
})
</script>

<template>
  <AppHeader
    title="Route History"
    :breadcrumb="[{ label: 'Live Tracking' }, { label: 'Route History' }]"
  />

  <div class="route-history">
    <TrackingTabs />

    <div class="history-filters">
      <label class="filter-field">
        <span>Officer</span>
        <select v-model="selectedOfficerId">
          <option value="" disabled>Select officer</option>
          <option v-for="officer in officers" :key="officer.user_id" :value="officer.user_id">
            {{ officerName(officer) }}<template v-if="officer.community_name"> — {{ officer.community_name }}</template>
          </option>
        </select>
      </label>

      <label class="filter-field">
        <span>From</span>
        <input v-model="dateFrom" type="datetime-local" />
      </label>

      <label class="filter-field">
        <span>To</span>
        <input v-model="dateTo" type="datetime-local" />
      </label>

      <label class="filter-field filter-field--narrow">
        <span>Shift ID (optional)</span>
        <input v-model="shiftId" type="number" min="0" placeholder="All" />
      </label>

      <button class="btn btn--primary" :disabled="loading || !selectedOfficerId" @click="loadHistory">
        <Icon v-if="loading" name="lucide:loader-circle" :size="14" class="spinning" />
        <Icon v-else name="lucide:search" :size="14" />
        Load Route
      </button>
    </div>

    <div v-if="error" class="history-error">
      <Icon name="lucide:alert-circle" :size="16" />
      <span>{{ error }}</span>
    </div>

    <div class="history-map">
      <GoogleMap
        ref="googleMapRef"
        :center="{ lat: 10.785, lng: 106.634 }"
        :zoom="13"
        :markers="endpointMarkers"
        :routes="routes"
        :waypoints="waypoints"
        @waypoint-click="onWaypointClick"
      />

      <div class="map-toolbar">
        <button type="button" class="toolbar-btn" :disabled="!points.length" @click="exportCsv">
          <Icon name="lucide:file-spreadsheet" :size="14" />
          CSV
        </button>
        <button type="button" class="toolbar-btn" :disabled="!points.length" @click="exportGpx">
          <Icon name="lucide:file-down" :size="14" />
          GPX
        </button>
        <button type="button" class="toolbar-btn" :disabled="!points.length" @click="googleMapRef?.fitToVisibleMarkers()">
          <Icon name="lucide:maximize" :size="14" />
          Zoom to fit
        </button>
      </div>

      <div v-if="selectedPoint" class="point-panel">
        <div class="point-panel__header">
          <span>Point {{ (selectedPointIndex ?? 0) + 1 }}</span>
          <button type="button" class="point-panel__close" @click="selectedPointIndex = null">
            <Icon name="lucide:x" :size="14" />
          </button>
        </div>
        <div class="point-panel__rows">
          <div class="point-row"><span>Time</span><strong>{{ utcToLocal(selectedPoint.recorded_on).format('DD MMM YYYY HH:mm:ss') }}</strong></div>
          <div class="point-row"><span>Speed</span><strong>{{ formatPointSpeed(selectedPoint.speed) }}</strong></div>
          <div class="point-row"><span>Heading</span><strong>{{ formatHeading(selectedPoint.heading) }}</strong></div>
          <div class="point-row"><span>Accuracy</span><strong>{{ selectedPoint.accuracy == null ? '—' : `±${Math.round(selectedPoint.accuracy)} m` }}</strong></div>
          <div class="point-row"><span>Altitude</span><strong>{{ selectedPoint.altitude == null ? '—' : `${Math.round(selectedPoint.altitude)} m` }}</strong></div>
          <div class="point-row"><span>Source</span><strong>{{ selectedPoint.source }}</strong></div>
          <div class="point-row"><span>Coordinates</span><strong>{{ selectedPoint.latitude.toFixed(6) }}, {{ selectedPoint.longitude.toFixed(6) }}</strong></div>
          <div class="point-row"><span>Shift</span><strong>{{ selectedPoint.shift_id ? `#${selectedPoint.shift_id}` : '—' }}</strong></div>
          <div class="point-row"><span>Call</span><strong>{{ selectedPoint.call_id ? `#${selectedPoint.call_id}` : '—' }}</strong></div>
        </div>
      </div>

      <div v-if="loaded" class="history-legend">
        <div class="legend-item"><span class="legend-dot" style="background:#22c55e" />Vehicle (&gt;2.5 m/s)</div>
        <div class="legend-item"><span class="legend-dot" style="background:#0D6EFD" />Walking (0.5–2.5 m/s)</div>
        <div class="legend-item"><span class="legend-dot" style="background:#6C757D" />Stationary (&lt;0.5 m/s)</div>
        <div class="legend-item"><span class="legend-dot" style="background:#DC3545" />Responding to call</div>
      </div>

      <div v-if="loaded" class="history-stats">
        <div class="stat"><span class="stat-value">{{ stats.count }}</span><span class="stat-label">GPS points</span></div>
        <div class="stat"><span class="stat-value">{{ stats.distance }}</span><span class="stat-label">Distance</span></div>
        <div class="stat"><span class="stat-value">{{ stats.duration }}</span><span class="stat-label">Duration</span></div>
      </div>

      <div v-if="loaded && !points.length" class="history-empty">
        <Icon name="lucide:map-pin-off" :size="32" />
        <span>No GPS points in this time range</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.history-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.filter-field select,
.filter-field input {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 180px;
  color-scheme: dark;
}

.filter-field--narrow input { min-width: 110px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: var(--color-accent); color: var(--color-bg-base); }

.history-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  color: var(--color-error, #ef4444);
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--color-border);
}

.history-map {
  position: relative;
  flex: 1;
  min-height: 0;
}

.map-toolbar {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: 10;
  display: flex;
  gap: var(--space-2);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
}

.toolbar-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.point-panel {
  position: absolute;
  top: 72px;
  right: var(--space-3);
  z-index: 10;
  width: 250px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.point-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.point-panel__close {
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
}

.point-panel__close:hover { color: var(--color-text-primary); }

.point-panel__rows {
  display: flex;
  flex-direction: column;
  padding: var(--space-2) var(--space-3);
  gap: var(--space-1);
}

.point-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
}

.point-row span { color: var(--color-text-muted); }
.point-row strong { color: var(--color-text-primary); font-weight: 500; text-align: right; }

.history-legend {
  position: absolute;
  left: var(--space-3);
  bottom: var(--space-3);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.legend-item { display: flex; align-items: center; gap: var(--space-2); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

.history-stats {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 10;
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.stat { display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-primary); }
.stat-label { font-size: var(--font-size-xs); color: var(--color-text-muted); }

.history-empty {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  pointer-events: none;
}

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
