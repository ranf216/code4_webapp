<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const { t } = useTranslation()

const reportId = computed(() => Number(route.params.id))
</script>

<template>
  <AppHeader
    :title="t('reports.report_details')"
    :breadcrumb="[
      { label: t('nav.operate') },
      { label: t('nav.incident_reports'), to: '/incident-reports' },
      { label: `#${reportId}` },
    ]"
  />
  <div class="review-page">
    <ReportReviewStudio :report-id="reportId" />
  </div>
</template>

<style scoped>
.review-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
