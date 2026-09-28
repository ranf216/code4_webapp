<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Live Map', icon: 'lucide:map-pin', path: '/live-tracking' },
  { label: 'Route History', icon: 'lucide:history', path: '/live-tracking/history' },
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <nav class="tracking-tabs">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab"
      :class="{ 'tab--active': isActive(tab.path) }"
    >
      <Icon :name="tab.icon" :size="14" />
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>

<style scoped>
.tracking-tabs {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: all 0.2s;
}

.tab:hover { color: var(--color-text-primary); }

.tab--active {
  background: var(--color-bg-base);
  color: var(--color-accent);
}
</style>
