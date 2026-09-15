<script setup lang="ts">
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface MarkerData {
  lat: number
  lng: number
  status: 'active' | 'responding' | 'idle' | 'offduty' | 'gps-lost' | 'skipped'
  label?: string
}

interface RouteOverlay {
  id: string
  label: string
  path: { lat: number; lng: number }[]
  traveledPath?: { lat: number; lng: number }[]
  color?: string
}

interface WaypointMarker {
  number: number
  lat: number
  lng: number
  visited?: boolean
}

interface PostMarker {
  lat: number
  lng: number
  type: string
}

interface WorkspaceMarker {
  id: string
  lat: number
  lng: number
  type: 'asset' | 'post' | 'zone'
  label: string
  color?: string
  active?: boolean
  shape?: 'place' | 'circle' | 'line' | 'polygon'
  radius?: number
  points?: { lat: number; lng: number }[]
  zoneType?: 'entry_exit' | 'high_priority'
}

interface EmergencyCallMarker {
  lat: number
  lng: number
  id: string
}

interface CommunityBoundary {
  name: string
  paths: { lat: number; lng: number }[]
}

interface GeoPoint {
  lat: number
  lng: number
}

const emit = defineEmits<{
  (e: 'marker-click', marker: MarkerData): void
  (e: 'workspace-marker-click', marker: WorkspaceMarker): void
  (e: 'draw-click' | 'draw-mousedown' | 'draw-mousemove' | 'draw-mouseup', point: GeoPoint): void
  (e: 'draw-double-click'): void
  (e: 'draw-point-remove', index: number): void
}>()

const props = withDefaults(defineProps<{
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: MarkerData[]
  routes?: RouteOverlay[]
  waypoints?: WaypointMarker[]
  posts?: PostMarker[]
  workspaceMarkers?: WorkspaceMarker[]
  emergencyCalls?: EmergencyCallMarker[]
  boundaries?: CommunityBoundary[]
  height?: string
  drawingMode?: 'place' | 'circle' | 'line' | 'polygon' | null
  drawingPoints?: GeoPoint[]
  drawingCircleCenter?: GeoPoint | null
  drawingCircleRadius?: number
}>(), {
  center: () => ({ lat: 34.0522, lng: -118.2437 }),
  zoom: 15,
  markers: () => [],
  routes: () => [],
  waypoints: () => [],
  posts: () => [],
  workspaceMarkers: () => [],
  emergencyCalls: () => [],
  boundaries: () => [],
  height: '100%',
  drawingMode: null,
  drawingPoints: () => [],
  drawingCircleCenter: null,
  drawingCircleRadius: 0,
})

const config = useRuntimeConfig()
const mapEl = ref<HTMLElement | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)
let mapInstance: google.maps.Map | null = null
let advancedMarkerCtor: typeof google.maps.marker.AdvancedMarkerElement | null = null
let drawingPathPreview: google.maps.Polyline | google.maps.Polygon | null = null
let drawingCirclePreview: google.maps.Circle | null = null
let drawingPointMarkers: google.maps.marker.AdvancedMarkerElement[] = []

function clearDrawingPreview() {
  drawingPathPreview?.setMap(null)
  drawingCirclePreview?.setMap(null)
  drawingPointMarkers.forEach(marker => { marker.map = null })
  drawingPathPreview = null
  drawingCirclePreview = null
  drawingPointMarkers = []
}

