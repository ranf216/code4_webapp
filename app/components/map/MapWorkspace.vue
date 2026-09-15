<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { assetApi } from '~/api/asset'
import { communityApi } from '~/api/community'
import { ApiError } from '~/api/base'
import { fileToBase64 } from '~/composables/useFileApi'
import { useToastStore } from '~/stores/toast'
import type { Community } from '~/api/community'
import type { Asset as ApiAsset, AssetLocation, AssetTypeMeta, MapZone as ApiMapZone, Post as ApiPost, PostPriorityMeta } from '~/api/types/asset'
import type { AssetFormData } from './AddAssetModal.vue'
import type { PostFormData } from './AddPostModal.vue'
import type { ZoneFormData } from './AddZoneModal.vue'

const { t } = useTranslation()
const toastStore = useToastStore()
const router = useRouter()
const route = useRoute()

const communities = ref<Community[]>([])
const selectedCommunityId = ref('')
const isLoadingMapData = ref(false)
let mapDataRequestId = 0

const selectedCommunity = computed(() => communities.value.find(community => String(community.community_id) === selectedCommunityId.value))
const selectedCommunityName = computed(() => selectedCommunity.value?.name ?? '')

// Map state
const hasMap = ref(true)
const activeShape = ref<'place' | 'circle' | 'line' | 'polygon' | null>(null)
const drawEntityType = ref<'asset' | 'post' | 'zone' | null>(null)
const isBatchMode = ref(false)
const pendingLocation = ref<MapPoint | null>(null)
const pendingPoints = ref<MapPoint[]>([])
const pendingCircleRadius = ref<number | null>(null)
const circleCenter = ref<MapPoint | null>(null)
const circleRadiusPx = ref(0)
const isDrawingCircle = ref(false)
const METERS_PER_PERCENT = 5
const mapImageUrl = ref<string | null>(null)
const mapBase = ref<'google' | 'image'>('google')
const showUploadMapModal = ref(false)
const isUploadingMap = ref(false)
const useImageMap = computed(() => mapBase.value === 'image' && !!mapImageUrl.value)
const mapBaseOptions = computed(() => [
  { label: t('map.google_map'), value: 'google' },
  { label: t('map.community_image'), value: 'image', disabled: !mapImageUrl.value },
])

// Layer visibility
const layers = reactive({
  assets: true,
  posts: true,
  zones: true,
})

// Filters
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (value) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = value
  }, 300)
})

const selectedAssetTypes = ref<string[]>([])
const openAssetTypeFilter = ref(false)
const assetTypeFilterRef = ref<HTMLElement | null>(null)
const assetTypeOptions = ref(['Camera', 'Gate', 'Door', 'Alarm', 'Fence', 'Other'])
const assetTypeIds = ref<Record<string, string>>({})
const getAssetTypeKey = (name: string) => assetTypeIds.value[name] || name.trim().toLowerCase().replace(/[\s/]+/g, '_')
const selectedAssetTypesLabel = computed(() => {
  if (selectedAssetTypes.value.length === 0 || selectedAssetTypes.value.length === assetTypeOptions.value.length) return t('map.all')
  if (selectedAssetTypes.value.length === 1) return selectedAssetTypes.value[0]
  return `${selectedAssetTypes.value.length} selected`
})
const allAssetTypesSelected = computed(() => selectedAssetTypes.value.length === assetTypeOptions.value.length)
function toggleAllAssetTypes() {
  selectedAssetTypes.value = allAssetTypesSelected.value ? [] : [...assetTypeOptions.value]
}
function closeAssetTypeFilter(event: MouseEvent) {
  if (assetTypeFilterRef.value && !assetTypeFilterRef.value.contains(event.target as Node)) {
    openAssetTypeFilter.value = false
  }
}

const selectedZoneType = ref<'all' | 'entry_exit' | 'high_priority'>('all')
const drawEntityTypeModel = computed({
  get: () => drawEntityType.value ?? '',
  set: (value: string) => {
    if (value === 'asset' || value === 'post' || value === 'zone') selectDrawEntityType(value)
  },
})
const drawEntityOptions = computed(() => [
  { label: t('map.asset'), value: 'asset' },
  { label: t('map.post'), value: 'post' },
  { label: t('map.zone'), value: 'zone' },
])
const postPriorityOptions = ref(['Urgent', 'Important', 'Normal', 'Low'])

// Items
interface MapPoint { x: number; y: number; lat?: number; lng?: number }
interface GeoPoint { lat: number; lng: number }

const MAP_CENTER = { lat: 34.0522, lng: -118.2437 }
const mapCenter = computed(() => ({
  lat: selectedCommunity.value?.latitude ?? MAP_CENTER.lat,
  lng: selectedCommunity.value?.longitude ?? MAP_CENTER.lng,
}))

interface MapAsset {
  id: string
  type: 'asset'
  assetType: string
  installationDate: string
  replacementDate: string
  description: string
  location: MapPoint
  shape: 'place' | 'circle' | 'line'
  radius?: number
  points?: MapPoint[]
  acres?: number
  createdBy?: string
  createdOn?: string
  lastUpdated?: string
}

interface MapPost {
  id: string
  type: 'post'
  name: string
  description: string
  priority: string
  equipment: string
  active: boolean
  location: MapPoint
  shape: 'place' | 'circle' | 'line'
  radius?: number
  points?: MapPoint[]
  permissions?: {
    required_roles?: string[]
    required_badges?: string[]
    required_equipment?: string[]
  } | null
  createdBy?: string
  createdOn?: string
  lastUpdated?: string
}

interface MapZone {
  id: string
  type: 'zone'
  zoneType: 'entry_exit' | 'high_priority'
  name: string
  location: MapPoint
  shape: 'place' | 'circle' | 'line' | 'polygon'
  radius?: number
  points?: MapPoint[]
}

type MapItem = MapAsset | MapPost | MapZone

const mapItems = ref<MapItem[]>([])

function locationPoints(location: AssetLocation): Array<{ lat: number; lng: number }> {
  return 'points' in location ? location.points : []
}

function locationCenter(location: AssetLocation): { lat: number; lng: number } {
  if ('lat' in location) return { lat: Number(location.lat), lng: Number(location.lng) }
  const points = locationPoints(location)
  if (!points.length) return MAP_CENTER
  return {
    lat: points.reduce((sum, point) => sum + Number(point.lat), 0) / points.length,
    lng: points.reduce((sum, point) => sum + Number(point.lng), 0) / points.length,
  }
}

function mapPoint(location: AssetLocation): MapPoint {
  const center = locationCenter(location)
  return { x: 50, y: 50, lat: center.lat, lng: center.lng }
}

function mapApiAsset(asset: ApiAsset): MapAsset {
  return {
    id: `AST-${asset.asset_id}`,
    type: 'asset',
    assetType: asset.asset_type_name || asset.asset_type,
    installationDate: asset.installation_date || '',
    replacementDate: asset.replacement_date || '',
    description: asset.description || '',
    location: mapPoint(asset.location),
    shape: asset.shape,
    radius: 'radius' in asset.location ? Number(asset.location.radius) : undefined,
    points: locationPoints(asset.location).map(point => ({ x: 50, y: 50, lat: Number(point.lat), lng: Number(point.lng) })),
    acres: asset.acres,
    createdBy: String(asset.created_by_name || asset.created_by),
    createdOn: asset.created_on,
    lastUpdated: asset.last_update || '',
  }
}

function mapApiPost(post: ApiPost): MapPost {
  return {
    id: `PST-${post.post_id}`,
    type: 'post',
    name: post.name,
    description: post.description || '',
    priority: post.priority.charAt(0).toUpperCase() + post.priority.slice(1),
    equipment: post.equipment || '',
    active: post.is_active,
    location: mapPoint(post.location),
    shape: post.shape,
    radius: 'radius' in post.location ? Number(post.location.radius) : undefined,
    points: locationPoints(post.location).map(point => ({ x: 50, y: 50, lat: Number(point.lat), lng: Number(point.lng) })),
    permissions: post.permissions,
    createdBy: String(post.created_by_name || post.created_by),
    createdOn: post.created_on,
    lastUpdated: post.last_update || '',
  }
}

