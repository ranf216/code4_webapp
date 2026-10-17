// Report API types — Report/* endpoints (admin web portal)
// See: screen_design/Api_Report.md
// Officer-only (create_report, submit_report) and Resident-only
// (get_report_for_client) endpoints are intentionally not included here.

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'delivered'

export type ReportCategory = 'incident' | 'daily_activity' | 'custom'

export type ReportFieldType =
  | 'text'
  | 'date'
  | 'location'
  | 'dropdown'
  | 'file_upload'
  | 'digital_signature'

export type ReportHistoryAction =
  | 'created'
  | 'updated'
  | 'submitted'
  | 'auto_approved'
  | 'review_started'
  | 'review_released'
  | 'changes_requested'
  | 'approved'
  | 'delivered'
  | 'pdf_regenerated'

// --- Field values ---

export interface ReportLocationValue {
  address?: string
  latitude?: number
  longitude?: number
}

export interface ReportFileValue {
  attachment_ids?: number[]
  file_ids?: string[]
}

// Value sent/received per field. Depends on field_type:
// text → string, date → 'YYYY-MM-DD', location → object | string,
// dropdown → string | string[], file/signature → ReportFileValue (sent) /
// null + attachments (returned). null/'' clears a value.
export type ReportFieldValue =
  | string
  | string[]
  | ReportLocationValue
  | ReportFileValue
  | null

export interface ReportFieldConfig {
  max_chars?: number
  dropdown_values?: string[]
  is_multi_select?: boolean
  max_files?: number
}

export interface ReportAttachment {
  attachment_id: number
  url: string
  file_name?: string
}

export interface ReportField {
  field_id: number
  field_key: string
  label: string
  field_type: ReportFieldType
  value: ReportFieldValue
  attachments?: ReportAttachment[]
  description?: string | null
  config?: ReportFieldConfig | null
  is_system_field: boolean
  is_required: boolean
  is_auto_populated: boolean
  is_locked: boolean
  /** Admin only — officer's last submitted value, for manager-edit comparison. */
  submitted_value?: ReportFieldValue
}

export interface ReportSection {
  report_section_id: number
  section_id: number
  title: string
  sort_order: number
  is_required: boolean
  client_included: boolean
  /** Admin only. */
  manager_notes?: string | null
  fields: ReportField[]
}

// Section payload for update_report (patch semantics — only sent
// sections/fields are changed).
export interface ReportSectionInput {
  report_section_id: number
  values?: Record<string, ReportFieldValue>
  /** Admin only, max 2000 chars. */
  manager_notes?: string
  /** Admin only — include section in the client report. */
  client_included?: boolean
}

export interface ReportReviewLock {
  is_locked: boolean
  locked_by: string | null
  locked_by_name: string | null
  expires_on: string | null
}

export interface ReportHistoryChange {
  report_section_id?: number
  section_title?: string
  field_id?: number | null
  label?: string
  old_value?: unknown
  new_value?: unknown
  attachments_added?: string[]
  attachments_removed?: { attachment_id: number; file_name: string }[]
}

export interface ReportHistoryEntry {
  history_id: number
  action: ReportHistoryAction
  action_name: string
  from_status: ReportStatus | null
  to_status: ReportStatus | null
  user_id: string | null
  user_name: string | null
  comment: string | null
  changes: ReportHistoryChange[] | Record<string, unknown> | null
  created_on: string
}

// --- Entities ---

export interface ReportListItem {
  report_id: number
  title: string
  community_id: number
  community_name: string
  category: ReportCategory
  category_name: string
  call_id: number | null
  created_on: string
  delivered_on: string | null
  /** Admin only — review state. */
  reviewer_user_id?: string | null
  reviewer_name?: string | null
  review_started_on?: string | null
  review_lock?: ReportReviewLock
  template_id: number
  template_name: string
  status: ReportStatus
  status_name: string
  officer_user_id: string
  officer_name: string
  review_required: boolean
  submitted_on: string | null
  last_update: string | null
}

