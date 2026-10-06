<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { settingsApi } from '~/api/settings'
import { postOrderApi } from '~/api/postOrder'
import { assetApi } from '~/api/asset'
import { communityApi } from '~/api/community'
import type { Community } from '~/api/community'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import { renderMarkdown } from '~/utils/markdown'
import type { PostOrderSectionTypeItem } from '~/api/settings'
import type { Post } from '~/api/types/asset'
import type { PostOrder, PostOrderDetail, PostOrderStatus, PostOrderSection, PostOrderSectionInput, PostOrderAttachment, PostOrderVersionSummary, PostOrderVersionDetail } from '~/api/types/postOrder'
import type { PublishPayload } from '~/components/post-orders/PublishPostOrderModal.vue'
import type { SectionData } from '~/components/post-orders/PostOrderSection.vue'
import type { HistoryEntry } from '~/components/post-orders/PostOrderHistory.vue'

interface Props {
  mode?: 'create' | 'edit'
  postOrderId?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  postOrderId: '',
})

const emit = defineEmits<{
  saved: [postOrderId: number]
}>()

const isEditMode = computed(() => props.mode === 'edit')
const postOrderIdNum = computed(() => Number(props.postOrderId) || 0)

const { t } = useTranslation()
const authStore = useAuthStore()
const toastStore = useToastStore()

// ─── Reference data ──────────────────────────────────────────
const sectionTypes = ref<PostOrderSectionTypeItem[]>([])
const activeSectionTypes = computed(() => sectionTypes.value.filter((st) => st.active))
const communities = ref<Community[]>([])
const availablePosts = ref<Post[]>([])
const isLoadingPosts = ref(false)
const isLoadingDetail = ref(false)

// ─── Header fields ───────────────────────────────────────────
const selectedCommunityId = ref<number | ''>('')
const selectedPostId = ref<number | ''>('')
const reviewDueDate = ref('')
const currentStatus = ref<PostOrderStatus>('draft')
const currentVersion = ref('0.0')
const postOrderDetail = ref<PostOrderDetail | null>(null)

const displayId = computed(() => (isEditMode.value && postOrderIdNum.value ? `PO-${postOrderIdNum.value}` : '—'))
const communityName = computed(() => {
  if (postOrderDetail.value) return postOrderDetail.value.community_name
  return communities.value.find(c => c.community_id === selectedCommunityId.value)?.name ?? '—'
})
const postName = computed(() => postOrderDetail.value?.post_name ?? '')
const authorName = computed(() => postOrderDetail.value?.created_by_name ?? authStore.fullName ?? '—')
const isArchived = computed(() => currentStatus.value === 'archived')
const canEdit = computed(() => !isArchived.value)
const canPublish = computed(() => currentStatus.value === 'draft' && !isArchived.value)
const canDelete = computed(() => currentStatus.value === 'draft' && historyEntries.value.length === 0 && !isArchived.value)
const canArchive = computed(() => (currentStatus.value === 'published' || (currentStatus.value === 'draft' && historyEntries.value.length > 0)) && !isArchived.value)

function formatUtc(utcDateStr: string | null): string {
  if (!utcDateStr) return '—'
  return utcToLocal(utcDateStr).format('MMM D, YYYY HH:mm')
}

// ─── Sections ────────────────────────────────────────────────
const sections = ref<SectionData[]>([])
const sectionRefs: Array<{ uploadAttachments: () => Promise<string[]> } | null> = []

function setSectionRef(el: unknown, index: number) {
  sectionRefs[index] = el as { uploadAttachments: () => Promise<string[]> } | null
}

function newSection(type?: PostOrderSectionTypeItem): SectionData {
  return {
    id: crypto.randomUUID(),
    type: type?.type_id ?? '',
    title: type?.name ?? '',
    description: '',
    clientVisible: type?.client_visible ?? false,
    notes: '',
    attachments: [],
    existingAttachments: [],
  }
}

const showAddSectionMenu = ref(false)

function addSection(type: PostOrderSectionTypeItem) {
  sections.value.push(newSection(type))
  showAddSectionMenu.value = false
}

function getSection(index: number) {
  return sections.value[index] ?? sections.value[0]!
}