function mapApiZone(zone: ApiMapZone): MapZone {
  const points = locationPoints(zone.location)
  return {
    id: `ZN-${zone.zone_id}`,
    type: 'zone',
    zoneType: zone.zone_type,
    name: zone.name,
    location: mapPoint(zone.location),
    shape: points.length ? 'polygon' : 'place',
    points: points.map(point => ({ x: 50, y: 50, lat: Number(point.lat), lng: Number(point.lng) })),
  }
}

async function fetchAllAssetPages(params: { community_id: number; asset_type?: string; search_text?: string }): Promise<ApiAsset[]> {
  const firstPage = await assetApi.getAssetsList({ ...params, page: 0 }, { showLoading: false })
  const assets = [...(firstPage.assets || [])]
  const numOfPages = firstPage.num_of_pages || 1
  if (numOfPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: numOfPages - 1 }, (_, index) =>
        assetApi.getAssetsList({ ...params, page: index + 1 }, { showLoading: false })),
    )
    for (const response of remainingPages) assets.push(...(response.assets || []))
  }
  return assets
}

async function fetchAllPostPages(params: { community_id: number; include_inactive: boolean; search_text?: string }): Promise<ApiPost[]> {
  const firstPage = await assetApi.getPostsList({ ...params, page: 0 }, { showLoading: false })
  const posts = [...(firstPage.posts || [])]
  const numOfPages = firstPage.num_of_pages || 1
  if (numOfPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: numOfPages - 1 }, (_, index) =>
        assetApi.getPostsList({ ...params, page: index + 1 }, { showLoading: false })),
    )
    for (const response of remainingPages) posts.push(...(response.posts || []))
  }
  return posts
}

async function loadMapData() {
  const communityId = Number(selectedCommunityId.value)
  if (!communityId) return
  const requestId = ++mapDataRequestId
  isLoadingMapData.value = true
  selectedItem.value = null
  try {
    const searchText = debouncedSearchQuery.value.trim() || undefined
    const [assets, posts, zonesResponse] = await Promise.all([
      fetchAllAssetPages({
        community_id: communityId,
        asset_type: selectedAssetTypes.value.length === 1 ? getAssetTypeKey(selectedAssetTypes.value[0]!) : undefined,
        search_text: searchText,
      }),
      fetchAllPostPages({ community_id: communityId, include_inactive: true, search_text: searchText }),
      assetApi.getMapZones({ community_id: communityId, zone_type: selectedZoneType.value === 'all' ? undefined : selectedZoneType.value }, { showLoading: false }),
    ])
    if (requestId !== mapDataRequestId) return
    mapItems.value = [
      ...assets.map(mapApiAsset),
      ...posts.map(mapApiPost),
      ...(zonesResponse.zones || []).map(mapApiZone),
    ]
    const requestedPostId = typeof route.query.post_id === 'string' ? `PST-${route.query.post_id}` : ''
    if (requestedPostId) selectedItem.value = mapItems.value.find(item => item.id === requestedPostId) || null
  } catch (error) {
    if (requestId !== mapDataRequestId) return
    console.error('Failed to load map data:', error)
    mapItems.value = []
    toastStore.error('Failed to load map data')
  } finally {
    if (requestId === mapDataRequestId) isLoadingMapData.value = false
  }
}

const ITEM_LIMIT = 1000
const BATCH_LIMIT = 100

const visibleItems = computed((): MapItem[] => {
  const q = debouncedSearchQuery.value.trim().toLowerCase()
  return mapItems.value.filter((item: MapItem) => {
    if (item.type === 'asset' && !layers.assets) return false
    if (item.type === 'post' && !layers.posts) return false
    if (item.type === 'zone' && !layers.zones) return false

    if (item.type === 'asset' && selectedAssetTypes.value.length && !selectedAssetTypes.value.includes(item.assetType)) return false
    if (item.type === 'zone' && selectedZoneType.value !== 'all' && item.zoneType !== selectedZoneType.value) return false

    if (q) {
      if (item.type === 'asset') return item.assetType.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      if (item.type === 'post') return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      return item.name.toLowerCase().includes(q)
    }
    return true
  })
})

const liveItemCount = computed(() => mapItems.value.length)
const liveCountClass = computed(() => {
  const ratio = liveItemCount.value / ITEM_LIMIT
  if (ratio >= 1) return 'counter--danger'
  if (ratio >= 0.8) return 'counter--warning'
  return ''
})
const isLimitReached = computed(() => liveItemCount.value >= ITEM_LIMIT)

const assetCount = computed(() => visibleItems.value.filter((i: MapItem) => i.type === 'asset').length)
const postCount = computed(() => visibleItems.value.filter((i: MapItem) => i.type === 'post').length)
const zoneCount = computed(() => visibleItems.value.filter((i: MapItem) => i.type === 'zone').length)

const ASSET_TYPE_COLORS: Record<string, string> = {
  Camera: '#0D6EFD',
  Gate: '#198754',
  Door: '#0DCAF0',
  Alarm: '#DC3545',
  Fence: '#6C757D',
  Other: '#6610F2',
}
const POST_PRIORITY_COLORS: Record<string, string> = {
  urgent: '#DC3545',
  important: '#FD7E14',
  normal: '#0D6EFD',
  low: '#6C757D',
}
const ZONE_TYPE_COLORS: Record<MapZone['zoneType'], string> = {
  entry_exit: '#198754',
  high_priority: '#DC3545',
}

function toGeoPoint(point: MapPoint) {
  return {
    lat: point.lat ?? mapCenter.value.lat + (50 - point.y) * 0.0001,
    lng: point.lng ?? mapCenter.value.lng + (point.x - 50) * 0.0001,
  }
}

function getWorkspaceMarkerColor(item: MapItem): string {
  if (item.type === 'asset') return ASSET_TYPE_COLORS[item.assetType] ?? ASSET_TYPE_COLORS.Other!
  if (item.type === 'post') return POST_PRIORITY_COLORS[item.priority.toLowerCase()] ?? POST_PRIORITY_COLORS.normal!
  return ZONE_TYPE_COLORS[item.zoneType]
}

const workspaceMarkers = computed(() => visibleItems.value.map(item => ({
  id: item.id,
  ...toGeoPoint(item.location),
  type: item.type,
  label: getItemName(item),
  color: getWorkspaceMarkerColor(item),
  active: item.type !== 'post' || item.active,
  shape: item.shape,
  radius: item.radius,
  points: item.points?.map(toGeoPoint),
  zoneType: item.type === 'zone' ? item.zoneType : undefined,
})))
const googleMapKey = computed(() => `${selectedCommunityId.value}:${workspaceMarkers.value.map(item => `${item.id}:${item.lat}:${item.lng}`).join('|')}`)
const drawingGeoPoints = computed(() => pendingPoints.value
  .filter((point): point is MapPoint & GeoPoint => point.lat != null && point.lng != null)
  .map(point => ({ lat: point.lat, lng: point.lng })))
const drawingCircleCenter = computed<GeoPoint | null>(() => circleCenter.value?.lat != null && circleCenter.value.lng != null
  ? { lat: circleCenter.value.lat, lng: circleCenter.value.lng }
  : null)

