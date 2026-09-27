<script setup lang="ts">
import { trackingApi } from '~/api/tracking'
import { assetApi } from '~/api/asset'
import { officerApi } from '~/api/officer'
import { callApi } from '~/api/call'
import type { Call as ApiCall } from '~/api/types/call'
import type { Officer, OfficerEvaluation } from '~/api/types/officer'
import { communityApi } from '~/api/community'
import type { Community } from '~/api/community'
import type { AssetLocation, MapZone, Post } from '~/api/types/asset'
import type { GetOfficerLocationResponse, LiveTrackingOfficer, OfficerTrackingStatus } from '~/api/types/tracking'
import { useMapRefresh } from '~/composables/useMapRefresh'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import { fileUrl } from '~/utils/fileUrl'

interface OfficerMarker {
  id: string
  lat: number
  lng: number
  status: OfficerTrackingStatus
  label: string
  initials: string
  image?: string
  heading?: number | null
  lastUpdate: string
  activeCallCategory?: string | null
}

interface WorkspaceMarker {
  id: string
  lat: number
  lng: number
  type: 'post' | 'zone'
  label: string
  color: string
  active?: boolean
  shape: 'place' | 'circle' | 'line' | 'polygon'
  radius?: number
  points?: Array<{ lat: number; lng: number }>
  zoneType?: 'entry_exit' | 'high_priority'
}

interface GoogleMapExpose {
  fitToVisibleMarkers: () => void
  focusOn: (point: { lat: number; lng: number }, zoom?: number) => void
}

definePageMeta({ layout: 'default' })

const { t } = useTranslation()
const toastStore = useToastStore()
const officers = ref<LiveTrackingOfficer[]>([])
const communities = ref<Community[]>([])
const posts = ref<Post[]>([])
const zones = ref<MapZone[]>([])
const selectedOfficer = ref<LiveTrackingOfficer | null>(null)
const telemetryDetail = ref<GetOfficerLocationResponse | null>(null)
const telemetryLoading = ref(false)
const selectedCommunityId = ref(0)
const selectedStatuses = ref<OfficerTrackingStatus[]>(['green', 'amber', 'blue', 'red', 'grey'])
const layers = reactive({ officers: true, posts: true, zones: true })
const loading = ref(true)
const refreshing = ref(false)
const layersLoading = ref(false)
const error = ref('')
const sidebarCollapsed = ref(false)
const staleThreshold = ref(2)
const brokenImages = ref(new Set<string>())
const googleMapRef = ref<GoogleMapExpose | null>(null)
const profileOfficer = ref<(Officer & { evaluations?: OfficerEvaluation[] }) | null>(null)
const showProfileModal = ref(false)
const detailsCall = ref<any | null>(null)
const showCallDetailsModal = ref(false)
const panicCallId = ref<number | null>(null)
const showPanicCallModal = ref(false)

const statusMeta: Record<OfficerTrackingStatus, { color: string; label: string }> = {
  green: { color: '#198754', label: t('live_tracking.status_active') },
  amber: { color: '#FFC107', label: t('live_tracking.status_gps_lost') },
  blue: { color: '#0D6EFD', label: t('live_tracking.status_responding') },
  red: { color: '#DC3545', label: t('live_tracking.status_skipped') },
  grey: { color: '#6C757D', label: t('live_tracking.status_offduty') },
}

function officerName(officer: LiveTrackingOfficer) {
  return [officer.first_name, officer.last_name].filter(Boolean).join(' ') || officer.officer_id
}

function officerInitials(officer: LiveTrackingOfficer) {
  return [officer.first_name, officer.last_name]
    .filter(Boolean)
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || '—'
}

function shiftTime(officer: LiveTrackingOfficer) {
  if (!officer.shift_id) return '—'
  const time = [officer.shift_start_time, officer.shift_end_time].filter(Boolean).join(' – ')
  return [officer.shift_date, time].filter(Boolean).join(' · ')
}

function formatLastUpdate(value: string) {
  const local = utcToLocal(value)
  return local.isValid() ? local.fromNow() : '—'
}

