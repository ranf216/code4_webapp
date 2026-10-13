// --- Enums / literals ---

export type ReportTemplateCategory = 'incident' | 'daily_activity' | 'custom'
export type ReportTemplateStatus = 'draft' | 'active' | 'archived'

export type ReportFieldType =
  | 'text'
  | 'date'
  | 'location'
  | 'dropdown'
  | 'file_upload'
  | 'digital_signature'

export type ReportHeaderLayout = 'compact' | 'standard' | 'full_width_banner'
export type ReportFont = 'arial' | 'calibri' | 'times_new_roman'
export type ReportDateFormat = 'mm_dd_yyyy' | 'dd_mm_yyyy' | 'yyyy_mm_dd'
export type ReportSectionBreaks = 'new_page' | 'continuous'

// --- Shared objects ---

export interface ReportTemplateCommunity {
  community_id: number
  community_name: string
}

export interface ReportTemplateStyle {
  company_logo: string | null
  accent_color: string | null
  header_layout: ReportHeaderLayout
  font: ReportFont
  page_numbering: boolean
  confidentiality_footer: string | null
  date_format: ReportDateFormat
  section_breaks: ReportSectionBreaks
  include_cover_page: boolean
}

export interface ReportFieldConfig {
  max_chars?: number
  dropdown_values?: string[]
  is_multi_select?: boolean
  max_files?: number
  [key: string]: unknown
}

export interface ReportTemplateField {
  field_id: number
  field_key: string
  label: string
  description: string | null
  field_type: ReportFieldType
  config: ReportFieldConfig | null
  sort_order: number
  is_system_field: boolean
  is_required: boolean
}

export interface ReportTemplateSection {
  section_id: number
  title: string
  sort_order: number
  is_enabled: boolean
  is_required: boolean
  client_visible: boolean
  fields: ReportTemplateField[]
}

// --- Request section/field payloads (create/update) ---

export interface ReportFieldPayload {
  field_key: string
  label: string
  description?: string
  field_type: ReportFieldType
  config?: ReportFieldConfig
  is_system_field?: boolean
  is_required?: boolean
}

export interface ReportSectionPayload {
  title: string
  is_enabled?: boolean
  is_required?: boolean
  client_visible?: boolean
  fields: ReportFieldPayload[]
}

// --- List ---

export interface ReportTemplateListItem {
  template_id: number
  name: string
  category: ReportTemplateCategory
  category_name: string
  status: ReportTemplateStatus
  status_name: string
  is_global: boolean
  communities: ReportTemplateCommunity[]
  section_count: number
  created_by_name: string | null
  created_on: string
  last_modified: string | null
}

export interface GetTemplatesListRequest {
  '#request': 'ReportTemplate/get_templates_list'
  community_id?: number
  status?: ReportTemplateStatus
  category?: ReportTemplateCategory
  search_text?: string
  sort_by?: 'name' | 'category' | 'status' | 'last_modified'
  sort_dir?: 'asc' | 'desc'
  page?: number
}

export interface GetTemplatesListResponse {
  templates: ReportTemplateListItem[]
  num_of_items: number
  num_of_pages: number
}

// --- Detail ---

export interface ReportTemplate extends ReportTemplateListItem {
  title_format: string
  review_before_client: boolean
  allow_officer_editing: boolean
  style: ReportTemplateStyle
  sections: ReportTemplateSection[]
  created_by: string
  last_update: string | null
}

export interface GetTemplateRequest {
  '#request': 'ReportTemplate/get_template'
  template_id: number
}

export interface GetTemplateResponse {
  template: ReportTemplate
}

// --- Create ---

export interface CreateTemplateRequest {
  '#request': 'ReportTemplate/create_template'
  name: string
  category: ReportTemplateCategory
  community_ids: number[]
  title_format: string
  review_before_client?: boolean
  allow_officer_editing?: boolean
  sections: ReportSectionPayload[]
}

export interface CreateTemplateResponse {
  template_id: number
}

// --- Update ---

export interface UpdateTemplateRequest {
  '#request': 'ReportTemplate/update_template'
  template_id: number
  name?: string
  category?: ReportTemplateCategory
  community_ids?: number[]
  title_format?: string
  review_before_client?: boolean
  allow_officer_editing?: boolean
  sections?: ReportSectionPayload[]
}

// --- Duplicate ---

export interface DuplicateTemplateRequest {
  '#request': 'ReportTemplate/duplicate_template'
  template_id: number
  name?: string
}

// --- Status transitions ---

export interface ActivateTemplateRequest {
  '#request': 'ReportTemplate/activate_template'
  template_id: number
}

export interface ArchiveTemplateRequest {
  '#request': 'ReportTemplate/archive_template'
  template_id: number
}

export interface DeleteTemplateRequest {
  '#request': 'ReportTemplate/delete_template'
  template_id: number
}

export interface TemplateIdResponse {
  template_id: number
}

// --- Style ---

export interface GetTemplateStyleRequest {
  '#request': 'ReportTemplate/get_template_style'
  template_id: number
}

export interface GetTemplateStyleResponse {
  template_id: number
  style: ReportTemplateStyle
}

export interface UpdateTemplateStyleRequest {
  '#request': 'ReportTemplate/update_template_style'
  template_id: number
  company_logo?: string
  accent_color?: string
  header_layout?: ReportHeaderLayout
  font?: ReportFont
  page_numbering?: boolean
  confidentiality_footer?: string
  date_format?: ReportDateFormat
  section_breaks?: ReportSectionBreaks
  include_cover_page?: boolean
}
