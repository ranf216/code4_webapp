import { BaseApiClient } from './base'
import type { ApiResponse } from './base'

export interface ServiceTypeItem {
  type_id: string
  name: string
}

export interface TaskTypeItem {
  type_id: string
  name: string
}

export interface AssetTypeItem {
  type_id: string
  name: string
  icon: string | null
  color: string | null
}

export interface ServiceTypesResponse {
  rc: number
  message: string
  items: ServiceTypeItem[]
}

export interface TaskTypesResponse {
  rc: number
  message: string
  items: TaskTypeItem[]
}

export interface AssetTypesResponse {
  rc: number
  message: string
  items: AssetTypeItem[]
}

export interface PostOrderSectionTypeItem {
  type_id: string
  name: string
  client_visible: boolean
  short_description: string
  active: boolean
}

export interface PostOrderSectionTypesResponse {
  rc: number
  message: string
  items: PostOrderSectionTypeItem[]
}

export interface TypeMutationResponse {
  rc: number
  message: string
  type_id?: string
}

export class SettingsApi extends BaseApiClient {
  /**
   * Get service/incident types
   * @returns List of service and incident types
   */
  async getServiceTypes(): Promise<ApiResponse<ServiceTypesResponse>> {
    const request = {
      '#request': 'Settings/get_service_types',
    }

    return this.request<ServiceTypesResponse>(request)
  }

  /**
   * Get task/maintenance report types
   * @returns List of task/maintenance types
   */
  async getTaskTypes(): Promise<ApiResponse<TaskTypesResponse>> {
    const request = {
      '#request': 'Settings/get_task_types',
    }

    return this.request<TaskTypesResponse>(request)
  }