export interface Report extends ReportListItem {
  poi_id: number | null
  client_user_id: string | null
  client_name: string | null
  allow_officer_editing: boolean
  changes_comment: string | null
  management_summary: string | null
  approved_on: string | null
  approved_by_name: string | null
  delivered_by_name: string | null
  pdf_url: string | null
  can_edit: boolean
  sections: ReportSection[]
  /** Admin only. */
  history?: ReportHistoryEntry[]
}

// --- Requests ---

export interface GetReportsListRequest {
  '#request': 'Report/get_reports_list'
  community_ids?: number[]
  officer_user_ids?: string[]
  statuses?: ReportStatus[]
  category?: ReportCategory
  review_required?: boolean
  call_id?: number
  /** YYYY-MM-DD — admin: submitted date. */
  from_date?: string
  /** YYYY-MM-DD (inclusive). */
  to_date?: string
  search_text?: string
  sort_by?: 'submitted_on' | 'created_on' | 'status' | 'title' | 'report_id'
  sort_dir?: 'asc' | 'desc'
  /** 0-based page. */
  page?: number
}

export interface GetReportRequest {
  '#request': 'Report/get_report'
  report_id: number
}

export interface GetReportMetadataRequest {
  '#request': 'Report/get_report_metadata'
}

export interface GetReportHistoryRequest {
  '#request': 'Report/get_report_history'
  report_id: number
}

export interface UpdateReportRequest {
  '#request': 'Report/update_report'
  report_id: number
  sections: ReportSectionInput[]
}

export interface StartReviewRequest {
  '#request': 'Report/start_review'
  report_id: number
}

export interface ReleaseReviewRequest {
  '#request': 'Report/release_review'
  report_id: number
}

export interface RequestChangesRequest {
  '#request': 'Report/request_changes'
  report_id: number
  /** Required, 1–1000 chars. */
  comments: string
}

export interface ApproveReportRequest {
  '#request': 'Report/approve_report'
  report_id: number
  /** report_section_id values to include in the client report. */
  included_section_ids?: number[]
  /** Max 1000 chars; empty = no summary. */
  management_summary?: string
}

export interface DeliverReportRequest {
  '#request': 'Report/deliver_report'
  report_id: number
}

export interface ExportReportPdfRequest {
  '#request': 'Report/export_report_pdf'
  report_id: number
  /** Admin only — re-render the PDF from delivered content. */
  regenerate?: boolean
}

// --- Responses ---

export interface GetReportsListResponse {
  reports: ReportListItem[]
  num_of_items: number
  num_of_pages: number
}

export interface GetReportResponse {
  report: Report
}

export interface GetReportMetadataResponse {
  statuses: Record<ReportStatus, string>
  categories: Record<ReportCategory, string>
  history_actions: Record<ReportHistoryAction, string>
}

export interface GetReportHistoryResponse {
  report_id: number
  history: ReportHistoryEntry[]
}

export interface ReportIdResponse {
  report_id: number
}

export interface UpdateReportResponse extends ReportIdResponse {
  title: string
  changed: boolean
}

export interface ReportStatusResponse extends ReportIdResponse {
  status: ReportStatus
}

export interface StartReviewResponse extends ReportStatusResponse {
  expires_on: string
}

export interface DeliverReportResponse extends ReportStatusResponse {
  pdf_url: string
}

export interface ExportReportPdfResponse extends ReportIdResponse {
  pdf_url: string
  regenerated: boolean
}

// --- Error payloads ---

/** rc=730 on submit — required fields missing (officer flow; typed for reuse). */
export interface ReportMissingField {
  report_section_id: number
  section_title: string
  /** null = a required section has no content. */
  field_id: number | null
  label: string
}

/** rc=727 on start_review — another manager holds the review lock. */
export interface ReportLockedError {
  locked_by: string
  locked_by_name: string
  expires_on: string
}
