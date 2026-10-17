<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useTranslation()
</script>

<template>
  <AppHeader
    :title="t('nav.incident_reports')"
    :breadcrumb="[{ label: t('nav.operate') }, { label: t('nav.incident_reports') }]"
  />
  <div class="incident-reports-page">
    <div class="content-card">
      <ReportsList />
    </div>
  </div>
</template>

<style scoped>
.incident-reports-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}

.content-card {
  padding: 0;
}
</style>
