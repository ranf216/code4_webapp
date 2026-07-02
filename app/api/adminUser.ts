import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  AdminUserRoleValue,
  AddAdminUserParams,
  AddAdminUserResponse,
  AdminUserMutationResponse,
  ChangeAdminUserRoleParams,
  ChangeMyPasswordParams,
  GetAdminUserResponse,
  GetAdminUsersParams,
  GetAdminUsersResponse,
  ResetAdminUserPasswordParams,
  UpdateAdminUserParams,
} from './types/adminUser'

// ─── API Client ────────────────────────────────────────────────

class AdminUserApi extends BaseApiClient {
  /**
   * Get a list of all management system users.
   * Admin only. Super Admin is typically required by business rules.
   */
  async getAdminUsers(
    params: GetAdminUsersParams = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetAdminUsersResponse>> {
    return this.request<GetAdminUsersResponse>(
      {
        '#request': 'AdminUser/get_admin_users',
        ...params,
      },
      options
    )
  }

  /**
   * Get a single management system user by ID.
   * Admin only.
   */
  async getAdminUser(
    userId: string,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetAdminUserResponse>> {
    return this.request<GetAdminUserResponse>(
      {
        '#request': 'AdminUser/get_admin_user',
        user_id: userId,
      },
      options
    )
  }

  /**
   * Create a new management system user.
   * Admin only. The new user is created active and must change the initial password on first login.
   */
  async addAdminUser(
    params: AddAdminUserParams,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<AddAdminUserResponse>> {
    return this.request<AddAdminUserResponse>(
      {
        '#request': 'AdminUser/add_admin_user',
        ...params,
      },
      options
    )
  }

  /**
   * Update an existing management system user.
   * Only provided fields are modified. If email is changed, initial_password is mandatory.
   */
  async updateAdminUser(
    params: UpdateAdminUserParams,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<AdminUserMutationResponse>> {
    return this.request<AdminUserMutationResponse>(
      {
        '#request': 'AdminUser/update_admin_user',
        ...params,
      },
      options
    )
  }

  /**
   * Soft-delete a management system user.
   * Admin only. Cannot delete yourself or the last active admin (rc 771).
   */
  async deleteAdminUser(
    userId: string,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<AdminUserMutationResponse>> {
    return this.request<AdminUserMutationResponse>(
      {
        '#request': 'AdminUser/delete_admin_user',
        user_id: userId,
      },
      options
    )
  }

  /**
   * Change a user's role. Super Admin only.
   * Cannot change your own role (rc 772).
   */
  async changeAdminUserRole(
    params: ChangeAdminUserRoleParams,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<AdminUserMutationResponse>> {
    return this.request<AdminUserMutationResponse>(
      {
        '#request': 'AdminUser/change_admin_user_role',
        ...params,
      },
      options
    )
  }

  /**
   * Reset a user's password to a new initial password. Admin only.
   * The user is logged out and forced to change the password on next login.
   */
  async resetAdminUserPassword(
    params: ResetAdminUserPasswordParams,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<AdminUserMutationResponse>> {
    return this.request<AdminUserMutationResponse>(
      {
        '#request': 'AdminUser/reset_admin_user_password',
        ...params,
      },
      options
    )
  }

  /**
   * Change the current user's own password voluntarily. Any admin role.
   */
  async changeMyPassword(
    params: ChangeMyPasswordParams,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<AdminUserMutationResponse>> {
    return this.request<AdminUserMutationResponse>(
      {
        '#request': 'AdminUser/change_my_password',
        ...params,
      },
      options
    )
  }
}

export const adminUserApi = new AdminUserApi()

// Helper to map role integer to display name
export function getAdminUserRoleName(role: AdminUserRoleValue | null | undefined): string {
  switch (role) {
    case 2: return 'Super Admin'
    case 3: return 'Manager'
    case 4: return 'Planning'
    case 5: return 'Logistics'
    case 6: return 'Finance'
    default: return '—'
  }
}

// Helper to check if a value is a valid admin role
export function isValidAdminUserRole(role: number): role is AdminUserRoleValue {
  return [2, 3, 4, 5, 6].includes(role)
}
