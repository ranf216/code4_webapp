<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from 'vue'
import { communityApi } from '~/api/community'
import ImageUpload from '~/components/ImageUpload.vue'
import type { CommunityEditFormData } from '~/types/community'


const props = defineProps<{
  communityId: string
}>()

const { t } = useTranslation()
const router = useRouter()

const form = reactive<CommunityEditFormData>({
  id: props.communityId,
  name: '',
  area: '',
  officers: [],
  residents: [],
  posts: [],
  mapEnabled: false,
  active: true,
  registrationDate: '',
  callsCount: 0,
  mapImage: '',
  mapBoundaries: '',
})

const showMapTool = ref(true)
const mapToolLoaded = ref(false)
const existingMapImageUrl = ref<string | null>(null)

const isLoading = ref(false)
const loadError = ref<string | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const errors = reactive<Record<string, string>>({})

const newPost = ref('')

async function loadCommunity() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await communityApi.getCommunity(Number(props.communityId))
    if (response.rc === 0 && response.community) {
      const c = response.community
      form.id = String(c.community_id)
      form.name = c.name
      form.area = c.area
      form.active = c.is_active
      form.registrationDate = c.created_on ? c.created_on.split('T')[0] : ''
      form.mapBoundaries = c.map_boundaries || ''
      existingMapImageUrl.value = c.map_image_url || null
      console.log('EditForm mapBoundaries loaded:', form.mapBoundaries?.substring(0, 100))
      // officers/residents/posts not in API yet — keep as empty arrays
    } else {
      loadError.value = response.message || 'Failed to load community'
    }
  } catch (err) {
    console.error('Error loading community:', err)
    loadError.value = 'Failed to load community'
  } finally {
    isLoading.value = false
  }
}

const REFRESH_FLAG_KEY = 'edit_community_refreshed'

onMounted(async () => {
  if (typeof window === 'undefined') return
  if (!sessionStorage.getItem(REFRESH_FLAG_KEY)) {
    sessionStorage.setItem(REFRESH_FLAG_KEY, 'true')
    window.location.reload()
    return
  }
  await loadCommunity()
  nextTick(() => {
    loadMapTool()
  })
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(REFRESH_FLAG_KEY)
})

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
  console.log('importPolygon called with:', geoJsonString.substring(0, 100))
  if (!window.ksc?.maptool?.importCoordinates) {
    console.log('Map tool importCoordinates not available')
    return
  }

  const coordString = geoJsonToCoordinateString(geoJsonString)
  console.log('Converted coordString:', coordString?.substring(0, 100))
  if (!coordString) return

  const coordinatesRs = document.getElementById('coordinates-rs')
  if (coordinatesRs) {
    coordinatesRs.innerHTML = coordString
  }
  window.ksc.maptool.importCoordinates(coordString)
  console.log('importCoordinates called')
}

function waitForMapTool(callback: () => void, attempts = 0) {
  if (window.ksc?.maptool?.importCoordinates) {
    callback()
    return
  }
  if (attempts > 50) return
  setTimeout(() => waitForMapTool(callback, attempts + 1), 100)
}

