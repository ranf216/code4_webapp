<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'


interface Props {
  modelValue?: string
  height?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '400px',
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const wrapperRef = ref<HTMLDivElement | null>(null)
const polygonRsRef = ref<HTMLPreElement | null>(null)
const coordinatesRsRef = ref<HTMLPreElement | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isReady = ref(false)

let mutationObserver: MutationObserver | null = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement | null
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${href}`)), { once: true })
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.type = 'text/css'
    link.onload = () => {
      link.dataset.loaded = 'true'
      resolve()
    }
    link.onerror = () => reject(new Error(`Failed to load ${href}`))
    document.head.appendChild(link)
  })
}

function geoJsonToCoordinateString(geoJsonString: string): string | null {
  try {
    const geoJson = JSON.parse(geoJsonString)
    const coordinates = geoJson.coordinates
    if (!Array.isArray(coordinates)) return null

    let coords: number[][] = []
    if (geoJson.type === 'Polygon') {
      coords = coordinates[0] || []
    } else if (geoJson.type === 'LineString') {
      coords = coordinates
    } else {
      return null
    }

    return coords
      .map((point) => {
        const [lng, lat] = point
        return `${lng}, ${lat}`
      })
      .join('\n')
  } catch {
    return null
  }
}

function importPolygon(geoJsonString: string) {
  if (!isReady.value || !window.ksc?.maptool?.importCoordinates) return

  const coordString = geoJsonToCoordinateString(geoJsonString)
  if (!coordString) return

  if (coordinatesRsRef.value) {
    coordinatesRsRef.value.innerHTML = coordString
  }
  window.ksc.maptool.importCoordinates(coordString)
}

function emitPolygon() {
  if (!polygonRsRef.value) return
  const polygon = polygonRsRef.value.innerHTML
  if (polygon !== props.modelValue) {
    emit('update:modelValue', polygon)
  }
}

async function initMapTool() {
  try {
    isLoading.value = true
    loadError.value = null

    // Load CSS first so the tool can measure the DOM correctly,
    // then load the script. The DOM is already rendered (not hidden by v-if),
    // so the tool will find #wrapper when it executes.
    await loadStylesheet('/map/maptool.min.css')
    await loadScript('/map/maptool.min.js')

    // Give the original tool time to initialize Leaflet and bind events
    await new Promise((resolve) => setTimeout(resolve, 1500))

    isReady.value = true
    isLoading.value = false

    await nextTick()

    // Trigger resize so Leaflet recalculates the map container size
    window.dispatchEvent(new Event('resize'))

    if (props.modelValue) {
      importPolygon(props.modelValue)
    }

    if (polygonRsRef.value) {
      mutationObserver = new MutationObserver(() => {
        emitPolygon()
      })
      mutationObserver.observe(polygonRsRef.value, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    }
  } catch (err) {
    isLoading.value = false
    loadError.value = err instanceof Error ? err.message : 'Failed to load map tool'
    console.error('MapTool init error:', err)
  }
}

onMounted(() => {
  initMapTool()
})

onUnmounted(() => {
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
})

watch(() => props.modelValue, (newValue: string) => {
  if (isReady.value && newValue) {
    importPolygon(newValue)
  }
})

function getPolygon(): string {
  return polygonRsRef.value?.innerHTML || ''
}

defineExpose({
  getPolygon,
})
</script>

<template>
  <div class="map-tool">
    <div
      ref="wrapperRef"
      id="wrapper"
      class="map"
      :class="{ 'map--readonly': readonly, 'map--loading': isLoading || loadError }"
      :style="{ height }"
    >
      <div id="map" class="map__leaflet" oncontextmenu="return false;"></div>
      <div id="controls" class="map__information">
        <h1 class="hidden">Polyline Tool</h1>
        <a class="linker disabled hidden" href="#">
          <svg width="100%" height="100%" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1520 1216q0-40-28-68l-208-208q-28-28-68-28-42 0-72 32 3 3 19 18.5t21.5 21.5 15 19 13 25.5 3.5 27.5q0 40-28 68t-68 28q-15 0-27.5-3.5t-25.5-13-19-15-21.5-21.5-18.5-19q-33 31-33 73 0 40 28 68l206 207q27 27 68 27 40 0 68-26l147-146q28-28 28-67zm-703-705q0-40-28-68l-206-207q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l208 208q27 27 68 27 42 0 72-31-3-3-19-18.5t-21.5-21.5-15-19-13-25.5-3.5-27.5q0-40 28-68t68-28q15 0 27.5 3.5t25.5 13 19 15 21.5 21.5 18.5 19q33-31 33-73zm895 705q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-206-207q-83-83-83-203 0-123 88-209l-88-88q-86 88-208 88-120 0-204-84l-208-208q-84-84-84-204t85-203l147-146q83-83 203-83 121 0 204 85l206 207q83 83 83 203 0 123-88 209l88 88q86-88 208-88 120 0 204 84l208 208q84 84 84 204z" fill="#d0e1f9"/></svg>
        </a>
        <div class="map__information__buttons">
          <button id="import" class="enabled" title="Import Coordinates">Import</button>
          <button id="reset" class="enabled" title="Clear all Points">Reset</button>
          <button id="undo" class="enabled" title="Undo Last Edit">Undo</button>
          <button id="close" class="enabled" title="Close Shape">Close Shape</button>
        </div>
        <form class="map__information__form" name="import" method="GET">
          <textarea name="coordinates" placeholder="longitude1, latitude1
                                                                longitude2, latitude2
                                                                etc."></textarea>
          <p class="map__information__form__error"></p>
          <button class="enabled">Import</button><button class="enabled">Cancel</button>
        </form>
        <div class="map__information__echo">
          <p class="map__information__instruction m-2-t">Right click on map to begin.</p>
          <div class="map__information__output">
            <p class="map__information__alert hidden">
              <svg width="20" version="1.1" id="reverse" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 38 38" enable-background="new 0 0 38 38" xml:space="preserve"><path fill="#fff" d="M24.9,13.7c0,0,3,0.9,4.2,2.6c1.4,1.8,1.5,6.3-4.3,6.6l0-4.9l-8.2,7.6l8.2,7.6l0-4.6c0,0,3.7,0.1,6.1-1.9 C35.3,23.2,34.4,14.6,24.9,13.7z"/><path fill="#fff" d="M21.2,13.6L13,5.9l0,4.6c0,0-3.7-0.1-6.1,1.9C2.5,16,3.4,24.6,12.9,25.5c0,0-3-0.9-4.2-2.6c-1.4-1.8-1.5-6.3,4.3-6.6l0,4.9 L21.2,13.6z"/></svg>
              Coordinate order reversed to conform to <a href="https://tools.ietf.org/html/rfc7946#section-3.1.6">right-hand rule</a>.
            </p>
            <pre ref="coordinatesRsRef" class="map__information__coordinates" id="coordinates-rs"></pre>
            <pre ref="polygonRsRef" class="map__information__geojson" id="polygon-rs"></pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="map-tool__overlay map-tool__loading">
      <Icon name="lucide:loader-2" :size="24" class="spin" />
      <span>Loading map tool...</span>
    </div>
    <div v-else-if="loadError" class="map-tool__overlay map-tool__error">
      <Icon name="lucide:alert-circle" :size="18" />
      <span>{{ loadError }}</span>
    </div>
  </div>
</template>

<style scoped>
.map-tool {
  width: 100%;
  position: relative;
}

.map-tool__loading,
.map-tool__error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.map-tool__error {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
}

.map-tool__overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
}

.map--loading {
  pointer-events: none;
}

.map--readonly {
  position: relative;
  pointer-events: none;
  user-select: none;
}

.map--readonly::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1000;
  background: transparent;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
