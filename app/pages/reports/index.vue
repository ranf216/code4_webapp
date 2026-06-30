<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="reports-page">
    <ReportTemplateList />
  </div>
</template>

<style scoped>
.reports-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
