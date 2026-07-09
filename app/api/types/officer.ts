import type { ApiResponse } from '../base'

// Officer object returned by admin and self-service endpoints
export interface Officer {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone_num: string
  image_url: string
  community_id: number
  community_name: string | null
  title: string
  description: string | null
  address: string
  roles: string[]
  certification_badges: string[]
  is_active: boolean
  created_on: string
  last_login: string | null
}

// Public officer object returned to residents
export interface OfficerInfo {
  user_id: string
  first_name: string
  last_name: string
  title: string
  description: string | null
  image_url: string
}

// Officer evaluation object
export interface OfficerEvaluation {
  evaluation_id: number
  text: string
  date: string
  evaluator_name: string
  created_on: string
}

// Request: Officer/get_officers
export interface GetOfficersRequest {
  '#request': 'Officer/get_officers'
  community_id?: number
  include_inactive?: boolean
  search_text?: string
  sort_by?: 'first_name' | 'last_name' | 'community' | 'created_on' | ''
  sort_dir?: 'asc' | 'desc' | ''
}

// Response: Officer/get_officers
export interface GetOfficersResponse {
  officers: Officer[]
  total_count: number
}

// Request: Officer/get_officer
export interface GetOfficerRequest {
  '#request': 'Officer/get_officer'
  user_id: string
}

// Response: Officer/get_officer
export interface GetOfficerResponse {
  officer: Officer & { evaluations: OfficerEvaluation[] }
}

// Request: Officer/add_officer
export interface AddOfficerRequest {
  '#request': 'Officer/add_officer'
  first_name: string
  last_name?: string
  phone_num: string
  email?: string
  community_id: number
  title: string
  address?: string
  description?: string
  image?: string
  roles?: string[]
  certification_badges?: string[]
}

// Response: Officer/add_officer
export interface AddOfficerResponse {
  user_id: string
}

// Request: Officer/update_officer
export interface UpdateOfficerRequest {
  '#request': 'Officer/update_officer'
  user_id: string
  first_name?: string
  last_name?: string
  phone_num?: string
  email?: string
  community_id?: number
  title?: string
  address?: string
  description?: string
  image?: string
  roles?: string[]
  certification_badges?: string[]
  is_active?: boolean
}

// Request: Officer/delete_officer
export interface DeleteOfficerRequest {
  '#request': 'Officer/delete_officer'
  user_id: string
}

// Request: Officer/get_officer_evaluations
export interface GetOfficerEvaluationsRequest {
  '#request': 'Officer/get_officer_evaluations'
  user_id: string
}

// Response: Officer/get_officer_evaluations
export interface GetOfficerEvaluationsResponse {
  evaluations: OfficerEvaluation[]
}

// Request: Officer/add_officer_evaluation
export interface AddOfficerEvaluationRequest {
  '#request': 'Officer/add_officer_evaluation'
  user_id: string
  text: string
  date: string
}

// Response: Officer/add_officer_evaluation
export interface AddOfficerEvaluationResponse {
  evaluation_id: number
}

// Request: Officer/delete_officer_evaluation
export interface DeleteOfficerEvaluationRequest {
  '#request': 'Officer/delete_officer_evaluation'
  evaluation_id: number
}

// Request: Officer/get_my_details
export interface GetMyDetailsRequest {
  '#request': 'Officer/get_my_details'
}

// Response: Officer/get_my_details
export interface GetMyDetailsResponse {
  officer: Officer
}

// Request: Officer/update_my_details
export interface UpdateMyDetailsRequest {
  '#request': 'Officer/update_my_details'
  first_name?: string
  last_name?: string
  address?: string
  email?: string
}

// Request: Officer/get_officers_info
export interface GetOfficersInfoRequest {
  '#request': 'Officer/get_officers_info'
}

// Response: Officer/get_officers_info
export interface GetOfficersInfoResponse {
  officers: OfficerInfo[]
}

// Officer module error codes
export const OfficerErrorCodes = {
  OFFICER_NOT_FOUND: 520,
  OFFICER_ALREADY_IN_COMMUNITY: 521,
  OFFICER_CANNOT_DELETE: 526,
  OFFICER_EVALUATION_NOT_FOUND: 527,
  INVALID_PHONE_NUMBER: 224,
  INVALID_EMAIL: 235,
  EMAIL_ALREADY_EXISTS: 240,
  PHONE_ALREADY_EXISTS: 241,
  COMMUNITY_NOT_FOUND: 504,
  COMMUNITY_NOT_ACTIVE: 505,
} as const