function renderDrawingPreview() {
  if (!mapInstance) return
  clearDrawingPreview()
  if (props.drawingMode === 'place' && props.drawingPoints.length && advancedMarkerCtor) {
    drawingPointMarkers = props.drawingPoints.map((point, index) => {
      const pin = document.createElement('button')
      pin.type = 'button'
      pin.style.cssText = `
        display:flex;align-items:center;justify-content:center;
        width:26px;height:26px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);background:#0D6EFD;border:2px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.45);cursor:pointer;padding:0;
      `
      const num = document.createElement('span')
      num.style.cssText = 'transform:rotate(45deg);color:#fff;font:700 11px sans-serif;'
      num.textContent = String(index + 1)
      pin.append(num)
      const marker = new advancedMarkerCtor!({
        map: mapInstance,
        position: point,
        content: pin,
        title: `Point ${index + 1} — click to remove`,
      })
      pin.addEventListener('click', (event) => {
        event.stopPropagation()
        emit('draw-point-remove', index)
      })
      return marker
    })
  }
  if ((props.drawingMode === 'line' || props.drawingMode === 'polygon') && props.drawingPoints.length) {
    drawingPathPreview = props.drawingMode === 'polygon'
      ? new google.maps.Polygon({
          map: mapInstance,
          paths: props.drawingPoints,
          fillColor: '#DC3545',
          fillOpacity: 0.2,
          strokeColor: '#DC3545',
          strokeOpacity: 0.9,
          strokeWeight: 2,
        })
      : new google.maps.Polyline({
          map: mapInstance,
          path: props.drawingPoints,
          geodesic: true,
          strokeColor: '#0D6EFD',
          strokeOpacity: 0.9,
          strokeWeight: 3,
        })
  }
  if (props.drawingMode === 'circle' && props.drawingCircleCenter && props.drawingCircleRadius > 0) {
    drawingCirclePreview = new google.maps.Circle({
      map: mapInstance,
      center: props.drawingCircleCenter,
      radius: props.drawingCircleRadius,
      fillColor: '#0D6EFD',
      fillOpacity: 0.18,
      strokeColor: '#0D6EFD',
      strokeOpacity: 0.9,
      strokeWeight: 2,
    })
  }
}

type OverlayLike = { setMap: (map: google.maps.Map | null) => void } | google.maps.marker.AdvancedMarkerElement

const overlayObjects: OverlayLike[] = []

function trackOverlay<T extends OverlayLike>(overlay: T): T {
  overlayObjects.push(overlay)
  return overlay
}

function setOverlayMap(overlay: OverlayLike, map: google.maps.Map | null) {
  if (typeof (overlay as { setMap?: unknown }).setMap === 'function') {
    ;(overlay as { setMap: (m: google.maps.Map | null) => void }).setMap(map)
  } else {
    ;(overlay as google.maps.marker.AdvancedMarkerElement).map = map
  }
}

function clearOverlays() {
  for (const overlay of overlayObjects) setOverlayMap(overlay, null)
  overlayObjects.length = 0
}

