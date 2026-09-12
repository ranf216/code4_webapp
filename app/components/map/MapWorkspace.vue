<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import type { AssetFormData } from './AddAssetModal.vue'
import type { PostFormData } from './AddPostModal.vue'

const { t } = useTranslation()

// Communities (replace with API call)
const communities = [
  { id: '1', name: 'Sunset Heights' },
  { id: '2', name: 'Riverside Gardens' },
  { id: '3', name: 'Metro Central' },
]
const selectedCommunityId = ref(communities[0]?.id ?? '1')

const selectedCommunityName = computed(() => {
  const community = communities.find(c => c.id === selectedCommunityId.value)
  return community?.name ?? ''
})

// Map state
const hasMap = ref(true)
const activeShape = ref<'place' | 'circle' | 'line' | 'polygon' | null>(null)
const isBatchMode = ref(false)
const pendingLocation = ref<MapPoint | null>(null)
const pendingPoints = ref<MapPoint[]>([])
const pendingCircleRadius = ref<number | null>(null)
const circleCenter = ref<MapPoint | null>(null)
const circleRadiusPx = ref(0)
const isDrawingCircle = ref(false)
const METERS_PER_PERCENT = 5
const mapImageUrl = ref<string | null>(null)
const mapImageInput = ref<HTMLInputElement | null>(null)

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
const assetTypeOptions = ['Camera', 'Gate', 'Door', 'Alarm', 'Fence', 'Other']
const selectedAssetTypesLabel = computed(() => {
  if (selectedAssetTypes.value.length === 0 || selectedAssetTypes.value.length === assetTypeOptions.length) return t('map.all')
  if (selectedAssetTypes.value.length === 1) return selectedAssetTypes.value[0]
  return `${selectedAssetTypes.value.length} selected`
})
const allAssetTypesSelected = computed(() => selectedAssetTypes.value.length === assetTypeOptions.length)
function toggleAllAssetTypes() {
  selectedAssetTypes.value = allAssetTypesSelected.value ? [] : [...assetTypeOptions]
}
function closeAssetTypeFilter(event: MouseEvent) {
  if (assetTypeFilterRef.value && !assetTypeFilterRef.value.contains(event.target as Node)) {
    openAssetTypeFilter.value = false
  }
}

const selectedZoneType = ref<'all' | 'entry_exit' | 'high_priority'>('all')
const ASSET_TYPES = ['Camera', 'Door', 'Window', 'Gate', 'Sensor', 'Light', 'Other']
const PRIORITIES = ['Urgent', 'Important', 'Normal', 'Low']

// Items
interface MapPoint { x: number; y: number; lat?: number; lng?: number }

const MAP_CENTER = { lat: 34.0522, lng: -118.2437 }

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

const mapItems = ref<MapItem[]>([
  { id: 'AST-1001', type: 'asset', assetType: 'Camera', installationDate: '2024-01-10', replacementDate: '', description: 'Main entrance camera', location: { x: 35, y: 40, lat: 34.0528, lng: -118.2452 }, shape: 'place' },
  { id: 'AST-1002', type: 'asset', assetType: 'Door', installationDate: '2024-02-15', replacementDate: '2026-02-15', description: 'Security door - North wing', location: { x: 55, y: 25, lat: 34.0541, lng: -118.2428 }, shape: 'place' },
  { id: 'AST-1003', type: 'asset', assetType: 'Window', installationDate: '2024-03-20', replacementDate: '', description: '', location: { x: 70, y: 60, lat: 34.0514, lng: -118.2414 }, shape: 'circle', radius: 100, createdBy: 'Admin', createdOn: '2024-03-21', lastUpdated: '2024-03-21' },
  { id: 'PST-1001', type: 'post', name: 'Main Gate', description: 'Primary entry point', priority: 'Urgent', equipment: 'Radio, Flashlight', active: true, location: { x: 20, y: 70, lat: 34.0506, lng: -118.2462 }, shape: 'place' },
  { id: 'PST-1002', type: 'post', name: 'North Patrol', description: 'Northern perimeter', priority: 'Normal', equipment: 'Radio', active: true, location: { x: 65, y: 15, lat: 34.055, lng: -118.2418 }, shape: 'circle' },
  { id: 'PST-1003', type: 'post', name: 'Parking Lot B', description: 'Secondary parking area', priority: 'Low', equipment: '', active: false, location: { x: 80, y: 75, lat: 34.0498, lng: -118.2405 }, shape: 'place' },
  { id: 'ZN-1001', type: 'zone', zoneType: 'entry_exit', name: 'Main Entrance', location: { x: 45, y: 85 }, shape: 'place' },
  { id: 'ZN-1002', type: 'zone', zoneType: 'high_priority', name: 'Server Room', location: { x: 25, y: 30 }, shape: 'polygon' },
])