function updateSection(index: number, value: SectionData) {
  sections.value[index] = value
}

// ─── Drag & drop reorder ─────────────────────────────────────
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function resetDrag() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function onSectionDrop(targetIndex: number) {
  if (dragIndex.value === null || dragIndex.value === targetIndex) {
    resetDrag()
    return
  }
  const arr = [...sections.value]
  const [moved] = arr.splice(dragIndex.value, 1)
  arr.splice(targetIndex, 0, moved!)
  sections.value = arr
  resetDrag()
}

// ─── Remove section (with confirmation) ──────────────────────
const sectionToRemove = ref<string | null>(null)

function confirmRemoveSection(id: string) {
  if (sections.value.length === 1) return
  sectionToRemove.value = id
}

function removeSectionConfirmed() {
  if (!sectionToRemove.value) return
  sections.value = sections.value.filter((s) => s.id !== sectionToRemove.value)
  sectionToRemove.value = null
}

function moveSectionUp(index: number) {
  if (index === 0) return
  const arr = [...sections.value]
  const tmp = arr[index - 1]!
  arr[index - 1] = arr[index]!
  arr[index] = tmp
  sections.value = arr
}

function moveSectionDown(index: number) {
  if (index === sections.value.length - 1) return
  const arr = [...sections.value]
  const tmp = arr[index + 1]!
  arr[index + 1] = arr[index]!
  arr[index] = tmp
  sections.value = arr
}

// ─── Data loading ────────────────────────────────────────────
async function loadSectionTypes() {
  try {
    const response = await settingsApi.getPostOrderSectionTypes()
    sectionTypes.value = response.items || []
  } catch {
    sectionTypes.value = []
  }
}

async function loadCommunities() {
  if (isEditMode.value) return
  try {
    const response = await communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    communities.value = response.communities || []
  } catch (err) {
    console.error('Failed to load communities:', err)
    communities.value = []
  }
}

// Posts that already have a non-archived Post Order are not selectable
const occupiedPostIds = ref<Set<number>>(new Set())

async function loadOccupiedPosts() {
  try {
    const response = await postOrderApi.getPostOrdersList({ limit: 100 }, { showLoading: false })
    occupiedPostIds.value = new Set((response.post_orders || []).filter((po: PostOrder) => po.status !== 'archived').map((po: PostOrder) => po.post_id))
  } catch (err) {
    console.error('Failed to load post orders for filtering:', err)
  }
}

async function loadPostsForCommunity() {
  if (!selectedCommunityId.value) {
    availablePosts.value = []
    return
  }
  isLoadingPosts.value = true
  selectedPostId.value = ''
  try {
    const firstResponse = await assetApi.getPostsList({
      community_id: selectedCommunityId.value,
      include_inactive: false,
      page: 0,
    }, { showLoading: false })
    const posts = [...(firstResponse.posts || [])]
    const pageCount = firstResponse.num_of_pages || 1
    if (pageCount > 1) {
      const remaining = await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) => assetApi.getPostsList({
        community_id: selectedCommunityId.value as number,
        include_inactive: false,
        page: index + 1,
      }, { showLoading: false })))
      remaining.forEach(response => posts.push(...(response.posts || [])))
    }
    availablePosts.value = posts.filter(p => !occupiedPostIds.value.has(p.post_id))
  } catch (err) {
    console.error('Failed to load posts:', err)
    formError.value = err instanceof Error ? err.message : 'Failed to load posts'
    availablePosts.value = []
  } finally {
    isLoadingPosts.value = false
  }
}

const historyEntries = ref<HistoryEntry[]>([])
const viewVersionDetail = ref<PostOrderVersionDetail | null>(null)
const isLoadingVersion = ref(false)

async function loadHistory() {
  try {
    const response = await postOrderApi.getVersionHistory(postOrderIdNum.value, { showLoading: false })
    historyEntries.value = (response.versions || [])
      .slice()
      .sort((a: PostOrderVersionSummary, b: PostOrderVersionSummary) => new Date(b.published_on).getTime() - new Date(a.published_on).getTime())
      .map((v: PostOrderVersionSummary) => ({
        versionId: v.version_id,
        version: v.version,
        versionType: v.version_type,
        publishedBy: v.published_by_name || '—',
        publishedAt: v.published_on,
        effectiveDate: v.effective_date,
        changeSummary: v.change_summary,
      }))
  } catch (err) {
    console.error('Failed to load version history:', err)
    historyEntries.value = []
  }
}

