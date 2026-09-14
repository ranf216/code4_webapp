<script setup lang="ts">
import { computed } from 'vue'

interface MapPoint {
  x: number
  y: number
  lat?: number
  lng?: number
}

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

const props = defineProps<{
  asset: MapAsset
}>()

const emit = defineEmits<{
  close: []
  edit: [asset: MapAsset]
  delete: [asset: MapAsset]
}>()

const { t } = useTranslation()

const ASSET_TYPE_COLORS: Record<string, string> = {
  Camera: '#0D6EFD',
  Gate: '#198754',
  Door: '#0DCAF0',
  Alarm: '#DC3545',
  Fence: '#6C757D',
  Other: '#6610F2',
}
const assetColor = computed(() => ASSET_TYPE_COLORS[props.asset.assetType] ?? ASSET_TYPE_COLORS.Other)

function getAssetIcon(assetType: string): string {
  const map: Record<string, string> = {
    Camera: 'lucide:camera',
    Door: 'lucide:door-open',
    Window: 'lucide:layout-dashboard',
    Gate: 'lucide:gate',
    Sensor: 'lucide:activity',
    Light: 'lucide:lamp',
    Other: 'lucide:box',
  }
  return map[assetType] ?? 'lucide:box'
}

const hasGeoLocation = computed(() => props.asset.location.lat != null && props.asset.location.lng != null)

const coordinates = computed(() => hasGeoLocation.value
  ? `${props.asset.location.lat!.toFixed(6)}, ${props.asset.location.lng!.toFixed(6)}`
  : '—')

const miniMapMarkers = computed(() => hasGeoLocation.value ? [{
  id: props.asset.id,
  lat: props.asset.location.lat!,
  lng: props.asset.location.lng!,
  type: 'asset' as const,
  label: props.asset.assetType,
  color: assetColor.value,
  shape: props.asset.shape,
  radius: props.asset.radius,
  points: props.asset.points
    ?.filter((point): point is MapPoint & { lat: number; lng: number } => point.lat != null && point.lng != null)
    .map(point => ({ lat: point.lat, lng: point.lng })),
}] : [])

const miniMapZoom = computed(() => {
  if (props.asset.shape === 'circle' && props.asset.radius) {
    const lat = Math.abs(props.asset.location.lat ?? 0)
    const metersPerPixel = (props.asset.radius * 2.6) / 120
    const zoom = Math.log2((156543.03392 * Math.cos(lat * Math.PI / 180)) / metersPerPixel)
    return Math.min(19, Math.max(11, Math.round(zoom)))
  }
  return props.asset.shape === 'line' ? 16 : 17
})

const acreage = computed(() => {
  if (props.asset.shape !== 'circle') return null
  if (props.asset.acres != null && props.asset.acres > 0) return props.asset.acres.toFixed(4)
  if (!props.asset.radius) return null
  const sqMeters = Math.PI * props.asset.radius * props.asset.radius
  return (sqMeters * 0.000247105).toFixed(4)
})

const replacementStatus = computed<'overdue' | 'due_soon' | null>(() => {
  if (!props.asset.replacementDate) return null
  const replacement = new Date(props.asset.replacementDate)
  if (Number.isNaN(replacement.getTime())) return null
  const diffDays = (replacement.getTime() - Date.now()) / 86400000
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 30) return 'due_soon'
  return null
})

const lifecycleFields = computed(() => [
  { label: 'Created by', value: props.asset.createdBy || '—' },
  { label: 'Created on', value: props.asset.createdOn || '—' },
  { label: 'Last update', value: props.asset.lastUpdated || '—' },
])
</script>

