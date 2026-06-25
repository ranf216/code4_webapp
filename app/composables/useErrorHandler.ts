import { ApiError } from '~/api/base'
import { 
  ErrorType, 
  isValidationError, 
  isPermissionError, 
  isServerError,
  requiresAuthRestart 
} from '~/utils/errors'

export const useErrorHandler = () => {
  const router = useRouter()
  const { t } = useTranslation()

  /**
   * Handle API errors with appropriate UI responses
   */
  const handleError = (error: ApiError | Error | unknown, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

    if (error instanceof ApiError) {
      switch (error.type) {
        case ErrorType.AUTHENTICATION:
          handleAuthenticationError(error)
          break
        case ErrorType.AUTHORIZATION:
          handleAuthorizationError(error)
          break
        case ErrorType.VALIDATION:
          handleValidationError(error)
          break
        case ErrorType.SERVER:
          handleServerError(error)
          break
        case ErrorType.NETWORK:
          handleNetworkError(error)
          break
        default:
          handleUnknownError(error)
      }
    } else {
      handleUnknownError(error as Error)
    }
  }

  /**
   * Handle authentication errors (token issues)
   */
  const handleAuthenticationError = (error: ApiError) => {
    // Clear auth data and redirect to login
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_need_change_password')
    }

    // Only redirect if not already on login page
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }

    // Show error message
    showToast(error.message, 'error')
  }

  /**
   * Handle authorization errors (permission issues)
   */
  const handleAuthorizationError = (error: ApiError) => {
    showToast(error.message || 'You do not have permission for this action', 'warning')
  }

  /**
   * Handle validation errors (form issues)
   */
  const handleValidationError = (error: ApiError) => {
    // Return error message for form validation
    // Component will handle displaying it
    return error.message
  }

  /**
   * Handle server errors
   */
  const handleServerError = (error: ApiError) => {
    showToast(error.message || 'Server error occurred. Please try again.', 'error')
  }

  /**
   * Handle network errors
   */
  const handleNetworkError = (error: ApiError) => {
    showToast(error.message || 'Network error. Please check your connection.', 'error')
  }

  /**
   * Handle unknown errors
   */
  const handleUnknownError = (error: Error) => {
    showToast(error.message || 'An unexpected error occurred', 'error')
  }

  /**
   * Show toast notification (placeholder - integrate with your toast system)
   */
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    // TODO: Integrate with your toast system
    // For now, just log to console
    console.log(`Toast [${type}]: ${message}`)
    
    // If you have a toast system:
    // toast?.[type](message)
  }

  /**
   * Check if error is retryable
   */
  const isRetryableError = (error: ApiError | Error | unknown): boolean => {
    if (error instanceof ApiError) {
      return error.type === ErrorType.NETWORK || error.type === ErrorType.SERVER
    }
    return false
  }

  /**
   * Get field-specific validation error message
   */
  const getFieldError = (error: ApiError | Error | unknown, field: string): string | null => {
    if (error instanceof ApiError && error.type === ErrorType.VALIDATION) {
      // Check if error message contains field name
      if (error.message.toLowerCase().includes(field.toLowerCase())) {
        return error.message
      }
    }
    return null
  }

  return {
    handleError,
    isRetryableError,
    getFieldError,
    // Error type checkers
    isValidationError: (error: ApiError) => isValidationError(error.rc),
    isPermissionError: (error: ApiError) => isPermissionError(error.rc),
    isServerError: (error: ApiError) => isServerError(error.rc),
    requiresAuthRestart: (error: ApiError) => requiresAuthRestart(error.rc),
  }
}