async function loadTracking(showLoading = false) {
  if (refreshing.value) return
  refreshing.value = true
  try {
    const response = await trackingApi.getLiveTracking(
      { community_id: selectedCommunityId.value },
      { showLoading, loadingMessage: showLoading ? 'Loading community tracking data…' : undefined },
    )
    if (response.rc === 0) {
      officers.value = response.officers ?? []
      staleThreshold.value = response.stale_threshold_min ?? 2
      error.value = ''
    }
  } catch {
    error.value = 'Unable to load live tracking data.'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function loadCommunities() {
  try {
    const response = await communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    if (response.rc === 0) communities.value = response.communities ?? []
  } catch {
    communities.value = []
  }
}

function locationPoints(location: AssetLocation) {
  return 'points' in location ? location.points.map(point => ({ lat: Number(point.lat), lng: Number(point.lng) })) : []
}

function locationCenter(location: AssetLocation) {
  if ('lat' in location) return { lat: Number(location.lat), lng: Number(location.lng) }
  const points = locationPoints(location)
  if (!points.length) return null
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lng: points.reduce((sum, point) => sum + point.lng, 0) / points.length,
  }
}

async function fetchPosts(communityId: number) {
  const first = await assetApi.getPostsList({ community_id: communityId, include_inactive: false, page: 0 }, { showLoading: false })
  const result = [...(first.posts ?? [])]
  const pages = first.num_of_pages ?? 1
  if (pages > 1) {
    const remaining = await Promise.all(Array.from({ length: pages - 1 }, (_, index) =>
      assetApi.getPostsList({ community_id: communityId, include_inactive: false, page: index + 1 }, { showLoading: false })))
    remaining.forEach(response => result.push(...(response.posts ?? [])))
  }
  return result
}

async function loadMapLayers() {
  const communityIds = selectedCommunityId.value
    ? [selectedCommunityId.value]
    : communities.value.map(community => community.community_id)
  if (!communityIds.length) {
    posts.value = []
    zones.value = []
    return
  }
  layersLoading.value = true
  try {
    const [postGroups, zoneResponses] = await Promise.all([
      Promise.all(communityIds.map(fetchPosts)),
      Promise.all(communityIds.map(communityId => assetApi.getMapZones({ community_id: communityId }, { showLoading: false }))),
    ])
    posts.value = postGroups.flat()
    zones.value = zoneResponses.flatMap(response => response.zones ?? [])
  } catch {
    posts.value = []
    zones.value = []
  } finally {
    layersLoading.value = false
  }
}

const { interval: refreshInterval, secondsAgo, refreshNow } = useMapRefresh(loadTracking)

const filteredOfficers = computed(() => officers.value.filter(officer => selectedStatuses.value.includes(officer.status)))

const markers = computed<OfficerMarker[]>(() => layers.officers ? filteredOfficers.value.map(officer => ({
  id: officer.officer_id,
  lat: officer.latitude,
  lng: officer.longitude,
  status: officer.status,
  label: officerName(officer),
  initials: officerInitials(officer),
  image: fileUrl(officer.image) || undefined,
  heading: officer.heading,
  lastUpdate: officer.last_update,
  activeCallCategory: officer.active_call_category,
})) : [])

const postPriorityColors = {
  urgent: '#DC3545',
  important: '#FFC107',
  normal: '#0D6EFD',
  low: '#6C757D',
}

const workspaceMarkers = computed<WorkspaceMarker[]>(() => {
  const postMarkers = layers.posts ? posts.value.flatMap((post): WorkspaceMarker[] => {
    const center = locationCenter(post.location)
    if (!center) return []
    return [{
      id: `PST-${post.post_id}`,
      ...center,
      type: 'post',
      label: post.name,
      color: postPriorityColors[post.priority],
      active: post.is_active,
      shape: post.shape,
      radius: 'radius' in post.location ? Number(post.location.radius) : undefined,
      points: locationPoints(post.location),
    }]
  }) : []
  const zoneMarkers = layers.zones ? zones.value.flatMap((zone): WorkspaceMarker[] => {
    const center = locationCenter(zone.location)
    if (!center) return []
    const points = locationPoints(zone.location)
    return [{
      id: `ZN-${zone.zone_id}`,
      ...center,
      type: 'zone',
      label: zone.name,
      color: zone.zone_type === 'high_priority' ? '#DC3545' : '#198754',
      shape: points.length ? 'polygon' : 'place',
      points,
      zoneType: zone.zone_type,
    }]
  }) : []
  return [...postMarkers, ...zoneMarkers]
})

const mapCenter = computed(() => {
  const points = [
    ...markers.value.map(marker => ({ lat: marker.lat, lng: marker.lng })),
    ...workspaceMarkers.value.map(marker => ({ lat: marker.lat, lng: marker.lng })),
  ]
  if (!points.length) return { lat: 34.0522, lng: -118.2437 }
  const total = points.reduce((sum, point) => ({
    lat: sum.lat + point.lat,
    lng: sum.lng + point.lng,
  }), { lat: 0, lng: 0 })
  return {
    lat: total.lat / points.length,
    lng: total.lng / points.length,
  }
})

const counts = computed(() => ({
  total: officers.value.length,
  onDuty: officers.value.filter(officer => officer.is_checked_in).length,
  stale: officers.value.filter(officer => officer.status === 'amber').length,
  responding: officers.value.filter(officer => officer.status === 'blue').length,
  overdue: officers.value.filter(officer => officer.status === 'red').length,
  offDuty: officers.value.filter(officer => officer.status === 'grey').length,
}))

async function selectOfficer(officer: LiveTrackingOfficer, focus = false) {
  selectedOfficer.value = officer
  if (focus) googleMapRef.value?.focusOn({ lat: officer.latitude, lng: officer.longitude })
  telemetryDetail.value = null
  telemetryLoading.value = true
  try {
    const response = await trackingApi.getOfficerLocation(officer.officer_id, { showLoading: false })
    if (response.rc === 0 && response.location) telemetryDetail.value = response as unknown as GetOfficerLocationResponse
  } catch {
    telemetryDetail.value = null
  } finally {
    telemetryLoading.value = false
  }
}

function closeOfficerPanel() {
  selectedOfficer.value = null
  telemetryDetail.value = null
}

function handleMarkerClick(marker: { id?: string }) {
  if (!marker.id) return
  const officer = officers.value.find(item => item.officer_id === marker.id)
  if (officer) selectOfficer(officer)
}

function mapCallForModal(apiCall: ApiCall) {
  const categoryMap: Record<ApiCall['category'], { type: string; label: string; icon: string; color: string }> = {
    medical_emergency: { type: 'medical', label: 'Medical Emergency', icon: 'lucide:heart-pulse', color: '#ef4444' },
    security_emergency: { type: 'security', label: 'Security Emergency', icon: 'lucide:shield-alert', color: '#f97316' },
    panic: { type: 'panic', label: 'Panic Button', icon: 'lucide:siren', color: '#ef4444' },
    concierge_service: { type: 'concierge', label: 'Concierge Service', icon: 'lucide:bell-concierge', color: '#3b82f6' },
    test: { type: 'test', label: 'Test Call', icon: 'lucide:test-tube', color: '#8b5cf6' },
  }
  const category = categoryMap[apiCall.category]
  const serviceName = apiCall.service_type || category.label
  return {
    id: apiCall.call_id.toString(),
    displayId: `CL-${apiCall.call_id}`,
    category,
    serviceType: { name: serviceName, icon: category.icon },
    residentName: apiCall.resident_name || '',
    communityName: apiCall.community_name || '',
    address: apiCall.address || apiCall.current_address || '',
    currentAddress: apiCall.current_address || apiCall.address || undefined,
    latitude: apiCall.latitude,
    longitude: apiCall.longitude,
    description: apiCall.description || undefined,
    scheduledDateTime: apiCall.scheduled_date
      ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? ' ' + apiCall.scheduled_time_from : ''}`
      : null,
    officerName: apiCall.officer_name,
    status: apiCall.status === 'resolved' ? 'done' : apiCall.status,
    priority: apiCall.priority,
    createdOn: apiCall.created_on,
    callDateTime: apiCall.created_on,
    acceptedOn: apiCall.accepted_on,
    resolvedOn: apiCall.resolved_on,
    media: apiCall.media,
    confirmationImages: apiCall.confirmation_media,
    confirmationVideoUrl: apiCall.confirmation_video_url,
    audioUrl: apiCall.audio_url || undefined,
    videoUrl: apiCall.video_url || undefined,
    officerComments: apiCall.officer_comments || undefined,
    residentComments: apiCall.resident_comment || undefined,
    assignedBy: apiCall.assigned_by,
    lastUpdate: apiCall.last_update || undefined,
    likeReaction: apiCall.reaction === 1 ? true : apiCall.reaction === 0 ? false : undefined,
  }
}

async function viewCallDetails(callId: number) {
  try {
    const response = await callApi.getCall(callId)
    if (!response.call) return
    if (response.call.category === 'panic') {
      panicCallId.value = response.call.call_id
      showPanicCallModal.value = true
      return
    }
    detailsCall.value = mapCallForModal(response.call)
    showCallDetailsModal.value = true
  } catch {
    toastStore.error('Failed to load call details')
  }
}

function viewOfficerHistory() {
  if (!selectedOfficer.value) return
  navigateTo(`/live-tracking/history?officer_id=${selectedOfficer.value.officer_id}`)
}

function viewOfficerRoute() {
  toastStore.info('Patrol route view is coming in the next update')
}

function toggleStatus(status: OfficerTrackingStatus) {
  selectedStatuses.value = selectedStatuses.value.includes(status)
    ? selectedStatuses.value.filter(item => item !== status)
    : [...selectedStatuses.value, status]
}

function zoomToFit() {
  googleMapRef.value?.fitToVisibleMarkers()
}

async function viewOfficerProfile() {
  if (!selectedOfficer.value) return
  try {
    const response = await officerApi.getOfficer(selectedOfficer.value.officer_id)
    if (response.rc === 0 && response.officer) {
      profileOfficer.value = response.officer
      showProfileModal.value = true
      selectedOfficer.value = null
    }
  } catch {
    error.value = 'Unable to load officer profile.'
  }
}

let hasFittedInitial = false
watch([markers, workspaceMarkers], async () => {
  if (hasFittedInitial || (!markers.value.length && !workspaceMarkers.value.length)) return
  hasFittedInitial = true
  await nextTick()
  window.setTimeout(zoomToFit, 300)
})

watch(selectedCommunityId, async () => {
  hasFittedInitial = false
  selectedOfficer.value = null
  await Promise.all([loadTracking(true), loadMapLayers()])
})

onMounted(async () => {
  await loadCommunities()
  await Promise.all([loadTracking(), loadMapLayers()])
})
</script>

<template>
  <AppHeader
    :title="t('nav.live_tracking')"
    :breadcrumb="[{ label: 'Dashboard' }, { label: t('nav.live_tracking') }]"
  />

  <div class="tracking-page">
    <TrackingTabs />

    <div class="summary-bar" aria-label="Officer tracking summary">
      <div class="summary-item" title="Officers with at least one GPS location">
        <span class="summary-icon"><Icon name="lucide:map-pin" :size="17" /></span>
        <span class="summary-copy"><span class="summary-label">Total tracked</span><strong>{{ counts.total }}</strong></span>
      </div>
      <div class="summary-item summary-item--green" title="Officers currently checked in to a shift">
        <span class="summary-icon"><Icon name="lucide:shield-check" :size="17" /></span>
        <span class="summary-copy"><span class="summary-label">On duty</span><strong>{{ counts.onDuty }}</strong></span>
      </div>
      <div class="summary-item summary-item--amber" title="Checked-in officers whose GPS update is stale">
        <span class="summary-icon"><Icon name="lucide:satellite" :size="17" /></span>
        <span class="summary-copy"><span class="summary-label">Stale signal</span><strong>{{ counts.stale }}</strong></span>
      </div>
      <div class="summary-item summary-item--blue" title="Officers responding to an active call">
        <span class="summary-icon"><Icon name="lucide:phone-call" :size="17" /></span>
        <span class="summary-copy"><span class="summary-label">Responding</span><strong>{{ counts.responding }}</strong></span>
      </div>
      <div class="summary-item summary-item--red" title="Officers with an overdue patrol waypoint">
        <span class="summary-icon"><Icon name="lucide:triangle-alert" :size="17" /></span>
        <span class="summary-copy"><span class="summary-label">Overdue</span><strong>{{ counts.overdue }}</strong></span>
      </div>
      <div class="summary-item summary-item--grey" title="Tracked officers who are not checked in">
        <span class="summary-icon"><Icon name="lucide:user-round-x" :size="17" /></span>
        <span class="summary-copy"><span class="summary-label">Off duty</span><strong>{{ counts.offDuty }}</strong></span>
      </div>
    </div>

    <div class="tracking-workspace">
      <aside class="tracking-sidebar" :class="{ 'tracking-sidebar--collapsed': sidebarCollapsed }">
        <button
          class="collapse-button"
          type="button"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <Icon :name="sidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" :size="18" />
        </button>

        <template v-if="!sidebarCollapsed">
          <div class="sidebar-header">
            <div>
              <h2>Tracked Officers</h2>
              <p>GPS stale after {{ staleThreshold }} minutes</p>
            </div>
            <span class="live-indicator"><span />Live</span>
          </div>

          <div class="map-controls">
            <label class="control-group">
              <span>Community</span>
              <select v-model.number="selectedCommunityId">
                <option :value="0">All communities</option>
                <option v-for="community in communities" :key="community.community_id" :value="community.community_id">
                  {{ community.name }}
                </option>
              </select>
            </label>

            <div class="control-group">
              <span>Status</span>
              <div class="status-filters">
                <label v-for="(meta, status) in statusMeta" :key="status">
                  <input
                    type="checkbox"
                    :checked="selectedStatuses.includes(status)"
                    @change="toggleStatus(status)"
                  />
                  <i :style="{ background: meta.color }" />
                  {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                </label>
              </div>
            </div>

            <div class="control-group">
              <span>Layers</span>
              <div class="layer-toggles">
                <label><input v-model="layers.officers" type="checkbox" /> Officers</label>
                <label><input v-model="layers.posts" type="checkbox" /> Posts ({{ posts.length }})</label>
                <label><input v-model="layers.zones" type="checkbox" /> Map Zones ({{ zones.length }})</label>
              </div>
              <small v-if="layersLoading">Loading map layers…</small>
            </div>
          </div>

          <div class="officer-list">
            <button
              v-for="officer in filteredOfficers"
              :key="officer.officer_id"
              type="button"
              class="officer-row"
              @click="selectOfficer(officer, true)"
            >
              <span class="officer-avatar" :style="{ borderColor: statusMeta[officer.status].color }">
                <img
                  v-if="officer.image && !brokenImages.has(officer.officer_id)"
                  :src="fileUrl(officer.image)"
                  :alt="officerName(officer)"
                  @error="brokenImages.add(officer.officer_id)"
                />
                <span v-else>{{ officerInitials(officer) }}</span>
              </span>
              <span class="officer-copy">
                <strong>{{ officerName(officer) }}</strong>
                <small>{{ officer.community_name || '—' }}</small>
                <small>{{ formatLastUpdate(officer.last_update) }}</small>
              </span>
              <span class="status-dot" :style="{ background: statusMeta[officer.status].color }" />
            </button>

            <div v-if="!loading && !filteredOfficers.length" class="empty-list">No officers match the selected filters.</div>
          </div>

          <div class="legend">
            <div v-for="(meta, status) in statusMeta" :key="status" class="legend-row">
              <span class="legend-dot" :style="{ background: meta.color }" />
              <span>{{ meta.label }}</span>
            </div>
          </div>
        </template>
      </aside>

      <main class="map-panel">
        <GoogleMap
          ref="googleMapRef"
          :center="mapCenter"
          :zoom="12"
          :markers="markers"
          :workspace-markers="workspaceMarkers"
          height="100%"
          @marker-click="handleMarkerClick"
        />

        <div class="map-toolbar">
          <span v-if="refreshing"><Icon name="lucide:refresh-cw" :size="14" class="spinning" /> Refreshing…</span>
          <template v-else>
            <span><Icon name="lucide:clock-3" :size="14" /> Next refresh in {{ Math.max(0, refreshInterval - secondsAgo) }}s</span>
            <span>{{ t('live_tracking.refreshed_ago', { seconds: String(secondsAgo) }) }}</span>
          </template>
          <button type="button" @click="zoomToFit">
            <Icon name="lucide:scan" :size="14" />
            Zoom to fit
          </button>
          <button type="button" :disabled="refreshing" @click="refreshNow">
            <Icon name="lucide:refresh-cw" :size="14" :class="{ spinning: refreshing }" />
            {{ t('live_tracking.refresh_now') }}
          </button>
        </div>

        <div v-if="loading" class="map-state">
          <Icon name="lucide:loader-circle" :size="28" class="spinning" />
          <span>Loading officer locations…</span>
        </div>
        <div v-else-if="error" class="map-state map-state--error">
          <Icon name="lucide:triangle-alert" :size="28" />
          <span>{{ error }}</span>
          <button type="button" @click="refreshNow">{{ t('common.retry') }}</button>
        </div>
      </main>
    </div>

    <OfficerInfoPanel
      v-if="selectedOfficer"
      :officer="selectedOfficer"
      :detail="telemetryDetail"
      :detail-loading="telemetryLoading"
      @close="closeOfficerPanel"
      @view-profile="viewOfficerProfile"
      @view-history="viewOfficerHistory"
      @view-route="viewOfficerRoute"
      @view-call="viewCallDetails"
    />

    <OfficerDetailsModal
      :show="showProfileModal"
      :officer="profileOfficer"
      @close="showProfileModal = false"
    />

    <CallDetailsModal
      :show="showCallDetailsModal"
      :call="detailsCall"
      @close="showCallDetailsModal = false; detailsCall = null"
      @resolved="showCallDetailsModal = false; detailsCall = null"
      @canceled="showCallDetailsModal = false; detailsCall = null"
      @deleted="showCallDetailsModal = false; detailsCall = null"
    />

    <PanicCallModal
      :show="showPanicCallModal"
      :call-id="panicCallId"
      @close="showPanicCallModal = false; panicCallId = null"
      @resolved="showPanicCallModal = false; panicCallId = null"
    />
  </div>
</template>

<style scoped>
.tracking-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  min-height: 620px;
  padding: var(--space-4);
  gap: var(--space-3);
}

.summary-bar {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: var(--space-2);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
}

.summary-icon { display: grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; color: var(--color-text-secondary); background: var(--color-bg-base); border-radius: var(--radius-md); }
.summary-copy { display: flex; min-width: 0; flex: 1; align-items: center; justify-content: space-between; gap: var(--space-2); }
.summary-item strong { font-size: var(--font-size-xl); }
.summary-label { color: var(--color-text-muted); font-size: var(--font-size-xs); }
.summary-item--green .summary-icon, .summary-item--green strong { color: #198754; }
.summary-item--amber .summary-icon, .summary-item--amber strong { color: #FFC107; }
.summary-item--blue .summary-icon, .summary-item--blue strong { color: #0D6EFD; }
.summary-item--red .summary-icon, .summary-item--red strong { color: #DC3545; }
.summary-item--grey .summary-icon, .summary-item--grey strong { color: #6C757D; }

.tracking-workspace {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: var(--space-3);
}

.tracking-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: width .2s ease, min-width .2s ease;
}

.tracking-sidebar--collapsed { width: 48px; min-width: 48px; }
.collapse-button {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: 2;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--color-text-secondary);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
}
.tracking-sidebar--collapsed .collapse-button { right: 8px; }

.sidebar-header { padding: var(--space-4); padding-right: 52px; border-bottom: 1px solid var(--color-border); }
.sidebar-header h2 { margin: 0; color: var(--color-text-primary); font-size: var(--font-size-md); }
.sidebar-header p { margin: 4px 0 0; color: var(--color-text-muted); font-size: var(--font-size-xs); }
.live-indicator { display: inline-flex; align-items: center; gap: 6px; margin-top: var(--space-2); color: #198754; font-size: var(--font-size-xs); font-weight: 600; }
.live-indicator span { width: 7px; height: 7px; border-radius: 50%; background: #198754; }

.map-controls { display: grid; gap: var(--space-3); padding: var(--space-3); border-bottom: 1px solid var(--color-border); }
.control-group { display: grid; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.control-group > span { font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.control-group select {
  width: 100%;
  height: 36px;
  padding: 0 var(--space-2);
  color: var(--color-text-primary);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.status-filters { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); }
.status-filters label, .layer-toggles label { display: flex; align-items: center; gap: 7px; color: var(--color-text-secondary); cursor: pointer; }
.status-filters input, .layer-toggles input { width: 15px; height: 15px; accent-color: var(--color-accent); }
.status-filters i { width: 8px; height: 8px; border-radius: 50%; }
.layer-toggles { display: grid; gap: var(--space-2); }
.control-group small { color: var(--color-text-muted); }

.officer-list { flex: 1; min-height: 90px; overflow-y: auto; padding: var(--space-2); }
.officer-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: var(--space-3);
  padding: var(--space-2);
  color: var(--color-text-primary);
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
  cursor: pointer;
}
.officer-row:hover { background: var(--color-bg-base); }
.officer-avatar { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; overflow: hidden; border: 3px solid; border-radius: 50%; background: var(--color-bg-base); font-size: var(--font-size-xs); font-weight: 700; }
.officer-avatar img { width: 100%; height: 100%; object-fit: cover; }
.officer-copy { display: flex; flex: 1; min-width: 0; flex-direction: column; }
.officer-copy strong, .officer-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.officer-copy strong { font-size: var(--font-size-sm); }
.officer-copy small { color: var(--color-text-muted); font-size: var(--font-size-xs); }
.status-dot, .legend-dot { width: 9px; height: 9px; flex-shrink: 0; border-radius: 50%; }
.empty-list { padding: var(--space-5) var(--space-3); color: var(--color-text-muted); text-align: center; font-size: var(--font-size-sm); }
.legend { display: grid; gap: var(--space-2); padding: var(--space-3); border-top: 1px solid var(--color-border); }
.legend-row { display: flex; align-items: center; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--font-size-xs); }

.map-panel { position: relative; flex: 1; min-width: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.map-toolbar {
  position: absolute;
  z-index: 5;
  top: var(--space-3);
  right: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-secondary);
  background: rgba(13, 17, 23, .9);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  backdrop-filter: blur(8px);
  font-size: var(--font-size-xs);
}
.map-toolbar span, .map-toolbar button { display: inline-flex; align-items: center; gap: var(--space-1); }
.map-toolbar button, .map-state button { padding: 5px 9px; color: var(--color-text-primary); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; }
.map-toolbar button:disabled { opacity: .55; cursor: wait; }
.map-state { position: absolute; z-index: 6; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: var(--space-2); color: var(--color-text-secondary); background: rgba(13, 17, 23, .82); }
.map-state--error { color: #DC3545; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) {
  .summary-bar { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 760px) {
  .tracking-page { height: auto; min-height: calc(100vh - 64px); }
  .summary-bar { grid-template-columns: repeat(2, 1fr); }
  .tracking-workspace { min-height: 680px; }
  .tracking-sidebar { position: absolute; z-index: 10; height: 620px; }
  .map-toolbar { left: var(--space-3); right: var(--space-3); flex-wrap: wrap; }
}
</style>
