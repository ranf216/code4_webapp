export interface Resident {
  id: string
  fullName: string
  mobile: string
  email: string
  address: string
  registrationDate: string
  active: boolean
  communicationTest: boolean
  vehicleNumbers: string[]
}

export interface ResidentFormData {
  fullName: string
  mobile: string
  email: string
  address: string
  communicationTest: boolean
  vehicleNumbers: string[]
}
