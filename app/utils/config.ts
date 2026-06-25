/**
 * Application Configuration
 * Centralized config for file upload, user types, and other app settings
 */

// File Upload Configuration
export const FileUploadConfig = {
  /** Maximum file size for base64 upload (2MB) - larger files use multipart */
  maxBase64Size: 2 * 1024 * 1024, // 2MB

  /** Default chunk size for multipart upload (1MB) */
  chunkSize: 1 * 1024 * 1024, // 1MB
} as const

// User Type Configuration
export const UserTypeConfig = {
  types: {
    ADMIN: { value: 1, label: 'Admin', color: '#ef4444' },
    MANAGER: { value: 2, label: 'Manager', color: '#3b82f6' },
    PLANNING: { value: 3, label: 'Planning', color: '#10b981' },
    LOGISTICS: { value: 4, label: 'Logistics', color: '#f59e0b' },
    FINANCE: { value: 5, label: 'Finance', color: '#8b5cf6' },
  } as const,

  defaultType: 1, // Admin

  /** Minimum number of admins required in the system */
  minAdminCount: 1,
} as const

// Pagination Configuration
export const PaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
} as const

// Date/Time Configuration
export const DateTimeConfig = {
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
} as const

// Search Configuration
export const SearchConfig = {
  /** Debounce delay in ms before triggering a server-side search */
  debounceMs: 1000,
} as const

// Export all configs
export const AppConfig = {
  fileUpload: FileUploadConfig,
  userType: UserTypeConfig,
  pagination: PaginationConfig,
  dateTime: DateTimeConfig,
  search: SearchConfig,
} as const

export default AppConfig
