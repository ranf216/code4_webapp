<script setup lang="ts">
interface PostDetail {
  id: string
  type: 'post'
  name: string
  description: string
  priority: string
  equipment: string
  active: boolean
  location: { x: number; y: number; lat?: number; lng?: number }
  shape: 'place' | 'circle' | 'line'
  permissions?: {
    required_roles?: string[]
    required_badges?: string[]
    required_equipment?: string[]
  } | null
  createdBy?: string
  createdOn?: string
  lastUpdated?: string
}

const props = defineProps<{
  post: PostDetail
}>()

const emit = defineEmits<{
  close: []
  edit: [post: PostDetail]
  delete: [post: PostDetail]
  toggle: [post: PostDetail]
}>()

const priorityKey = computed(() => props.post.priority.toLowerCase())

const priorityMeta = computed(() => {
  const map: Record<string, { color: string; icon: string }> = {
    urgent: { color: '#DC3545', icon: 'lucide:alert-circle' },
    important: { color: '#FD7E14', icon: 'lucide:arrow-up' },
    normal: { color: '#0D6EFD', icon: 'lucide:minus' },
    low: { color: '#6C757D', icon: 'lucide:arrow-down' },
  }
  return map[priorityKey.value] || { color: '#6C757D', icon: 'lucide:shield' }
})

const priorityColor = computed(() => priorityMeta.value.color)
const priorityIcon = computed(() => priorityMeta.value.icon)

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

const coordinates = computed(() => props.post.location.lat != null && props.post.location.lng != null
  ? `${props.post.location.lat.toFixed(6)}, ${props.post.location.lng.toFixed(6)}`
  : '—')

const permissionGroups = computed(() => [
  { label: 'Roles', values: props.post.permissions?.required_roles || [] },
  { label: 'Badges', values: props.post.permissions?.required_badges || [] },
  { label: 'Equipment', values: props.post.permissions?.required_equipment || [] },
])
const hasRequirements = computed(() => permissionGroups.value.some(group => group.values.length))
const miniMapMarkers = computed(() => props.post.location.lat != null && props.post.location.lng != null ? [{
  id: props.post.id,
  lat: props.post.location.lat,
  lng: props.post.location.lng,
  type: 'post' as const,
  label: props.post.name,
  color: priorityColor.value,
  active: props.post.active,
}] : [])
</script>