async function handleWorkspaceMarkerClick(marker: { id: string }) {
  const item = mapItems.value.find(candidate => candidate.id === marker.id) ?? null
  selectedItem.value = item
  if (!item || item.type === 'zone') return
  const id = Number(item.id.replace(/^[A-Z]+-/, ''))
  try {
    if (item.type === 'asset') {
      const response = await assetApi.getAsset(id, { showLoading: false })
      if (response.asset) selectedItem.value = mapApiAsset(response.asset)
    } else {
      const response = await assetApi.getPost(id, { showLoading: false })
      if (response.post) selectedItem.value = mapApiPost(response.post)
    }
  } catch (error) {
    console.error('Failed to load map item details:', error)
  }
}

// Drawing
function percentFromEvent(event: MouseEvent, target: HTMLElement): MapPoint {
  const rect = target.getBoundingClientRect()
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 100)
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 100)
  return { x, y }
}

function resetPendingShape() {
  pendingPoints.value = []
  pendingLocation.value = null
  circleCenter.value = null
  circleRadiusPx.value = 0
  pendingCircleRadius.value = null
  isDrawingCircle.value = false
}

function selectDrawEntityType(type: 'asset' | 'post' | 'zone') {
  if (drawEntityType.value === type) return
  drawEntityType.value = type
  if (type !== 'zone' && activeShape.value === 'polygon') activeShape.value = null
  resetPendingShape()
}

function selectShape(shape: 'place' | 'circle' | 'line' | 'polygon') {
  if (isLimitReached.value || !drawEntityType.value) return
  if (shape === 'polygon' && drawEntityType.value !== 'zone') return
  activeShape.value = activeShape.value === shape ? null : shape
  resetPendingShape()
}

function handleCanvasMousedown(event: MouseEvent) {
  if (!activeShape.value || !drawEntityType.value || activeShape.value !== 'circle' || isLimitReached.value || isDrawingCircle.value) return
  const point = percentFromEvent(event, event.currentTarget as HTMLElement)
  circleCenter.value = point
  pendingLocation.value = point
  isDrawingCircle.value = true
  circleRadiusPx.value = 0
  pendingCircleRadius.value = 0
}

function handleCanvasMousemove(event: MouseEvent) {
  if (!isDrawingCircle.value || !circleCenter.value) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const centerX = (circleCenter.value.x / 100) * rect.width
  const centerY = (circleCenter.value.y / 100) * rect.height
  const dx = event.clientX - rect.left - centerX
  const dy = event.clientY - rect.top - centerY
  const radiusPx = Math.hypot(dx, dy)
  const radiusPercent = (radiusPx / ((rect.width + rect.height) / 2)) * 100
  const radiusMeters = Math.max(1, Math.round(radiusPercent * METERS_PER_PERCENT))
  circleRadiusPx.value = radiusPx
  pendingCircleRadius.value = radiusMeters
}

function handleCanvasMouseup() {
  if (!isDrawingCircle.value || !circleCenter.value) return
  isDrawingCircle.value = false
  if ((pendingCircleRadius.value ?? 0) < 1) {
    circleCenter.value = null
    pendingCircleRadius.value = null
    return
  }
  finishDrawing()
}

function handleCanvasClick(event: MouseEvent) {
  if (!activeShape.value || !drawEntityType.value || isLimitReached.value || isDrawingCircle.value) return
  if (activeShape.value === 'circle') return
  const point = percentFromEvent(event, event.currentTarget as HTMLElement)
  if (activeShape.value === 'place') {
    pendingLocation.value = point
    if (isBatchMode.value) {
      if (pendingPoints.value.length >= BATCH_LIMIT) {
        toastStore.error(t('map.batch_limit_toast', { max: String(BATCH_LIMIT) }))
        return
      }
      if (liveItemCount.value + pendingPoints.value.length >= ITEM_LIMIT) {
        toastStore.error(t('map.items_limit_tooltip'))
        return
      }
      pendingPoints.value.push(point)
    }
    else finishDrawing()
    return
  }

  const firstPoint = pendingPoints.value[0]
  if (
    activeShape.value === 'polygon' &&
    firstPoint &&
    pendingPoints.value.length >= 3 &&
    Math.hypot(point.x - firstPoint.x, point.y - firstPoint.y) <= 2
  ) {
    finishDrawing()
    return
  }

  pendingPoints.value.push(point)
  if (pendingPoints.value.length === 1) {
    pendingLocation.value = point
  }
}

function handleCanvasDblclick() {
  if (!activeShape.value || !drawEntityType.value || isLimitReached.value) return
  if (activeShape.value === 'line' || activeShape.value === 'polygon') finishDrawing()
}

function mapGeoPoint(point: GeoPoint): MapPoint {
  return { x: 50, y: 50, lat: point.lat, lng: point.lng }
}

function handleGoogleMapClick(point: GeoPoint) {
  if (!activeShape.value || !drawEntityType.value || isLimitReached.value || activeShape.value === 'circle') return
  const mappedPoint = mapGeoPoint(point)
  if (activeShape.value === 'place') {
    if (isBatchMode.value) {
      if (pendingPoints.value.length >= BATCH_LIMIT) {
        toastStore.error(t('map.batch_limit_toast', { max: String(BATCH_LIMIT) }))
        return
      }
      if (liveItemCount.value + pendingPoints.value.length >= ITEM_LIMIT) {
        toastStore.error(t('map.items_limit_tooltip'))
        return
      }
      pendingPoints.value.push(mappedPoint)
      return
    }
    pendingLocation.value = mappedPoint
    finishDrawing()
    return
  }
  const firstPoint = pendingPoints.value[0]
  if (
    activeShape.value === 'polygon' &&
    firstPoint?.lat != null &&
    firstPoint.lng != null &&
    pendingPoints.value.length >= 3 &&
    geographicDistance({ lat: firstPoint.lat, lng: firstPoint.lng }, point) <= 10
  ) {
    finishDrawing()
    return
  }
  pendingPoints.value.push(mappedPoint)
  if (!pendingLocation.value) pendingLocation.value = mappedPoint
}

function handleGoogleMapMousedown(point: GeoPoint) {
  if (activeShape.value !== 'circle' || !drawEntityType.value || isLimitReached.value) return
  circleCenter.value = mapGeoPoint(point)
  pendingLocation.value = mapGeoPoint(point)
  pendingCircleRadius.value = 0
  isDrawingCircle.value = true
}

