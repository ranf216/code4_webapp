<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import type { GetOverviewResponse } from '~/api/types/dashboard'
import { secondsAgo } from '~/utils/dashboard'

const props = defineProps<{
  overview: GetOverviewResponse | null
  loading?: boolean
  updatedOn?: Date | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const { t } = useTranslation()
const router = useRouter()

// Tick every second so "Last updated: Xs ago" counts up live (§5.3)
const now = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tickTimer = setInterval(() => { now.value = Date.now() }, 1000)
})

onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
})

const updatedSeconds = computed(() => {
  if (!props.updatedOn) return 0
  now.value // track
  return secondsAgo(props.updatedOn)
})

interface KpiCard {
  key: string
  title: string
  icon: string
  accent: string
  value: number
  route: string
}

const cards = computed<KpiCard[]>(() => [
  {
    key: 'calls',
    title: t('dashboard.kpi_active_calls'),
    icon: 'lucide:phone-call',
    accent: '#DC3545',
    value: props.overview?.active_calls_count ?? 0,
    route: '/calls?tab=open',
  },
  {
    key: 'tasks',
    title: t('dashboard.kpi_open_tasks'),
    icon: 'lucide:clipboard-list',
    accent: '#FD7E14',
    value: props.overview?.open_tasks_count ?? 0,
    route: '/tasks',
  },
  {
    key: 'reports',
    title: t('dashboard.kpi_pending_reports'),
    icon: 'lucide:flag',
    accent: '#0DCAF0',
    value: props.overview?.open_reports_count ?? 0,
    route: '/incident-reports?tab=pending-review',
  },
  {
    key: 'communities',
    title: t('dashboard.kpi_active_communities'),
    icon: 'lucide:building-2',
    accent: '#198754',
    value: props.overview?.active_communities_count ?? 0,
    route: '/communities',
  },
  {
    key: 'officers',
    title: t('dashboard.kpi_on_duty_officers'),
    icon: 'lucide:shield-check',
    accent: '#6610F2',
    value: props.overview?.active_officers_count ?? 0,
    route: '/officers',
  },
])
</script>

<template>
  <section class="overview">
    <div class="overview__header">
      <h2 class="overview__title">{{ t('dashboard.overview_title') }}</h2>
      <div class="overview__meta">
        <span v-if="updatedOn" class="overview__updated">
          {{ t('dashboard.last_updated') }} {{ updatedSeconds }}s
        </span>
        <button
          type="button"
          class="overview__refresh"
          :disabled="loading"
          :title="t('dashboard.refresh')"
          @click="emit('refresh')"
        >
          <Icon name="lucide:refresh-cw" :size="14" :class="{ spinner: loading }" />
        </button>
      </div>
    </div>

    <!-- KPI cards -->
    <div v-if="loading && !overview" class="kpi-grid">
      <span v-for="n in 5" :key="n" class="kpi-skeleton" />
    </div>
    <div v-else class="kpi-grid" :class="{ 'is-loading': loading }">
      <button
        v-for="card in cards"
        :key="card.key"
        type="button"
        class="kpi-card"
        :style="{ borderLeftColor: card.accent }"
        @click="router.push(card.route)"
      >
        <div class="kpi-card__top">
          <Icon :name="card.icon" :size="24" :style="{ color: card.accent }" />
          <span class="kpi-card__value" :class="{ 'kpi-card__value--zero': !card.value }">
            {{ card.value }}
          </span>
        </div>
        <span class="kpi-card__label">{{ card.title }}</span>
      </button>
    </div>

    <!-- Recent feeds -->
    <div class="feeds-grid">
      <RecentCallsFeed :items="overview?.recent_calls ?? []" :total="overview?.active_calls_count" />
      <RecentTasksFeed :items="overview?.recent_tasks ?? []" :total="overview?.open_tasks_count" />
      <RecentReportsFeed :items="overview?.recent_reports ?? []" :total="overview?.open_reports_count" />
    </div>
  </section>
</template>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.overview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.overview__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.overview__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.overview__updated {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.overview__refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  margin-top:0px;
}

.overview__refresh:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-4);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  height: 100px;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-left: 3px solid transparent;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: left;
  cursor: pointer;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}

.kpi-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}

.kpi-card__top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.kpi-card__value {
  font-size: 32px;
  font-weight: 700;
  color: #0D6EFD;
  line-height: 1;
}

.kpi-card__value--zero {
  color: var(--color-text-muted);
}

.kpi-card__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.kpi-skeleton {
  display: block;
  height: 100px;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-surface, var(--color-bg-elevated)) 50%, var(--color-bg-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

.is-loading {
  opacity: 0.5;
  pointer-events: none;
}

.feeds-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

@media (max-width: 1199px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .feeds-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 991px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .feeds-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
