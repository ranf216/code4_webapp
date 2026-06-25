<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { AssetFormData } from './AddAssetModal.vue'
import type { PostFormData } from './AddPostModal.vue'

const props = defineProps<{
  communityId: string
  communityName: string
}>()

const { t } = useTranslation()

// View mode: map or list
const viewMode = ref<'map' | 'list'>('map')
const listTab = ref<'assets' | 'posts'>('assets')

// Map tool state
const hasMap = ref(false)
const activeShape = ref<'dot' | 'circle' | 'line' | null>(null)
const isBatchMode = ref(false)
const pendingLocation = ref<{ x: number; y: number } | null>(null)
const itemTypeModal = ref<'asset' | 'post' | null>(null)

// Modals
const showAddAssetModal = ref(false)
const showAddPostModal = ref(false)
const showAddInfoModal = ref(false)
const infoModalType = ref<'entry_exit' | 'zone'>('entry_exit')
const infoModalForm = reactive({ name: '' })
const infoModalError = ref('')
const showDeleteModal = ref(false)
const showTypeSelect = ref(false)
const showItemDetail = ref<MapItem | null>(null)
const itemToDelete = ref<MapItem | null>(null)

// View / Edit modal
const showViewModal = ref(false)
const showEditModal = ref(false)
const viewItem = ref<MapItem | null>(null)

const ASSET_TYPES = ['Door', 'Window', 'Camera', 'Gate', 'Sensor', 'Light', 'Other']
const PRIORITIES = ['Urgent', 'Important', 'Normal', 'Low']

const editAssetForm = reactive({
  type: '', installationDate: '', replacementDate: '', description: '',
})
const editPostForm = reactive({
  name: '', description: '', priority: 'Normal', equipment: '', active: true,
})
const editErrors = reactive<Record<string, string>>({})

function openViewModal(item: MapItem) {
  viewItem.value = item
  showViewModal.value = true
  showItemDetail.value = null
}

function openEditDirect(item: MapItem) {
  viewItem.value = item
  showViewModal.value = false
  if (item.type === 'asset') {
    const a = item as MapAsset
    editAssetForm.type = a.assetType
    editAssetForm.installationDate = a.installationDate
    editAssetForm.replacementDate = a.replacementDate
    editAssetForm.description = a.description
  } else if (item.type === 'post') {
    const p = item as MapPost
    editPostForm.name = p.name
    editPostForm.description = p.description
    editPostForm.priority = p.priority
    editPostForm.equipment = p.equipment
    editPostForm.active = p.active
  }
  editErrors.name = ''
  editErrors.type = ''
  showEditModal.value = true
}

function openEditModal() {
  if (!viewItem.value) return
  showViewModal.value = false
  if (viewItem.value.type === 'asset') {
    const a = viewItem.value as MapAsset
    editAssetForm.type = a.assetType
    editAssetForm.installationDate = a.installationDate
    editAssetForm.replacementDate = a.replacementDate
    editAssetForm.description = a.description
  } else if (viewItem.value.type === 'post') {
    const p = viewItem.value as MapPost
    editPostForm.name = p.name
    editPostForm.description = p.description
    editPostForm.priority = p.priority
    editPostForm.equipment = p.equipment
    editPostForm.active = p.active
  }
  editErrors.name = ''
  editErrors.type = ''
  showEditModal.value = true
}

function handleSaveEdit() {
  if (!viewItem.value) return
  const idx = mapItems.value.findIndex((i: MapItem) => i.id === viewItem.value!.id)
  if (idx === -1) return

  if (viewItem.value.type === 'asset') {
    if (!editAssetForm.type) { editErrors.type = 'Required'; return }
    const orig = mapItems.value[idx] as MapAsset
    const updated: MapAsset = { ...orig, assetType: editAssetForm.type, installationDate: editAssetForm.installationDate, replacementDate: editAssetForm.replacementDate, description: editAssetForm.description }
    mapItems.value.splice(idx, 1, updated)
  } else if (viewItem.value.type === 'post') {
    if (!editPostForm.name.trim()) { editErrors.name = 'Required'; return }
    const orig = mapItems.value[idx] as MapPost
    const updated: MapPost = { ...orig, name: editPostForm.name, description: editPostForm.description, priority: editPostForm.priority, equipment: editPostForm.equipment, active: editPostForm.active }
    mapItems.value.splice(idx, 1, updated)
  }
  showEditModal.value = false
  viewItem.value = null
}

function openDeleteFromView() {
  if (!viewItem.value) return
  itemToDelete.value = viewItem.value
  showViewModal.value = false
  showDeleteModal.value = true
}

// Filters
const assetSearchQuery = ref('')
const postSearchQuery = ref('')
const postFilterActive = ref<'all' | 'active' | 'inactive'>('active')