async function viewVersion(entry: HistoryEntry) {
  if (isLoadingVersion.value) return
  isLoadingVersion.value = true
  try {
    const response = await postOrderApi.getVersion(postOrderIdNum.value, entry.versionId, { showLoading: false })
    viewVersionDetail.value = response.version
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to load version')
  } finally {
    isLoadingVersion.value = false
  }
}

async function loadPostOrder() {
  if (!postOrderIdNum.value) return
  isLoadingDetail.value = true
  try {
    const [response] = await Promise.all([
      postOrderApi.getPostOrder(postOrderIdNum.value, { showLoading: false }),
      loadHistory(),
    ])
    const po = response.post_order
    if (!po) return
    postOrderDetail.value = po
    selectedPostId.value = po.post_id
    reviewDueDate.value = po.review_due_date || ''
    currentStatus.value = po.status
    currentVersion.value = po.version
    sections.value = (po.sections || []).map((s: PostOrderSection) => ({
      id: crypto.randomUUID(),
      type: s.section_type,
      title: s.title,
      description: s.description,
      clientVisible: s.client_visible,
      notes: s.notes || '',
      attachments: [],
      existingAttachments: (s.attachments || []).map((a: PostOrderAttachment) => ({ url: a.url })),
      inactiveType: !activeSectionTypes.value.some(st => st.type_id === s.section_type),
    }))
  } catch (err) {
    console.error('Failed to load post order:', err)
    toastStore.error(err instanceof Error ? err.message : 'Failed to load post order')
  } finally {
    isLoadingDetail.value = false
  }
}

const route = useRoute()

onMounted(async () => {
  await Promise.all([loadSectionTypes(), loadCommunities(), loadOccupiedPosts()])
  await loadPostOrder()
  if (!isEditMode.value && sections.value.length === 0) {
    sections.value = [newSection(activeSectionTypes.value[0])]
  }
  // Deep-link: /post-orders/{id}?publish=1 opens the publish modal right away
  if (isEditMode.value && route.query.publish === '1' && canPublish.value) {
    showPublishModal.value = true
  }
})

// ─── Save / Publish / Delete / Archive ───────────────────────
const saving = ref(false)
const publishing = ref(false)
const isDeleting = ref(false)
const isArchiving = ref(false)
const showPublishModal = ref(false)
const showDeleteModal = ref(false)
const showArchiveModal = ref(false)
const formError = ref('')

function validateSections(): string | null {
  if (!isEditMode.value && !selectedCommunityId.value) return t('post_orders.validation_community_required')
  if (!isEditMode.value && !selectedPostId.value) return t('post_orders.validation_post_required')
  if (!sections.value.length) return t('post_orders.validation_section_required')
  for (const s of sections.value) {
    if (!s.type || !s.title.trim()) return t('post_orders.validation_section_title')
    if (s.title.length > 80) return t('post_orders.validation_title_length')
  }
  return null
}

// Derive file_id from an existing attachment URL (e.g. .../files/n/{file_id})
function fileIdFromUrl(url: string): string | null {
  const tail = url.split('/').pop()
  return tail || null
}

async function buildSectionPayloads(): Promise<PostOrderSectionInput[]> {
  const payloads: PostOrderSectionInput[] = []
  for (let i = 0; i < sections.value.length; i++) {
    const s = sections.value[i]!
    const uploadedIds = await sectionRefs[i]?.uploadAttachments() ?? []
    const existingIds = s.existingAttachments
      .map(a => fileIdFromUrl(a.url))
      .filter((id): id is string => !!id)
    payloads.push({
      section_type: s.type,
      title: s.title.trim(),
      description: s.description,
      client_visible: s.clientVisible,
      notes: s.notes,
      attachment_file_ids: [...existingIds, ...uploadedIds],
    })
  }
  return payloads
}

