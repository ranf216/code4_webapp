import type { ApiResponse } from '../base'

// ─── Role constants ────────────────────────────────────────────

export const AdminUserRole = {
  SUPER_ADMIN: 2,
  MANAGER: 3,
  PLANNING: 4,
  LOGISTICS: 5,
  FINANCE: 6,
} as const

export type AdminUserRoleValue = typeof AdminUserRole[keyof typeof AdminUserRole]

// ─── Domain models ─────────────────────────────────────────────

export interface AdminUser {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone_num: string
  role: AdminUserRoleValue
  is_active: boolean
  created_on: string
  last_login: string | null
}

// ─── Request params ────────────────────────────────────────────

export type AdminUserSortBy = 'first_name' | 'last_name' | 'email' | 'role' | 'created_on'
export type SortDirection = 'asc' | 'desc'

export interface GetAdminUsersParams {
  include_inactive?: boolean
  search_text?: string
  sort_by?: AdminUserSortBy
  sort_dir?: SortDirection
}

export interface AddAdminUserParams {
  first_name: string
  last_name?: string
  email: string
  password: string
  phone_num?: string
  role: AdminUserRoleValue
}

export interface UpdateAdminUserParams {
  user_id: string
  first_name?: string
  last_name?: string
  email?: string
  phone_num?: string
  is_active?: boolean
  initial_password?: string
}

export interface ChangeAdminUserRoleParams {
  user_id: string
  role: AdminUserRoleValue
}

export interface ResetAdminUserPasswordParams {
  user_id: string
  password: string
}

export interface ChangeMyPasswordParams {
  current_password: string
  new_password: string
}

// ─── Response shapes ───────────────────────────────────────────

export interface GetAdminUsersResponse extends ApiResponse {
  users: AdminUser[]
  total_count: number
}

export interface GetAdminUserResponse extends ApiResponse {
  user: AdminUser
}

export interface AddAdminUserResponse extends ApiResponse {
  user_id: string
}

export interface AdminUserMutationResponse extends ApiResponse {
  user_id?: string
}
