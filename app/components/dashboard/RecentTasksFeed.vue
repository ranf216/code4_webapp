<script setup lang="ts">
import { useTranslation } from '~/composables/useI18n'
import type { DashboardRecentTask } from '~/api/types/dashboard'
import { PRIORITY_COLORS, TASK_STATUS_COLORS, colorFor, priorityIcon, relativeTime, fullDateTime, truncate, humanizeKey } from '~/utils/dashboard'

defineProps<{
  items: DashboardRecentTask[]
  loading?: boolean
  variant?: 'card' | 'compact'
  total?: number
}>()

const { t } = useTranslation()
const router = useRouter()

function goToTasks() {
  router.push('/tasks')
}
</script>

<template>
  <div class="feed" :class="{ 'feed--compact': variant === 'compact' }">
    <div class="feed__header">
      <h3 class="feed__title">
        {{ t('dashboard.recent_tasks') }}
        <span v-if="items.length" class="feed__badge">{{ total ?? items.length }}</span>
      </h3>
      <button type="button" class="feed__show-all" @click="goToTasks">
        {{ t('dashboard.show_all') }}
      </button>
    </div>

    <div v-if="loading" class="feed__skeleton">
      <div v-for="n in 3" :key="n" class="skeleton-item">
        <span class="skeleton-block skeleton-block--badge" />
        <span class="skeleton-block skeleton-block--line" />
        <span class="skeleton-block skeleton-block--short" />
      </div>
    </div>
    <div v-else-if="!items.length" class="feed__empty">
      <Icon name="lucide:check-circle" :size="20" />
      <span>{{ t('dashboard.no_open_tasks') }}</span>
    </div>
    <div v-else class="feed__list">
      <div v-if="variant === 'compact'" class="feed__columns" aria-hidden="true">
        <span>{{ t('dashboard.task_column_title') }}</span>
        <span>{{ t('dashboard.call_column_description') }}</span>
        <span>{{ t('dashboard.task_column_assignee') }}</span>
        <span>{{ t('dashboard.call_column_community') }}</span>
        <span>{{ t('dashboard.call_column_created') }}</span>
      </div>
      <button
        v-for="task in items"
        :key="task.task_id"
        type="button"
        class="feed-item"
        @click="goToTasks"
      >
        <div class="feed-item__row">
          <span class="feed-item__title">{{ task.title }}</span>
          <span
            class="badge badge--priority"
            :class="{ 'badge--urgent': task.priority === 'urgent' }"
            :style="{ backgroundColor: colorFor(PRIORITY_COLORS, task.priority) }"
          >
            <Icon :name="priorityIcon(task.priority)" :size="10" />
            {{ humanizeKey(task.priority) }}
          </span>
          <span
            class="tag"
            :style="{ backgroundColor: colorFor(TASK_STATUS_COLORS, task.status) }"
          >{{ humanizeKey(task.status) }}</span>
        </div>
        <p class="feed-item__desc" :title="variant === 'compact' ? task.description : undefined">{{ variant === 'compact' ? (task.description || '—') : truncate(task.description, 60) }}</p>
        <div class="feed-item__meta">
          <span v-if="task.assignee_name || variant === 'compact'">{{ variant === 'compact' ? (task.assignee_name || t('dashboard.unassigned')) : `${t('dashboard.assigned_to')} ${task.assignee_name}` }}</span>
          <span>{{ task.community_name }}</span>
        </div>
        <span class="feed-item__time" :title="fullDateTime(task.created_on)">
          {{ relativeTime(task.created_on) }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.feed {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feed__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.feed__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.feed__badge {
  min-width: 20px;
  padding: 0 var(--space-1);
  border-radius: 10px;
  background: var(--color-accent);
  color: var(--color-bg-base);
  font-size: var(--font-size-xs);
  text-align: center;
}

.feed__show-all {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  margin-top:0px;
}

.feed__show-all:hover {
  color: var(--color-accent);
}

.feed__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-6);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.feed__list {
  display: flex;
  flex-direction: column;
}

.feed-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  cursor: pointer;
  margin-top: 0px;
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-item:hover {
  background: var(--color-bg-elevated);
}

.feed-item__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.feed-item__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.badge {
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge--priority {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.badge--urgent {
  font-weight: 700;
}

.tag {
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 10px;
}

.feed-item__desc {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.feed-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.feed-item__meta span + span::before {
  content: '·';
  margin-right: var(--space-2);
}

.feed-item__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.feed__columns {
  display: none;
}

.feed-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.feed--compact .feed__list {
  overflow-x: auto;
}

@media (min-width: 0px) {
  .feed--compact .feed__columns,
  .feed--compact .feed-item {
    min-width: 780px;
  }

  .feed--compact {
    border-radius: var(--radius-lg);
  }

  .feed--compact .feed__columns,
  .feed--compact .feed-item {
    display: grid;
    grid-template-columns: minmax(180px, 2fr) minmax(160px, 2fr) minmax(100px, 1fr) minmax(120px, 1.4fr) minmax(90px, 0.8fr);
    align-items: center;
    gap: 0;
    padding: 0;
    font-size: var(--font-size-sm);
  }

  .feed--compact .feed__columns {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    font-weight: 600;
    white-space: nowrap;
  }

  .feed--compact .feed__columns > span,
  .feed--compact .feed-item > .feed-item__row,
  .feed--compact .feed-item > .feed-item__desc,
  .feed--compact .feed-item__meta > span,
  .feed--compact .feed-item > .feed-item__time {
    padding: var(--space-3) var(--space-4);
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .feed--compact .feed-item:hover {
    background: var(--color-surface);
  }

  .feed--compact .feed-item__meta {
    display: contents;
  }

  .feed--compact .feed-item__meta > span,
  .feed--compact .feed-item__time {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .feed--compact .feed-item__meta span + span::before {
    content: none;
  }

  .feed--compact .feed-item__desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }
}

.feed__skeleton {
  display: flex;
  flex-direction: column;
}

.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.skeleton-item:last-child {
  border-bottom: none;
}

.skeleton-block {
  display: block;
  height: 12px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-surface, var(--color-bg-elevated)) 50%, var(--color-bg-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

.skeleton-block--badge { width: 90px; height: 16px; }
.skeleton-block--line { width: 85%; }
.skeleton-block--short { width: 55%; }

@keyframes shimmer {
  to { background-position: -200% 0; }
}

</style>
