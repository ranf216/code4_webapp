// Call type definitions based on API_call.md

export type CallCategory =
  | 'medical_emergency'
  | 'security_emergency'
  | 'panic'
  | 'concierge_service'
  | 'test'

export type CallStatus = 'new' | 'accepted' | 'resolved' | 'canceled'

export type CallPriority = 'urgent' | 'important' | 'normal' | 'low'

export interface Call {
  call_id: number
  category: CallCategory
  service_type: string | null
  status: CallStatus
  priority: CallPriority
  description: string | null
  address: string | null
  current_address: string | null
  latitude: number | string | null
  longitude: number | string | null
  scheduled_date: string | null
  scheduled_time_from: string | null
  scheduled_time_to: string | null
  media: string[]
  audio_url: string | null
  video_url: string | null
  confirmation_media: string[]
  confirmation_video_url: string | null
  officer_comments: string | null
  reaction: number | null
  resident_comment: string | null
  resident_user_id: string | null
  resident_name: string | null
  officer_user_id: string | null
  officer_name: string | null
  community_id: number
  community_name: string | null
  assigned_by: string | null
  accepted_on: string | null
  resolved_on: string | null
  canceled_on: string | null
  created_on: string
  last_update: string | null
}



// Request: Call/get_calls
export interface GetCallsRequest {
  '#request': 'Call/get_calls'
  status?: CallStatus
  category?: CallCategory
  community_id?: number
  is_open?: boolean | null
  search_text?: string
  sort_by?: 'created_on' | 'status' | 'category' | 'priority' | string
  sort_dir?: 'asc' | 'desc' | string
  offset?: number
  limit?: number
}

// Response: Call/get_calls
export interface GetCallsResponse {
  calls: Call[]
  total_count: number
  offset: number
  limit: number
}

// Request: Call/get_call
export interface GetCallRequest {
  '#request': 'Call/get_call'
  call_id: number
}

// Response: Call/get_call
export interface GetCallResponse {
  call: Call
}




// Request: Call/resolve_call
export interface ResolveCallRequest {
  '#request': 'Call/resolve_call'
  call_id: number
  officer_comments?: string
  confirmation_media_file_ids?: string[]
  confirmation_video_file_id?: string
}

// Request: Call/assign_call
export interface AssignCallRequest {
  '#request': 'Call/assign_call'
  call_id: number
  officer_user_id: string
}

// Request: Call/cancel_call
export interface CancelCallRequest {
  '#request': 'Call/cancel_call'
  call_id: number
}



// Request: Call/delete_test_call
export interface DeleteTestCallRequest {
  '#request': 'Call/delete_test_call'
  call_id: number
}

// Call module error codes
export const CallErrorCodes = {
  CALL_NOT_FOUND: 560,
  CALL_ALREADY_ACCEPTED: 561,
  CALL_ALREADY_RESOLVED: 562,
  CALL_ALREADY_CANCELED: 563,
  CALL_CANNOT_BE_ACCEPTED: 564,
  CALL_CANNOT_BE_RESOLVED: 565,
  CALL_CANNOT_BE_CANCELED: 566,
  ACTIVE_EMERGENCY_ALREADY_EXISTS: 567,
  INVALID_CALL_CATEGORY: 568,
  INVALID_CALL_STATUS: 569,
  INVALID_CALL_PRIORITY: 570,
  INVALID_SERVICE_TYPE: 571,
  MAX_MEDIA_FILES_REACHED: 572,
  CALL_NOT_ASSIGNED_TO_OFFICER: 573,
  ONLY_TEST_CALLS_CAN_BE_DELETED: 574,
} as const
