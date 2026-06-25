import { BaseApiClient } from './base'
import type { ApiResponse } from './base'

// ─── Types ───────────────────────────────────────────────────

export interface Community {
  community_id: number
  name: string
  area: string
  latitude: number | null
  longitude: number | null
  location_name: string | null
  timezone: string | null
  map_image_url: string | null
  map_boundaries: string | null
  is_active: boolean
  created_on: string
  last_update: string | null
}

export interface GetCommunitiesResponse extends ApiResponse {
  communities: Community[]
}

export interface GetCommunityResponse extends ApiResponse {
  community: Community
}

export interface AddCommunityResponse extends ApiResponse {
  community_id: number
}

export interface SetFeaturedOfficerResponse extends ApiResponse {
  featured_officer_id: number
}

export interface FeaturedOfficer {
  featured_officer_id: number
  community_id: number
  image_url: string
  description: string
  created_on: string
  last_update: string | null
}

export interface GetFeaturedOfficerResponse extends ApiResponse {
  featured_officer: FeaturedOfficer
}

// ─── Request param types ─────────────────────────────────────

export interface GetCommunitiesParams {
  include_inactive?: boolean
  search_text?: string
}

export interface AddCommunityParams {
  name: string
  area: string
  latitude?: number
  longitude?: number
  location_name?: string
  timezone?: string
  /** Base64-encoded image string */
  map_image?: string
  map_boundaries?: string
  is_active?: boolean
  officers?: number[]
  residents?: number[]
}

export interface UpdateCommunityParams {
  community_id: number
  name?: string
  area?: string
  latitude?: number
  longitude?: number
  location_name?: string
  timezone?: string
  /** Base64-encoded image string. Send empty string "" to clear the existing image. Omit to keep current. */
  map_image?: string
  map_boundaries?: string
  is_active?: boolean
  /**
   * Replacement list of officer user IDs.
   * - Provided with IDs → replaces all current assignments with this list.
   * - Provided as empty array [] → clears all officer assignments.
   * - Omitted → no change to current assignments.
   */
  officers?: number[]
  /**
   * Replacement list of resident user IDs. Same behaviour as officers.
   */
  residents?: number[]
}

// ─── API Client ──────────────────────────────────────────────

class CommunityApi extends BaseApiClient {
  /**
   * Get all communities. Admin only.
   * Pass include_inactive: true to include deactivated communities.
   * Pass search_text for server-side search (debounce on caller side).
   */
  async getCommunities(
    params: GetCommunitiesParams = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetCommunitiesResponse>> {
    return this.request<GetCommunitiesResponse>({
      '#request': 'Community/get_communities',
      ...params,
    }, options)
  }

  /**
   * Get a single community by ID.
   */
  async getCommunity(communityId: number): Promise<ApiResponse<GetCommunityResponse>> {
    return this.request<GetCommunityResponse>({
      '#request': 'Community/get_community',
      community_id: communityId,
    })
  }

  /**
   * Create a new community. Admin only.
   * map_image should be a base64 string (use fileToBase64 helper from useFileApi).
   */
  async addCommunity(params: AddCommunityParams): Promise<ApiResponse<AddCommunityResponse>> {
    return this.request<AddCommunityResponse>({
      '#request': 'Community/add_community',
      ...params,
    })
  }

  /**
   * Update an existing community. Admin only.
   * Only provided fields are modified. Officers/residents arrays are full-replacement when provided.
   * Pass empty array [] to clear all assignments.
   * Omit the field entirely to leave assignments unchanged.
   */
  async updateCommunity(params: UpdateCommunityParams): Promise<ApiResponse> {
    return this.request({
      '#request': 'Community/update_community',
      ...params,
    })
  }

  /**
   * Soft-delete a community. Admin only.
   * Fails with rc 502/503/504 if community has active officers/residents/calls.
   */
  async deleteCommunity(communityId: number): Promise<ApiResponse> {
    return this.request({
      '#request': 'Community/delete_community',
      community_id: communityId,
    })
  }

  /**
   * Get the featured officer banner for a community.
   * Returns rc 506 if no banner exists.
   */
  async getFeaturedOfficer(communityId: number): Promise<ApiResponse<GetFeaturedOfficerResponse>> {
    return this.request<GetFeaturedOfficerResponse>({
      '#request': 'Community/get_featured_officer',
      community_id: communityId,
    })
  }

  /**
   * Create or update the featured officer banner. Admin only.
   * Both image (base64) and description are mandatory.
   */
  async setFeaturedOfficer(
    communityId: number,
    image: string,
    description: string
  ): Promise<ApiResponse<SetFeaturedOfficerResponse>> {
    return this.request<SetFeaturedOfficerResponse>({
      '#request': 'Community/set_featured_officer',
      community_id: communityId,
      image,
      description,
    })
  }

  /**
   * Delete the featured officer banner for a community. Admin only.
   * Returns rc 506 if no banner exists.
   */
  async deleteFeaturedOfficer(communityId: number): Promise<ApiResponse> {
    return this.request({
      '#request': 'Community/delete_featured_officer',
      community_id: communityId,
    })
  }
}

export const communityApi = new CommunityApi()
