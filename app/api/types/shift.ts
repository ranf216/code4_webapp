export type ShiftStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
export type ShiftRecurrencePattern = 'daily' | 'specific_days' | 'every_x_days'
export type ShiftRecurrenceEndType = 'end_date' | 'occurrences' | 'no_end'
export type ShiftRecurringUpdateScope = 'this_only' | 'this_and_future' | 'all'
export type ShiftConflictType =
  | 'double_booking'
  | 'rest_gap'
  | 'overtime'
  | 'DOUBLE_BOOKING'
  | 'REST_GAP_WARNING'
  | 'OVERTIME_WARNING'

export interface ShiftOfficer {
  officer_id: string
  name: string
}

export interface ShiftPostAssignment {
  officer_id: string
  post_id: number
  post_name: string
}

export interface ShiftCheckin {
  officer_id: string
  check_in_on: string
  check_out_on: string | null
  total_hours: number | null
}

export interface Shift {
  shift_id: number
  community_id: number
  community_name: string | null
  series_id: number | null
  shift_date: string
  start_time: string
  end_time: string
  is_overnight: boolean
  status: ShiftStatus
  notes: string | null
  published_on: string | null
  published_by: string | null
  cancelled_on: string | null
  cancelled_by: string | null
  created_by: string
  created_on: string
  last_update: string | null
  officers: ShiftOfficer[]
  posts: ShiftPostAssignment[]
}

export interface ShiftDetails extends Shift {
  checkins: ShiftCheckin[]
}

export interface ShiftConflictWarning {
  type: ShiftConflictType
  message: string
  officer_id?: string
  officer_name?: string
  conflicting_shift_id?: number
  conflicting_shift_date?: string
  gap_hours?: number
  planned_hours?: number
  current_weekly_hours?: number
  max_weekly_hours?: number
  additional_hours?: number
}

export interface ShiftConflictResponse {
  warnings: ShiftConflictWarning[]
  requires_acknowledgment: boolean
}

export interface PostEligibilityWarning {
  type: 'post_eligibility_mismatch' | 'POST_ELIGIBILITY_MISMATCH'
  missing_roles: string[]
  missing_badges: string[]
  message: string
}

export interface GetShiftsCalendarRequest {
  '#request': 'Shift/get_shifts_calendar'
  community_id?: number
  date_from: string
  date_to: string
  officer_id?: string
  status?: ShiftStatus
  search_text?: string
}

export interface GetShiftsCalendarResponse {
  shifts: Shift[]
}

export interface GetShiftRequest {
  '#request': 'Shift/get_shift'
  shift_id: number
}

export interface GetShiftResponse {
  shift: ShiftDetails
}

export interface CreateShiftRequest {
  '#request': 'Shift/create_shift'
  community_id: number
  shift_date: string
  start_time: string
  end_time: string
  officer_ids?: string[]
  notes?: string
}

export interface CreateShiftResponse {
  shift_id: number
}

export interface UpdateShiftRequest {
  '#request': 'Shift/update_shift'
  shift_id: number
  shift_date?: string | null
  start_time?: string | null
  end_time?: string | null
  notes?: string | null
}

export interface ShiftIdRequest {
  shift_id: number
}

export interface PublishShiftRequest extends ShiftIdRequest {
  '#request': 'Shift/publish_shift'
  acknowledge_conflicts?: boolean
}

export interface CancelShiftRequest extends ShiftIdRequest {
  '#request': 'Shift/cancel_shift'
}

export interface DeleteShiftRequest extends ShiftIdRequest {
  '#request': 'Shift/delete_shift'
}

export interface AllocateOfficerRequest extends ShiftIdRequest {
  '#request': 'Shift/allocate_officer'
  officer_id: string
  acknowledge_conflicts?: boolean
}

export interface RemoveOfficerRequest extends ShiftIdRequest {
  '#request': 'Shift/remove_officer'
  officer_id: string
}

export interface AssignPostRequest extends ShiftIdRequest {
  '#request': 'Shift/assign_post'
  officer_id: string
  post_id: number
}

export interface AssignPostResponse {
  warning?: PostEligibilityWarning
}

export interface AllocationBoardOfficer {
  officer_id: string
  name: string
  weekly_hours: number
  roles?: string[]
  certification_badges?: string[]
}

export interface AllocationBoardShift extends Omit<Shift, 'officers' | 'posts'> {
  allocated_officer_ids: string[]
}

export interface GetAllocationBoardRequest {
  '#request': 'Shift/get_allocation_board'
  community_id: number
  board_date: string
}

export interface GetAllocationBoardResponse {
  officers: AllocationBoardOfficer[]
  shifts: AllocationBoardShift[]
}

export interface ValidateAllocationRequest extends ShiftIdRequest {
  '#request': 'Shift/validate_allocation'
  officer_id: string
}

export interface ValidateAllocationResponse {
  warnings: ShiftConflictWarning[]
  has_conflicts: boolean
}

export interface CreateRecurringShiftsRequest {
  '#request': 'Shift/create_recurring_shifts'
  community_id: number
  start_date: string
  start_time: string
  end_time: string
  recurrence_pattern: ShiftRecurrencePattern
  repeat_on?: number[]
  interval_days?: number
  end_type: ShiftRecurrenceEndType
  end_date?: string
  occurrences?: number
  officer_ids?: string[]
  notes?: string
}

export interface CreateRecurringShiftsResponse {
  series_id: number
  shift_ids: number[]
  shifts_created?: number
  shift_count?: number
}

export interface UpdateRecurringShiftsRequest extends ShiftIdRequest {
  '#request': 'Shift/update_recurring_shifts'
  scope: ShiftRecurringUpdateScope
  start_time?: string | null
  end_time?: string | null
  notes?: string | null
}

export interface ShiftSettings {
  max_weekly_hours: number
  min_rest_gap_hours: number
  auto_checkout_grace_mins: number
  shift_starting_soon_lead_mins: number
  early_checkin_window_mins: number
}

export interface GetShiftSettingsResponse {
  settings: ShiftSettings
}

export interface UpdateShiftSettingsRequest extends Partial<ShiftSettings> {
  '#request': 'Settings/update_shift_settings'
}

export const ShiftErrorCodes = {
  SHIFT_NOT_FOUND: 610,
  SHIFT_INVALID_STATUS: 611,
  SHIFT_CANNOT_PUBLISH: 612,
  SHIFT_CANNOT_CANCEL: 613,
  OFFICER_ALREADY_ALLOCATED: 614,
  OFFICER_NOT_ALLOCATED: 615,
  OFFICER_CONFLICT: 616,
  ALREADY_CHECKED_IN: 617,
  NOT_CHECKED_IN: 618,
  INVALID_TIME_RANGE: 619,
  SHIFT_CANNOT_UPDATE: 620,
  SHIFT_CANNOT_DELETE: 621,
  POST_NOT_FOUND: 622,
  OFFICER_NOT_IN_COMMUNITY: 623,
  INVALID_RECURRENCE: 624,
  SERIES_NOT_FOUND: 625,
  SHIFT_ALREADY_ACTIVE: 626,
  SHIFT_ALREADY_COMPLETED: 627,
  SHIFT_ALREADY_CANCELLED: 628,
  SHIFT_NO_OFFICERS: 629,
} as const
