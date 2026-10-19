<script setup lang="ts">
import { useTranslation } from '~/composables/useI18n'
import type { DashboardRecentReport } from '~/api/types/dashboard'
import { REPORT_STATUS_COLORS, colorFor, reportStatusTextColor, relativeTime, fullDateTime, humanizeKey } from '~/utils/dashboard'

defineProps<{
  items: DashboardRecentReport[]
  loading?: boolean
}>()

const { t } = useTranslation()
const router = useRouter()

function goToReports() {
  router.push('/incident-reports')
}

function goToReport(id: number) {
  router.push(`/incident-reports/${id}`)
}
</script>

<template>
  <div class="feed">
    <div class="feed__header">
      <h3 class="feed__title">
        {{ t('dashboard.recent_reports') }}
        <span v-if="items.length" class="feed__badge">{{ items.length }}</span>
      </h3>
      <button type="button" class="feed__show-all" @click="goToReports">
        {{ t('dashboard.show_all') }}
      </button>
    </div>

    <div v-if="loading" class="feed__loading">
      <Icon name="lucide:loader-2" :size="20" class="spinner" />
    </div>
    <div v-else-if="!items.length" class="feed__empty">
      <Icon name="lucide:check-circle" :size="20" />
      <span>{{ t('dashboard.no_open_reports') }}</span>
    </div>
    <div v-else class="feed__list">
      <button
        v-for="report in items"
        :key="report.report_id"
        type="button"
        class="feed-item"
        @click="goToReport(report.report_id)"
      >
        <div class="feed-item__row">
          <span class="feed-item__title">{{ report.title }}</span>
          <span
            class="tag"
            :style="{ backgroundColor: colorFor(REPORT_STATUS_COLORS, report.status), color: reportStatusTextColor(report.status) }"
          >{{ humanizeKey(report.status) }}</span>
        </div>
        <p class="feed-item__desc">{{ humanizeKey(report.category) }}</p>
        <div class="feed-item__meta">
          <span v-if="report.officer_name">{{ t('dashboard.filed_by') }} {{ report.officer_name }}</span>
          <span>{{ report.community_name }}</span>
        </div>
        <span class="feed-item__time" :title="fullDateTime(report.created_on)">
          {{ relativeTime(report.created_on) }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.feed {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feed__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.feed__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.feed__badge {
  min-width: 20px;
  padding: 0 var(--space-1);
  border-radius: 10px;
  background: var(--color-accent);
  color: var(--color-bg-base);
  font-size: var(--font-size-xs);
  text-align: center;
}

.feed__show-all {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
}

.feed__show-all:hover {
  color: var(--color-accent);
}

.feed__loading,
.feed__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-6);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.feed__list {
  display: flex;
  flex-direction: column;
}

.feed-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  cursor: pointer;
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-item:hover {
  background: var(--color-bg-elevated);
}

.feed-item__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.feed-item__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.tag {
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 10px;
}

.feed-item__desc {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.feed-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.feed-item__meta span + span::before {
  content: '·';
  margin-right: var(--space-2);
}

.feed-item__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