function renderOverlays() {
  if (!mapInstance || !advancedMarkerCtor) return
  const map = mapInstance
  const AdvancedMarkerElement = advancedMarkerCtor
  clearOverlays()

  // Community boundaries
  for (const b of props.boundaries) {
    trackOverlay(new google.maps.Polygon({
      map,
      paths: b.paths,
      strokeColor: '#4f6ef7',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#4f6ef7',
      fillOpacity: 0.05,
    }))
  }

  // Patrol route overlays
  for (const r of props.routes) {
    trackOverlay(new google.maps.Polyline({
      map,
      path: r.path,
      geodesic: true,
      strokeColor: r.color || '#6b7280',
      strokeOpacity: 0.8,
      strokeWeight: 3,
    }))
    if (r.traveledPath && r.traveledPath.length > 0) {
      trackOverlay(new google.maps.Polyline({
        map,
        path: r.traveledPath,
        geodesic: true,
        strokeColor: r.color || '#22c55e',
        strokeOpacity: 1,
        strokeWeight: 4,
      }))
    }
  }

  // Waypoint markers
  for (const w of props.waypoints) {
    const el = document.createElement('div')
    el.style.cssText = `
      display:flex;align-items:center;justify-content:center;
      width:24px;height:24px;border-radius:50%;
      background:${w.visited ? '#22c55e' : '#1f2937'};
      border:2px solid ${w.visited ? '#22c55e' : '#fff'};
      color:#fff;font-size:11px;font-weight:700;
      font-family:sans-serif;position:relative;z-index:10;
    `
    el.textContent = String(w.number)
    trackOverlay(new AdvancedMarkerElement({
      map,
      position: { lat: w.lat, lng: w.lng },
      content: el,
      title: w.visited ? `Waypoint ${w.number} - visited` : `Waypoint ${w.number} - pending`,
    }))
  }

  // Post markers
  for (const p of props.posts) {
    const el = document.createElement('div')
    el.style.cssText = `
      display:flex;align-items:center;justify-content:center;
      width:16px;height:16px;border-radius:4px;
      background:#3b82f6;border:1px solid #fff;
      box-shadow:0 0 4px #3b82f6;position:relative;z-index:10;
    `
    trackOverlay(new AdvancedMarkerElement({
      map,
      position: { lat: p.lat, lng: p.lng },
      content: el,
      title: p.type,
    }))
  }

  for (const item of props.workspaceMarkers) {
    const color = item.color ?? (item.type === 'asset' ? '#0D6EFD' : item.type === 'post' ? '#0D6EFD' : '#198754')
    const position = { lat: item.lat, lng: item.lng }
    const emitItemClick = () => emit('workspace-marker-click', item)

    if (item.shape === 'circle' && item.radius) {
      const circle = trackOverlay(new google.maps.Circle({
        map,
        center: position,
        radius: item.radius,
        fillColor: color,
        fillOpacity: 0.16,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
      }))
      circle.addListener('click', emitItemClick)
    }

    if (item.shape === 'line' && item.points?.length) {
      const line = trackOverlay(new google.maps.Polyline({
        map,
        path: item.points,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.85,
        strokeWeight: 3,
      }))
      line.addListener('click', emitItemClick)
    }

    if (item.shape === 'polygon' && item.points?.length) {
      const isEntryExit = item.zoneType === 'entry_exit'
      const polygon = trackOverlay(new google.maps.Polygon({
        map,
        paths: item.points,
        fillColor: color,
        fillOpacity: 0.2,
        strokeColor: color,
        strokeOpacity: isEntryExit ? 0 : 0.9,
        strokeWeight: 2,
      }))
      polygon.addListener('click', emitItemClick)

      if (isEntryExit) {
        const firstPoint = item.points[0]
        if (!firstPoint) continue
        const closedPath = [...item.points, firstPoint]
        trackOverlay(new google.maps.Polyline({
          map,
          path: closedPath,
          geodesic: true,
          strokeOpacity: 0,
          icons: [{
            icon: {
              path: 'M 0,-1 0 1',
              strokeColor: color,
              strokeOpacity: 0.9,
              scale: 2,
            },
            offset: '0',
            repeat: '10px',
          }],
        }))
      }
    }

    const el = document.createElement('button')
    const pin = document.createElement('span')
    const label = document.createElement('span')
    el.type = 'button'
    el.style.cssText = `
      display:flex;align-items:center;gap:4px;padding:0;background:transparent;
      border:0;cursor:pointer;opacity:${item.active === false ? '.4' : '1'};
    `
    pin.style.cssText = `
      display:flex;align-items:center;justify-content:center;width:34px;height:34px;
      border-radius:${item.type === 'asset' ? '8px' : '50%'};background:${color};
      border:2px solid #fff;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.45);
      font:700 12px sans-serif;flex-shrink:0;
    `
    pin.textContent = item.type === 'asset' ? 'A' : item.type === 'post' ? 'P' : 'Z'
    label.style.cssText = `
      max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      padding:2px 5px;border-radius:4px;background:rgba(13,17,23,.82);color:#fff;
      font:500 11px sans-serif;text-decoration:${item.active === false ? 'line-through' : 'none'};
    `
    label.textContent = item.label
    el.append(pin, label)
    const marker = trackOverlay(new AdvancedMarkerElement({
      map,
      position,
      content: el,
      title: item.label,
    }))
    marker.addEventListener('gmp-click', emitItemClick)
    el.addEventListener('click', (event) => {
      event.stopPropagation()
      emitItemClick()
    })
  }

  // Emergency call markers
  for (const c of props.emergencyCalls) {
    const el = document.createElement('div')
    el.style.cssText = `
      width:18px;height:18px;border-radius:50%;
      background:#ef4444;border:2px solid #fff;
      box-shadow:0 0 0 0 rgba(239,68,68,0.7);
      animation:pulse 1.5s infinite;position:relative;z-index:10;
    `
    trackOverlay(new AdvancedMarkerElement({
      map,
      position: { lat: c.lat, lng: c.lng },
      content: el,
      title: `Emergency call ${c.id}`,
    }))
  }

  // Officer markers (rendered last to stay on top)
  for (const m of props.markers) {
    const color = statusColor[m.status] ?? statusColor.idle
    const pin = document.createElement('div')
    pin.style.cssText = `
      display:flex;align-items:center;justify-content:center;
      width:40px;height:40px;border-radius:50%;
      background:${color};
      border:3px solid rgba(255,255,255,0.95);
      box-shadow:0 0 14px ${color};
      color:#fff;font-size:13px;font-weight:700;
      font-family:sans-serif;cursor:pointer;
      position:relative;z-index:100;
    `
    pin.textContent = m.label ? m.label.slice(0, 2).toUpperCase() : ''
    const marker = trackOverlay(new AdvancedMarkerElement({
      map,
      position: { lat: m.lat, lng: m.lng },
      content: pin,
      title: m.label || m.status,
    }))
    marker.addEventListener('gmp-click', () => emit('marker-click', m))
    pin.addEventListener('click', (e: Event) => {
      e.stopPropagation()
      emit('marker-click', m)
    })
  }
}

