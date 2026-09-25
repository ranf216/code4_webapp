<script setup lang="ts">
import { callApi } from '~/api/call'
import FileUpload from '~/components/FileUpload.vue'
import { officerApi } from '~/api/officer'
import type { Call } from '~/api/types/call'
import type { Officer } from '~/api/types/officer'

const props = defineProps<{
  show: boolean
  callId?: number | null
}>()

const emit = defineEmits<{
  close: []
  assign: []
  resolved: []
}>()

const { t } = useTranslation()
const panicCall = ref<Call | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const showAssignModal = ref(false)
const assignableOfficers = ref<Officer[]>([])
const selectedOfficerId = ref('')
const isLoadingOfficers = ref(false)
const isAssigning = ref(false)
const assignError = ref('')
const showResolveModal = ref(false)
const isResolving = ref(false)
const resolveComments = ref('')
const resolvePhotoIds = ref<string[]>([])
const resolveVideoIds = ref<string[]>([])
const resolveError = ref('')
const safetyConfirmed = ref(false)
const photoUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)
const videoUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)
let requestId = 0

const isActive = computed(() => panicCall.value?.status === 'new' || panicCall.value?.status === 'accepted')
const canResolve = computed(() => panicCall.value?.category === 'panic' && panicCall.value.status === 'accepted')
const callTypeLabel = computed(() => panicCall.value?.category === 'panic' ? t('calls.panic_call_title') : panicCall.value?.category || '—')
const locationLabel = computed(() => panicCall.value?.address || panicCall.value?.current_address || '—')
const liveLocationLabel = computed(() => panicCall.value?.current_address || panicCall.value?.address || '—')
const hasCoordinates = computed(() => panicCall.value?.latitude != null && panicCall.value?.longitude != null)
const locationMarkers = computed(() => hasCoordinates.value && panicCall.value ? [{
  lat: Number(panicCall.value.latitude),
  lng: Number(panicCall.value.longitude),
  status: 'active' as const,
}] : [])

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

async function loadPanicCall() {
  const currentRequestId = ++requestId
  isLoading.value = true
  errorMessage.value = ''
  panicCall.value = null
  try {
    if (props.callId) {
      const response = await callApi.getCall(props.callId, { showLoading: false })
      if (response.call?.category === 'panic') panicCall.value = response.call
    } else {
      const response = await callApi.getCalls({
        category: 'panic',
        is_open: true,
        offset: 0,
        limit: 1,
        sort_by: 'created_on',
        sort_dir: 'desc',
      }, { showLoading: false })
      panicCall.value = response.calls?.[0] || null
    }
    if (currentRequestId === requestId && !panicCall.value) errorMessage.value = t('calls.panic_call_not_found')
  } catch (error) {
    if (currentRequestId === requestId) errorMessage.value = error instanceof Error ? error.message : t('calls.panic_call_load_failed')
  } finally {
    if (currentRequestId === requestId) isLoading.value = false
  }
}

function handleClose() {
  emit('close')
}

async function handleAssign() {
  assignError.value = ''
  selectedOfficerId.value = ''
  showAssignModal.value = true
  if (assignableOfficers.value.length || !panicCall.value?.community_id) return
  isLoadingOfficers.value = true
  try {
    const response = await officerApi.getOfficers({ community_id: panicCall.value.community_id, include_inactive: false }, { showLoading: false })
    assignableOfficers.value = response.officers || []
  } catch (error) {
    assignError.value = error instanceof Error ? error.message : t('calls.officers_load_failed')
  } finally {
    isLoadingOfficers.value = false
  }
}

async function confirmAssign() {
  if (!panicCall.value || !selectedOfficerId.value || isAssigning.value) return
  isAssigning.value = true
  assignError.value = ''
  try {
    await callApi.assignCall({ call_id: panicCall.value.call_id, officer_user_id: selectedOfficerId.value }, { showLoading: false })
    showAssignModal.value = false
    await loadPanicCall()
    emit('assign')
  } catch (error) {
    assignError.value = error instanceof Error ? error.message : t('calls.assign_failed')
  } finally {
    isAssigning.value = false
  }
}

function openResolveModal() {
  if (!canResolve.value) return
  resolveComments.value = ''
  resolvePhotoIds.value = []
  resolveVideoIds.value = []
  resolveError.value = ''
  safetyConfirmed.value = false
  showResolveModal.value = true
}

function closeResolveModal() {
  if (!isResolving.value) showResolveModal.value = false
}

