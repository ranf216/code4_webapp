export type TrackingSource = 'gps' | 'network' | 'manual'
export type OfficerTrackingStatus = 'green' | 'blue' | 'amber' | 'red' | 'grey'

export interface TrackingLocation {
  latitude: number
  longitude: number
  accuracy: number | null
  speed: number | null
  heading: number | null
  altitude: number | null
  source: TrackingSource
  shift_id: number | null
  call_id: number | null
  recorded_on: string
}

export interface LiveTrackingOfficer {
  officer_id: string
  first_name: string
  last_name: string
  image: string
  community_id: number
  community_name: string
  latitude: number
  longitude: number
  accuracy: number | null
  speed: number | null
  heading: number | null
  last_update: string
  is_stale: boolean
  status: OfficerTrackingStatus
  is_checked_in: boolean
  shift_id: number | null
  shift_date: string | null
  shift_start_time: string | null
  shift_end_time: string | null
  active_call_id: number | null
  active_call_category: string | null
}

export interface GetLiveTrackingRequest {
  '#request': 'Tracking/get_live_tracking'
  community_id?: number
}

export interface GetLiveTrackingResponse {
  officers: LiveTrackingOfficer[]
  stale_threshold_min: number
}

export interface GetOfficerLocationRequest {
  '#request': 'Tracking/get_officer_location'
  officer_id: string
}

export interface GetOfficerLocationResponse {
  officer_id: string
  first_name: string
  last_name: string
  image: string
  community_id: number | null
  location: TrackingLocation
  is_stale: boolean
  minutes_since_update: number
  is_checked_in: boolean
  active_call_id: number | null
  active_call_category: string | null
}

export interface GetOfficerRouteHistoryRequest {
  '#request': 'Tracking/get_officer_route_history'
  officer_id: string
  date_from: string
  date_to: string
  shift_id?: number
}

export interface GetOfficerRouteHistoryResponse {
  officer_id: string
  date_from: string
  date_to: string
  num_of_items: number
  points: TrackingLocation[]
}

export const TrackingErrorCodes = {
  OFFICER_NOT_FOUND: 661,
  NO_LOCATION_DATA: 664,
  INVALID_TIME_RANGE: 666,
} as const