const ITEM_LIMIT = 1000

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
const workspaceMarkers = computed(() => visibleItems.value
  .filter((item): item is MapAsset | MapPost => item.type !== 'zone')
  .map(item => ({
    id: item.id,
    lat: item.location.lat ?? MAP_CENTER.lat + (50 - item.location.y) * 0.0001,
    lng: item.location.lng ?? MAP_CENTER.lng + (item.location.x - 50) * 0.0001,
    type: item.type,
    label: getItemName(item),
    color: item.type === 'post' ? ({ Urgent: '#ef4444', Important: '#f59e0b', Normal: '#3b82f6', Low: '#6b7280' }[item.priority] ?? '#3b82f6') : '#4f6ef7',
    active: item.type === 'asset' || item.active,
  })))
const googleMapKey = computed(() => workspaceMarkers.value.map(item => item.id).join('|'))

function handleWorkspaceMarkerClick(marker: { id: string }) {
  selectedItem.value = mapItems.value.find(item => item.id === marker.id) ?? null
}

// Drawing
function percentFromEvent(event: MouseEvent, target: HTMLElement): MapPoint {
  const rect = target.getBoundingClientRect()
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 100)
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 100)
  return { x, y }
}

function selectShape(shape: 'place' | 'circle' | 'line' | 'polygon') {
  if (isLimitReached.value) return
  if (activeShape.value === shape) {
    activeShape.value = null
  } else {
    activeShape.value = shape
    pendingPoints.value = []
    circleCenter.value = null
    pendingCircleRadius.value = null
    isDrawingCircle.value = false
  }
}

function handleCanvasMousedown(event: MouseEvent) {
  if (!activeShape.value || activeShape.value !== 'circle' || isLimitReached.value || isDrawingCircle.value) return
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
  showTypeSelect.value = true
}

function handleCanvasClick(event: MouseEvent) {
  if (!activeShape.value || isLimitReached.value || isDrawingCircle.value) return
  if (activeShape.value === 'circle') return
  const point = percentFromEvent(event, event.currentTarget as HTMLElement)
  if (activeShape.value === 'place') {
    pendingLocation.value = point
    showTypeSelect.value = true
    return
  }
  // line or polygon
  pendingPoints.value.push(point)
  if (pendingPoints.value.length === 1) {
    pendingLocation.value = point
  }
}

