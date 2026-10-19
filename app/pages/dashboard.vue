<script setup lang="ts">
import { useTranslation } from '~/composables/useI18n'
import { useDashboard } from '~/composables/useDashboard'
import type { DashboardDateRange, DashboardScope } from '~/composables/useDashboard'

definePageMeta({ layout: 'default' })

const { t } = useTranslation()

const {
  communityId,
  scope,
  dateRange,
  overview,
  callsStats,
  tasksSummary,
  reportsSummary,
  overviewLoading,
  callsLoading,
  tasksLoading,
  reportsLoading,
  overviewUpdatedOn,
  fetchAll,
  fetchOverview,
  setCommunity,
  setDateRange,
  setScope,
  startAutoRefresh,
  stopAutoRefresh,
} = useDashboard()

function onScopeChange(value: string) {
  setScope(value as DashboardScope)
}

function onDateRangeChange(range: DashboardDateRange) {
  setDateRange(range)
}

onMounted(() => {
  fetchAll()
  startAutoRefresh()
})

onBeforeUnmount(stopAutoRefresh)
</script>

<template>
  <AppHeader
    :title="t('dashboard.page_title')"
    :breadcrumb="[{ label: 'Operate' }, { label: t('dashboard.page_title') }]"
  />
  <div class="dashboard-page">
    <DashboardControls
      :community-id="communityId"
      :scope="scope"
      :date-range="dateRange"
      @update:community="setCommunity"
      @update:scope="onScopeChange"
      @update:date-range="onDateRangeChange"
    />

    <DashboardOverview
      :overview="overview"
      :loading="overviewLoading"
      :updated-on="overviewUpdatedOn"
      @refresh="fetchOverview"
    />

    <CallsAnalyticsPanel :stats="callsStats" :loading="callsLoading" />
    <TasksSummaryPanel :summary="tasksSummary" :scope="scope" :loading="tasksLoading" />
    <ReportsSummaryPanel :summary="reportsSummary" :scope="scope" :loading="reportsLoading" />
  </div>
</template>

<style scoped>
.dashboard-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