function geographicDistance(from: GeoPoint, to: GeoPoint): number {
  const earthRadius = 6371000
  const toRadians = (value: number) => value * Math.PI / 180
  const latitudeDelta = toRadians(to.lat - from.lat)
  const longitudeDelta = toRadians(to.lng - from.lng)
  const fromLatitude = toRadians(from.lat)
  const toLatitude = toRadians(to.lat)
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function handleGoogleMapMousemove(point: GeoPoint) {
  if (!isDrawingCircle.value || circleCenter.value?.lat == null || circleCenter.value.lng == null) return
  pendingCircleRadius.value = Math.max(1, Math.round(geographicDistance(
    { lat: circleCenter.value.lat, lng: circleCenter.value.lng },
    point,
  )))
}

function removePendingPoint(index: number) {
  pendingPoints.value.splice(index, 1)
  pendingLocation.value = pendingPoints.value[pendingPoints.value.length - 1] ?? null
}

function handleGoogleMapMouseup(point: GeoPoint) {
  if (!isDrawingCircle.value || circleCenter.value?.lat == null || circleCenter.value.lng == null) return
  handleGoogleMapMousemove(point)
  isDrawingCircle.value = false
  finishDrawing()
}

function canFinishDrawing() {
  if (!drawEntityType.value) return false
  if (activeShape.value === 'place') return isBatchMode.value ? pendingPoints.value.length > 0 : !!pendingLocation.value
  if (activeShape.value === 'circle') return (pendingCircleRadius.value ?? 0) >= 1
  if (activeShape.value === 'line') return pendingPoints.value.length >= 2
  if (activeShape.value === 'polygon') return pendingPoints.value.length >= 3
  return false
}

const showLimitWarning = ref(false)
const limitWarningKind = ref<'item' | 'batch'>('item')
const projectedTotal = computed(() => liveItemCount.value + pendingPoints.value.length)

function batchWouldExceedItemLimit() {
  return liveItemCount.value + pendingPoints.value.length > ITEM_LIMIT
}

function checkBatchLimits(): boolean {
  if (pendingPoints.value.length > BATCH_LIMIT) {
    limitWarningKind.value = 'batch'
    showLimitWarning.value = true
    return false
  }
  if (batchWouldExceedItemLimit()) {
    limitWarningKind.value = 'item'
    showLimitWarning.value = true
    return false
  }
  return true
}

function finishDrawing() {
  if (!canFinishDrawing()) return
  if (isBatchMode.value && !checkBatchLimits()) return
  openDrawnEntityModal()
}

function cancelDrawing() {
  resetPendingShape()
  activeShape.value = null
}

function undoLastDraw() {
  if (circleCenter.value) {
    circleCenter.value = null
    pendingCircleRadius.value = null
    circleRadiusPx.value = 0
    isDrawingCircle.value = false
    return
  }
  if (pendingPoints.value.length) {
    pendingPoints.value.pop()
    if (pendingPoints.value.length === 0) pendingLocation.value = null
    else pendingLocation.value = { ...pendingPoints.value[pendingPoints.value.length - 1]! }
    return
  }
  activeShape.value = null
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && (activeShape.value || pendingPoints.value.length || circleCenter.value)) {
    event.preventDefault()
    cancelDrawing()
    return
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()
    undoLastDraw()
  }
}
async function initializeMapWorkspace() {
  try {
    const [communitiesResponse, metadataResponse] = await Promise.all([
      communityApi.getCommunities({ include_inactive: false }, { showLoading: false }),
      assetApi.getAssetMetadata({ showLoading: false }),
    ])
    communities.value = communitiesResponse.communities || []
    const metadataAssetTypes: AssetTypeMeta[] = metadataResponse.asset_types || []
    if (metadataAssetTypes.length) {
      assetTypeOptions.value = metadataAssetTypes.map((type: AssetTypeMeta) => type.name)
      assetTypeIds.value = Object.fromEntries(metadataAssetTypes.map((type: AssetTypeMeta) => [type.name, type.id]))
    }
    const metadataPriorities: PostPriorityMeta[] = metadataResponse.post_priorities || []
    if (metadataPriorities.length) postPriorityOptions.value = metadataPriorities.map((priority: PostPriorityMeta) => priority.name)
    if (communities.value.length) {
      const requestedCommunityId = typeof route.query.community_id === 'string' ? route.query.community_id : ''
      selectedCommunityId.value = communities.value.some(community => String(community.community_id) === requestedCommunityId)
        ? requestedCommunityId
        : String(communities.value[0]!.community_id)
      if (typeof route.query.search === 'string') searchQuery.value = route.query.search
    }
  } catch (error) {
    console.error('Failed to initialize map workspace:', error)
    toastStore.error('Failed to initialize map workspace')
  }
}

watch(selectedCommunityId, async () => {
  mapImageUrl.value = selectedCommunity.value?.map_image_url ?? null
  mapBase.value = mapImageUrl.value ? 'image' : 'google'
  await loadMapData()
})
watch([debouncedSearchQuery, selectedZoneType, selectedAssetTypes], loadMapData, { deep: true })

onMounted(() => {
  window.addEventListener('click', closeAssetTypeFilter)
  window.addEventListener('keydown', handleKeydown)
  initializeMapWorkspace()
})
onUnmounted(() => {
  window.removeEventListener('click', closeAssetTypeFilter)
  window.removeEventListener('keydown', handleKeydown)
})

function toggleLayer(key: string) {
  if (key === 'assets' || key === 'posts' || key === 'zones') {
    layers[key] = !layers[key]
  }
}

function isZone(item: MapItem): item is MapZone {
  return item.type === 'zone'
}

function asZone(item: MapItem): MapZone {
  return item as MapZone
}

function asAsset(item: MapItem): MapAsset {
  return item as MapAsset
}

// Modals
const showTypeSelect = ref(false)
const showAddAssetModal = ref(false)
const showAddPostModal = ref(false)
const showAddZoneModal = ref(false)
const postSaveError = ref('')
const showDeleteModal = ref(false)
const selectedItem = ref<MapItem | null>(null)
const itemToDelete = ref<MapItem | null>(null)
const editingItem = ref<MapItem | null>(null)

function selectItemType(type: 'asset' | 'post' | 'zone') {
  showTypeSelect.value = false
  if (type === 'asset') showAddAssetModal.value = true
  else if (type === 'post') showAddPostModal.value = true
  else showAddZoneModal.value = true
}

function openDrawnEntityModal() {
  editingItem.value = null
  if (drawEntityType.value === 'asset') showAddAssetModal.value = true
  else if (drawEntityType.value === 'post') showAddPostModal.value = true
  else if (drawEntityType.value === 'zone') showAddZoneModal.value = true
}

function pendingApiLocation(): AssetLocation | null {
  const shape = activeShape.value
  if (!shape || !pendingLocation.value) return null
  if (shape === 'line' || shape === 'polygon') {
    const points = pendingPoints.value.map(toGeoPoint)
    return points.length ? { points } : null
  }
  const point = toGeoPoint(pendingLocation.value)
  if (shape === 'circle') return { ...point, radius: pendingCircleRadius.value || 1 }
  return point
}

async function handleAddAsset(data: AssetFormData) {
  const location = pendingApiLocation()
  const communityId = Number(data.communityId || selectedCommunityId.value)
  const shape = activeShape.value
  if (editingItem.value?.type === 'asset') {
    try {
      await assetApi.updateAsset({
        asset_id: Number(editingItem.value.id.replace('AST-', '')),
        asset_type: getAssetTypeKey(data.type),
        description: data.description || undefined,
        installation_date: data.installationDate || undefined,
        replacement_date: data.replacementDate || undefined,
      })
      editingItem.value = null
      selectedItem.value = null
      toastStore.success('Asset updated successfully')
      await loadMapData()
    } catch (error) {
      console.error('Failed to update asset:', error)
      toastStore.error('Failed to update asset')
    }
    return
  }
  if (isBatchMode.value && communityId && pendingPoints.value.length) {
    if (!checkBatchLimits()) return
    try {
      await assetApi.createAssetsBatch({
        community_id: communityId,
        asset_type: getAssetTypeKey(data.type),
        shape: 'place',
        locations: pendingPoints.value.map(toGeoPoint),
        description: data.description || undefined,
        installation_date: data.installationDate || undefined,
        replacement_date: data.replacementDate || undefined,
      })
      toastStore.success('Assets created successfully')
      resetDraw()
      await loadMapData()
    } catch (error) {
      console.error('Failed to create assets:', error)
      toastStore.error('Failed to create assets')
    }
    return
  }
  if (!location || !communityId || !shape || shape === 'polygon') return
  try {
    await assetApi.createAsset({
      community_id: communityId,
      asset_type: getAssetTypeKey(data.type),
      shape,
      location,
      description: data.description || undefined,
      installation_date: data.installationDate || undefined,
      replacement_date: data.replacementDate || undefined,
    })
    toastStore.success('Asset created successfully')
    resetDraw()
    await loadMapData()
  } catch (error) {
    console.error('Failed to create asset:', error)
    toastStore.error('Failed to create asset')
  }
}