// Types
interface MapAsset {
  id: string
  type: 'asset'
  assetType: string
  installationDate: string
  replacementDate: string
  description: string
  location: { x: number; y: number }
  shape: 'dot' | 'circle' | 'line'
}

interface MapPost {
  id: string
  type: 'post'
  name: string
  description: string
  priority: string
  equipment: string
  active: boolean
  location: { x: number; y: number }
  shape: 'dot' | 'circle' | 'line'
}

interface MapEntryExit {
  id: string
  type: 'entry_exit'
  name: string
  location: { x: number; y: number }
  shape: 'dot' | 'circle' | 'line'
}

interface MapZone {
  id: string
  type: 'zone'
  name: string
  location: { x: number; y: number }
  shape: 'dot' | 'circle' | 'line'
}

type MapItem = MapAsset | MapPost | MapEntryExit | MapZone

// Mock data
const mapItems = ref<MapItem[]>([
  { id: 'AST-1001', type: 'asset', assetType: 'Camera', installationDate: '2024-01-10', replacementDate: '', description: 'Main entrance camera', location: { x: 35, y: 40 }, shape: 'dot' },
  { id: 'AST-1002', type: 'asset', assetType: 'Door', installationDate: '2024-02-15', replacementDate: '2026-02-15', description: 'Security door - North wing', location: { x: 55, y: 25 }, shape: 'dot' },
  { id: 'AST-1003', type: 'asset', assetType: 'Window', installationDate: '2024-03-20', replacementDate: '', description: '', location: { x: 70, y: 60 }, shape: 'circle' },
  { id: 'PST-1001', type: 'post', name: 'Main Gate', description: 'Primary entry point', priority: 'Urgent', equipment: 'Radio, Flashlight', active: true, location: { x: 20, y: 70 }, shape: 'dot' },
  { id: 'PST-1002', type: 'post', name: 'North Patrol', description: 'Northern perimeter', priority: 'Normal', equipment: 'Radio', active: true, location: { x: 65, y: 15 }, shape: 'circle' },
  { id: 'PST-1003', type: 'post', name: 'Parking Lot B', description: 'Secondary parking area', priority: 'Low', equipment: '', active: false, location: { x: 80, y: 75 }, shape: 'dot' },
])

const assets = computed((): MapAsset[] => mapItems.value.filter((i: MapItem): i is MapAsset => i.type === 'asset'))
const posts = computed((): MapPost[] => mapItems.value.filter((i: MapItem): i is MapPost => i.type === 'post'))

const filteredAssets = computed((): MapAsset[] => {
  const q = assetSearchQuery.value.toLowerCase()
  return assets.value.filter((a: MapAsset) =>
    !q || a.assetType.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
  )
})

const filteredPosts = computed((): MapPost[] => {
  let list = posts.value
  if (postFilterActive.value === 'active') list = list.filter((p: MapPost) => p.active)
  if (postFilterActive.value === 'inactive') list = list.filter((p: MapPost) => !p.active)
  const q = postSearchQuery.value.toLowerCase()
  if (q) list = list.filter((p: MapPost) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  return list
})

// Map actions
function selectShape(shape: 'dot' | 'circle' | 'line') {
  activeShape.value = activeShape.value === shape ? null : shape
}

function handleMapClick(event: MouseEvent) {
  if (!activeShape.value) return
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 100)
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 100)
  pendingLocation.value = { x, y }
  showTypeSelect.value = true
}

function selectItemType(type: 'asset' | 'post' | 'entry_exit' | 'zone') {
  showTypeSelect.value = false
  if (type === 'asset') showAddAssetModal.value = true
  else if (type === 'post') showAddPostModal.value = true
  else {
    infoModalType.value = type
    infoModalForm.name = ''
    infoModalError.value = ''
    showAddInfoModal.value = true
  }
}

function handleAddInfo() {
  if (!infoModalForm.name.trim()) {
    infoModalError.value = 'Name is required'
    return
  }
  const prefix = infoModalType.value === 'entry_exit' ? 'EE' : 'ZN'
  mapItems.value.push({
    id: `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`,
    type: infoModalType.value,
    name: infoModalForm.name.trim(),
    location: pendingLocation.value ?? { x: 50, y: 50 },
    shape: activeShape.value ?? 'dot',
  } as MapEntryExit | MapZone)
  showAddInfoModal.value = false
  pendingLocation.value = null
  activeShape.value = null
}

function openAddNew() {
  pendingLocation.value = null
  showTypeSelect.value = true
}

function handleAddAsset(data: AssetFormData) {
  mapItems.value.push({
    id: data.id,
    type: 'asset',
    assetType: data.type,
    installationDate: data.installationDate,
    replacementDate: data.replacementDate,
    description: data.description,
    location: pendingLocation.value ?? { x: 50, y: 50 },
    shape: activeShape.value ?? 'dot',
  } as MapAsset)
  pendingLocation.value = null
  activeShape.value = null
  isBatchMode.value = false
}

