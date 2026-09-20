import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  AllocateOfficerRequest,
  AssignPostRequest,
  AssignPostResponse,
  CancelShiftRequest,
  CreateRecurringShiftsRequest,
  CreateRecurringShiftsResponse,
  CreateShiftRequest,
  CreateShiftResponse,
  DeleteShiftRequest,
  GetAllocationBoardRequest,
  GetAllocationBoardResponse,
  GetShiftRequest,
  GetShiftResponse,
  GetShiftSettingsResponse,
  GetShiftsCalendarRequest,
  GetShiftsCalendarResponse,
  PublishShiftRequest,
  RemoveOfficerRequest,
  ShiftConflictResponse,
  UpdateRecurringShiftsRequest,
  UpdateShiftRequest,
  UpdateShiftSettingsRequest,
  ValidateAllocationRequest,
  ValidateAllocationResponse,
} from './types/shift'

type RequestOptions = { showLoading?: boolean; loadingMessage?: string }

export class ShiftApi extends BaseApiClient {
  async getShiftsCalendar(
    params: Omit<GetShiftsCalendarRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<GetShiftsCalendarResponse>> {
    return this.request<GetShiftsCalendarResponse>({
      '#request': 'Shift/get_shifts_calendar',
      ...params,
    }, options)
  }

  async getShift(
    shiftId: number,
    options?: RequestOptions,
  ): Promise<ApiResponse<GetShiftResponse>> {
    const request: GetShiftRequest = {
      '#request': 'Shift/get_shift',
      shift_id: shiftId,
    }
    return this.request<GetShiftResponse>(request, options)
  }

  async createShift(
    params: Omit<CreateShiftRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<CreateShiftResponse>> {
    return this.request<CreateShiftResponse>({
      '#request': 'Shift/create_shift',
      ...params,
    }, options)
  }

  async updateShift(
    params: Omit<UpdateShiftRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      '#request': 'Shift/update_shift',
      ...params,
    }, options)
  }

  async deleteShift(
    shiftId: number,
    options?: RequestOptions,
  ): Promise<ApiResponse<void>> {
    const request: DeleteShiftRequest = {
      '#request': 'Shift/delete_shift',
      shift_id: shiftId,
    }
    return this.request<void>(request, options)
  }

  async publishShift(
    params: Omit<PublishShiftRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<ShiftConflictResponse>> {
    return this.request<ShiftConflictResponse>({
      '#request': 'Shift/publish_shift',
      ...params,
    }, options)
  }

  async cancelShift(
    shiftId: number,
    options?: RequestOptions,
  ): Promise<ApiResponse<void>> {
    const request: CancelShiftRequest = {
      '#request': 'Shift/cancel_shift',
      shift_id: shiftId,
    }
    return this.request<void>(request, options)
  }

  async allocateOfficer(
    params: Omit<AllocateOfficerRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<ShiftConflictResponse>> {
    return this.request<ShiftConflictResponse>({
      '#request': 'Shift/allocate_officer',
      ...params,
    }, options)
  }

  async removeOfficer(
    params: Omit<RemoveOfficerRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      '#request': 'Shift/remove_officer',
      ...params,
    }, options)
  }

  async assignPost(
    params: Omit<AssignPostRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<AssignPostResponse>> {
    return this.request<AssignPostResponse>({
      '#request': 'Shift/assign_post',
      ...params,
    }, options)
  }

  async getAllocationBoard(
    params: Omit<GetAllocationBoardRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<GetAllocationBoardResponse>> {
    return this.request<GetAllocationBoardResponse>({
      '#request': 'Shift/get_allocation_board',
      ...params,
    }, options)
  }

  async validateAllocation(
    params: Omit<ValidateAllocationRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<ValidateAllocationResponse>> {
    return this.request<ValidateAllocationResponse>({
      '#request': 'Shift/validate_allocation',
      ...params,
    }, options)
  }

  async createRecurringShifts(
    params: Omit<CreateRecurringShiftsRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<CreateRecurringShiftsResponse>> {
    return this.request<CreateRecurringShiftsResponse>({
      '#request': 'Shift/create_recurring_shifts',
      ...params,
    }, options)
  }

  async updateRecurringShifts(
    params: Omit<UpdateRecurringShiftsRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      '#request': 'Shift/update_recurring_shifts',
      ...params,
    }, options)
  }

  async getShiftSettings(options?: RequestOptions): Promise<ApiResponse<GetShiftSettingsResponse>> {
    return this.request<GetShiftSettingsResponse>({
      '#request': 'Settings/get_shift_settings',
    }, options)
  }

  async updateShiftSettings(
    params: Omit<UpdateShiftSettingsRequest, '#request'>,
    options?: RequestOptions,
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      '#request': 'Settings/update_shift_settings',
      ...params,
    }, options)
  }
}

export const shiftApi = new ShiftApi()
export default shiftApi
