<script setup lang="ts">
interface CallCategory {
  type: 'medical' | 'security' | 'concierge' | 'test'
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
}>()

const { t } = useTranslation()

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
    cancel-text=""
    ok-text=""
    max-width="50vw"
    @close="handleClose"
  >
    <template #default>
      <div v-if="call" class="call-details-modal">
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
                :src="`https://picsum.photos/seed/call${call.id}${idx}/150/150`"
                class="media-thumb"
                alt="Call media"
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
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.call-details-modal {
  max-height: 66vh;
  display: flex;
  flex-direction: column;
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
