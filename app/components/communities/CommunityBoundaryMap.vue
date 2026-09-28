<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface GeoPoint { lat: number; lng: number }

const props = defineProps<{
  center?: GeoPoint
  boundary?: string
}>()

const emit = defineEmits<{
  change: [geoJson: string]
}>()

const { t } = useTranslation()

const isDrawing = ref(false)
const points = ref<GeoPoint[]>([])
const savedBoundary = ref('')

function parseBoundary(value?: string): GeoPoint[] {
  try {
    const parsed = JSON.parse(value || '')
    if (parsed?.type !== 'Polygon' || !Array.isArray(parsed.coordinates?.[0])) return []
    const ring: number[][] = parsed.coordinates[0]
    const pts = ring.map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }))
    if (pts.length > 1) {
      const first = pts[0]!
      const last = pts[pts.length - 1]!
      if (first.lat === last.lat && first.lng === last.lng) pts.pop()
    }
    return pts
  } catch {
    return []
  }
}

watch(() => props.boundary, (value) => {
  if (value === savedBoundary.value) return
  savedBoundary.value = value || ''
  points.value = parseBoundary(value)
}, { immediate: true })

function toGeoJson(pts: GeoPoint[]): string {
  if (pts.length < 3) return ''
  const ring = pts.map(point => [point.lng, point.lat])
  ring.push([pts[0]!.lng, pts[0]!.lat])
  return JSON.stringify({ type: 'Polygon', coordinates: [ring] })
}

function emitBoundary() {
  savedBoundary.value = toGeoJson(points.value)
  emit('change', savedBoundary.value)
}

const boundaryOverlay = computed(() => !isDrawing.value && points.value.length >= 3
  ? [{ name: 'boundary', paths: points.value }]
  : [])

const effectiveCenter = computed<GeoPoint | undefined>(() => {
  if (props.center) return props.center
  const saved = parseBoundary(savedBoundary.value)
  if (!saved.length) return undefined
  const lats = saved.map(p => p.lat)
  const lngs = saved.map(p => p.lng)
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  }
})

function startDrawing() {
  isDrawing.value = true
  points.value = []
}

function cancelDrawing() {
  isDrawing.value = false
  points.value = parseBoundary(savedBoundary.value)
}

function finishDrawing() {
  if (points.value.length < 3) return
  isDrawing.value = false
  emitBoundary()
}

function addPoint(point: GeoPoint) {
  if (!isDrawing.value) return
  const last = points.value[points.value.length - 1]
  if (last && last.lat === point.lat && last.lng === point.lng) return
  points.value.push(point)
}

function undoPoint() {
  points.value.pop()
  if (!isDrawing.value) emitBoundary()
}

function clearBoundary() {
  isDrawing.value = false
  points.value = []
  emitBoundary()
}
</script>

<template>
  <div class="boundary-map">
    <div class="boundary-map__toolbar">
      <button
        v-if="!isDrawing"
        type="button"
        class="boundary-map__btn boundary-map__btn--primary"
        @click="startDrawing"
      >
        <Icon name="lucide:hexagon" :size="14" />
        <span>{{ t('communities.draw_boundary') }}</span>
      </button>
      <template v-else>
        <button
          type="button"
          class="boundary-map__btn boundary-map__btn--primary"
          :disabled="points.length < 3"
          @click="finishDrawing"
        >
          <Icon name="lucide:check" :size="14" />
          <span>{{ t('map.finish') }}</span>
        </button>
        <button type="button" class="boundary-map__btn" @click="cancelDrawing">
          <Icon name="lucide:x" :size="14" />
          <span>{{ t('common.cancel') }}</span>
        </button>
      </template>
      <button
        type="button"
        class="boundary-map__btn"
        :disabled="!points.length"
        @click="undoPoint"
      >
        <Icon name="lucide:undo-2" :size="14" />
        <span>{{ t('map.undo') }}</span>
      </button>
      <button
        type="button"
        class="boundary-map__btn"
        :disabled="!points.length && !savedBoundary"
        @click="clearBoundary"
      >
        <Icon name="lucide:trash-2" :size="14" />
        <span>{{ t('communities.clear_boundary') }}</span>
      </button>
      <span v-if="isDrawing" class="boundary-map__hint">{{ t('map.hint_polygon') }}</span>
      <span v-else-if="points.length >= 3" class="boundary-map__count">{{ points.length }} {{ t('map.points') }}</span>
    </div>
    <div class="boundary-map__canvas">
      <GoogleMap
        :center="effectiveCenter"
        :zoom="15"
        :boundaries="boundaryOverlay"
        :drawing-mode="isDrawing ? 'polygon' : null"
        :drawing-points="isDrawing ? points : []"
        height="100%"
        @draw-click="addPoint"
        @draw-double-click="finishDrawing"
      />
    </div>
  </div>
</template>

<style scoped>
.boundary-map {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.boundary-map__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.boundary-map__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  height: 32px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.boundary-map__btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.boundary-map__btn--primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-base);
  font-weight: 500;
}

.boundary-map__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.boundary-map__hint,
.boundary-map__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.boundary-map__canvas {
  position: relative;
  height: 500px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
</style>
