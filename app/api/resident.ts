import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetResidentsRequest,
  GetResidentsResponse,
  GetResidentRequest,
  GetResidentResponse,
  AddResidentRequest,
  AddResidentResponse,
  UpdateResidentRequest,
  DeleteResidentRequest,
} from './types/resident'

export class ResidentApi extends BaseApiClient {
  /**
   * Admin: Get list of residents with optional filters, search, and sorting
   */
  async getResidents(
    params: Omit<GetResidentsRequest, '#request'>,
    options?: { showLoading?: boolean }
  ): Promise<ApiResponse<GetResidentsResponse>> {
    const request: GetResidentsRequest = {
      '#request': 'Resident/get_residents',
      ...params,
    }
    return this.request<GetResidentsResponse>(request, options)
  }

  /**
   * Admin: Get full details of a single resident
   */
  async getResident(userId: string, options?: { showLoading?: boolean }): Promise<ApiResponse<GetResidentResponse>> {
    const request: GetResidentRequest = {
      '#request': 'Resident/get_resident',
      user_id: userId,
    }
    return this.request<GetResidentResponse>(request, options)
  }

  /**
   * Admin: Create a new resident and associate them with a community
   */
  async addResident(
    params: Omit<AddResidentRequest, '#request'>,
    options?: { showLoading?: boolean }
  ): Promise<ApiResponse<AddResidentResponse>> {
    const request: AddResidentRequest = {
      '#request': 'Resident/add_resident',
      ...params,
    }
    return this.request<AddResidentResponse>(request, options)
  }

  /**
   * Admin: Update an existing resident (partial update)
   */
  async updateResident(
    params: Omit<UpdateResidentRequest, '#request'>,
    options?: { showLoading?: boolean }
  ): Promise<ApiResponse<void>> {
    const request: UpdateResidentRequest = {
      '#request': 'Resident/update_resident',
      ...params,
    }
    return this.request<void>(request, options)
  }

  /**
   * Admin: Soft-delete a resident (only allowed if never logged in)
   */
  async deleteResident(userId: string, options?: { showLoading?: boolean }): Promise<ApiResponse<void>> {
    const request: DeleteResidentRequest = {
      '#request': 'Resident/delete_resident',
      user_id: userId,
    }
    return this.request<void>(request, options)
  }
}

// Export singleton instance
export const residentApi = new ResidentApi()
export default residentApi
