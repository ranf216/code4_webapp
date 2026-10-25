<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import type { DashboardRecentCall, GetCallsStatisticsResponse } from '~/api/types/dashboard'
import {
  CALL_CATEGORY_COLORS,
  CALL_STATUS_COLORS,
  PRIORITY_COLORS,
  callCategoryLabel,
  colorFor,
  humanizeKey,
  prioritySortWeight,
} from '~/utils/dashboard'
import type { DonutSegment } from './DonutChart.vue'
import type { BarItem } from './HorizontalBars.vue'

const props = defineProps<{
  stats: GetCallsStatisticsResponse | null
  loading?: boolean
}>()

const { t } = useTranslation()

const categoryFilter = ref<string | null>(null)

const metrics = computed(() => [
  { key: 'total', label: t('dashboard.metric_total_calls'), value: fmtNum(props.stats?.total_calls), accent: '' },
  { key: 'emergency', label: t('dashboard.metric_emergency_calls'), value: fmtNum(props.stats?.emergency_calls_count), accent: 'danger' },
  { key: 'response', label: t('dashboard.metric_avg_response'), value: fmtMinutes(props.stats?.avg_response_time_minutes), accent: '' },
  { key: 'handling', label: t('dashboard.metric_avg_handling'), value: fmtMinutes(props.stats?.avg_handling_time_minutes), accent: '' },
  { key: 'false', label: t('dashboard.metric_false_emergencies'), value: fmtNum(props.stats?.false_emergencies_count), accent: 'warning' },
  { key: 'accidental', label: t('dashboard.metric_accidental'), value: fmtNum(props.stats?.accidental_requests_count), accent: 'muted' },
])

function fmtNum(v: number | null | undefined): string {
  return v == null ? '0' : String(v)
}

function fmtMinutes(v: number | null | undefined): string {
  return v == null ? 'N/A' : `${v.toFixed(2)} min`
}

const categorySegments = computed<DonutSegment[]>(() => {
  const data = props.stats?.calls_by_category ?? {}
  return Object.entries(data).map(([key, value]) => ({
    key,
    label: humanizeKey(key),
    value,
    color: colorFor(CALL_CATEGORY_COLORS, key),
  }))
})

const statusSegments = computed<DonutSegment[]>(() => {
  const data = props.stats?.calls_by_status ?? {}
  return Object.entries(data).map(([key, value]) => ({
    key,
    label: humanizeKey(key),
    value,
    color: colorFor(CALL_STATUS_COLORS, key),
  }))
})

const priorityBars = computed<BarItem[]>(() => {
  const data = props.stats?.calls_by_priority ?? {}
  return Object.entries(data)
    .map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      value,
      color: colorFor(PRIORITY_COLORS, key),
    }))
    .sort((a, b) => prioritySortWeight(a.key) - prioritySortWeight(b.key))
})

const filteredRecentCalls = computed(() => {
  const calls = props.stats?.recent_calls ?? []
  const list = categoryFilter.value
    ? calls.filter((c: DashboardRecentCall) => c.category === categoryFilter.value)
    : calls
  return list.slice(0, 5)
})

function onCategorySelect(key: string) {
  categoryFilter.value = categoryFilter.value === key ? null : key
}
</script>

<template>
  <section class="panel" :class="{ 'is-loading': loading && stats }">
    <div class="panel__header">
      <h2 class="panel__title">{{ t('dashboard.calls_analytics') }}</h2>
      <span v-if="stats?.from_date && stats?.to_date" class="panel__range">
        {{ t('dashboard.showing_range', { from: stats.from_date, to: stats.to_date }) }}
      </span>
    </div>

    <div v-if="loading && !stats" class="panel__skeleton">
      <span class="skeleton-block skeleton-block--tile" />
      <span class="skeleton-block skeleton-block--tile" />
      <span class="skeleton-block skeleton-block--tile" />
      <span class="skeleton-block skeleton-block--wide" />
    </div>

    <template v-else>
      <!-- Metrics bar -->
      <div class="metrics-bar">
        <div
          v-for="m in metrics"
          :key="m.key"
          class="metric-tile"
          :class="`metric-tile--${m.accent}`"
        >
          <span class="metric-tile__label">{{ m.label }}</span>
          <span class="metric-tile__value">{{ m.value }}</span>
        </div>
      </div>

      <!-- Charts -->
      <div class="panel__charts">
        <div class="chart-card">
          <h4 class="chart-card__title">{{ t('dashboard.chart_call_category') }}</h4>
          <div v-if="!categorySegments.length" class="chart-card__empty">
            {{ t('dashboard.no_calls_period') }}
          </div>
          <DonutChart v-else :segments="categorySegments" :selected-key="categoryFilter" @select="onCategorySelect" />
        </div>
        <div class="chart-card">
          <h4 class="chart-card__title">{{ t('dashboard.chart_call_status') }}</h4>
          <div v-if="!statusSegments.length" class="chart-card__empty">
            {{ t('dashboard.no_calls_period') }}
          </div>
          <DonutChart v-else :segments="statusSegments" />
        </div>
        <div class="chart-card">
          <h4 class="chart-card__title">{{ t('dashboard.chart_call_priority') }}</h4>
          <div v-if="!priorityBars.length" class="chart-card__empty">
            {{ t('dashboard.no_calls_period') }}
          </div>
          <HorizontalBars v-else :items="priorityBars" />
        </div>
      </div>

      <div v-if="categoryFilter" class="filter-note">
        <span>{{ t('dashboard.filtered_by_category', { category: callCategoryLabel(categoryFilter) }) }}</span>
        <button type="button" class="filter-note__clear" @click="categoryFilter = null">
          {{ t('dashboard.clear_filter') }}
        </button>
      </div>
      <RecentCallsFeed :items="filteredRecentCalls" variant="compact" :total="stats?.total_calls" />
    </template>
  </section>
</template>

<style scoped>
.panel {
  position: relative;
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

.panel__range {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.filter-note {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.filter-note__clear {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  cursor: pointer;
  text-decoration: underline;
}

.panel__skeleton {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-3);
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

.metric-tile--danger .metric-tile__value { color: #DC3545; }
.metric-tile--warning .metric-tile__value { color: #E6A817; }
.metric-tile--muted .metric-tile__value { color: var(--color-text-muted); }

.panel__charts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

@media (max-width: 1199px) {
  .metrics-bar {
    grid-template-columns: repeat(3, 1fr);
  }
  .panel__charts {
    grid-template-columns: 1fr;
  }
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
