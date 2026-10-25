import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetOverviewRequest,
  GetOverviewResponse,
  GetCallsStatisticsRequest,
  GetCallsStatisticsResponse,
  GetTasksSummaryRequest,
  GetTasksSummaryResponse,
  GetReportsSummaryRequest,
  GetReportsSummaryResponse,
} from './types/dashboard'

/**
 * Dashboard API client — read-only aggregation endpoints for the
 * admin homepage and analytics panels. Admin tokens only.
 */
class DashboardApi extends BaseApiClient {
  /**
   * Aggregate KPI counters and recent open items across calls, tasks,
   * reports, communities, and officers. Pass community_id to scope,
   * or omit it for all communities visible to the admin.
   */
  async getOverview(
    params: Omit<GetOverviewRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetOverviewResponse>> {
    return this.request<GetOverviewResponse>(
      {
        '#request': 'Dashboard/get_overview',
        ...params,
      },
      options
    )
  }

  /**
   * Call volume analytics: category/status/priority breakdowns, average
   * response and handling times, and canceled-call metrics. Date range
   * defaults to the last 30 days; recent_calls always shows currently
   * open calls regardless of the date filter.
   */
  async getCallsStatistics(
    params: Omit<GetCallsStatisticsRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetCallsStatisticsResponse>> {
    return this.request<GetCallsStatisticsResponse>(
      {
        '#request': 'Dashboard/get_calls_statistics',
        ...params,
      },
      options
    )
  }

  /**
   * Task distribution analytics: open count, status/type breakdowns,
   * and a priority-sorted feed of recent open tasks. Use scope='my'
   * to limit results to tasks assigned to the authenticated admin.
   */
  async getTasksSummary(
    params: Omit<GetTasksSummaryRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTasksSummaryResponse>> {
    return this.request<GetTasksSummaryResponse>(
      {
        '#request': 'Dashboard/get_tasks_summary',
        ...params,
      },
      options
    )
  }

  /**
   * Incident report queue metrics: open count, 14-day volume, status
   * breakdown, and recent open reports. Use scope='my' to limit results
   * to reports where the authenticated admin is the assigned reviewer.
   */
  async getReportsSummary(
    params: Omit<GetReportsSummaryRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetReportsSummaryResponse>> {
    return this.request<GetReportsSummaryResponse>(
      {
        '#request': 'Dashboard/get_reports_summary',
        ...params,
      },
      options
    )
  }
}

export const dashboardApi = new DashboardApi()
export default dashboardApi
