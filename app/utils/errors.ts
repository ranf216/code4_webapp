// API Error Codes from documentation
export enum ApiErrorCode {
  SUCCESS = 0,
  INVALID_API_CALL = 101,
  MISSING_PARAMETER = 102,
  NO_PRIVILEGES = 103,
  INVALID_PARAMETER = 105,
  NO_TOKEN = 113,
  INVALID_TOKEN = 201,
  PROJECT_ERROR_START = 500,

  // Community module (500–506)
  COMMUNITY_NOT_FOUND = 500,
  COMMUNITY_NAME_EXISTS = 501,
  COMMUNITY_HAS_ACTIVE_OFFICERS = 502,
  COMMUNITY_HAS_ACTIVE_RESIDENTS = 503,
  COMMUNITY_HAS_ACTIVE_CALLS = 504,
  COMMUNITY_IS_NOT_ACTIVE = 505,
  FEATURED_OFFICER_NOT_FOUND = 506,
}

// Error messages mapping
export const ERROR_MESSAGES: Record<number, string> = {
  [ApiErrorCode.SUCCESS]: 'Success',
  [ApiErrorCode.INVALID_API_CALL]: 'Invalid API call or endpoint not available',
  [ApiErrorCode.MISSING_PARAMETER]: 'Required parameter is missing',
  [ApiErrorCode.NO_PRIVILEGES]: 'You do not have permission for this action',
  [ApiErrorCode.INVALID_PARAMETER]: 'Invalid parameter value',
  [ApiErrorCode.NO_TOKEN]: 'Authentication required or token expired',
  [ApiErrorCode.INVALID_TOKEN]: 'Invalid authentication token',

  // Community module
  [ApiErrorCode.COMMUNITY_NOT_FOUND]: 'Community not found.',
  [ApiErrorCode.COMMUNITY_NAME_EXISTS]: 'A community with this name already exists.',
  [ApiErrorCode.COMMUNITY_HAS_ACTIVE_OFFICERS]: 'This community cannot be deleted because it has active officers assigned. Please reassign or remove all officers first, or consider deactivating the community instead.',
  [ApiErrorCode.COMMUNITY_HAS_ACTIVE_RESIDENTS]: 'This community cannot be deleted because it has active residents assigned. Please reassign or remove all residents first, or consider deactivating the community instead.',
  [ApiErrorCode.COMMUNITY_HAS_ACTIVE_CALLS]: 'This community cannot be deleted because it has open calls. Please resolve or close all calls first, or consider deactivating the community instead.',
  [ApiErrorCode.COMMUNITY_IS_NOT_ACTIVE]: 'This community is currently deactivated.',
  [ApiErrorCode.FEATURED_OFFICER_NOT_FOUND]: 'No featured officer banner exists for this community.',
}

// Error types for different handling strategies
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

// Get error type from error code
export function getErrorType(rc: number): ErrorType {
  if (rc === ApiErrorCode.NO_TOKEN || rc === ApiErrorCode.INVALID_TOKEN) {
    return ErrorType.AUTHENTICATION
  }
  if (rc === ApiErrorCode.NO_PRIVILEGES) {
    return ErrorType.AUTHORIZATION
  }
  if (rc === ApiErrorCode.MISSING_PARAMETER || rc === ApiErrorCode.INVALID_PARAMETER) {
    return ErrorType.VALIDATION
  }
  if (rc >= ApiErrorCode.PROJECT_ERROR_START) {
    return ErrorType.SERVER
  }
  if (rc === ApiErrorCode.INVALID_API_CALL) {
    return ErrorType.SERVER
  }
  return ErrorType.UNKNOWN
}

// Get user-friendly error message
export function getErrorMessage(rc: number, message?: string): string {
  // Use backend message if available and it's not a generic error
  if (message && !message.includes('success') && rc !== 0) {
    return message
  }
  
  // Use predefined message for known error codes
  return ERROR_MESSAGES[rc] || 'An unknown error occurred'
}

// Check if error requires authentication flow restart
export function requiresAuthRestart(rc: number): boolean {
  return rc === ApiErrorCode.NO_TOKEN || rc === ApiErrorCode.INVALID_TOKEN
}

// Check if error is a validation error (form-related)
export function isValidationError(rc: number): boolean {
  return rc === ApiErrorCode.MISSING_PARAMETER || rc === ApiErrorCode.INVALID_PARAMETER
}

// Check if error is a permission error (authorization)
export function isPermissionError(rc: number): boolean {
  return rc === ApiErrorCode.NO_PRIVILEGES
}

// Check if error is a server-side error
export function isServerError(rc: number): boolean {
  return rc >= ApiErrorCode.PROJECT_ERROR_START || rc === ApiErrorCode.INVALID_API_CALL
}
