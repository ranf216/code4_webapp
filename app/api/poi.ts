import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  ArchivePoiRecordRequest,
  CreatePoiRecordRequest,
  CreatePoiRecordResponse,
  ExportPoiRecordRequest,
  ExportPoiRecordResponse,
  GetPoiListRequest,
  GetPoiListResponse,
  GetPoiMetadataRequest,
  GetPoiRecordRequest,
  GetPoiRecordResponse,
  InactivatePoiRecordRequest,
  PublishPoiRecordRequest,
  UpdatePoiRecordRequest,
  PoiMetadataResponse,
} from './types/poi'

type RequestOptions = { showLoading?: boolean; loadingMessage?: string }

class PoiApi extends BaseApiClient {
  /**
   * Get POI metadata (record types, threat levels, statuses, genders, guidance).
   * ACL: Admin or Officer.
   */
  async getPoiMetadata(options?: RequestOptions): Promise<ApiResponse<PoiMetadataResponse>> {
    const request: GetPoiMetadataRequest = {
      '#request': 'Poi/get_poi_metadata',
    }
    return this.request<PoiMetadataResponse>(request, options)
  }

  /**
   * Get a paginated, filterable list of POI records.
   * ACL: Admin or Officer. Admins see all statuses; officers see only active records.
   */
  async getPoiList(
    params: Omit<GetPoiListRequest, '#request'> = {},
    options?: RequestOptions
  ): Promise<ApiResponse<GetPoiListResponse>> {
    return this.request<GetPoiListResponse>(
      {
        '#request': 'Poi/get_poi_list',
        ...params,
      },
      options
    )
  }

  /**
   * Get full details of a single POI record.
   * ACL: Admin or Officer.
   */
  async getPoiRecord(
    recordId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<GetPoiRecordResponse>> {
    const request: GetPoiRecordRequest = {
      '#request': 'Poi/get_poi_record',
      record_id: recordId,
    }
    return this.request<GetPoiRecordResponse>(request, options)
  }

  /**
   * Create a new POI / Trespass Order / Metro Red Card record.
   * ACL: Admin only. Created in draft unless publish=true.
   */
  async createPoiRecord(
    params: Omit<CreatePoiRecordRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<CreatePoiRecordResponse>> {
    return this.request<CreatePoiRecordResponse>(
      {
        '#request': 'Poi/create_poi_record',
        ...params,
      },
      options
    )
  }

  /**
   * Update an existing POI record.
   * ACL: Admin only. Send null to skip a field; send arrays to replace the full set.
   */
  async updatePoiRecord(
    params: Omit<UpdatePoiRecordRequest, '#request'>,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Poi/update_poi_record',
        ...params,
      },
      options
    )
  }

  /**
   * Publish a draft POI record (transitions to active).
   * ACL: Admin only.
   */
  async publishPoiRecord(
    recordId: number,
    notifyOfficers = true,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: PublishPoiRecordRequest = {
      '#request': 'Poi/publish_poi_record',
      record_id: recordId,
      notify_officers: notifyOfficers,
    }
    return this.request<void>(request, options)
  }

  /**
   * Inactivate an active POI record with a mandatory reason.
   * ACL: Admin only.
   */
  async inactivatePoiRecord(
    recordId: number,
    reason: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: InactivatePoiRecordRequest = {
      '#request': 'Poi/inactivate_poi_record',
      record_id: recordId,
      reason,
    }
    return this.request<void>(request, options)
  }

  /**
   * Archive an expired or inactive POI record.
   * ACL: Admin only. Archived records cannot be re-activated.
   */
  async archivePoiRecord(
    recordId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const request: ArchivePoiRecordRequest = {
      '#request': 'Poi/archive_poi_record',
      record_id: recordId,
    }
    return this.request<void>(request, options)
  }

  /**
   * Generate a watermarked PDF export of a POI record.
   * ACL: Admin only.
   */
  async exportPoiRecord(
    recordId: number,
    options?: RequestOptions
  ): Promise<ApiResponse<ExportPoiRecordResponse>> {
    const request: ExportPoiRecordRequest = {
      '#request': 'Poi/export_poi_record',
      record_id: recordId,
    }
    return this.request<ExportPoiRecordResponse>(request, options)
  }
}

export const poiApi = new PoiApi()
export default poiApi