async function submitResolve() {
  if (!panicCall.value || !safetyConfirmed.value || isResolving.value) return
  isResolving.value = true
  resolveError.value = ''
  try {
    const photoIds = photoUploadRef.value ? await photoUploadRef.value.uploadAll() : []
    const videoIds = videoUploadRef.value ? await videoUploadRef.value.uploadAll() : []
    await callApi.resolveCall({
      call_id: panicCall.value.call_id,
      officer_comments: resolveComments.value || undefined,
      confirmation_media_file_ids: photoIds.length ? photoIds : undefined,
      confirmation_video_file_id: videoIds[0] || undefined,
    }, { showLoading: false })
    showResolveModal.value = false
    await loadPanicCall()
    emit('resolved')
  } catch (error) {
    resolveError.value = error instanceof Error ? error.message : t('calls.resolve_failed')
  } finally {
    isResolving.value = false
  }
}

watch(() => [props.show, props.callId] as const, ([show]) => {
  if (show) loadPanicCall()
})
</script>

<template>
  <AppModal
    :show="show"
    :title="t('calls.panic_call_title')"
    cancel-text=""
    ok-text=""
    max-width="540px"
    @close="handleClose"
  >
    <template #default>
      <div class="panic-call-modal">
        <div v-if="isLoading" class="panic-state"><Icon name="lucide:loader-2" :size="20" class="spin" />{{ t('common.loading') }}</div>
        <div v-else-if="errorMessage" class="panic-state panic-state--error">{{ errorMessage }}<button class="btn btn--secondary" @click="loadPanicCall">{{ t('common.retry') }}</button></div>
        <div v-else-if="panicCall" class="panic-call-content">
          <div class="panic-alert">
            <div class="alert-icon-wrapper"><Icon name="lucide:alert-triangle" :size="28" class="alert-icon" /></div>
            <div class="alert-text"><h3 class="panic-title">{{ t('calls.panic_alert_title') }}</h3><p class="panic-subtitle">{{ t('calls.panic_subtitle') }}</p></div>
          </div>

          <div class="info-section panic-section">
            <div class="info-grid">
              <div class="info-item"><label>{{ t('calls.call_id') }}</label><span>{{ panicCall.call_id }}</span></div>
              <div class="info-item"><label>{{ t('calls.call_type') }}</label><span class="panic-type">{{ callTypeLabel }}</span></div>
              <div class="info-item"><label>{{ t('calls.user_name') }}</label><span class="user-name">{{ panicCall.resident_name || '—' }}</span></div>
              <div class="info-item"><label>{{ t('calls.community') }}</label><span>{{ panicCall.community_name || '—' }}</span></div>
              <div class="info-item"><label>{{ t('calls.priority') }}</label><span class="priority-badge">{{ panicCall.priority }}</span></div>
              <div class="info-item"><label>{{ t('calls.call_datetime') }}</label><span>{{ formatDateTime(panicCall.created_on) }}</span></div>
              <div class="info-item"><label>{{ t('calls.status') }}</label><span :class="['status-badge', isActive ? 'status-active' : 'status-closed']">{{ panicCall.status }}</span></div>
              <div class="info-item"><label>{{ t('calls.assigned_officer') }}</label><span>{{ panicCall.officer_name || t('calls.unassigned') }}</span></div>
              <div class="info-item"><label>{{ t('calls.accepted_on') }}</label><span>{{ formatDateTime(panicCall.accepted_on) }}</span></div>
              <div class="info-item"><label>{{ t('calls.resolved_on') }}</label><span>{{ formatDateTime(panicCall.resolved_on) }}</span></div>
            </div>
          </div>

          <div class="location-section panic-section">
            <h4 class="section-title"><Icon name="lucide:map-pin" :size="18" />{{ t('calls.location_info') }}</h4>
            <div class="info-grid">
              <div class="info-item full-width"><label>{{ t('calls.location_when_pressed') }}</label><span>{{ locationLabel }}</span></div>
              <div class="info-item full-width"><label>{{ t('calls.live_location') }}</label><span class="live-location"><Icon name="lucide:radio" :size="14" class="live-icon" />{{ liveLocationLabel }}</span></div>
              <div v-if="hasCoordinates" class="info-item full-width"><label>{{ t('calls.coordinates') }}</label><span>{{ panicCall.latitude }}, {{ panicCall.longitude }}</span></div>
            </div>
            <GoogleMap
              v-if="hasCoordinates"
              :center="{ lat: Number(panicCall.latitude), lng: Number(panicCall.longitude) }"
              :markers="locationMarkers"
              :zoom="15"
              height="180px"
            />
          </div>

          <div v-if="panicCall.description || panicCall.resident_comment || panicCall.officer_comments" class="communication-section panic-section">
            <h4 class="section-title"><Icon name="lucide:message-square" :size="18" />{{ t('calls.communication') }}</h4>
            <div class="communication-log">
              <div v-if="panicCall.description" class="log-entry"><span class="log-user">Resident</span><span class="log-message">{{ panicCall.description }}</span></div>
              <div v-if="panicCall.resident_comment" class="log-entry"><span class="log-user">Resident</span><span class="log-message">{{ panicCall.resident_comment }}</span></div>
              <div v-if="panicCall.officer_comments" class="log-entry"><span class="log-user">Officer</span><span class="log-message">{{ panicCall.officer_comments }}</span></div>
            </div>
          </div>

          <div v-if="panicCall.media?.length || panicCall.audio_url || panicCall.video_url" class="media-section panic-section">
            <h4 class="section-title"><Icon name="lucide:paperclip" :size="18" />{{ t('calls.media') }}</h4>
            <div v-if="panicCall.media?.length" class="media-grid">
              <img v-for="(mediaUrl, index) in panicCall.media" :key="`${mediaUrl}-${index}`" :src="mediaUrl" :alt="`${t('calls.media')} ${index + 1}`" class="media-preview" />
            </div>
            <a v-if="panicCall.audio_url" :href="panicCall.audio_url" target="_blank" rel="noopener" class="media-link"><Icon name="lucide:volume-2" :size="14" />{{ t('calls.open_audio') }}</a>
            <a v-if="panicCall.video_url" :href="panicCall.video_url" target="_blank" rel="noopener" class="media-link"><Icon name="lucide:video" :size="14" />{{ t('calls.open_video') }}</a>
          </div>

          <div class="panic-actions">
            <button v-if="panicCall.status === 'new' && !panicCall.officer_user_id" class="action-btn assign-btn" @click="handleAssign"><Icon name="lucide:user-plus" :size="18" />{{ t('calls.assign_to_officer') }}</button>
            <button v-if="canResolve" class="action-btn resolve-btn" @click="openResolveModal"><Icon name="lucide:check-circle" :size="18" />{{ t('calls.resolve_panic') }}</button>
            <button class="action-btn communicate-btn"><Icon name="lucide:phone" :size="18" />{{ t('calls.correspond_user') }}</button>
            <button class="action-btn live-location-btn"><Icon name="lucide:navigation" :size="18" />{{ t('calls.view_live_location') }}</button>
          </div>
        </div>
      </div>
    </template>
  </AppModal>

  <AppModal
    :show="showResolveModal"
    :title="t('calls.resolve_panic')"
    :cancel-text="t('common.cancel')"
    :ok-text="isResolving ? t('calls.resolving') : t('calls.resolve_panic')"
    :ok-disabled="!safetyConfirmed || isResolving"
    max-width="500px"
    @close="closeResolveModal"
    @cancel="closeResolveModal"
    @ok="submitResolve"
  >
    <div class="resolve-form">
      <div class="security-notice">
        <Icon name="lucide:alert-triangle" :size="18" />
        <span><strong>{{ t('calls.security_notice_label') }}</strong> {{ t('calls.panic_security_notice') }}</span>
      </div>
      <label class="resolve-check"><input v-model="safetyConfirmed" type="checkbox" />{{ t('calls.safety_confirmed') }}</label>
      <label class="resolve-label">{{ t('calls.officer_comments') }}<textarea v-model="resolveComments" class="resolve-textarea" rows="4" :placeholder="t('calls.resolve_comments_placeholder')" /></label>
      <label class="resolve-label">{{ t('calls.confirmation_photos') }}
        <FileUpload ref="photoUploadRef" v-model="resolvePhotoIds" accept="image/*" :max-files="5" :call-api="true" :hint="t('calls.confirmation_photos_hint')" />
      </label>
      <label class="resolve-label">{{ t('calls.confirmation_video') }}
        <FileUpload ref="videoUploadRef" v-model="resolveVideoIds" accept="video/*" :max-files="1" :call-api="true" :hint="t('calls.confirmation_video_hint')" />
      </label>
      <p v-if="resolveError" class="assign-error">{{ resolveError }}</p>
    </div>
  </AppModal>

  <AppModal
    :show="showAssignModal"
    :title="t('calls.assign_to_officer')"
    :cancel-text="t('common.cancel')"
    :ok-text="isAssigning ? t('calls.assigning') : t('common.confirm')"
    :ok-disabled="!selectedOfficerId || isAssigning || isLoadingOfficers"
    @close="showAssignModal = false"
    @cancel="showAssignModal = false"
    @ok="confirmAssign"
  >
    <div class="assign-form">
      <label class="assign-label">{{ t('calls.select_officer') }}</label>
      <select v-model="selectedOfficerId" class="assign-select" :disabled="isLoadingOfficers || isAssigning">
        <option value="">{{ isLoadingOfficers ? t('common.loading') : t('calls.select_officer_placeholder') }}</option>
        <option v-for="officer in assignableOfficers" :key="officer.user_id" :value="officer.user_id">
          {{ [officer.first_name, officer.last_name].filter(Boolean).join(' ') }}{{ officer.title ? ` — ${officer.title}` : '' }}
        </option>
      </select>
      <p v-if="assignError" class="assign-error">{{ assignError }}</p>
    </div>
  </AppModal>
