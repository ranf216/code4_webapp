<script setup lang="ts">
import { computed } from 'vue'

export interface BarItem {
  key: string
  label: string
  value: number
  color?: string
}

const props = defineProps<{
  items: BarItem[]
  sortDesc?: boolean
}>()

const sorted = computed(() => {
  const list = [...props.items]
  if (props.sortDesc) list.sort((a, b) => b.value - a.value)
  return list
})

const max = computed(() => Math.max(1, ...sorted.value.map((i) => i.value)))
const total = computed(() => sorted.value.reduce((sum, i) => sum + i.value, 0))
</script>

<template>
  <div class="h-bars">
    <div
      v-for="item in sorted"
      :key="item.key"
      class="h-bar"
      :title="`${item.label}: ${item.value} (${total ? Math.round((item.value / total) * 100) : 0}%)`"
    >
      <span class="h-bar__label">{{ item.label }}</span>
      <div class="h-bar__track">
        <div
          class="h-bar__fill"
          :style="{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color || 'var(--color-accent)' }"
        />
      </div>
      <span class="h-bar__value">
        {{ item.value }}<template v-if="total"> · {{ Math.round((item.value / total) * 100) }}%</template>
      </span>
    </div>
    <div v-if="!sorted.length" class="h-bars__empty">—</div>
  </div>
</template>

<style scoped>
.h-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.h-bar {
  display: grid;
  grid-template-columns: 140px 1fr 90px;
  align-items: center;
  gap: var(--space-2);
}

.h-bar__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.h-bar__track {
  height: 8px;
  background: var(--color-bg-elevated);
  border-radius: 4px;
  overflow: hidden;
}

.h-bar__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.h-bar__value {
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
}

.h-bars__empty {
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-4);
}
</style>
