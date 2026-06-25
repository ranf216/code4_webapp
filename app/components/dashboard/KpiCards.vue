<script setup lang="ts">
const cards = [
  {
    label: 'OPEN CALLS',
    value: '6',
    sub: '↑ last 1h',
    subType: 'critical',
  },
  {
    label: 'OFFICERS ACTIVE',
    value: '14 / 22',
    sub: '64% allocated',
    subType: 'neutral',
  },
  {
    label: 'AVG RESPONSE',
    value: '3:42',
    sub: '-38s vs last week',
    subType: 'ok',
  },
  {
    label: 'TASKS OPEN',
    value: '12',
    sub: '3 urgent',
    subType: 'neutral',
  },
]
</script>

<template>
  <div class="kpi-grid">
    <div
      v-for="card in cards"
      :key="card.label"
      class="kpi-card card"
    >
      <span class="kpi-card__label">{{ card.label }}</span>
      <span class="kpi-card__value">{{ card.value }}</span>
      <span
        class="kpi-card__sub"
        :class="{
          'text-critical': card.subType === 'critical',
          'text-ok':       card.subType === 'ok',
          'text-warn':     card.subType === 'warn',
          'text-secondary': card.subType === 'neutral',
        }"
      >{{ card.sub }}</span>
    </div>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.kpi-card {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.kpi-card__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}
.kpi-card__value {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.1;
}
.kpi-card__sub {
  font-size: var(--font-size-xs);
}
</style>