function handleAddPost(data: PostFormData) {
  mapItems.value.push({
    id: data.id,
    type: 'post',
    name: data.name,
    description: data.description,
    priority: data.priority,
    equipment: data.equipment,
    active: data.active,
    location: pendingLocation.value ?? { x: 50, y: 50 },
    shape: activeShape.value ?? 'dot',
  } as MapPost)
  pendingLocation.value = null
  activeShape.value = null
  isBatchMode.value = false
}

function openDeleteModal(item: MapItem) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

function handleDeleteItem() {
  if (!itemToDelete.value) return
  const idx = mapItems.value.findIndex((i: MapItem) => i.id === itemToDelete.value!.id)
  if (idx > -1) mapItems.value.splice(idx, 1)
  showDeleteModal.value = false
  itemToDelete.value = null
  showItemDetail.value = null
}

function getItemName(item: MapItem): string {
  if (item.type === 'asset') return `${(item as MapAsset).assetType} (${item.id})`
  if (item.type === 'post') return (item as MapPost).name
  return (item as MapEntryExit | MapZone).name
}

function asAsset(item: MapItem): MapAsset { return item as MapAsset }
function asPost(item: MapItem): MapPost { return item as MapPost }
function asInfo(item: MapItem): MapEntryExit | MapZone { return item as MapEntryExit | MapZone }

function getPriorityClass(priority: string): string {
  const map: Record<string, string> = { Urgent: 'critical', Important: 'warn', Normal: 'accent', Low: 'muted' }
  return map[priority] ?? 'muted'
}

function getMarkerClass(item: MapItem): string {
  const map: Record<string, string> = {
    asset: 'map-marker--asset',
    post: 'map-marker--post',
    entry_exit: 'map-marker--entry',
    zone: 'map-marker--zone',
  }
  return map[item.type] ?? ''
}

function getMarkerIcon(item: MapItem): string {
  if (item.type === 'post') return 'lucide:map-pin'
  if (item.type === 'entry_exit') return 'lucide:door-open'
  if (item.type === 'zone') return 'lucide:shield-alert'
  const iconMap: Record<string, string> = {
    Camera: 'lucide:camera',
    Door: 'lucide:door-open',
    Window: 'lucide:layout-dashboard',
    Gate: 'lucide:gate',
    Sensor: 'lucide:activity',
    Light: 'lucide:lamp',
    Other: 'lucide:box',
  }
  return iconMap[(item as MapAsset).assetType] ?? 'lucide:box'
}
</script>