async function saveAsDraft(): Promise<number | null> {
  const err = validateSections()
  if (err) { formError.value = err; return null }
  saving.value = true
  formError.value = ''
  try {
    const sectionPayloads = await buildSectionPayloads()
    if (isEditMode.value) {
      await postOrderApi.updatePostOrder({
        post_order_id: postOrderIdNum.value,
        review_due_date: reviewDueDate.value,
        sections: sectionPayloads,
      })
      toastStore.success(t('post_orders.save_success'))
      emit('saved', postOrderIdNum.value)
      return postOrderIdNum.value
    }
    const response = await postOrderApi.createPostOrder({
      post_id: selectedPostId.value as number,
      review_due_date: reviewDueDate.value || undefined,
      sections: sectionPayloads,
    })
    const newId = response.post_order_id
    toastStore.success(t('post_orders.save_success'))
    emit('saved', newId)
    return newId
  } catch (err) {
    formError.value = err instanceof Error ? err.message : t('post_orders.save_failed')
    return null
  } finally {
    saving.value = false
  }
}

async function handleSaveDraft() {
  const id = await saveAsDraft()
  if (id && !isEditMode.value) {
    navigateTo(`/post-orders/${id}`)
  }
}

async function publish() {
  const id = postOrderIdNum.value || await saveAsDraft()
  if (!id) return
  if (!isEditMode.value) {
    // Draft just created — go to the edit page and open the publish modal there
    navigateTo(`/post-orders/${id}?publish=1`)
    return
  }
  showPublishModal.value = true
}

async function handlePublishConfirm(payload: PublishPayload) {
  if (publishing.value) return
  publishing.value = true
  try {
    const response = await postOrderApi.publishPostOrder({
      post_order_id: postOrderIdNum.value,
      version_type: payload.versionType,
      change_summary: payload.changeSummary,
      effective_date: payload.effectiveDate || undefined,
      notify_officers: payload.notifyOfficers,
    })
    showPublishModal.value = false
    toastStore.success(t('post_orders.publish_success', { version: response.version ?? '' }))
    navigateTo('/post-orders')
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : t('post_orders.publish_failed'))
  } finally {
    publishing.value = false
  }
}

async function handleDeleteConfirm() {
  if (!postOrderIdNum.value || isDeleting.value) return
  isDeleting.value = true
  try {
    await postOrderApi.deletePostOrder(postOrderIdNum.value)
    showDeleteModal.value = false
    toastStore.success(t('post_orders.delete_success'))
    navigateTo('/post-orders')
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : t('post_orders.delete_failed'))
  } finally {
    isDeleting.value = false
  }
}

async function handleArchiveConfirm() {
  if (!postOrderIdNum.value || isArchiving.value) return
  isArchiving.value = true
  try {
    await postOrderApi.archivePostOrder(postOrderIdNum.value)
    showArchiveModal.value = false
    toastStore.success(t('post_orders.archive_success'))
    await loadPostOrder()
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : t('post_orders.archive_failed'))
  } finally {
    isArchiving.value = false
  }
}
</script>

