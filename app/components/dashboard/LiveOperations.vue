<script setup lang="ts">
import { trackingApi } from '~/api/tracking'
import type { LiveTrackingOfficer } from '~/api/types/tracking'

const liveOpsRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const officers = ref<LiveTrackingOfficer[]>([])
const loading = ref(true)
const error = ref('')
const mapCenter = ref({ lat: 34.0522, lng: -118.2437 })
const mapZoom = ref(4)

const markers = computed(() => officers.value.map((officer: LiveTrackingOfficer) => ({
  id: officer.officer_id,
  lat: officer.latitude,
  lng: officer.longitude,
  status: officer.status,
  label: [officer.first_name, officer.last_name].filter(Boolean).join(' ') || officer.officer_id,
  initials: [officer.first_name, officer.last_name]
    .filter(Boolean)
    .map((name: string) => name.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || '—',
  image: officer.image,
  heading: officer.heading,
  activeCallCategory: officer.active_call_category,
})))

watch(
  officers,
  (newOfficers: LiveTrackingOfficer[], oldOfficers: LiveTrackingOfficer[] | undefined) => {
    if (newOfficers.length && !oldOfficers?.length) {
      const first = newOfficers[0]!
      mapCenter.value = { lat: first.latitude, lng: first.longitude }
      mapZoom.value = 15
    }
  },
  { flush: 'post' },
)

async function loadLiveOps() {
  loading.value = true
  error.value = ''
  try {
    const response = await trackingApi.getLiveTracking({}, { showLoading: false })
    if (response.rc === 0) {
      officers.value = response.officers ?? []
    } else {
      error.value = response.message || 'Unable to load live tracking data.'
    }
  } catch {
    error.value = 'Unable to load live tracking data.'
  } finally {
    loading.value = false
  }
}

function updateFullscreenState() {
  isFullscreen.value = document.fullscreenElement === liveOpsRef.value
}

async function toggleFullscreen() {
  if (!liveOpsRef.value) return
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await liveOpsRef.value.requestFullscreen()
  } catch (error) {
    console.error('Failed to toggle fullscreen:', error)
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState)
  loadLiveOps()
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState)
})
</script>

<template>
  <div ref="liveOpsRef" class="live-ops card">
    <!-- Header -->
    <div class="live-ops__header">
      <span class="live-ops__title">LIVE OPERATIONS</span>
      <div class="live-ops__actions">
        <!-- <span class="live-badge">
          <span class="live-badge__dot" />
          Live
        </span> -->
        <NuxtLink to="/live-tracking" class="live-ops__link" title="Open Live Tracking">
          <Icon name="lucide:map" :size="14" />
          <span class="live-ops__link-text">Live Tracking</span>
        </NuxtLink>
        <button class="live-ops__fullscreen" @click="toggleFullscreen">
          <Icon :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'" :size="14" />
          {{ isFullscreen ? 'Exit full screen' : 'Open full screen' }}
        </button>
      </div>
    </div>

    <!-- Map -->
    <div class="live-ops__map">
      <div v-if="loading" class="live-ops__loading">
        <Icon name="lucide:loader-circle" :size="24" class="live-ops__loading-spin" />
        <span>Loading live operations…</span>
      </div>
      <div v-else-if="error" class="live-ops__error">
        <Icon name="lucide:alert-circle" :size="20" />
        <span>{{ error }}</span>
      </div>
      <GoogleMap
        v-else
        :center="mapCenter"
        :zoom="mapZoom"
        :markers="markers"
        height="100%"
      />
    </div>
  </div>
</template>

<style scoped>
.live-ops {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.live-ops:fullscreen {
  width: 100vw;
  height: 100vh;
  background: var(--color-bg-surface);
}
.live-ops__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.live-ops__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.live-ops__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px var(--space-2);
  background: rgba(17, 156, 166, 0.12);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: #119ca6;
}
.live-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #119ca6;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.live-ops__fullscreen {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-base);
  font-weight: 500;
  padding: 5px var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-base);
  font-family: var(--font-family);
  margin: 0px;
}
.live-ops__fullscreen:hover {
  background: var(--color-bg-overlay);
}
.live-ops__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-base);
  font-weight: 500;
  padding: 5px var(--space-3);
  background: var(--color-accent-subtle);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  cursor: pointer;
  transition: background var(--transition-base);
  text-decoration: none;
}
.live-ops__link:hover {
  background: var(--color-accent);
  color: #fff;
}

.live-ops__map {
  flex: 1;
  min-height: 300px;
  background: var(--color-bg-elevated);
  position: relative;
  overflow: hidden;
}
.live-ops__loading,
.live-ops__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
.live-ops__error {
  color: var(--color-critical);
}
.live-ops__loading-spin {
  animation: spin 1s linear infinite;
}
.live-ops__map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  opacity: 0.4;
}
.live-ops__zoom {
  position: absolute;
  right: var(--space-3);
  bottom: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.live-ops__zoom-btn {
  width: 26px;
  height: 26px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-base);
}
.live-ops__zoom-btn:hover { background: var(--color-bg-overlay); }
</style>
