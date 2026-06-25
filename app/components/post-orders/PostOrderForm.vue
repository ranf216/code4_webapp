<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { settingsApi } from '~/api/settings'
import type { PostOrderSectionTypeItem } from '~/api/settings'

interface Props {
  mode?: 'create' | 'edit'
  postOrderId?: string
  historyEntries?: import('~/components/post-orders/PostOrderHistory.vue').HistoryEntry[]
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  postOrderId: '',
})

const isEditMode = computed(() => props.mode === 'edit')

interface Section {
  id: string
  type: string
  title: string
  description: string
  clientVisible: boolean
  notes: string
  attachments: string[]
}

const { t } = useTranslation()

const SECTION_TYPE_FALLBACK = [
  { type_id: 'general', name: 'General Information', client_visible: true },
  { type_id: 'duties', name: 'Duties & Responsibilities', client_visible: true },
  { type_id: 'emergency', name: 'Emergency Procedures', client_visible: true },
  { type_id: 'access', name: 'Access Control Rules', client_visible: false },
  { type_id: 'patrol', name: 'Patrol Instructions', client_visible: false },
  { type_id: 'force', name: 'Use of Force & Legal Guidance', client_visible: false },
  { type_id: 'reporting', name: 'Reporting Requirements', client_visible: false },
  { type_id: 'equipment', name: 'Equipment & Uniform', client_visible: true },
  { type_id: 'comms', name: 'Communication Protocols', client_visible: false },
  { type_id: 'poi', name: 'Persons of Interest', client_visible: false },
  { type_id: 'client', name: 'Client-Specific Instructions', client_visible: true },
  { type_id: 'vendor', name: 'Vendor & Contractor Rules', client_visible: false },
]

const sectionTypes = ref<Pick<PostOrderSectionTypeItem, 'type_id' | 'name' | 'client_visible'>[]>([])

const DEMO_POSTS = [
  { id: 'P-001', name: 'Main Entrance Post', community: 'Sunset Gardens', site: 'Gate A' },
  { id: 'P-002', name: 'North Perimeter Patrol', community: 'Sunset Gardens', site: 'Perimeter' },
  { id: 'P-003', name: 'Parking Level 1 Patrol', community: 'Downtown Plaza', site: 'Parking' },
  { id: 'P-004', name: 'Front Desk Procedure', community: 'Oakwood Residences', site: 'Lobby' },
  { id: 'P-005', name: 'Marina Entry Control', community: 'Marina Towers', site: 'Main Entrance' },
]

// ─── Load section types + edit data ────────────────────────
onMounted(async () => {
  // Prefill from demo data in edit mode
  if (isEditMode.value && props.postOrderId) {
    const existing = DEMO_POST_ORDERS[props.postOrderId]
    if (existing) {
      selectedPostId.value = existing.postId
      effectiveDate.value = existing.effectiveDate
      reviewDueDate.value = existing.reviewDue
      currentStatus.value = existing.status
      currentVersion.value = existing.version
      sections.value = existing.sections
    }
  }
  try {
    const response = await settingsApi.getPostOrderSectionTypes()
    if (response.rc === 0 && response.items?.length) {
      sectionTypes.value = response.items
        .filter((item: PostOrderSectionTypeItem) => item.active)
        .map((item: PostOrderSectionTypeItem) => ({
          type_id: item.type_id,
          name: item.name,
          client_visible: item.client_visible,
        }))
    } else {
      sectionTypes.value = SECTION_TYPE_FALLBACK
    }
  } catch {
    sectionTypes.value = SECTION_TYPE_FALLBACK
  }
  // Set default section type to first available (create mode only)
  if (!isEditMode.value && sectionTypes.value.length > 0 && sections.value[0]) {
    const first = sectionTypes.value[0]
    if (first) {
      sections.value[0].type = first.name
      sections.value[0].title = first.name
      sections.value[0].clientVisible = first.client_visible
    }
  }
})

// ─── Demo data for edit mode ────────────────────────────────
const DEMO_POST_ORDERS: Record<string, {
  postId: string
  orderId: string
  status: 'draft' | 'published' | 'archived'
  version: string
  effectiveDate: string
  reviewDue: string
  sections: Section[]
}> = {
  'PO-001': {
    postId: 'P-001',
    orderId: 'PO-001',
    status: 'published',
    version: '1.2',
    effectiveDate: '2026-05-01',
    reviewDue: '2026-11-01',
    sections: [
      { id: crypto.randomUUID(), type: 'General Information', title: 'General Information', description: 'Officers must maintain a professional appearance at all times when on duty at the Main Entrance.', clientVisible: true, notes: 'Review monthly.', attachments: [] },
      { id: crypto.randomUUID(), type: 'Duties & Responsibilities', title: 'Duties & Responsibilities', description: 'Monitor all entry/exit points and log all incidents in the duty log.', clientVisible: true, notes: '', attachments: [] },
    ],
  },
  'PO-002': {
    postId: 'P-003',
    orderId: 'PO-002',
    status: 'draft',
    version: '1.0',
    effectiveDate: '2026-06-15',
    reviewDue: '',
    sections: [
      { id: crypto.randomUUID(), type: 'Patrol Instructions', title: 'Patrol Instructions', description: 'Patrol the parking level every 30 minutes during operating hours.', clientVisible: false, notes: '', attachments: [] },
    ],
  },
}

