import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetReportsListRequest,
  GetReportsListResponse,
  GetReportRequest,
  GetReportResponse,
  GetReportMetadataResponse,
  GetReportHistoryRequest,
  GetReportHistoryResponse,
  UpdateReportRequest,
  UpdateReportResponse,
  StartReviewRequest,
  StartReviewResponse,
  ReleaseReviewRequest,
  RequestChangesRequest,
  ApproveReportRequest,
  DeliverReportRequest,
  DeliverReportResponse,
  ExportReportPdfRequest,
  ExportReportPdfResponse,
  ReportStatusResponse,
} from './types/report'

/**
 * Report API client — admin web portal endpoints.
 * Officer-only (create_report, submit_report) and Resident-only
 * (get_report_for_client) endpoints are not part of the web admin surface.
 */
class ReportApi extends BaseApiClient {
  /**
   * Get a paginated list of incident reports.
   * Admins receive non-draft reports of the communities they manage.
   * Page size is server-controlled; `page` is 0-based.
   */
  async getReportsList(
    params: Omit<GetReportsListRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetReportsListResponse>> {
    return this.request<GetReportsListResponse>(
      {
        '#request': 'Report/get_reports_list',
        ...params,
      },
      options
    )
  }

  /**
   * Get the full content of a report (admin view: reviewer state,
   * manager notes, submitted_value, history, can_edit).
   */
  async getReport(
    reportId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetReportResponse>> {
    return this.request<GetReportResponse>(
      {
        '#request': 'Report/get_report',
        report_id: reportId,
      },
      options
    )
  }

  /**
   * Get lookup values for report screens: statuses, categories,
   * history action labels. Load once per session.
   */
  async getReportMetadata(
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetReportMetadataResponse>> {
    return this.request<GetReportMetadataResponse>(
      {
        '#request': 'Report/get_report_metadata',
      },
      options
    )
  }

  /**
   * Get the complete audit trail of a report: status transitions,
   * field-level edits after submission, review actions, delivery.
   * Admin only.
   */
  async getReportHistory(
    reportId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetReportHistoryResponse>> {
    return this.request<GetReportHistoryResponse>(
      {
        '#request': 'Report/get_report_history',
        report_id: reportId,
      },
      options
    )
  }

  /**
   * Save changes to a report. Admins may only edit while holding the
   * review lock (after start_review); can also set manager_notes and
   * client_included per section. Only sent sections/fields are changed.
   */
  async updateReport(
    params: Omit<UpdateReportRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<UpdateReportResponse>> {
    return this.request<UpdateReportResponse>(
      {
        '#request': 'Report/update_report',
        ...params,
      },
      options
    )
  }

  /**
   * Open a submitted report for review: status → under_review and the
   * report is locked to the caller for 30 minutes. Call periodically
   * (e.g. every 10 min) while the Review Studio is open to keep the lock.
   * Admin only.
   */
  async startReview(
    reportId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<StartReviewResponse>> {
    return this.request<StartReviewResponse>(
      {
        '#request': 'Report/start_review',
        report_id: reportId,
      },
      options
    )
  }

  /**
   * Close the review without a decision: status returns to submitted
   * and the lock is released. Call when leaving the Review Studio
   * without approving or requesting changes. Admin only.
   */
  async releaseReview(
    reportId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<ReportStatusResponse>> {
    return this.request<ReportStatusResponse>(
      {
        '#request': 'Report/release_review',
        report_id: reportId,
      },
      options
    )
  }

  /**
   * Send the report back to the officer with mandatory comments
   * (1–1000 chars). Status → changes_requested. Admin only.
   */
  async requestChanges(
    params: Omit<RequestChangesRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<ReportStatusResponse>> {
    return this.request<ReportStatusResponse>(
      {
        '#request': 'Report/request_changes',
        ...params,
      },
      options
    )
  }

  /**
   * Approve a report under review. Optionally set which sections the
   * client receives (included_section_ids) and a management_summary.
   * Releases the review lock. Admin only.
   */
  async approveReport(
    params: Omit<ApproveReportRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<ReportStatusResponse>> {
    return this.request<ReportStatusResponse>(
      {
        '#request': 'Report/approve_report',
        ...params,
      },
      options
    )
  }

  /**
   * Deliver an approved report to the client: generates the watermarked
   * client PDF, marks the report delivered (final) and notifies the
   * officer and the client recipient. Admin only.
   */
  async deliverReport(
    reportId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<DeliverReportResponse>> {
    return this.request<DeliverReportResponse>(
      {
        '#request': 'Report/deliver_report',
        report_id: reportId,
      },
      options
    )
  }

  /**
   * Get a fresh signed, time-limited download URL of the client PDF of a
   * delivered report. Pass regenerate: true (admin) to re-render the PDF
   * from the delivered content. Always request a fresh URL on download.
   */
  async exportReportPdf(
    reportId: number,
    regenerate?: boolean,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<ExportReportPdfResponse>> {
    return this.request<ExportReportPdfResponse>(
      {
        '#request': 'Report/export_report_pdf',
        report_id: reportId,
        ...(regenerate ? { regenerate: true } : {}),
      },
      options
    )
  }
}

export const reportApi = new ReportApi()
export default reportApi
