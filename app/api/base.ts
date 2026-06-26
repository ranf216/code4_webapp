import axios from 'axios'

// Create axios instance with dynamic baseURL configuration
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Helper function to get API base URL from runtime config
const getApiBaseUrl = () => {
  const config = useRuntimeConfig()
  return config.public.apiUrl || 'http://localhost:3001'
}

// Request interceptor to automatically add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage for authenticated requests
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth_token')
      if (token) {
        // Add token to request data envelope if not already present
        if (config.data && typeof config.data === 'object') {
          config.data['#token'] = token
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Helper: clear session storage and redirect to login
function clearSessionAndRedirect() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_need_change_password')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
}

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle API error codes that require authentication actions
    if (error.response?.data?.rc) {
      const rc = error.response.data.rc
      
      // No Token (113) or Invalid Token (201) - clear auth and redirect
      if (rc === 113 || rc === 201) {
        clearSessionAndRedirect()
      }
    }
    
    // Handle HTTP 401 as fallback for standard auth errors
    if (error.response?.status === 401) {
      clearSessionAndRedirect()
    }
    
    return Promise.reject(error)
  }
)

// Standard API response envelope interface
export interface ApiResponse<T = any> {
  rc: number
  message: string
  [key: string]: any // Additional data fields from backend
}

// Standard API request envelope interface
export interface ApiRequest {
  '#request': string
  '#token'?: string
  [key: string]: any
}

// Custom API error class for structured error handling
export class ApiError extends Error {
  constructor(
    public rc: number,
    message: string,
    public data?: any,
    public type: string = 'unknown'
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Base API client with envelope handling and error management
export class BaseApiClient {
  /**
   * Make API request with envelope handling and optional loading state
   * @param request - API request envelope
   * @param options - Request options including loading state control
   * @returns Promise resolving to API response
   */
  protected async request<T = any>(
    request: ApiRequest, 
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<T>> {
    const { showLoading = true, loadingMessage } = options || {}
    let loadingStore: any = null
    if (showLoading) {
      const { useLoadingStore } = await import('~/stores/loading')
      loadingStore = useLoadingStore()
    }

    try {
      if (loadingStore) {
        loadingStore.show(loadingMessage)
      }

      // Get dynamic baseURL and make API request
      const baseURL = getApiBaseUrl()
      const response = await apiClient.post<ApiResponse<T>>('', request, { baseURL })
      
      // Handle API error responses
      if (response.data.rc !== 0) {
        // rc=102 (missing param) where the missing param is #token means session expired
        if (
          response.data.rc === 102 &&
          typeof response.data.param === 'string' &&
          response.data.param.startsWith('#token')
        ) {
          clearSessionAndRedirect()
          throw new ApiError(102, 'Session expired. Please log in again.', response.data, 'authentication')
        }

        // Allow certain non-zero RC codes to be handled by the caller
        const allowedNonZeroRCs = [506] // featured officer not found, etc.
        if (allowedNonZeroRCs.includes(response.data.rc)) {
          return response.data
        }

        const { getErrorMessage, getErrorType } = await import('~/utils/errors')
        const messageType = getErrorType(response.data.rc)
        const userMessage = getErrorMessage(response.data.rc, response.data.message)
        
        throw new ApiError(response.data.rc, userMessage, response.data, messageType)
      }
      
      return response.data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Handle network and HTTP errors
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new ApiError(-1, 'Request timeout. Please try again.', error, 'network')
        }
        if (!error.response) {
          throw new ApiError(-1, 'Network error. Please check your connection.', error, 'network')
        }
        
        const message = error.response.data?.message || error.message || 'Network error'
        throw new ApiError(-1, message, error.response?.data, 'network')
      }
      
      const err = error as Error
      throw new ApiError(-1, err.message || 'Unknown error occurred', err, 'unknown')
    } finally {
      if (loadingStore) {
        loadingStore.hide()
      }
    }
  }

  /**
   * Make API request with authentication token
   * @param request - API request without token
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  protected async requestWithToken<T = any>(request: Omit<ApiRequest, '#token'>, token: string): Promise<ApiResponse<T>> {
    return this.request<T>({ '#request': request['#request'], '#token': token, ...request })
  }
}

export default apiClient
