<script setup lang="ts">
import moment from 'moment'
import { notificationApi } from '~/api/notification'
import { useNotificationBadge } from '~/composables/useNotificationBadge'
import { useToastStore } from '~/stores/toast'
import type { Notification, NotificationType } from '~/api/types/notification'

const { t } = useTranslation()
const toastStore = useToastStore()
const router = useRouter()
const { showBadge, refresh: refreshBadge, decrement, reset: resetBadge } = useNotificationBadge()

const isOpen = ref(false)
const notifications = ref<Notification[]>([])
const loading = ref(false)
const markingAll = ref(false)

// Toggle dropdown
function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchNotifications()
  }
}

// Close dropdown
function close() {
  isOpen.value = false
}

// Close on click outside
const dropdownRef = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, true)
})

// Fetch latest notifications
async function fetchNotifications() {
  loading.value = true
  try {
    const response = await notificationApi.getNotifications(
      { offset: 0, limit: 15 },
      { showLoading: false }
    )
    if (response.rc === 0) {
      notifications.value = response.notifications ?? []
    }
  } catch {
    // Silently fail
  } finally {
    loading.value = false
  }
}

// Mark all as read
async function handleMarkAllRead() {
  if (markingAll.value) return
  markingAll.value = true
  try {
    const response = await notificationApi.markAllAsRead({ showLoading: false })
    if (response.rc === 0) {
      notifications.value.forEach((n) => {
        n.is_read = true
        n.read_on = new Date().toISOString()
      })
      resetBadge()
      toastStore.success(t('notifications.all_marked_read'), 2500)
    }
  } catch {
    toastStore.error(t('notifications.mark_all_failed'))
  } finally {
    markingAll.value = false
  }
}

// Click on a notification item
async function handleItemClick(item: Notification) {
  // 1. Mark as read if unread
  if (!item.is_read) {
    try {
      await notificationApi.markAsRead(item.notification_id, { showLoading: false })
      item.is_read = true
      item.read_on = new Date().toISOString()
      decrement()
    } catch {
      // Continue with navigation even if mark fails
    }
  }

  // 2. Navigate to linked entity
  if (item.payload?.entity_type && item.payload?.entity_id) {
    const path = resolveEntityPath(item.payload.entity_type, item.payload.entity_id)
    if (path) {
      router.push(path)
    }
  }

  // 3. Close panel
  close()
}

// Resolve entity path for deep linking
function resolveEntityPath(entityType: string, entityId: number | string): string | null {
  switch (entityType) {
    case 'call':
      return `/calls/${entityId}`
    case 'report':
      return `/reports/${entityId}`
    case 'shift':
      return `/shifts/${entityId}`
    case 'post_order':
      return `/post-orders/${entityId}`
    case 'poi':
      return `/poi/${entityId}`
    case 'task':
      return `/tasks/${entityId}`
    default:
      return null
  }
}

// Notification type → icon mapping (Lucide icons)
function getTypeIcon(type: NotificationType): string {
  switch (type) {
    case 'new_emergency':
    case 'new_service_call':
    case 'call_accepted':
    case 'call_resolved':
    case 'call_updated':
    case 'call_canceled':
    case 'resident_like':
      return 'lucide:phone-incoming'
    case 'new_incident_report':
    case 'report_submitted':
    case 'report_approved':
    case 'report_changes_requested':
    case 'report_delivered':
      return 'lucide:file-text'
    case 'shift_published':
    case 'shift_updated':
    case 'shift_cancelled':
    case 'shift_starting_soon':
      return 'lucide:calendar'
    case 'route_updated':
    case 'officer_off_route':
      return 'lucide:map-pin'
    case 'post_order_published':
    case 'post_order_updated':
      return 'lucide:clipboard-list'
    case 'poi_active':
    case 'poi_updated':
    case 'poi_inactivated':
    case 'poi_expiring_soon':
    case 'poi_expired':
      return 'lucide:shield-alert'
    case 'task_update':
      return 'lucide:wrench'
    case 'panic_button':
      return 'lucide:alert-circle'
    case 'gps_signal_lost':
      return 'lucide:navigation'
    case 'general':
    default:
      return 'lucide:bell'
  }
}

// Relative timestamp formatting (spec 2.9) — converts UTC to local
function formatRelativeTime(utcDateStr: string): string {
  const local = moment.utc(utcDateStr).local()
  const now = moment()
  const diffMin = now.diff(local, 'minutes')
  const diffHr = now.diff(local, 'hours')
  const diffDay = now.diff(local, 'days')

  if (diffMin < 1) return t('notifications.time.just_now')
  if (diffMin < 60) return t('notifications.time.minutes_ago', { n: String(diffMin) })
  if (diffHr < 24) return t('notifications.time.hours_ago', { n: String(diffHr) })
  if (diffDay === 1) return t('notifications.time.yesterday')
  if (diffDay < 7) return t('notifications.time.days_ago', { n: String(diffDay) })

  // 7+ days: formatted date
  return local.format('MMM D, YYYY')
}

