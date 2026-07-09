import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  GetOfficersRequest,
  GetOfficersResponse,
  GetOfficerRequest,
  GetOfficerResponse,
  AddOfficerRequest,
  AddOfficerResponse,
  UpdateOfficerRequest,
  DeleteOfficerRequest,
  GetOfficerEvaluationsRequest,
  GetOfficerEvaluationsResponse,
  AddOfficerEvaluationRequest,
  AddOfficerEvaluationResponse,
  DeleteOfficerEvaluationRequest,
  GetMyDetailsRequest,
  GetMyDetailsResponse,
  UpdateMyDetailsRequest,
  GetOfficersInfoRequest,
  GetOfficersInfoResponse,
} from './types/officer'

export class OfficerApi extends BaseApiClient {
  /**
   * Admin: Get list of officers with optional filters, search, and sorting
   */
  async getOfficers(params: Omit<GetOfficersRequest, '#request'>): Promise<ApiResponse<GetOfficersResponse>> {
    const request: GetOfficersRequest = {
      '#request': 'Officer/get_officers',
      ...params,
    }
    return this.request<GetOfficersResponse>(request)
  }

  /**
   * Admin: Get full details of a single officer including evaluations
   */
  async getOfficer(userId: string): Promise<ApiResponse<GetOfficerResponse>> {
    const request: GetOfficerRequest = {
      '#request': 'Officer/get_officer',
      user_id: userId,
    }
    return this.request<GetOfficerResponse>(request)
  }

  /**
   * Admin: Create a new officer
   */
  async addOfficer(params: Omit<AddOfficerRequest, '#request'>): Promise<ApiResponse<AddOfficerResponse>> {
    const request: AddOfficerRequest = {
      '#request': 'Officer/add_officer',
      ...params,
    }
    return this.request<AddOfficerResponse>(request)
  }

  /**
   * Admin: Update an existing officer (partial update)
   */
  async updateOfficer(params: Omit<UpdateOfficerRequest, '#request'>): Promise<ApiResponse<void>> {
    const request: UpdateOfficerRequest = {
      '#request': 'Officer/update_officer',
      ...params,
    }
    return this.request<void>(request)
  }

  /**
   * Admin: Soft-delete an officer (only allowed if never logged in)
   */
  async deleteOfficer(userId: string): Promise<ApiResponse<void>> {
    const request: DeleteOfficerRequest = {
      '#request': 'Officer/delete_officer',
      user_id: userId,
    }
    return this.request<void>(request)
  }

  /**
   * Admin: Get all evaluations for a specific officer
   */
  async getOfficerEvaluations(userId: string): Promise<ApiResponse<GetOfficerEvaluationsResponse>> {
    const request: GetOfficerEvaluationsRequest = {
      '#request': 'Officer/get_officer_evaluations',
      user_id: userId,
    }
    return this.request<GetOfficerEvaluationsResponse>(request)
  }

  /**
   * Admin: Add a performance evaluation for an officer
   */
  async addOfficerEvaluation(
    params: Omit<AddOfficerEvaluationRequest, '#request'>
  ): Promise<ApiResponse<AddOfficerEvaluationResponse>> {
    const request: AddOfficerEvaluationRequest = {
      '#request': 'Officer/add_officer_evaluation',
      ...params,
    }
    return this.request<AddOfficerEvaluationResponse>(request)
  }

  /**
   * Admin: Soft-delete an officer evaluation
   */
  async deleteOfficerEvaluation(evaluationId: number): Promise<ApiResponse<void>> {
    const request: DeleteOfficerEvaluationRequest = {
      '#request': 'Officer/delete_officer_evaluation',
      evaluation_id: evaluationId,
    }
    return this.request<void>(request)
  }

  /**
   * Officer (mobile): Get current officer's own profile details
   */
  async getMyDetails(): Promise<ApiResponse<GetMyDetailsResponse>> {
    const request: GetMyDetailsRequest = {
      '#request': 'Officer/get_my_details',
    }
    return this.request<GetMyDetailsResponse>(request)
  }

  /**
   * Officer (mobile): Update current officer's own editable profile fields
   */
  async updateMyDetails(params: Omit<UpdateMyDetailsRequest, '#request'>): Promise<ApiResponse<void>> {
    const request: UpdateMyDetailsRequest = {
      '#request': 'Officer/update_my_details',
      ...params,
    }
    return this.request<void>(request)
  }

  /**
   * Resident (mobile): Get public officer information for the resident's community
   */
  async getOfficersInfo(): Promise<ApiResponse<GetOfficersInfoResponse>> {
    const request: GetOfficersInfoRequest = {
      '#request': 'Officer/get_officers_info',
    }
    return this.request<GetOfficersInfoResponse>(request)
  }
}

// Export singleton instance
export const officerApi = new OfficerApi()
export default officerApi