  /**
   * Add a new service type
   * @param name - The name of the service type
   * @returns Response with the new type_id
   */
  async addServiceType(name: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/add_service_type',
      name: name.trim(),
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Add a new task type
   * @param name - The name of the task type
   * @returns Response with the new type_id
   */
  async addTaskType(name: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/add_task_type',
      name: name.trim(),
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Update a service type
   * @param typeId - The ID of the service type to update
   * @param name - The new name for the service type
   * @returns Response with success status
   */
  async updateServiceType(typeId: string, name: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/update_service_type',
      type_id: typeId,
      name: name.trim(),
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Update a task type
   * @param typeId - The ID of the task type to update
   * @param name - The new name for the task type
   * @returns Response with success status
   */
  async updateTaskType(typeId: string, name: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/update_task_type',
      type_id: typeId,
      name: name.trim(),
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Delete a service type
   * @param typeId - The ID of the service type to delete
   * @returns Response with success status
   */
  async deleteServiceType(typeId: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/delete_service_type',
      type_id: typeId,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Delete a task type
   * @param typeId - The ID of the task type to delete
   * @returns Response with success status
   */
  async deleteTaskType(typeId: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/delete_task_type',
      type_id: typeId,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Get asset types
   * @returns List of asset types
   */
  async getAssetTypes(): Promise<ApiResponse<AssetTypesResponse>> {
    const request = {
      '#request': 'Settings/get_asset_types',
    }

    return this.request<AssetTypesResponse>(request)
  }

  /**
   * Add a new asset type
   * @param name - The name of the asset type
   * @param icon - The icon file ID for the asset type
   * @param color - The display color for the asset type (hex code, e.g. "#FF5733")
   * @returns Response with the new type_id
   */
  async addAssetType(name: string, icon: string, color: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/add_asset_type',
      name: name.trim(),
      icon,
      color,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Update an asset type
   * @param typeId - The ID of the asset type to update
   * @param name - The new name for the asset type
   * @param icon - The updated icon file ID for the asset type
   * @param color - The updated display color for the asset type (hex code, e.g. "#FF5733")
   * @returns Response with success status
   */
  async updateAssetType(typeId: string, name: string, icon: string, color: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/update_asset_type',
      type_id: typeId,
      name: name.trim(),
      icon,
      color,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Delete an asset type
   * @param typeId - The ID of the asset type to delete
   * @returns Response with success status
   */
  async deleteAssetType(typeId: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/delete_asset_type',
      type_id: typeId,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Get post order section types
   * @returns List of post order section types
   */
  async getPostOrderSectionTypes(): Promise<ApiResponse<PostOrderSectionTypesResponse>> {
    const request = {
      '#request': 'Settings/get_po_section_types',
    }

    return this.request<PostOrderSectionTypesResponse>(request)
  }

  /**
   * Add a new post order section type
   */
  async addPostOrderSectionType(
    name: string,
    clientVisible: boolean,
    shortDescription: string,
    active: boolean
  ): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/add_po_section_type',
      name: name.trim(),
      client_visible: clientVisible,
      short_description: shortDescription.trim(),
      active,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Update a post order section type
   */
  async updatePostOrderSectionType(
    typeId: string,
    name: string,
    clientVisible: boolean,
    shortDescription: string,
    active: boolean
  ): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/update_po_section_type',
      type_id: typeId,
      name: name.trim(),
      client_visible: clientVisible,
      short_description: shortDescription.trim(),
      active,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Delete a post order section type
   */
  async deletePostOrderSectionType(typeId: string): Promise<ApiResponse<TypeMutationResponse>> {
    const request = {
      '#request': 'Settings/delete_po_section_type',
      type_id: typeId,
    }

    return this.request<TypeMutationResponse>(request)
  }

  /**
   * Get push notification settings
   */
  async getNotificationSettings(): Promise<ApiResponse<NotificationSettingsResponse>> {
    const request = {
      '#request': 'Settings/get_notification_settings',
    }

    return this.request<NotificationSettingsResponse>(request)
  }

  /**
   * Save push notification settings
   */
  async saveNotificationSettings(settings: SaveNotificationSettingsRequest): Promise<ApiResponse<SaveNotificationSettingsResponse>> {
    const request = {
      '#request': 'Settings/update_notification_settings',
      ...settings,
    }

    return this.request<SaveNotificationSettingsResponse>(request)
  }

  /**
   * Get POI & Trespass settings
   */
  async getPoiSettings(): Promise<ApiResponse<PoiSettingsResponse>> {
    const request = {
      '#request': 'Settings/get_poi_settings',
    }

    return this.request<PoiSettingsResponse>(request)
  }

  /**
   * Update POI & Trespass settings
   */
  async updatePoiSettings(settings: UpdatePoiSettingsRequest): Promise<ApiResponse<UpdatePoiSettingsResponse>> {
    const request = {
      '#request': 'Settings/update_poi_settings',
      ...settings,
    }

    return this.request<UpdatePoiSettingsResponse>(request)
  }

  /**
   * Get GPS & tracking settings
   */
  async getGpsSettings(): Promise<ApiResponse<GpsSettingsResponse>> {
    const request = {
      '#request': 'Settings/get_gps_settings',
    }

    return this.request<GpsSettingsResponse>(request)
  }

  /**
   * Update GPS & tracking settings
   */
  async updateGpsSettings(settings: UpdateGpsSettingsRequest): Promise<ApiResponse<UpdateGpsSettingsResponse>> {
    const request = {
      '#request': 'Settings/update_gps_settings',
      ...settings,
    }

    return this.request<UpdateGpsSettingsResponse>(request)
  }

  /**
   * Get working hours settings
   */
  async getWorkingHoursSettings(): Promise<ApiResponse<WorkingHoursSettingsResponse>> {
    const request = {
      '#request': 'Settings/get_working_hours_settings',
    }

    return this.request<WorkingHoursSettingsResponse>(request)
  }

  /**
   * Update working hours settings
   */
  async updateWorkingHoursSettings(max_hours_per_day: number): Promise<ApiResponse<UpdateWorkingHoursSettingsResponse>> {
    const request = {
      '#request': 'Settings/update_working_hours_settings',
      max_hours_per_day,
    }

    return this.request<UpdateWorkingHoursSettingsResponse>(request)
  }
}

export interface NotificationSettingsResponse {
  rc: number
  message: string
  notification_methods: string
  notification_title: string
  sender_name: string
  new_call_enabled: boolean
  call_accepted_enabled: boolean
  call_edited_enabled: boolean
  call_resolved_enabled: boolean
  post_order_published_enabled: boolean
  post_order_updated_enabled: boolean
  poi_active_enabled: boolean
  poi_updated_enabled: boolean
  poi_inactivated_enabled: boolean
  poi_expiring_enabled: boolean
  poi_expired_enabled: boolean
  report_submitted_enabled: boolean
  report_approved_enabled: boolean
  report_changes_enabled: boolean
  report_delivered_enabled: boolean
}

export interface SaveNotificationSettingsRequest {
  notification_methods: string
  notification_title: string
  sender_name: string
  new_call_enabled: boolean
  call_accepted_enabled: boolean
  call_edited_enabled: boolean
  call_resolved_enabled: boolean
  post_order_published_enabled: boolean
  post_order_updated_enabled: boolean
  poi_active_enabled: boolean
  poi_updated_enabled: boolean
  poi_inactivated_enabled: boolean
  poi_expiring_enabled: boolean
  poi_expired_enabled: boolean
  report_submitted_enabled: boolean
  report_approved_enabled: boolean
  report_changes_enabled: boolean
  report_delivered_enabled: boolean
}

export interface SaveNotificationSettingsResponse {
  rc: number
  message: string
}

export interface PoiSettingsResponse {
  rc: number
  message: string
  renewal_reminder_days: number
  archive_threshold_months: number
  pdf_export_enabled: boolean
  default_poi_guidance: string
  default_trespass_guidance: string
  default_red_card_guidance: string
}

export interface UpdatePoiSettingsRequest {
  renewal_reminder_days: number
  archive_threshold_months: number
  pdf_export_enabled: boolean
  default_poi_guidance: string
  default_trespass_guidance: string
  default_red_card_guidance: string
}

export interface UpdatePoiSettingsResponse {
  rc: number
  message: string
}

export interface GpsSettingsResponse {
  rc: number
  message: string
  gps_interval_normal: number
  gps_interval_emergency: number
  gps_stale_threshold: number
  location_history_retention: number
  map_refresh_interval: number
  patrol_compliance_threshold: number
  emergency_eta_interval: number
  map_provider: string
}

export interface UpdateGpsSettingsRequest {
  gps_interval_normal: number
  gps_interval_emergency: number
  gps_stale_threshold: number
  location_history_retention: number
  map_refresh_interval: number
  patrol_compliance_threshold: number
  emergency_eta_interval: number
  map_provider: string
}

export interface UpdateGpsSettingsResponse {
  rc: number
  message: string
}

export interface WorkingHoursSettingsResponse {
  rc: number
  message: string
  max_hours_per_day: number
}

export interface UpdateWorkingHoursSettingsResponse {
  rc: number
  message: string
}

// Export singleton instance
export const settingsApi = new SettingsApi()
export default settingsApi
