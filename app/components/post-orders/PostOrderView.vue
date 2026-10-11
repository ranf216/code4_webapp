<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { postOrderApi } from '~/api/postOrder'
import { useToastStore } from '~/stores/toast'
import { utcToLocal } from '~/utils/dateTime'
import { renderMarkdown } from '~/utils/markdown'
import PostOrderVersionModal from '~/components/post-orders/PostOrderVersionModal.vue'
import PostOrderHistory from '~/components/post-orders/PostOrderHistory.vue'
import PostOrderCompliance from '~/components/post-orders/PostOrderCompliance.vue'
import type { PostOrderDetail, PostOrderVersionSummary, PostOrderVersionDetail } from '~/api/types/postOrder'
import type { HistoryEntry } from '~/components/post-orders/PostOrderHistory.vue'

interface Props {
  postOrderId: string
}

const props = defineProps<Props>()

const { t } = useTranslation()
const toastStore = useToastStore()

const postOrderIdNum = computed(() => Number(props.postOrderId) || 0)

const isLoading = ref(true)
const loadError = ref('')
const detail = ref<PostOrderDetail | null>(null)
const historyEntries = ref<HistoryEntry[]>([])

const displayId = computed(() => (postOrderIdNum.value ? `PO-${postOrderIdNum.value}` : '—'))
const canEdit = computed(() => detail.value?.status !== 'archived')

