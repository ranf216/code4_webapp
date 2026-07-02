<script setup lang="ts">
import { UserType, UserTypeLabels } from '~/constants/userTypes'

type BadgeType = 'status' | 'userType' | 'adminRole' | 'active' | 'report' | 'review' | 'taskPriority' | 'taskStatus' | 'shiftStatus' | 'shiftCount' | 'postOrderStatus' | 'poiType' | 'poiThreat' | 'poiStatus' | 'templateStatus' | 'templateCategory'

const props = defineProps<{
  type: BadgeType
  value: string | number | boolean
}>()

const label = computed((): string => {
  if (props.type === 'userType') {
    const typeNum = props.value as number
    if (typeNum === 1 || typeNum === 2 || typeNum === 3 || typeNum === 4 || typeNum === 5) {
      return UserTypeLabels[typeNum as UserType] ?? 'Unknown'
    }
    return 'Unknown'
  }

  if (props.type === 'adminRole') {
    const adminRoleLabels: Record<number, string> = {
      2: 'Super Admin',
      3: 'Manager',
      4: 'Planning',
      5: 'Logistics',
      6: 'Finance',
    }
    return adminRoleLabels[props.value as number] ?? '—'
  }

  if (props.type === 'active') {
    return props.value ? 'Yes' : 'No'
  }

  if (props.type === 'report') {
    const reportLabels: Record<string, string> = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      changes_requested: 'Changes Requested',
      approved: 'Approved',
      delivered: 'Delivered',
    }
    return reportLabels[String(props.value)] || String(props.value)
  }

  if (props.type === 'review') {
    return props.value ? 'Review Required' : 'No Review Required'
  }

  if (props.type === 'taskPriority') {
    const priorityLabels: Record<string, string> = {
      urgent: 'Urgent',
      important: 'Important',
      normal: 'Normal',
      low: 'Low',
    }
    return priorityLabels[String(props.value)] || String(props.value)
  }

  if (props.type === 'taskStatus') {
    const statusLabels: Record<string, string> = {
      new: 'New',
      accepted: 'Accepted',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      canceled: 'Canceled',
    }
    return statusLabels[String(props.value)] || String(props.value)
  }

  if (props.type === 'shiftStatus') {
    const shiftStatusLabels: Record<string, string> = {
      draft: 'Draft',
      published: 'Published',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    return shiftStatusLabels[String(props.value)] || String(props.value)
  }

  if (props.type === 'shiftCount') {
    return `${props.value} shifts`
  }

  if (props.type === 'postOrderStatus') {
    const labels: Record<string, string> = {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
    }
    return labels[String(props.value)] || String(props.value)
  }

  if (props.type === 'poiType') {
    const labels: Record<string, string> = {
      poi: 'POI',
      trespass: 'Trespass',
      metro_red_card: 'Metro Red Card',
    }
    return labels[String(props.value)] || String(props.value)
  }

  if (props.type === 'poiThreat') {
    const labels: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    }
    return labels[String(props.value)] || String(props.value)
  }

  if (props.type === 'poiStatus') {
    const labels: Record<string, string> = {
      draft: 'Draft',
      active: 'Active',
      expired: 'Expired',
      inactive: 'Inactive',
      archived: 'Archived',
    }
    return labels[String(props.value)] || String(props.value)
  }

  if (props.type === 'templateStatus') {
    const labels: Record<string, string> = {
      draft: 'Draft',
      active: 'Active',
      archived: 'Archived',
    }
    return labels[String(props.value)] || String(props.value)
  }

  if (props.type === 'templateCategory') {
    const labels: Record<string, string> = {
      incident: 'Incident',
      daily_activity: 'Daily Activity',
    }
    return labels[String(props.value)] || String(props.value)
  }

  // status type - uppercase the value
  return String(props.value).toUpperCase()
})

