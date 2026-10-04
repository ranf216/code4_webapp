import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  ArchivePostOrderRequest,
  CreatePostOrderRequest,
  CreatePostOrderResponse,
  DeletePostOrderRequest,
  GetPostOrderRequest,
  GetPostOrderResponse,
  GetPostOrdersListRequest,
  GetPostOrdersListResponse,
  GetPostOrderVersionHistoryRequest,
  GetPostOrderVersionHistoryResponse,
  GetPostOrderVersionRequest,
  GetPostOrderVersionResponse,
  PublishPostOrderRequest,
  PublishPostOrderResponse,
  UpdatePostOrderRequest,
} from './types/postOrder'

type RequestOptions = { showLoading?: boolean; loadingMessage?: string }

class PostOrderApi extends BaseApiClient {
  /**
   * Get a paginated, filterable list of Post Orders (admin-scoped).
   */
  async getPostOrdersList(
    params: Omit<GetPostOrdersListRequest, '#request'> = {},
    options?: RequestOptions
  ): Promise<ApiResponse<GetPostOrdersListResponse>> {
    return this.request<GetPostOrdersListResponse>(
      {
        '#request': 'PostOrder/get_post_orders_list',
        ...params,
      },
      options
    )
  }

  /**
   * Get full details of a single Post Order including sections and attachments.
   */
  async getPostOrder(
    postOrderId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<GetPostOrderResponse>> {
    const request: GetPostOrderRequest = {
      '#request': 'PostOrder/get_post_order',
      post_order_id: postOrderId,
    }
    return this.request<GetPostOrderResponse>(request, options)
  }

  /**
   * Create a new Post Order for a post in Draft status.
   */
  async createPostOrder(
    params: Omit<CreatePostOrderRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<CreatePostOrderResponse>> {
    return this.request<CreatePostOrderResponse>(
      {
        '#request': 'PostOrder/create_post_order',
        ...params,
      },
      options
    )
  }

  /**
   * Update header fields and/or replace all sections of a Post Order.
   * Editing a Published Post Order auto-transitions it to Draft.
   */
  async updatePostOrder(
    params: Omit<UpdatePostOrderRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'PostOrder/update_post_order',
        ...params,
      },
      options
    )
  }

  /**
   * Publish a Draft Post Order, creating an immutable version snapshot.
   */
  async publishPostOrder(
    params: Omit<PublishPostOrderRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<PublishPostOrderResponse>> {
    return this.request<PublishPostOrderResponse>(
      {
        '#request': 'PostOrder/publish_post_order',
        ...params,
      },
      options
    )
  }

  /**
   * Archive a Published Post Order.
   */
  async archivePostOrder(
    postOrderId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: ArchivePostOrderRequest = {
      '#request': 'PostOrder/archive_post_order',
      post_order_id: postOrderId,
    }
    return this.request<void>(request, options)
  }

  /**
   * Soft-delete a Draft Post Order that has never been published.
   */
  async deletePostOrder(
    postOrderId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: DeletePostOrderRequest = {
      '#request': 'PostOrder/delete_post_order',
      post_order_id: postOrderId,
    }
    return this.request<void>(request, options)
  }

  /**
   * Get the chronological list of published versions for a Post Order.
   */
  async getVersionHistory(
    postOrderId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<GetPostOrderVersionHistoryResponse>> {
    const request: GetPostOrderVersionHistoryRequest = {
      '#request': 'PostOrder/get_version_history',
      post_order_id: postOrderId,
    }
    return this.request<GetPostOrderVersionHistoryResponse>(request, options)
  }

  /**
   * Get the full content snapshot of a specific published version.
   */
  async getVersion(
    postOrderId: number,
    versionId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<GetPostOrderVersionResponse>> {
    const request: GetPostOrderVersionRequest = {
      '#request': 'PostOrder/get_version',
      post_order_id: postOrderId,
      version_id: versionId,
    }
    return this.request<GetPostOrderVersionResponse>(request, options)
  }
}

export const postOrderApi = new PostOrderApi()
export default postOrderApi