<template>
  <div class="po-form">
    <!-- ── Header Info Card ─────────────────────────────────── -->
    <div class="form-card">
      <div class="form-card__header">
        <Icon name="lucide:file-text" :size="18" />
        <h3 class="form-card__title">{{ t('post_orders.form_header_title') }}</h3>
        <span class="form-card__hint">{{ t('post_orders.form_header_hint') }}</span>
      </div>

      <div class="header-grid">
        <!-- Community — selector in create mode, read-only in edit -->
        <div class="field">
          <label class="field__label">
            {{ t('post_orders.field_community') }}
            <span class="required">*</span>
          </label>
          <div v-if="isEditMode" class="field__readonly">{{ communityName }}</div>
          <select
            v-else
            v-model="selectedCommunityId"
            class="field__select"
            @change="loadPostsForCommunity"
          >
            <option value="" disabled>{{ t('post_orders.field_community_placeholder') }}</option>
            <option v-for="c in communities" :key="c.community_id" :value="c.community_id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <!-- Post — filtered by selected community -->
        <div class="field">
          <label class="field__label">
            {{ t('post_orders.field_post_name') }}
            <span class="required">*</span>
          </label>
          <div v-if="isEditMode" class="field__readonly">{{ postName || '—' }}</div>
          <select
            v-else
            v-model="selectedPostId"
            class="field__select"
            :disabled="!selectedCommunityId || isLoadingPosts"
          >
            <option value="" disabled>
              {{ !selectedCommunityId
                ? t('post_orders.field_post_select_community_first')
                : isLoadingPosts
                  ? t('post_orders.loading_posts')
                  : t('post_orders.field_post_placeholder') }}
            </option>
            <option v-for="post in availablePosts" :key="post.post_id" :value="post.post_id">
              {{ post.name }}
            </option>
          </select>
        </div>

        <!-- Auto-populated fields (read-only) -->
        <div class="field">
          <label class="field__label">{{ t('post_orders.field_order_id') }}</label>
          <div class="field__readonly">{{ displayId }}</div>
        </div>

        <div class="field">
          <label class="field__label">{{ t('post_orders.field_status') }}</label>
          <div class="field__readonly">
            <Badge type="postOrderStatus" :value="currentStatus" />
          </div>
        </div>

        <div class="field">
          <label class="field__label">{{ t('post_orders.field_version') }}</label>
          <div class="field__readonly">{{ currentVersion }}</div>
        </div>

        <div class="field">
          <label class="field__label">{{ t('post_orders.field_author') }}</label>
          <div class="field__readonly">{{ authorName }}</div>
        </div>

        <div v-if="isEditMode" class="field">
          <label class="field__label">{{ t('post_orders.field_creation_date') }}</label>
          <div class="field__readonly">{{ formatUtc(postOrderDetail?.created_on ?? null) }}</div>
        </div>

        <!-- Effective Date — read-only, set during publish -->
        <div class="field">
          <label class="field__label">{{ t('post_orders.field_effective_date') }}</label>
          <div class="field__readonly">{{ postOrderDetail?.effective_date || '—' }}</div>
        </div>

        <!-- Review Due Date — optional -->
        <div class="field">
          <label class="field__label">{{ t('post_orders.field_review_due') }}</label>
          <input v-model="reviewDueDate" type="date" class="field__input" :disabled="!canEdit" />
        </div>

        <div v-if="isEditMode" class="field">
          <label class="field__label">{{ t('post_orders.field_last_published') }}</label>
          <div class="field__readonly">
            {{ postOrderDetail?.last_published_on
              ? `${formatUtc(postOrderDetail.last_published_on)}${postOrderDetail.last_published_by_name ? ` — ${postOrderDetail.last_published_by_name}` : ''}`
              : '—' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Sections ─────────────────────────────────────────── -->
    <div v-if="isLoadingDetail" class="loading-state">
      <div class="spinner" />
    </div>

    <template v-else>
      <div
        v-for="(section, index) in sections"
        :key="section.id"
        class="section-wrapper"
        :class="{ 'section-wrapper--dragover': dragOverIndex === index && dragIndex !== index }"
        @dragover.prevent="dragOverIndex = index"
        @dragleave="dragOverIndex = null"
        @drop.prevent="onSectionDrop(index)"
      >
        <PostOrderSection
          :ref="(el) => setSectionRef(el, index)"
          :model-value="getSection(index)"
          @update:model-value="updateSection(index, $event)"
          :index="index"
          :total="sections.length"
          :section-types="isEditMode ? sectionTypes : activeSectionTypes"
          @move-up="moveSectionUp(index)"
          @move-down="moveSectionDown(index)"
          @remove="confirmRemoveSection(section.id)"
          @dragstart="dragIndex = index"
          @dragend="resetDrag"
        />
      </div>

      <!-- Add Section -->
      <div v-if="canEdit" class="add-section">
        <button class="add-section-btn" @click="showAddSectionMenu = !showAddSectionMenu">
          <Icon name="lucide:plus-circle" :size="18" />
          {{ t('post_orders.add_section') }}
        </button>
        <div v-if="showAddSectionMenu" class="add-section__menu">
          <button
            v-for="st in activeSectionTypes"
            :key="st.type_id"
            type="button"
            class="add-section__item"
            @click="addSection(st)"
          >
            {{ st.name }}
          </button>
          <div v-if="!activeSectionTypes.length" class="add-section__empty">
            {{ t('post_orders.no_section_types') }}
          </div>
        </div>
      </div>
    </template>

    <!-- ── Version History (edit mode) ─────────────────────── -->
    <PostOrderHistory v-if="isEditMode" :entries="historyEntries" @view="viewVersion" />

    <!-- ── Compliance & Acknowledgement (edit mode) ───────────── -->
    <PostOrderCompliance
      v-if="isEditMode"
      :acknowledged-pct="postOrderDetail?.acknowledged_pct ?? null"
      :acknowledgements="postOrderDetail?.acknowledgements ?? []"
    />

    <!-- ── Action Bar ────────────────────────────────────────── -->
    <div class="action-bar">
      <span v-if="formError" class="action-bar__error">{{ formError }}</span>
      <NuxtLink to="/post-orders" class="btn-secondary">
        <Icon name="lucide:arrow-left" :size="15" />
        {{ t('common.cancel') }}
      </NuxtLink>
      <div class="action-bar__right">
        <template v-if="isEditMode">
          <button
            v-if="canDelete"
            class="btn-danger"
            :disabled="isDeleting"
            @click="showDeleteModal = true"
          >
            <Icon name="lucide:trash-2" :size="15" />
            {{ isDeleting ? t('common.deleting') : t('post_orders.btn_delete') }}
          </button>
          <button
            v-if="canArchive"
            class="btn-warning"
            :disabled="isArchiving"
            @click="showArchiveModal = true"
          >
            <Icon name="lucide:archive" :size="15" />
            {{ isArchiving ? t('post_orders.btn_archiving') : t('post_orders.btn_archive') }}
          </button>
        </template>
        <template v-if="canEdit">
          <button class="btn-secondary" :disabled="saving || publishing || isDeleting || isArchiving" @click="handleSaveDraft">
            <Icon name="lucide:save" :size="15" />
            {{ saving ? t('common.saving') : t('post_orders.save_draft') }}
          </button>
          <button
            v-if="canPublish || !isEditMode"
            class="btn-primary"
            :disabled="saving || publishing || isDeleting || isArchiving || (!isEditMode && !selectedPostId)"
            @click="publish"
          >
            <Icon name="lucide:send" :size="15" />
            {{ publishing ? t('post_orders.btn_publishing') : isEditMode ? t('post_orders.publish_update') : t('post_orders.publish') }}
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- Publish Modal -->
  <PublishPostOrderModal
    :show="showPublishModal"
    :current-version="currentVersion"
    @close="showPublishModal = false"
    @confirm="handlePublishConfirm"
  />

  <!-- Remove section confirmation -->
  <AppModal
    :show="sectionToRemove !== null"
    :title="t('post_orders.remove_section_title')"
    :message="t('post_orders.remove_section_message')"
    :cancel-text="t('common.cancel')"
    :ok-text="t('common.remove')"
    @close="sectionToRemove = null"
    @cancel="sectionToRemove = null"
    @ok="removeSectionConfirmed"
  />

  <!-- Delete confirmation -->
  <AppModal
    :show="showDeleteModal"
    :title="t('post_orders.delete_title')"
    :message="t('post_orders.delete_message_editor')"
    :cancel-text="t('common.cancel')"
    :ok-text="t('common.delete')"
    @close="showDeleteModal = false"
    @cancel="showDeleteModal = false"
    @ok="handleDeleteConfirm"
  />

  <!-- Archive confirmation -->
  <AppModal
    :show="showArchiveModal"
    :title="t('post_orders.archive_title')"
    :message="t('post_orders.archive_message')"
    :cancel-text="t('common.cancel')"
    :ok-text="t('post_orders.btn_archive')"
    @close="showArchiveModal = false"
    @cancel="showArchiveModal = false"
    @ok="handleArchiveConfirm"
  />

  <!-- Version view modal -->
  <Teleport to="body">
    <div v-if="viewVersionDetail" class="version-modal__backdrop" @click.self="viewVersionDetail = null">
      <div class="version-modal">
        <div class="version-modal__header">
          <h3 class="version-modal__title">
            v{{ viewVersionDetail.version }} — {{ t(`post_orders.publish_version_${viewVersionDetail.version_type}`) }}
          </h3>
          <button class="version-modal__close" @click="viewVersionDetail = null">
            <Icon name="lucide:x" :size="18" />
          </button>
        </div>
        <div class="version-modal__meta">
          <span>{{ t('post_orders.history_col_published_by') }}: {{ viewVersionDetail.published_by_name || '—' }}</span>
          <span>{{ t('post_orders.history_col_published_at') }}: {{ formatUtc(viewVersionDetail.published_on) }}</span>
          <span>{{ t('post_orders.history_col_effective_date') }}: {{ viewVersionDetail.effective_date || '—' }}</span>
        </div>
        <div class="version-modal__body">
          <div v-for="s in viewVersionDetail.sections" :key="s.sort_order" class="version-section">
            <div class="version-section__header">
              <span class="version-section__type">{{ s.section_type }}</span>
              <h4 class="version-section__title">{{ s.title }}</h4>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="s.description" class="version-section__desc" v-html="renderMarkdown(s.description)" />
            <p v-if="s.notes" class="version-section__notes">{{ s.notes }}</p>
            <div v-if="s.attachments?.length" class="version-section__attachments">
              <a v-for="a in s.attachments" :key="a.attachment_id" :href="a.url" target="_blank" rel="noopener">
                <Icon name="lucide:paperclip" :size="12" /> {{ a.url.split('/').pop() }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.po-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 960px;
}

/* ── Card ──────────────────────────────────────────── */
.form-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.form-card__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.form-card__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* ── Grids ─────────────────────────────────────────── */
.header-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4) var(--space-5);
  padding: var(--space-5);
}

