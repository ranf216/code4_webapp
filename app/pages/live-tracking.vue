<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { officerApi } from '~/api/officer'
import type { Officer as ApiOfficer, OfficerEvaluation } from '~/api/types/officer'
import { useTranslation } from '~/composables/useI18n'
import { useMapRefresh } from '~/composables/useMapRefresh'

definePageMeta({ layout: 'default' })

const { t } = useTranslation()

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

interface OfficerMarker {
  id: string
  lat: number
  lng: number
  status: 'active' | 'responding' | 'idle' | 'offduty' | 'skipped' | 'gps-lost'
  label: string
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

const routeColors = ['#22c55e', '#4f6ef7']
const demoLocations = [
  { lat: 10.7775, lng: 106.7012 },
  { lat: 10.7762, lng: 106.7005 },
  { lat: 10.7782, lng: 106.7008 },
  { lat: 10.7758, lng: 106.7015 },
  { lat: 10.7765, lng: 106.6998 },
  { lat: 10.7779, lng: 106.6999 },
  { lat: 10.7759, lng: 106.7001 },
  { lat: 10.7771, lng: 106.7020 },
]
const apiOfficers = ref<ApiOfficer[]>([])

const officerName = (officer: ApiOfficer) => [officer.first_name, officer.last_name].filter(Boolean).join(' ')
const officerInitials = (officer: ApiOfficer) => [officer.first_name, officer.last_name]
  .filter(Boolean)
  .map((name) => name.charAt(0).toUpperCase())
  .join('')
  .slice(0, 2)
const communities = computed(() => Array.from(new Set(apiOfficers.value.map((officer) => officer.community_name).filter((name): name is string => !!name))))
const allOfficers = computed(() => apiOfficers.value.map(officerName))

const filters = ref({
  community: '',
  selectedOfficers: [] as string[],
  showOfficers: true,
  showRoutes: true,
  showEmergencyCalls: true,
  showPosts: true,
  onDutyOnly: true,
})

async function loadOfficers() {
  try {
    const response = await officerApi.getOfficers({ include_inactive: true }, { showLoading: false })
    if (response.rc === 0) apiOfficers.value = response.officers || []
  } catch (error) {
    console.error('Failed to load officers for live tracking:', error)
  }
}

const { interval: refreshInterval, secondsAgo, refreshNow } = useMapRefresh(loadOfficers)

const officers = computed((): OfficerMarker[] => apiOfficers.value.map((officer, index) => ({
  id: officer.user_id,
  ...demoLocations[index % demoLocations.length]!,
  status: officer.is_active ? 'active' : 'offduty',
  label: officerName(officer),
})))

const routes = computed((): RouteOverlay[] => {
  return [
    {
      id: 'route-1',
      label: 'John Smith - Sunset Gardens',
      path: [
        { lat: 10.7775, lng: 106.7012 },
        { lat: 10.7780, lng: 106.7018 },
        { lat: 10.7785, lng: 106.7022 },
        { lat: 10.7782, lng: 106.7008 },
      ],
      traveledPath: [
        { lat: 10.7775, lng: 106.7012 },
        { lat: 10.7780, lng: 106.7018 },
      ],
      color: routeColors[0],
    },
    {
      id: 'route-2',
      label: 'Mike Chen - Downtown Plaza',
      path: [
        { lat: 10.7762, lng: 106.7005 },
        { lat: 10.7768, lng: 106.7010 },
        { lat: 10.7765, lng: 106.7015 },
      ],
      traveledPath: [
        { lat: 10.7762, lng: 106.7005 },
      ],
      color: routeColors[1],
    },
  ]
})

const waypoints = computed((): WaypointMarker[] => {
  return [
    { number: 1, lat: 10.7780, lng: 106.7018, visited: true },
    { number: 2, lat: 10.7785, lng: 106.7022, visited: false },
    { number: 3, lat: 10.7782, lng: 106.7008, visited: false },
    { number: 4, lat: 10.7768, lng: 106.7010, visited: true },
    { number: 5, lat: 10.7765, lng: 106.7015, visited: false },
  ]
})

const posts = computed((): PostMarker[] => {
  return [
    { lat: 10.7778, lng: 106.7015, type: 'Main Gate' },
    { lat: 10.7765, lng: 106.7002, type: 'Entrance' },
  ]
})

const emergencyCalls = computed((): EmergencyCallMarker[] => {
  return [
    { lat: 10.7773, lng: 106.7018, id: 'EMG-001' },
  ]
})

const boundaries = computed((): CommunityBoundary[] => {
  const list = [
    {
      name: 'Sunset Gardens',
      paths: [
        { lat: 10.7755, lng: 106.6995 },
        { lat: 10.7755, lng: 106.7025 },
        { lat: 10.7785, lng: 106.7025 },
        { lat: 10.7785, lng: 106.6995 },
      ],
    },
  ]
  if (filters.value.community) {
    return list.filter((b) => b.name === filters.value.community)
  }
  return list
})

const filteredOfficers = computed((): OfficerMarker[] => {
  let list = officers.value
  if (filters.value.onDutyOnly) {
    list = list.filter((o: OfficerMarker) => o.status !== 'offduty')
  }
  if (filters.value.selectedOfficers.length > 0) {
    list = list.filter((o: OfficerMarker) => filters.value.selectedOfficers.includes(o.label))
  }
  if (filters.value.community) {
    list = list.filter((o: OfficerMarker) => officerDetailsMap.value[o.id]?.community === filters.value.community)
  }
  return filters.value.showOfficers ? list : []
})

const filteredRoutes = computed((): RouteOverlay[] => {
  if (!filters.value.showRoutes) return []
  let list = routes.value
  if (filters.value.selectedOfficers.length > 0) {
    list = list.filter((r: RouteOverlay) => filters.value.selectedOfficers.some((name: string) => r.label.includes(name)))
  }
  return list
})

const filteredWaypoints = computed((): WaypointMarker[] => {
  if (!filters.value.showRoutes) return []
  return waypoints.value
})

const filteredPosts = computed((): PostMarker[] => {
  if (!filters.value.showPosts) return []
  return posts.value
})

const filteredEmergencyCalls = computed((): EmergencyCallMarker[] => {
  if (!filters.value.showEmergencyCalls) return []
  return emergencyCalls.value
})

const selectedOfficer = ref<OfficerInfo | null>(null)
const profileOfficer = ref<(ApiOfficer & { evaluations?: OfficerEvaluation[] }) | null>(null)
const showProfileModal = ref(false)

const officerDetailsMap = computed<Record<string, OfficerInfo>>(() => Object.fromEntries(apiOfficers.value.map((officer) => {
  const name = officerName(officer)
  return [officer.user_id, {
    id: officer.user_id,
    name,
    photo: officer.image_url || undefined,
    initials: officerInitials(officer),
    community: officer.community_name || '—',
    site: officer.address || '—',
    shiftTime: '—',
    currentPost: officer.title || '—',
    lastGpsUpdate: 'Demo location',
    status: officer.is_active ? 'Active' : 'Off duty',
    statusColor: officer.is_active ? '#22c55e' : '#6b7280',
  } satisfies OfficerInfo]
})))

interface GoogleMapMarker {
  id?: string
  lat: number
  lng: number
  status: string
  label?: string
}

function handleMarkerClick(marker: GoogleMapMarker) {
  if (!marker.id) return
  const info = officerDetailsMap.value[marker.id]
  if (info) selectedOfficer.value = info
}

function closeOfficerPanel() {
  selectedOfficer.value = null
}

async function viewOfficerProfile() {
  if (!selectedOfficer.value) return
  try {
    const response = await officerApi.getOfficer(selectedOfficer.value.id)
    if (response.rc === 0 && response.officer) {
      profileOfficer.value = response.officer
      showProfileModal.value = true
      closeOfficerPanel()
    }
  } catch (error) {
    console.error('Failed to load officer profile:', error)
  }
}

function closeProfileModal() {
  showProfileModal.value = false
  profileOfficer.value = null
}

onMounted(loadOfficers)

const legend = [
  { color: '#22c55e', label: t('live_tracking.status_active') },
  { color: '#4f6ef7', label: t('live_tracking.status_responding') },
  { color: '#f59e0b', label: t('live_tracking.status_gps_lost') },
  { color: '#6b7280', label: t('live_tracking.status_offduty') },
  { color: '#ef4444', label: t('live_tracking.status_skipped') },
]
</script>

<template>
  <AppHeader
    :title="t('nav.live_tracking')"
    :breadcrumb="[{ label: 'Dashboard' }, { label: t('nav.live_tracking') }]"
  />

