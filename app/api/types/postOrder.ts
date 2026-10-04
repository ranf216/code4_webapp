// Post Order API types — PostOrder/* endpoints
// See: screen_design/API_Post Order.md

export type PostOrderStatus = 'draft' | 'published' | 'archived'
export type PostOrderVersionType = 'major' | 'minor'

export interface PostOrderAttachment {
  attachment_id: number
  url: string
  created_on: string
}

export interface PostOrderSection {
  section_id: number
  section_type: string
  section_type_name: string
  title: string
  description: string
  client_visible: boolean
  sort_order: number
  notes?: string | null
  attachments: PostOrderAttachment[]
  created_on: string
  last_update: string | null
}

// Section payload for create/update (full replacement semantics)
export interface PostOrderSectionInput {
  section_type: string
  title: string
  description?: string
  client_visible?: boolean
  notes?: string
  attachment_file_ids?: (string | number)[]
}

export interface PostOrderAcknowledgement {
  officer_id: string
  officer_name: string
  badge_number?: string | null
  acknowledged: boolean
  acknowledged_on?: string | null
}

export interface PostOrder {
  post_order_id: number
  post_id: number
  post_name: string
  community_id: number
  community_name: string
  status: PostOrderStatus
  version: string
  effective_date: string | null
  review_due_date: string | null
  created_by: string
  created_by_name: string | null
  last_published_by: string | null
  last_published_by_name: string | null
  last_published_on: string | null
  created_on: string
  last_update: string | null
  acknowledged_pct?: number | null
  acknowledgements?: PostOrderAcknowledgement[]
}

export interface PostOrderDetail extends PostOrder {
  sections: PostOrderSection[]
}

export interface PostOrderVersionSummary {
  version_id: number
  version: string
  change_summary: string
  version_type: PostOrderVersionType
  effective_date: string
  published_by: string
  published_by_name: string | null
  published_on: string
}

export interface PostOrderVersionSection {
  section_type: string
  title: string
  description: string
  client_visible: boolean
  notes: string | null
  sort_order: number
  attachments: PostOrderAttachment[]
}

export interface PostOrderVersionDetail extends PostOrderVersionSummary {
  sections: PostOrderVersionSection[]
}

// --- Requests ---

export interface GetPostOrdersListRequest {
  '#request': 'PostOrder/get_post_orders_list'
  community_id?: number
  status?: PostOrderStatus
  search_text?: string
  review_due_before?: string
  sort_by?: 'community_name' | 'post_name' | 'status' | 'last_published_on'
  sort_dir?: 'asc' | 'desc'
  offset?: number
  limit?: number
}

export interface GetPostOrderRequest {
  '#request': 'PostOrder/get_post_order'
  post_order_id: number
}

export interface CreatePostOrderRequest {
  '#request': 'PostOrder/create_post_order'
  post_id: number
  review_due_date?: string
  sections: PostOrderSectionInput[]
}

export interface UpdatePostOrderRequest {
  '#request': 'PostOrder/update_post_order'
  post_order_id: number
  review_due_date?: string
  sections?: PostOrderSectionInput[]
}

export interface PublishPostOrderRequest {
  '#request': 'PostOrder/publish_post_order'
  post_order_id: number
  version_type: PostOrderVersionType
  change_summary: string
  effective_date?: string
  notify_officers?: boolean
}

export interface ArchivePostOrderRequest {
  '#request': 'PostOrder/archive_post_order'
  post_order_id: number
}

export interface DeletePostOrderRequest {
  '#request': 'PostOrder/delete_post_order'
  post_order_id: number
}

export interface GetPostOrderVersionHistoryRequest {
  '#request': 'PostOrder/get_version_history'
  post_order_id: number
}

export interface GetPostOrderVersionRequest {
  '#request': 'PostOrder/get_version'
  post_order_id: number
  version_id: number
}

// --- Responses ---

export interface GetPostOrdersListResponse {
  post_orders: PostOrder[]
  total_count: number
}

export interface GetPostOrderResponse {
  post_order: PostOrderDetail
}

export interface CreatePostOrderResponse {
  post_order_id: number
}

export interface PublishPostOrderResponse {
  version_id: number
  version: string
}

export interface GetPostOrderVersionHistoryResponse {
  versions: PostOrderVersionSummary[]
}

export interface GetPostOrderVersionResponse {
  version: PostOrderVersionDetail
}