function handleCanvasDblclick() {
  if (!activeShape.value || isLimitReached.value) return
  if ((activeShape.value === 'line' || activeShape.value === 'polygon') && pendingPoints.value.length >= 2) {
    if (activeShape.value === 'polygon') {
      // Close the polygon by appending the first point
      const first: MapPoint = pendingPoints.value[0]!
      pendingPoints.value.push({ ...first })
    }
    showTypeSelect.value = true
  }
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
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()
    undoLastDraw()
  }
}
onMounted(() => {
  window.addEventListener('click', closeAssetTypeFilter)
  window.addEventListener('keydown', handleKeydown)
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
const showDeleteModal = ref(false)
const selectedItem = ref<MapItem | null>(null)
const itemToDelete = ref<MapItem | null>(null)

const addZoneForm = reactive({ name: '', zoneType: 'entry_exit' as 'entry_exit' | 'high_priority' })
const addZoneError = ref('')

function selectItemType(type: 'asset' | 'post' | 'zone') {
  showTypeSelect.value = false
  if (type === 'asset') showAddAssetModal.value = true
  else if (type === 'post') showAddPostModal.value = true
  else { addZoneForm.name = ''; addZoneForm.zoneType = 'entry_exit'; addZoneError.value = ''; showAddZoneModal.value = true }
}

function handleAddAsset(data: AssetFormData) {
  const base = {
    id: data.id,
    type: 'asset',
    assetType: data.type,
    installationDate: data.installationDate,
    replacementDate: data.replacementDate,
    description: data.description,
    location: pendingLocation.value ?? { x: 50, y: 50 },
    shape: activeShape.value ?? 'place',
  } as MapAsset
  if (activeShape.value === 'circle' && pendingCircleRadius.value) {
    base.radius = pendingCircleRadius.value
  }
  if ((activeShape.value === 'line' || activeShape.value === 'polygon') && pendingPoints.value.length) {
    base.points = [...pendingPoints.value]
  }
  mapItems.value.push(base)
  resetDraw()
}

function handleAddPost(data: PostFormData) {
  const base = {
    id: data.id,
    type: 'post',
    name: data.name,
    description: data.description,
    priority: data.priority,
    equipment: data.equipment,
    active: data.active,
    location: pendingLocation.value ?? { x: 50, y: 50 },
    shape: activeShape.value ?? 'place',
  } as MapPost
  if (activeShape.value === 'circle' && pendingCircleRadius.value) {
    base.radius = pendingCircleRadius.value
  }
  if ((activeShape.value === 'line' || activeShape.value === 'polygon') && pendingPoints.value.length) {
    base.points = [...pendingPoints.value]
  }
  mapItems.value.push(base)
  resetDraw()
}

function handleAddZone() {
  if (!addZoneForm.name.trim()) {
    addZoneError.value = t('validation.required')
    return
  }
  const prefix = addZoneForm.zoneType === 'entry_exit' ? 'EE' : 'ZN'
  const base = {
    id: `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`,
    type: 'zone',
    zoneType: addZoneForm.zoneType,
    name: addZoneForm.name.trim(),
    location: pendingLocation.value ?? { x: 50, y: 50 },
    shape: activeShape.value ?? 'place',
  } as MapZone
  if (activeShape.value === 'circle' && pendingCircleRadius.value) {
    base.radius = pendingCircleRadius.value
  }
  if ((activeShape.value === 'line' || activeShape.value === 'polygon') && pendingPoints.value.length) {
    base.points = [...pendingPoints.value]
  }
  mapItems.value.push(base)
  showAddZoneModal.value = false
  resetDraw()
}

function resetDraw() {
  pendingLocation.value = null
  pendingPoints.value = []
  pendingCircleRadius.value = null
  circleCenter.value = null
  circleRadiusPx.value = 0
  isDrawingCircle.value = false
  activeShape.value = null
  isBatchMode.value = false
}

function openAddNew() {
  if (isLimitReached.value) return
  pendingLocation.value = null
  showTypeSelect.value = true
}

function openDeleteModal(item: MapItem) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

function handleDeleteItem() {
  if (!itemToDelete.value) return
  const idx = mapItems.value.findIndex((i: MapItem) => i.id === itemToDelete.value!.id)
  if (idx > -1) mapItems.value.splice(idx, 1)
  if (selectedItem.value?.id === itemToDelete.value.id) selectedItem.value = null
  showDeleteModal.value = false
  itemToDelete.value = null
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

function getPriorityClass(priority: string): string {
  const map: Record<string, string> = { Urgent: 'critical', Important: 'warn', Normal: 'accent', Low: 'muted' }
  return map[priority] ?? 'muted'
}

function triggerUploadMap() {
  mapImageInput.value?.click()
}

function handleMapImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (mapImageUrl.value) URL.revokeObjectURL(mapImageUrl.value)
  mapImageUrl.value = URL.createObjectURL(file)
  hasMap.value = true
  input.value = ''
}
</script>

<template>
  <div class="map-workspace">
    <!-- Toolbar -->
    <div class="map-toolbar">
      <div class="toolbar-section">
        <label class="toolbar-label">{{ t('communities.community') }}</label>
        <select v-model="selectedCommunityId" class="toolbar-select">
          <option v-for="c in communities" :key="c.id" :value="c.id">{{ c.name }}</option>
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

      <div class="toolbar-section toolbar-actions">
        <input ref="mapImageInput" type="file" accept="image/png,image/jpeg,image/jpg" class="hidden-file-input" @change="handleMapImageChange">
        <AppButton
          :text="t('map.upload_map')"
          type="secondary"
          icon="lucide:upload"
          size="sm"
          @click="triggerUploadMap"
        />
      </div>
    </div>

    <!-- Main workspace -->
    <div class="workspace-body">
      <div class="map-area">
        <!-- Shape toolbar -->
        <div class="shape-toolbar">
          <span class="toolbar-label">{{ t('map.shape') }}:</span>
          <button
            :class="['tool-btn', { active: activeShape === 'place', disabled: isLimitReached }]"
            :disabled="isLimitReached"
            @click="selectShape('place')"
          >
            <Icon name="lucide:map-pin" :size="16" />
            <span>{{ t('map.shape_dot') }}</span>
          </button>
          <button
            :class="['tool-btn', { active: activeShape === 'circle', disabled: isLimitReached }]"
            :disabled="isLimitReached"
            @click="selectShape('circle')"
          >
            <Icon name="lucide:circle" :size="16" />
            <span>{{ t('map.shape_circle') }}</span>
          </button>
          <button
            :class="['tool-btn', { active: activeShape === 'line', disabled: isLimitReached }]"
            :disabled="isLimitReached"
            @click="selectShape('line')"
          >
            <Icon name="lucide:minus" :size="16" />
            <span>{{ t('map.shape_line') }}</span>
          </button>
          <button
            :class="['tool-btn', { active: activeShape === 'polygon', disabled: isLimitReached }]"
            :disabled="isLimitReached"
            @click="selectShape('polygon')"
          >
            <Icon name="lucide:hexagon" :size="16" />
            <span>{{ t('map.shape_polygon') }}</span>
          </button>

          <div class="toolbar-divider" />

          <button class="tool-btn" :disabled="!activeShape && !pendingPoints.length && !circleCenter" @click="undoLastDraw">
            <Icon name="lucide:undo-2" :size="16" />
            <span>{{ t('map.undo') }}</span>
          </button>

          <div v-if="isBatchMode" class="batch-badge">
            <Icon name="lucide:layers" :size="12" />
            {{ t('map.batch_mode') }}
            <button class="batch-cancel" @click="isBatchMode = false">
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
            @click="isBatchMode = true"
          />
        </div>

        <!-- Map canvas -->
        <div
          class="map-canvas"
          :class="{ 'cursor-crosshair': !!activeShape }"
          @mousedown="handleCanvasMousedown($event)"
          @mousemove="handleCanvasMousemove($event)"
          @mouseup="handleCanvasMouseup"
          @click="handleCanvasClick($event)"
          @dblclick="handleCanvasDblclick"
        >
          <div v-if="!hasMap" class="map-empty" @click.stop>
            <Icon name="lucide:map" :size="48" class="map-empty__icon" />
            <h3 class="map-empty__title">{{ t('map.no_map_title') }}</h3>
            <p class="map-empty__subtitle">{{ t('map.no_map_subtitle') }}</p>
            <AppButton :text="t('map.create_map')" type="primary" icon="lucide:plus" @click="hasMap = true" />
          </div>

          <template v-else>
            <div class="map-base-layer" :class="{ 'non-interactive': !!activeShape }">
              <img v-if="mapImageUrl" :src="mapImageUrl" alt="Community map" class="map-bg-image">
              <GoogleMap
                v-else
                :key="googleMapKey"
                :center="MAP_CENTER"
                :zoom="15"
                :workspace-markers="workspaceMarkers"
                height="100%"
                @workspace-marker-click="handleWorkspaceMarkerClick"
              />
            </div>

            <svg v-if="pendingPoints.length" class="drawing-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
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

            <div
              v-if="circleCenter && activeShape === 'circle'"
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
              v-for="item in mapImageUrl ? visibleItems : visibleItems.filter(item => item.type === 'zone')"
              :key="item.id"
              class="map-marker"
              :class="getMarkerClass(item)"
              :style="{ left: item.location.x + '%', top: item.location.y + '%' }"
              @click.stop="selectedItem = item"
            >
              <Icon :name="getMarkerIcon(item)" :size="16" />
              <span class="marker-label">{{ getItemName(item) }}</span>
            </div>

            <div v-if="activeShape" class="map-hint">
              <Icon name="lucide:mouse-pointer-click" :size="14" />
              <span v-if="activeShape === 'place'">{{ isBatchMode ? t('map.hint_batch') : t('map.hint_single') }}</span>
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
            <span class="detail-value mono">x: {{ selectedItem.location.x }}, y: {{ selectedItem.location.y }}</span>
          </div>
          <template v-if="selectedItem.type === 'post'">
            <div class="detail-row">
              <span class="detail-label">{{ t('map.priority') }}</span>
              <span :class="`priority-badge priority-badge--${getPriorityClass(selectedItem.priority)}`">{{ selectedItem.priority }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.active') }}</span>
              <Badge type="status" :value="selectedItem.active ? 'active' : 'inactive'" />
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.equipment') }}</span>
              <span class="detail-value">{{ selectedItem.equipment || '—' }}</span>
            </div>
          </template>
          <template v-else-if="isZone(selectedItem)">
            <div class="detail-row">
              <span class="detail-label">{{ t('map.zone') }}</span>
              <span class="detail-value">{{ asZone(selectedItem).zoneType === 'entry_exit' ? t('map.entry_exit') : t('map.zone') }}</span>
            </div>
          </template>
        </div>

        <div class="detail-footer">
          <AppButton text="Edit" type="secondary" icon="lucide:pencil" size="sm" />
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
    <MapAddAssetModal
      :show="showAddAssetModal"
      :location="pendingLocation"
      @close="showAddAssetModal = false; pendingLocation = null"
      @save="handleAddAsset"
    />
    <MapAddPostModal
      :show="showAddPostModal"
      :location="pendingLocation"
      @close="showAddPostModal = false; pendingLocation = null"
      @save="handleAddPost"
    />

    <!-- Add zone modal -->
    <AppModal
      :show="showAddZoneModal"
      :title="t('map.add_zone_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.save')"
      @close="showAddZoneModal = false; pendingLocation = null"
      @cancel="showAddZoneModal = false; pendingLocation = null"
      @ok="handleAddZone"
    >
      <div class="zone-modal-form">
        <div class="form-field" :class="{ error: addZoneError }">
          <label class="field-label">{{ t('map.zone_name') }} <span class="required">*</span></label>
          <input v-model="addZoneForm.name" type="text" class="field-input" :placeholder="t('map.zone_placeholder')" />
          <span v-if="addZoneError" class="error-message">{{ addZoneError }}</span>
        </div>
        <div class="form-field">
          <label class="field-label">{{ t('map.zone') }}</label>
          <select v-model="addZoneForm.zoneType" class="field-select">
            <option value="entry_exit">{{ t('map.entry_exit') }}</option>
            <option value="high_priority">{{ t('map.zone') }}</option>
          </select>
        </div>
      </div>
    </AppModal>

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

.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
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

@media (max-width: 1024px) {
  .workspace-body {
    flex-direction: column;
  }
  .detail-drawer {
    width: 100%;
  }
}
</style>
