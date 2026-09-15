import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  AssetLocation,
  PostPermissions,
  GetAssetMetadataRequest,
  GetAssetMetadataResponse,
  GetAssetsListRequest,
  GetAssetsListResponse,
  GetAssetRequest,
  GetAssetResponse,
  CreateAssetRequest,
  CreateAssetResponse,
  CreateAssetsBatchRequest,
  CreateAssetsBatchResponse,
  UpdateAssetRequest,
  DeleteAssetRequest,
  GetPostsListRequest,
  GetPostsListResponse,
  GetPostRequest,
  GetPostResponse,
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  DeletePostRequest,
  GetMapZonesRequest,
  GetMapZonesResponse,
  CreateMapZoneRequest,
  CreateMapZoneResponse,
  UpdateMapZoneRequest,
  DeleteMapZoneRequest,
  UploadCommunityMapRequest,
  UploadCommunityMapResponse,
} from './types/asset'

export interface CreateAssetParams {
  community_id: number
  asset_type: string
  shape?: CreateAssetRequest['shape']
  location: AssetLocation
  description?: string
  installation_date?: string
  replacement_date?: string
}

export interface CreateAssetsBatchParams {
  community_id: number
  asset_type: string
  shape?: CreateAssetsBatchRequest['shape']
  locations: AssetLocation[]
  description?: string
  installation_date?: string
  replacement_date?: string
}

export interface UpdateAssetParams {
  asset_id: number
  asset_type?: string
  shape?: UpdateAssetRequest['shape']
  location?: AssetLocation
  description?: string
  installation_date?: string
  replacement_date?: string
}

export interface CreatePostParams {
  community_id: number
  name: string
  description?: string
  priority?: CreatePostRequest['priority']
  shape?: CreatePostRequest['shape']
  location: AssetLocation
  equipment?: string
  permissions?: PostPermissions
  is_active?: boolean
}

export interface UpdatePostParams {
  post_id: number
  name?: string
  description?: string
  priority?: UpdatePostRequest['priority']
  shape?: UpdatePostRequest['shape']
  location?: AssetLocation
  equipment?: string
  permissions?: PostPermissions
  is_active?: boolean
}

export interface CreateMapZoneParams {
  community_id: number
  zone_type: CreateMapZoneRequest['zone_type']
  name: string
  location: AssetLocation
}

export interface UpdateMapZoneParams {
  zone_id: number
  zone_type?: UpdateMapZoneRequest['zone_type']
  name?: string
  location?: AssetLocation
}

type RequestOptions = { showLoading?: boolean; loadingMessage?: string }

class AssetApi extends BaseApiClient {
  /**
   * Get asset metadata: asset types, shapes, post priorities, zone types.
   * Available to Admin and Officer.
   */
  async getAssetMetadata(
    options?: RequestOptions
  ): Promise<ApiResponse<GetAssetMetadataResponse>> {
    return this.request<GetAssetMetadataResponse>(
      { '#request': 'Asset/get_asset_metadata' },
      options
    )
  }