async function handleAddPost(data: PostFormData) {
  postSaveError.value = ''
  const location = pendingApiLocation()
  const communityId = Number(data.communityId || selectedCommunityId.value)
  const shape = activeShape.value
  if (editingItem.value?.type === 'post') {
    try {
      await assetApi.updatePost({
        post_id: Number(editingItem.value.id.replace('PST-', '')),
        name: data.name,
        description: data.description || undefined,
        priority: data.priority.toLowerCase() as 'urgent' | 'important' | 'normal' | 'low',
        equipment: data.equipment || undefined,
        permissions: data.permissions,
        is_active: data.active,
      })
      closeEditor()
      selectedItem.value = null
      toastStore.success('Post updated successfully')
      await loadMapData()
    } catch (error) {
      if (error instanceof ApiError && error.rc === 753) {
        postSaveError.value = t('map.post_name_exists')
      } else {
        console.error('Failed to update post:', error)
        toastStore.error('Failed to update post')
      }
    }
    return
  }
  if (!location || !communityId || !shape || shape === 'polygon') return
  try {
    await assetApi.createPost({
      community_id: communityId,
      name: data.name,
      description: data.description || undefined,
      priority: data.priority.toLowerCase() as 'urgent' | 'important' | 'normal' | 'low',
      shape,
      location,
      equipment: data.equipment || undefined,
      permissions: data.permissions,
      is_active: data.active,
    })
    closeEditor()
    toastStore.success('Post created successfully')
    resetDraw()
    await loadMapData()
  } catch (error) {
    if (error instanceof ApiError && error.rc === 753) {
      postSaveError.value = t('map.post_name_exists')
    } else {
      console.error('Failed to create post:', error)
      toastStore.error('Failed to create post')
    }
  }
}

async function handleAddZone(data: ZoneFormData) {
  if (editingItem.value?.type === 'zone') {
    try {
      await assetApi.updateMapZone({
        zone_id: Number(editingItem.value.id.replace('ZN-', '')),
        zone_type: data.zoneType,
        name: data.name,
      })
      closeEditor()
      selectedItem.value = null
      toastStore.success('Map zone updated successfully')
      await loadMapData()
    } catch (error) {
      console.error('Failed to update map zone:', error)
      toastStore.error('Failed to update map zone')
    }
    return
  }
  const location = pendingApiLocation()
  const communityId = Number(data.communityId || selectedCommunityId.value)
  if (!location || !communityId) return
  try {
    await assetApi.createMapZone({
      community_id: communityId,
      zone_type: data.zoneType,
      name: data.name,
      location,
    })
    closeEditor()
    toastStore.success('Map zone created successfully')
    resetDraw()
    await loadMapData()
  } catch (error) {
    console.error('Failed to create map zone:', error)
    toastStore.error('Failed to create map zone')
  }
}

function resetDraw() {
  pendingLocation.value = null
  pendingPoints.value = []
  pendingCircleRadius.value = null
  circleCenter.value = null
  circleRadiusPx.value = 0
  isDrawingCircle.value = false
  activeShape.value = null
  drawEntityType.value = null
  isBatchMode.value = false
}

function openAddNew() {
  if (isLimitReached.value) return
  editingItem.value = null
  pendingLocation.value = null
  showTypeSelect.value = true
}

function startBatchMode() {
  if (isLimitReached.value) return
  resetPendingShape()
  editingItem.value = null
  isBatchMode.value = true
  drawEntityType.value = 'asset'
  activeShape.value = 'place'
}

function openEditModal(item: MapItem) {
  editingItem.value = item
  if (item.type === 'asset') showAddAssetModal.value = true
  else if (item.type === 'post') showAddPostModal.value = true
  else showAddZoneModal.value = true
}

const editingAssetData = computed<AssetFormData | null>(() => editingItem.value?.type === 'asset' ? {
  id: editingItem.value.id,
  type: editingItem.value.assetType,
  installationDate: editingItem.value.installationDate,
  replacementDate: editingItem.value.replacementDate,
  description: editingItem.value.description,
  location: editingItem.value.location,
  shape: editingItem.value.shape,
  acres: editingItem.value.acres,
  communityId: selectedCommunityId.value,
} : null)

const editingPostData = computed<PostFormData | null>(() => editingItem.value?.type === 'post' ? {
  id: editingItem.value.id,
  name: editingItem.value.name,
  description: editingItem.value.description,
  priority: editingItem.value.priority,
  equipment: editingItem.value.equipment,
  active: editingItem.value.active,
  location: editingItem.value.location,
  communityId: selectedCommunityId.value,
  shape: editingItem.value.shape,
  permissions: editingItem.value.permissions ? {
    required_roles: editingItem.value.permissions.required_roles,
    required_badges: editingItem.value.permissions.required_badges,
    required_equipment: editingItem.value.permissions.required_equipment,
  } : undefined,
} : null)

const editingZoneData = computed<ZoneFormData | null>(() => editingItem.value?.type === 'zone' ? {
  id: editingItem.value.id,
  name: editingItem.value.name,
  zoneType: editingItem.value.zoneType,
  communityId: selectedCommunityId.value,
} : null)

function closeEditor() {
  showAddAssetModal.value = false
  showAddPostModal.value = false
  showAddZoneModal.value = false
  editingItem.value = null
  pendingLocation.value = null
  postSaveError.value = ''
}

function openDeleteModal(item: MapItem) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

async function togglePostActive(post: MapPost) {
  try {
    await assetApi.updatePost({
      post_id: Number(post.id.replace('PST-', '')),
      is_active: !post.active,
    })
    toastStore.success(post.active ? 'Post deactivated successfully' : 'Post activated successfully')
    await loadMapData()
  } catch (error) {
    console.error('Failed to update post status:', error)
    toastStore.error('Failed to update post status')
  }
}

async function handleDeleteItem() {
  const item = itemToDelete.value
  if (!item) return
  const id = Number(item.id.replace(/^[A-Z]+-/, ''))
  try {
    if (item.type === 'asset') await assetApi.deleteAsset(id)
    else if (item.type === 'post') await assetApi.deletePost(id)
    else await assetApi.deleteMapZone(id)
    if (selectedItem.value?.id === item.id) selectedItem.value = null
    showDeleteModal.value = false
    itemToDelete.value = null
    toastStore.success('Item deleted successfully')
    await loadMapData()
  } catch (error) {
    console.error('Failed to delete map item:', error)
    toastStore.error('Failed to delete item')
  }
}

function getItemName(item: MapItem): string {
  if (item.type === 'asset') return `${item.assetType} (${item.id})`
  if (item.type === 'post') return item.name
  return item.name
}

function getMarkerIcon(item: MapItem): string {
  if (item.type === 'post') return 'lucide:map-pin'
  if (item.type === 'zone') return isZone(item) && item.zoneType === 'entry_exit' ? 'lucide:door-open' : 'lucide:shield-alert'
  const map: Record<string, string> = {
    Camera: 'lucide:camera',
    Door: 'lucide:door-open',
    Window: 'lucide:layout-dashboard',
    Gate: 'lucide:gate',
    Sensor: 'lucide:activity',
    Light: 'lucide:lamp',
    Other: 'lucide:box',
  }
  return map[(item as MapAsset).assetType] ?? 'lucide:box'
}

function getMarkerClass(item: MapItem): string {
  const base = {
    asset: 'marker--asset',
    post: 'marker--post',
    zone: isZone(item) && item.zoneType === 'entry_exit' ? 'marker--entry' : 'marker--zone',
  }[item.type] ?? ''
  return `${base} marker--${item.shape}`
}

async function handleUploadMapSave(data: { communityId: string; file: File }) {
  const communityId = Number(data.communityId)
  if (!communityId || !data.file) return
  isUploadingMap.value = true
  try {
    const mapImage = await fileToBase64(data.file)
    const response = await assetApi.uploadCommunityMap({ community_id: communityId, map_image: mapImage })
    const community = communities.value.find(c => c.community_id === communityId)
    if (community) community.map_image_url = response.map_image_url
    showUploadMapModal.value = false
    toastStore.success('Community map uploaded successfully')
    if (String(communityId) !== selectedCommunityId.value) {
      selectedCommunityId.value = String(communityId)
    } else {
      mapImageUrl.value = response.map_image_url
      mapBase.value = 'image'
      hasMap.value = true
    }
  } catch (error) {
    console.error('Failed to upload community map:', error)
    toastStore.error('Failed to upload community map')
  } finally {
    isUploadingMap.value = false
  }
}
</script>

