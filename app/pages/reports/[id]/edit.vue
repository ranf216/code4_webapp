<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const demoTemplate = {
  id: String(route.params.id),
  name: 'Standard Incident Report',
  category: 'incident' as const,
  communities: ['Sunset Heights', 'Central Hub'],
  reportTitleFormat: 'Incident Report - {community} - {date}',
  status: 'active' as const,
  reviewBeforeClient: true,
  allowOfficerEditing: false,
}
</script>

<template>
  <div class="reports-editor-page">
    <TemplateEditor mode="edit" :template="demoTemplate" />
  </div>
</template>

<style scoped>
.reports-editor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
