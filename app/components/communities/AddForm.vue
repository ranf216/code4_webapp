<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { communityApi } from '~/api/community'
import ImageUpload from '~/components/ImageUpload.vue'
import { getPlacePredictions, getPlaceDetails, type PlacePrediction } from '~/composables/useGooglePlaces'


const { t } = useTranslation()
const router = useRouter()

const form = reactive({
  name: '',
  area: '',
  mapImage: '',
})

// Autocomplete state for area/address
const areaPredictions = ref<PlacePrediction[]>([])
const showAreaPredictions = ref(false)
const isSearchingArea = ref(false)
const selectedArea = ref<PlaceDetails | null>(null)

let areaSearchTimer: ReturnType<typeof setTimeout> | null = null

const showMapTool = ref(true)
const mapToolLoaded = ref(false)

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const errors = reactive<Record<string, string>>({})

const isFormValid = computed(() => !!form.name.trim() && !!form.area.trim())

const REFRESH_FLAG_KEY = 'add_community_refreshed'

onMounted(() => {
  if (typeof window === 'undefined') return
  if (!sessionStorage.getItem(REFRESH_FLAG_KEY)) {
    sessionStorage.setItem(REFRESH_FLAG_KEY, 'true')
    window.location.reload()
    return
  }
  nextTick(() => {
    loadMapTool()
  })
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(REFRESH_FLAG_KEY)
})

function validate(): boolean {
  errors.name = !form.name.trim() ? t('validation.required') : ''
  errors.area = !form.area.trim() ? t('validation.required') : ''
  return !errors.name && !errors.area
}

function handleCancel() {
  router.push('/communities')
}

function extractBase64FromDataUrl(dataUrl: string): string {
  if (!dataUrl) return ''
  if (dataUrl.startsWith('data:')) {
    const base64 = dataUrl.split(',')[1]
    return base64 || dataUrl
  }
  return dataUrl
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
  if (!window.ksc?.maptool?.importCoordinates) return

  const coordString = geoJsonToCoordinateString(geoJsonString)
  if (!coordString) return

  const coordinatesRs = document.getElementById('coordinates-rs')
  if (coordinatesRs) {
    coordinatesRs.innerHTML = coordString
  }
  window.ksc.maptool.importCoordinates(coordString)
}

function waitForMapTool(callback: () => void, attempts = 0) {
  if (window.ksc?.maptool?.importCoordinates) {
    callback()
    return
  }
  if (attempts > 50) return
  setTimeout(() => waitForMapTool(callback, attempts + 1), 100)
}

function cleanupMapTool() {
  if (!window.ksc?.maptool) return

  // Gọi map.remove() để Leaflet tự dọn _leaflet_id trên container
  try {
    window.ksc.maptool.map?.remove()
  } catch (_) {
    // Nếu remove() thất bại, xóa _leaflet_id thủ công
    const container = document.getElementById('wrapper') as (HTMLElement & { _leaflet_id?: number }) | null
    if (container) {
      delete container._leaflet_id
    }
  }

  delete window.ksc.maptool
}

function loadMapTool() {
  if (mapToolLoaded.value) return
  mapToolLoaded.value = true

  cleanupMapTool()

  const oldScript = document.querySelector('script[src="/map/maptool.min.js"]')
  if (oldScript) {
    oldScript.remove()
  }

  const script = document.createElement('script')
  script.src = '/map/maptool.min.js'
  script.type = 'text/javascript'
  script.onload = () => {
    waitForMapTool(() => {
      // Map tool is ready; no existing polygon to import in add mode
    })
  }
  document.body.appendChild(script)
}

function toggleMapTool() {
  showMapTool.value = !showMapTool.value
  if (showMapTool.value) {
    nextTick(() => {
      loadMapTool()
    })
  }
}

function getPolygon(): string {
  return document.getElementById('polygon-rs')?.innerHTML || ''
}

