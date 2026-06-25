<script setup lang="ts">
const calls = [
  {
    id: 'CL-2026-04822',
    type: 'service',
    name: 'Helena Vorster',
    status: 'new',
    community: 'Westridge Estates',
    address: '1248 Sage Canyon Dr',
    note: 'Possible intruder near garage. Heard glass breaking.',
    time: '21:14',
    elapsed: '2m',
    officer: null,
    eta: null,
  },
  {
    id: 'CL-2026-04821',
    type: 'emergency',
    name: 'Robert Whitfield',
    status: 'accepted',
    community: 'Westridge Estates',
    address: '984 Sage Canyon Dr',
    note: 'Elderly resident — chest pain, conscious.',
    time: '21:12',
    elapsed: '4s',
    officer: 'Aisha Whitmore',
    eta: 'ETA 2 min',
  },
]

const statusColor: Record<string, string> = {
  new: 'pill--critical',
  accepted: 'pill--info',
  pending: 'pill--warn',
}
const typeIcon: Record<string, string> = {
  service: 'lucide:phone',
  emergency: 'lucide:triangle-alert',
  panic: 'lucide:siren',
}
</script>

<template>
  <div class="active-calls card">
    <div class="active-calls__header">
      <span class="active-calls__title">ACTIVE CALLS</span>
      <div class="active-calls__actions">
        <span class="pill pill--critical">
          <!-- <Icon name="lucide:triangle-alert" :size="10" /> -->
          2 urgent
        </span>
        <button class="btn btn--ghost active-calls__view-all">View all</button>
      </div>
    </div>

    <div class="active-calls__list">
      <div
        v-for="call in calls"
        :key="call.id"
        class="call-row"
        :class="`call-row--${call.status}`"
      >
        <div class="call-row__indicator" :class="`call-row__indicator--${call.status}`" />
        <div class="call-row__body">
          <div class="call-row__top">
            <div class="call-row__left">
              <Icon :name="typeIcon[call.type] ?? 'lucide:phone'" :size="13" class="call-row__type-icon" />
              <span class="call-row__name">{{ call.name }}</span>
              <span class="call-row__id text-muted text-xs">{{ call.id }}</span>
              <span :class="['pill', statusColor[call.status] ?? 'pill--ghost']">{{ call.status }}</span>
            </div>
            <div class="call-row__right">
              <span class="call-row__time">{{ call.time }}</span>
              <span v-if="call.eta" class="call-row__eta-right">ETA {{ call.eta }}</span>
              <span class="call-row__elapsed">{{ call.elapsed }}</span>
            </div>
          </div>
          <div class="call-row__mid text-xs">
            <span class="text-secondary text-sm">{{ call.community }}</span>
            <span class="text-white text-sm">·</span>
            <span class="text-white text-sm">{{ call.address }}</span>
            <template v-if="call.officer">
              <span class="text-muted text-sm">→</span>
              <span class="text-muted text-sm">{{ call.officer }}</span>
            </template>
          </div>
          <div class="call-row__note text-sm text-white">{{ call.note }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-calls {
  display: flex;
  flex-direction: column;
}
.active-calls__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.active-calls__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.active-calls__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.active-calls__view-all {
  font-size: var(--font-size-sm);
  padding: 4px var(--space-2);
  font-weight: 500;
  color: white
}

.active-calls__list {
  display: flex;
  flex-direction: column;
}

.call-row {
  display: flex;
  position: relative;
  margin: var(--space-4);
}
.call-row + .call-row {
  border-top: 1px solid var(--color-border-subtle);
}
.call-row__indicator {
  width: 3px;
  flex-shrink: 0;
  border-radius: 0;
}
.call-row__indicator--new      { background: var(--color-critical); }
.call-row__indicator--accepted { background: var(--color-info); }
.call-row__indicator--pending  { background: var(--color-warn); }

.call-row__body {
  flex: 1;
  padding: 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.call-row__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.call-row__left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.call-row__type-icon {
  color: var(--color-text-muted);
}
.call-row__name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}
.call-row__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  min-width: 64px;
}
.call-row__time {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}
.call-row__eta-right {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: #119ca6;
}
.call-row__elapsed {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
}
.call-row__mid {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
}
.call-row__note {
  font-style: normal;
}
</style>