<template>
  <div class="map-management">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">{{ t('map.title') }}</h2>
      <div class="header-actions">
        <!-- View toggle -->
        <div class="view-toggle">
          <button :class="['toggle-btn', { active: viewMode === 'map' }]" @click="viewMode = 'map'">
            <Icon name="lucide:map" :size="14" />
            <span>{{ t('map.map_view') }}</span>
          </button>
          <button :class="['toggle-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">
            <Icon name="lucide:list" :size="14" />
            <span>{{ t('map.list_view') }}</span>
          </button>
        </div>

        <AppButton
          :text="t('map.add_new')"
          type="primary"
          icon="lucide:plus"
          @click="openAddNew"
        />
        <AppButton
          :text="t('map.add_multiple')"
          type="secondary"
          icon="lucide:layers"
          @click="isBatchMode = true"
        />
      </div>
    </div>

    <!-- MAP VIEW -->
    <div v-if="viewMode === 'map'" class="map-view">
      <!-- Toolbar -->
      <div class="map-toolbar">
        <span class="toolbar-label">{{ t('map.shape') }}:</span>
        <button :class="['tool-btn', { active: activeShape === 'dot' }]" :title="t('map.shape_dot')" @click="selectShape('dot')">
          <Icon name="lucide:dot" :size="16" />
          <span>{{ t('map.shape_dot') }}</span>
        </button>
        <button :class="['tool-btn', { active: activeShape === 'circle' }]" :title="t('map.shape_circle')" @click="selectShape('circle')">
          <Icon name="lucide:circle" :size="16" />
          <span>{{ t('map.shape_circle') }}</span>
        </button>
        <button :class="['tool-btn', { active: activeShape === 'line' }]" :title="t('map.shape_line')" @click="selectShape('line')">
          <Icon name="lucide:minus" :size="16" />
          <span>{{ t('map.shape_line') }}</span>
        </button>

        <div class="toolbar-divider" />

        <button class="tool-btn" :title="t('map.undo')" @click="activeShape = null; pendingLocation = null">
          <Icon name="lucide:undo-2" :size="16" />
          <span>{{ t('map.undo') }}</span>
        </button>

        <div class="toolbar-divider" />

        <button class="tool-btn" title="Zoom in">
          <Icon name="lucide:zoom-in" :size="16" />
        </button>
        <button class="tool-btn" title="Zoom out">
          <Icon name="lucide:zoom-out" :size="16" />
        </button>
        <button class="tool-btn" title="Rotate">
          <Icon name="lucide:rotate-ccw" :size="16" />
        </button>

        <div v-if="isBatchMode" class="batch-badge">
          <Icon name="lucide:layers" :size="12" />
          {{ t('map.batch_mode') }}
          <button class="batch-cancel" @click="isBatchMode = false; activeShape = null">
            <Icon name="lucide:x" :size="12" />
          </button>
        </div>
      </div>

      <!-- Map canvas -->
      <div class="map-canvas" :class="{ 'cursor-crosshair': !!activeShape }" @click="handleMapClick">
        <!-- If no map, show upload prompt -->
        <div v-if="!hasMap" class="map-empty" @click.stop>
          <Icon name="lucide:map" :size="48" class="map-empty__icon" />
          <h3 class="map-empty__title">{{ t('map.no_map_title') }}</h3>
          <p class="map-empty__subtitle">{{ t('map.no_map_subtitle') }}</p>
          <AppButton :text="t('map.create_map')" type="primary" icon="lucide:plus" @click="hasMap = true" />
        </div>

        <!-- Map with markers -->
        <template v-else>
          <div class="map-grid-bg" />

          <!-- Markers -->
          <div
            v-for="item in mapItems"
            :key="item.id"
            class="map-marker"
            :class="[getMarkerClass(item), `map-marker--${item.shape}`]"
            :style="{ left: item.location.x + '%', top: item.location.y + '%' }"
            @click.stop="showItemDetail = item"
          >
            <Icon :name="getMarkerIcon(item)" :size="16" />
            <span class="marker-label">{{ item.type === 'asset' ? asAsset(item).assetType : getItemName(item) }}</span>
          </div>

          <!-- Item detail popup -->
          <div
            v-if="showItemDetail"
            class="item-popup"
            :style="{ left: (showItemDetail.location.x + 2) + '%', top: showItemDetail.location.y + '%' }"
            @click.stop
          >
            <div class="popup-header">
              <span class="popup-title">{{ getItemName(showItemDetail) }}</span>
              <button class="popup-close" @click="showItemDetail = null">
                <Icon name="lucide:x" :size="12" />
              </button>
            </div>
            <div class="popup-body">
              <template v-if="showItemDetail.type === 'asset'">
                <div class="popup-row"><span>Type:</span> {{ asAsset(showItemDetail).assetType }}</div>
                <div v-if="asAsset(showItemDetail).description" class="popup-row">
                  <span>Desc:</span> {{ asAsset(showItemDetail).description }}
                </div>
              </template>
              <template v-else-if="showItemDetail.type === 'post'">
                <div class="popup-row"><span>Priority:</span>
                  <span :class="`text-${getPriorityClass(asPost(showItemDetail).priority)}`">
                    {{ asPost(showItemDetail).priority }}
                  </span>
                </div>
                <div class="popup-row">
                  <span>Status:</span>
                  <Badge type="status" :value="asPost(showItemDetail).active ? 'active' : 'inactive'" />
                </div>
              </template>
              <template v-else>
                <div class="popup-row">
                  <span>Type:</span>
                  <span>{{ showItemDetail.type === 'entry_exit' ? t('map.entry_exit') : t('map.zone') }}</span>
                </div>
                <div class="popup-row"><span>Name:</span> {{ asInfo(showItemDetail).name }}</div>
              </template>
            </div>
            <div class="popup-actions">
              <button class="popup-btn popup-btn--edit" @click="openViewModal(showItemDetail)">
                <Icon name="lucide:eye" :size="12" />
                {{ t('common.view') }}
              </button>
              <button class="popup-btn popup-btn--delete" @click="openDeleteModal(showItemDetail)">
                <Icon name="lucide:trash-2" :size="12" />
                {{ t('common.delete') }}
              </button>
            </div>
          </div>

          <!-- Instruction hint -->
          <div v-if="activeShape" class="map-hint">
            <Icon name="lucide:mouse-pointer-click" :size="14" />
            {{ isBatchMode ? t('map.hint_batch') : t('map.hint_single') }}
          </div>
        </template>
      </div>

      <!-- Map legend -->
      <div v-if="hasMap" class="map-legend">
        <span class="legend-title">{{ t('map.legend') }}:</span>
        <span class="legend-item legend-item--asset"><Icon name="lucide:box" :size="12" /> {{ t('map.assets') }} ({{ assets.length }})</span>
        <span class="legend-item legend-item--post"><Icon name="lucide:map-pin" :size="12" /> {{ t('map.posts') }} ({{ posts.length }})</span>
        <span class="legend-item legend-item--entry"><Icon name="lucide:door-open" :size="12" /> {{ t('map.entry_exit') }} ({{ mapItems.filter(i => i.type === 'entry_exit').length }})</span>
        <span class="legend-item legend-item--zone"><Icon name="lucide:shield-alert" :size="12" /> {{ t('map.zone') }} ({{ mapItems.filter(i => i.type === 'zone').length }})</span>
        <span class="legend-muted">{{ t('map.total_items', { count: String(mapItems.length) }) }}</span>
      </div>
    </div>

    <!-- LIST VIEW -->
    <div v-else class="list-view">
      <!-- Tab switcher -->
      <div class="list-tabs">
        <button :class="['tab-btn', { active: listTab === 'assets' }]" @click="listTab = 'assets'">
          <Icon name="lucide:box" :size="14" />
          {{ t('map.assets') }} ({{ assets.length }})
        </button>
        <button :class="['tab-btn', { active: listTab === 'posts' }]" @click="listTab = 'posts'">
          <Icon name="lucide:map-pin" :size="14" />
          {{ t('map.posts') }} ({{ posts.length }})
        </button>
      </div>

      <!-- Assets list -->
      <div v-if="listTab === 'assets'" class="list-panel">
        <div class="list-controls">
          <div class="search-box">
            <Icon name="lucide:search" :size="14" />
            <input v-model="assetSearchQuery" type="text" :placeholder="t('map.search_assets')" />
          </div>
          <AppButton :text="t('map.add_asset')" type="primary" icon="lucide:plus" @click="showAddAssetModal = true" />
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('map.asset_id') }}</th>
              <th>{{ t('map.asset_type') }}</th>
              <th>{{ t('map.installation_date') }}</th>
              <th>{{ t('map.replacement_date') }}</th>
              <th>{{ t('map.description') }}</th>
              <th>{{ t('residents.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in filteredAssets" :key="asset.id">
              <td class="id-cell">{{ asset.id }}</td>
              <td>
                <span class="type-badge">
                  <Icon :name="getMarkerIcon(asset)" :size="12" />
                  {{ asset.assetType }}
                </span>
              </td>
              <td class="text-muted">{{ asset.installationDate || '—' }}</td>
              <td class="text-muted">{{ asset.replacementDate || '—' }}</td>
              <td class="text-muted desc-cell">{{ asset.description || '—' }}</td>
              <td>
                <div class="action-group">
                  <button class="action-btn action-btn--icon" @click="openViewModal(asset)">
                    <Icon name="lucide:eye" :size="14" />
                  </button>
                  <button class="action-btn action-btn--icon" @click="openEditDirect(asset)">
                    <Icon name="lucide:pencil" :size="14" />
                  </button>
                  <button class="action-btn action-btn--icon action-btn--danger" @click="itemToDelete = asset; showDeleteModal = true">
                    <Icon name="lucide:trash-2" :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredAssets.length">
              <td colspan="6" class="empty-row">{{ t('map.no_assets') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Posts list -->
      <div v-if="listTab === 'posts'" class="list-panel">
        <div class="list-controls">
          <div class="search-box">
            <Icon name="lucide:search" :size="14" />
            <input v-model="postSearchQuery" type="text" :placeholder="t('map.search_posts')" />
          </div>
          <div class="filter-group">
            <button :class="['filter-btn', { active: postFilterActive === 'active' }]" @click="postFilterActive = 'active'">{{ t('common.active') }}</button>
            <button :class="['filter-btn', { active: postFilterActive === 'inactive' }]" @click="postFilterActive = 'inactive'">{{ t('common.inactive') }}</button>
            <button :class="['filter-btn', { active: postFilterActive === 'all' }]" @click="postFilterActive = 'all'">{{ t('map.all') }}</button>
          </div>
          <AppButton :text="t('map.add_post')" type="primary" icon="lucide:plus" @click="showAddPostModal = true" />
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('map.post_id') }}</th>
              <th>{{ t('map.post_name') }}</th>
              <th>{{ t('map.priority') }}</th>
              <th>{{ t('map.equipment') }}</th>
              <th>{{ t('map.active') }}</th>
              <th>{{ t('residents.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in filteredPosts" :key="post.id">
              <td class="id-cell">{{ post.id }}</td>
              <td class="name-cell">{{ post.name }}</td>
              <td>
                <span :class="`priority-badge priority-badge--${getPriorityClass(post.priority)}`">
                  {{ post.priority }}
                </span>
              </td>
              <td class="text-muted">{{ post.equipment || '—' }}</td>
              <td>
                <Badge type="status" :value="post.active ? 'active' : 'inactive'" />
              </td>
              <td>
                <div class="action-group">
                  <button class="action-btn action-btn--icon" @click="openViewModal(post)">
                    <Icon name="lucide:eye" :size="14" />
                  </button>
                  <button class="action-btn action-btn--icon" @click="openEditDirect(post)">
                    <Icon name="lucide:pencil" :size="14" />
                  </button>
                  <button class="action-btn action-btn--icon action-btn--danger" @click="itemToDelete = post; showDeleteModal = true">
                    <Icon name="lucide:trash-2" :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredPosts.length">
              <td colspan="6" class="empty-row">{{ t('map.no_posts') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Type Selection Modal -->
    <AppModal
      :show="showTypeSelect"
      :title="t('map.select_item_type')"
      :cancel-text="t('common.cancel')"
      @close="showTypeSelect = false; pendingLocation = null"
      @cancel="showTypeSelect = false; pendingLocation = null"
    >
      <template #default>
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
          <button class="type-select__btn" @click="selectItemType('entry_exit')">
            <Icon name="lucide:door-open" :size="28" class="type-select__icon type-select__icon--entry" />
            <span class="type-select__label">{{ t('map.entry_exit') }}</span>
            <span class="type-select__hint">{{ t('map.entry_exit_hint') }}</span>
          </button>
          <button class="type-select__btn" @click="selectItemType('zone')">
            <Icon name="lucide:shield-alert" :size="28" class="type-select__icon type-select__icon--zone" />
            <span class="type-select__label">{{ t('map.zone') }}</span>
            <span class="type-select__hint">{{ t('map.zone_hint') }}</span>
          </button>
        </div>
      </template>
    </AppModal>

    <!-- Add Entry/Exit or Zone Modal -->
    <AppModal
      :show="showAddInfoModal"
      :title="infoModalType === 'entry_exit' ? t('map.add_entry_exit_title') : t('map.add_zone_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.save')"
      @close="showAddInfoModal = false; pendingLocation = null"
      @cancel="showAddInfoModal = false; pendingLocation = null"
      @ok="handleAddInfo"
    >
      <template #default>
        <div class="info-modal-form">
          <div class="form-field" :class="{ error: infoModalError }">
            <label class="field-label">
              {{ infoModalType === 'entry_exit' ? t('map.entry_exit_name') : t('map.zone_name') }}
              <span class="required">*</span>
            </label>
            <input
              v-model="infoModalForm.name"
              type="text"
              class="field-input"
              :placeholder="infoModalType === 'entry_exit' ? t('map.entry_exit_placeholder') : t('map.zone_placeholder')"
            />
            <span v-if="infoModalError" class="error-message">{{ infoModalError }}</span>
          </div>
          <div class="form-field form-field--readonly">
            <label class="field-label">{{ t('map.location') }}</label>
            <div class="readonly-value location-value">
              <Icon name="lucide:map-pin" :size="14" />
              <span v-if="pendingLocation">x: {{ pendingLocation.x }}, y: {{ pendingLocation.y }}</span>
              <span v-else class="muted">{{ t('map.location_auto') }}</span>
            </div>
          </div>
        </div>
      </template>
    </AppModal>

    <!-- Add Asset Modal -->
    <MapAddAssetModal
      :show="showAddAssetModal"
      :location="pendingLocation"
      @close="showAddAssetModal = false; pendingLocation = null"
      @save="handleAddAsset"
    />

    <!-- Add Post Modal -->
    <MapAddPostModal
      :show="showAddPostModal"
      :location="pendingLocation"
      @close="showAddPostModal = false; pendingLocation = null"
      @save="handleAddPost"
    />

    <!-- View Modal (read-only) -->
    <AppModal
      v-if="viewItem"
      :show="showViewModal"
      :title="getItemName(viewItem)"
      :cancel-text="t('common.close')"
      :ok-text="''"
      @close="showViewModal = false; viewItem = null"
      @cancel="showViewModal = false; viewItem = null"
    >
      <template #default>
        <div class="detail-modal">
          <!-- Asset view -->
          <template v-if="viewItem.type === 'asset'">
            <div class="detail-row">
              <span class="detail-label">{{ t('map.asset_id') }}</span>
              <span class="detail-value mono">{{ viewItem.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.asset_type') }}</span>
              <span class="detail-value">
                <span class="type-badge"><Icon :name="getMarkerIcon(viewItem)" :size="12" /> {{ asAsset(viewItem).assetType }}</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.installation_date') }}</span>
              <span class="detail-value">{{ asAsset(viewItem).installationDate || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.replacement_date') }}</span>
              <span class="detail-value">{{ asAsset(viewItem).replacementDate || '—' }}</span>
            </div>
            <div class="detail-row detail-row--full">
              <span class="detail-label">{{ t('map.description') }}</span>
              <span class="detail-value">{{ asAsset(viewItem).description || '—' }}</span>
            </div>
          </template>

          <!-- Post view -->
          <template v-else-if="viewItem.type === 'post'">
            <div class="detail-row">
              <span class="detail-label">{{ t('map.post_id') }}</span>
              <span class="detail-value mono">{{ viewItem.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.post_name') }}</span>
              <span class="detail-value">{{ asPost(viewItem).name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.priority') }}</span>
              <span :class="`detail-value priority-badge priority-badge--${getPriorityClass(asPost(viewItem).priority)}`">
                {{ asPost(viewItem).priority }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.active') }}</span>
              <Badge type="status" :value="asPost(viewItem).active ? 'active' : 'inactive'" />
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.equipment') }}</span>
              <span class="detail-value">{{ asPost(viewItem).equipment || '—' }}</span>
            </div>
            <div class="detail-row detail-row--full">
              <span class="detail-label">{{ t('map.description') }}</span>
              <span class="detail-value">{{ asPost(viewItem).description || '—' }}</span>
            </div>
          </template>

          <!-- Entry/Exit or Zone view -->
          <template v-else>
            <div class="detail-row">
              <span class="detail-label">ID</span>
              <span class="detail-value mono">{{ viewItem.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('map.post_name') }}</span>
              <span class="detail-value">{{ asInfo(viewItem).name }}</span>
            </div>
          </template>

          <div class="detail-row">
            <span class="detail-label">{{ t('map.location') }}</span>
            <span class="detail-value mono">x: {{ viewItem.location.x }}, y: {{ viewItem.location.y }}</span>
          </div>

          <!-- Delete button in footer area -->
          <div v-if="viewItem.type === 'asset' || viewItem.type === 'post'" class="detail-danger-zone">
            <button class="btn-danger-outline" @click="openDeleteFromView">
              <Icon name="lucide:trash-2" :size="14" />
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </template>
    </AppModal>

    <!-- Edit Modal -->
    <AppModal
      v-if="viewItem"
      :show="showEditModal"
      :title="viewItem.type === 'asset' ? t('map.edit_asset_title') : t('map.edit_post_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.save')"
      @close="showEditModal = false"
      @cancel="showEditModal = false"
      @ok="handleSaveEdit"
    >
      <template #default>
        <div class="edit-modal-form">
          <!-- Edit Asset -->
          <template v-if="viewItem.type === 'asset'">
            <div class="form-field" :class="{ error: editErrors.type }">
              <label class="field-label">{{ t('map.asset_type') }} <span class="required">*</span></label>
              <select v-model="editAssetForm.type" class="field-select">
                <option value="" disabled>{{ t('map.select_type') }}</option>
                <option v-for="tp in ASSET_TYPES" :key="tp" :value="tp">{{ tp }}</option>
              </select>
              <span v-if="editErrors.type" class="error-message">{{ editErrors.type }}</span>
            </div>
            <div class="form-row-2col">
              <div class="form-field">
                <label class="field-label">{{ t('map.installation_date') }}</label>
                <input v-model="editAssetForm.installationDate" type="date" class="field-input" />
              </div>
              <div class="form-field">
                <label class="field-label">{{ t('map.replacement_date') }}</label>
                <input v-model="editAssetForm.replacementDate" type="date" class="field-input" />
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">{{ t('map.description') }}</label>
              <textarea v-model="editAssetForm.description" class="field-textarea" rows="3" />
            </div>
          </template>

          <!-- Edit Post -->
          <template v-else-if="viewItem.type === 'post'">
            <div class="form-field" :class="{ error: editErrors.name }">
              <label class="field-label">{{ t('map.post_name') }} <span class="required">*</span></label>
              <input v-model="editPostForm.name" type="text" class="field-input" maxlength="60" />
              <span v-if="editErrors.name" class="error-message">{{ editErrors.name }}</span>
            </div>
            <div class="form-row-2col">
              <div class="form-field">
                <label class="field-label">{{ t('map.priority') }}</label>
                <select v-model="editPostForm.priority" class="field-select">
                  <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="form-field">
                <label class="field-label">{{ t('map.active') }}</label>
                <label class="toggle-label">
                  <input v-model="editPostForm.active" type="checkbox" />
                  <span>{{ editPostForm.active ? t('common.active') : t('common.inactive') }}</span>
                </label>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">{{ t('map.equipment') }}</label>
              <input v-model="editPostForm.equipment" type="text" class="field-input" />
            </div>
            <div class="form-field">
              <label class="field-label">{{ t('map.description') }}</label>
              <textarea v-model="editPostForm.description" class="field-textarea" rows="3" />
            </div>
          </template>
        </div>
      </template>
    </AppModal>

    <!-- Delete Confirmation -->
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
.map-management {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* View toggle */
.view-toggle {
  display: flex;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.toggle-btn.active {
  background: var(--color-accent);
  color: var(--color-bg-base);
}

/* Toolbar */
.map-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.toolbar-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

.tool-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.tool-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-base);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 var(--space-1);
}

.batch-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(var(--color-accent-rgb, 110, 231, 183), 0.15);
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
  width: 100%;
  height: 520px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.cursor-crosshair {
  cursor: crosshair;
}

.map-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Map empty state */
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

/* Map markers */
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

.map-marker--asset {
  color: var(--color-accent);
}

.map-marker--post {
  color: #f59e0b;
}

.map-marker--entry {
  color: #60a5fa;
}

.map-marker--zone {
  color: #f87171;
}

.map-marker--circle {
  background: rgba(110, 231, 183, 0.1);
  border: 2px solid currentColor;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
}

.marker-label {
  font-size: 9px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  background: var(--color-bg-base);
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid var(--color-border);
}

/* Item popup */
.item-popup {
  position: absolute;
  z-index: 20;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  min-width: 180px;
  max-width: 240px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.popup-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.popup-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0;
}

.popup-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.popup-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.popup-row span:first-child {
  color: var(--color-text-muted);
  min-width: 50px;
}

.popup-actions {
  display: flex;
  gap: var(--space-2);
}

.popup-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}

.popup-btn--delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-critical);
  color: var(--color-critical);
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

/* Map legend */
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
.legend-item--entry { color: #60a5fa; }
.legend-item--zone { color: #f87171; }
.legend-muted { color: var(--color-text-muted); margin-left: auto; }

/* List view */
.list-tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: none;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  position: relative;
  bottom: -1px;
  transition: all var(--transition-base);
}

.tab-btn.active {
  background: var(--color-bg-surface);
  border-color: var(--color-border);
  border-bottom-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-weight: 500;
}

.list-panel {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0 var(--radius-lg) var(--radius-lg) var(--radius-lg);
  padding: var(--space-4);
}

.list-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.filter-group {
  display: flex;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.filter-btn {
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.filter-btn.active {
  background: var(--color-accent);
  color: var(--color-bg-base);
  font-weight: 500;
}

/* Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.data-table td {
  padding: var(--space-3);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: var(--color-bg-elevated);
}

.id-cell {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted) !important;
}

.name-cell {
  font-weight: 500;
}

.desc-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-muted {
  color: var(--color-text-muted) !important;
}

.empty-row {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-8) !important;
  font-style: italic;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
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

.action-group {
  display: flex;
  gap: var(--space-1);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all var(--transition-base);
}

.action-btn--icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.action-btn--icon:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.action-btn--danger:hover {
  color: var(--color-critical) !important;
  border-color: var(--color-critical) !important;
}

.text-critical { color: #ef4444; }
.text-warn { color: #f59e0b; }
.text-accent { color: var(--color-accent); }
.text-muted { color: var(--color-text-muted); }

/* Detail view modal */
.detail-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 420px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-row--full {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.detail-label {
  min-width: 140px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
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

.detail-danger-zone {
  display: flex;
  justify-content: flex-start;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-1);
}

.btn-danger-outline {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: none;
  border: 1px solid var(--color-critical);
  border-radius: var(--radius-md);
  color: var(--color-critical);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-danger-outline:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Edit modal form */
.edit-modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 420px;
}

.edit-modal-form .form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.edit-modal-form .form-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.edit-modal-form .field-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.edit-modal-form .field-input,
.edit-modal-form .field-select,
.edit-modal-form .field-textarea {
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

.edit-modal-form .field-select {
  height: 40px;
  cursor: pointer;
}

.edit-modal-form .field-input:focus,
.edit-modal-form .field-select:focus,
.edit-modal-form .field-textarea:focus {
  border-color: var(--color-accent);
}

.edit-modal-form .field-textarea {
  resize: vertical;
  line-height: 1.5;
}

.edit-modal-form .form-field.error .field-input,
.edit-modal-form .form-field.error .field-select {
  border-color: var(--color-critical);
}

.edit-modal-form .error-message {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.edit-modal-form .required {
  color: var(--color-critical);
}

.edit-modal-form .toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.edit-modal-form .toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}

/* Info modal form */
.info-modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 360px;
}

.info-modal-form .form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-modal-form .field-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.info-modal-form .field-input {
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

.info-modal-form .field-input:focus {
  border-color: var(--color-accent);
}

.info-modal-form .form-field.error .field-input {
  border-color: var(--color-critical);
}

.info-modal-form .error-message {
  font-size: var(--font-size-xs);
  color: var(--color-critical);
}

.info-modal-form .form-field--readonly .field-label {
  color: var(--color-text-muted);
}

.info-modal-form .readonly-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.info-modal-form .muted {
  color: var(--color-text-muted);
  font-style: italic;
  font-weight: 400;
}

.info-modal-form .required {
  color: var(--color-critical);
}

/* Type select */
.type-select {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  padding: var(--space-2);
  min-width: 360px;
}

.type-select__btn {
  flex: 1;
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

.type-select__icon--asset {
  color: var(--color-accent);
}

.type-select__icon--post {
  color: #f59e0b;
}

.type-select__icon--entry {
  color: #60a5fa;
}

.type-select__icon--zone {
  color: #f87171;
}

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
</style>
