import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetTemplatesListRequest,
  GetTemplatesListResponse,
  GetTemplateRequest,
  GetTemplateResponse,
  CreateTemplateRequest,
  CreateTemplateResponse,
  UpdateTemplateRequest,
  DuplicateTemplateRequest,
  ActivateTemplateRequest,
  ArchiveTemplateRequest,
  DeleteTemplateRequest,
  TemplateIdResponse,
  GetTemplateStyleRequest,
  GetTemplateStyleResponse,
  UpdateTemplateStyleRequest,
} from './types/reportTemplate'

class ReportTemplateApi extends BaseApiClient {
  /**
   * Get a paginated, filterable list of report templates.
   * Admin sees all statuses; results are scoped by the caller's role on the backend.
   */
  async getTemplatesList(
    params: Omit<GetTemplatesListRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTemplatesListResponse>> {
    return this.request<GetTemplatesListResponse>(
      {
        '#request': 'ReportTemplate/get_templates_list',
        ...params,
      },
      options
    )
  }

  /**
   * Get full details of a single report template including
   * sections, fields, community assignments, and style settings.
   */
  async getTemplate(
    templateId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTemplateResponse>> {
    return this.request<GetTemplateResponse>(
      {
        '#request': 'ReportTemplate/get_template',
        template_id: templateId,
      },
      options
    )
  }

  /**
   * Create a new report template in Draft status.
   * Empty community_ids array creates a global template.
   */
  async createTemplate(
    params: Omit<CreateTemplateRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<CreateTemplateResponse>> {
    return this.request<CreateTemplateResponse>(
      {
        '#request': 'ReportTemplate/create_template',
        ...params,
      },
      options
    )
  }

  /**
   * Update template header settings and/or replace the full section/field
   * structure. Only provided parameters are applied. When `sections` is
   * provided, the entire structure is replaced (no partial patching).
   */
  async updateTemplate(
    params: Omit<UpdateTemplateRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<TemplateIdResponse>> {
    return this.request<TemplateIdResponse>(
      {
        '#request': 'ReportTemplate/update_template',
        ...params,
      },
      options
    )
  }

  /**
   * Deep-copy an existing template into a new Draft template.
   * Pass `name` to override the default "Copy of <original name>".
   */
  async duplicateTemplate(
    templateId: number,
    name?: string,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<TemplateIdResponse>> {
    return this.request<TemplateIdResponse>(
      {
        '#request': 'ReportTemplate/duplicate_template',
        template_id: templateId,
        ...(name ? { name } : {}),
      },
      options
    )
  }

  /**
   * Transition a Draft or Archived template to Active status.
   * The template must have at least one section with at least one field.
   */
  async activateTemplate(
    templateId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<TemplateIdResponse>> {
    return this.request<TemplateIdResponse>(
      {
        '#request': 'ReportTemplate/activate_template',
        template_id: templateId,
      },
      options
    )
  }

  /**
   * Retire a Draft or Active template to Archived status.
   * Existing reports are unaffected.
   */
  async archiveTemplate(
    templateId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<TemplateIdResponse>> {
    return this.request<TemplateIdResponse>(
      {
        '#request': 'ReportTemplate/archive_template',
        template_id: templateId,
      },
      options
    )
  }

  /**
   * Soft-delete a template and its child records.
   * Only Draft templates can be deleted.
   */
  async deleteTemplate(
    templateId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<TemplateIdResponse>> {
    return this.request<TemplateIdResponse>(
      {
        '#request': 'ReportTemplate/delete_template',
        template_id: templateId,
      },
      options
    )
  }

  /**
   * Get the template's formatting/style settings as a standalone object.
   */
  async getTemplateStyle(
    templateId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTemplateStyleResponse>> {
    return this.request<GetTemplateStyleResponse>(
      {
        '#request': 'ReportTemplate/get_template_style',
        template_id: templateId,
      },
      options
    )
  }

  /**
   * Update individual style fields. Only provided parameters are applied.
   * For `company_logo`: send base64 image data to upload, empty string to
   * remove, or omit to keep the current logo.
   */
  async updateTemplateStyle(
    params: Omit<UpdateTemplateStyleRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTemplateStyleResponse>> {
    return this.request<GetTemplateStyleResponse>(
      {
        '#request': 'ReportTemplate/update_template_style',
        ...params,
      },
      options
    )
  }
}

export const reportTemplateApi = new ReportTemplateApi()
export default reportTemplateApi