<template>
  <aside class="post-detail-drawer">
    <div class="drawer-header">
      <div class="drawer-title-group">
        <div class="drawer-icon" :style="{ color: priorityColor, backgroundColor: `${priorityColor}22` }">
          <Icon :name="priorityIcon" :size="20" />
        </div>
        <div class="drawer-heading">
          <h3 class="drawer-title">{{ post.name }}</h3>
          <div class="drawer-badges">
            <span class="priority-badge" :style="{ color: priorityColor, borderColor: `${priorityColor}66`, backgroundColor: `${priorityColor}22` }">
              <Icon :name="priorityIcon" :size="12" />
              {{ post.priority }}
            </span>
            <Badge type="status" :value="post.active ? 'active' : 'inactive'" />
          </div>
        </div>
      </div>
      <button class="drawer-close" @click="emit('close')">
        <Icon name="lucide:x" :size="16" />
      </button>
    </div>

    <div class="drawer-section">
      <h4 class="section-title">Location</h4>
      <div v-if="miniMapMarkers.length" class="mini-map">
        <GoogleMap
          :center="{ lat: post.location.lat!, lng: post.location.lng! }"
          :zoom="17"
          :workspace-markers="miniMapMarkers"
          height="120px"
        />
      </div>
      <div class="location-coords mono">{{ coordinates }}</div>
    </div>

    <div class="drawer-section">
      <h4 class="section-title">Details</h4>
      <div class="detail-rows">
        <div class="detail-row"><span class="detail-label">Post ID</span><span class="detail-value mono">{{ post.id }}</span></div>
        <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">{{ post.description || 'No description' }}</span></div>
        <div class="detail-row"><span class="detail-label">Shape</span><span class="detail-value">{{ post.shape }}</span></div>
        <div class="detail-row"><span class="detail-label">Equipment</span><span class="detail-value">{{ post.equipment || 'None specified' }}</span></div>
      </div>
    </div>

    <div class="drawer-section">
      <h4 class="section-title">Eligibility Requirements</h4>
      <p v-if="!hasRequirements" class="empty-requirements">Open to all officers.</p>
      <div v-else class="requirements">
        <div v-for="group in permissionGroups" :key="group.label" class="requirement-group">
          <span class="detail-label">{{ group.label }}</span>
          <div v-if="group.values.length" class="requirement-tags">
            <span v-for="value in group.values" :key="value" class="requirement-tag">{{ value }}</span>
          </div>
          <span v-else class="detail-value">None</span>
        </div>
      </div>
    </div>

    <div class="drawer-section">
      <h4 class="section-title">Lifecycle</h4>
      <div class="detail-rows">
        <div class="detail-row"><span class="detail-label">Created by</span><span class="detail-value">{{ post.createdBy || '—' }}</span></div>
        <div class="detail-row"><span class="detail-label">Created on</span><span class="detail-value">{{ formatDate(post.createdOn) }}</span></div>
        <div class="detail-row"><span class="detail-label">Last update</span><span class="detail-value">{{ post.lastUpdated ? formatDate(post.lastUpdated) : '—' }}</span></div>
      </div>
    </div>

    <div class="drawer-actions">
      <AppButton text="Edit" type="secondary" icon="lucide:pencil" size="sm" @click="emit('edit', post)" />
      <AppButton :text="post.active ? 'Deactivate' : 'Activate'" type="secondary" icon="lucide:power" size="sm" @click="emit('toggle', post)" />
      <AppButton text="Delete" type="danger" icon="lucide:trash-2" size="sm" @click="emit('delete', post)" />
    </div>
  </aside>
</template>

<style scoped>
.post-detail-drawer {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  overflow-y: auto;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.drawer-header, .drawer-title-group, .drawer-badges, .drawer-actions { display: flex; align-items: center; }
.drawer-header { justify-content: space-between; gap: var(--space-3); }
.drawer-title-group { gap: var(--space-3); min-width: 0; }
.drawer-heading { min-width: 0; }
.drawer-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); flex-shrink: 0; }
.drawer-title { margin: 0 0 var(--space-1); overflow: hidden; color: var(--color-text-primary); font-size: var(--font-size-lg); text-overflow: ellipsis; white-space: nowrap; }
.drawer-badges { gap: var(--space-2); }
.priority-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px var(--space-2); border: 1px solid; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 700; text-transform: uppercase; }
.drawer-close { display: flex; padding: var(--space-1); color: var(--color-text-muted); background: none; border: 0; cursor: pointer; }
.drawer-section { display: flex; flex-direction: column; gap: var(--space-2); }
.section-title { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-xs); font-weight: 600; letter-spacing: .05em; text-transform: uppercase; }
.mini-map { position: relative; height: 120px; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.location-coords, .empty-requirements { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-xs); }
.detail-rows, .requirements { display: flex; flex-direction: column; }
.detail-row, .requirement-group { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
.detail-row:last-child, .requirement-group:last-child { border-bottom: 0; }
.detail-label { flex-shrink: 0; color: var(--color-text-muted); font-size: var(--font-size-xs); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
.detail-value { color: var(--color-text-primary); font-size: var(--font-size-sm); text-align: right; }
.requirement-tags { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: var(--space-1); }
.requirement-tag { padding: 2px var(--space-2); color: var(--color-text-primary); background: var(--color-bg-overlay); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: var(--font-size-xs); }
.drawer-actions { justify-content: flex-end; flex-wrap: wrap; gap: var(--space-2); margin-top: auto; padding-top: var(--space-3); border-top: 1px solid var(--color-border); }
.mono { font-family: monospace; }
</style>
