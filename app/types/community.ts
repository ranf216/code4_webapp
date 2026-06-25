export interface Community {
  id: string
  name: string
  area: string
  status: 'active' | 'inactive' | 'maintenance'
  posts: number
  officers: number
  residents: number | null
  calls24h: number
  featuredOfficer: boolean
}

export interface CommunityFormData {
  name: string
  area: string
  officers: string[]
  residents: string[]
  posts: string[]
  mapEnabled: boolean
  mapImage?: string
  mapBoundaries?: string
}

export interface CommunityEditFormData extends CommunityFormData {
  id: string
  active: boolean
  registrationDate: string
  callsCount: number
}
