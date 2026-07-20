// Notification type keys
export type NotificationType =
  | 'new_emergency'
  | 'new_service_call'
  | 'call_accepted'
  | 'call_resolved'
  | 'call_updated'
  | 'call_canceled'
  | 'resident_like'
  | 'new_incident_report'
  | 'report_submitted'
  | 'report_approved'
  | 'report_changes_requested'
  | 'report_delivered'
  | 'shift_published'
  | 'shift_updated'
  | 'shift_cancelled'
  | 'shift_starting_soon'
  | 'route_updated'
  | 'post_order_published'
  | 'post_order_updated'
  | 'poi_active'
  | 'poi_updated'
  | 'poi_inactivated'
  | 'poi_expiring_soon'
  | 'poi_expired'
  | 'task_update'
  | 'panic_button'
  | 'gps_signal_lost'
  | 'officer_off_route'
  | 'general'

// Notification object returned by get_notifications
export interface Notification {
  notification_id: number
  type: NotificationType
  title: string
  message: string
  payload: { entity_type?: string; entity_id?: number; [key: string]: any } | null
  is_read: boolean
  read_on: string | null
  sender_id: string
  community_id: number | null
  created_on: string
}

// Request: Notification/get_notifications
export interface GetNotificationsRequest {
  '#request': 'Notification/get_notifications'
  is_read?: boolean | null
  type?: NotificationType
  from_date?: string
  to_date?: string
  offset?: number
  limit?: number
}

// Response: Notification/get_notifications
export interface GetNotificationsResponse {
  notifications: Notification[]
  total_count: number
  offset: number
  limit: number
}

// Request: Notification/get_unread_count
export interface GetUnreadCountRequest {
  '#request': 'Notification/get_unread_count'
}

// Response: Notification/get_unread_count
export interface GetUnreadCountResponse {
  unread_count: number
}

// Request: Notification/mark_as_read
export interface MarkAsReadRequest {
  '#request': 'Notification/mark_as_read'
  notification_id: number
}

// Request: Notification/mark_all_as_read
export interface MarkAllAsReadRequest {
  '#request': 'Notification/mark_all_as_read'
}

// Response: Notification/mark_all_as_read
export interface MarkAllAsReadResponse {
  updated_count: number
}

// Request: Notification/create_notification
export interface CreateNotificationRequest {
  '#request': 'Notification/create_notification'
  target_user_id: string
  type: NotificationType
  title?: string
  message?: string
  template_vars?: string
  payload?: string
  community_id?: number
  send_push?: boolean
}

// Response: Notification/create_notification
export interface CreateNotificationResponse {
  notification_id?: number
  skipped?: boolean
}

// Request: Notification/create_bulk_notifications
export interface CreateBulkNotificationsRequest {
  '#request': 'Notification/create_bulk_notifications'
  target_user_ids: string[]
  type: NotificationType
  title?: string
  message?: string
  template_vars?: string
  payload?: string
  community_id?: number
  send_push?: boolean
}

// Response: Notification/create_bulk_notifications
export interface CreateBulkNotificationsResponse {
  created_count?: number
  skipped?: boolean
}

// Request: Notification/delete_notification
export interface DeleteNotificationRequest {
  '#request': 'Notification/delete_notification'
  notification_id: number
}

// Notification module error codes
export const NotificationErrorCodes = {
  NOTIFICATION_NOT_FOUND: 730,
  INVALID_NOTIFICATION_TYPE: 731,
  NOTIFICATION_ALREADY_READ: 732,
} as const