// ─── Header fields ───────────────────────────────────────────
const selectedPostId = ref('')
const reviewDueDate = ref('')
const effectiveDate = ref('')
const currentStatus = ref<'draft' | 'published' | 'archived'>('draft')
const currentVersion = ref('1.0')

const selectedPost = computed(() => DEMO_POSTS.find((p) => p.id === selectedPostId.value) ?? null)
const autoId = computed(() => {
  if (isEditMode.value && props.postOrderId) return props.postOrderId
  return selectedPostId.value ? `PO-${Date.now().toString().slice(-4)}` : '—'
})

// ─── Sections ────────────────────────────────────────────────
const sections = ref<Section[]>([
  {
    id: crypto.randomUUID(),
    type: 'General Information',
    title: 'General Information',
    description: '',
    clientVisible: true,
    notes: '',
    attachments: [],
  },
])

function addSection() {
  const first = sectionTypes.value[0]
  sections.value.push({
    id: crypto.randomUUID(),
    type: first?.name ?? 'General Information',
    title: first?.name ?? 'General Information',
    description: '',
    clientVisible: first?.client_visible ?? false,
    notes: '',
    attachments: [] as string[],
  })
}

function getSection(index: number) {
  return sections.value[index] ?? sections.value[0]!
}

function updateSection(index: number, value: typeof sections.value[0]) {
  sections.value[index] = value
}

function removeSection(id: string) {
  if (sections.value.length === 1) return
  sections.value = sections.value.filter((s) => s.id !== id)
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

function onSectionTypeChange(section: Section): void {
  section.title = section.type
  const matched = sectionTypes.value.find((st) => st.name === section.type)
  if (matched) section.clientVisible = matched.client_visible
}

// ─── Actions ─────────────────────────────────────────────────
const saving = ref(false)
const showPublishModal = ref(false)

async function saveAsDraft() {
  saving.value = true
  await new Promise((r) => setTimeout(r, 800))
  saving.value = false
  navigateTo('/post-orders')
}

function publish() {
  showPublishModal.value = true
}

function handlePublishConfirm(payload: { versionType: string; changeSummary: string; effectiveDate: string; notifyOfficers: boolean }) {
  showPublishModal.value = false
  navigateTo('/post-orders')
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
        <!-- Post selection — only editable field in header -->
        <div class="field field--full">
          <label class="field__label">
            {{ t('post_orders.field_post_name') }}
            <span class="required">*</span>
          </label>
          <select v-model="selectedPostId" class="field__select">
            <option value="">{{ t('post_orders.field_post_placeholder') }}</option>
            <option v-for="post in DEMO_POSTS" :key="post.id" :value="post.id">
              {{ post.name }} — {{ post.community }}
            </option>
          </select>
        </div>

        <!-- Auto-populated fields (read-only) -->
        <div class="field">
          <label class="field__label">{{ t('post_orders.field_order_id') }}</label>
          <div class="field__readonly">{{ autoId }}</div>
        </div>

        <div class="field">
          <label class="field__label">{{ t('post_orders.field_community') }}</label>
          <div class="field__readonly">{{ selectedPost?.community ?? '—' }}</div>
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
          <div class="field__readonly">{{ t('post_orders.field_author_current_user') }}</div>
        </div>

        <div class="field">
          <label class="field__label">{{ t('post_orders.field_creation_date') }}</label>
          <div class="field__readonly">{{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</div>
        </div>

        <!-- Effective Date — editable -->
        <div class="field">
          <label class="field__label">
            {{ t('post_orders.field_effective_date') }}
            <span class="required">*</span>
          </label>
          <input v-model="effectiveDate" type="date" class="field__input" />
        </div>

        <!-- Review Due Date — optional -->
        <div class="field">
          <label class="field__label">{{ t('post_orders.field_review_due') }}</label>
          <input v-model="reviewDueDate" type="date" class="field__input" />
        </div>
      </div>
    </div>

    <!-- ── Sections ─────────────────────────────────────────── -->
    <PostOrderSection
      v-for="(section, index) in sections"
      :key="section.id"
      :model-value="getSection(index)"
      @update:model-value="updateSection(index, $event)"
      :index="index"
      :total="sections.length"
      :section-types="sectionTypes"
      @move-up="moveSectionUp(index)"
      @move-down="moveSectionDown(index)"
      @remove="removeSection(section.id)"
    />

    <!-- Add Section -->
    <button class="add-section-btn" @click="addSection">
      <Icon name="lucide:plus-circle" :size="18" />
      {{ t('post_orders.add_section') }}
    </button>

    <!-- ── Version History (edit mode) ─────────────────────── -->
    <PostOrderHistory
      v-if="isEditMode"
      :entries="props.historyEntries ?? []"
    />

    <!-- ── Action Bar ────────────────────────────────────────── -->
    <div class="action-bar">
      <NuxtLink to="/post-orders" class="btn-secondary">
        {{ t('common.cancel') }}
      </NuxtLink>
      <div class="action-bar__right">
        <button class="btn-secondary" :disabled="saving" @click="saveAsDraft">
          <Icon name="lucide:save" :size="15" />
          {{ saving ? t('common.saving') : t('post_orders.save_draft') }}
        </button>
        <button v-if="currentStatus !== 'archived'" class="btn-primary" :disabled="!selectedPostId" @click="publish">
          <Icon name="lucide:send" :size="15" />
          {{ isEditMode ? t('post_orders.publish_update') : t('post_orders.publish') }}
        </button>
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
</style>