<template>
  <div class="map-workspace">
    <!-- Toolbar -->
    <div class="map-toolbar">
      <div class="toolbar-section">
        <label class="toolbar-label">{{ t('communities.community') }}</label>
        <select v-model="selectedCommunityId" class="toolbar-select">
          <option v-for="c in communities" :key="c.community_id" :value="String(c.community_id)">{{ c.name }}</option>
        </select>
      </div>

      <div class="toolbar-section">
        <span
          class="live-counter"
          :class="liveCountClass"
          :title="isLimitReached ? t('map.items_limit_tooltip') : ''"
        >
          {{ t('map.items_counter', { current: String(liveItemCount), limit: String(ITEM_LIMIT) }) }}
        </span>
      </div>

      <div class="toolbar-divider" />

      <div class="toolbar-section layer-toggles">
        <button class="layer-toggle" :class="{ active: layers.assets }" @click="toggleLayer('assets')">
          <Icon :name="layers.assets ? 'lucide:eye' : 'lucide:eye-off'" :size="14" />
          <span>{{ t('map.assets') }}</span>
        </button>
        <button class="layer-toggle" :class="{ active: layers.posts }" @click="toggleLayer('posts')">
          <Icon :name="layers.posts ? 'lucide:eye' : 'lucide:eye-off'" :size="14" />
          <span>{{ t('map.posts') }}</span>
        </button>
        <button class="layer-toggle" :class="{ active: layers.zones }" @click="toggleLayer('zones')">
          <Icon :name="layers.zones ? 'lucide:eye' : 'lucide:eye-off'" :size="14" />
          <span>{{ t('map.zones') }}</span>
        </button>
      </div>

      <div class="toolbar-divider" />

      <div ref="assetTypeFilterRef" class="toolbar-section multi-select-section">
        <label class="toolbar-label">{{ t('map.asset_type') }}</label>
        <button
          class="toolbar-select multi-select-trigger"
          :class="{ open: openAssetTypeFilter }"
          @click.stop="openAssetTypeFilter = !openAssetTypeFilter"
        >
          <span>{{ selectedAssetTypesLabel }}</span>
          <Icon name="lucide:chevrons-up-down" :size="14" />
        </button>
        <div v-if="openAssetTypeFilter" class="multi-select-dropdown" @click.stop>
          <label class="multi-select-option multi-select-all">
            <input type="checkbox" :checked="allAssetTypesSelected" @change="toggleAllAssetTypes">
            <span>{{ t('map.all') }}</span>
          </label>
          <label v-for="type in assetTypeOptions" :key="type" class="multi-select-option">
            <input v-model="selectedAssetTypes" type="checkbox" :value="type">
            <span>{{ type }}</span>
          </label>
        </div>
      </div>

      <div class="toolbar-section">
        <label class="toolbar-label">{{ t('map.zone') }}</label>
        <select v-model="selectedZoneType" class="toolbar-select">
          <option value="all">{{ t('map.all') }}</option>
          <option value="entry_exit">{{ t('map.entry_exit') }}</option>
          <option value="high_priority">{{ t('map.zone') }}</option>
        </select>
      </div>

      <div class="toolbar-section search-section">
        <div class="search-box">
          <Icon name="lucide:search" :size="14" />
          <input v-model="searchQuery" type="text" :placeholder="t('common.search')" />
        </div>
      </div>

      <div class="toolbar-section">
        <label class="toolbar-label">{{ t('map.map_base') }}</label>
        <AppSegmentedControl
          v-model="mapBase"
          :options="mapBaseOptions"
          :aria-label="t('map.map_base')"
        />
      </div>

      <div class="toolbar-section toolbar-actions">
        <AppButton
          :text="t('map.list_view')"
          type="secondary"
          icon="lucide:list"
          size="sm"
          @click="router.push('/map/posts')"
        />
        <AppButton
          :text="t('map.upload_map')"
          type="secondary"
          icon="lucide:upload"
          size="sm"
          @click="showUploadMapModal = true"
        />
      </div>
    </div>

    <!-- Main workspace -->
    <div class="workspace-body">
      <div class="map-area">
        <!-- Shape toolbar -->
        <div class="shape-toolbar">
          <span class="toolbar-label">{{ t('map.entity_type') }}:</span>
          <AppSegmentedControl
            v-model="drawEntityTypeModel"
            class="entity-type-selector"
            :options="drawEntityOptions"
            :aria-label="t('map.entity_type')"
          />

          <div class="toolbar-divider" />

          <span class="toolbar-label">{{ t('map.shape') }}:</span>
          <button
            :class="['tool-btn', { active: activeShape === 'place', disabled: isLimitReached || !drawEntityType }]"
            :disabled="isLimitReached || !drawEntityType"
            @click="selectShape('place')"
          >
            <Icon name="lucide:map-pin" :size="16" />
            <span>{{ t('map.shape_dot') }}</span>
          </button>
          <button
            :class="['tool-btn', { active: activeShape === 'circle', disabled: isLimitReached || !drawEntityType }]"
            :disabled="isLimitReached || !drawEntityType"
            @click="selectShape('circle')"
          >
            <Icon name="lucide:circle" :size="16" />
            <span>{{ t('map.shape_circle') }}</span>
          </button>
          <button
            :class="['tool-btn', { active: activeShape === 'line', disabled: isLimitReached || !drawEntityType }]"
            :disabled="isLimitReached || !drawEntityType"
            @click="selectShape('line')"
          >
            <Icon name="lucide:minus" :size="16" />
            <span>{{ t('map.shape_line') }}</span>
          </button>
          <button
            :class="['tool-btn', { active: activeShape === 'polygon', disabled: isLimitReached || drawEntityType !== 'zone' }]"
            :disabled="isLimitReached || drawEntityType !== 'zone'"
            @click="selectShape('polygon')"
          >
            <Icon name="lucide:hexagon" :size="16" />
            <span>{{ t('map.shape_polygon') }}</span>
          </button>

          <div v-if="activeShape" class="toolbar-divider" />
          <button v-if="activeShape" class="tool-btn" :disabled="!canFinishDrawing()" @click="finishDrawing">
            <Icon name="lucide:check" :size="16" />
            <span>{{ t('map.finish') }}</span>
          </button>
          <button v-if="activeShape" class="tool-btn" @click="cancelDrawing">
            <Icon name="lucide:x" :size="16" />
            <span>{{ t('common.cancel') }}</span>
          </button>

          <button class="tool-btn" :disabled="!activeShape && !pendingPoints.length && !circleCenter" @click="undoLastDraw">
            <Icon name="lucide:undo-2" :size="16" />
            <span>{{ t('map.undo') }}</span>
          </button>

          <div v-if="isBatchMode" class="batch-badge">
            <Icon name="lucide:layers" :size="12" />
            {{ t('map.batch_mode') }}
            <button class="batch-cancel" @click="resetDraw">
              <Icon name="lucide:x" :size="12" />
            </button>
          </div>

          <AppButton
            class="add-btn"
            :text="t('map.add_new')"
            type="primary"
            icon="lucide:plus"
            size="sm"
            :disabled="isLimitReached"
            @click="openAddNew"
          />
          <AppButton
            :text="t('map.add_multiple')"
            type="secondary"
            icon="lucide:layers"
            size="sm"
            :disabled="isLimitReached"
            @click="startBatchMode"
          />
        </div>

        <!-- Map canvas -->
        <div
          class="map-canvas"
          :class="{ 'cursor-crosshair': !!activeShape }"
        >
          <div v-if="!hasMap" class="map-empty" @click.stop>
            <Icon name="lucide:map" :size="48" class="map-empty__icon" />
            <h3 class="map-empty__title">{{ t('map.no_map_title') }}</h3>
            <p class="map-empty__subtitle">{{ t('map.no_map_subtitle') }}</p>
            <AppButton :text="t('map.create_map')" type="primary" icon="lucide:plus" @click="hasMap = true" />
          </div>

          <template v-else>
            <div class="map-base-layer" :class="{ 'non-interactive': !!activeShape && useImageMap }">
              <img v-if="useImageMap" :src="mapImageUrl || ''" alt="Community map" class="map-bg-image">
              <GoogleMap
                v-else
                :key="googleMapKey"
                :center="mapCenter"
                :zoom="15"
                :workspace-markers="workspaceMarkers"
                :drawing-mode="activeShape"
                :drawing-points="drawingGeoPoints"
                :drawing-circle-center="drawingCircleCenter"
                :drawing-circle-radius="pendingCircleRadius || 0"
                height="100%"
                @workspace-marker-click="handleWorkspaceMarkerClick"
                @draw-click="handleGoogleMapClick"
                @draw-double-click="handleCanvasDblclick"
                @draw-mousedown="handleGoogleMapMousedown"
                @draw-mousemove="handleGoogleMapMousemove"
                @draw-mouseup="handleGoogleMapMouseup"
                @draw-point-remove="removePendingPoint"
              />
            </div>

            <div
              v-if="activeShape && useImageMap"
              class="drawing-hit-area"
              @mousedown="handleCanvasMousedown($event)"
              @mousemove="handleCanvasMousemove($event)"
              @mouseup="handleCanvasMouseup"
              @click="handleCanvasClick($event)"
              @dblclick.prevent="handleCanvasDblclick"
            />

            <svg v-if="useImageMap && pendingPoints.length" class="drawing-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                v-if="activeShape === 'line'"
                :points="pendingPoints.map(p => `${p.x},${p.y}`).join(' ')"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="0.5"
                stroke-dasharray="2,1"
              />
              <polygon
                v-else-if="activeShape === 'polygon'"
                :points="pendingPoints.map(p => `${p.x},${p.y}`).join(' ')"
                fill="rgba(239, 68, 68, 0.12)"
                stroke="#f87171"
                stroke-width="0.5"
              />
            </svg>

            <span
              v-for="(point, index) in isBatchMode && useImageMap ? pendingPoints : []"
              :key="`batch-${index}`"
              class="pending-place-marker"
              :style="{ left: point.x + '%', top: point.y + '%' }"
              title="Click to remove"
              @click.stop="removePendingPoint(index)"
            >{{ index + 1 }}</span>

            <div
              v-if="useImageMap && circleCenter && activeShape === 'circle'"
              class="circle-guide"
              :style="{
                left: circleCenter.x + '%',
                top: circleCenter.y + '%',
                width: (circleRadiusPx * 2) + 'px',
                height: (circleRadiusPx * 2) + 'px',
              }"
            >
              <span class="circle-guide__label">R: {{ pendingCircleRadius ?? 0 }}m</span>
            </div>

            <div
              v-for="item in useImageMap ? visibleItems : []"
              :key="item.id"
              class="map-marker"
              :class="getMarkerClass(item)"
              :style="{ left: item.location.x + '%', top: item.location.y + '%' }"
              @click.stop="selectedItem = item"
            >
              <Icon :name="getMarkerIcon(item)" :size="16" />
              <span class="marker-label">{{ getItemName(item) }}</span>
            </div>

            <div v-if="isBatchMode" class="batch-count-chip">
              <Icon name="lucide:map-pin" :size="12" />
              {{ pendingPoints.length }} / {{ BATCH_LIMIT }}
            </div>

            <div v-if="!drawEntityType || activeShape" class="map-hint">
              <Icon name="lucide:mouse-pointer-click" :size="14" />
              <span v-if="!drawEntityType">{{ t('map.hint_select_entity') }}</span>
              <span v-else-if="!activeShape">{{ t('map.hint_select_shape') }}</span>
              <span v-else-if="activeShape === 'place'">{{ isBatchMode ? t('map.hint_batch') : t('map.hint_single') }}</span>
              <span v-else-if="activeShape === 'circle'">{{ t('map.hint_circle') }}</span>
              <span v-else-if="activeShape === 'line'">{{ t('map.hint_line') }}</span>
              <span v-else-if="activeShape === 'polygon'">{{ t('map.hint_polygon') }}</span>
            </div>
          </template>
        </div>

        <!-- Legend -->
        <div v-if="hasMap" class="map-legend">
          <span class="legend-title">{{ t('map.legend') }}:</span>
          <span class="legend-item legend-item--asset"><Icon name="lucide:box" :size="12" /> {{ t('map.assets') }} ({{ assetCount }})</span>
          <span class="legend-item legend-item--post"><Icon name="lucide:map-pin" :size="12" /> {{ t('map.posts') }} ({{ postCount }})</span>
          <span class="legend-item legend-item--zone"><Icon name="lucide:shield-alert" :size="12" /> {{ t('map.zone') }} ({{ zoneCount }})</span>
          <span class="legend-muted">{{ t('map.total_items', { count: String(visibleItems.length) }) }}</span>
        </div>
      </div>

      <!-- Right detail drawer -->
      <AssetDetailDrawer
        v-if="selectedItem && selectedItem.type === 'asset'"
        :asset="asAsset(selectedItem)"
        @close="selectedItem = null"
        @edit="openEditModal(selectedItem)"
        @delete="openDeleteModal(selectedItem)"
      />

      <PostDetailDrawer
        v-else-if="selectedItem && selectedItem.type === 'post'"
        :post="selectedItem"
        @close="selectedItem = null"
        @edit="openEditModal(selectedItem)"
        @toggle="togglePostActive(selectedItem)"
        @delete="openDeleteModal(selectedItem)"
      />

      <aside v-else-if="selectedItem" class="detail-drawer">
        <div class="detail-header">
          <h3 class="detail-title">{{ getItemName(selectedItem) }}</h3>
          <button class="detail-close" @click="selectedItem = null">
            <Icon name="lucide:x" :size="16" />
          </button>
        </div>

        <div class="detail-body">
          <div class="detail-row">
            <span class="detail-label">ID</span>
            <span class="detail-value mono">{{ selectedItem.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('map.location') }}</span>
            <span class="detail-value mono">{{ selectedItem.location.lat != null && selectedItem.location.lng != null ? `${selectedItem.location.lat.toFixed(6)}, ${selectedItem.location.lng.toFixed(6)}` : '—' }}</span>
          </div>
          <template v-if="isZone(selectedItem)">
            <div class="detail-row">
              <span class="detail-label">{{ t('map.zone') }}</span>
              <span class="detail-value">{{ asZone(selectedItem).zoneType === 'entry_exit' ? t('map.entry_exit') : t('map.zone') }}</span>
            </div>
          </template>
        </div>

        <div class="detail-footer">
          <AppButton text="Edit" type="secondary" icon="lucide:pencil" size="sm" @click="openEditModal(selectedItem)" />
          <AppButton text="Delete" type="danger" icon="lucide:trash-2" size="sm" @click="openDeleteModal(selectedItem)" />
        </div>
      </aside>
    </div>

    <!-- Type select modal -->
    <AppModal
      :show="showTypeSelect"
      :title="t('map.select_item_type')"
      :cancel-text="t('common.cancel')"
      @close="showTypeSelect = false; pendingLocation = null"
      @cancel="showTypeSelect = false; pendingLocation = null"
    >
      <div class="type-select">
        <button class="type-select__btn" @click="selectItemType('asset')">
          <Icon name="lucide:box" :size="28" class="type-select__icon type-select__icon--asset" />
          <span class="type-select__label">{{ t('map.asset') }}</span>
          <span class="type-select__hint">{{ t('map.asset_hint') }}</span>
        </button>
        <button class="type-select__btn" @click="selectItemType('post')">
          <Icon name="lucide:map-pin" :size="28" class="type-select__icon type-select__icon--post" />
          <span class="type-select__label">{{ t('map.post') }}</span>
          <span class="type-select__hint">{{ t('map.post_hint') }}</span>
        </button>
        <button class="type-select__btn" @click="selectItemType('zone')">
          <Icon name="lucide:shield-alert" :size="28" class="type-select__icon type-select__icon--zone" />
          <span class="type-select__label">{{ t('map.zone') }}</span>
          <span class="type-select__hint">{{ t('map.zone_hint') }}</span>
        </button>
      </div>
    </AppModal>

    <!-- Add asset/post modals -->
    <AddAssetModal
      :show="showAddAssetModal"
      :location="pendingLocation"
      :asset-types="assetTypeOptions"
      :initial-data="editingAssetData"
      :communities="communities"
      :community-id="selectedCommunityId"
      :shape="activeShape && activeShape !== 'polygon' ? activeShape : 'place'"
      @close="closeEditor"
      @save="handleAddAsset"
    />
    <AddPostModal
      :show="showAddPostModal"
      :location="pendingLocation"
      :priorities="postPriorityOptions"
      :initial-data="editingPostData"
      :communities="communities"
      :community-id="selectedCommunityId"
      :shape="activeShape && activeShape !== 'polygon' ? activeShape : 'place'"
      :server-error="postSaveError"
      @close="closeEditor"
      @save="handleAddPost"
    />

    <!-- Add zone modal -->
    <AddZoneModal
      :show="showAddZoneModal"
      :location="pendingLocation"
      :points="pendingPoints"
      :initial-data="editingZoneData"
      :communities="communities"
      :community-id="selectedCommunityId"
      @close="closeEditor"
      @save="handleAddZone"
    />

    <!-- Upload community map modal -->
    <UploadMapModal
      :show="showUploadMapModal"
      :communities="communities"
      :community-id="selectedCommunityId"
      :uploading="isUploadingMap"
      @close="showUploadMapModal = false"
      @save="handleUploadMapSave"
    />

    <LoadingModal :show="isLoadingMapData" message="Loading map data..." />

    <!-- Delete confirmation -->
    <AppModal
      :show="showDeleteModal"
      :title="t('map.delete_item_title')"
      :message="t('map.delete_item_message', { name: itemToDelete ? getItemName(itemToDelete) : '' })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @ok="handleDeleteItem"
    />

    <!-- Batch / map item limit warning -->
    <AppModal
      :show="showLimitWarning"
      :title="limitWarningKind === 'batch' ? t('map.batch_limit_title') : t('map.limit_exceeded_title')"
      cancel-text=""
      :ok-text="t('common.ok')"
      @close="showLimitWarning = false"
      @ok="showLimitWarning = false"
    >
      <div class="limit-warning">
        <p class="limit-warning__message">
          {{ limitWarningKind === 'batch'
            ? t('map.batch_limit_message', { max: String(BATCH_LIMIT) })
            : t('map.limit_exceeded_message', { total: String(projectedTotal), limit: String(ITEM_LIMIT) }) }}
        </p>
        <p class="limit-warning__hint">{{ t('map.limit_exceeded_hint') }}</p>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.map-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 0;
}

