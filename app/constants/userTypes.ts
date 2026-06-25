import { UserTypeConfig } from '~/utils/config'

/**
 * User type constants based on API response 'type' field
 * Used after login or OTP verification
 * Values are synchronized with UserTypeConfig in ~/utils/config
 */

export enum UserType {
  ADMIN = UserTypeConfig.types.ADMIN.value,
  MANAGER = UserTypeConfig.types.MANAGER.value,
  PLANNING = UserTypeConfig.types.PLANNING.value,
  LOGISTICS = UserTypeConfig.types.LOGISTICS.value,
  FINANCE = UserTypeConfig.types.FINANCE.value,
}

export const UserTypeLabels: Record<UserType, string> = {
  [UserType.ADMIN]: UserTypeConfig.types.ADMIN.label,
  [UserType.MANAGER]: UserTypeConfig.types.MANAGER.label,
  [UserType.PLANNING]: UserTypeConfig.types.PLANNING.label,
  [UserType.LOGISTICS]: UserTypeConfig.types.LOGISTICS.label,
  [UserType.FINANCE]: UserTypeConfig.types.FINANCE.label,
}

export const UserTypeColors: Record<UserType, string> = {
  [UserType.ADMIN]: UserTypeConfig.types.ADMIN.color,
  [UserType.MANAGER]: UserTypeConfig.types.MANAGER.color,
  [UserType.PLANNING]: UserTypeConfig.types.PLANNING.color,
  [UserType.LOGISTICS]: UserTypeConfig.types.LOGISTICS.color,
  [UserType.FINANCE]: UserTypeConfig.types.FINANCE.color,
}

/**
 * Check if user is admin
 * @param type - User type from API response
 */
export function isAdmin(type: number | UserType): boolean {
  return type === UserType.ADMIN
}

/**
 * Check if user is Super Admin (type === 1)
 * Alias for isAdmin for clarity in Super Admin context
 */
export function isSuperAdmin(type: number | UserType): boolean {
  return isAdmin(type)
}

/**
 * Check if user has management role (Admin or Manager)
 */
export function isManager(type: number | UserType): boolean {
  return type === UserType.MANAGER
}

/**
 * Check if user is any role that can manage (Admin or Manager)
 */
export function canManage(type: number | UserType): boolean {
  return type === UserType.ADMIN || type === UserType.MANAGER
}

/**
 * Get user type label
 */
export function getUserTypeLabel(type: number | UserType): string {
  return UserTypeLabels[type as UserType] || 'Unknown'
}

/**
 * Check if a number is a valid UserType
 */
export function isValidUserType(type: number | UserType): type is UserType {
  return Object.values(UserType).includes(type as UserType)
}

/** Minimum number of admins required in the system (from config) */
export const MIN_ADMIN_COUNT = UserTypeConfig.minAdminCount

/** Default user type for new users (from config) */
export const DEFAULT_USER_TYPE = UserTypeConfig.defaultType