  /**
   * Get paginated list of assets for a community.
   * Admin only.
   */
  async getAssetsList(
    params: Omit<GetAssetsListRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<GetAssetsListResponse>> {
    return this.request<GetAssetsListResponse>(
      {
        '#request': 'Asset/get_assets_list',
        ...params,
      },
      options
    )
  }

  /**
   * Get full details of a single asset.
   * Admin only.
   */
  async getAsset(
    assetId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<GetAssetResponse>> {
    return this.request<GetAssetResponse>(
      {
        '#request': 'Asset/get_asset',
        asset_id: assetId,
      },
      options
    )
  }

  /**
   * Create a new asset.
   * Admin only.
   */
  async createAsset(
    params: CreateAssetParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CreateAssetResponse>> {
    const request: Omit<CreateAssetRequest, '#request'> = {
      community_id: params.community_id,
      asset_type: params.asset_type,
      shape: params.shape,
      location: JSON.stringify(params.location),
      description: params.description,
      installation_date: params.installation_date,
      replacement_date: params.replacement_date,
    }

    return this.request<CreateAssetResponse>(
      {
        '#request': 'Asset/create_asset',
        ...request,
      },
      options
    )
  }

  /**
   * Create multiple assets at once.
   * Admin only.
   */
  async createAssetsBatch(
    params: CreateAssetsBatchParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CreateAssetsBatchResponse>> {
    const request: Omit<CreateAssetsBatchRequest, '#request'> = {
      community_id: params.community_id,
      asset_type: params.asset_type,
      shape: params.shape,
      locations: params.locations.map((loc) => JSON.stringify(loc)),
      description: params.description,
      installation_date: params.installation_date,
      replacement_date: params.replacement_date,
    }

    return this.request<CreateAssetsBatchResponse>(
      {
        '#request': 'Asset/create_assets_batch',
        ...request,
      },
      options
    )
  }

  /**
   * Update an asset. Supports partial updates.
   * Admin only.
   */
  async updateAsset(
    params: UpdateAssetParams,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: Omit<UpdateAssetRequest, '#request'> = {
      asset_id: params.asset_id,
      asset_type: params.asset_type,
      shape: params.shape,
      description: params.description,
      installation_date: params.installation_date,
      replacement_date: params.replacement_date,
    }

    if (params.location) {
      request.location = JSON.stringify(params.location)
    }

    return this.request<void>(
      {
        '#request': 'Asset/update_asset',
        ...request,
      },
      options
    )
  }

  /**
   * Soft-delete an asset.
   * Admin only.
   */
  async deleteAsset(
    assetId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Asset/delete_asset',
        asset_id: assetId,
      },
      options
    )
  }

  /**
   * Get paginated list of posts for a community.
   * Admin or Officer.
   */
  async getPostsList(
    params: Omit<GetPostsListRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<GetPostsListResponse>> {
    return this.request<GetPostsListResponse>(
      {
        '#request': 'Asset/get_posts_list',
        ...params,
      },
      options
    )
  }

  /**
   * Get full details of a single post.
   * Admin or Officer.
   */
  async getPost(
    postId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<GetPostResponse>> {
    return this.request<GetPostResponse>(
      {
        '#request': 'Asset/get_post',
        post_id: postId,
      },
      options
    )
  }

  /**
   * Create a new post.
   * Admin only.
   */
  async createPost(
    params: CreatePostParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CreatePostResponse>> {
    const request: Omit<CreatePostRequest, '#request'> = {
      community_id: params.community_id,
      name: params.name,
      description: params.description,
      priority: params.priority,
      shape: params.shape,
      location: JSON.stringify(params.location),
      equipment: params.equipment,
      is_active: params.is_active,
    }

    if (params.permissions) {
      request.permissions = JSON.stringify(params.permissions)
    }

    return this.request<CreatePostResponse>(
      {
        '#request': 'Asset/create_post',
        ...request,
      },
      options
    )
  }

  /**
   * Update a post. Supports partial updates.
   * Admin only.
   */
  async updatePost(
    params: UpdatePostParams,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: Omit<UpdatePostRequest, '#request'> = {
      post_id: params.post_id,
      name: params.name,
      description: params.description,
      priority: params.priority,
      shape: params.shape,
      equipment: params.equipment,
      is_active: params.is_active,
    }

    if (params.location) {
      request.location = JSON.stringify(params.location)
    }

    if (params.permissions) {
      request.permissions = JSON.stringify(params.permissions)
    }

    return this.request<void>(
      {
        '#request': 'Asset/update_post',
        ...request,
      },
      options
    )
  }

  /**
   * Delete a post. Posts with shift history must be deactivated instead.
   * Admin only.
   */
  async deletePost(
    postId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Asset/delete_post',
        post_id: postId,
      },
      options
    )
  }

  /**
   * Get all map zones for a community.
   * Admin or Officer.
   */
  async getMapZones(
    params: Omit<GetMapZonesRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<GetMapZonesResponse>> {
    return this.request<GetMapZonesResponse>(
      {
        '#request': 'Asset/get_map_zones',
        ...params,
      },
      options
    )
  }

  /**
   * Create a new map zone.
   * Admin only.
   */
  async createMapZone(
    params: CreateMapZoneParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CreateMapZoneResponse>> {
    const request: Omit<CreateMapZoneRequest, '#request'> = {
      community_id: params.community_id,
      zone_type: params.zone_type,
      name: params.name,
      location: JSON.stringify(params.location),
    }

    return this.request<CreateMapZoneResponse>(
      {
        '#request': 'Asset/create_map_zone',
        ...request,
      },
      options
    )
  }

  /**
   * Update a map zone. Supports partial updates.
   * Admin only.
   */
  async updateMapZone(
    params: UpdateMapZoneParams,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: Omit<UpdateMapZoneRequest, '#request'> = {
      zone_id: params.zone_id,
      zone_type: params.zone_type,
      name: params.name,
    }

    if (params.location) {
      request.location = JSON.stringify(params.location)
    }

    return this.request<void>(
      {
        '#request': 'Asset/update_map_zone',
        ...request,
      },
      options
    )
  }

  /**
   * Soft-delete a map zone.
   * Admin only.
   */
  async deleteMapZone(
    zoneId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Asset/delete_map_zone',
        zone_id: zoneId,
      },
      options
    )
  }

  /**
   * Upload or replace a community map image.
   * Admin only.
   */
  async uploadCommunityMap(
    params: Omit<UploadCommunityMapRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<UploadCommunityMapResponse>> {
    return this.request<UploadCommunityMapResponse>(
      {
        '#request': 'Asset/upload_community_map',
        community_id: params.community_id,
        map_image: params.map_image,
      },
      options
    )
  }
}

export const assetApi = new AssetApi()
export default assetApi
