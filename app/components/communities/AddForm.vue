<script setup lang="ts">
import { ref } from 'vue'
import { communityApi } from '~/api/community'
import ImageUpload from '~/components/ImageUpload.vue'
import OfficerPickerModal from '~/components/communities/OfficerPickerModal.vue'
import CommunityBoundaryMap from '~/components/communities/CommunityBoundaryMap.vue'
import { getPlacePredictions, getPlaceDetails, type PlacePrediction, type PlaceDetails } from '~/composables/useGooglePlaces'


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
const mapCenter = ref<{ lat: number; lng: number } | undefined>(undefined)
const boundaryGeoJson = ref('')

let areaSearchTimer: ReturnType<typeof setTimeout> | null = null

interface AddFormOfficer {
  id: string
  fullName: string
  title: string
  picture: string
  active: boolean
  communityName?: string | null
}

const selectedOfficers = ref<AddFormOfficer[]>([])
const showOfficerPicker = ref(false)

function getInitials(name: string): string {
  return name.split(' ').map((p: string) => p[0] || '').join('').toUpperCase().slice(0, 2)
}

function removeOfficer(id: string) {
  selectedOfficers.value = selectedOfficers.value.filter((o) => o.id !== id)
}

function handleOfficerPickerConfirm(officers: AddFormOfficer[]) {
  selectedOfficers.value = officers
  showOfficerPicker.value = false
}

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const errors = reactive<Record<string, string>>({})

const isFormValid = computed(() => !!form.name.trim() && !!form.area.trim())

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

async function selectAreaPrediction(prediction: PlacePrediction) {
  try {
    isSearchingArea.value = true
    const details = await getPlaceDetails(prediction)
    selectedArea.value = details
    form.area = details.formatted_address || details.location_name
    areaPredictions.value = []
    showAreaPredictions.value = false
    mapCenter.value = { lat: details.latitude, lng: details.longitude }
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
    const officerIds = selectedOfficers.value.map((o) => o.id).filter((id): id is string => !!id)
    const payload: {
      name: string
      area: string
      officers?: string[]
      latitude?: number
      longitude?: number
      location_name?: string
      map_image?: string
      map_boundaries?: string
    } = {
      name: form.name.trim(),
      area: form.area.trim(),
      ...(officerIds.length ? { officers: officerIds } : {}),
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

    if (boundaryGeoJson.value) {
      payload.map_boundaries = boundaryGeoJson.value
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

          <div class="form-field" style="margin-bottom: var(--space-4)">
            <label class="form-field__label">{{ t('communities.officers') }}</label>

            <div v-if="selectedOfficers.length" class="add-form-officers-list">
              <div v-for="officer in selectedOfficers" :key="officer.id" class="add-form-officer-card">
                <div v-if="officer.picture" class="add-form-officer-avatar">
                  <img :src="officer.picture" :alt="officer.fullName" />
                </div>
                <div v-else class="add-form-officer-avatar add-form-officer-avatar--initials">
                  {{ getInitials(officer.fullName) }}
                </div>
                <div class="add-form-officer-info">
                  <span class="add-form-officer-name">{{ officer.fullName }}</span>
                  <span class="add-form-officer-title">{{ officer.title }}</span>
                </div>
                <button type="button" class="add-form-officer-remove" @click="removeOfficer(officer.id)">
                  <Icon name="lucide:x" :size="13" />
                </button>
              </div>
            </div>

            <button type="button" class="add-form-officers-btn" @click="showOfficerPicker = true">
              <Icon name="lucide:user-plus" :size="15" />
              <span>{{ t('communities.add_officers') }}</span>
            </button>
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

            <CommunityBoundaryMap
              :center="mapCenter"
              :boundary="boundaryGeoJson"
              @change="boundaryGeoJson = $event"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- Officer Picker Modal -->
    <OfficerPickerModal
      :show="showOfficerPicker"
      :preselected-ids="selectedOfficers.map((o) => o.id)"
      @close="showOfficerPicker = false"
      @confirm="handleOfficerPickerConfirm"
    />

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
  font-size: var(--font-size-base);
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
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
}

.form-field__error {
  font-size: var(--font-size-base);
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
  font-size: var(--font-size-sm);
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
  font-size: var(--font-size-base);
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

/* Officer list in Add Form */
.add-form-officers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.add-form-officer-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.add-form-officer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
}
.add-form-officer-avatar img { width: 100%; height: 100%; object-fit: cover; }
.add-form-officer-avatar--initials {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-muted);
}

.add-form-officer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.add-form-officer-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-form-officer-title {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.add-form-officer-remove {
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.add-form-officer-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-critical);
}

.add-form-officers-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-accent);
  border: 1px dashed var(--color-accent);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
}
.add-form-officers-btn:hover { background: rgba(17, 156, 166, 0.08); }

/* Spin animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