function loadMapTool() {
  if (mapToolLoaded.value) return
  mapToolLoaded.value = true
  console.log('loadMapTool called, mapBoundaries:', form.mapBoundaries?.substring(0, 100))

  // Remove existing map tool instance so it re-binds to the current #map element
  if (window.ksc?.maptool) {
    delete window.ksc.maptool
  }
  const oldScript = document.querySelector('script[src="/map/maptool.min.js"]')
  if (oldScript) {
    oldScript.remove()
  }

  const script = document.createElement('script')
  script.src = '/map/maptool.min.js'
  script.type = 'text/javascript'
  script.onload = () => {
    console.log('Map tool script loaded')
    waitForMapTool(() => {
      setTimeout(() => {
        if (form.mapBoundaries) {
          importPolygon(form.mapBoundaries)
        }
      }, 1500)
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

function addPost() {
  if (newPost.value.trim()) {
    form.posts.push(newPost.value.trim())
    newPost.value = ''
  }
}

function removePost(index: number) {
  form.posts.splice(index, 1)
}

function removeOfficer(index: number) {
  form.officers.splice(index, 1)
}

function removeResident(index: number) {
  form.residents.splice(index, 1)
}

function validate(): boolean {
  errors.name = !form.name.trim() ? t('validation.required') : ''
  errors.area = !form.area.trim() ? t('validation.required') : ''
  return !errors.name && !errors.area
}

function handleCancel() {
  router.push('/communities')
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = null
  try {
    const payload: {
      community_id: number
      name: string
      area: string
      is_active: boolean
      map_image?: string
      map_boundaries?: string
    } = {
      community_id: Number(props.communityId),
      name: form.name.trim(),
      area: form.area.trim(),
      is_active: form.active,
    }

    const mapImageBase64 = extractBase64FromDataUrl(form.mapImage || '')
    if (mapImageBase64) {
      payload.map_image = mapImageBase64
    } else if (form.mapImage === '') {
      // User cleared the image upload -> send empty string to clear existing image
      payload.map_image = ''
    }

    const polygon = getPolygon()
    if (polygon && isValidPolygonString(polygon)) {
      payload.map_boundaries = polygon
    }

    const response = await communityApi.updateCommunity(payload)
    if (response.rc === 0) {
      router.push('/communities')
    } else {
      submitError.value = response.message || 'Failed to update community'
    }
  } catch (err) {
    console.error('Error updating community:', err)
    submitError.value = 'Failed to update community'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="community-form-loading">
    <Icon name="lucide:loader-circle" :size="28" class="spin" />
    <span>Loading community...</span>
  </div>

  <!-- Load error -->
  <div v-else-if="loadError" class="community-form-error">
    <Icon name="lucide:alert-circle" :size="18" />
    <span>{{ loadError }}</span>
    <button type="button" class="form-actions__btn form-actions__btn--secondary" style="height:32px;padding:0 12px;font-size:13px;" @click="loadCommunity">Retry</button>
  </div>

  <form v-else class="community-form" @submit.prevent="handleSubmit">
    <!-- Header with title and actions -->
    <div class="community-form__header">
      <div class="community-form__header-left">
        <h2 class="community-form__title">{{ t('communities.edit_title') }}</h2>
        <p class="community-form__subtitle">
          {{ form.name }}
        </p>
      </div>
      <div class="community-form__header-actions">
        <button type="button" class="form-actions__btn form-actions__btn--secondary" @click="handleCancel">
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          class="form-actions__btn form-actions__btn--primary"
          :disabled="isSubmitting"
        >
          <Icon v-if="isSubmitting" name="lucide:loader-2" :size="16" class="spin" />
          <span>{{ isSubmitting ? t('common.saving') : t('common.save') }}</span>
        </button>
      </div>
    </div>

    <!-- Submit error -->
    <div v-if="submitError" class="community-form-submit-error">
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
            <div class="form-field form-field--required" :class="{ 'form-field--error': errors.area }">
              <label class="form-field__label">{{ t('communities.area') }}</label>
              <textarea
                v-model="form.area"
                class="form-field__textarea"
                rows="3"
                :placeholder="t('communities.area_placeholder')"
              />
              <span v-if="errors.area" class="form-field__error">{{ errors.area }}</span>
            </div>
          </div>

          <!-- Calls Button (readonly) -->
          <div class="form-row">
            <div class="form-field form-field--readonly">
              <label class="form-field__label">{{ t('communities.calls') }}</label>
              <NuxtLink :to="`/communities/${form.id}/calls`" class="form-field__button form-field__button--link">
                <Icon name="lucide:phone" :size="16" />
                <span>{{ t('communities.view_calls', { count: String(form.callsCount) }) }}</span>
                <Icon name="lucide:external-link" :size="14" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Officers Section -->
        <div class="form-section">
          <h3 class="form-section__title">{{ t('communities.officers') }}</h3>

          <!-- Officers List -->
          <div v-if="form.officers.length" class="items-list">
            <div
              v-for="(officer, index) in form.officers"
              :key="index"
              class="item-row"
            >
              <span class="item-row__name">{{ officer }}</span>
              <button type="button" class="item-row__remove" @click="removeOfficer(index)">
                <Icon name="lucide:x" :size="14" />
              </button>
            </div>
          </div>
          <span v-else class="form-field__hint">{{ t('communities.no_officers') }}</span>

          <!-- Add Officers Button -->
          <div class="form-row form-row--inline">
            <button type="button" class="form-field__button form-field__button--secondary">
              <Icon name="lucide:plus" :size="16" />
              <span>{{ t('communities.add_officers') }}</span>
            </button>
          </div>
        </div>

        <!-- Residents Section -->
        <div class="form-section">
          <h3 class="form-section__title">{{ t('communities.residents') }}</h3>

          <!-- Residents List -->
          <div v-if="form.residents.length" class="items-list">
            <div
              v-for="(resident, index) in form.residents"
              :key="index"
              class="item-row"
            >
              <span class="item-row__name">{{ resident }}</span>
              <button type="button" class="item-row__remove" @click="removeResident(index)">
                <Icon name="lucide:x" :size="14" />
              </button>
            </div>
          </div>
          <span v-else class="form-field__hint">{{ t('communities.no_residents') }}</span>

          <!-- Add Residents Button -->
          <div class="form-row form-row--inline">
            <button type="button" class="form-field__button form-field__button--secondary">
              <Icon name="lucide:plus" :size="16" />
              <span>{{ t('communities.add_residents') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Status + Community Map + Posts -->
      <div class="community-form__column">
        <!-- Community Status Section -->
        <div class="form-section form-section--compact">
          <div class="form-row form-row--inline">
            <!-- Registration Date (readonly) -->
            <div class="form-field form-field--readonly">
              <label class="form-field__label">{{ t('communities.registration_date') }}</label>
              <div class="form-field__readonly">
                <Icon name="lucide:calendar" :size="16" />
                <span>{{ form.registrationDate }}</span>
              </div>
            </div>

            <!-- Active Toggle -->
            <div class="form-field">
              <label class="form-field__label">{{ t('common.status') }}</label>
              <div class="active-toggle">
                <label class="active-toggle__label">
                  <input v-model="form.active" type="checkbox" class="active-toggle__input" />
                  <span class="active-toggle__switch"></span>
                  <span class="active-toggle__text">{{ form.active ? t('common.active') : t('common.inactive') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <div class="form-section">
          <h3 class="form-section__title">{{ t('communities.map_section') }}</h3>

          <div class="map-upload">
            <ImageUpload
              v-model="form.mapImage"
              :initial-url="existingMapImageUrl || undefined"
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
              <button type="button" class="map-tools__btn">
                <Icon name="lucide:door-open" :size="14" />
                <span>{{ t('communities.add_doors') }}</span>
              </button>
              <button type="button" class="map-tools__btn">
                <Icon name="lucide:layout-grid" :size="14" />
                <span>{{ t('communities.add_windows') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Posts Section -->
        <div class="form-section">
          <h3 class="form-section__title">{{ t('communities.posts_section') }}</h3>

          <div class="form-row">
            <div class="form-field">
              <label class="form-field__label">{{ t('communities.posts') }}</label>
              <div class="posts-input">
                <input
                  v-model="newPost"
                  type="text"
                  class="form-field__input"
                  :placeholder="t('communities.post_placeholder')"
                  @keyup.enter="addPost"
                />
                <button type="button" class="posts-input__btn" @click="addPost">
                  <Icon name="lucide:plus" :size="16" />
                </button>
              </div>

              <div v-if="form.posts.length" class="posts-list">
                <span
                  v-for="(post, index) in form.posts"
                  :key="index"
                  class="post-tag"
                >
                  {{ post }}
                  <button type="button" class="post-tag__remove" @click="removePost(index)">
                    <Icon name="lucide:x" :size="12" />
                  </button>
                </span>
              </div>
              <span v-else class="form-field__hint">{{ t('communities.posts_hint') }}</span>
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

/* Form Section */
.form-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.form-section--compact {
  padding: var(--space-3) var(--space-4);
}

.form-section--compact .form-row {
  margin-bottom: 0;
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

.form-row--inline {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.form-section--compact .form-row--inline {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.form-row--inline > .form-field {
  flex: 1;
}

@media (max-width: 640px) {
  .form-row--2col {
    grid-template-columns: 1fr;
  }
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

/* Readonly Field */
.form-field--readonly .form-field__readonly {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
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
  text-decoration: none;
}

.form-field__button:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
}

.form-field__button--secondary {
  background: var(--color-bg-elevated);
}

.form-field__button--link {
  color: var(--color-accent);
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

/* Items List (Officers/Residents) */
.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.item-row__name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.item-row__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-base);
}

.item-row__remove:hover {
  color: var(--color-critical);
}

/* Active Toggle */
.active-toggle {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.active-toggle__label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.active-toggle__input {
  display: none;
}

.active-toggle__switch {
  width: 44px;
  height: 24px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  position: relative;
  transition: background var(--transition-base);
}

.active-toggle__switch::after {
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

.active-toggle__input:checked + .active-toggle__switch {
  background: var(--color-ok);
  border-color: var(--color-ok);
}

.active-toggle__input:checked + .active-toggle__switch::after {
  transform: translateX(20px);
  background: white;
}

.active-toggle__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* Map Entry */
.map-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.map-entry__preview {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.map-entry__icon {
  color: var(--color-accent);
  opacity: 0.8;
  flex-shrink: 0;
}

.map-entry__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.map-entry__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.map-entry__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  border-radius: var(--radius-md);
  color: var(--color-bg-base);
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity var(--transition-base);
}

.map-entry__btn:hover {
  opacity: 0.85;
}

/* Map Section */
.community-form__map-section {
  margin-top: var(--space-6);
}

.community-form__map-section .form-section {
  width: 100%;
}

/* Map Upload */
.map-upload {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.map-upload__preview {
  margin-bottom: var(--space-4);
}

.map-upload__preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
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

/* Spin animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

.community-form-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-12);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.community-form-error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: var(--font-size-sm);
}

.community-form-submit-error {
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
</style>
