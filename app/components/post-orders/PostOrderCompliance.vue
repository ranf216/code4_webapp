<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'
import { utcToLocal } from '~/utils/dateTime'

export interface AcknowledgementEntry {
  officer_id: string
  officer_name: string
  badge_number?: string | null
  acknowledged: boolean
  acknowledged_on?: string | null
}

const props = defineProps<{
  acknowledgedPct?: number | null
  acknowledgements?: AcknowledgementEntry[]
}>()

const { t } = useTranslation()
const collapsed = ref(false)

const pct = computed(() =>
  typeof props.acknowledgedPct === 'number' ? Math.max(0, Math.min(100, props.acknowledgedPct)) : null,
)
const gaugeColor = computed(() => {
  const v = pct.value
  if (v === null) return 'var(--color-text-muted)'
  if (v >= 80) return '#22c55e'
  if (v >= 50) return '#f59e0b'
  return '#ef4444'
})

const items = computed(() => props.acknowledgements || [])
const hasData = computed(() => pct.value !== null && items.value.length > 0)

function formatDateTime(utc: string | null | undefined): string {
  if (!utc) return '—'
  return utcToLocal(utc).format('MMM D, YYYY HH:mm')
}
</script>

<template>
  <div class="compliance-card" :class="{ 'compliance-card--collapsed': collapsed }">
    <div class="compliance-card__header" @click="collapsed = !collapsed">
      <Icon name="lucide:clipboard-check" :size="18" />
      <h3 class="compliance-card__title">{{ t('post_orders.compliance_title') }}</h3>
      <span class="compliance-card__count">
        {{ pct !== null ? `${pct}%` : '—' }}
      </span>
      <button class="icon-btn" :title="collapsed ? 'Expand' : 'Collapse'" @click.stop="collapsed = !collapsed">
        <Icon :name="collapsed ? 'lucide:chevron-down' : 'lucide:chevron-up'" :size="15" />
      </button>
    </div>

    <div v-show="!collapsed" class="compliance-card__body">
      <div v-if="!hasData" class="compliance-empty">
        {{ t('post_orders.compliance_no_data') }}
      </div>

      <template v-else>
        <!-- Progress gauge -->
        <div class="gauge">
          <div class="gauge__track">
            <div
              class="gauge__fill"
              :style="{ width: `${pct}%`, backgroundColor: gaugeColor }"
            />
          </div>
          <span class="gauge__label" :style="{ color: gaugeColor }">
            {{ pct }}% {{ t('post_orders.acknowledged_pct') }}
          </span>
        </div>

        <!-- Officer table -->
        <table class="compliance-table">
          <thead>
            <tr>
              <th>{{ t('post_orders.col_officer_name') }}</th>
              <th>{{ t('post_orders.col_badge_number') }}</th>
              <th>{{ t('post_orders.compliance_col_acknowledged') }}</th>
              <th>{{ t('post_orders.compliance_col_acknowledged_on') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.officer_id" class="compliance-row">
              <td class="cell-text">{{ item.officer_name }}</td>
              <td class="cell-text">{{ item.badge_number || '—' }}</td>
              <td>
                <span
                  class="ack-badge"
                  :class="item.acknowledged ? 'ack-badge--yes' : 'ack-badge--no'"
                >
                  {{ item.acknowledged ? t('post_orders.acknowledged_yes') : t('post_orders.acknowledged_no') }}
                </span>
              </td>
              <td class="cell-muted">{{ formatDateTime(item.acknowledged_on) }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<style scoped>
.compliance-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.compliance-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  user-select: none;
}

.compliance-card--collapsed .compliance-card__header {
  border-bottom: none;
}

.compliance-card__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.compliance-card__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 2px var(--space-2);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.icon-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

.compliance-card__body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.compliance-empty {
  text-align: center;
  padding: var(--space-10) var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Gauge */
.gauge {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.gauge__track {
  flex: 1;
  height: 12px;
  background: var(--color-bg-overlay);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.gauge__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.gauge__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}

/* Table */
.compliance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.compliance-table thead tr {
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.compliance-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.compliance-table tbody tr {
  border-bottom: 1px solid var(--color-border);
}

.compliance-table tbody tr:last-child { border-bottom: none; }

.compliance-table td {
  padding: var(--space-3) var(--space-4);
  vertical-align: middle;
}

.cell-text { color: var(--color-text-primary); }
.cell-muted { color: var(--color-text-muted); }

.ack-badge {
  display: inline-block;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.ack-badge--yes {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.ack-badge--no {
  background: var(--color-bg-overlay);
  color: var(--color-text-muted);
}
</style>
