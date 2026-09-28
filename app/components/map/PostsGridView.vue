<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { assetApi } from '~/api/asset'
import { communityApi } from '~/api/community'
import { ApiError } from '~/api/base'
import { useToastStore } from '~/stores/toast'
import type { Community } from '~/api/community'
import type { Post as ApiPost, PostPriority } from '~/api/types/asset'
import type { PostFormData } from './AddPostModal.vue'

interface GridPost {
  id: string
  postId: number
  name: string
  description: string
  priority: string
  priorityKey: PostPriority
  shape: string
  equipment: string
  active: boolean
  createdBy: string
  createdOn: string
  lastUpdated: string
  permissions?: {
    required_roles?: string[]
    required_badges?: string[]
    required_equipment?: string[]
  } | null
  location: { lat?: number; lng?: number }
}

const router = useRouter()
const route = useRoute()
const { t } = useTranslation()
const toastStore = useToastStore()

const communities = ref<Community[]>([])
const selectedCommunityId = ref<string>('')
const posts = ref<GridPost[]>([])
const totalItems = ref(0)
const isLoading = ref(false)
const priorities = ref<string[]>(['Urgent', 'Important', 'Normal', 'Low'])

const limit = 20
const page = ref(1)
const sortBy = ref<'name' | 'priority' | 'created_on' | 'last_update'>('created_on')
const sortDir = ref<'asc' | 'desc'>('desc')
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearchQuery.value = value
    page.value = 1
  }, 300)
})

const statusFilter = ref<'active' | 'all'>('active')
const priorityFilter = ref<'all' | PostPriority>('all')

const selectedCommunity = computed(() => communities.value.find(c => String(c.community_id) === selectedCommunityId.value))
const filteredPosts = computed(() => {
  if (priorityFilter.value === 'all') return posts.value
  return posts.value.filter((p: GridPost) => p.priorityKey === priorityFilter.value)
})
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / limit)))

const sortableColumns = ['name', 'priority', 'created_on', 'last_update'] as const

function priorityApiKey(label: string): PostPriority {
  const map: Record<string, PostPriority> = {
    urgent: 'urgent',
    important: 'important',
    normal: 'normal',
    low: 'low',
  }
  const key = label.toLowerCase()
  return map[key] || 'normal'
}

