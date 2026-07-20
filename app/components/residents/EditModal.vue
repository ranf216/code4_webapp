<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ApiError } from '~/api/base'
import { communityApi } from '~/api/community'
import { residentApi } from '~/api/resident'
import type { Resident } from '~/api/types/resident'
import { useFileApi } from '~/composables/useFileApi'
import ImageUpload from '~/components/ImageUpload.vue'
import LoadingModal from '~/components/LoadingModal.vue'
import { useToastStore } from '~/stores/toast'

const props = defineProps<{
  show: boolean
  residentId: string
  communityId: string
  communityName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted'): void
}>()

const { t } = useTranslation()
const toastStore = useToastStore()
const { uploadSmallFile } = useFileApi()
const config = useRuntimeConfig()

const resident = ref<Resident | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const loadError = ref('')
const submitError = ref('')
const newVehicle = ref('')
const newImages = ref<Array<{ id: number; preview: string; file: File | null }>>([])
const keptImages = ref<string[]>([])
let nextImageId = 0
const imageUploadRefs = new Map<number, { openFilePicker: () => void }>()

function createNewImage() {
  return { id: nextImageId++, preview: '', file: null }
}
const errors = reactive<Record<string, string>>({})
const communities = ref<Array<{ id: number; name: string }>>([])
const isLoadingCommunities = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  address: '',
  instructions: '',
  vehicles: [] as string[],
  communicationTest: false,
  active: true,
  communityId: Number(props.communityId) || 0,
})

const isPhoneChanged = computed(() => !!resident.value && form.mobile !== resident.value.phone_num && !!form.mobile)
const isDeactivating = computed(() => !!resident.value && resident.value.is_active && !form.active)
const hasImageChanges = computed(() =>
  !!resident.value && (newImages.value.some((image) => !!image.file) || keptImages.value.length !== resident.value.images.length)
)
const isFormValid = computed(() => !!form.firstName.trim() && !!form.mobile.trim() && form.communityId > 0)
const imageItems = computed(() => keptImages.value.map((id) => ({ id, isNew: false })))

function imageUrl(imageId: string) {
  return imageId.startsWith('http') ? imageId : `${config.public.apiBase}/files/n/${imageId}.png`
}

function resetState() {
  resident.value = null
  loadError.value = ''
  submitError.value = ''
  newVehicle.value = ''
  newImages.value = []
  keptImages.value = []
  Object.keys(errors).forEach((key) => { errors[key] = '' })
}

function populateForm(value: Resident) {
  form.firstName = value.first_name || ''
  form.lastName = value.last_name || ''
  form.mobile = value.phone_num || ''
  form.email = value.email?.endsWith('@placeholder.local') ? '' : value.email || ''
  form.address = value.address || ''
  form.instructions = value.instructions || ''
  form.vehicles = [...(value.vehicles || [])]
  form.communicationTest = value.communication_test
  form.active = value.is_active
  form.communityId = value.community_id
  keptImages.value = [...(value.images || [])]
}

async function loadCommunities() {
  isLoadingCommunities.value = true
  try {
    const response = await communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    communities.value = response.communities.map((community: { community_id: number; name: string }) => ({ id: community.community_id, name: community.name }))
  } finally {
    isLoadingCommunities.value = false
  }
}

async function loadResident() {
  resetState()
  isLoading.value = true
  try {
    const response = await residentApi.getResident(props.residentId, { showLoading: false })
    if (!response.resident) throw new Error(t('residents.not_found'))
    resident.value = response.resident
    populateForm(response.resident)
    await loadCommunities()
  } catch (error) {
    loadError.value = error instanceof ApiError && error.rc === 540 ? t('residents.not_found') : t('residents.load_failed')
  } finally {
    isLoading.value = false
  }
}

function addVehicle() {
  const vehicle = newVehicle.value.trim()
  if (vehicle) {
    form.vehicles.push(vehicle)
    newVehicle.value = ''
  }
}

function removeVehicle(index: number) {
  form.vehicles.splice(index, 1)
}

async function addImageUpload() {
  const image = createNewImage()
  newImages.value.push(image)
  await nextTick()
  imageUploadRefs.get(image.id)?.openFilePicker()
}

function setImageUploadRef(id: number, instance: unknown) {
  if (instance) imageUploadRefs.set(id, instance as { openFilePicker: () => void })
  else imageUploadRefs.delete(id)
}

