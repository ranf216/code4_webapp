<script setup lang="ts">
import { callApi } from '~/api/call'
import type { Call as ApiCall } from '~/api/types/call'

interface CallCategory {
  type: 'medical' | 'security' | 'panic' | 'concierge' | 'test'
  label: string
  icon: string
  color: string
}

interface ServiceType {
  name: string
  icon: string
}

interface Call {
  id: string
  category: CallCategory
  serviceType: ServiceType
  callDateTime?: string
  residentName: string
  communityName: string
  address: string
  currentAddress?: string
  description?: string
  scheduledDateTime?: string | null
  officerName?: string | null
  status: 'new' | 'accepted' | 'done' | 'canceled'
  media?: string[]
  confirmationImages?: string[]
  audioUrl?: string
  videoUrl?: string
  officerComments?: string
  likeReaction?: boolean
  residentComments?: string
}

const props = defineProps<{
  show: boolean
  call: Call | null
}>()

const emit = defineEmits<{
  close: []
  resolved: []
  canceled: []
}>()

const { t } = useTranslation()

const loading = ref(false)
const error = ref('')
const fetchedCall = ref<Call | null>(null)

const call = computed(() => fetchedCall.value ?? props.call)

const showImagePreview = ref(false)
const previewImages = ref<string[]>([])
const previewInitialIndex = ref(0)

function openImagePreview(images: string[], index: number) {
  previewImages.value = images
  previewInitialIndex.value = index
  showImagePreview.value = true
}

function closeImagePreview() {
  showImagePreview.value = false
}

const resolving = ref(false)
const canceling = ref(false)

const canResolve = computed(() => call.value?.status === 'accepted')
const canCancel = computed(() => call.value?.status === 'accepted' && call.value?.category.type === 'concierge')
const okDisabled = computed(() => resolving.value || canceling.value)
const okText = computed(() => canResolve.value ? 'Resolve' : '')
const cancelText = computed(() => canCancel.value ? 'Cancel' : '')

async function handleResolve() {
  if (!call.value) return
  resolving.value = true
  try {
    await callApi.resolveCall({ call_id: Number(call.value.id) })
    emit('resolved')
    emit('close')
  } catch (err: any) {
    console.error('Resolve call failed:', err)
  } finally {
    resolving.value = false
  }
}

async function handleCancel() {
  if (!call.value) return
  canceling.value = true
  try {
    await callApi.cancelCall(Number(call.value.id))
    emit('canceled')
    emit('close')
  } catch (err: any) {
    console.error('Cancel call failed:', err)
  } finally {
    canceling.value = false
  }
}

function getCategoryInfo(category: ApiCall['category']): CallCategory {
  const map: Record<ApiCall['category'], CallCategory> = {
    medical_emergency: { type: 'medical', label: 'Medical Emergency', icon: 'lucide:heart-pulse', color: '#ef4444' },
    security_emergency: { type: 'security', label: 'Security Emergency', icon: 'lucide:shield-alert', color: '#f97316' },
    panic: { type: 'panic', label: 'Panic Button', icon: 'lucide:siren', color: '#ef4444' },
    concierge_service: { type: 'concierge', label: 'Concierge Service', icon: 'lucide:bell-concierge', color: '#3b82f6' },
    test: { type: 'test', label: 'Test Call', icon: 'lucide:test-tube', color: '#8b5cf6' },
  }
  return map[category]
}

