<script setup lang="ts">
import { computed } from 'vue'

export interface DonutSegment {
  key: string
  label: string
  value: number
  color: string
}

const props = defineProps<{
  segments: DonutSegment[]
  size?: number
  thickness?: number
  selectedKey?: string | null
}>()

const emit = defineEmits<{
  (e: 'select', key: string): void
}>()

const size = computed(() => props.size ?? 160)
const thickness = computed(() => props.thickness ?? 24)

const total = computed(() => props.segments.reduce((sum, s) => sum + s.value, 0))

const radius = computed(() => (size.value - thickness.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

interface Arc extends DonutSegment {
  offset: number
  length: number
  pct: number
}

const arcs = computed<Arc[]>(() => {
  let offset = 0
  return props.segments.map((s) => {
    const pct = total.value > 0 ? s.value / total.value : 0
    const length = pct * circumference.value
    const arc: Arc = { ...s, offset, length, pct }
    offset += length
    return arc
  })
})
</script>

<template>
  <div class="donut-chart">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="donut-chart__svg"
    >
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="var(--color-border)"
        :stroke-width="thickness"
      />
      <circle
        v-for="arc in arcs"
        :key="arc.key"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="arc.color"
        :stroke-width="thickness"
        :stroke-dasharray="`${arc.length} ${circumference - arc.length}`"
        :stroke-dashoffset="-arc.offset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        class="donut-chart__arc"
        :class="{ 'donut-chart__arc--dimmed': selectedKey && arc.key !== selectedKey }"
        @click="emit('select', arc.key)"
      >
        <title>{{ arc.label }}: {{ arc.value }} ({{ Math.round(arc.pct * 100) }}%)</title>
      </circle>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="central"
        class="donut-chart__total"
      >
        {{ total }}
      </text>
    </svg>

    <ul class="donut-chart__legend">
      <li
        v-for="arc in arcs"
        :key="arc.key"
        class="legend-item"
        :class="{ 'legend-item--active': selectedKey === arc.key, 'legend-item--dimmed': selectedKey && arc.key !== selectedKey }"
        @click="emit('select', arc.key)"
      >
        <span class="legend-dot" :style="{ backgroundColor: arc.color }" />
        <span class="legend-label">{{ arc.label }}</span>
        <span class="legend-value">{{ arc.value }} · {{ Math.round(arc.pct * 100) }}%</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut-chart {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.donut-chart__arc {
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.donut-chart__arc:hover {
  opacity: 0.75;
}

.donut-chart__arc--dimmed {
  opacity: 0.25;
}

.donut-chart__total {
  fill: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.donut-chart__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.legend-item--active .legend-label {
  font-weight: 700;
  color: var(--color-text-primary);
}

.legend-item--dimmed {
  opacity: 0.45;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.legend-value {
  margin-left: auto;
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  font-weight: 600;
  white-space: nowrap;
}
</style>
