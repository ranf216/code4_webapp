<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import moment from 'moment'
import { notificationApi } from '~/api/notification'
import { useNotificationBadge } from '~/composables/useNotificationBadge'
import { useToastStore } from '~/stores/toast'
import { getNotificationTypeIcon, resolveNotificationEntityPath } from '~/utils/notification'
import { utcToLocal } from '~/utils/dateTime'
import type { Notification } from '~/api/types/notification'

definePageMeta({ layout: 'default' })

const { t } = useTranslation()
const toastStore = useToastStore()
const router = useRouter()
const { reset: resetBadge } = useNotificationBadge()

const limit = ref(20)
const offset = ref(0)
const totalCount = ref(0)
const notifications = ref<Notification[]>([])
const loading = ref(false)
const markingAll = ref(false)

const readFilter = ref<'all' | 'read' | 'unread'>('all')
const fromDate = ref('')
const toDate = ref('')

const hasUnread = computed(() => notifications.value.some((n) => !n.is_read))
const hasNext = computed(() => offset.value + notifications.value.length < totalCount.value)
const hasPrev = computed(() => offset.value > 0)

async function loadNotifications() {
  loading.value = true
  try {
    const response = await notificationApi.getNotifications({
      limit: limit.value,
      offset: offset.value,
      is_read: readFilter.value === 'read' ? true : readFilter.value === 'unread' ? false : null,
      from_date: fromDate.value || undefined,
      to_date: toDate.value || undefined,
    }, { showLoading: false })
    if (response.rc === 0) {
      notifications.value = response.notifications ?? []
      totalCount.value = response.total_count ?? 0
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

function nextPage() {
  offset.value += limit.value
}

function prevPage() {
  offset.value = Math.max(0, offset.value - limit.value)
}

function resetPagination() {
  offset.value = 0
  loadNotifications()
}

watch([readFilter, fromDate, toDate], resetPagination)
watch(offset, loadNotifications)

onMounted(loadNotifications)

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

async function handleMarkAsRead(item: Notification, event?: MouseEvent) {
  event?.stopPropagation()
  if (item.is_read) return
  try {
    await notificationApi.markAsRead(item.notification_id, { showLoading: false })
    item.is_read = true
    item.read_on = new Date().toISOString()
  } catch {
    // silently continue
  }
}

async function handleDelete(item: Notification, event: MouseEvent) {
  event.stopPropagation()
  try {
    const response = await notificationApi.deleteNotification(item.notification_id, { showLoading: false })
    if (response.rc === 0 || response.rc === 730) {
      const idx = notifications.value.findIndex((n) => n.notification_id === item.notification_id)
      if (idx > -1) notifications.value.splice(idx, 1)
      totalCount.value = Math.max(0, totalCount.value - 1)
    }
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

function handleItemClick(item: Notification) {
  handleMarkAsRead(item)
  const path = resolveNotificationEntityPath(item.payload?.entity_type, item.payload?.entity_id)
  if (path) router.push(path)
}

function formatRelativeTime(utcDateStr: string): string {
  const local = utcToLocal(utcDateStr)
  const now = moment()
  const diffMin = Math.max(0, now.diff(local, 'minutes'))
  const diffHr = Math.max(0, now.diff(local, 'hours'))
  const diffDay = now.diff(local, 'days')
  if (diffMin < 1) return t('notifications.time.just_now')
  if (diffMin < 60) return t('notifications.time.minutes_ago', { n: String(diffMin) })
  if (diffHr < 24) return t('notifications.time.hours_ago', { n: String(diffHr) })
  if (diffDay === 1) return t('notifications.time.yesterday')
  if (diffDay >= 2 && diffDay < 7) return t('notifications.time.days_ago', { n: String(diffDay) })
  return local.format('MMM D, YYYY')
}

function formatTypeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<template>
  <AppHeader
    :title="t('notifications.title')"
    :breadcrumb="[{ label: 'Admin' }, { label: t('notifications.title') }]"
  />

  <div class="notifications-page">
    <!-- Toolbar -->
    <div class="notifications-toolbar">
      <div class="notifications-toolbar__filters">
        <select v-model="readFilter" class="filter-select">
          <option value="all">{{ t('notifications.filter.all') }}</option>
          <option value="unread">{{ t('notifications.filter.unread') }}</option>
          <option value="read">{{ t('notifications.filter.read') }}</option>
        </select>

        <input v-model="fromDate" type="date" class="filter-input" :placeholder="t('notifications.filter.from_date')" />
        <input v-model="toDate" type="date" class="filter-input" :placeholder="t('notifications.filter.to_date')" />
      </div>

      <button
        v-if="hasUnread"
        class="btn btn--secondary"
        :disabled="markingAll"
        @click="handleMarkAllRead"
      >
        {{ markingAll ? t('notifications.marking') : t('notifications.mark_all_read') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="notifications-loading">
      <Icon name="lucide:loader-2" :size="24" class="animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="notifications.length === 0" class="notifications-empty">
      <Icon name="lucide:bell-off" :size="40" />
      <span>{{ t('notifications.no_notifications') }}</span>
    </div>

    <!-- List -->
    <div v-else class="notifications-list">
      <div class="notifications-list__header">
        <div class="header-cell header-cell--status">{{ t('notifications.col.status') }}</div>
        <div class="header-cell header-cell--type">{{ t('notifications.col.type') }}</div>
        <div class="header-cell">{{ t('notifications.col.content') }}</div>
        <div class="header-cell header-cell--time">{{ t('notifications.col.time') }}</div>
        <div class="header-cell header-cell--actions">{{ t('notifications.col.actions') }}</div>
      </div>
      <div
        v-for="item in notifications"
        :key="item.notification_id"
        class="notification-item"
        :class="{ 'notification-item--unread': !item.is_read }"
        @click="handleItemClick(item)"
      >
        <div class="notification-item__status">
          <span class="status-dot" :class="{ unread: !item.is_read }" />
        </div>

        <div class="notification-item__type">
          <Icon
            :name="getNotificationTypeIcon(item.type)"
            :size="18"
            :class="{ 'notification-item__type-icon--emergency': item.type === 'panic_button' }"
          />
          <span class="type-label">{{ formatTypeLabel(item.type) }}</span>
        </div>

        <div class="notification-item__content">
          <h4 class="notification-item__title">{{ item.title }}</h4>
          <p class="notification-item__message">{{ item.message }}</p>
        </div>

        <div class="notification-item__time">{{ formatRelativeTime(item.created_on) }}</div>

        <div class="notification-item__actions" @click.stop>
          <button
            v-if="!item.is_read"
            class="action-btn"
            :title="t('notifications.mark_as_read')"
            @click="handleMarkAsRead(item, $event)"
          >
            <Icon name="lucide:check" :size="16" />
          </button>
          <button
            class="action-btn"
            :title="t('notifications.delete')"
            @click="handleDelete(item, $event)"
          >
            <Icon name="lucide:trash-2" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalCount > 0" class="notifications-pagination">
      <button class="btn btn--ghost" :disabled="hasPrev === false" @click="prevPage">
        {{ t('common.previous') }}
      </button>
      <span class="pagination-info">
        {{ offset + 1 }} - {{ Math.min(offset + notifications.length, totalCount) }} of {{ totalCount }}
      </span>
      <button class="btn btn--ghost" :disabled="hasNext === false" @click="nextPage">
        {{ t('common.next') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  min-height: calc(100vh - 64px);
}

.notifications-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.notifications-toolbar__filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.filter-select,
.filter-input {
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}

.filter-select {
  min-width: 160px;
}

.filter-input {
  min-width: 140px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--secondary {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.notifications-loading,
.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  flex: 1;
  min-height: 300px;
  color: var(--color-text-muted);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.notifications-list__header {
  display: grid;
  grid-template-columns: 36px 180px 1fr 120px 88px;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.header-cell {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.header-cell--time {
  text-align: right;
}

.header-cell--actions {
  text-align: center;
}

.notification-item {
  display: grid;
  grid-template-columns: 36px 180px 1fr 120px 88px;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--transition-base);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: var(--color-bg-overlay);
}

.notification-item--unread {
  background: rgba(79, 110, 247, 0.05);
}

.notification-item__status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-border);
}

.status-dot.unread {
  background: var(--color-accent);
}

.notification-item__type {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
}

.type-label {
  font-size: var(--font-size-sm);
  text-transform: capitalize;
}

.notification-item__type-icon--emergency {
  color: var(--color-critical);
}

.notification-item__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.notification-item__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.notification-item__message {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.notification-item__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
  white-space: nowrap;
}

.notification-item__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.action-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.notifications-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .notification-item {
    grid-template-columns: 36px 1fr 120px;
    grid-template-rows: auto auto;
    row-gap: var(--space-2);
  }

  .notification-item__type {
    grid-column: 2 / 3;
  }

  .notification-item__content {
    grid-column: 2 / 3;
  }

  .notification-item__time {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
  }

  .notification-item__actions {
    grid-column: 3 / 4;
    grid-row: 2 / 3;
  }
}
</style>
