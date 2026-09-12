<script setup lang="ts">
import { computed } from 'vue'

interface MapAsset {
  id: string
  type: 'asset'
  assetType: string
  installationDate: string
  replacementDate: string
  description: string
  location: { x: number; y: number }
  shape: 'place' | 'circle' | 'line'
  radius?: number
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

const acreage = computed(() => {
  if (props.asset.shape !== 'circle' || !props.asset.radius) return null
  const sqMeters = Math.PI * props.asset.radius * props.asset.radius
  const acres = sqMeters * 0.000247105
  return acres.toFixed(4)
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
        <div class="drawer-icon">
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
      <div class="mini-map">
        <div class="mini-map-grid" />
        <div
          class="mini-map-marker"
          :style="{ left: asset.location.x + '%', top: asset.location.y + '%' }"
        >
          <Icon :name="getAssetIcon(asset.assetType)" :size="14" />
        </div>
      </div>
      <div class="location-coords mono">
        x: {{ asset.location.x }}, y: {{ asset.location.y }}
      </div>
    </div>

    <!-- Acreage -->
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
          <span class="detail-value">{{ asset.replacementDate || '—' }}</span>
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
  background: rgba(110, 231, 183, 0.12);
  border-radius: var(--radius-md);
  color: var(--color-accent);
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
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.mini-map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 20px 20px;
}

.mini-map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(110, 231, 183, 0.2);
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  color: var(--color-accent);
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