function mapApiPost(post: ApiPost): GridPost {
  return {
    id: `PST-${post.post_id}`,
    postId: post.post_id,
    name: post.name,
    description: post.description || '',
    priority: post.priority.charAt(0).toUpperCase() + post.priority.slice(1),
    priorityKey: priorityApiKey(post.priority),
    shape: post.shape.charAt(0).toUpperCase() + post.shape.slice(1),
    equipment: post.equipment || '',
    active: post.is_active,
    createdBy: String(post.created_by_name || post.created_by),
    createdOn: post.created_on,
    lastUpdated: post.last_update || '',
    permissions: post.permissions,
    location: {
      lat: 'lat' in post.location ? Number(post.location.lat) : undefined,
      lng: 'lng' in post.location ? Number(post.location.lng) : undefined,
    },
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function truncate(value: string, max = 60): string {
  if (!value) return '—'
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}

async function loadCommunities() {
  try {
    const response = await communityApi.getCommunities({ include_inactive: false }, { showLoading: false })
    communities.value = response.communities || []
    if (communities.value.length && !selectedCommunityId.value) {
      const queryId = route.query.community_id
      if (typeof queryId === 'string' && communities.value.some(c => String(c.community_id) === queryId)) {
        selectedCommunityId.value = queryId
      } else if (communities.value[0]) {
        selectedCommunityId.value = String(communities.value[0].community_id)
      }
    }
  } catch (error) {
    console.error('Failed to load communities:', error)
    toastStore.error('Failed to load communities')
  }
}

async function loadPriorities() {
  try {
    const response = await assetApi.getAssetMetadata({ showLoading: false })
    const metadataPriorities = response.post_priorities || []
    if (metadataPriorities.length) {
      priorities.value = metadataPriorities.map((p: { name?: string; id: string }) => p.name || p.id)
    }
  } catch (error) {
    console.error('Failed to load priorities:', error)
  }
}

async function loadPosts() {
  const communityId = Number(selectedCommunityId.value)
  if (!communityId) return
  isLoading.value = true
  try {
    const response = await assetApi.getPostsList({
      community_id: communityId,
      include_inactive: statusFilter.value === 'all',
      search_text: debouncedSearchQuery.value.trim() || undefined,
      sort_by: sortBy.value,
      sort_dir: sortDir.value,
      page: page.value - 1,
    }, { showLoading: false })
    posts.value = (response.posts || []).map(mapApiPost)
    totalItems.value = response.num_of_items || posts.value.length
  } catch (error) {
    console.error('Failed to load posts:', error)
    toastStore.error('Failed to load posts')
  } finally {
    isLoading.value = false
  }
}

function toggleSort(column: typeof sortableColumns[number]) {
  if (sortBy.value === column) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortDir.value = 'asc'
  }
  page.value = 1
}

function sortIcon(column: typeof sortableColumns[number]): string {
  if (sortBy.value !== column) return 'lucide:chevrons-up-down'
  return sortDir.value === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'
}

function getPriorityClass(priority: string): string {
  const map: Record<string, string> = {
    urgent: 'priority-urgent',
    important: 'priority-important',
    normal: 'priority-normal',
    low: 'priority-low',
  }
  return map[priority.toLowerCase()] || 'priority-normal'
}

watch([selectedCommunityId, statusFilter, priorityFilter, debouncedSearchQuery, sortBy, sortDir, page], loadPosts, { immediate: true })

// Detail drawer
const selectedPost = ref<GridPost | null>(null)
const editingPost = ref<GridPost | null>(null)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const postToDelete = ref<GridPost | null>(null)
const showCannotDeletePostModal = ref(false)
const cannotDeletePostName = ref('')

function openDetail(post: GridPost) {
  selectedPost.value = post
}

function closeDetail() {
  selectedPost.value = null
}

function openEditFromDrawer(post: GridPost) {
  editingPost.value = post
  showEditModal.value = true
  selectedPost.value = null
}

const postSaveError = ref('')

function closeEditModal() {
  showEditModal.value = false
  editingPost.value = null
  postSaveError.value = ''
}

async function handleSavePost(data: PostFormData) {
  if (!editingPost.value) return
  postSaveError.value = ''
  try {
    await assetApi.updatePost({
      post_id: editingPost.value.postId,
      name: data.name,
      description: data.description || undefined,
      priority: data.priority.toLowerCase() as PostPriority,
      equipment: data.equipment || undefined,
      is_active: data.active,
      permissions: data.permissions,
    })
    toastStore.success('Post updated successfully')
    closeEditModal()
    await loadPosts()
  } catch (error) {
    if (error instanceof ApiError && error.rc === 753) {
      postSaveError.value = t('map.post_name_exists')
    } else {
      console.error('Failed to update post:', error)
      toastStore.error('Failed to update post')
    }
  }
}

async function togglePostActive(post: GridPost) {
  try {
    await assetApi.updatePost({
      post_id: post.postId,
      is_active: !post.active,
    })
    toastStore.success(post.active ? 'Post deactivated' : 'Post activated')
    await loadPosts()
    if (selectedPost.value?.postId === post.postId) {
      selectedPost.value = { ...selectedPost.value, active: !selectedPost.value.active }
    }
  } catch (error) {
    console.error('Failed to toggle post status:', error)
    toastStore.error('Failed to update post status')
  }
}

function confirmDelete(post: GridPost) {
  postToDelete.value = post
  showDeleteModal.value = true
  selectedPost.value = null
}

async function handleDelete() {
  if (!postToDelete.value) return
  try {
    await assetApi.deletePost(postToDelete.value.postId)
    toastStore.success('Post deleted successfully')
    showDeleteModal.value = false
    postToDelete.value = null
    await loadPosts()
  } catch (error) {
    if (error instanceof ApiError && error.rc === 759 && postToDelete.value) {
      showDeleteModal.value = false
      cannotDeletePostName.value = postToDelete.value.name
      showCannotDeletePostModal.value = true
      return
    }
    console.error('Failed to delete post:', error)
    toastStore.error('Failed to delete post')
  }
}

async function handleCannotDeleteDeactivate() {
  if (!postToDelete.value) return
  try {
    await assetApi.updatePost({ post_id: postToDelete.value.postId, is_active: false })
    showCannotDeletePostModal.value = false
    if (selectedPost.value?.postId === postToDelete.value.postId) {
      selectedPost.value = { ...selectedPost.value, active: false }
    }
    postToDelete.value = null
    cannotDeletePostName.value = ''
    toastStore.success('Post deactivated successfully')
    await loadPosts()
  } catch (error) {
    console.error('Failed to deactivate post:', error)
    toastStore.error('Failed to deactivate post')
  }
}

const editModalInitialData = computed<PostFormData | null>(() => {
  if (!editingPost.value) return null
  return {
    id: editingPost.value.id,
    name: editingPost.value.name,
    description: editingPost.value.description,
    priority: editingPost.value.priority,
    equipment: editingPost.value.equipment,
    active: editingPost.value.active,
    location: null,
    communityId: selectedCommunityId.value,
    shape: (['place', 'circle', 'line'].includes(editingPost.value.shape.toLowerCase())
      ? editingPost.value.shape.toLowerCase()
      : 'place') as 'place' | 'circle' | 'line',
    permissions: editingPost.value.permissions || undefined,
  }
})

onMounted(() => {
  loadCommunities()
  loadPriorities()
})
</script>

<template>
  <div class="posts-grid-view">
    <div class="grid-content">
    <!-- Filters -->
    <div class="posts-filters">
      <div class="filter-group">
        <label class="filter-label">{{ t('communities.community') }}</label>
        <select v-model="selectedCommunityId" class="filter-select">
          <option v-for="c in communities" :key="c.community_id" :value="String(c.community_id)">{{ c.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <AppSegmentedControl
          v-model="statusFilter"
          :options="[{ label: t('map.active_only'), value: 'active' }, { label: t('map.all'), value: 'all' }]"
          aria-label="Status filter"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('map.priority') }}</label>
        <select v-model="priorityFilter" class="filter-select">
          <option value="all">{{ t('map.all') }}</option>
          <option v-for="p in priorities" :key="p" :value="p.toLowerCase()">{{ p }}</option>
        </select>
      </div>

      <div class="filter-group search-group">
        <div class="search-box">
          <Icon name="lucide:search" :size="14" />
          <input v-model="searchQuery" type="text" :placeholder="t('common.search')" />
        </div>
      </div>

      <div class="filter-group view-actions">
        <AppButton :text="t('map.map_view')" type="secondary" icon="lucide:map" size="sm" @click="router.push('/map-management')" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="empty-state">
      <Icon name="lucide:loader-2" :size="24" class="spinner" />
      <span>Loading posts...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredPosts.length === 0" class="empty-state">
      <Icon name="lucide:inbox" :size="24" />
      <span>{{ t('map.no_posts') }}</span>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-id">{{ t('map.post_id') }}</th>
            <th class="col-name">{{ t('map.post_name') }}</th>
            <th class="col-priority">{{ t('map.priority') }}</th>
            <th class="col-shape">{{ t('map.shape') }}</th>
            <th class="col-equipment">{{ t('map.equipment') }}</th>
            <th class="col-status">{{ t('common.status') }}</th>
            <th class="col-date clickable" @click="toggleSort('created_on')">
              <span>{{ t('map.created') }}</span>
              <Icon :name="sortIcon('created_on')" :size="14" />
            </th>
            <th class="col-date clickable" @click="toggleSort('last_update')">
              <span>{{ t('map.last_update') }}</span>
              <Icon :name="sortIcon('last_update')" :size="14" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in filteredPosts"
            :key="post.id"
            class="post-row"
            @click="openDetail(post)"
          >
            <td class="col-id">
              <span class="post-id">{{ post.id }}</span>
            </td>
            <td class="col-name">
              <span class="post-name">{{ post.name }}</span>
            </td>
            <td class="col-priority">
              <span :class="['priority-badge', getPriorityClass(post.priorityKey)]">{{ post.priority }}</span>
            </td>
            <td class="col-shape">{{ post.shape }}</td>
            <td class="col-equipment" :title="post.equipment">{{ truncate(post.equipment) }}</td>
            <td class="col-status">
              <span :class="['status-badge', post.active ? 'status-active' : 'status-inactive']">{{ post.active ? t('common.active') : t('common.inactive') }}</span>
            </td>
            <td class="col-date">{{ formatDateTime(post.createdOn) }}</td>
            <td class="col-date">{{ formatDateTime(post.lastUpdated) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalItems > 0" class="pagination-bar">
      <div class="pagination-info">{{ totalItems }} {{ t('map.items_total') }}</div>
      <div class="pagination-controls">
        <button class="btn btn--ghost" :disabled="page <= 1" @click="page--">{{ t('common.previous') }}</button>
        <span class="pagination-page">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn--ghost" :disabled="page >= totalPages" @click="page++">{{ t('common.next') }}</button>
      </div>
    </div>
    </div>

    <!-- Detail drawer -->
    <PostDetailDrawer
      v-if="selectedPost"
      :post="{
        id: selectedPost.id,
        type: 'post',
        name: selectedPost.name,
        description: selectedPost.description,
        priority: selectedPost.priorityKey,
        equipment: selectedPost.equipment,
        active: selectedPost.active,
        location: { x: 50, y: 50, lat: selectedPost.location.lat, lng: selectedPost.location.lng },
        shape: selectedPost.shape.toLowerCase() as 'place' | 'circle' | 'line',
        permissions: selectedPost.permissions,
        createdBy: selectedPost.createdBy,
        createdOn: selectedPost.createdOn,
        lastUpdated: selectedPost.lastUpdated,
      }"
      @close="closeDetail"
      @edit="openEditFromDrawer(selectedPost)"
      @toggle="togglePostActive(selectedPost)"
      @delete="confirmDelete(selectedPost)"
    />

    <!-- Edit modal -->
    <AddPostModal
      :show="showEditModal"
      :initial-data="editModalInitialData"
      :priorities="priorities"
      :communities="communities"
      :community-id="selectedCommunityId"
      :server-error="postSaveError"
      @close="closeEditModal"
      @save="handleSavePost"
    />

    <!-- Delete confirmation -->
    <AppModal
      :show="showDeleteModal"
      :title="t('map.delete_item_title')"
      :message="t('map.delete_item_message', { name: postToDelete?.name || '' })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @ok="handleDelete"
    />

    <!-- Cannot delete post (used in shift scheduling) -->
    <AppModal
      :show="showCannotDeletePostModal"
      :title="t('map.cannot_delete_post_title')"
      :message="t('map.cannot_delete_post_message', { name: cannotDeletePostName })"
      :cancel-text="t('common.cancel')"
      :ok-text="t('map.deactivate_post')"
      @close="showCannotDeletePostModal = false"
      @cancel="showCannotDeletePostModal = false"
      @ok="handleCannotDeleteDeactivate"
    />
  </div>
</template>

<style scoped>
.posts-grid-view {
  display: flex;
  gap: var(--space-4);
  height: 100%;
  min-width: 0;
}

.grid-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Filters */
.posts-filters {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-select {
  height: 38px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  color: var(--color-text-base);
  font-size: var(--font-size-sm);
  min-width: 160px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 38px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  min-width: 240px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--color-text-base);
  font-size: var(--font-size-sm);
  width: 100%;
}

.view-actions {
  margin-left: auto;
}

/* Empty / Loading state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-12);
  color: var(--color-text-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  flex: 1;
}

.data-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  table-layout: fixed;
}

.data-table th {
  background: var(--color-surface);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table th.clickable {
  cursor: pointer;
  user-select: none;
}

.data-table th.clickable span {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.data-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: var(--color-surface);
  cursor: pointer;
}

/* Column widths */
.col-id { width: 90px; }
.col-name { width: 120px; }
.col-priority { width: 100px; }
.col-shape { width: 90px; }
.col-equipment { width: 140px; }
.col-status { width: 100px; }
.col-date { width: 175px; }

.post-id {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.post-name {
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Priority badges matching CallsList */
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: capitalize;
}

.priority-urgent {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.priority-important {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.priority-normal {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.priority-low {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

/* Status badges matching CallsList */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: capitalize;
}

.status-active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.col-equipment {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-shape,
.col-date {
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Pagination */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.pagination-page {
  font-size: var(--font-size-sm);
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--ghost {
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  color: var(--color-text-base);
}
</style>