const badgeClass = computed((): string => {
  if (props.type === 'status') {
    return `badge--status-${props.value}`
  }
  if (props.type === 'userType') {
    return `badge--type-${props.value}`
  }
  if (props.type === 'adminRole') {
    return `badge--admin-role-${props.value}`
  }
  if (props.type === 'active') {
    return props.value ? 'badge--active-yes' : 'badge--active-no'
  }
  if (props.type === 'report') {
    return `badge--report-${props.value}`
  }
  if (props.type === 'review') {
    return props.value ? 'badge--review-required' : 'badge--no-review'
  }
  if (props.type === 'taskPriority') {
    return `badge--priority-${props.value}`
  }
  if (props.type === 'taskStatus') {
    return `badge--task-${props.value}`
  }
  if (props.type === 'shiftStatus') {
    return `badge--shift-${props.value}`
  }
  if (props.type === 'shiftCount') {
    return 'badge--shift-count'
  }
  if (props.type === 'postOrderStatus') {
    return `badge--po-${props.value}`
  }
  if (props.type === 'poiType') {
    return `badge--poi-type-${props.value}`
  }
  if (props.type === 'poiThreat') {
    return `badge--poi-threat-${props.value}`
  }
  if (props.type === 'poiStatus') {
    return `badge--poi-status-${props.value}`
  }
  if (props.type === 'templateStatus') {
    return `badge--tpl-status-${props.value}`
  }
  if (props.type === 'templateCategory') {
    return `badge--tpl-cat-${props.value}`
  }
  return ''
})
</script>

<template>
  <span class="badge" :class="badgeClass">
    {{ label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
}

/* Status variants */
.badge--status-active {
  background: rgba(17, 156, 166, 0.15);
  color: #119ca6;
  border: 1px solid rgba(17, 156, 166, 0.3);
}

.badge--status-maintenance {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge--status-inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

/* User Type variants */
.badge--type-1 { /* Admin */
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge--type-2 { /* Manager */
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge--type-3 { /* Planning */
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge--type-4 { /* Logistics */
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge--type-5 { /* Finance */
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* Admin User Role variants */
.badge--admin-role-2 { /* Super Admin */
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge--admin-role-3 { /* Manager */
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge--admin-role-4 { /* Planning */
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge--admin-role-5 { /* Logistics */
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge--admin-role-6 { /* Finance */
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* Active variants */
.badge--active-yes {
  color: var(--color-ok, #10b981);
  font-weight: 500;
  padding: 0;
  background: transparent;
  border: none;
}

.badge--active-no {
  color: var(--color-text-muted);
  font-weight: 500;
  padding: 0;
  background: transparent;
  border: none;
}

/* Report Status variants */
.badge--report-submitted {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge--report-under_review {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge--report-changes_requested {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge--report-approved {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge--report-delivered {
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Review Required variants */
.badge--review-required {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge--no-review {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

/* Task Priority variants */
.badge--priority-urgent {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge--priority-important {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge--priority-normal {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge--priority-low {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

/* Task Status variants */
.badge--task-new {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge--task-accepted {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge--task-approved {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.badge--task-rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge--task-completed {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge--task-canceled {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Shift Status variants */
.badge--shift-draft {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.badge--shift-published {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge--shift-active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge--shift-completed {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge--shift-cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Post Order Status variants */
.badge--po-draft {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.badge--po-published {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge--po-archived {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.badge--shift-count {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* POI Type variants */
.badge--poi-type-poi {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.badge--poi-type-trespass {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.badge--poi-type-metro_red_card {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* POI Threat variants */
.badge--poi-threat-low {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.badge--poi-threat-medium {
  background: rgba(234, 179, 8, 0.15);
  color: #ca8a04;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.badge--poi-threat-high {
  background: rgba(249, 115, 22, 0.15);
  color: #ea580c;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.badge--poi-threat-critical {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* POI Status variants */
.badge--poi-status-draft {
  background: rgba(156, 163, 175, 0.12);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.25);
}

.badge--poi-status-active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge--poi-status-expired {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge--poi-status-inactive {
  background: rgba(139, 92, 246, 0.12);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.badge--poi-status-archived {
  background: rgba(107, 114, 128, 0.12);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.25);
}

/* Template Status variants */
.badge--tpl-status-active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge--tpl-status-draft {
  background: rgba(234, 179, 8, 0.15);
  color: #ca8a04;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.badge--tpl-status-archived {
  background: rgba(107, 114, 128, 0.12);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.25);
}

/* Template Category variants */
.badge--tpl-cat-incident {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.badge--tpl-cat-daily_activity {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.25);
}
</style>
