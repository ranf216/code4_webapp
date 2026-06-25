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

interface EmergencyCallMarker {
  lat: number
  lng: number
  id: string
}

interface CommunityBoundary {
  name: string
  paths: { lat: number; lng: number }[]
}

const emit = defineEmits<{
  (e: 'marker-click', marker: MarkerData): void
}>()

const props = withDefaults(defineProps<{
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: MarkerData[]
  routes?: RouteOverlay[]
  waypoints?: WaypointMarker[]
  posts?: PostMarker[]
  emergencyCalls?: EmergencyCallMarker[]
  boundaries?: CommunityBoundary[]
  height?: string
}>(), {
  center: () => ({ lat: 34.0522, lng: -118.2437 }),
  zoom: 15,
  markers: () => [],
  routes: () => [],
  waypoints: () => [],
  posts: () => [],
  emergencyCalls: () => [],
  boundaries: () => [],
  height: '100%',
})

const config = useRuntimeConfig()
const mapEl = ref<HTMLElement | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)

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
    })

    const { AdvancedMarkerElement } = await importLibrary('marker') as google.maps.MarkerLibrary

    console.log('[GoogleMap] layers:', {
      boundaries: props.boundaries.length,
      routes: props.routes.length,
      waypoints: props.waypoints.length,
      posts: props.posts.length,
      emergencyCalls: props.emergencyCalls.length,
      markers: props.markers.length,
    })

    // Community boundaries
    for (const b of props.boundaries) {
      new google.maps.Polygon({
        map,
        paths: b.paths,
        strokeColor: '#4f6ef7',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4f6ef7',
        fillOpacity: 0.05,
      })
    }

    // Patrol route overlays
    for (const r of props.routes) {
      new google.maps.Polyline({
        map,
        path: r.path,
        geodesic: true,
        strokeColor: r.color || '#6b7280',
        strokeOpacity: 0.8,
        strokeWeight: 3,
      })
      if (r.traveledPath && r.traveledPath.length > 0) {
        new google.maps.Polyline({
          map,
          path: r.traveledPath,
          geodesic: true,
          strokeColor: r.color || '#22c55e',
          strokeOpacity: 1,
          strokeWeight: 4,
        })
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
      new AdvancedMarkerElement({
        map,
        position: { lat: w.lat, lng: w.lng },
        content: el,
        title: w.visited ? `Waypoint ${w.number} - visited` : `Waypoint ${w.number} - pending`,
      })
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
      new AdvancedMarkerElement({
        map,
        position: { lat: p.lat, lng: p.lng },
        content: el,
        title: p.type,
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
      new AdvancedMarkerElement({
        map,
        position: { lat: c.lat, lng: c.lng },
        content: el,
        title: `Emergency call ${c.id}`,
      })
    }

    // Officer markers (rendered last to stay on top)
    console.log('[GoogleMap] rendering markers:', props.markers.length, props.markers)
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
      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: m.lat, lng: m.lng },
        content: pin,
        title: m.label || m.status,
      })
      marker.addEventListener('gmp-click', () => emit('marker-click', m))
      pin.addEventListener('click', (e: Event) => {
        e.stopPropagation()
        emit('marker-click', m)
      })
    }
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