// Check if any notification is unread
const hasUnread = computed(() => notifications.value.some((n) => !n.is_read))

defineExpose({ toggle, close, isOpen })
</script>

<template>
  <div ref="dropdownRef" class="notif-dropdown-wrapper">
    <!-- Bell trigger -->
    <slot :toggle="toggle" :is-open="isOpen" />

    <!-- Dropdown panel -->
    <Transition name="notif-dropdown">
      <div v-if="isOpen" class="notif-dropdown">
        <!-- Header -->
        <div class="notif-dropdown__header">
          <h3 class="notif-dropdown__title">{{ t('notifications.title') }}</h3>
          <button
            v-if="hasUnread"
            class="notif-dropdown__mark-all"
            :disabled="markingAll"
            @click.stop="handleMarkAllRead"
          >
            {{ markingAll ? t('notifications.marking') : t('notifications.mark_all_read') }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="notif-dropdown__loading">
          <Icon name="lucide:loader-2" :size="20" class="notif-dropdown__spinner" />
        </div>

        <!-- Empty state -->
        <div v-else-if="notifications.length === 0" class="notif-dropdown__empty">
          <Icon name="lucide:bell-off" :size="28" class="notif-dropdown__empty-icon" />
          <span>{{ t('notifications.no_notifications') }}</span>
        </div>

        <!-- Notification list -->
        <div v-else class="notif-dropdown__list">
          <div
            v-for="item in notifications"
            :key="item.notification_id"
            class="notif-item"
            :class="{ 'notif-item--unread': !item.is_read }"
            @click="handleItemClick(item)"
          >
            <!-- Read/unread dot -->
            <span class="notif-item__dot" :class="{ 'notif-item__dot--unread': !item.is_read }" />
            <!-- Type icon -->
            <Icon :name="getTypeIcon(item.type)" :size="16" class="notif-item__icon" :class="{ 'notif-item__icon--emergency': item.type === 'panic_button' }" />
            <div class="notif-item__content">
              <div class="notif-item__top">
                <span class="notif-item__item-title">{{ item.title }}</span>
                <span class="notif-item__time">{{ formatRelativeTime(item.created_on) }}</span>
              </div>
              <p class="notif-item__message">{{ item.message }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="notif-dropdown__footer">
          <button class="notif-dropdown__view-all" @click="close">
            {{ t('notifications.view_all') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.notif-dropdown-wrapper {
  position: relative;
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 400px;
  max-height: 520px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
}

/* Header */
.notif-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.notif-dropdown__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.notif-dropdown__mark-all {
  background: none;
  border: none;
  color: var(--color-accent, #e5ff44);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: opacity 0.15s;
}

.notif-dropdown__mark-all:hover {
  opacity: 0.8;
}

.notif-dropdown__mark-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading */
.notif-dropdown__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--color-text-muted);
}

.notif-dropdown__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Empty state */
.notif-dropdown__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.notif-dropdown__empty-icon {
  opacity: 0.4;
}

/* Notification list */
.notif-dropdown__list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

/* Notification item */
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.15s;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item:hover {
  background: var(--color-bg-overlay);
}

.notif-item--unread {
  background: rgba(59, 130, 246, 0.06);
}

.notif-item--unread:hover {
  background: rgba(59, 130, 246, 0.1);
}

.notif-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
  background: transparent;
}

.notif-item__dot--unread {
  background: #3b82f6;
}

.notif-item__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-item--unread .notif-item__icon {
  color: var(--color-text-secondary);
}

.notif-item__icon--emergency {
  color: var(--color-critical, #ef4444) !important;
}

/* Content */
.notif-item__content {
  flex: 1;
  min-width: 0;
}

.notif-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.notif-item__item-title {
  font-size: var(--font-size-sm);
  font-weight: 400;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-item--unread .notif-item__item-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.notif-item__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.notif-item__message {
  margin: 2px 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-item--unread .notif-item__message {
  color: var(--color-text-secondary);
}

/* Read items: slightly reduced opacity */
.notif-item:not(.notif-item--unread) {
  opacity: 0.85;
}

/* Footer */
.notif-dropdown__footer {
  border-top: 1px solid var(--color-border);
  padding: var(--space-3) var(--space-4);
  text-align: center;
  flex-shrink: 0;
}

.notif-dropdown__view-all {
  background: none;
  border: none;
  color: var(--color-accent, #e5ff44);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: var(--radius-md);
  transition: opacity 0.15s;
  width: 100%;
}

.notif-dropdown__view-all:hover {
  opacity: 0.8;
}

/* Transition */
.notif-dropdown-enter-active,
.notif-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.notif-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.notif-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
