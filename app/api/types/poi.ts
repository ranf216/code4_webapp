// POI API types — Poi/* endpoints
// See: screen_design/API_POI.md

export type PoiRecordType = 'poi' | 'trespass' | 'metro_red_card'

export type PoiStatus = 'draft' | 'active' | 'expired' | 'inactive' | 'archived'

export type PoiThreatLevel = 'low' | 'medium' | 'high' | 'critical'

export type PoiGender = 'male' | 'female' | 'unknown'

export interface PoiMetadataResponse {
  record_types: Record<string, { name: { en: string } }>
  threat_levels: Record<string, { name: { en: string } }>
  statuses: Record<string, { name: { en: string } }>
  genders: Record<string, { name: { en: string } }>
  guidance: Record<string, string>
}

export interface PoiListRecordSite {
  community_id: number
  community_name: string
}

export interface PoiListRecord {
  record_id: number
  record_type: PoiRecordType
  record_type_name: string
  status: PoiStatus
  first_name: string
  last_name: string
  full_name: string
  known_aliases: string | null
  threat_level: PoiThreatLevel
  threat_level_name: string
  summary: string
  photo_url: string | null
  sites: PoiListRecordSite[]
  expiry_date: string | null
  created_on: string
  last_update: string | null
  view_badge?: 'new' | 'updated' | null
}

export interface GetPoiListResponse {
  total_count: number
  records: PoiListRecord[]
}

export interface PoiPhoto {
  photo_id: number
  url: string
  sort_order: number
}

export interface PoiRecordSite {
  site_id: number
  community_id: number
  community_name: string
}

export interface PoiRelatedIncident {
  incident_link_id: number
  call_id: number
}

interface PoiRecordBase {
  record_id: number
  record_type: PoiRecordType
  record_type_name: string
  status: PoiStatus
  first_name: string
  last_name: string
  full_name: string
  known_aliases: string | null
  date_of_birth: string | null
  gender: PoiGender | null
  physical_description: string | null
  threat_level: PoiThreatLevel
  threat_level_name: string
  summary: string
  photos: PoiPhoto[]
  sites: PoiRecordSite[]
  related_incidents: PoiRelatedIncident[]
  expiry_date: string | null
  issue_date: string | null
  created_on: string
  last_update: string | null
  // Admin-only fields
  internal_notes?: string | null
  inactivation_reason?: string | null
  approved_by?: string | null
  approved_by_name?: string | null
  approved_on?: string | null
  created_by?: string
  created_by_name?: string | null
  // Officer-only fields
  view_badge?: 'new' | 'updated' | null
  response_guidance?: string
}

interface PoiTypeFields {
  incident_history_summary?: string | null
  watch_level_review_date?: string | null
  associated_individuals?: string | null
}

interface TrespassTypeFields {
  trespass_notice_number?: string | null
  issuing_authority?: string | null
  property_area_covered?: string | null
  notice_document?: string | null
  renewal_reminder_days?: number
  law_enforcement_contact?: string | null
  conditions?: string | null
}

interface MetroRedCardTypeFields {
  red_card_number?: string | null
  issuing_authority?: string | null
  lines?: string | null
  card_document?: string | null
  renewal_reminder_days?: number
}

export type PoiRecord = PoiRecordBase & PoiTypeFields & TrespassTypeFields & MetroRedCardTypeFields

export interface GetPoiRecordResponse {
  record: PoiRecord
}

// --- Requests ---

export interface GetPoiListRequest {
  '#request': 'Poi/get_poi_list'
  community_id?: number
  record_type?: PoiRecordType
  status?: PoiStatus
  threat_level?: PoiThreatLevel
  expiring_within_days?: number
  search_text?: string
  sort_by?: 'created_on' | 'threat_level' | 'name' | 'last_update'
  sort_dir?: 'asc' | 'desc'
  offset?: number
  limit?: number
}

export interface GetPoiRecordRequest {
  '#request': 'Poi/get_poi_record'
  record_id: number
}

export interface CreatePoiRecordRequest {
  '#request': 'Poi/create_poi_record'
  record_type: PoiRecordType
  first_name: string
  last_name: string
  known_aliases?: string
  date_of_birth?: string
  gender?: PoiGender | ''
  physical_description?: string
  threat_level: PoiThreatLevel
  summary: string
  internal_notes?: string
  community_ids: number[]
  photo_file_ids: (string | number)[]
  related_incident_ids?: number[]
  publish?: boolean
  // POI type
  incident_history_summary?: string
  watch_level_review_date?: string
  associated_individuals?: string
  // Trespass & Metro Red Card
  issuing_authority?: string
  issue_date?: string
  expiry_date?: string
  renewal_reminder_days?: number
  // Trespass only
  trespass_notice_number?: string
  property_area_covered?: string
  notice_document_file_id?: number
  law_enforcement_contact?: string
  conditions?: string
  // Metro Red Card only
  red_card_number?: string
  lines?: string
  card_document_file_id?: number
}

export interface CreatePoiRecordResponse {
  record_id: number
}

export interface UpdatePoiRecordRequest {
  '#request': 'Poi/update_poi_record'
  record_id: number
  first_name?: string | null
  last_name?: string | null
  known_aliases?: string | null
  date_of_birth?: string | null
  gender?: PoiGender | null
  physical_description?: string | null
  threat_level?: PoiThreatLevel | null
  summary?: string | null
  internal_notes?: string | null
  community_ids?: number[] | null
  photo_file_ids?: (string | number)[] | null
  related_incident_ids?: number[] | null
  // POI type
  incident_history_summary?: string | null
  watch_level_review_date?: string | null
  associated_individuals?: string | null
  // Trespass & Metro Red Card
  issuing_authority?: string | null
  issue_date?: string | null
  expiry_date?: string | null
  renewal_reminder_days?: number
  // Trespass only
  trespass_notice_number?: string | null
  property_area_covered?: string | null
  notice_document_file_id?: number
  law_enforcement_contact?: string | null
  conditions?: string | null
  // Metro Red Card only
  red_card_number?: string | null
  lines?: string | null
  card_document_file_id?: number
}

export interface PublishPoiRecordRequest {
  '#request': 'Poi/publish_poi_record'
  record_id: number
  notify_officers?: boolean
}

export interface InactivatePoiRecordRequest {
  '#request': 'Poi/inactivate_poi_record'
  record_id: number
  reason: string
}

export interface ArchivePoiRecordRequest {
  '#request': 'Poi/archive_poi_record'
  record_id: number
}

export interface ExportPoiRecordRequest {
  '#request': 'Poi/export_poi_record'
  record_id: number
}

export interface ExportPoiRecordResponse {
  export_id: number
  file_url: string
}

export interface GetPoiMetadataRequest {
  '#request': 'Poi/get_poi_metadata'
}
