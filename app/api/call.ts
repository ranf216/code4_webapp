import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetCallsRequest,
  GetCallsResponse,
  GetCallRequest,
  GetCallResponse,
  ResolveCallRequest,
  AssignCallRequest,
  CancelCallRequest,
  DeleteTestCallRequest,
} from './types/call'

class CallApi extends BaseApiClient {
  /**
   * Get a paginated, role-filtered list of calls.
   * Admins can filter by status, category, community, open/closed, and search text.
   */
  async getCalls(
    params: Omit<GetCallsRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetCallsResponse>> {
    return this.request<GetCallsResponse>(
      {
        '#request': 'Call/get_calls',
        ...params,
      },
      options
    )
  }

  /**
   * Get full details of a single call including media and comments.
   */
  async getCall(
    callId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetCallResponse>> {
    return this.request<GetCallResponse>(
      {
        '#request': 'Call/get_call',
        call_id: callId,
      },
      options
    )
  }

  /**
   * Resolve a call. Admins can resolve any accepted call, including panic calls.
   */
  async resolveCall(
    params: Omit<ResolveCallRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Call/resolve_call',
        ...params,
      },
      options
    )
  }

  /**
   * Admin assigns an officer to a call. The call status changes from new to accepted.
   */
  async assignCall(
    params: Omit<AssignCallRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Call/assign_call',
        ...params,
      },
      options
    )
  }

  /**
   * Cancel a concierge service call. Admins can cancel any concierge call
   * that is in new or accepted status.
   */
  async cancelCall(
    callId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Call/cancel_call',
        call_id: callId,
      },
      options
    )
  }

  /**
   * Soft-delete a test call. Admin only.
   */
  async deleteTestCall(
    callId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Call/delete_test_call',
        call_id: callId,
      },
      options
    )
  }
}

export const callApi = new CallApi()
export default callApi
