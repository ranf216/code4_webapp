import type { NotificationType } from '~/api/types/notification'

const typeIconMap: Record<string, string> = {
  new_emergency: 'lucide:phone-incoming',
  new_service_call: 'lucide:phone-incoming',
  call_accepted: 'lucide:phone-incoming',
  call_resolved: 'lucide:phone-incoming',
  call_updated: 'lucide:phone-incoming',
  call_canceled: 'lucide:phone-incoming',
  resident_like: 'lucide:phone-incoming',
  new_incident_report: 'lucide:file-text',
  report_submitted: 'lucide:file-text',
  report_approved: 'lucide:file-text',
  report_changes_requested: 'lucide:file-text',
  report_delivered: 'lucide:file-text',
  shift_published: 'lucide:calendar',
  shift_updated: 'lucide:calendar',
  shift_cancelled: 'lucide:calendar',
  shift_starting_soon: 'lucide:calendar',
  route_updated: 'lucide:map-pin',
  officer_off_route: 'lucide:map-pin',
  post_order_published: 'lucide:clipboard-list',
  post_order_updated: 'lucide:clipboard-list',
  poi_active: 'lucide:shield-alert',
  poi_updated: 'lucide:shield-alert',
  poi_inactivated: 'lucide:shield-alert',
  poi_expiring_soon: 'lucide:shield-alert',
  poi_expired: 'lucide:shield-alert',
  task_update: 'lucide:wrench',
  panic_button: 'lucide:alert-circle',
  gps_signal_lost: 'lucide:navigation',
  general: 'lucide:bell',
}

export function getNotificationTypeIcon(type: NotificationType): string {
  return typeIconMap[type] ?? 'lucide:bell'
}

export function resolveNotificationEntityPath(entityType?: string, entityId?: number | string): string | null {
  if (!entityType || entityId === undefined || entityId === null) return null
  switch (entityType) {
    case 'call': return `/calls/${entityId}`
    case 'report': return `/reports/${entityId}`
    case 'shift': return `/shifts/${entityId}`
    case 'post_order': return `/post-orders/${entityId}`
    case 'poi': return `/poi/${entityId}`
    case 'task': return `/tasks/${entityId}`
    default: return null
  }
}