</template>

<style scoped>
.panic-call-modal { display: flex; flex-direction: column; gap: var(--space-4); }
.assign-form { display: flex; flex-direction: column; gap: var(--space-2); }
.assign-label { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.assign-select { width: 100%; height: 40px; padding: 0 var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-base); color: var(--color-text-primary); }
.assign-error { color: var(--color-critical); font-size: var(--font-size-sm); }
.resolve-form { display: flex; flex-direction: column; gap: var(--space-3); }
.security-notice { display: flex; align-items: flex-start; gap: var(--space-2); padding: var(--space-3); border: 1px solid rgba(239, 68, 68, .4); border-radius: var(--radius-md); background: var(--color-critical-bg); color: var(--color-critical); font-size: var(--font-size-sm); line-height: 1.4; }
.resolve-check { display: flex; gap: var(--space-2); align-items: flex-start; color: var(--color-text-primary); cursor: pointer; }
.resolve-check input { margin-top: 3px; accent-color: var(--color-accent); }
.resolve-label { display: flex; flex-direction: column; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.resolve-textarea { width: 100%; resize: vertical; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-base); color: var(--color-text-primary); font: inherit; }
.resolve-btn { border-color: var(--color-ok); color: var(--color-ok); }
.panic-state { display: flex; min-height: 180px; align-items: center; justify-content: center; gap: var(--space-2); color: var(--color-text-muted); }
.panic-state--error { flex-direction: column; color: var(--color-critical); }
.panic-call-content { display: flex; flex-direction: column; gap: var(--space-4); }
.panic-alert { display: flex; align-items: center; gap: var(--space-3); min-height: 60px; padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
.alert-icon-wrapper { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
.alert-icon { color: white; }
.panic-title { font-size: var(--font-size-lg); font-weight: 700; }
.panic-subtitle { margin-top: 2px; font-size: var(--font-size-sm); opacity: .9; }
.panic-section { padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.section-title { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
.info-item { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.info-item.full-width { grid-column: 1 / -1; }
.info-item label { color: var(--color-text-muted); font-size: var(--font-size-xs); }
.info-item span { overflow-wrap: anywhere; color: var(--color-text-primary); font-size: var(--font-size-sm); }
.panic-type { color: var(--color-critical) !important; font-weight: 700; }
.priority-badge { color: var(--color-critical) !important; font-weight: 700; text-transform: capitalize; }
.status-badge { width: fit-content; padding: 2px var(--space-2); border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; text-transform: capitalize; }
.status-active { background: var(--color-critical-bg); color: var(--color-critical) !important; }
.status-closed { background: var(--color-bg-overlay); color: var(--color-text-muted) !important; }
.live-location { display: inline-flex; align-items: center; gap: var(--space-1); }
.live-icon { color: var(--color-ok); }
.communication-log { display: flex; flex-direction: column; gap: var(--space-2); }
.media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
.media-preview { width: 100%; aspect-ratio: 1; border-radius: var(--radius-sm); object-fit: cover; }
.media-link { display: inline-flex; align-items: center; gap: var(--space-2); margin-top: var(--space-2); color: var(--color-accent); font-size: var(--font-size-sm); }
.log-entry { display: flex; gap: var(--space-2); padding: var(--space-2); border-radius: var(--radius-sm); background: var(--color-bg-base); font-size: var(--font-size-xs); }
.log-user { color: var(--color-text-muted); font-weight: 600; }
.log-message { color: var(--color-text-secondary); }
.panic-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
.action-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); min-height: 36px; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); color: var(--color-text-primary); cursor: pointer; font-family: var(--font-family); font-size: var(--font-size-xs); }
.assign-btn { border-color: var(--color-accent); color: var(--color-accent); }
.close-btn { border-color: var(--color-critical); color: var(--color-critical); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 480px) { .info-grid, .panic-actions { grid-template-columns: 1fr; } }
</style>