/* Toolbar */
.map-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toolbar-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toolbar-select {
  min-width: 140px;
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.multi-select-section {
  position: relative;
}

.multi-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  cursor: pointer;
  min-width: 160px;
}

.multi-select-dropdown {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  z-index: 50;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.multi-select-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.multi-select-option:hover {
  background: var(--color-bg-base);
}

.multi-select-option input[type="checkbox"] {
  accent-color: var(--color-accent);
}

.multi-select-all {
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-1);
}

.live-counter {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.counter--warning {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.5);
}

.counter--danger {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.layer-toggles {
  display: flex;
  gap: var(--space-1);
}

.layer-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.layer-toggle.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-base);
}

.search-section {
  flex: 1;
  min-width: 180px;
}

.search-box {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
}

/* Workspace body */
.workspace-body {
  flex: 1;
  display: flex;
  gap: var(--space-4);
  min-height: 0;
}

.map-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}

.shape-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.tool-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.tool-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-base);
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.entity-type-selector {
  min-width: 220px;
}

.add-btn {
  margin-left: auto;
}

.batch-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(229, 255, 68, 0.15);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  margin-left: auto;
}

.batch-cancel {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
}

/* Map canvas */
.map-canvas {
  position: relative;
  flex: 1;
  min-height: 420px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.cursor-crosshair {
  cursor: crosshair;
}

.map-base-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: auto;
  overflow: hidden;
}

