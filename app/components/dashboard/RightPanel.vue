<script setup lang="ts">
const timeline = [
  { time: '21:14:05', color: 'critical', title: 'Call CL-2026-04822 received',      detail: 'Helena Vorster → Westridge Estates' },
  { time: '21:14:11', color: 'accent',   title: 'Auto-routed to nearest officer',   detail: 'Aisha Whitmore (0.4 mi, ETA 2 min)' },
  { time: '21:14:32', color: 'ok',       title: 'Officer accepted — On the way',    detail: 'GPS trace started' },
  { time: '21:15:00', color: 'warn',     title: 'Resident updated description',     detail: '"I see a person in dark clothing in the side yard."' },
  { time: '21:16:14', color: 'info',     title: 'Continuous video upload begun',    detail: '720p stream — secured' },
]

const communities = [
  { name: 'Westridge Estates',  meta: '14 officers · 6 posts',  pct: 92 },
  { name: 'Harbor Point Marina', meta: '8 officers · 4 posts',  pct: 74 },
  { name: 'Cedar Crossing HOA', meta: '6 officers · 3 posts',   pct: 58 },
  { name: 'Summit Plaza Events', meta: '22 officers · 9 posts', pct: 100 },
]

const incidents = [
  { title: 'Vehicle break-in attempt', id: 'IR-2026-1124', status: 'submitted', reporter: 'Alexa Ramirez' },
  { title: 'Medical assist — fall',    id: 'IR-2026-1123', status: 'reviewed',  reporter: 'Jordan Ramirez' },
  { title: 'Trespass observation — POI-0142', id: 'IR-2026-1122', status: 'submitted', reporter: 'Marcus Chen' },
]

const statusPill: Record<string, string> = {
  submitted: 'pill--warn',
  reviewed:  'pill--info',
  closed:    'pill--ok',
}

const timelineColor: Record<string, string> = {
  critical: 'var(--color-critical)',
  accent:   'var(--color-accent)',
  ok:       'var(--color-ok)',
  warn:      'var(--color-warn)',
  info:     'var(--color-info)',
}

function pctColor(pct: number) {
  if (pct >= 90) return 'var(--color-ok)'
  if (pct >= 60) return 'var(--color-accent)'
  return 'var(--color-warn)'
}

function circleDash(pct: number) {
  const r = 14
  const circ = 2 * Math.PI * r
  return `${(pct / 100) * circ} ${circ}`
}
</script>

<template>
  <div class="right-panel">
    <!-- Activity Timeline -->
    <div class="panel-section card">
      <div class="panel-section__header">
        <span class="panel-section__title">ACTIVITY TIMELINE</span>
      </div>
      <div class="timeline">
        <div v-for="(item, i) in timeline" :key="i" class="timeline__item">
          <div class="timeline__dot" :style="{ background: timelineColor[item.color] }" />
          <div class="timeline__content">
            <span class="timeline__time text-sm text-muted">{{ item.time }}</span>
            <span class="timeline__title text-base">{{ item.title }}</span>
            <span class="timeline__detail text-sm text-muted">{{ item.detail }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Coverage by Community -->
    <div class="panel-section card">
      <div class="panel-section__header">
        <span class="panel-section__title">COVERAGE BY COMMUNITY</span>
      </div>
      <div class="coverage-list">
        <div v-for="c in communities" :key="c.name" class="coverage-item">
          <div class="coverage-item__info">
            <span class="coverage-item__name text-base font-medium">{{ c.name }}</span>
            <span class="coverage-item__meta text-base text-muted">{{ c.meta }}</span>
          </div>
          <div class="coverage-item__right">
            <span class="coverage-item__pct text-base text-muted">{{ c.pct }}%</span>
            <!-- <svg width="32" height="32" viewBox="0 0 32 32" class="coverage-item__ring">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--color-border)" stroke-width="3" />
              <circle
                cx="16" cy="16" r="14" fill="none"
                :stroke="pctColor(c.pct)" stroke-width="3"
                :stroke-dasharray="circleDash(c.pct)"
                stroke-dashoffset="0"
                stroke-linecap="round"
                transform="rotate(-90 16 16)"
              />
            </svg> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Incident Reports -->
    <div class="panel-section card">
      <div class="panel-section__header">
        <span class="panel-section__title">RECENT INCIDENT REPORTS</span>
      </div>
      <div class="incident-list">
        <div v-for="inc in incidents" :key="inc.id" class="incident-item">
          <div class="incident-item__info">
            <span class="incident-item__title text-base">{{ inc.title }}</span>
            <span class="incident-item__meta text-sm text-muted">{{ inc.reporter }} · {{ inc.id }}</span>
          </div>
          <span :class="['pill', statusPill[inc.status]]">{{ inc.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.right-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 272px;
  min-width: 272px;
  flex-shrink: 0;
}

.panel-section {
  display: flex;
  flex-direction: column;
}
.panel-section__header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.panel-section__title {
  font-size: var(--font-size-base);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* Timeline */
.timeline {
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.timeline__item {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}
.timeline__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.timeline__content {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.timeline__title {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* Coverage */
.coverage-list {
  display: flex;
  flex-direction: column;
}
.coverage-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  gap: var(--space-2);
}
.coverage-item + .coverage-item {
  border-top: 1px solid var(--color-border-subtle);
}
.coverage-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.coverage-item__name {
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.coverage-item__right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.coverage-item__pct {
  min-width: 34px;
  text-align: right;
}

/* Incidents */
.incident-list {
  display: flex;
  flex-direction: column;
}
.incident-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}
.incident-item + .incident-item {
  border-top: 1px solid var(--color-border-subtle);
}
.incident-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.incident-item__title {
  color: var(--color-text-primary);
  font-weight: 500;
}
</style>
