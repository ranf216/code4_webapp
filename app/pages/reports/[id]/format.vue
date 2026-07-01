<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const demoStyle = {
  templateId: String(route.params.id),
  templateName: 'Standard Incident Report',
  logoUrl: null as string | null,
  accentColour: '#1d4ed8',
  headerLayout: 'standard' as const,
  font: 'arial' as const,
  pageNumbering: true,
  confidentialityFooter: 'CONFIDENTIAL – FOR AUTHORISED RECIPIENTS ONLY',
  dateFormat: 'DD/MM/YYYY' as const,
  sectionBreaks: 'continuous' as const,
  includeCoverPage: false,
}
</script>

<template>
  <div class="reports-format-page">
    <TemplateFormatting :style-settings="demoStyle" />
  </div>
</template>

<style scoped>
.reports-format-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