function mapCall(apiCall: ApiCall): Call {
  const category = getCategoryInfo(apiCall.category)
  const serviceName = apiCall.service_type || category.label
  const serviceIcon = apiCall.category === 'concierge_service' ? 'lucide:bell-concierge' : category.icon
  const scheduledDateTime = apiCall.scheduled_date
    ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? ' ' + apiCall.scheduled_time_from : ''}`
    : null

  return {
    id: apiCall.call_id.toString(),
    category,
    serviceType: { name: serviceName, icon: serviceIcon },
    callDateTime: apiCall.created_on,
    residentName: apiCall.resident_name || '',
    communityName: apiCall.community_name || '',
    address: apiCall.address || '',
    currentAddress: apiCall.current_address || undefined,
    description: apiCall.description || undefined,
    scheduledDateTime,
    officerName: apiCall.officer_name,
    status: apiCall.status === 'resolved' ? 'done' : apiCall.status,
    media: apiCall.media,
    confirmationImages: apiCall.confirmation_media,
    audioUrl: apiCall.audio_url || undefined,
    videoUrl: apiCall.video_url || undefined,
    officerComments: apiCall.officer_comments || undefined,
    likeReaction: apiCall.reaction === 1,
    residentComments: apiCall.resident_comment || undefined,
  }
}

async function fetchCallDetails() {
  if (!props.call) return
  loading.value = true
  error.value = ''
  try {
    const res = await callApi.getCall(Number(props.call.id))
    fetchedCall.value = mapCall(res.call)
  } catch (err: any) {
    error.value = err.message || 'Failed to load call details'
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (show) => {
  if (show && props.call) {
    fetchedCall.value = null
    fetchCallDetails()
  }
})

function handleClose() {
  emit('close')
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'new': return 'status-new'
    case 'accepted': return 'status-accepted'
    case 'done': return 'status-done'
    case 'canceled': return 'status-canceled'
    default: return 'status-new'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'new': return t('calls.status.new')
    case 'accepted': return t('calls.status.accepted')
    case 'done': return t('calls.status.done')
    case 'canceled': return t('calls.status.canceled')
    default: return status
  }
}
</script>

<template>
  <AppModal
    :show="show"
    :title="t('calls.call_details_title')"
    :cancel-text="cancelText"
    :ok-text="okText"
    :ok-disabled="okDisabled"
    max-width="50vw"
    @close="handleClose"
    @ok="handleResolve"
    @cancel="handleCancel"
  >
    <template #default>
      <div v-if="call" class="call-details-modal">
        <div v-if="loading" class="loading-state">
          <Icon name="lucide:loader-2" :size="24" class="spinner" />
          <span>Loading call details...</span>
        </div>
        <div v-else-if="error" class="error-state">
          <Icon name="lucide:alert-circle" :size="24" />
          <span>{{ error }}</span>
        </div>
        <template v-else>
          <!-- Header: Category + Service Type + Status -->
          <div class="details-header">
          <div class="category-service">
            <div class="category-badge" :style="{ backgroundColor: call.category.color + '20', color: call.category.color }">
              <Icon :name="call.category.icon" :size="20" />
              <span>{{ call.category.label }}</span>
            </div>
            <div class="service-type">
              <Icon :name="call.serviceType.icon" :size="16" />
              <span>{{ call.serviceType.name }}</span>
            </div>
          </div>
          <span :class="['status-badge', getStatusClass(call.status)]">
            {{ getStatusLabel(call.status) }}
          </span>
        </div>

        <!-- Scrollable Content -->
        <div class="details-content">
          <!-- Call Info Section -->
          <div class="details-section">
            <h4 class="section-title">{{ t('calls.call_info') }}</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>{{ t('calls.call_datetime') }}</label>
                <span>{{ call.callDateTime }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('calls.resident') }}</label>
                <span>{{ call.residentName }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('calls.community') }}</label>
                <span>{{ call.communityName }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('calls.address') }}</label>
                <span>{{ call.address }}</span>
              </div>
              <div v-if="call.currentAddress" class="info-item">
                <label>{{ t('calls.current_address') }}</label>
                <span>{{ call.currentAddress }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('calls.officer') }}</label>
                <span>{{ call.officerName || '—' }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('calls.scheduled_datetime') }}</label>
                <span>{{ call.scheduledDateTime || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div v-if="call.description" class="details-section">
            <h4 class="section-title">{{ t('calls.description') }}</h4>
            <p class="description-text">{{ call.description }}</p>
          </div>

          <!-- Media Gallery -->
          <div v-if="call.media && call.media.length > 0" class="details-section">
            <h4 class="section-title">{{ t('calls.media') }}</h4>
            <div class="media-gallery">
              <img
                v-for="(img, idx) in call.media"
                :key="idx"
                :src="img"
                class="media-thumb"
                alt="Call media"
                @click="openImagePreview(call.media, idx)"
              />
            </div>
          </div>

          <!-- Audio Recording -->
          <div v-if="call.audioUrl" class="details-section">
            <h4 class="section-title">{{ t('calls.audio_recording') }}</h4>
            <audio controls class="audio-player">
              <source :src="call.audioUrl" type="audio/mpeg" />
            </audio>
          </div>

          <!-- Video -->
          <div v-if="call.videoUrl" class="details-section">
            <h4 class="section-title">{{ t('calls.video') }}</h4>
            <video controls class="video-player">
              <source :src="call.videoUrl" type="video/mp4" />
            </video>
          </div>

          <!-- Confirmation Images (for completed calls) -->
          <div v-if="call.confirmationImages && call.confirmationImages.length > 0" class="details-section">
            <h4 class="section-title">{{ t('calls.confirmation_images') }}</h4>
            <div class="media-gallery">
              <img
                v-for="(img, idx) in call.confirmationImages"
                :key="idx"
                :src="img"
                class="media-thumb"
                alt="Confirmation"
                @click="openImagePreview(call.confirmationImages, idx)"
              />
            </div>
          </div>

          <!-- Officer Comments (for completed calls) -->
          <div v-if="call.officerComments" class="details-section">
            <h4 class="section-title">{{ t('calls.officer_comments') }}</h4>
            <p class="description-text">{{ call.officerComments }}</p>
          </div>

          <!-- Resident Feedback Section (for completed calls) -->
          <div v-if="call.status === 'done' && (call.likeReaction || call.residentComments)" class="details-section feedback-section">
            <h4 class="section-title">{{ t('calls.resident_feedback') }}</h4>
            <div class="feedback-content">
              <div v-if="call.likeReaction" class="like-reaction">
                <Icon name="lucide:thumbs-up" :size="20" class="like-icon" />
                <span>{{ t('calls.like_given') }}</span>
              </div>
              <p v-if="call.residentComments" class="resident-comment">"{{ call.residentComments }}"</p>
            </div>
          </div>

          <!-- Admin Only Section -->
          <div class="details-section admin-section">
            <h4 class="section-title">{{ t('calls.admin_only') }}</h4>
            <div class="info-item">
              <label>{{ t('calls.documents') }}</label>
              <span class="placeholder-text">{{ t('calls.no_documents') }}</span>
            </div>
            <div class="info-item">
              <label>{{ t('calls.transcription') }}</label>
              <span class="placeholder-text">{{ t('calls.no_transcription') }}</span>
            </div>
          </div>
        </div>
        </template>
      </div>
    </template>
  </AppModal>

  <MImagePreview
    :show="showImagePreview"
    :images="previewImages"
    :initial-index="previewInitialIndex"
    @close="closeImagePreview"
  />
</template>

<style scoped>
.call-details-modal {
  max-height: 66vh;
  display: flex;
  flex-direction: column;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8);
  color: var(--color-text-secondary);
}

.error-state {
  color: #ef4444;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Header */
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-4);
}

.category-service {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.category-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.service-type {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.status-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: capitalize;
}

.status-new {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.status-accepted {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-done {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-canceled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Content - Scrollable with hidden scrollbar */
.details-content {
  overflow-y: auto;
  padding-right: var(--space-2);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.details-content::-webkit-scrollbar {
  display: none;
}

.details-section {
  margin-bottom: var(--space-4);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-item label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.info-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.description-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0;
}

/* Media Gallery */
.media-gallery {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.media-thumb {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s;
}

.media-thumb:hover {
  transform: scale(1.05);
}

/* Audio & Video */
.audio-player,
.video-player {
  width: 100%;
  border-radius: var(--radius-md);
}

.video-player {
  max-height: 200px;
}

/* Feedback Section */
.feedback-section {
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.feedback-section .section-title {
  color: #22c55e;
  border-bottom-color: rgba(34, 197, 94, 0.3);
}

.feedback-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.like-reaction {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: #22c55e;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.like-icon {
  color: #22c55e;
}

.resident-comment {
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
  padding-left: var(--space-3);
  border-left: 3px solid #22c55e;
}

/* Admin Section */
.admin-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.admin-section .section-title {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.placeholder-text {
  color: var(--color-text-muted);
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}
</style>
