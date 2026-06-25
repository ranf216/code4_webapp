import { BaseApiClient } from './base'
import type { ApiResponse } from './base'

export interface UserItem {
  user_id: string
  first_name: string
  last_name: string
  email: string
  mobile?: string
  type: number
  create?: string
  status?: number
  last_login?: string
  last_access?: string
}

export interface UsersResponse {
  rc: number
  message: string
  users: UserItem[]
}

export interface UserMutationResponse {
  rc: number
  message: string
  user_id?: string
}

export class UsersApi extends BaseApiClient {
  /**
   * Get all users
   * @returns List of all users
   */
  async getUsers(): Promise<ApiResponse<UsersResponse>> {
    const request = {
      '#request': 'User/get_users',
    }

    return this.request<UsersResponse>(request)
  }

  /**
   * Add a new user
   * @param firstName - The user's first name
   * @param lastName - The user's last name
   * @param email - The user's email address
   * @param mobile - The user's mobile number
   * @param type - User type (1=Admin, 2=Manager, 3=Planning, 4=Logistics, 5=Finance)
   * @param password - Initial password for the user
   * @returns Response with the new user_id
   */
  async addUser(
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    type: number,
    password: string
  ): Promise<ApiResponse<UserMutationResponse>> {
    const request = {
      '#request': 'User/add_user',
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile: mobile,
      type: type,
      password: password,
    }

    return this.request<UserMutationResponse>(request)
  }

  /**
   * Update an existing user
   * @param userId - The ID of the user to update
   * @param firstName - The user's first name
   * @param lastName - The user's last name
   * @param email - The user's email address
   * @param mobile - The user's mobile number
   * @param type - User type (1=Admin, 2=Manager, 3=Planning, 4=Logistics, 5=Finance)
   * @param active - Whether the user is active
   * @returns Response with success status
   */
  async updateUser(
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    type: number,
    active: boolean
  ): Promise<ApiResponse<UserMutationResponse>> {
    const request = {
      '#request': 'User/update_user',
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile: mobile,
      type: type,
      active: active,
    }

    return this.request<UserMutationResponse>(request)
  }

  /**
   * Delete a user
   * @param userId - The ID of the user to delete
   * @returns Response with success status
   */
  async deleteUser(userId: string): Promise<ApiResponse<UserMutationResponse>> {
    const request = {
      '#request': 'User/delete_user',
      user_id: userId,
    }

    return this.request<UserMutationResponse>(request)
  }

  /**
   * Reset user password (Admin only)
   * Generates a random temporary password and sends it to the user's email
   * @param userId - The ID of the user whose password should be reset
   * @returns Response with success status
   */
  async resetUserPassword(
    userId: string
  ): Promise<ApiResponse<UserMutationResponse>> {
    const request = {
      '#request': 'User/reset_user_password',
      user_id: userId,
    }

    return this.request<UserMutationResponse>(request)
  }
}

export const usersApi = new UsersApi()