function updateNewImage(index: number, preview: string) {
  const image = newImages.value[index]
  if (!image) return
  if (!preview) {
    newImages.value.splice(index, 1)
    return
  }
  image.preview = preview
}

function selectNewImage(index: number, file: File) {
  const image = newImages.value[index]
  if (image) image.file = file
}

function removeImage(imageId: string) {
  keptImages.value = keptImages.value.filter((id) => id !== imageId)
}

async function uploadNewImages() {
  const imageIds: string[] = []
  for (const image of newImages.value) {
    if (!image.file) continue
    const fileId = await uploadSmallFile(image.file)
    if (!fileId) throw new Error(t('residents.image_upload_failed'))
    imageIds.push(fileId)
  }
  return imageIds
}

function validate() {
  const phonePattern = /^\+?[\d\s().-]{7,}$/
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  errors.firstName = form.firstName.trim() ? '' : t('validation.required')
  errors.mobile = !form.mobile.trim() ? t('validation.required') : !phonePattern.test(form.mobile.trim()) ? t('residents.invalid_mobile') : ''
  errors.email = form.email.trim() && !emailPattern.test(form.email.trim()) ? t('residents.invalid_email') : ''
  errors.communityId = form.communityId > 0 ? '' : t('validation.required')
  return !errors.firstName && !errors.mobile && !errors.email && !errors.communityId
}

function handleSubmitError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.rc === 224 || error.rc === 241) errors.mobile = t(error.rc === 224 ? 'residents.invalid_mobile' : 'residents.mobile_exists')
    else if (error.rc === 235 || error.rc === 240) errors.email = t(error.rc === 235 ? 'residents.invalid_email' : 'residents.email_exists')
    else if (error.rc === 321) submitError.value = t('residents.image_not_found')
    else if (error.rc === 500 || error.rc === 505 || error.rc === 542) errors.communityId = t(error.rc === 500 ? 'residents.community_not_found' : error.rc === 505 ? 'residents.community_inactive' : 'residents.community_already_assigned')
    else if (error.rc === 540) submitError.value = t('residents.not_found')
    else submitError.value = error.message
    return
  }
  submitError.value = t('residents.update_failed')
}

