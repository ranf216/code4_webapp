import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type { LoginRequest, LoginResponse, MandatoryChangePasswordResponse } from './types/user'

export class UserApi extends BaseApiClient {
  /**
   * User login
   * @param email User email
   * @param password User password
   * @returns Login response with second_factor_key, phone_num, email
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const request: LoginRequest = {
      '#request': 'User/login',
      email,
      password,
    }
    
    return this.request<LoginResponse>(request)
  }

  /**
   * Get user profile (placeholder for future implementation)
   * @param token Authentication token
   * @param userId User ID (optional, defaults to current user)
   */
  async getProfile(token: string, userId?: string): Promise<ApiResponse<any>> {
    const request = {
      '#request': 'User/getProfile',
      user_id: userId,
    }
    
    return this.requestWithToken(request, token)
  }

  /**
   * Update user profile (placeholder for future implementation)
   * @param token Authentication token
   * @param profileData Profile data to update
   */
  async updateProfile(token: string, profileData: any): Promise<ApiResponse<any>> {
    const request = {
      '#request': 'User/updateProfile',
      ...profileData,
    }
    
    return this.requestWithToken(request, token)
  }

  /**
   * Mandatory password change after first login with restricted token (X-token)
   * @param xToken Restricted token from login response when need_change_password is true
   * @param password New password (must meet password criteria)
   * @returns Response with normal token
   */
  async mandatoryChangePassword(
    xToken: string,
    password: string
  ): Promise<ApiResponse<MandatoryChangePasswordResponse>> {
    const request = {
      '#request': 'User/mandatory_change_password',
      '#token': xToken,
      password,
    }

    return this.request<MandatoryChangePasswordResponse>(request)
  }

  /**
   * Logout user (placeholder for future implementation)
   * @param token Authentication token
   */
  async logout(token: string): Promise<ApiResponse<any>> {
    const request = {
      '#request': 'User/logout',
    }
    
    return this.requestWithToken(request, token)
  }
}

// Export singleton instance
export const userApi = new UserApi()
export default userApi
