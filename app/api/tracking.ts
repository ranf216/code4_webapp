import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetLiveTrackingRequest,
  GetLiveTrackingResponse,
  GetOfficerLocationRequest,
  GetOfficerLocationResponse,
  GetOfficerRouteHistoryRequest,
  GetOfficerRouteHistoryResponse,
} from './types/tracking'

type RequestOptions = { showLoading?: boolean; loadingMessage?: string }

export class TrackingApi extends BaseApiClient {
  async getLiveTracking(
    params: Omit<GetLiveTrackingRequest, '#request'> = {},
    options?: RequestOptions,
  ): Promise<ApiResponse<GetLiveTrackingResponse>> {
    return this.request<GetLiveTrackingResponse>({
      '#request': 'Tracking/get_live_tracking',
      ...params,
    }, options)
  }

  async getOfficerLocation(
    officerId: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<GetOfficerLocationResponse>> {
    const request: GetOfficerLocationRequest = {
      '#request': 'Tracking/get_officer_location',
      officer_id: officerId,
    }
    return this.request<GetOfficerLocationResponse>(request, options)
  }

  async getOfficerRouteHistory(
    params: Omit<GetOfficerRouteHistoryRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<GetOfficerRouteHistoryResponse>> {
    return this.request<GetOfficerRouteHistoryResponse>({
      '#request': 'Tracking/get_officer_route_history',
      ...params,
    }, options)
  }
}

export const trackingApi = new TrackingApi()
export default trackingApi
