import type { Socket } from 'socket.io-client'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { useNotificationBadge } from './useNotificationBadge'
import { NotificationConfig } from '~/utils/config'
import type { Notification, NotificationType } from '~/api/types/notification'

const SOCKET_URL = NotificationConfig.socketUrl

// Shared reactive state (singleton across components)
const socket = ref<Socket | null>(null)
const isConnected = ref(false)
const latestNotification = ref<Notification | null>(null)
const urgentAlert = ref<Notification | null>(null)
let activeInstances = 0
let isConnecting = false

interface SocketMessage {
  event?: string
  notification_id?: number | null
  type?: NotificationType
  title?: string
  message?: string
  payload?: any
}

function normalizeMessage(data: any): SocketMessage | null {
  if (!data) return null
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }
  return data as SocketMessage
}

function createNotificationFromMessage(msg: SocketMessage): Notification {
  const now = new Date().toISOString()
  let payload: Notification['payload'] = null
  if (msg.payload) {
    try {
      payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload
    } catch {
      payload = null
    }
  }

  return {
    notification_id: msg.notification_id ?? Date.now(),
    type: msg.type ?? 'general',
    title: msg.title ?? '',
    message: msg.message ?? '',
    payload,
    is_read: false,
    read_on: null,
    sender_id: '',
    community_id: null,
    created_on: now,
  }
}

export function useNotificationSocket() {
  const authStore = useAuthStore()
  const toastStore = useToastStore()
  const { t } = useTranslation()
  const { increment } = useNotificationBadge()

  const URGENT_TYPES: NotificationType[] = ['panic_button', 'new_emergency']

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
  }

  async function connect() {
    if (socket.value || isConnecting || !authStore.isAuthenticated || !authStore.token) return

    isConnecting = true

    // Lazy import to avoid SSR issues with socket.io-client
    const { io: createSocket } = await import('socket.io-client')
      .finally(() => {
        isConnecting = false
      })

    const newSocket = createSocket(SOCKET_URL, {
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      isConnected.value = true
      console.log('[NotificationSocket] Connected, socket id:', newSocket.id)
      console.log('[NotificationSocket] Emitting #token')
      newSocket.emit('#token', authStore.token)
    })

    newSocket.on('disconnect', (reason: string) => {
      isConnected.value = false
      console.log('[NotificationSocket] Disconnected:', reason)
    })

    newSocket.on('connect_error', (err: Error) => {
      console.error('[NotificationSocket] Connect error:', err.message)
    })

    // Server heartbeat/ack event used in the legacy app
    newSocket.on('#token', (data: any) => {
      console.log('[NotificationSocket] #token event received:', data)
      newSocket.emit('echo', 'Echo message')
      console.log('[NotificationSocket] Emitted echo response')
    })

    newSocket.on('message', (data: any) => {
      console.log('[NotificationSocket] Raw message:', data)

      // Plain string heartbeats (e.g. "connection checking") should not be treated as errors
      if (typeof data === 'string') {
        const trimmed = data.trim()
        try {
          JSON.parse(trimmed)
        } catch {
          console.log('[NotificationSocket] Heartbeat/string message received:', trimmed)
          return
        }
      }

      const msg = normalizeMessage(data)
      console.log('[NotificationSocket] Parsed message:', msg)

      if (!msg || msg.event !== 'new_notification') {
        const eventName = msg?.event || 'unknown'
        console.log('[NotificationSocket] Received event:', eventName)

        // Acknowledge test/heartbeat events so the testing tool knows the message was received
        const ackEvents = ['test', 'connection_check', 'connection_checking', 'ping']
        if (msg?.event && ackEvents.includes(msg.event)) {
          newSocket.emit('echo', { received: msg.event, timestamp: Date.now() })
          console.log('[NotificationSocket] Acknowledged event:', msg.event)
        }
        return
      }

      const notification = createNotificationFromMessage(msg)
      console.log('[NotificationSocket] Created notification:', notification)
      latestNotification.value = notification

      // 1. Increment badge counter
      increment()
      console.log('[NotificationSocket] Badge incremented')

      // 2. Show toast notification
      const toastMessage = notification.title
        ? `${notification.title}: ${notification.message}`
        : notification.message

      if (URGENT_TYPES.includes(notification.type)) {
        toastStore.error(toastMessage, 8000)
        urgentAlert.value = notification
        console.log('[NotificationSocket] Urgent alert set:', notification.type)
      } else {
        toastStore.info(toastMessage, 4500)
        console.log('[NotificationSocket] Info toast shown:', notification.type)
      }
    })

    socket.value = newSocket
  }

  onMounted(() => {
    activeInstances++
    if (activeInstances === 1) {
      connect()
    }
  })

  // Watch auth state to connect after login or disconnect on logout
  watch(
    () => authStore.isAuthenticated,
    (authenticated) => {
      if (authenticated && authStore.token) {
        connect()
      } else {
        disconnect()
      }
    }
  )

  onUnmounted(() => {
    activeInstances--
    if (activeInstances <= 0) {
      disconnect()
      activeInstances = 0
    }
  })

  function dismissUrgentAlert() {
    urgentAlert.value = null
  }

  return {
    isConnected: readonly(isConnected),
    latestNotification: readonly(latestNotification),
    urgentAlert: readonly(urgentAlert),
    connect,
    disconnect,
    dismissUrgentAlert,
  }
}
