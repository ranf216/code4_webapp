import { ref } from 'vue'
import { dashboardApi } from '~/api/dashboard'
import type {
  DashboardScope,
  GetOverviewResponse,
  GetCallsStatisticsResponse,
  GetTasksSummaryResponse,
  GetReportsSummaryResponse,
} from '~/api/types/dashboard'

export type { DashboardScope }

export type DashboardDatePreset = 'today' | 'last_7_days' | 'last_30_days' | 'custom' | 'none'

export interface DashboardDateRange {
  preset: DashboardDatePreset
  /** YYYY-MM-DD or '' when preset resolves to no range. */
  fromDate: string
  toDate: string
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function presetToRange(preset: DashboardDatePreset): { fromDate: string; toDate: string } {
  const today = new Date()
  const to = formatDate(today)
  switch (preset) {
    case 'today':
      return { fromDate: to, toDate: to }
    case 'last_7_days': {
      const from = new Date(today)
      from.setDate(from.getDate() - 7)
      return { fromDate: formatDate(from), toDate: to }
    }
    case 'last_30_days': {
      const from = new Date(today)
      from.setDate(from.getDate() - 30)
      return { fromDate: formatDate(from), toDate: to }
    }
    default:
      return { fromDate: '', toDate: '' }
  }
}

/**
 * Shared dashboard state: global filters (community, date range, scope)
 * and data for all four read-only aggregation endpoints.
 *
 * Re-fetch rules (per spec §5.2):
 * - community change → all 4 endpoints
 * - date range change → calls statistics, tasks summary, reports summary
 * - scope change → tasks summary, reports summary
 */
export function useDashboard() {
  const communityId = ref<number>(0)
  const scope = ref<DashboardScope>('all')
  // Calls statistics always needs a range → default Last 30 Days.
  // Tasks/reports: send dates only when a preset/custom is selected.
  const dateRange = ref<DashboardDateRange>({ preset: 'last_30_days', ...presetToRange('last_30_days') })

  const overview = ref<GetOverviewResponse | null>(null)
  const callsStats = ref<GetCallsStatisticsResponse | null>(null)
  const tasksSummary = ref<GetTasksSummaryResponse | null>(null)
  const reportsSummary = ref<GetReportsSummaryResponse | null>(null)

  const overviewLoading = ref(false)
  const callsLoading = ref(false)
  const tasksLoading = ref(false)
  const reportsLoading = ref(false)

  const overviewUpdatedOn = ref<Date | null>(null)
  const autoRefreshSeconds = 60
  let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

  function dateParams() {
    const { fromDate, toDate } = dateRange.value
    return fromDate && toDate ? { from_date: fromDate, to_date: toDate } : {}
  }

  async function fetchOverview() {
    overviewLoading.value = true
    try {
      const res = await dashboardApi.getOverview(
        { community_id: communityId.value },
        { showLoading: false }
      )
      if (res.rc === 0) {
        overview.value = res as unknown as GetOverviewResponse
        overviewUpdatedOn.value = new Date()
      }
    } finally {
      overviewLoading.value = false
    }
  }

  async function fetchCallsStatistics() {
    callsLoading.value = true
    try {
      // Calls always uses a range — fall back to last 30 days when none selected.
      const dates = dateRange.value.fromDate && dateRange.value.toDate
        ? dateRange.value
        : presetToRange('last_30_days')
      const res = await dashboardApi.getCallsStatistics(
        {
          community_id: communityId.value,
          from_date: dates.fromDate,
          to_date: dates.toDate,
        },
        { showLoading: false }
      )
      if (res.rc === 0) callsStats.value = res as unknown as GetCallsStatisticsResponse
    } finally {
      callsLoading.value = false
    }
  }

  async function fetchTasksSummary() {
    tasksLoading.value = true
    try {
      const res = await dashboardApi.getTasksSummary(
        {
          community_id: communityId.value,
          scope: scope.value,
          ...dateParams(),
        },
        { showLoading: false }
      )
      if (res.rc === 0) tasksSummary.value = res as unknown as GetTasksSummaryResponse
    } finally {
      tasksLoading.value = false
    }
  }

  async function fetchReportsSummary() {
    reportsLoading.value = true
    try {
      const res = await dashboardApi.getReportsSummary(
        {
          community_id: communityId.value,
          scope: scope.value,
          ...dateParams(),
        },
        { showLoading: false }
      )
      if (res.rc === 0) reportsSummary.value = res as unknown as GetReportsSummaryResponse
    } finally {
      reportsLoading.value = false
    }
  }

  function fetchAll() {
    return Promise.all([
      fetchOverview(),
      fetchCallsStatistics(),
      fetchTasksSummary(),
      fetchReportsSummary(),
    ])
  }

  function setCommunity(id: number) {
    if (communityId.value === id) return
    communityId.value = id
    fetchAll()
  }

  function setDateRange(range: DashboardDateRange) {
    dateRange.value = range
    fetchCallsStatistics()
    fetchTasksSummary()
    fetchReportsSummary()
  }

  function setScope(value: DashboardScope) {
    if (scope.value === value) return
    scope.value = value
    fetchTasksSummary()
    fetchReportsSummary()
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    autoRefreshTimer = setInterval(fetchOverview, autoRefreshSeconds * 1000)
  }

  function stopAutoRefresh() {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }

  return {
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
  }
}
