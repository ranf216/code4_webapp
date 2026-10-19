// Dashboard API types — Dashboard/* endpoints (admin web portal, read-only)
// See: screen_design/API_Dashboard.md
// screen_design/Dashboard & Analytics API — App Developer Integration Guide.md

export type DashboardScope = 'all' | 'my'

export type DashboardCallCategory =
  | 'medical_emergency'
  | 'security_emergency'
  | 'concierge_service'
  | 'panic'
  | 'test'

export type DashboardCallStatus = 'new' | 'accepted' | 'resolved' | 'canceled'

export type DashboardTaskStatus =
  | 'new'
  | 'accepted'
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'canceled'

export type DashboardPriority = 'urgent' | 'important' | 'normal' | 'low'

// --- Entities ---

export interface DashboardRecentCall {
  call_id: number
  category: string
  service_type: string
  status: string
  priority: string
  description: string
  resident_name: string
  officer_name: string
  community_name: string
  created_on: string
}

export interface DashboardRecentTask {
  task_id: number
  title: string
  type: string
  status: string
  priority: string
  description: string
  creator_name: string
  assignee_name: string
  community_name: string
  created_on: string
}

export interface DashboardRecentReport {
  report_id: number
  title: string
  category: string
  status: string
  officer_name: string
  community_name: string
  created_on: string
}

// --- Requests ---

export interface GetOverviewRequest {
  '#request': 'Dashboard/get_overview'
  community_id?: number
}

export interface GetCallsStatisticsRequest {
  '#request': 'Dashboard/get_calls_statistics'
  community_id?: number
  /** YYYY-MM-DD — defaults to last 30 days when omitted. */
  from_date?: string
  /** YYYY-MM-DD — defaults to today when omitted. */
  to_date?: string
}

export interface GetTasksSummaryRequest {
  '#request': 'Dashboard/get_tasks_summary'
  community_id?: number
  scope?: DashboardScope
  /** YYYY-MM-DD — scope status/type breakdowns; omit for all-time. */
  from_date?: string
  /** YYYY-MM-DD */
  to_date?: string
}

export interface GetReportsSummaryRequest {
  '#request': 'Dashboard/get_reports_summary'
  community_id?: number
  scope?: DashboardScope
  /** YYYY-MM-DD — scope status breakdown; omit for all-time. */
  from_date?: string
  /** YYYY-MM-DD */
  to_date?: string
}

// --- Responses ---

export interface GetOverviewResponse {
  active_calls_count: number
  open_tasks_count: number
  open_reports_count: number
  active_communities_count: number
  active_officers_count: number
  recent_calls: DashboardRecentCall[]
  recent_tasks: DashboardRecentTask[]
  recent_reports: DashboardRecentReport[]
}

export interface GetCallsStatisticsResponse {
  total_calls: number
  emergency_calls_count: number
  medical_emergency_count: number
  security_emergency_count: number
  concierge_service_count: number
  panic_count: number
  test_count: number
  false_emergencies_count: number
  accidental_requests_count: number
  calls_by_status: Record<string, number>
  calls_by_category: Record<string, number>
  calls_by_priority: Record<string, number>
  avg_response_time_minutes: number | null
  avg_handling_time_minutes: number | null
  avg_handling_time_from_assignment_minutes: number | null
  recent_calls: DashboardRecentCall[]
  /** Effective range used — YYYY-MM-DD. */
  from_date: string
  to_date: string
}

export interface GetTasksSummaryResponse {
  open_tasks_count: number
  tasks_by_status: Record<string, number>
  tasks_by_type: Record<string, number>
  recent_tasks: DashboardRecentTask[]
  from_date?: string
  to_date?: string
}

export interface GetReportsSummaryResponse {
  open_reports_count: number
  total_reports_last_14_days: number
  reports_by_status: Record<string, number>
  recent_reports: DashboardRecentReport[]
  from_date?: string
  to_date?: string
}