watch(
  () => [props.drawingMode, props.drawingPoints, props.drawingCircleCenter, props.drawingCircleRadius] as const,
  () => {
    mapInstance?.setOptions({
      draggableCursor: props.drawingMode ? 'crosshair' : undefined,
      gestureHandling: props.drawingMode ? 'none' : 'auto',
      disableDoubleClickZoom: !!props.drawingMode,
    })
    renderDrawingPreview()
  },
  { deep: true },
)

watch(
  () => [props.boundaries, props.routes, props.waypoints, props.posts, props.workspaceMarkers, props.emergencyCalls, props.markers] as const,
  () => renderOverlays(),
  { deep: true },
)

onUnmounted(() => {
  clearDrawingPreview()
  clearOverlays()
  if (mapInstance) google.maps.event.clearInstanceListeners(mapInstance)
  mapInstance = null
})

const statusColor: Record<string, string> = {
  active:     '#22c55e', // Green
  responding: '#4f6ef7', // Blue
  idle:       '#f59e0b', // Amber (GPS lost/stale)
  offduty:    '#6b7280', // Grey
  skipped:    '#ef4444', // Red
}

const darkMapStyles = [
  { elementType: 'geometry',          stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill',  stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'road',              elementType: 'geometry',        stylers: [{ color: '#1e2330' }] },
  { featureType: 'road',              elementType: 'geometry.stroke', stylers: [{ color: '#111318' }] },
  { featureType: 'road.highway',      elementType: 'geometry',        stylers: [{ color: '#232938' }] },
  { featureType: 'water',             elementType: 'geometry',        stylers: [{ color: '#0a0c10' }] },
  { featureType: 'poi',               elementType: 'geometry',        stylers: [{ color: '#111318' }] },
  { featureType: 'poi',               elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',           elementType: 'geometry',        stylers: [{ color: '#1a1f2e' }] },
  { featureType: 'landscape',         elementType: 'geometry',        stylers: [{ color: '#111318' }] },
  { featureType: 'administrative',    elementType: 'geometry.stroke', stylers: [{ color: '#2a3050' }] },
]

onMounted(async () => {
  let apiKey = config.public.googleMapsApiKey as string
  console.log('[GoogleMap] using key from env:', apiKey ? apiKey.slice(0, 15) + '...' : 'EMPTY')
  if (!apiKey) {
    // error.value = 'Google Maps API key not configured.'
    // loading.value = false
    // return
    console.log('[GoogleMap] using fallback key')
    apiKey = "AIzaSyBy6KTyoRF0qaKEs0gEhnhKiZpTxKTAkV4"
  }

  try {
    console.log('[GoogleMap] setOptions with key:', apiKey.slice(0, 10) + '...')
    setOptions({ key: apiKey, v: 'weekly' })
    console.log('[GoogleMap] importing maps library...')
    const { Map } = await importLibrary('maps') as google.maps.MapsLibrary
    console.log('[GoogleMap] maps library loaded')

    loading.value = false
    await nextTick()

    console.log('[GoogleMap] mapEl:', mapEl.value)
    if (!mapEl.value) {
      error.value = 'Map container not found.'
      console.error('[GoogleMap] mapEl is null after nextTick')
      return
    }

    console.log('[GoogleMap] creating map...')
    const map = new Map(mapEl.value, {
      center: props.center,
      zoom: props.zoom,
      disableDefaultUI: true,
      zoomControl: false,
      styles: darkMapStyles,
      mapId: 'live-tracking-map',
      gestureHandling: props.drawingMode ? 'none' : 'auto',
      disableDoubleClickZoom: !!props.drawingMode,
      draggableCursor: props.drawingMode ? 'crosshair' : undefined,
    })
    mapInstance = map
    const emitPoint = (eventName: 'draw-click' | 'draw-mousedown' | 'draw-mousemove' | 'draw-mouseup', event: google.maps.MapMouseEvent) => {
      if (!props.drawingMode || !event.latLng) return
      emit(eventName, { lat: event.latLng.lat(), lng: event.latLng.lng() })
    }
    map.addListener('click', (event: google.maps.MapMouseEvent) => emitPoint('draw-click', event))
    map.addListener('dblclick', () => {
      if (props.drawingMode) emit('draw-double-click')
    })
    map.addListener('mousedown', (event: google.maps.MapMouseEvent) => emitPoint('draw-mousedown', event))
    map.addListener('mousemove', (event: google.maps.MapMouseEvent) => emitPoint('draw-mousemove', event))
    map.addListener('mouseup', (event: google.maps.MapMouseEvent) => emitPoint('draw-mouseup', event))

    const { AdvancedMarkerElement } = await importLibrary('marker') as google.maps.MarkerLibrary
    advancedMarkerCtor = AdvancedMarkerElement
    renderDrawingPreview()

    console.log('[GoogleMap] layers:', {
      boundaries: props.boundaries.length,
      routes: props.routes.length,
      waypoints: props.waypoints.length,
      posts: props.posts.length,
      emergencyCalls: props.emergencyCalls.length,
      markers: props.markers.length,
    })

    renderOverlays()
  } catch (e) {
    error.value = 'Failed to load Google Maps.'
    loading.value = false
    console.error(e)
  }
})
</script>

<template>
  <div class="gmap-wrap" :style="{ height }">
    <!-- Loading -->
    <div v-if="loading" class="gmap-state">
      <Icon name="lucide:loader-circle" :size="24" class="gmap-state__spin text-muted" />
      <span class="text-sm text-muted">Loading map…</span>
    </div>

    <!-- Error / no key -->
    <div v-else-if="error" class="gmap-state">
      <Icon name="lucide:map-off" :size="28" class="text-muted" />
      <span class="text-sm text-muted">{{ error }}</span>
      <span class="text-xs text-muted">Set NUXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env</span>
    </div>

    <!-- Map (always in DOM so Google Maps can attach) -->
    <div ref="mapEl" class="gmap-el" />
  </div>
</template>

<style scoped>
.gmap-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--color-bg-elevated);
}
.gmap-el {
  width: 100%;
  height: 100%;
}
.gmap-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}
.gmap-state__spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
</style>