async function handleSubmit() {
  if (!resident.value || !validate()) return
  addVehicle()

  const original = resident.value
  const payload: Record<string, unknown> = { user_id: original.user_id }
  if (form.firstName !== original.first_name) payload.first_name = form.firstName.trim()
  if (form.lastName !== original.last_name) payload.last_name = form.lastName.trim()
  if (form.mobile !== original.phone_num) payload.phone_num = form.mobile.trim()
  if (form.email !== (original.email?.endsWith('@placeholder.local') ? '' : original.email || '')) payload.email = form.email.trim()
  if (form.address !== (original.address || '')) payload.address = form.address.trim()
  if (form.instructions !== (original.instructions || '')) payload.instructions = form.instructions.trim()
  if (form.communityId !== original.community_id) payload.community_id = form.communityId
  if (JSON.stringify(form.vehicles) !== JSON.stringify(original.vehicles || [])) payload.vehicles = form.vehicles
  if (form.communicationTest !== original.communication_test) payload.communication_test = form.communicationTest
  if (form.active !== original.is_active) payload.is_active = form.active
  if (Object.keys(payload).length === 1 && !hasImageChanges.value) {
    emit('close')
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  try {
    if (hasImageChanges.value) {
      payload.keep_images = keptImages.value
      payload.new_image_ids = await uploadNewImages()
    }
    await residentApi.updateResident(payload as Parameters<typeof residentApi.updateResident>[0], { showLoading: false })
    toastStore.success(t('residents.update_success'))
    emit('submitted')
    emit('close')
  } catch (error) {
    handleSubmitError(error)
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.show, (show: boolean) => {
  if (show) loadResident()
})
</script>

<template>
  <AppDialogModal :show="show" :title="resident ? `${t('residents.edit_title')} — ${resident.first_name} ${resident.last_name}` : t('residents.edit_title')" max-width="900px" @close="emit('close')">
    <div class="edit-resident-modal">
      <LoadingModal :show="isSubmitting" :message="t('common.loading')" />
      <div v-if="isLoading" class="modal-loading"><Icon name="lucide:loader-2" :size="28" class="spin" />{{ t('common.loading') }}</div>
      <p v-else-if="loadError" class="submit-error">{{ loadError }}</p>
      <template v-else-if="resident">
        <div class="form-grid">
          <div class="form-section">
            <div class="form-row">
              <div class="form-field"><label>{{ t('residents.first_name') }} <span class="required">*</span></label><input v-model="form.firstName" class="input-standard" :class="{ error: errors.firstName }" /><span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span></div>
              <div class="form-field"><label>{{ t('residents.last_name') }}</label><input v-model="form.lastName" class="input-standard" /></div>
            </div>
            <div class="form-field"><label>{{ t('residents.mobile') }} <span class="required">*</span></label><input v-model="form.mobile" type="tel" class="input-standard" :class="{ error: errors.mobile }" /><span v-if="errors.mobile" class="error-message">{{ errors.mobile }}</span><p v-if="isPhoneChanged" class="warning"><Icon name="lucide:triangle-alert" :size="16" />{{ t('residents.phone_change_warning') }}</p></div>
            <div class="form-field"><label>{{ t('residents.email') }}</label><input v-model="form.email" type="email" class="input-standard" :class="{ error: errors.email }" /><span v-if="errors.email" class="error-message">{{ errors.email }}</span></div>
            <div class="form-field"><label>{{ t('residents.address') }}</label><textarea v-model="form.address" /></div>
            <div class="form-field"><label>{{ t('residents.instructions') }}</label><textarea v-model="form.instructions" /></div>
          </div>
          <div class="form-section">
            <div class="form-field"><label>{{ t('residents.community') }}</label><select v-model="form.communityId" class="input-standard" :disabled="isLoadingCommunities" :class="{ error: errors.communityId }"><option :value="0">{{ t('residents.select_community') }}</option><option v-for="community in communities" :key="community.id" :value="community.id">{{ community.name }}</option></select><span v-if="errors.communityId" class="error-message">{{ errors.communityId }}</span></div>
            <div class="form-field"><label>{{ t('residents.vehicle_numbers') }}</label><div class="vehicle-input"><input v-model="newVehicle" class="input-standard" :placeholder="t('residents.vehicle_placeholder')" @keyup.enter="addVehicle" /><AppButton :text="t('common.add')" type="secondary" @click="addVehicle" /></div><div class="chips"><span v-for="(vehicle, index) in form.vehicles" :key="`${vehicle}-${index}`" class="chip">{{ vehicle }}<button @click="removeVehicle(index)"><Icon name="lucide:x" :size="14" /></button></span></div></div>
            <label class="toggle"><input v-model="form.communicationTest" type="checkbox" />{{ t('residents.enable_communication_test') }}</label>
            <label class="toggle"><input v-model="form.active" type="checkbox" />{{ t('residents.active') }}</label>
            <p v-if="isDeactivating" class="warning"><Icon name="lucide:triangle-alert" :size="16" />{{ t('residents.deactivate_warning') }}</p>
            <div class="form-field"><label>{{ t('residents.registration_date') }}</label><p class="read-only">{{ resident.created_on }}</p></div>
            <div class="form-field"><label>{{ t('residents.last_login') }}</label><p class="read-only">{{ resident.last_login || t('residents.never') }}</p></div>
          </div>
        </div>
        <div class="images-section"><div class="images-section__header"><label>{{ t('residents.property_images') }}</label><button type="button" class="upload-button" @click="addImageUpload"><Icon name="lucide:upload" :size="16" />{{ t('common.upload') }}</button></div><p v-if="!imageItems.length && !newImages.length" class="image-empty">{{ t('residents.no_property_images') }}</p><div class="image-grid"><div v-for="image in imageItems" :key="image.id" class="gallery-item"><img :src="imageUrl(image.id)" alt="Property" /><button class="gallery-remove" @click="removeImage(image.id)"><Icon name="lucide:x" :size="16" /></button></div><div v-for="(image, index) in newImages" :key="image.id" class="gallery-item gallery-item--upload"><ImageUpload :ref="(instance) => setImageUploadRef(image.id, instance)" :model-value="image.preview" label="" :auto-upload="false" :call-api-after-attach="false" :preview-size="120" @update:model-value="updateNewImage(index, $event)" @file-selected="selectNewImage(index, $event)" /></div></div></div>
        <p v-if="submitError" class="submit-error">{{ submitError }}</p>
      </template>
    </div>
    <template #footer><AppButton :text="t('common.cancel')" type="secondary" :disabled="isSubmitting" @click="emit('close')" /><AppButton :text="isSubmitting ? t('common.saving') : t('common.save')" type="primary" :disabled="isLoading || isSubmitting || !isFormValid" @click="handleSubmit" /></template>
  </AppDialogModal>
</template>

<style scoped>
.edit-resident-modal { 
  min-height: 200px; 
}
.modal-loading { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 8px; 
  min-height: 200px; 
}
.spin { 
  animation: spin 1s linear infinite; 
}
.form-grid, .form-row { 
  display: grid; 
  gap: 16px; 
}
.form-grid { 
  grid-template-columns: repeat(2, minmax(0, 1fr)); 
}
.form-row { 
  grid-template-columns: repeat(2, minmax(0, 1fr)); 
}
.form-section, .images-section { 
  padding: 16px; 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-lg); 
}
.form-field { 
  margin-bottom: 14px; 
}
.form-field label, .images-section label { 
  display: block; 
  margin-bottom: 6px; 
  font-size: var(--font-size-sm); 
  font-weight: 600; 
}
input, textarea, select { 
  box-sizing: border-box; 
  width: 100%; 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md); 
  color: var(--color-text-primary); 
  padding: 10px 12px; 
}
textarea { 
  background: var(--color-bg-base); 
  min-height: 76px; 
  resize: vertical; 
}
select { 
  background: transparent; 
}
textarea:focus { 
  border-color: var(--color-accent); 
  outline: none; 
}
.error { 
  border-color: var(--color-critical); 
}
.required, .error-message, .submit-error { 
  color: var(--color-critical); 
}
.error-message { 
  font-size: var(--font-size-xs); 
}
.read-only { 
  margin: 0; 
  padding: 10px 12px; 
  background: var(--color-bg-elevated); 
  border-radius: var(--radius-md); 
}
.toggle { 
  display: flex; 
  gap: 8px; 
  align-items: center; 
  margin: 12px 0; 
  cursor: pointer; 
}
.toggle input { 
  width: 18px; 
  height: 18px; 
}
.warning { 
  display: flex; 
  gap: 8px; 
  margin: 8px 0; 
  padding: 10px; 
  color: #92400e; 
  background: #fef3c7; 
  border-radius: var(--radius-md); 
  font-size: var(--font-size-sm); 
}
.vehicle-input { 
  display: flex; 
  gap: 8px; 
}
.chips { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 6px; 
  margin-top: 8px; 
}
.chip { 
  display: inline-flex; 
  align-items: center; 
  gap: 4px; 
  padding: 5px 8px; 
  border: 1px solid var(--color-border); 
  border-radius: 999px; 
}
.chip button { 
  border: 0; 
  background: transparent; 
  cursor: pointer; 
  color: var(--color-text-muted); 
}
.images-section { 
  margin-top: 16px; 
}
.images-section__header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.upload-button { 
  display: inline-flex !important; 
  align-items: center; 
  gap: 6px; 
  padding: 8px 12px; 
  background: var(--color-bg-elevated); 
  border: 0; 
  border-radius: var(--radius-md); 
  color: var(--color-text-primary); 
  cursor: pointer; 
}
.image-empty { 
  color: var(--color-text-muted); 
}
.image-grid { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 12px; 
  align-items: flex-start; 
}
.gallery-item { 
  position: relative; 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start; 
  gap: 8px; 
}
.gallery-item--upload :deep(.form-field) { 
  margin: 0; 
}
.gallery-item--upload :deep(.image-preview-actions) { 
  flex-direction: column; 
  align-items: flex-start; 
}
.gallery-item--upload :deep(.image-preview) { 
  border: 0; 
}
.gallery-item img, .gallery-item :deep(.image-preview) { 
  box-sizing: border-box; 
  width: 120px; 
  height: 120px; 
  border-radius: var(--radius-md); 
  object-fit: cover; 
}
.gallery-remove { 
  position: absolute; 
  top: -10px; 
  right: -10px; 
  width: 28px; 
  height: 28px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 0; 
  border-radius: 50%; 
  background: rgba(0,0,0,.75); 
  color: #fff; 
  cursor: pointer; 
  z-index: 1; 
}
.gallery-item--upload :deep(.image-remove) { 
  top: -10px !important; 
  right: -10px !important; 
  z-index: 1; 
}
@keyframes spin { 
  to { 
    transform: rotate(360deg); 
  } 
}
@media (max-width: 700px) { 
  .form-grid, .form-row { 
    grid-template-columns: 1fr; 
  } 
}
</style>
