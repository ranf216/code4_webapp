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
  need_change_password?: boolean
  x_token?: string
}

// Login response with two-factor authentication enabled
export interface LoginTwoFactorResponse {
  second_factor_key: string
  phone_num: string
  email: string
}

// Login response union type for both scenarios
export type LoginResponse = LoginSuccessResponse | LoginTwoFactorResponse

export interface ForgotPasswordRequest {
  '#request': 'User/forgot_password'
  email: string
  language: string
}

export interface ForgotPasswordResponse {
  link?: string
}

export interface ResetPasswordRequest {
  '#request': 'User/reset_password'
  user_id: string
  activation_code: string
  password: string
  language: string
}

export type ResetPasswordResponse = Record<string, never>

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

// Mandatory password change response (after first login with x-token)
export interface MandatoryChangePasswordResponse {
  token: string
  type: number
  first_name: string
  last_name: string
  need_change_password?: boolean
}

// User list types (placeholder for future)
export interface UserListResponse {
  users: UserProfile[]
  total: number
}