  <div class="live-tracking-page">
    <div class="live-tracking-main">
      <LiveTrackingFilters
        v-model="filters"
        :communities="communities"
        :officers="allOfficers"
        :refresh-interval="refreshInterval"
        @refresh="refreshNow"
      />

      <div class="live-tracking-content">
        <div class="live-tracking-header">
          <div class="live-badge">
            <span class="live-badge__dot" />
            {{ t('live_tracking.live') }}
          </div>
          <div class="refresh-status">
            <Icon name="lucide:clock" :size="13" />
            <span>{{ t('live_tracking.refreshed_ago', { seconds: String(secondsAgo) }) }}</span>
            <button class="refresh-now-btn" @click="refreshNow">
              <Icon name="lucide:refresh-cw" :size="13" />
              {{ t('live_tracking.refresh_now') }}
            </button>
          </div>
          <div class="live-tracking-legend">
            <div v-for="item in legend" :key="item.label" class="legend-item">
              <span class="legend-dot" :style="{ background: item.color }" />
              <span class="legend-label">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="live-tracking-map">
          <GoogleMap
            :center="{ lat: 10.7769, lng: 106.7009 }"
            :zoom="16"
            :markers="filteredOfficers"
            :routes="filteredRoutes"
            :waypoints="filteredWaypoints"
            :posts="filteredPosts"
            :emergency-calls="filteredEmergencyCalls"
            :boundaries="boundaries"
            height="100%"
            @marker-click="handleMarkerClick"
          />
        </div>
      </div>
    </div>

    <OfficerInfoPanel
      v-if="selectedOfficer"
      :officer="selectedOfficer"
      @close="closeOfficerPanel"
      @view-profile="viewOfficerProfile"
    />

    <OfficerDetailsModal
      :show="showProfileModal"
      :officer="profileOfficer"
      @close="closeProfileModal"
    />
  </div>
</template>

<style scoped>
.live-tracking-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  padding: var(--space-4);
  gap: var(--space-3);
}

.live-tracking-main {
  display: flex;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
}

.live-tracking-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: var(--space-3);
}

.live-tracking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.refresh-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.refresh-now-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
}

.refresh-now-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.live-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.live-tracking-legend {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  white-space: nowrap;
}

.live-tracking-map {
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
</style>
