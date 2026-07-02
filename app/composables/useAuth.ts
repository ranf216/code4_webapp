import { userApi } from '~/api/user'
import { twoFactorAuthApi } from '~/api/twoFactor'
import { useAuthStore } from '~/stores/auth'
import type { FactorType } from '~/api/types/twoFactor'
import { isTwoFactorRequired } from '~/api/types/user'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  const { t } = useTranslation()

  // Reactive authentication state
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const secondFactorKey = ref<string>('')
  const currentStep = ref<'credentials' | 'otp' | 'success'>('credentials')
  const factorType = ref<FactorType>('EMAIL')

  // Resend OTP cooldown timer (in seconds)
  const resendCooldown = ref(60)
  let cooldownInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Start the resend cooldown timer
   * @param seconds - Cooldown duration in seconds
   */
  const startResendCooldown = (seconds: number = 60) => {
    // Clear any existing interval
    if (cooldownInterval) {
      clearInterval(cooldownInterval)
    }

    resendCooldown.value = seconds

    cooldownInterval = setInterval(() => {
      if (resendCooldown.value > 0) {
        resendCooldown.value--
      } else {
        if (cooldownInterval) {
          clearInterval(cooldownInterval)
          cooldownInterval = null
        }
      }
    }, 1000)
  }

  /**
   * Step 1: Authenticate with email and password
   * Handles both 2FA and non-2FA login flows
   * @param email - User email address
   * @param password - User password
   * @returns Promise with login result and 2FA requirement status
   */
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await userApi.login(email, password)
      
      if (response.rc === 0) {
        // Extract data from response - handle both wrapped and direct response structures
        const loginData = response.data || response
        
        // Check if 2FA is required
        if (isTwoFactorRequired(loginData)) {
          // 2FA flow - save second factor key and send OTP
          secondFactorKey.value = loginData.second_factor_key
          
          // Auto send OTP to EMAIL (default)
          await sendOtpCode('EMAIL')
          
          currentStep.value = 'otp'
          return { success: true, requiresTwoFactor: true }
        } else {
          // Direct login success - save auth data and redirect
          authStore.setAuth(
            loginData.token,
            {
              type: loginData.type,
              first_name: loginData.first_name,
              last_name: loginData.last_name,
            },
            loginData.need_change_password ?? false
          )

          currentStep.value = 'success'

          // Redirect based on password change requirement
          if (loginData.need_change_password) {
            await router.push('/change-password')
          } else {
            await router.push('/dashboard')
          }

          return { success: true, requiresTwoFactor: false }
        }
      } else {
        error.value = response.message
        return { success: false, error: response.message }
      }
    } catch (err: any) {
      error.value = err.message || t('auth.login_error')
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 2: Send one-time password code
   * @param type - Factor type (EMAIL or PHONE)
   * @returns Promise with send OTP result
   */
  const sendOtpCode = async (type: FactorType = 'EMAIL') => {
    try {
      isLoading.value = true
      error.value = null

      const response = await twoFactorAuthApi.sendOtpCode(
        secondFactorKey.value,
        type
      )
      
      if (response.rc === 0) {
        factorType.value = type
        // Start resend cooldown timer
        startResendCooldown(60)
        return { success: true }
      } else {
        error.value = response.message
        return { success: false, error: response.message }
      }
    } catch (err: any) {
      error.value = err.message || t('auth.send_otp_error')
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 3: Verify OTP code and complete authentication
   * @param code - OTP verification code
   * @returns Promise with verification result
   */
  const verifyOtpCode = async (code: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await twoFactorAuthApi.verifyOtpCode(
        secondFactorKey.value,
        factorType.value,
        code
      )
      
      if (response.rc === 0) {
        // Save authentication data to store
        authStore.setAuth(
          response.token,
          {
            type: response.type,
            first_name: response.first_name,
            last_name: response.last_name,
          },
          response.need_change_password
        )

        currentStep.value = 'success'

        // Redirect based on password change requirement
        if (response.need_change_password) {
          await router.push('/change-password')
        } else {
          await router.push('/dashboard')
        }

        return { success: true }
      } else {
        error.value = response.message
        return { success: false, error: response.message }
      }
    } catch (err: any) {
      error.value = err.message || t('auth.verify_otp_error')
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend OTP code to the same factor type
   * @returns Promise with resend result
   */
  const resendOtpCode = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await twoFactorAuthApi.resendOtpCode(
        secondFactorKey.value,
        factorType.value
      )
      
      if (response.rc === 0) {
        // Restart resend cooldown timer after successful resend
        startResendCooldown(60)
        return { success: true }
      } else {
        error.value = response.message
        return { success: false, error: response.message }
      }
    } catch (err: any) {
      error.value = err.message || t('auth.resend_otp_error')
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user and clear authentication data
   * @returns Promise that resolves when logout is complete
   */
  const logout = async () => {
    authStore.clearAuth()
    await router.push('/login')
  }

  /**
   * Reset login state for new authentication attempt
   */
  const resetLoginState = () => {
    isLoading.value = false
    error.value = null
    secondFactorKey.value = ''
    currentStep.value = 'credentials'
    factorType.value = 'EMAIL'
    // Clear resend cooldown
    resendCooldown.value = 60
    if (cooldownInterval) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }

  /**
   * Initialize auth on app startup
   */
  const initializeAuth = () => {
    authStore.initializeAuth()
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    currentStep: readonly(currentStep),
    factorType: readonly(factorType),
    resendCooldown: readonly(resendCooldown),
    
    // Computed
    isAuthenticated: computed(() => authStore.isAuthenticated),
    user: computed(() => authStore.user),
    fullName: computed(() => authStore.fullName),
    needChangePassword: computed(() => authStore.needChangePassword),
    
    // Methods
    login,
    sendOtpCode,
    verifyOtpCode,
    resendOtpCode,
    logout,
    resetLoginState,
    initializeAuth,
  }
}
