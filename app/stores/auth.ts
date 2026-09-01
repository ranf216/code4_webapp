import { defineStore } from 'pinia'
import { AdminUserRole } from '~/api/types/adminUser'

// User interface for authenticated user data
export interface User {
  type: number
  first_name: string
  last_name: string
  email?: string
}

// Authentication state interface
interface AuthState {
  token: string | null
  xToken: string | null
  user: User | null
  roles: number[]
  isAuthenticated: boolean
  needChangePassword: boolean
}

// Session storage keys for persistence
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  X_TOKEN: 'auth_x_token',
  USER: 'auth_user',
  ROLES: 'auth_roles',
  NEED_CHANGE_PASSWORD: 'auth_need_change_password',
} as const

// Session storage helper functions with SSR safety
const storage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(key)
  },
  
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(key, value)
  },
  
  remove(key: string): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(key)
  },
  
  clear(): void {
    if (typeof window === 'undefined') return
    Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key))
  },
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    xToken: null,
    user: null,
    roles: [],
    isAuthenticated: false,
    needChangePassword: false,
  }),

  getters: {
    /** Get user's full name */
    fullName: (state) => {
      if (!state.user) return ''
      return `${state.user.first_name} ${state.user.last_name}`.trim()
    },

    /** Check if user has authentication token */
    hasToken: (state) => !!state.token,

    /** Check if user is admin (type === 1) */
    isAdmin: (state) => {
      if (!state.user) return false
      return state.user.type === 1
    },

    /** Check if user can approve tasks (admin or planning/logistics/finance) */
    isApprover: (state) => {
      if (!state.user) return false
      if (state.user.type === 1) return true
      const approverRoles: number[] = [AdminUserRole.PLANNING, AdminUserRole.LOGISTICS, AdminUserRole.FINANCE]
      return state.roles.some(role => approverRoles.includes(role))
    },
  },

  actions: {
    /**
     * Set authentication data after successful login
     * @param token - JWT authentication token
     * @param user - User information
     * @param needChangePassword - Whether user needs to change password
     * @param xToken - Restricted token for mandatory password change
     */
    setAuth(token: string, user: User, needChangePassword: boolean = false, xToken?: string | null) {
      this.token = token
      this.xToken = xToken || null
      this.user = user
      this.roles = []
      this.isAuthenticated = true
      this.needChangePassword = needChangePassword

      // Persist authentication data to sessionStorage
      storage.set(STORAGE_KEYS.TOKEN, token)
      storage.set(STORAGE_KEYS.USER, JSON.stringify(user))
      storage.set(STORAGE_KEYS.ROLES, JSON.stringify([]))
      storage.set(STORAGE_KEYS.NEED_CHANGE_PASSWORD, needChangePassword.toString())
      if (xToken) {
        storage.set(STORAGE_KEYS.X_TOKEN, xToken)
      } else {
        storage.remove(STORAGE_KEYS.X_TOKEN)
      }
    },

    /**
     * Set user roles after login
     * @param roles - Array of role IDs
     */
    setRoles(roles: number[]) {
      this.roles = roles
      storage.set(STORAGE_KEYS.ROLES, JSON.stringify(roles))
    },

    /** Clear authentication data and logout user */
    clearAuth() {
      this.token = null
      this.xToken = null
      this.user = null
      this.roles = []
      this.isAuthenticated = false
      this.needChangePassword = false

      // Clear all sessionStorage data
      storage.clear()
    },

    /**
     * Update user information
     * @param user - Partial user data to update
     */
    updateUser(user: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...user }
        storage.set(STORAGE_KEYS.USER, JSON.stringify(this.user))
      }
    },

    /** Mark password as changed after successful password update */
    passwordChanged() {
      this.needChangePassword = false
      this.xToken = null
      storage.set(STORAGE_KEYS.NEED_CHANGE_PASSWORD, 'false')
      storage.remove(STORAGE_KEYS.X_TOKEN)
    },

    /**
     * Initialize authentication state from sessionStorage
     * Called on app startup to restore user session
     */
    initializeAuth() {
      const token = storage.get(STORAGE_KEYS.TOKEN)
      const xToken = storage.get(STORAGE_KEYS.X_TOKEN)
      const userStr = storage.get(STORAGE_KEYS.USER)
      const rolesStr = storage.get(STORAGE_KEYS.ROLES)
      const needChangePassword = storage.get(STORAGE_KEYS.NEED_CHANGE_PASSWORD) === 'true'

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          const roles = rolesStr ? JSON.parse(rolesStr) : []
          this.token = token
          this.xToken = xToken
          this.user = user
          this.roles = Array.isArray(roles) ? roles : []
          this.isAuthenticated = true
          this.needChangePassword = needChangePassword
        } catch (error) {
          // Invalid user data, clear everything
          storage.clear()
        }
      }
    },
  },
})
