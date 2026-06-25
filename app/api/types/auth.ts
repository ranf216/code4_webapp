import type { ApiResponse } from '../base'

// Change password request interface
export interface ChangePasswordRequest {
  '#request': 'TwoFactorAuth/mandatory_change_password'
  '#token': string
  curr_password: string
  new_password: string
}

// Change password response interface
export interface ChangePasswordResponse {
  token: string
  type: number
  first_name: string
  last_name: string
  need_change_password: boolean
}
