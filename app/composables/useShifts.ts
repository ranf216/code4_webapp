import { ref } from 'vue'

export interface Waypoint {
  number: number
  location_name: string
  lat: number
  lng: number
  eta_minutes: number
  dwell_minutes: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  notes: string
}

export interface Shift {
  id: string
  community: string
  site: string
  officers: string[]
  start_time: string
  end_time: string
  date: string
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  posts: string[]
  notes: string
  route?: Waypoint[]
}

export const shifts = ref<Shift[]>([
  {
    id: 'SHF-001',
    community: 'Sunset Gardens',
    site: 'Gate A',
    officers: ['John Smith', 'Mike Chen'],
    start_time: '06:00',
    end_time: '14:00',
    date: '2026-06-15',
    status: 'published',
    posts: ['Main Gate', 'Patrol'],
    notes: 'Regular morning shift',
  },
  {
    id: 'SHF-002',
    community: 'Oakwood Residences',
    site: 'Lobby',
    officers: ['Sarah Johnson'],
    start_time: '14:00',
    end_time: '22:00',
    date: '2026-06-15',
    status: 'active',
    posts: ['Front Desk'],
    notes: '',
  },
  {
    id: 'SHF-003',
    community: 'Marina Towers',
    site: 'Parking',
    officers: ['Emma Davis', 'Robert Wilson'],
    start_time: '22:00',
    end_time: '06:00',
    date: '2026-06-15',
    status: 'draft',
    posts: ['Parking Level 1', 'Parking Level 2'],
    notes: 'Overnight shift',
  },
  {
    id: 'SHF-004',
    community: 'Sunset Gardens',
    site: 'Gate A',
    officers: ['John Smith'],
    start_time: '06:00',
    end_time: '14:00',
    date: '2026-06-16',
    status: 'completed',
    posts: ['Main Gate'],
    notes: '',
  },
  {
    id: 'SHF-005',
    community: 'Downtown Plaza',
    site: 'Main Entrance',
    officers: ['Mike Chen'],
    start_time: '08:00',
    end_time: '16:00',
    date: '2026-06-17',
    status: 'cancelled',
    posts: ['Entrance'],
    notes: 'Cancelled due to event',
  },
  {
    id: 'SHF-006',
    community: 'Oakwood Residences',
    site: 'Perimeter',
    officers: ['Sarah Johnson', 'Emma Davis'],
    start_time: '10:00',
    end_time: '18:00',
    date: '2026-06-18',
    status: 'published',
    posts: ['Perimeter Patrol'],
    notes: '',
  },
  {
    id: 'SHF-007',
    community: 'Marina Towers',
    site: 'Lobby',
    officers: ['Robert Wilson'],
    start_time: '16:00',
    end_time: '00:00',
    date: '2026-06-18',
    status: 'active',
    posts: ['Lobby Desk'],
    notes: '',
  },
  {
    id: 'SHF-008',
    community: 'Sunset Gardens',
    site: 'Gate A',
    officers: ['John Smith', 'Sarah Johnson'],
    start_time: '06:00',
    end_time: '14:00',
    date: '2026-06-19',
    status: 'published',
    posts: ['Main Gate', 'Patrol'],
    notes: 'Weekend shift',
  },
  {
    id: 'SHF-009',
    community: 'Downtown Plaza',
    site: 'Main Entrance',
    officers: ['Mike Chen'],
    start_time: '14:00',
    end_time: '22:00',
    date: '2026-06-20',
    status: 'draft',
    posts: ['Entrance'],
    notes: '',
  },
  {
    id: 'SHF-010',
    community: 'Oakwood Residences',
    site: 'Lobby',
    officers: ['Emma Davis'],
    start_time: '22:00',
    end_time: '06:00',
    date: '2026-06-21',
    status: 'published',
    posts: ['Front Desk'],
    notes: 'Sunday night',
  },
  {
    id: 'SHF-011',
    community: 'Sunset Gardens',
    site: 'Gate A',
    officers: [],
    start_time: '06:00',
    end_time: '14:00',
    date: '2026-06-21',
    status: 'published',
    posts: ['Main Gate'],
    notes: '',
  },
  {
    id: 'SHF-012',
    community: 'Sunset Gardens',
    site: 'Gate B',
    officers: [],
    start_time: '08:00',
    end_time: '16:00',
    date: '2026-06-21',
    status: 'published',
    posts: ['Secondary Gate'],
    notes: 'Overlaps with SHF-011 from 08:00 to 14:00',
  },
  {
    id: 'SHF-013',
    community: 'Marina Towers',
    site: 'Parking',
    officers: [],
    start_time: '14:00',
    end_time: '22:00',
    date: '2026-06-21',
    status: 'published',
    posts: ['Parking Level 1'],
    notes: '',
  },
  {
    id: 'SHF-014',
    community: 'Downtown Plaza',
    site: 'Main Entrance',
    officers: [],
    start_time: '16:00',
    end_time: '00:00',
    date: '2026-06-21',
    status: 'published',
    posts: ['Entrance'],
    notes: 'Overlaps with SHF-013 from 16:00 to 22:00',
  },
  {
    id: 'SHF-015',
    community: 'Oakwood Residences',
    site: 'Perimeter',
    officers: [],
    start_time: '22:00',
    end_time: '06:00',
    date: '2026-06-21',
    status: 'published',
    posts: ['Perimeter Patrol'],
    notes: '',
  },
])

