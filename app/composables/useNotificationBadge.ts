import { notificationApi } from '~/api/notification'
import { NotificationConfig } from '~/utils/config'

const POLL_INTERVAL = NotificationConfig.pollIntervalMs

// Shared reactive state (singleton across components)
const unreadCount = ref(0)
const isPolling = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null
let activeInstances = 0

/**
 * Composable to manage the notification badge unread count.
 * Fetches on mount, polls every 60s, and exposes a refresh method
 * for use after mark_as_read / mark_all_as_read / delete_notification.
 */
export function useNotificationBadge() {
  async function fetchUnreadCount() {
    try {
      const response = await notificationApi.getUnreadCount({ showLoading: false })
      if (response.rc === 0) {
        unreadCount.value = response.unread_count ?? 0
      }
    } catch {
      // Silently ignore — badge is non-critical
    }
  }

  function startPolling() {
    if (pollTimer) return
    isPolling.value = true
    pollTimer = setInterval(fetchUnreadCount, POLL_INTERVAL)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    isPolling.value = false
  }

  /** Increment badge optimistically (e.g., on WebSocket new_notification event) */
  function increment(amount = 1) {
    unreadCount.value += amount
  }

  /** Reset badge to zero (e.g., after mark_all_as_read) */
  function reset() {
    unreadCount.value = 0
  }

  /** Decrement badge by 1 (e.g., after marking a single notification as read) */
  function decrement(amount = 1) {
    unreadCount.value = Math.max(0, unreadCount.value - amount)
  }

  // Formatted badge text
  const badgeText = computed(() => {
    if (unreadCount.value <= 0) return ''
    if (unreadCount.value > 99) return '99+'
    return String(unreadCount.value)
  })

  const showBadge = computed(() => unreadCount.value > 0)

  onMounted(() => {
    activeInstances++
    if (activeInstances === 1) {
      fetchUnreadCount()
      startPolling()
    }
  })

  onUnmounted(() => {
    activeInstances--
    if (activeInstances <= 0) {
      stopPolling()
      activeInstances = 0
    }
  })

  return {
    unreadCount: readonly(unreadCount),
    badgeText,
    showBadge,
    refresh: fetchUnreadCount,
    increment,
    decrement,
    reset,
  }
}
