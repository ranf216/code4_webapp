import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  FactorType,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
} from './types/twoFactor'
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from './types/auth'

export class TwoFactorAuthApi extends BaseApiClient {
  /**
   * Send OTP code to user's phone or email
   * @param secondFactorKey The second factor key from login response
   * @param factorType Where to send the code: 'PHONE' or 'EMAIL'
   */
  async sendOtpCode(
    secondFactorKey: string,
    factorType: FactorType
  ): Promise<ApiResponse<SendOtpResponse>> {
    const request: SendOtpRequest = {
      '#request': 'TwoFactorAuth/send_otp_code',
      second_factor_key: secondFactorKey,
      factor_type: factorType,
    }

    return this.request<SendOtpResponse>(request)
  }

  /**
   * Verify OTP code and complete authentication
   * @param secondFactorKey The second factor key from login response
   * @param factorType Where the code was sent: 'PHONE' or 'EMAIL'
   * @param verificationCode The OTP code received by user
   */
  async verifyOtpCode(
    secondFactorKey: string,
    factorType: FactorType,
    verificationCode: string
  ): Promise<ApiResponse<VerifyOtpResponse>> {
    const request: VerifyOtpRequest = {
      '#request': 'TwoFactorAuth/verify_otp_code',
      second_factor_key: secondFactorKey,
      factor_type: factorType,
      verification_code: verificationCode,
    }

    return this.request<VerifyOtpResponse>(request)
  }

  /**
   * Resend OTP code to user's phone or email
   * @param secondFactorKey The second factor key from login response
   * @param factorType Where to resend the code: 'PHONE' or 'EMAIL'
   */
  async resendOtpCode(
    secondFactorKey: string,
    factorType: FactorType
  ): Promise<ApiResponse<ResendOtpResponse>> {
    const request: ResendOtpRequest = {
      '#request': 'TwoFactorAuth/resend_otp_code',
      second_factor_key: secondFactorKey,
      factor_type: factorType,
    }

    return this.request<ResendOtpResponse>(request)
  }

  /**
   * Change mandatory password after first login or password reset
   * @param token The restricted token from verify_otp_code when need_change_password is true
   * @param currPassword Current password
   * @param newPassword New password (must meet password criteria)
   */
  async changePassword(
    token: string,
    currPassword: string,
    newPassword: string
  ): Promise<ApiResponse<ChangePasswordResponse>> {
    const request: ChangePasswordRequest = {
      '#request': 'TwoFactorAuth/mandatory_change_password',
      '#token': token,
      curr_password: currPassword,
      new_password: newPassword,
    }

    return this.request<ChangePasswordResponse>(request)
  }
}

// Export singleton instance
export const twoFactorAuthApi = new TwoFactorAuthApi()
export default twoFactorAuthApi
