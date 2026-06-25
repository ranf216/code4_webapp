import type { ApiResponse } from '../base'

// Two-factor authentication factor type constants
export type FactorType = 'PHONE' | 'EMAIL'

// Send OTP code request interface
export interface SendOtpRequest {
  '#request': 'TwoFactorAuth/send_otp_code'
  second_factor_key: string
  factor_type: FactorType
}

// Send OTP code response interface
export interface SendOtpResponse {
  // No additional fields expected, just rc and message
}

// Verify OTP code request interface
export interface VerifyOtpRequest {
  '#request': 'TwoFactorAuth/verify_otp_code'
  second_factor_key: string
  factor_type: FactorType
  verification_code: string
}

// Verify OTP code response interface
export interface VerifyOtpResponse {
  token: string // JWT token after successful verification
  type: number // User type
  first_name: string // User first name
  last_name: string // User last name
  need_change_password?: boolean // Whether user needs to change password
}

// Resend OTP code request interface
export interface ResendOtpRequest {
  '#request': 'TwoFactorAuth/resend_otp_code'
  second_factor_key: string
  factor_type: FactorType
}

// Resend OTP code response interface
export interface ResendOtpResponse {
  // No additional fields expected, just rc and message
}