function isValidPolygonString(value: string): boolean {
  try {
    const parsed = JSON.parse(value)
    return parsed.type === 'Polygon' && Array.isArray(parsed.coordinates)
  } catch {
    return false
  }
}

function handleAreaInput() {
  selectedArea.value = null
  if (areaSearchTimer) clearTimeout(areaSearchTimer)

  if (!form.area.trim()) {
    areaPredictions.value = []
    showAreaPredictions.value = false
    return
  }

  areaSearchTimer = setTimeout(async () => {
    isSearchingArea.value = true
    try {
      areaPredictions.value = await getPlacePredictions(form.area)
      showAreaPredictions.value = areaPredictions.value.length > 0
    } catch (err) {
      console.error('[AddCommunity] Area autocomplete search failed:', err)
      areaPredictions.value = []
      showAreaPredictions.value = false
    } finally {
      isSearchingArea.value = false
    }
  }, 400)
}

function hideAreaPredictions() {
  // Delay so click on prediction can fire first
  setTimeout(() => {
    showAreaPredictions.value = false
  }, 200)
}

function flyMapToLocation(lat: number, lng: number) {
  waitForMapTool(() => {
    window.ksc?.maptool?.map?.setView([lat, lng], 15)
  })
}

async function selectAreaPrediction(prediction: PlacePrediction) {
  try {
    isSearchingArea.value = true
    const details = await getPlaceDetails(prediction)
    selectedArea.value = details
    form.area = details.formatted_address || details.location_name
    areaPredictions.value = []
    showAreaPredictions.value = false
    flyMapToLocation(details.latitude, details.longitude)
  } catch (err) {
    console.error(`[AddCommunity] Failed to get place details for placeId=${prediction.place_id}:`, err)
    form.area = prediction.description
    areaPredictions.value = []
    showAreaPredictions.value = false
  } finally {
    isSearchingArea.value = false
  }
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = null
  try {
    const payload: {
      name: string
      area: string
      latitude?: number
      longitude?: number
      location_name?: string
      map_image?: string
      map_boundaries?: string
    } = {
      name: form.name.trim(),
      area: form.area.trim(),
    }

    if (selectedArea.value) {
      payload.latitude = selectedArea.value.latitude
      payload.longitude = selectedArea.value.longitude
      payload.location_name = selectedArea.value.location_name
    }

    const mapImageBase64 = extractBase64FromDataUrl(form.mapImage)
    if (mapImageBase64) {
      payload.map_image = mapImageBase64
    }

    const polygon = getPolygon()
    if (polygon && isValidPolygonString(polygon)) {
      payload.map_boundaries = polygon
    }

    const response = await communityApi.addCommunity(payload)
    if (response.rc === 0) {
      router.push('/communities')
    } else {
      submitError.value = response.message || 'Failed to create community'
    }
  } catch (err) {
    console.error('Error adding community:', err)
    submitError.value = 'Failed to create community'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="community-form" @submit.prevent="handleSubmit">
    <!-- Header with title and actions -->
    <div class="community-form__header">
      <div class="community-form__header-left">
        <h2 class="community-form__title">{{ t('communities.add_title') }}</h2>
        <p class="community-form__subtitle">
          {{ t('communities.add_subtitle') }}
        </p>
      </div>
      <div class="community-form__header-actions">
        <button type="button" class="form-actions__btn form-actions__btn--secondary" @click="handleCancel">
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          class="form-actions__btn form-actions__btn--primary"
          :disabled="isSubmitting || !isFormValid"
        >
          <Icon v-if="isSubmitting" name="lucide:loader-2" :size="16" class="spin" />
          <span>{{ isSubmitting ? t('common.saving') : t('common.save') }}</span>
        </button>
      </div>
    </div>

    <!-- Submit error -->
    <div v-if="submitError" class="form-submit-error">
      <Icon name="lucide:alert-circle" :size="16" />
      <span>{{ submitError }}</span>
    </div>

    <!-- 2 Column Layout -->
    <div class="community-form__body">
      <!-- Left Column: Basic Info + Assignments -->
      <div class="community-form__column">
        <!-- Basic Info Section -->
        <div class="form-section">
          <h3 class="form-section__title">{{ t('communities.basic_info') }}</h3>
          
          <div class="form-row">
            <div class="form-field form-field--required" :class="{ 'form-field--error': errors.name }">
              <label class="form-field__label">{{ t('communities.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="form-field__input"
                :placeholder="t('communities.name_placeholder')"
              />
              <span v-if="errors.name" class="form-field__error">{{ errors.name }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field form-field--required form-field--autocomplete" :class="{ 'form-field--error': errors.area }">
              <label class="form-field__label">{{ t('communities.area') }}</label>
              <div class="autocomplete-wrapper">
                <textarea
                  v-model="form.area"
                  class="form-field__textarea"
                  rows="3"
                  required
                  :placeholder="t('communities.area_placeholder')"
                  @input="handleAreaInput"
                  @blur="hideAreaPredictions"
                />
                <Icon
                  v-if="isSearchingArea"
                  name="lucide:loader-2"
                  :size="16"
                  class="autocomplete-loading spin"
                />
                <ul v-if="showAreaPredictions" class="autocomplete-dropdown">
                  <li
                    v-for="prediction in areaPredictions"
                    :key="prediction.place_id"
                    class="autocomplete-dropdown__item"
                    @mousedown="selectAreaPrediction(prediction)"
                  >
                    <strong class="autocomplete-dropdown__main">{{ prediction.main_text }}</strong>
                    <span class="autocomplete-dropdown__secondary">{{ prediction.secondary_text }}</span>
                  </li>
                </ul>
              </div>
              <!-- <span class="form-field__hint">
                {{ t('communities.area_hint') }}
              </span> -->
              <span v-if="errors.area" class="form-field__error">{{ errors.area }}</span>
            </div>
          </div>
        </div>

        <!-- Assignments Section -->
        <div class="form-section">
          <h3 class="form-section__title">{{ t('communities.assignments') }}</h3>
          
          <div class="form-row form-row--2col">
            <div class="form-field">
              <label class="form-field__label">{{ t('communities.officers') }}</label>
              <button type="button" class="form-field__button form-field__button--secondary" disabled>
                <Icon name="lucide:users" :size="16" />
                <span>{{ t('communities.select_officers') }}</span>
              </button>
              <span class="form-field__hint">{{ t('communities.officers_hint') }}</span>
            </div>

            <div class="form-field">
              <label class="form-field__label">{{ t('communities.residents') }}</label>
              <button type="button" class="form-field__button form-field__button--secondary" disabled>
                <Icon name="lucide:user-plus" :size="16" />
                <span>{{ t('communities.add_residents') }}</span>
              </button>
              <span class="form-field__hint">{{ t('communities.residents_hint') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Community Map + Posts -->
      <div class="community-form__column">
        <!-- Map Section -->
        <div class="form-section">
          <h3 class="form-section__title">{{ t('communities.map_section') }}</h3>
          
          <!-- <div class="form-row">
            <div class="form-field">
              <div class="map-toggle">
                <label class="map-toggle__label">
                  <input v-model="form.mapEnabled" type="checkbox" class="map-toggle__input" />
                  <span class="map-toggle__switch"></span>
                  <span class="map-toggle__text">{{ t('communities.enable_map') }}</span>
                </label>
              </div>
            </div>
          </div> -->

          <div class="map-upload">
            <ImageUpload
              v-model="form.mapImage"
              :label="t('communities.map_dropzone')"
              :auto-upload="false"
              :preview-size="200"
            />
            <p class="map-upload__hint">{{ t('communities.map_formats') }}</p>

            <div class="map-tools">
              <span class="map-tools__label">{{ t('communities.map_tools') }}</span>
              <button
                type="button"
                class="map-tools__btn"
                :class="{ 'map-tools__btn--active': showMapTool }"
                @click="toggleMapTool"
              >
                <Icon name="lucide:hexagon" :size="14" />
                <span>{{ t('communities.draw_boundary') }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Map Tool Section -->
    <div v-if="showMapTool" class="community-form__map-section">
      <div class="form-section">
        <h3 class="form-section__title">{{ t('communities.draw_boundary') }}</h3>
        <div id="wrapper" class="map" style="height: 500px;">
          <div id="map" class="map__leaflet" oncontextmenu="return false;"></div>
          <div id="controls" class="map__information">
            <h1 class="hidden">Polyline Tool</h1>
            <a class="linker disabled hidden" href="#">
              <svg width="100%" height="100%" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1520 1216q0-40-28-68l-208-208q-28-28-68-28-42 0-72 32 3 3 19 18.5t21.5 21.5 15 19 13 25.5 3.5 27.5q0 40-28 68t-68 28q-15 0-27.5-3.5t-25.5-13-19-15-21.5-21.5-18.5-19q-33 31-33 73 0 40 28 68l206 207q27 27 68 27 40 0 68-26l147-146q28-28 28-67zm-703-705q0-40-28-68l-206-207q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l208 208q27 27 68 27 42 0 72-31-3-3-19-18.5t-21.5-21.5-15-19-13-25.5-3.5-27.5q0-40 28-68t68-28q15 0 27.5 3.5t25.5 13 19 15 21.5 21.5 18.5 19q33-31 33-73zm895 705q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-206-207q-83-83-83-203 0-123 88-209l-88-88q-86 88-208 88-120 0-204-84l-208-208q-84-84-84-204t85-203l147-146q83-83 203-83 121 0 204 85l206 207q83 83 83 203 0 123-88 209l88 88q86-88 208-88 120 0 204 84l208 208q84 84 84 204z" fill="#d0e1f9"/></svg>
            </a>
            <div class="map__information__buttons">
              <button type="button" id="import" class="enabled" title="Import Coordinates">Import</button>
              <button type="button" id="reset" class="enabled" title="Clear all Points">Reset</button>
              <button type="button" id="undo" class="enabled" title="Undo Last Edit">Undo</button>
              <button type="button" id="close" class="enabled" title="Close Shape">Close Shape</button>
            </div>
            <form class="map__information__form" name="import" method="GET">
              <textarea name="coordinates" placeholder="longitude1, latitude1
                                                                  longitude2, latitude2
                                                                  etc."></textarea>
              <p class="map__information__form__error"></p>
              <button type="button" class="enabled">Import</button><button type="button" class="enabled">Cancel</button>
            </form>
            <div class="map__information__echo">
              <p class="map__information__instruction m-2-t">Right click on map to begin.</p>
              <div class="map__information__output">
                <p class="map__information__alert hidden">
                  <svg width="20" version="1.1" id="reverse" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 38 38" enable-background="new 0 0 38 38" xml:space="preserve"><path fill="#fff" d="M24.9,13.7c0,0,3,0.9,4.2,2.6c1.4,1.8,1.5,6.3-4.3,6.6l0-4.9l-8.2,7.6l8.2,7.6l0-4.6c0,0,3.7,0.1,6.1-1.9 C35.3,23.2,34.4,14.6,24.9,13.7z"/><path fill="#fff" d="M21.2,13.6L13,5.9l0,4.6c0,0-3.7-0.1-6.1,1.9C2.5,16,3.4,24.6,12.9,25.5c0,0-3-0.9-4.2-2.6c-1.4-1.8-1.5-6.3,4.3-6.6l0,4.9 L21.2,13.6z"/></svg>
                  Coordinate order reversed to conform to <a href="https://tools.ietf.org/html/rfc7946#section-3.1.6">right-hand rule</a>.
                </p>
                <pre class="map__information__coordinates" id="coordinates-rs"></pre>
                <pre class="map__information__geojson" id="polygon-rs"></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped>
.community-form {
  max-width: 100%;
}

.community-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.community-form__header-left {
  flex: 1;
}

.community-form__header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.community-form__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.community-form__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.community-form__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

@media (max-width: 1024px) {
  .community-form__body {
    grid-template-columns: 1fr;
  }
}

.community-form__column {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.community-form__map-section {
  margin-top: var(--space-6);
}

.community-form__map-section .form-section {
  width: 100%;
}

/* Form Section */
.form-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.form-section__title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

/* Form Row */
.form-row {
  margin-bottom: var(--space-4);
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row--2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 640px) {
  .form-row--2col {
    grid-template-columns: 1fr;
  }
}

/* Autocomplete */
.form-field--autocomplete {
  position: relative;
}

.autocomplete-wrapper {
  position: relative;
}

.autocomplete-loading {
  position: absolute;
  right: var(--space-3);
  top: var(--space-3);
  color: var(--color-text-muted);
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin: var(--space-1) 0 0;
  padding: var(--space-1) 0;
  list-style: none;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 240px;
  overflow-y: auto;
}

.autocomplete-dropdown__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background var(--transition-base);
}

.autocomplete-dropdown__item:hover {
  background: var(--color-bg-overlay);
}

.autocomplete-dropdown__main {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.autocomplete-dropdown__secondary {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Form Field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-field--required .form-field__label::after {
  content: ' *';
  color: var(--color-critical);
}

.form-field--error .form-field__input,
.form-field--error .form-field__textarea {
  border-color: var(--color-critical);
}

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-field__input,
.form-field__textarea {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}

.form-field__input:focus,
.form-field__textarea:focus {
  border-color: var(--color-accent);
}

.form-field__input::placeholder,
.form-field__textarea::placeholder {
  color: var(--color-text-muted);
}

.form-field__textarea {
  resize: vertical;
  min-height: 80px;
}

.form-field__hint {
  font-size: 12px;
  color: var(--color-text-muted);
}

.form-field__error {
  font-size: 12px;
  color: var(--color-critical);
}

/* Form Field Button */
.form-field__button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 44px;
  padding: 0 var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.form-field__button:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
}

.form-field__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  color: #0a0c10;
  font-size: 11px;
  font-weight: 600;
}

/* Map Toggle */
.map-toggle {
  display: flex;
  align-items: center;
}

.map-toggle__label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.map-toggle__input {
  display: none;
}

.map-toggle__switch {
  width: 44px;
  height: 24px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  position: relative;
  transition: background var(--transition-base);
}

.map-toggle__switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-text-secondary);
  border-radius: var(--radius-full);
  transition: transform var(--transition-base), background var(--transition-base);
}

.map-toggle__input:checked + .map-toggle__switch {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.map-toggle__input:checked + .map-toggle__switch::after {
  transform: translateX(20px);
  background: white;
}

.map-toggle__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* Map Upload */
.map-upload {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.map-upload__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8);
  background: var(--color-bg-base);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
}

.map-upload__icon {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.map-upload__text {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
}

.map-upload__hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.map-upload__btn {
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.map-upload__btn:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
}

/* Map Tools */
.map-tools {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.map-tools__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.map-tools__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.map-tools__btn:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.map-tools__btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0c10;
}

/* Posts Input */
.posts-input {
  display: flex;
  gap: var(--space-2);
}

.posts-input .form-field__input {
  flex: 1;
}

.posts-input__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #0a0c10;
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.posts-input__btn:hover {
  opacity: 0.9;
}

/* Posts List */
.posts-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.post-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.post-tag__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-base);
}

.post-tag__remove:hover {
  color: var(--color-critical);
}

/* Form Actions */
.form-actions__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 44px;
  padding: 0 var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.form-actions__btn--secondary {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.form-actions__btn--secondary:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
}

.form-actions__btn--primary {
  background: var(--color-accent);
  border: none;
  color: #0a0c10;
}

.form-actions__btn--primary:hover:not(:disabled) {
  opacity: 0.9;
}

.form-actions__btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-submit-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
}

/* Spin animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
