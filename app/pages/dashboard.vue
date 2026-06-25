<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <AppHeader
    title="Dashboard"
    :breadcrumb="[{ label: 'Operate' }, { label: 'Overview' }]"
    search-placeholder="Search calls, residents, officers, posts…"
    :showSearch="true"
  />
  <div class="dashboard">
    <!-- Row 1: KPI cards — full width -->
    <KpiCards class="dashboard__kpi" />

    <!-- Row 2: main content + right panel -->
    <div class="dashboard__body">
      <div class="dashboard__main">
        <LiveOperations />
        <ActiveCalls />
      </div>
      <RightPanel />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  overflow-y: auto;
}

.dashboard__kpi {
  flex-shrink: 0;
}

.dashboard__body {
  flex: 1;
  display: flex;
  gap: var(--space-3);
  min-height: 0;
  align-items: flex-start;
}

.dashboard__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
