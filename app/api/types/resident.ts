import type { ApiResponse } from '../base'

// Resident object returned by admin endpoints
export interface Resident {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone_num: string
  community_id: number
  community_name: string | null
  address: string
  vehicles: string[]
  instructions: string
  images: string[]
  communication_test: boolean
  is_active: boolean
  created_on: string
  last_login: string | null
}

// Request: Resident/get_residents
export interface GetResidentsRequest {
  '#request': 'Resident/get_residents'
  community_id?: number
  include_inactive?: boolean
  search_text?: string
  sort_by?: 'first_name' | 'last_name' | 'community' | 'created_on' | ''
  sort_dir?: 'asc' | 'desc' | ''
}

// Response: Resident/get_residents
export interface GetResidentsResponse {
  residents: Resident[]
  total_count: number
}

// Request: Resident/get_resident
export interface GetResidentRequest {
  '#request': 'Resident/get_resident'
  user_id: string
}

// Response: Resident/get_resident
export interface GetResidentResponse {
  resident: Resident
}

// Request: Resident/add_resident
export interface AddResidentRequest {
  '#request': 'Resident/add_resident'
  first_name: string
  last_name?: string
  phone_num: string
  email?: string
  community_id: number
  address?: string
  vehicles?: string[]
  instructions?: string
  communication_test?: boolean
}

// Response: Resident/add_resident
export interface AddResidentResponse {
  user_id: string
}

// Request: Resident/update_resident
export interface UpdateResidentRequest {
  '#request': 'Resident/update_resident'
  user_id: string
  first_name?: string
  last_name?: string
  phone_num?: string
  email?: string
  community_id?: number
  address?: string
  vehicles?: string[]
  instructions?: string
  new_image_ids?: string[]
  keep_images?: string[]
  communication_test?: boolean
  is_active?: boolean
}

// Request: Resident/delete_resident
export interface DeleteResidentRequest {
  '#request': 'Resident/delete_resident'
  user_id: string
}

// Resident module error codes
export const ResidentErrorCodes = {
  INVALID_PHONE_NUMBER: 224,
  INVALID_EMAIL: 235,
  EMAIL_ALREADY_EXISTS: 240,
  PHONE_ALREADY_EXISTS: 241,
  COMMUNITY_NOT_FOUND: 500,
  COMMUNITY_NOT_ACTIVE: 505,
  RESIDENT_NOT_FOUND: 540,
  RESIDENT_ALREADY_IN_COMMUNITY: 542,
  RESIDENT_CANNOT_DELETE: 543,
  FILE_NOT_FOUND: 321,
} as const