.map-base-layer.non-interactive {
  pointer-events: none;
}

.drawing-hit-area {
  position: absolute;
  inset: 0;
  z-index: 10;
  cursor: crosshair;
}

.map-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--color-bg-base);
  pointer-events: none;
}

.drawing-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pending-place-marker {
  position: absolute;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #fff;
  background: var(--color-accent);
  border: 2px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: none;
}

.circle-guide {
  position: absolute;
  z-index: 5;
  border: 2px dashed var(--color-accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-guide__label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: white;
  white-space: nowrap;
}

.map-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.map-empty__icon {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.map-empty__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.map-empty__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* Markers */
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  z-index: 10;
}

.marker-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  background: var(--color-bg-base);
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid var(--color-border);
}

.marker--asset { color: var(--color-accent); }
.marker--post { color: #f59e0b; }
.marker--entry { color: #60a5fa; }
.marker--zone { color: #f87171; }

.marker--circle {
  background: rgba(110, 231, 183, 0.1);
  border: 2px solid currentColor;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
}

/* Batch count chip */
.batch-count-chip {
  position: absolute;
  top: var(--space-3);
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-accent);
  pointer-events: none;
}

/* Map hint */
.map-hint {
  position: absolute;
  bottom: var(--space-3);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(0,0,0,0.7);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: white;
  pointer-events: none;
}

/* Legend */
.map-legend {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
}

.legend-title {
  font-weight: 600;
  color: var(--color-text-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.legend-item--asset { color: var(--color-accent); }
.legend-item--post { color: #f59e0b; }
.legend-item--zone { color: #f87171; }
.legend-muted { color: var(--color-text-muted); margin-left: auto; }

/* Detail drawer */
.detail-drawer {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  gap: var(--space-4);
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.detail-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  min-width: 100px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.detail-value.mono {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.detail-footer {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
}

/* Type select */
.type-select {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-3);
  padding: var(--space-2);
  min-width: 360px;
}

.type-select__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-4);
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: center;
}

.type-select__btn:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-base);
}

.type-select__icon--asset { color: var(--color-accent); }
.type-select__icon--post { color: #f59e0b; }
.type-select__icon--zone { color: #f87171; }

.type-select__label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.type-select__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Zone modal */
.zone-modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 360px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-field.error .field-input,
.form-field.error .field-select {
  border-color: var(--color-critical);
}

.field-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.field-input,
.field-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  box-sizing: border-box;
}

.field-input:focus,
.field-select:focus {
  border-color: var(--color-accent);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.required {
  color: var(--color-critical);
}

.priority-badge {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.priority-badge--critical { background: rgba(239,68,68,0.15); color: #ef4444; }
.priority-badge--warn { background: rgba(245,158,11,0.15); color: #f59e0b; }
.priority-badge--accent { background: rgba(110,231,183,0.15); color: var(--color-accent); }
.priority-badge--muted { background: var(--color-bg-elevated); color: var(--color-text-muted); }

.limit-warning__message {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.limit-warning__hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

@media (max-width: 1024px) {
  .workspace-body {
    flex-direction: column;
  }
  .detail-drawer {
    width: 100%;
  }
}
</style>
