<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import type { GetReportsSummaryResponse, DashboardScope } from '~/api/types/dashboard'
import { REPORT_STATUS_COLORS, colorFor, humanizeKey, reportStatusSortWeight } from '~/utils/dashboard'
import type { BarItem } from './HorizontalBars.vue'

const props = defineProps<{
  summary: GetReportsSummaryResponse | null
  scope: DashboardScope
  loading?: boolean
}>()

const { t } = useTranslation()

const statusBars = computed<BarItem[]>(() => {
  const data = props.summary?.reports_by_status ?? {}
  const entries = Object.entries(data)
  entries.sort((a, b) => reportStatusSortWeight(a[0]) - reportStatusSortWeight(b[0]))
  return entries.map(([key, value]) => ({
    key,
    label: humanizeKey(key),
    value,
    color: colorFor(REPORT_STATUS_COLORS, key),
  }))
})
</script>

<template>
  <section class="panel" :class="{ 'is-loading': loading && summary }">
    <div class="panel__header">
      <h2 class="panel__title">{{ t('dashboard.reports_queue') }}</h2>
    </div>

    <div v-if="loading && !summary" class="panel__skeleton">
      <span class="skeleton-block skeleton-block--tile" />
      <span class="skeleton-block skeleton-block--tile" />
      <span class="skeleton-block skeleton-block--tile" />
      <span class="skeleton-block skeleton-block--wide" />
    </div>

    <template v-else>
      <div class="panel__summary">
        <div class="panel__metrics">
          <div class="metrics-bar">
            <div class="metric-tile metric-tile--accent">
              <span class="metric-tile__label">{{ t('dashboard.metric_open_reports') }}</span>
              <span class="metric-tile__value">{{ summary?.open_reports_count ?? 0 }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-tile__label">{{ t('dashboard.metric_last_14_days') }}</span>
              <span class="metric-tile__value">{{ summary?.total_reports_last_14_days ?? 0 }}</span>
              <span class="metric-tile__sub">{{ t('dashboard.reports_submitted') }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-tile__label">{{ t('dashboard.metric_scope') }}</span>
              <span class="metric-tile__value metric-tile__value--sm">
                {{ scope === 'my' ? t('dashboard.my_reviews') : t('dashboard.all_reports') }}
              </span>
            </div>
          </div>

          <p v-if="summary?.from_date && summary?.to_date" class="panel__range-note">
            {{ t('dashboard.report_breakdown_filtered', { from: summary.from_date, to: summary.to_date }) }}
            <br>{{ t('dashboard.report_counts_current_state') }}
          </p>
        </div>

        <div class="panel__charts">
          <div class="chart-card">
            <h4 class="chart-card__title">{{ t('dashboard.chart_report_status') }}</h4>
            <div v-if="!statusBars.length" class="chart-card__empty">
              {{ t('dashboard.no_reports_period') }}
            </div>
            <HorizontalBars v-else :items="statusBars" />
          </div>
        </div>
      </div>

      <RecentReportsFeed :items="(summary?.recent_reports ?? []).slice(0, 5)" variant="compact" :total="summary?.open_reports_count" />
    </template>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.is-loading {
  opacity: 0.55;
  pointer-events: none;
}

.panel__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.panel__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.panel__range-note {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.panel__skeleton {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.skeleton-block {
  display: block;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-surface, var(--color-bg-elevated)) 50%, var(--color-bg-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

.skeleton-block--tile { height: 80px; }
.skeleton-block--wide { grid-column: 1 / -1; height: 220px; }

@keyframes shimmer {
  to { background-position: -200% 0; }
}

.metrics-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  min-width: 0;
}

.metric-tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  min-height: 80px;
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.metric-tile__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-tile__value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.metric-tile__sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.metric-tile--accent .metric-tile__value { color: #0DCAF0; }

.metric-tile__value--sm {
  font-size: var(--font-size-lg);
}

.panel__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: var(--space-4);
}

.panel__metrics {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}

@media (max-width: 1199px) {
  .panel__summary {
    grid-template-columns: 1fr;
  }
}

.panel__charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.chart-card {
  padding: var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 0;
}

.chart-card__title {
  margin: 0 0 var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
