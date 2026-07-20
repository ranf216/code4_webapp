import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkAllAsReadResponse,
  CreateNotificationRequest,
  CreateNotificationResponse,
  CreateBulkNotificationsRequest,
  CreateBulkNotificationsResponse,
  NotificationType,
} from './types/notification'

class NotificationApi extends BaseApiClient {
  /**
   * Get paginated list of notifications for the authenticated user.
   * Supports filtering by read status, type, and date range.
   */
  async getNotifications(
    params: Omit<GetNotificationsRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetNotificationsResponse>> {
    return this.request<GetNotificationsResponse>(
      {
        '#request': 'Notification/get_notifications',
        ...params,
      },
      options
    )
  }

  /**
   * Get total count of unread notifications for the authenticated user.
   */
  async getUnreadCount(
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetUnreadCountResponse>> {
    return this.request<GetUnreadCountResponse>(
      {
        '#request': 'Notification/get_unread_count',
      },
      options
    )
  }

  /**
   * Mark a single notification as read. Only the notification owner can do this.
   */
  async markAsRead(
    notificationId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Notification/mark_as_read',
        notification_id: notificationId,
      },
      options
    )
  }

  /**
   * Mark all unread notifications as read for the authenticated user.
   */
  async markAllAsRead(
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<MarkAllAsReadResponse>> {
    return this.request<MarkAllAsReadResponse>(
      {
        '#request': 'Notification/mark_all_as_read',
      },
      options
    )
  }

  /**
   * Create a notification for a single target user.
   * Optionally triggers push delivery (FCM, email) and real-time WebSocket event.
   */
  async createNotification(
    params: Omit<CreateNotificationRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<CreateNotificationResponse>> {
    return this.request<CreateNotificationResponse>(
      {
        '#request': 'Notification/create_notification',
        ...params,
      },
      options
    )
  }

  /**
   * Create notifications for multiple target users at once.
   * More efficient than calling createNotification in a loop.
   */
  async createBulkNotifications(
    params: Omit<CreateBulkNotificationsRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<CreateBulkNotificationsResponse>> {
    return this.request<CreateBulkNotificationsResponse>(
      {
        '#request': 'Notification/create_bulk_notifications',
        ...params,
      },
      options
    )
  }

  /**
   * Soft-delete a notification. Only the notification owner can delete their own notifications.
   */
  async deleteNotification(
    notificationId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Notification/delete_notification',
        notification_id: notificationId,
      },
      options
    )
  }
}

export const notificationApi = new NotificationApi()
export default notificationApi
