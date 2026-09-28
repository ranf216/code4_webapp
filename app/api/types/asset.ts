// Asset & Post module type definitions based on API_Assets.md

export type AssetShape = 'place' | 'circle' | 'line'
export type PostPriority = 'urgent' | 'important' | 'normal' | 'low'
export type ZoneType = 'entry_exit' | 'high_priority'

export interface AssetTypeMeta {
  id: string
  name: string
}

export interface AssetShapeMeta {
  id: AssetShape
  name: string
}

export interface PostPriorityMeta {
  id: PostPriority
  name: string
}

export interface MapZoneTypeMeta {
  id: ZoneType
  name: string
}

export interface AssetLocationPlace {
  lat: number
  lng: number
}

export interface AssetLocationCircle {
  lat: number
  lng: number
  radius: number
}

export interface AssetLocationLine {
  points: Array<{ lat: number; lng: number }>
}

export interface AssetLocationPolygon {
  points: Array<{ lat: number; lng: number }>
}

export type AssetLocation =
  | AssetLocationPlace
  | AssetLocationCircle
  | AssetLocationLine
  | AssetLocationPolygon

export interface PostPermissions {
  required_roles?: string[]
  required_badges?: string[]
  required_equipment?: string[]
}

export interface Asset {
  asset_id: number
  community_id: number
  community_name: string | null
  asset_type: string
  asset_type_name: string
  shape: AssetShape
  location: AssetLocation
  description: string | null
  acres: number
  installation_date: string | null
  replacement_date: string | null
  created_by: number
  created_by_name: string | null
  created_on: string
  last_update: string | null
}

export interface Post {
  post_id: number
  community_id: number
  community_name: string | null
  name: string
  description: string | null
  priority: PostPriority
  shape: AssetShape
  location: AssetLocation
  equipment: string | null
  permissions: PostPermissions | null
  is_active: boolean
  created_by: number
  created_by_name: string | null
  created_on: string
  last_update: string | null
}

export interface MapZone {
  zone_id: number
  community_id: number
  community_name: string | null
  zone_type: ZoneType
  zone_type_name: string
  name: string
  location: AssetLocation
  created_by: number
  created_on: string
  last_update: string | null
}

// Metadata
export interface GetAssetMetadataRequest {
  '#request': 'Asset/get_asset_metadata'
}

export interface GetAssetMetadataResponse {
  asset_types: AssetTypeMeta[]
  asset_shapes: AssetShapeMeta[]
  post_priorities: PostPriorityMeta[]
  map_zone_types: MapZoneTypeMeta[]
}

// Assets list
export interface GetAssetsListRequest {
  '#request': 'Asset/get_assets_list'
  community_id: number
  asset_type?: string
  search_text?: string
  sort_by?: 'created_on' | 'asset_type' | string
  sort_dir?: 'asc' | 'desc' | string
  page?: number
}

export interface GetAssetsListResponse {
  num_of_pages: number
  num_of_items: number
  assets: Asset[]
}

// Single asset
export interface GetAssetRequest {
  '#request': 'Asset/get_asset'
  asset_id: number
}

export interface GetAssetResponse {
  asset: Asset
}

// Create asset
export interface CreateAssetRequest {
  '#request': 'Asset/create_asset'
  community_id: number
  asset_type: string
  shape?: AssetShape
  location: string
  description?: string
  installation_date?: string
  replacement_date?: string
}

export interface CreateAssetResponse {
  asset_id: number
}

// Batch create assets
export interface CreateAssetsBatchRequest {
  '#request': 'Asset/create_assets_batch'
  community_id: number
  asset_type: string
  shape?: AssetShape
  locations: string[]
  description?: string
  installation_date?: string
  replacement_date?: string
}

export interface CreateAssetsBatchResponse {
  asset_ids: number[]
}

// Update asset
export interface UpdateAssetRequest {
  '#request': 'Asset/update_asset'
  asset_id: number
  asset_type?: string
  shape?: AssetShape
  location?: string
  description?: string
  installation_date?: string
  replacement_date?: string
}

// Delete asset
export interface DeleteAssetRequest {
  '#request': 'Asset/delete_asset'
  asset_id: number
}

// Posts list
export interface GetPostsListRequest {
  '#request': 'Asset/get_posts_list'
  community_id: number
  include_inactive?: boolean
  search_text?: string
  sort_by?: 'name' | 'priority' | 'created_on' | string
  sort_dir?: 'asc' | 'desc' | string
  page?: number
}

export interface GetPostsListResponse {
  num_of_pages: number
  num_of_items: number
  posts: Post[]
}

// Single post
export interface GetPostRequest {
  '#request': 'Asset/get_post'
  post_id: number
}

export interface GetPostResponse {
  post: Post
}

// Create post
export interface CreatePostRequest {
  '#request': 'Asset/create_post'
  community_id: number
  name: string
  description?: string
  priority?: PostPriority
  shape?: AssetShape
  location: string
  equipment?: string
  permissions?: string
  is_active?: boolean
}

export interface CreatePostResponse {
  post_id: number
}

// Update post
export interface UpdatePostRequest {
  '#request': 'Asset/update_post'
  post_id: number
  name?: string
  description?: string
  priority?: PostPriority
  shape?: AssetShape
  location?: string
  equipment?: string
  permissions?: string
  is_active?: boolean
}

// Delete post
export interface DeletePostRequest {
  '#request': 'Asset/delete_post'
  post_id: number
}

// Map zones
export interface GetMapZonesRequest {
  '#request': 'Asset/get_map_zones'
  community_id: number
  zone_type?: ZoneType
}

export interface GetMapZonesResponse {
  zones: MapZone[]
}

// Create map zone
export interface CreateMapZoneRequest {
  '#request': 'Asset/create_map_zone'
  community_id: number
  zone_type: ZoneType
  name: string
  location: string
}

export interface CreateMapZoneResponse {
  zone_id: number
}

// Update map zone
export interface UpdateMapZoneRequest {
  '#request': 'Asset/update_map_zone'
  zone_id: number
  zone_type?: ZoneType
  name?: string
  location?: string
}

// Delete map zone
export interface DeleteMapZoneRequest {
  '#request': 'Asset/delete_map_zone'
  zone_id: number
}

// Community map upload
export interface UploadCommunityMapRequest {
  '#request': 'Asset/upload_community_map'
  community_id: number
  map_image: string
}

export interface UploadCommunityMapResponse {
  map_image_url: string
}

// Asset module error codes
export const AssetErrorCodes = {
  ERR_NO_PRIVILEGES: 103,
  ERR_INVALID_TOKEN: 201,
  ERR_COMMUNITY_NOT_FOUND: 500,
  ERR_ASSET_NOT_FOUND: 750,
  ERR_ASSET_INVALID_TYPE: 751,
  ERR_POST_NOT_FOUND: 752,
  ERR_POST_NAME_ALREADY_EXISTS: 753,
  ERR_MAP_ZONE_NOT_FOUND: 754,
  ERR_ASSET_INVALID_SHAPE: 755,
  ERR_POST_INVALID_PRIORITY: 756,
  ERR_POST_INVALID_SHAPE: 757,
  ERR_MAP_ZONE_INVALID_TYPE: 758,
  ERR_POST_HAS_SHIFT_HISTORY: 759,
  ERR_ASSET_BATCH_EMPTY: 760,
  ERR_ASSET_BATCH_LIMIT_EXCEEDED: 761,
  ERR_MAP_ITEM_LIMIT_EXCEEDED: 762,
  ERR_ASSET_INVALID_DATE: 763,
} as const