const sortedSections = computed(() =>
  (detail.value?.sections ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
)

function formatUtc(utcDateStr: string | null): string {
  if (!utcDateStr) return '—'
  return utcToLocal(utcDateStr).format('MMM D, YYYY HH:mm')
}

// ─── Version view modal ──────────────────────────────────────
const viewVersionDetail = ref<PostOrderVersionDetail | null>(null)
const isLoadingVersion = ref(false)

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

// ─── Load ────────────────────────────────────────────────────
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
  } catch {
    historyEntries.value = []
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [response] = await Promise.all([
      postOrderApi.getPostOrder(postOrderIdNum.value, { showLoading: false }),
      loadHistory(),
    ])
    detail.value = response.post_order ?? null
    if (!detail.value) loadError.value = t('post_orders.view_not_found')
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Failed to load post order'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="po-view">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner" />
    </div>

    <div v-else-if="loadError" class="error-state">
      <Icon name="lucide:alert-circle" :size="28" />
      <p>{{ loadError }}</p>
      <NuxtLink to="/post-orders" class="btn-secondary">{{ t('common.back') }}</NuxtLink>
    </div>

    <template v-else-if="detail">
      <!-- ── Header Info Card (same field order as edit) ── -->
      <div class="form-card">
        <div class="form-card__header">
          <Icon name="lucide:file-text" :size="18" />
          <h3 class="form-card__title">{{ t('post_orders.view_header_title') }}</h3>
          <Badge type="postOrderStatus" :value="detail.status" />
        </div>

        <div class="header-grid">
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_community') }}</label>
            <span class="field__value">{{ detail.community_name }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_post_name') }}</label>
            <span class="field__value">{{ detail.post_name || '—' }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_order_id') }}</label>
            <span class="field__value">{{ displayId }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_status') }}</label>
            <Badge type="postOrderStatus" :value="detail.status" />
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_version') }}</label>
            <span class="field__value">{{ detail.version }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_author') }}</label>
            <span class="field__value">{{ detail.created_by_name || '—' }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_creation_date') }}</label>
            <span class="field__value">{{ formatUtc(detail.created_on) }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_effective_date') }}</label>
            <span class="field__value">{{ detail.effective_date || '—' }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_review_due') }}</label>
            <span class="field__value">{{ detail.review_due_date || '—' }}</span>
          </div>
          <div class="field">
            <label class="field__label">{{ t('post_orders.field_last_published') }}</label>
            <span class="field__value">
              {{ detail.last_published_on
                ? `${formatUtc(detail.last_published_on)}${detail.last_published_by_name ? ` — ${detail.last_published_by_name}` : ''}`
                : '—' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Sections (document view) ── -->
      <div v-if="!sortedSections.length" class="empty-sections">
        <Icon name="lucide:file-x" :size="20" />
        {{ t('post_orders.view_no_sections') }}
      </div>

      <div v-for="(section, index) in sortedSections" :key="section.section_id" class="section-card">
        <div class="section-card__header">
          <span class="section-card__number">{{ t('post_orders.section_label', { n: String(index + 1) }) }}</span>
          <span class="section-card__type">{{ section.section_type_name || section.section_type }}</span>
          <span v-if="section.client_visible" class="section-card__client-badge">
            <Icon name="lucide:eye" :size="12" />
            {{ t('post_orders.view_client_visible') }}
          </span>
        </div>
        <h4 class="section-card__title">{{ section.title }}</h4>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="section.description" class="section-card__desc" v-html="renderMarkdown(section.description)" />
        <p v-else class="section-card__empty">{{ t('post_orders.view_no_description') }}</p>
        <div v-if="section.notes" class="section-card__notes">
          <label class="field__label">{{ t('post_orders.field_notes') }}</label>
          <p>{{ section.notes }}</p>
        </div>
        <div v-if="section.attachments?.length" class="section-card__attachments">
          <label class="field__label">{{ t('post_orders.field_attachments') }}</label>
          <div class="section-card__attachment-list">
            <a v-for="a in section.attachments" :key="a.attachment_id" :href="a.url" target="_blank" rel="noopener" class="attachment-link">
              <Icon name="lucide:paperclip" :size="13" /> {{ a.url.split('/').pop() }}
            </a>
          </div>
        </div>
      </div>

      <!-- ── Version History ── -->
      <PostOrderHistory :entries="historyEntries" @view="viewVersion" />

      <!-- ── Compliance & Acknowledgement ── -->
      <PostOrderCompliance
        :acknowledged-pct="detail.acknowledged_pct ?? null"
        :acknowledgements="detail.acknowledgements ?? []"
      />

      <!-- ── Action Bar ── -->
      <div class="action-bar">
        <NuxtLink to="/post-orders" class="btn-secondary">
          <Icon name="lucide:arrow-left" :size="15" />
          {{ t('common.back') }}
        </NuxtLink>
        <NuxtLink v-if="canEdit" :to="`/post-orders/${postOrderIdNum}/edit`" class="btn-primary">
          <Icon name="lucide:pencil" :size="15" />
          {{ t('common.edit') }}
        </NuxtLink>
      </div>
    </template>

    <PostOrderVersionModal :version="viewVersionDetail" @close="viewVersionDetail = null" />
  </div>
</template>

<style scoped>
.po-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 960px;
  width: 100%;
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

/* ── Fields ────────────────────────────────────────── */
.header-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4) var(--space-5);
  padding: var(--space-5);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.field__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* ── Sections ──────────────────────────────────────── */
.section-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.section-card__number {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.section-card__type {
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  background: var(--color-accent-dim, rgba(229, 255, 68, 0.1));
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.section-card__client-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.section-card__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-card__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.section-card__desc :deep(p) { margin: 0 0 var(--space-2); }
.section-card__desc :deep(p:last-child) { margin-bottom: 0; }
.section-card__desc :deep(ul),
.section-card__desc :deep(ol) { margin: 0 0 var(--space-2); padding-left: var(--space-5); }
.section-card__desc :deep(a) { color: var(--color-accent); }
.section-card__desc :deep(img) { max-width: 100%; }

.section-card__empty {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
}

.section-card__notes {
  background: var(--color-bg-elevated);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.section-card__notes p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.section-card__attachments {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section-card__attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.attachment-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-decoration: none;
}
.attachment-link:hover { border-color: var(--color-accent); }

/* ── States ────────────────────────────────────────── */
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

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10);
  color: var(--color-text-muted);
}

.empty-sections {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
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
  text-decoration: none;
  transition: opacity var(--transition-base);
}
.btn-primary:hover { opacity: 0.9; }

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
.btn-secondary:hover {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}
</style>