const baseLat = 10.7769
const baseLng = 106.7009

const defaultCheckpointNames = [
  'North Perimeter - Camera 4',
  'East Gate Checkpoint',
  'South Parking Patrol',
  'West Entrance',
  'Central Courtyard',
  'Building A Lobby',
  'Emergency Exit B',
  'Rooftop Access',
  'Loading Dock',
  'Visitor Parking',
]

const checkpointNotes = [
  'Check perimeter fence',
  'Verify ID badges',
  'Inspect fire extinguishers',
  'Monitor entry logs',
  'Patrol high traffic area',
  'Check lighting systems',
  'Verify emergency exits',
  'Scan for suspicious activity',
  'Inspect cargo area',
  'Check vehicle permits',
]

export function generateRoute(shiftId: string): Waypoint[] {
  const shift = shifts.value.find((s: Shift) => s.id === shiftId)
  if (!shift) return []

  const priorities: Waypoint['priority'][] = ['low', 'medium', 'high', 'critical']

  // Build route with mandatory post waypoints + random checkpoints to reach 5-8 waypoints
  const postWaypoints = shift.posts.map((post: string, index: number): Waypoint => ({
    number: index + 1,
    location_name: post,
    lat: baseLat + (index * 0.002),
    lng: baseLng + (index * 0.003),
    eta_minutes: index === 0 ? 0 : 5 + index * 3,
    dwell_minutes: 10 + (index % 3) * 5,
    priority: priorities[index % priorities.length] || 'low',
    notes: index === 0 ? 'Start point' : `Mandatory post: ${post}`,
  }))

  const targetCount = Math.floor(Math.random() * 4) + 5 // 5 to 8 waypoints
  const extraNeeded = Math.max(0, targetCount - postWaypoints.length)

  const extraWaypoints: Waypoint[] = []
  for (let i = 0; i < extraNeeded; i++) {
    const index = postWaypoints.length + i
    const checkpointIndex = (index + shift.id.charCodeAt(shift.id.length - 1)) % defaultCheckpointNames.length
    const locationName = defaultCheckpointNames[checkpointIndex] || 'Patrol Checkpoint'
    const note = checkpointNotes[checkpointIndex] || 'Standard patrol checkpoint'
    extraWaypoints.push({
      number: index + 1,
      location_name: locationName,
      lat: baseLat + (index * 0.0018),
      lng: baseLng + (index * 0.0025),
      eta_minutes: 5 + index * 3,
      dwell_minutes: 8 + (index % 4) * 4,
      priority: priorities[index % priorities.length] || 'low',
      notes: note,
    })
  }

  const route = [...postWaypoints, ...extraWaypoints].map((wp, index) => ({
    ...wp,
    number: index + 1,
  }))

  shift.route = route
  return route
}

export function saveRoute(shiftId: string, route: Waypoint[]) {
  const shift = shifts.value.find((s: Shift) => s.id === shiftId)
  if (shift) {
    shift.route = route
  }
}