<template>
  <aside class="asset-detail-drawer">
    <div class="drawer-header">
      <div class="drawer-title-group">
        <div class="drawer-icon" :style="{ color: assetColor, backgroundColor: `${assetColor}22` }">
          <Icon :name="getAssetIcon(asset.assetType)" :size="20" />
        </div>
        <div>
          <h3 class="drawer-title">{{ asset.assetType }}</h3>
          <span class="drawer-subtitle mono">{{ asset.id }}</span>
        </div>
      </div>
      <button class="drawer-close" @click="emit('close')">
        <Icon name="lucide:x" :size="16" />
      </button>
    </div>

    <!-- Location mini-view -->
    <div class="drawer-section">
      <h4 class="section-title">{{ t('map.location') }}</h4>
      <div v-if="miniMapMarkers.length" class="mini-map">
        <GoogleMap
          :center="{ lat: asset.location.lat!, lng: asset.location.lng! }"
          :zoom="miniMapZoom"
          :workspace-markers="miniMapMarkers"
          height="120px"
        />
      </div>
      <div class="location-coords mono">{{ coordinates }}</div>
    </div>

    <!-- Acreage (circle shapes only) -->
    <div v-if="acreage" class="drawer-section acreage-section">
      <h4 class="section-title">Acreage</h4>
      <div class="acreage-value">Area: {{ acreage }} Acres</div>
    </div>

    <!-- Details -->
    <div class="drawer-section">
      <h4 class="section-title">{{ t('common.details') }}</h4>
      <div class="detail-rows">
        <div class="detail-row">
          <span class="detail-label">{{ t('map.description') }}</span>
          <span class="detail-value">{{ asset.description || '—' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('map.shape') }}</span>
          <span class="detail-value">{{ asset.shape }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('map.installation_date') }}</span>
          <span class="detail-value">{{ asset.installationDate || '—' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('map.replacement_date') }}</span>
          <span class="detail-value detail-value--with-tag">
            {{ asset.replacementDate || '—' }}
            <span
              v-if="replacementStatus"
              class="replacement-tag"
              :class="`replacement-tag--${replacementStatus}`"
            >
              <Icon :name="replacementStatus === 'overdue' ? 'lucide:alert-circle' : 'lucide:clock-alert'" :size="12" />
              {{ replacementStatus === 'overdue' ? 'Overdue' : 'Due soon' }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Lifecycle -->
    <div class="drawer-section">
      <h4 class="section-title">Lifecycle</h4>
      <div class="detail-rows">
        <div v-for="field in lifecycleFields" :key="field.label" class="detail-row">
          <span class="detail-label">{{ field.label }}</span>
          <span class="detail-value">{{ field.value }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="drawer-actions">
      <AppButton text="Edit" type="secondary" icon="lucide:pencil" size="sm" @click="emit('edit', asset)" />
      <AppButton text="Delete" type="danger" icon="lucide:trash-2" size="sm" @click="emit('delete', asset)" />
    </div>
  </aside>
</template>

<style scoped>
.asset-detail-drawer {
  width: 50%;
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

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.drawer-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.drawer-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.drawer-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.drawer-subtitle {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.drawer-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: var(--space-1);
}

.drawer-close:hover {
  color: var(--color-text-primary);
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

/* Mini map */
.mini-map {
  position: relative;
  height: 120px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.location-coords {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Acreage */
.acreage-section {
  background: rgba(110, 231, 183, 0.08);
  border: 1px solid rgba(110, 231, 183, 0.2);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.acreage-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-accent);
}

/* Details */
.detail-rows {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
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
  text-align: right;
  word-break: break-word;
}

.detail-value--with-tag {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.replacement-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px var(--space-2);
  border: 1px solid;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.replacement-tag--overdue {
  color: #DC3545;
  border-color: rgba(220, 53, 69, 0.4);
  background: rgba(220, 53, 69, 0.12);
}

.replacement-tag--due_soon {
  color: #FD7E14;
  border-color: rgba(253, 126, 20, 0.4);
  background: rgba(253, 126, 20, 0.12);
}

.mono {
  font-family: monospace;
}

.drawer-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 1024px) {
  .asset-detail-drawer {
    width: 100%;
  }
}
</style>
