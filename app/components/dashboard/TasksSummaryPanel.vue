<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import type { GetTasksSummaryResponse, DashboardScope } from '~/api/types/dashboard'
import { taskApi } from '~/api/task'
import { TASK_STATUS_COLORS, colorFor, humanizeKey, taskStatusSortWeight } from '~/utils/dashboard'
import type { DonutSegment } from './DonutChart.vue'
import type { BarItem } from './HorizontalBars.vue'

const props = defineProps<{
  summary: GetTasksSummaryResponse | null
  scope: DashboardScope
  loading?: boolean
}>()

const { t } = useTranslation()

const OPEN_STATUSES = new Set(['new', 'accepted', 'approved'])

// Task type display names from Task/get_task_metadata (DB-backed, dynamic — §3.2.3)
const taskTypeNames = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const res = await taskApi.getTaskMetadata()
    if (res.rc === 0) {
      taskTypeNames.value = (res as unknown as { task_types?: Record<string, string> }).task_types ?? {}
    }
  } catch {
    // fall back to humanized keys
  }
})

function taskTypeLabel(key: string): string {
  return taskTypeNames.value[key] ?? humanizeKey(key)
}

const statusSegments = computed<DonutSegment[]>(() => {
  const data = props.summary?.tasks_by_status ?? {}
  return Object.entries(data)
    .map(([key, value]) => ({
      key,
      label: `${OPEN_STATUSES.has(key) ? '● ' : ''}${humanizeKey(key)}`,
      value,
      color: colorFor(TASK_STATUS_COLORS, key),
    }))
    .sort((a, b) => taskStatusSortWeight(a.key) - taskStatusSortWeight(b.key))
})

const typeBars = computed<BarItem[]>(() => {
  const data = props.summary?.tasks_by_type ?? {}
  return Object.entries(data).map(([key, value]) => ({
    key,
    label: taskTypeLabel(key),
    value,
    color: '#0D6EFD',
  }))
})
</script>

<template>
  <section class="panel" :class="{ 'is-loading': loading && summary }">
    <div class="panel__header">
      <h2 class="panel__title">{{ t('dashboard.tasks_summary') }}</h2>
      <span class="panel__scope">
        {{ scope === 'my' ? t('dashboard.my_tasks') : t('dashboard.all_tasks') }}
      </span>
    </div>

    <div v-if="loading && !summary" class="panel__loading">
      <Icon name="lucide:loader-2" :size="24" class="spinner" />
    </div>

    <template v-else>
      <div class="metrics-bar">
        <div class="metric-tile metric-tile--accent">
          <span class="metric-tile__label">{{ t('dashboard.metric_open_tasks') }}</span>
          <span class="metric-tile__value">{{ summary?.open_tasks_count ?? 0 }}</span>
        </div>
      </div>

      <p v-if="summary?.from_date && summary?.to_date" class="panel__range-note">
        {{ t('dashboard.breakdown_filtered', { from: summary.from_date, to: summary.to_date }) }}
        <br>{{ t('dashboard.open_count_current_state') }}
      </p>

      <div class="panel__charts">
        <div class="chart-card">
          <h4 class="chart-card__title">
            {{ t('dashboard.chart_task_status') }}
            <span class="chart-card__hint">{{ t('dashboard.open_status_hint') }}</span>
          </h4>
          <div v-if="!statusSegments.length" class="chart-card__empty">
            {{ t('dashboard.no_tasks_period') }}
          </div>
          <DonutChart v-else :segments="statusSegments" />
        </div>
        <div class="chart-card">
          <h4 class="chart-card__title">{{ t('dashboard.chart_task_type') }}</h4>
          <div v-if="!typeBars.length" class="chart-card__empty">
            {{ t('dashboard.no_tasks_period') }}
          </div>
          <HorizontalBars v-else :items="typeBars" sort-desc />
        </div>
      </div>

      <RecentTasksFeed :items="(summary?.recent_tasks ?? []).slice(0, 5)" />
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

.panel__scope {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.panel__range-note {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.panel__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-6);
  color: var(--color-text-muted);
}

.metrics-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  max-width: 400px;
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

.metric-tile--accent .metric-tile__value { color: #FD7E14; }

.panel__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.chart-card__hint {
  margin-left: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 400;
  color: var(--color-text-muted);
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
