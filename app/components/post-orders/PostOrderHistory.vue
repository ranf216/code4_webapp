<script setup lang="ts">
import { ref } from 'vue'
import { useTranslation } from '~/composables/useI18n'

export interface HistoryEntry {
  version: string
  versionType: 'major' | 'minor'
  publishedBy: string
  publishedAt: string
  effectiveDate: string
  changeSummary: string
}

defineProps<{
  entries: HistoryEntry[]
}>()

const emit = defineEmits<{
  view: [entry: HistoryEntry]
}>()

const { t } = useTranslation()

const collapsed = ref(false)

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="history-card" :class="{ 'history-card--collapsed': collapsed }">
    <div class="history-card__header" @click="collapsed = !collapsed">
      <Icon name="lucide:history" :size="18" />
      <h3 class="history-card__title">{{ t('post_orders.history_title') }}</h3>
      <span class="history-card__count">{{ entries.length }} {{ t('post_orders.history_versions') }}</span>
      <button class="icon-btn" :title="collapsed ? 'Expand' : 'Collapse'" @click.stop="collapsed = !collapsed">
        <Icon :name="collapsed ? 'lucide:chevron-down' : 'lucide:chevron-up'" :size="15" />
      </button>
    </div>

    <div v-show="!collapsed" class="history-card__body">
      <div v-if="entries.length === 0" class="history-empty">
        <Icon name="lucide:inbox" :size="32" class="history-empty__icon" />
        <p>{{ t('post_orders.history_empty') }}</p>
      </div>

      <table v-else class="history-table">
        <thead>
          <tr>
            <th>{{ t('post_orders.history_col_version') }}</th>
            <th>{{ t('post_orders.history_col_type') }}</th>
            <th>{{ t('post_orders.history_col_published_by') }}</th>
            <th>{{ t('post_orders.history_col_published_at') }}</th>
            <th>{{ t('post_orders.history_col_effective_date') }}</th>
            <th>{{ t('post_orders.history_col_summary') }}</th>
            <th class="col-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.version" class="history-row">
            <td>
              <span class="version-badge">v{{ entry.version }}</span>
            </td>
            <td>
              <span
                class="type-badge"
                :class="entry.versionType === 'major' ? 'type-badge--major' : 'type-badge--minor'"
              >
                {{ entry.versionType === 'major' ? t('post_orders.publish_version_major') : t('post_orders.publish_version_minor') }}
              </span>
            </td>
            <td class="cell-text">{{ entry.publishedBy }}</td>
            <td class="cell-muted">{{ formatDateTime(entry.publishedAt) }}</td>
            <td class="cell-muted">{{ formatDate(entry.effectiveDate) }}</td>
            <td class="cell-summary">{{ entry.changeSummary }}</td>
            <td class="col-actions">
              <button class="view-btn" :title="t('common.view')" @click="emit('view', entry)">
                <Icon name="lucide:eye" :size="14" />
                {{ t('common.view') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.history-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.history-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  user-select: none;
}

.history-card--collapsed .history-card__header {
  border-bottom: none;
}

.history-card__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.history-card__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 2px var(--space-2);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.icon-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

/* ── Empty state ── */
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.history-empty__icon {
  opacity: 0.3;
}

/* ── Table ── */
.history-card__body {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.history-table thead tr {
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.history-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.history-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-base);
}

.history-table tbody tr:last-child {
  border-bottom: none;
}

.history-table tbody tr:hover {
  background: var(--color-bg-elevated);
}

.history-table td {
  padding: var(--space-3) var(--space-4);
  vertical-align: middle;
}

.col-actions {
  width: 80px;
  text-align: right;
}

/* ── Cells ── */
.version-badge {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.type-badge {
  display: inline-block;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.type-badge--minor {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.type-badge--major {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.cell-text {
  color: var(--color-text-primary);
}

.cell-muted {
  color: var(--color-text-muted);
  white-space: nowrap;
}

.cell-summary {
  color: var(--color-text-secondary);
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  height: 28px;
  padding: 0 var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.view-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
</style>
