<script setup lang="ts">
import { useTranslation } from '~/composables/useI18n'
import { utcToLocal } from '~/utils/dateTime'
import { renderMarkdown } from '~/utils/markdown'
import type { PostOrderVersionDetail } from '~/api/types/postOrder'

interface Props {
  version: PostOrderVersionDetail | null
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useTranslation()

function formatUtc(utcDateStr: string | null): string {
  if (!utcDateStr) return '—'
  return utcToLocal(utcDateStr).format('MMM D, YYYY HH:mm')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="version" class="version-modal__backdrop" @click.self="emit('close')">
      <div class="version-modal">
        <div class="version-modal__header">
          <h3 class="version-modal__title">
            v{{ version.version }} — {{ t(`post_orders.publish_version_${version.version_type}`) }}
          </h3>
          <button class="version-modal__close" @click="emit('close')">
            <Icon name="lucide:x" :size="18" />
          </button>
        </div>
        <div class="version-modal__meta">
          <span>{{ t('post_orders.history_col_published_by') }}: {{ version.published_by_name || '—' }}</span>
          <span>{{ t('post_orders.history_col_published_at') }}: {{ formatUtc(version.published_on) }}</span>
          <span>{{ t('post_orders.history_col_effective_date') }}: {{ version.effective_date || '—' }}</span>
        </div>
        <div class="version-modal__body">
          <div v-for="s in version.sections" :key="s.sort_order" class="version-section">
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
</style>
