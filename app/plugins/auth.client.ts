/**
 * Auth initialization plugin (client-side only)
 * 
 * This plugin runs on client-side after hydration and restores
 * the authentication state from sessionStorage. This ensures that
 * the sidebar and other auth-dependent components have access to
 * the user's role/type information immediately after page refresh.
 */
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  // Initialize auth state from sessionStorage
  authStore.initializeAuth()
  
  console.log('[Auth Plugin] Initialized auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    userType: authStore.user?.type
  })
})
