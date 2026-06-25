import type { ApiResponse } from '../base'

// Login request interface
export interface LoginRequest {
  '#request': 'User/login'
  email: string
  password: string
}

// Login response without two-factor authentication
export interface LoginSuccessResponse {
  token: string
  type: number
  first_name: string
  last_name: string
}

// Login response with two-factor authentication enabled
export interface LoginTwoFactorResponse {
  second_factor_key: string
  phone_num: string
  email: string
}

// Login response union type for both scenarios
export type LoginResponse = LoginSuccessResponse | LoginTwoFactorResponse

// Type guard to check if response requires two-factor authentication
export function isTwoFactorRequired(response: LoginResponse | undefined | null): response is LoginTwoFactorResponse {
  return !!response && typeof response === 'object' && 'second_factor_key' in response
}

// User profile types (placeholder for future implementation)
export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: string
  active: boolean
}

// User list types (placeholder for future)
export interface UserListResponse {
  users: UserProfile[]
  total: number
}