/* ── Fields ────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field--full {
  grid-column: 1 / -1;
}

.field__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.required {
  color: var(--color-critical);
  margin-left: 2px;
}

.field__input,
.field__select,
.field__textarea {
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}

.field__input:focus,
.field__select:focus,
.field__textarea:focus {
  border-color: var(--color-accent);
}

.field__textarea {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
  font-family: inherit;
}

.field__readonly {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.field__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
}

/* ── Section drag & drop ───────────────────────────── */
.section-wrapper {
  border: 2px dashed transparent;
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-base), background var(--transition-base);
}

.section-wrapper--dragover {
  border-color: var(--color-accent);
  background: rgba(59, 130, 246, 0.05);
}

/* ── Add Section ───────────────────────────────────── */
.add-section-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: var(--space-3) var(--space-5);
  background: transparent;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  transition: all var(--transition-base);
}

.add-section-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.add-section {
  position: relative;
  display: flex;
}

.add-section__menu {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  min-width: 240px;
  max-height: 280px;
  overflow-y: auto;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.add-section__item {
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  text-align: left;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-base);
}

.add-section__item:hover { background: var(--color-bg-elevated); }

.add-section__empty {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* ── Loading ───────────────────────────────────────── */
.loading-state {
  display: flex;
  justify-content: center;
  padding: var(--space-10);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.action-bar__error {
  flex: 1;
  color: var(--color-critical);
  font-size: var(--font-size-sm);
}

/* ── Version modal ─────────────────────────────────── */
.version-modal__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.version-modal {
  width: 640px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.version-modal__header {
  display: flex;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.version-modal__title {
  flex: 1;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.version-modal__close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.version-modal__meta {
  display: flex;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.version-modal__body {
  padding: var(--space-4) var(--space-5);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.version-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.version-section__type {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.version-section__title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.version-section__desc {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.version-section__desc :deep(p) { margin: 0 0 var(--space-2); }
.version-section__desc :deep(p:last-child) { margin-bottom: 0; }
.version-section__desc :deep(ul),
.version-section__desc :deep(ol) { margin: 0 0 var(--space-2); padding-left: var(--space-5); }
.version-section__desc :deep(a) { color: var(--color-accent); }

.version-section__notes {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.version-section__attachments a {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  margin-right: var(--space-3);
}

/* ── Action Bar ────────────────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  position: sticky;
  bottom: var(--space-4);
}

.action-bar__right {
  display: flex;
  gap: var(--space-3);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-5);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #0a0c10;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-base);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-4);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-danger:hover:not(:disabled) { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; }
.btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-warning {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-4);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: var(--radius-md);
  color: #f59e0b;
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-warning:hover:not(:disabled) { background: rgba(245, 158, 11, 0.2); border-color: #f59e0b; }
.btn-warning:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
